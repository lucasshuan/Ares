export const INITIAL_PERMISSION_DEFINITIONS = [
  { key: "manage_games", name: "Manage Games" },
  { key: "manage_players", name: "Manage Players" },
  { key: "manage_rankings", name: "Manage Rankings" },
] as const;

export type PermissionKey =
  (typeof INITIAL_PERMISSION_DEFINITIONS)[number]["key"];

export const GAME_STATUSES = ["approved", "pending"] as const;
export type GameStatus = (typeof GAME_STATUSES)[number];

export const RESULT_ATTACHMENT_TYPES = ["image", "video"] as const;
export type ResultAttachmentType = (typeof RESULT_ATTACHMENT_TYPES)[number];

export const VIDEO_PLATFORMS = ["twitch", "youtube", "other"] as const;
export type VideoPlatform = (typeof VIDEO_PLATFORMS)[number];
