-- AlterTable
ALTER TABLE "events" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "games" ADD COLUMN     "deleted_at" TIMESTAMP(3);
