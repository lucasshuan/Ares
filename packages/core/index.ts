export const INITIAL_PERMISSION_DEFINITIONS = [
  { key: "manage_games", name: "Manage Games" },
  { key: "manage_players", name: "Manage Players" },
  { key: "manage_events", name: "Manage Leagues" },
] as const;

export type PermissionKey =
  (typeof INITIAL_PERMISSION_DEFINITIONS)[number]["key"];

export const GAME_STATUSES = ["APPROVED", "PENDING"] as const;
export type GameStatus = (typeof GAME_STATUSES)[number];

export const EVENT_STATUSES = [
  "PENDING",
  "ACTIVE",
  "FINISHED",
  "CANCELLED",
] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const EVENT_TYPES = ["LEAGUE", "TOURNAMENT"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const RESULT_ATTACHMENT_TYPES = ["IMAGE", "VIDEO"] as const;
export type ResultAttachmentType = (typeof RESULT_ATTACHMENT_TYPES)[number];

export const VIDEO_PLATFORMS = ["TWITCH", "YOUTUBE", "OTHER"] as const;
export type VideoPlatform = (typeof VIDEO_PLATFORMS)[number];

export const MATCH_FORMATS = [
  "ONE_V_ONE",
  "TWO_V_TWO",
  "THREE_V_THREE",
  "FOUR_V_FOUR",
  "FIVE_V_FIVE",
  "SIX_V_SIX",
  "FREE_FOR_ALL",
] as const;
export type MatchFormat = (typeof MATCH_FORMATS)[number];
