"use server";

import { db } from "@/server/db";
import { games, players, playerUsernames, rankings, rankingEntries } from "@/server/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getServerAuthSession } from "@/server/auth";
import { hasPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

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
  if (!hasPermission(session, "manage_games")) throw new Error("Unauthorized");

  await db.update(games).set(data).where(eq(games.id, gameId));
  revalidatePath("/games");
  revalidatePath(`/games/${gameId}`);
  return { success: true };
}

export async function addRanking(data: {
  gameId: string;
  name: string;
  slug: string;
  description: string | null;
  initialElo: number;
  ratingSystem: string;
}) {
  const session = await getServerAuthSession();
  if (!hasPermission(session, "manage_rankings"))
    throw new Error("Unauthorized");

  await db.insert(rankings).values(data);
  
  const game = await db.query.games.findFirst({
    where: eq(games.id, data.gameId),
    columns: { slug: true }
  });

  if (game) {
    revalidatePath(`/games/${game.slug}`);
  }
  
  return { success: true };
}

export async function addPlayerToGame(
  gameId: string,
  data: {
    username: string;
    country: string | null;
    userId: string | null;
  },
) {
  const session = await getServerAuthSession();
  if (!hasPermission(session, "manage_players"))
    throw new Error("Unauthorized");

  let playerId: string | null = null;
  let wasAddedToExisting = false;

  if (data.userId) {
    const existingPlayer = await db.query.players.findFirst({
      where: and(eq(players.gameId, gameId), eq(players.userId, data.userId)),
    });

    if (existingPlayer) {
      playerId = existingPlayer.id;
      wasAddedToExisting = true;
    }
  }

  if (!playerId) {
    const [newPlayer] = await db
      .insert(players)
      .values({
        gameId,
        userId: data.userId,
        country: data.country,
      })
      .returning({ id: players.id });
    playerId = newPlayer.id;
  }

  await db.insert(playerUsernames).values({
    playerId,
    username: data.username,
  });

  revalidatePath(`/games/${gameId}`);
  return { success: true, wasAddedToExisting, playerId };
}

export async function createAndAddPlayerToRanking(
  gameId: string,
  rankingId: string,
  username: string,
) {
  const result = await addPlayerToGame(gameId, {
    username,
    country: null,
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
  },
) {
  const session = await getServerAuthSession();
  if (!hasPermission(session, "manage_rankings"))
    throw new Error("Unauthorized");

  await db.update(rankings).set(data).where(eq(rankings.id, rankingId));

  const ranking = await db.query.rankings.findFirst({
    where: eq(rankings.id, rankingId),
    with: { game: true },
  });

  if (ranking?.game) {
    revalidatePath(`/games/${ranking.game.slug}`);
    revalidatePath(`/games/${ranking.game.slug}/rankings/${ranking.slug}`);
  }

  return { success: true };
}

export async function searchPlayersByGame(gameId: string, query: string) {
  const session = await getServerAuthSession();
  if (!hasPermission(session, "manage_players"))
    throw new Error("Unauthorized");

  const results = await db.query.playerUsernames.findMany({
    where: and(
      sql`lower(${playerUsernames.username}) like ${`%${query.toLowerCase()}%`}`,
      // Link to players of this game
      sql`${playerUsernames.playerId} IN (SELECT id FROM players WHERE game_id = ${gameId})`,
    ),
    with: {
      player: true,
    },
    limit: 10,
  });

  return results.map((r) => ({
    id: r.player.id,
    username: r.username,
    country: r.player.country,
  }));
}

export async function addPlayerToRanking(
  rankingId: string,
  playerId: string,
  initialElo?: number,
) {
  const session = await getServerAuthSession();
  if (!hasPermission(session, "manage_players"))
    throw new Error("Unauthorized");

  const ranking = await db.query.rankings.findFirst({
    where: eq(rankings.id, rankingId),
  });

  if (!ranking) throw new Error("Ranking not found");

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
    await db.insert(playerUsernames).values({
      playerId: player.id,
      username: session.user.name || "Player",
    });
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
    revalidatePath(`/games/${ranking.game.slug}/rankings/${ranking.slug}`);
  }

  return { success: true };
}
