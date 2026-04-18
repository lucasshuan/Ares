-- CreateEnum
CREATE TYPE "MatchFormat" AS ENUM (
  'ONE_V_ONE',
  'TWO_V_TWO',
  'THREE_V_THREE',
  'FOUR_V_FOUR',
  'FIVE_V_FIVE',
  'SIX_V_SIX',
  'FREE_FOR_ALL'
);

-- AlterTable
ALTER TABLE "leagues"
ADD COLUMN "allowed_formats" "MatchFormat"[] NOT NULL DEFAULT ARRAY[]::"MatchFormat"[];

-- AlterTable
ALTER TABLE "results"
ADD COLUMN "format" "MatchFormat";

-- Backfill existing rows, then enforce required column
UPDATE "results"
SET "format" = 'ONE_V_ONE'
WHERE "format" IS NULL;

ALTER TABLE "results"
ALTER COLUMN "format" SET NOT NULL;
