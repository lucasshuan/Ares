"use server";

import { getClient } from "@/lib/apollo/apollo-client";
import {
  GET_GAME_ACTIONS,
  CHECK_GAME_SLUG,
  GET_GAMES_SIMPLE,
} from "@/lib/apollo/queries/games";
import {
  APPROVE_GAME,
  CREATE_GAME,
  UPDATE_GAME,
  DELETE_GAME,
  SET_GAME_STAFF,
} from "@/lib/apollo/queries/game-mutations";
import {
  UpdateGameMutation,
  CreateGameMutation,
  ApproveGameMutation,
  RequestUploadUrlDocument,
  GetGameActionsQuery,
  SetGameStaffMutation,
  GetGamesSimpleQuery,
} from "@/lib/apollo/generated/graphql";
import { getServerAuthSession } from "@/auth";
import { canEditGame, canManageGames } from "@/lib/server/permissions";
import { revalidatePath, revalidateTag } from "next/cache";
import { normalizeOptionalText, slugify } from "@/lib/utils/helpers";
import { createSafeAction } from "@/lib/utils/action-utils";

export type SimpleGame = GetGamesSimpleQuery["games"]["nodes"][number];

// ─── Internal helpers ────────────────────────────────────────────────────────

export async function getGameRecord(gameIdOrSlug: string) {
  const { data } = await getClient().query<GetGameActionsQuery>({
    query: GET_GAME_ACTIONS,
    variables: { slug: gameIdOrSlug },
  });
  return data?.game;
}

export async function revalidateGamePaths(game: { slug: string }) {
  revalidatePath("/");
  revalidateTag("games", {});
  revalidatePath(`/games/${game.slug}`);
}

// ─── Storage ─────────────────────────────────────────────────────────────────

export const requestUploadUrl = createSafeAction(
  "requestUploadUrl",
  async (filename: string, contentType: string) => {
    const session = await getServerAuthSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const { data } = await getClient().mutate({
      mutation: RequestUploadUrlDocument,
      variables: { filename, contentType },
    });

    if (!data?.requestUploadUrl) throw new Error("Failed to get upload URL");
    return data.requestUploadUrl;
  },
);

// ─── Games ────────────────────────────────────────────────────────────────────

export const getGamesSimple = createSafeAction(
  "getGamesSimple",
  async (search?: string): Promise<SimpleGame[]> => {
    const { data } = await getClient().query<GetGamesSimpleQuery>({
      query: GET_GAMES_SIMPLE,
      variables: { search, pagination: { take: 50 } },
      fetchPolicy: "network-only",
    });

    return data?.games?.nodes ?? [];
  },
);

export const createGame = createSafeAction(
  "createGame",
  async (data: {
    name: string;
    slug: string;
    description: string | null;
    backgroundImagePath: string | null;
    thumbnailImagePath: string | null;
    steamUrl: string | null;
    websiteUrl: string | null;
  }) => {
    const session = await getServerAuthSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const name = data.name.trim();
    const slug = slugify(data.slug || data.name);

    if (!name || !slug) throw new Error("Invalid game data");

    const { data: result } = await getClient().mutate<CreateGameMutation>({
      mutation: CREATE_GAME,
      variables: {
        input: {
          name,
          slug,
          description: normalizeOptionalText(data.description),
          backgroundImagePath: normalizeOptionalText(data.backgroundImagePath),
          thumbnailImagePath: normalizeOptionalText(data.thumbnailImagePath),
          steamUrl: normalizeOptionalText(data.steamUrl),
          websiteUrl: normalizeOptionalText(data.websiteUrl),
          authorId: session.user.id,
        },
      },
    });

    if (result?.createGame) {
      revalidateGamePaths(result.createGame);
    }

    return {
      game: result?.createGame,
      status: result?.createGame.status,
    };
  },
);

export const updateGame = createSafeAction(
  "updateGame",
  async (
    gameId: string,
    data: {
      name: string;
      slug: string;
      description: string | null;
      backgroundImagePath: string | null;
      thumbnailImagePath: string | null;
      steamUrl: string | null;
      websiteUrl: string | null;
    },
  ) => {
    const session = await getServerAuthSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const { data: gameData } = await getClient().query<GetGameActionsQuery>({
      query: GET_GAME_ACTIONS,
      variables: { slug: gameId },
    });
    const game = gameData?.game;

    if (!game) throw new Error("Game not found");
    if (!canEditGame(session, game.authorId)) throw new Error("Unauthorized");

    const { data: result } = await getClient().mutate<UpdateGameMutation>({
      mutation: UPDATE_GAME,
      variables: {
        id: game.id,
        input: {
          name: data.name.trim(),
          slug: data.slug.trim(),
          description: normalizeOptionalText(data.description),
          backgroundImagePath: normalizeOptionalText(data.backgroundImagePath),
          thumbnailImagePath: normalizeOptionalText(data.thumbnailImagePath),
          steamUrl: normalizeOptionalText(data.steamUrl),
          websiteUrl: normalizeOptionalText(data.websiteUrl),
        },
      },
    });

    if (result?.updateGame) {
      revalidateGamePaths(result.updateGame);
    }
    return { slug: result?.updateGame?.slug ?? "" };
  },
);

export const deleteGame = createSafeAction(
  "deleteGame",
  async (gameSlug: string) => {
    const session = await getServerAuthSession();
    const game = await getGameRecord(gameSlug);
    if (!game) throw new Error("Game not found");
    if (!canEditGame(session, game.authorId)) throw new Error("Unauthorized");

    await getClient().mutate({
      mutation: DELETE_GAME,
      variables: { id: game.id },
    });

    revalidatePath("/");
    revalidateTag("games", {});
  },
);

export const approveGame = createSafeAction(
  "approveGame",
  async (gameId: string) => {
    const session = await getServerAuthSession();
    if (!canManageGames(session)) throw new Error("Unauthorized");

    const { data: result } = await getClient().mutate<ApproveGameMutation>({
      mutation: APPROVE_GAME,
      variables: { id: gameId },
    });

    if (result?.approveGame) {
      revalidatePath("/");
      revalidateTag("games", {});
    }

    return true;
  },
);

export const checkGameSlugAvailability = createSafeAction(
  "checkGameSlugAvailability",
  async (slug: string, excludeId?: string) => {
    if (!slug) return { available: true };
    const result = await getClient().query<{ checkGameSlug: boolean }>({
      query: CHECK_GAME_SLUG,
      variables: { slug, excludeId },
      fetchPolicy: "no-cache",
    });
    return { available: result.data?.checkGameSlug ?? true };
  },
);

export const setGameStaff = createSafeAction(
  "setGameStaff",
  async (
    gameId: string,
    members: Array<{
      userId: string;
      capabilities?: string[];
      isFullAccess?: boolean;
    }>,
  ) => {
    const session = await getServerAuthSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const { data: result } = await getClient().mutate<SetGameStaffMutation>({
      mutation: SET_GAME_STAFF,
      variables: {
        gameId,
        members: members.map((m) => ({
          userId: m.userId,
          capabilities: m.capabilities ?? [],
          isFullAccess: m.isFullAccess ?? false,
        })),
      },
    });

    return { staff: result?.setGameStaff ?? [] };
  },
);
