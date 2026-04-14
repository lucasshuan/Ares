"use server";

import { db } from "@/server/db";
import {
  games,
  players,
  playerUsernames,
  rankings,
  rankingEntries,
  type Game,
} from "@/server/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getServerAuthSession } from "@/server/auth";
import {
  canEditGame,
  canManageGames,
  canManagePlayers,
  canManageRankings,
} from "@/lib/permissions";
import { revalidatePath } from "next/cache";

function normalizeOptionalText(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

async function getGameRecord(gameId: string) {
  return await db.query.games.findFirst({
    where: eq(games.id, gameId),
  });
}

async function assertGameApproved(gameId: string) {
  const game = await getGameRecord(gameId);

  if (!game) {
    throw new Error("Game not found");
  }

  if (game.status !== "approved") {
    throw new Error("Pending games cannot receive rankings or players");
  }

  return game;
}

function revalidateGamePaths(game: Pick<Game, "slug">) {
  revalidatePath("/");
  revalidatePath("/games");
  revalidatePath(`/games/${game.slug}`);
}

export async function updateGame(
  gameId: string,
  data: {
    name: string;
    description: string | null;
    backgroundImageUrl: string | null;
    thumbnailImageUrl: string | null;
    steamUrl: string | null;
  },
) {
  const session = await getServerAuthSession();
  const game = await getGameRecord(gameId);

  if (!game) {
    throw new Error("Game not found");
  }

  if (!canEditGame(session, game.authorId)) {
    throw new Error("Unauthorized");
  }

  await db
    .update(games)
    .set({
      name: data.name.trim(),
      description: normalizeOptionalText(data.description),
      backgroundImageUrl: normalizeOptionalText(data.backgroundImageUrl),
      thumbnailImageUrl: normalizeOptionalText(data.thumbnailImageUrl),
      steamUrl: normalizeOptionalText(data.steamUrl),
    })
    .where(eq(games.id, gameId));

  revalidateGamePaths(game);
  return { success: true };
}

export async function createGame(data: {
  name: string;
  slug: string;
  description: string | null;
  backgroundImageUrl: string | null;
  thumbnailImageUrl: string | null;
  steamUrl: string | null;
}) {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const name = data.name.trim();
  const slug = slugify(data.slug || data.name);

  if (!name || !slug) {
    throw new Error("Invalid game data");
  }

  const status = canManageGames(session) ? "approved" : "pending";

  const [game] = await db
    .insert(games)
    .values({
      name,
      slug,
      description: normalizeOptionalText(data.description),
      backgroundImageUrl: normalizeOptionalText(data.backgroundImageUrl),
      thumbnailImageUrl: normalizeOptionalText(data.thumbnailImageUrl),
      steamUrl: normalizeOptionalText(data.steamUrl),
      status,
      authorId: session.user.id,
    })
    .returning();

  revalidateGamePaths(game);

  return {
    success: true,
    game,
    status,
  };
}

export async function approveGame(gameId: string) {
  const session = await getServerAuthSession();

  if (!canManageGames(session)) {
    throw new Error("Unauthorized");
  }

  const game = await getGameRecord(gameId);

  if (!game) {
    throw new Error("Game not found");
  }

  await db
    .update(games)
    .set({
      status: "approved",
    })
    .where(eq(games.id, gameId));

  revalidateGamePaths(game);

  return { success: true };
}

export async function addRanking(data: {
  gameId: string;
  name: string;
  slug: string;
  description: string | null;
  initialElo: number;
  ratingSystem: string;
  allowDraw: boolean;
  kFactor: number;
  scoreRelevance: number;
  inactivityDecay: number;
  inactivityThresholdHours: number;
  inactivityDecayFloor: number;
  pointsPerWin: number;
  pointsPerDraw: number;
  pointsPerLoss: number;
  startDate: Date | null;
  endDate: Date | null;
}) {
  const session = await getServerAuthSession();
  if (!session?.user) throw new Error("Unauthorized");

  const game = await assertGameApproved(data.gameId);

  // If user can manage rankings, it's auto-approved. Otherwise it's pending.
  const isApproved = canManageRankings(session);

  await db.insert(rankings).values({
    ...data,
    authorId: session.user.id,
    isApproved,
  });

  revalidateGamePaths(game);
  return { success: true };
}

export async function addPlayerToGame(
  gameId: string,
  data: {
    username: string;
    userId: string | null;
  },
) {
  const session = await getServerAuthSession();
  if (!canManagePlayers(session))
    throw new Error("Unauthorized");

  const game = await assertGameApproved(gameId);

  const result = await db.transaction(async (tx) => {
    let playerId: string | null = null;
    let wasAddedToExisting = false;

    if (data.userId) {
      const existingPlayer = await tx.query.players.findFirst({
        where: and(eq(players.gameId, gameId), eq(players.userId, data.userId)),
      });

      if (existingPlayer) {
        playerId = existingPlayer.id;
        wasAddedToExisting = true;
      }
    }

    if (!playerId) {
      const [newPlayer] = await tx
        .insert(players)
        .values({
          gameId,
          userId: data.userId,
        })
        .returning({ id: players.id });
      playerId = newPlayer.id;
    }

    const [newUsername] = await tx
      .insert(playerUsernames)
      .values({
        playerId,
        username: data.username,
      })
      .returning({ id: playerUsernames.id });

    // If we just created a new player, set the first username as primary
    if (!wasAddedToExisting) {
      await tx
        .update(players)
        .set({ primaryUsernameId: newUsername.id })
        .where(eq(players.id, playerId));
    }

    return { wasAddedToExisting, playerId };
  });

  revalidateGamePaths(game);
  return { success: true, ...result };
}

export async function createAndAddPlayerToRanking(
  gameId: string,
  rankingId: string,
  username: string,
) {
  const result = await addPlayerToGame(gameId, {
    username,
    userId: null,
  });

  if (result.success && result.playerId) {
    return await addPlayerToRanking(rankingId, result.playerId);
  }

  return { success: false };
}

export async function updateRanking(
  rankingId: string,
  data: {
    name: string;
    slug: string;
    description: string | null;
    initialElo: number;
    ratingSystem: string;
    allowDraw: boolean;
    kFactor: number;
    scoreRelevance: number;
    inactivityDecay: number;
    inactivityThresholdHours: number;
    inactivityDecayFloor: number;
    pointsPerWin: number;
    pointsPerDraw: number;
    pointsPerLoss: number;
  },
) {
  const session = await getServerAuthSession();
  if (!canManageRankings(session))
    throw new Error("Unauthorized");

  await db.update(rankings).set(data).where(eq(rankings.id, rankingId));

  const ranking = await db.query.rankings.findFirst({
    where: eq(rankings.id, rankingId),
    with: { game: true },
  });

  if (ranking?.game) {
    revalidateGamePaths(ranking.game);
    revalidatePath(`/games/${ranking.game.slug}/rankings/${ranking.slug}`);
  }

  return { success: true };
}

export async function searchPlayersByGame(gameId: string, query: string) {
  const session = await getServerAuthSession();
  if (!canManagePlayers(session))
    throw new Error("Unauthorized");

  await assertGameApproved(gameId);

  const results = await db.query.playerUsernames.findMany({
    where: and(
      sql`lower(${playerUsernames.username}) like ${`%${query.toLowerCase()}%`}`,
      // Link to players of this game
      sql`${playerUsernames.playerId} IN (SELECT id FROM players WHERE game_id = ${gameId})`,
    ),
    with: {
      player: {
        with: {
          user: true,
        },
      },
    },
    limit: 10,
  });

  return results.map((r) => ({
    id: r.player.id,
    username: r.username,
    country: r.player.user?.country ?? null,
  }));
}

export async function addPlayerToRanking(
  rankingId: string,
  playerId: string,
  initialElo?: number,
) {
  const session = await getServerAuthSession();
  if (!canManagePlayers(session))
    throw new Error("Unauthorized");

  const ranking = await db.query.rankings.findFirst({
    where: eq(rankings.id, rankingId),
    with: {
      game: true,
    },
  });

  if (!ranking) throw new Error("Ranking not found");
  if (!ranking.game || ranking.game.status !== "approved") {
    throw new Error("Pending games cannot receive rankings or players");
  }

  await db.insert(rankingEntries).values({
    rankingId,
    playerId,
    currentElo: initialElo ?? ranking.initialElo,
  });

  const fullRanking = await db.query.rankings.findFirst({
    where: eq(rankings.id, rankingId),
    with: { game: true },
  });

  if (fullRanking?.game) {
    revalidateGamePaths(fullRanking.game);
    revalidatePath(`/games/${fullRanking.game.slug}/rankings/${fullRanking.slug}`);
  }

  return { success: true };
}

export async function registerSelfToRanking(rankingId: string) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const ranking = await db.query.rankings.findFirst({
    where: eq(rankings.id, rankingId),
    with: { game: true },
  });

  if (!ranking) throw new Error("Ranking not found");
  if (!ranking.game || ranking.game.status !== "approved") {
    throw new Error("Pending games cannot receive rankings or players");
  }

  // Check if player already exists for this game and user
  let player = await db.query.players.findFirst({
    where: and(
      eq(players.gameId, ranking.gameId),
      eq(players.userId, session.user.id),
    ),
  });

  if (!player) {
    // Create player record
    const [newPlayer] = await db
      .insert(players)
      .values({
        gameId: ranking.gameId,
        userId: session.user.id,
      })
      .returning();
    player = newPlayer;

    // Add initial username from profile
    const [newUsername] = await db
      .insert(playerUsernames)
      .values({
        playerId: player.id,
        username: session.user.name || "Player",
      })
      .returning({ id: playerUsernames.id });

    // Set as primary username
    await db
      .update(players)
      .set({ primaryUsernameId: newUsername.id })
      .where(eq(players.id, player.id));
  }

  // Check if already in ranking
  const existingEntry = await db.query.rankingEntries.findFirst({
    where: and(
      eq(rankingEntries.rankingId, rankingId),
      eq(rankingEntries.playerId, player.id),
    ),
  });

  if (existingEntry) return { success: true, alreadyRegistered: true };

  await db.insert(rankingEntries).values({
    rankingId,
    playerId: player.id,
    currentElo: ranking.initialElo,
  });

  if (ranking.game) {
    revalidateGamePaths(ranking.game);
    revalidatePath(`/games/${ranking.game.slug}/rankings/${ranking.slug}`);
  }

  return { success: true };
}
