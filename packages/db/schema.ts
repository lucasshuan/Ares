import { relations } from "drizzle-orm";

export const INITIAL_PERMISSION_DEFINITIONS = [
  { key: "manage_games", name: "Manage Games" },
  { key: "manage_players", name: "Manage Players" },
  { key: "manage_rankings", name: "Manage Rankings" },
] as const;

export type PermissionKey =
  (typeof INITIAL_PERMISSION_DEFINITIONS)[number]["key"];
import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { Snowflake } from "@theinternetfolks/snowflake";
import type { AdapterAccount } from "next-auth/adapters";

// Enums
export const resultAttachmentTypeEnum = pgEnum("result_attachment_type", [
  "image",
  "video",
]);

export const videoPlatformEnum = pgEnum("video_platform", [
  "twitch",
  "youtube",
  "other",
]);

export const gameStatusEnum = pgEnum("game_status", ["approved", "pending"]);
export type GameStatus = (typeof gameStatusEnum.enumValues)[number];

// Auth Tables
export const users = pgTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => Snowflake.generate()),
    name: text("name").notNull(),
    username: text("username").notNull(),
    email: text("email"),
    emailVerified: timestamp("email_verified", {
      mode: "date",
      withTimezone: true,
    }),
    image: text("image"),
    bio: text("bio"),
    profileColor: text("profile_color"),
    country: text("country"),
    isAdmin: boolean("is_admin").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    usersEmailIdx: uniqueIndex("users_email_idx").on(table.email),
    usersUsernameIdx: uniqueIndex("users_username_idx").on(table.username),
    usersNameIdx: index("users_name_idx").on(table.name),
  }),
);

export const accounts = pgTable(
  "accounts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => Snowflake.generate()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    accountsProviderAccountIdx: uniqueIndex("accounts_provider_account_idx").on(
      table.provider,
      table.providerAccountId,
    ),
    accountsUserIdIdx: index("accounts_user_id_idx").on(table.userId),
  }),
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => Snowflake.generate()),
    sessionToken: text("session_token").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    sessionsTokenIdx: uniqueIndex("sessions_token_idx").on(table.sessionToken),
    sessionsUserIdIdx: index("sessions_user_id_idx").on(table.userId),
  }),
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => Snowflake.generate()),
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    verificationTokensIdentifierTokenIdx: uniqueIndex(
      "verification_tokens_identifier_token_idx",
    ).on(table.identifier, table.token),
  }),
);

// Domain Tables
export const games = pgTable(
  "games",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => Snowflake.generate()),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    backgroundImageUrl: text("background_image_url"),
    thumbnailImageUrl: text("thumbnail_image_url"),
    steamUrl: text("steam_url"),
    status: gameStatusEnum("status").default("approved").notNull(),
    authorId: text("author_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    gamesNameIdx: uniqueIndex("games_name_idx").on(table.name),
    gamesStatusIdx: index("games_status_idx").on(table.status),
    gamesAuthorIdIdx: index("games_author_id_idx").on(table.authorId),
  }),
);

export const players = pgTable(
  "players",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => Snowflake.generate()),
    gameId: text("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    primaryUsernameId: text("primary_username_id"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    playersGameIdIdx: index("players_game_id_idx").on(table.gameId),
    playersUserIdIdx: index("players_user_id_idx").on(table.userId),
    playersGameUserIdx: uniqueIndex("players_game_user_idx").on(
      table.gameId,
      table.userId,
    ),
    playersPrimaryUsernameIdIdx: index("players_primary_username_id_idx").on(
      table.primaryUsernameId,
    ),
  }),
);

export const playerUsernames = pgTable(
  "player_usernames",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => Snowflake.generate()),
    playerId: text("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    username: text("username").notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    playerUsernamesPlayerUsernameIdx: uniqueIndex(
      "player_usernames_player_username_idx",
    ).on(table.playerId, table.username),
    playerUsernamesPlayerIdIdx: index("player_usernames_player_id_idx").on(
      table.playerId,
    ),
  }),
);

