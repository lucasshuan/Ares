export const PERMISSION_KEYS = [
  "manage_games",
  "manage_players",
  "manage_events",
  "manage_users",
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export const GAME_STATUSES = ["APPROVED", "PENDING"] as const;
export type GameStatus = (typeof GAME_STATUSES)[number];

export const EVENT_STATUSES = [
  "PENDING",
  "ACTIVE",
  "FINISHED",
  "CANCELLED",
] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const EVENT_TYPES = [
  "RANKED_LEAGUE",
  "STANDARD_LEAGUE",
  "TOURNAMENT",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const MATCH_OUTCOMES = ["WIN", "DRAW", "LOSS"] as const;
export type MatchOutcome = (typeof MATCH_OUTCOMES)[number];

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

export const PARTICIPATION_MODES = ["SOLO", "TEAM"] as const;
export type ParticipationMode = (typeof PARTICIPATION_MODES)[number];
