/*
  Warnings:

  - The values [RANKED_LEAGUE,STANDARD_LEAGUE] on the enum `EventType` will be removed. If these variants are still used in the database, this will fail.
  - The values [manage_players] on the enum `PermissionKey` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `elo_league_entries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `elo_leagues` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `elo_result_attachments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `elo_result_entries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `elo_results` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `player_usernames` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `players` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `standard_league_entries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `standard_leagues` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `standard_result_attachments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `standard_result_entries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `standard_results` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ClassificationSystem" AS ENUM ('ELO', 'POINTS');

-- CreateEnum
CREATE TYPE "PhaseType" AS ENUM ('ROUND_ROBIN', 'ELO_RATING', 'SWISS', 'SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'GROUP_STAGE');

-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "EventStaffRole" AS ENUM ('ORGANIZER', 'MODERATOR', 'SCOREKEEPER');

-- CreateEnum
CREATE TYPE "ClaimInitiator" AS ENUM ('STAFF', 'USER');

-- CreateEnum
CREATE TYPE "EntryClaimStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "EventType_new" AS ENUM ('LEAGUE', 'TOURNAMENT');
ALTER TABLE "events" ALTER COLUMN "type" TYPE "EventType_new" USING ("type"::text::"EventType_new");
ALTER TYPE "EventType" RENAME TO "EventType_old";
ALTER TYPE "EventType_new" RENAME TO "EventType";
DROP TYPE "public"."EventType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PermissionKey_new" AS ENUM ('manage_games', 'manage_events', 'manage_users');
ALTER TABLE "user_permissions" ALTER COLUMN "key" TYPE "PermissionKey_new" USING ("key"::text::"PermissionKey_new");
ALTER TYPE "PermissionKey" RENAME TO "PermissionKey_old";
ALTER TYPE "PermissionKey_new" RENAME TO "PermissionKey";
DROP TYPE "public"."PermissionKey_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "elo_league_entries" DROP CONSTRAINT "elo_league_entries_event_id_fkey";

-- DropForeignKey
ALTER TABLE "elo_league_entries" DROP CONSTRAINT "elo_league_entries_player_id_fkey";

-- DropForeignKey
ALTER TABLE "elo_leagues" DROP CONSTRAINT "elo_leagues_event_id_fkey";

-- DropForeignKey
ALTER TABLE "elo_result_attachments" DROP CONSTRAINT "elo_result_attachments_result_id_fkey";

-- DropForeignKey
ALTER TABLE "elo_result_entries" DROP CONSTRAINT "elo_result_entries_player_id_fkey";

-- DropForeignKey
ALTER TABLE "elo_result_entries" DROP CONSTRAINT "elo_result_entries_result_id_fkey";

-- DropForeignKey
ALTER TABLE "elo_results" DROP CONSTRAINT "elo_results_event_id_fkey";

-- DropForeignKey
ALTER TABLE "player_usernames" DROP CONSTRAINT "player_usernames_player_id_fkey";

-- DropForeignKey
ALTER TABLE "players" DROP CONSTRAINT "players_game_id_fkey";

-- DropForeignKey
ALTER TABLE "players" DROP CONSTRAINT "players_user_id_fkey";

-- DropForeignKey
ALTER TABLE "standard_league_entries" DROP CONSTRAINT "standard_league_entries_event_id_fkey";

-- DropForeignKey
ALTER TABLE "standard_league_entries" DROP CONSTRAINT "standard_league_entries_player_id_fkey";

-- DropForeignKey
ALTER TABLE "standard_leagues" DROP CONSTRAINT "standard_leagues_event_id_fkey";

-- DropForeignKey
ALTER TABLE "standard_result_attachments" DROP CONSTRAINT "standard_result_attachments_result_id_fkey";

-- DropForeignKey
ALTER TABLE "standard_result_entries" DROP CONSTRAINT "standard_result_entries_player_id_fkey";

-- DropForeignKey
ALTER TABLE "standard_result_entries" DROP CONSTRAINT "standard_result_entries_result_id_fkey";

-- DropForeignKey
ALTER TABLE "standard_results" DROP CONSTRAINT "standard_results_event_id_fkey";

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "registration_end_date" TIMESTAMP(3),
ADD COLUMN     "registration_start_date" TIMESTAMP(3);

-- DropTable
DROP TABLE "elo_league_entries";

-- DropTable
DROP TABLE "elo_leagues";

-- DropTable
DROP TABLE "elo_result_attachments";

-- DropTable
DROP TABLE "elo_result_entries";

-- DropTable
DROP TABLE "elo_results";

-- DropTable
DROP TABLE "player_usernames";

-- DropTable
DROP TABLE "players";

-- DropTable
DROP TABLE "standard_league_entries";

-- DropTable
DROP TABLE "standard_leagues";

-- DropTable
DROP TABLE "standard_result_attachments";

-- DropTable
DROP TABLE "standard_result_entries";

-- DropTable
DROP TABLE "standard_results";

-- DropEnum
DROP TYPE "ResultAttachmentType";

-- CreateTable
CREATE TABLE "leagues" (
    "event_id" TEXT NOT NULL,
    "classification_system" "ClassificationSystem" NOT NULL DEFAULT 'ELO',
    "config" JSONB NOT NULL,
    "allow_draw" BOOLEAN NOT NULL DEFAULT false,
    "allowed_formats" "MatchFormat"[] DEFAULT ARRAY[]::"MatchFormat"[],
    "custom_field_schema" JSONB,

    CONSTRAINT "leagues_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "tournament_phases" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PhaseType" NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'PENDING',
    "config" JSONB NOT NULL,
    "allow_draw" BOOLEAN NOT NULL DEFAULT false,
    "allowed_formats" "MatchFormat"[] DEFAULT ARRAY[]::"MatchFormat"[],
    "custom_field_schema" JSONB,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournament_phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_entries" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "image_url" TEXT,
    "user_id" TEXT,
    "stats" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entry_snapshots" (
    "id" TEXT NOT NULL,
    "entry_id" TEXT NOT NULL,
    "snapshot_date" DATE NOT NULL,
    "position" INTEGER NOT NULL,
    "stats" JSONB NOT NULL,

    CONSTRAINT "entry_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_entries" (
    "id" TEXT NOT NULL,
    "phase_id" TEXT NOT NULL,
    "entry_id" TEXT NOT NULL,
    "stats" JSONB NOT NULL DEFAULT '{}',
    "position" INTEGER,
    "seed" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "entry_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "image_url" TEXT,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entry_claims" (
    "id" TEXT NOT NULL,
    "entry_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "initiated_by" "ClaimInitiator" NOT NULL,
    "status" "EntryClaimStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "reviewed_by_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entry_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_member_claims" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "initiated_by" "ClaimInitiator" NOT NULL,
    "status" "EntryClaimStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "reviewed_by_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_member_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_staff" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "EventStaffRole" NOT NULL DEFAULT 'MODERATOR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "phase_id" TEXT,
    "format" "MatchFormat" NOT NULL,
    "description" TEXT,
    "scheduled_at" TIMESTAMP(3),
    "played_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_participants" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "entry_id" TEXT NOT NULL,
    "outcome" "MatchOutcome" NOT NULL,
    "score" INTEGER,
    "rating_change" INTEGER,
    "custom_stats" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_attachments" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "type" "AttachmentType" NOT NULL,
    "video_platform" "VideoPlatform",
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_attachments" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "type" "AttachmentType" NOT NULL,
    "video_platform" "VideoPlatform",
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_entries_event_id_user_id_key" ON "event_entries"("event_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "entry_snapshots_entry_id_snapshot_date_key" ON "entry_snapshots"("entry_id", "snapshot_date");

-- CreateIndex
CREATE UNIQUE INDEX "phase_entries_phase_id_entry_id_key" ON "phase_entries"("phase_id", "entry_id");

-- CreateIndex
CREATE UNIQUE INDEX "entry_claims_entry_id_user_id_key" ON "entry_claims"("entry_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_member_claims_member_id_user_id_key" ON "team_member_claims"("member_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_staff_event_id_user_id_key" ON "event_staff"("event_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "match_participants_match_id_entry_id_key" ON "match_participants"("match_id", "entry_id");

-- AddForeignKey
ALTER TABLE "leagues" ADD CONSTRAINT "leagues_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_phases" ADD CONSTRAINT "tournament_phases_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_entries" ADD CONSTRAINT "event_entries_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_entries" ADD CONSTRAINT "event_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry_snapshots" ADD CONSTRAINT "entry_snapshots_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "event_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_entries" ADD CONSTRAINT "phase_entries_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "tournament_phases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_entries" ADD CONSTRAINT "phase_entries_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "event_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "event_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry_claims" ADD CONSTRAINT "entry_claims_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "event_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry_claims" ADD CONSTRAINT "entry_claims_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry_claims" ADD CONSTRAINT "entry_claims_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_member_claims" ADD CONSTRAINT "team_member_claims_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "team_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_member_claims" ADD CONSTRAINT "team_member_claims_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_member_claims" ADD CONSTRAINT "team_member_claims_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_staff" ADD CONSTRAINT "event_staff_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_staff" ADD CONSTRAINT "event_staff_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "tournament_phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_participants" ADD CONSTRAINT "match_participants_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_participants" ADD CONSTRAINT "match_participants_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "event_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_attachments" ADD CONSTRAINT "match_attachments_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attachments" ADD CONSTRAINT "event_attachments_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