export const rankings = pgTable(
  "rankings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => Snowflake.generate()),
    gameId: text("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    initialElo: integer("initial_elo").default(1000).notNull(),
    ratingSystem: text("rating_system").default("elo").notNull(),
    allowDraw: boolean("allow_draw").default(false).notNull(),
    kFactor: integer("k_factor").default(20).notNull(),
    scoreRelevance: doublePrecision("score_relevance").default(0.4).notNull(),
    inactivityDecay: integer("inactivity_decay").default(5).notNull(),
    inactivityThresholdHours: integer("inactivity_threshold_hours")
      .default(120)
      .notNull(),
    inactivityDecayFloor: integer("inactivity_decay_floor")
      .default(1000)
      .notNull(),
    pointsPerWin: integer("points_per_win").default(3).notNull(),
    pointsPerDraw: integer("points_per_draw").default(1).notNull(),
    pointsPerLoss: integer("points_per_loss").default(0).notNull(),
    startDate: timestamp("start_date", { mode: "date", withTimezone: true }),
    endDate: timestamp("end_date", { mode: "date", withTimezone: true }),
    isApproved: boolean("is_approved").default(false).notNull(),
    authorId: text("author_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    rankingsGameNameIdx: uniqueIndex("rankings_game_name_idx").on(
      table.gameId,
      table.name,
    ),
    rankingsGameSlugIdx: uniqueIndex("rankings_game_slug_idx").on(
      table.gameId,
      table.slug,
    ),
    rankingsGameIdIdx: index("rankings_game_id_idx").on(table.gameId),
    rankingsIsApprovedIdx: index("rankings_is_approved_idx").on(
      table.isApproved,
    ),
    rankingsAuthorIdIdx: index("rankings_author_id_idx").on(table.authorId),
  }),
);

export const rankingEntries = pgTable(
  "ranking_entries",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => Snowflake.generate()),
    rankingId: text("ranking_id")
      .notNull()
      .references(() => rankings.id, { onDelete: "cascade" }),
    playerId: text("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    currentElo: integer("current_elo").default(1000).notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    rankingEntriesRankingPlayerIdx: uniqueIndex(
      "ranking_entries_ranking_player_idx",
    ).on(table.rankingId, table.playerId),
    rankingEntriesRankingIdIdx: index("ranking_entries_ranking_id_idx").on(
      table.rankingId,
    ),
    rankingEntriesPlayerIdIdx: index("ranking_entries_player_id_idx").on(
      table.playerId,
    ),
  }),
);

export const results = pgTable(
  "results",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => Snowflake.generate()),
    rankingId: text("ranking_id")
      .notNull()
      .references(() => rankings.id, { onDelete: "cascade" }),
    description: text("description"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    resultsRankingIdIdx: index("results_ranking_id_idx").on(table.rankingId),
  }),
);

export const resultEntries = pgTable(
  "result_entries",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => Snowflake.generate()),
    resultId: text("result_id")
      .notNull()
      .references(() => results.id, { onDelete: "cascade" }),
    playerId: text("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    eloDifference: integer("elo_difference").notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    resultEntriesResultPlayerIdx: uniqueIndex(
      "result_entries_result_player_idx",
    ).on(table.resultId, table.playerId),
    resultEntriesResultIdIdx: index("result_entries_result_id_idx").on(
      table.resultId,
    ),
    resultEntriesPlayerIdIdx: index("result_entries_player_id_idx").on(
      table.playerId,
    ),
  }),
);

export const resultAttachments = pgTable(
  "result_attachments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => Snowflake.generate()),
    resultId: text("result_id")
      .notNull()
      .references(() => results.id, { onDelete: "cascade" }),
    type: resultAttachmentTypeEnum("type").notNull(),
    videoPlatform: videoPlatformEnum("video_platform"),
    url: text("url").notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    resultAttachmentsResultIdIdx: index("result_attachments_result_id_idx").on(
      table.resultId,
    ),
    resultAttachmentsTypeIdx: index("result_attachments_type_idx").on(
      table.type,
    ),
  }),
);

