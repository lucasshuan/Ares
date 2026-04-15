export interface User {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  bio: string | null;
  profileColor: string | null;
  country: string | null;
  isAdmin: boolean;
  createdAt: string;
  players?: Player[];
}

import { type GameStatus } from "@ares/core";

export interface Game {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnailImageUrl: string | null;
  backgroundImageUrl: string | null;
  steamUrl: string | null;
  status: GameStatus;
  authorId: string | null;
  createdAt: string;
  updatedAt: string;
  author?: User;
  leagues?: League[];
  _count?: {
    events: number;
    players: number;
    tourneys?: number;
    posts?: number;
  };
}

export interface League {
  id: string;
  gameId: string;
  name: string;
  slug: string;
  type: "LEAGUE" | "TOURNAMENT";
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
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  game: Game;
  entries: LeagueEntry[];
}

export interface PlayerUsername {
  id: string;
  username: string;
}

export interface Player {
  id: string;
  gameId: string;
  userId?: string | null;
  currentElo: number;
  user?: User;
  game?: Game;
  leagueEntries?: LeagueEntry[];
  usernames?: PlayerUsername[];
}

export interface LeagueEntry {
  id: string;
  leagueId: string;
  playerId: string;
  currentElo: number;
  position: number;
  player?: Player;
  league?: League;
}
export interface Paginated<T> {
  nodes: T[];
  totalCount: number;
  hasNextPage: boolean;
}

export interface PaginationInput {
  skip?: number;
  take?: number;
}

export type PaginatedGames = Paginated<Game>;
export type PaginatedUsers = Paginated<User>;
export type PaginatedLeagues = Paginated<League>;
