"use server";

import { getClient } from "@/lib/apollo/apollo-client";
import { GET_GAMES_SIMPLE } from "@/lib/apollo/queries/games";
import { Game, PaginatedGames } from "@/lib/apollo/types";

export interface SimpleGame {
  id: string;
  name: string;
  slug: string;
  thumbnailImageUrl: string | null; // Tip: Usually 460x215 (Steam library capsule size)
  description: string | null;
}

export async function getGamesSimple(search?: string): Promise<SimpleGame[]> {
  try {
    const { data } = await getClient().query<{ games: PaginatedGames }>({
      query: GET_GAMES_SIMPLE,
      variables: {
        search,
        pagination: { take: 50 },
      },
      fetchPolicy: "network-only",
    });

    if (!data?.games) {
      return [];
    }

    return data.games.nodes.map((game: Game) => ({
      id: game.id,
      name: game.name,
      slug: game.slug,
      thumbnailImageUrl: game.thumbnailImageUrl,
      description: game.description,
    }));
  } catch (error) {
    console.error("Error fetching games simple:", error);
    return [];
  }
}