export const permissions = pgTable(
  "permissions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => Snowflake.generate()),
    key: text("key").notNull().unique(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    permissionsKeyIdx: uniqueIndex("permissions_key_idx").on(table.key),
  }),
);

export const userPermissions = pgTable(
  "user_permissions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => Snowflake.generate()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    permissionId: text("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userPermissionsUserPermissionIdx: uniqueIndex(
      "user_permissions_user_permission_idx",
    ).on(table.userId, table.permissionId),
    userPermissionsUserIdIdx: index("user_permissions_user_id_idx").on(
      table.userId,
    ),
    userPermissionsPermissionIdIdx: index(
      "user_permissions_permission_id_idx",
    ).on(table.permissionId),
  }),
);

// RELATIONS
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  authoredGames: many(games),
  players: many(players),
  userPermissions: many(userPermissions),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const gamesRelations = relations(games, ({ many, one }) => ({
  author: one(users, { fields: [games.authorId], references: [users.id] }),
  players: many(players),
  rankings: many(rankings),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  game: one(games, { fields: [players.gameId], references: [games.id] }),
  user: one(users, { fields: [players.userId], references: [users.id] }),
  usernames: many(playerUsernames),
  rankingEntries: many(rankingEntries),
  resultEntries: many(resultEntries),
}));

export const playerUsernamesRelations = relations(
  playerUsernames,
  ({ one }) => ({
    player: one(players, {
      fields: [playerUsernames.playerId],
      references: [players.id],
    }),
  }),
);

export const rankingsRelations = relations(rankings, ({ one, many }) => ({
  game: one(games, { fields: [rankings.gameId], references: [games.id] }),
  entries: many(rankingEntries),
  results: many(results),
}));

export const rankingEntriesRelations = relations(rankingEntries, ({ one }) => ({
  ranking: one(rankings, {
    fields: [rankingEntries.rankingId],
    references: [rankings.id],
  }),
  player: one(players, {
    fields: [rankingEntries.playerId],
    references: [players.id],
  }),
}));

export const resultsRelations = relations(results, ({ one, many }) => ({
  ranking: one(rankings, {
    fields: [results.rankingId],
    references: [rankings.id],
  }),
  entries: many(resultEntries),
  attachments: many(resultAttachments),
}));

export const resultEntriesRelations = relations(resultEntries, ({ one }) => ({
  result: one(results, {
    fields: [resultEntries.resultId],
    references: [results.id],
  }),
  player: one(players, {
    fields: [resultEntries.playerId],
    references: [players.id],
  }),
}));

export const resultAttachmentsRelations = relations(
  resultAttachments,
  ({ one }) => ({
    result: one(results, {
      fields: [resultAttachments.resultId],
      references: [results.id],
    }),
  }),
);

export const permissionsRelations = relations(permissions, ({ many }) => ({
  userPermissions: many(userPermissions),
}));

export const userPermissionsRelations = relations(
  userPermissions,
  ({ one }) => ({
    user: one(users, {
      fields: [userPermissions.userId],
      references: [users.id],
    }),
    permission: one(permissions, {
      fields: [userPermissions.permissionId],
      references: [permissions.id],
    }),
  }),
);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
export type PlayerUsername = typeof playerUsernames.$inferSelect;
export type NewPlayerUsername = typeof playerUsernames.$inferInsert;
export type Ranking = typeof rankings.$inferSelect;
export type NewRanking = typeof rankings.$inferInsert;
export type RankingEntry = typeof rankingEntries.$inferSelect;
export type NewRankingEntry = typeof rankingEntries.$inferInsert;
export type Result = typeof results.$inferSelect;
export type NewResult = typeof results.$inferInsert;
export type ResultEntry = typeof resultEntries.$inferSelect;
export type NewResultEntry = typeof resultEntries.$inferInsert;
export type ResultAttachment = typeof resultAttachments.$inferSelect;
export type NewResultAttachment = typeof resultAttachments.$inferInsert;
export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
export type UserPermission = typeof userPermissions.$inferSelect;
export type NewUserPermission = typeof userPermissions.$inferInsert;
