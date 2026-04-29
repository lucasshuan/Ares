-- CreateEnum
CREATE TYPE "EntryStatus" AS ENUM ('CONFIRMED', 'PENDING_APPROVAL', 'WAITLISTED', 'REJECTED');

-- AlterTable
ALTER TABLE "event_entries" ADD COLUMN     "entry_status" "EntryStatus" NOT NULL DEFAULT 'CONFIRMED';

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "requires_approval" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "waitlist_enabled" BOOLEAN NOT NULL DEFAULT false;
