import "server-only";

import { and, asc, desc, eq, or, sql } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/server/db";
import { isDatabaseUnavailableError } from "@/server/db/errors";
import { games, players } from "@/server/db/schema";
import type { PublicGamesOptions, PublicGamesState } from "./types";

export const getPublicGames = cache(
  async (options: PublicGamesOptions = {}) => {
    const {
      limit,
      search,
      orderBy = "name",
      viewerId,
      canManageGames = false,
    } = options;
    try {
      const visibilityCondition = canManageGames
        ? undefined
        : viewerId
          ? or(eq(games.status, "approved"), eq(games.authorId, viewerId))
          : eq(games.status, "approved");

      const playerCounts = db
        .select({
          gameId: players.gameId,
          count: sql<number>`count(*)`.as("player_count"),
        })
        .from(players)
        .groupBy(players.gameId)
        .as("player_counts");

      const query = db
        .select({
          id: games.id,
          name: games.name,
          slug: games.slug,
          description: games.description,
          thumbnailImageUrl: games.thumbnailImageUrl,
          backgroundImageUrl: games.backgroundImageUrl,
          steamUrl: games.steamUrl,
          status: games.status,
          authorId: games.authorId,
          createdAt: games.createdAt,
          updatedAt: games.updatedAt,
          playerCount: sql<number>`COALESCE(${playerCounts.count}, 0)`,
        })
        .from(games)
        .leftJoin(playerCounts, eq(games.id, playerCounts.gameId));

      if (search && visibilityCondition) {
        query.where(
          and(
            visibilityCondition,
            sql`lower(${games.name}) LIKE ${`%${search.toLowerCase()}%`}`,
          ),
        );
      } else if (search) {
        query.where(
          sql`lower(${games.name}) LIKE ${`%${search.toLowerCase()}%`}`,
        );
      } else if (visibilityCondition) {
        query.where(visibilityCondition);
      }

      if (orderBy === "popular") {
        query.orderBy(
          desc(sql`COALESCE(${playerCounts.count}, 0)`),
          asc(games.name),
        );
      } else {
        query.orderBy(asc(games.name));
      }

      if (limit) {
        query.limit(limit);
      }

      const gameList = await query;

      return {
        games: gameList,
        isDatabaseUnavailable: false,
      } satisfies PublicGamesState;
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        return {
          games: [],
          isDatabaseUnavailable: true,
        } satisfies PublicGamesState;
      }

      throw error;
    }
  },
);
