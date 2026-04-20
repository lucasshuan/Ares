-- CreateEnum
CREATE TYPE "ParticipationMode" AS ENUM ('SOLO', 'TEAM');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "participation_mode" "ParticipationMode" NOT NULL DEFAULT 'SOLO';
