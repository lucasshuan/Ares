/*
  Warnings:

  - You are about to drop the column `permission_id` on the `user_permissions` table. All the data in the column will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id,key]` on the table `user_permissions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `user_permissions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PermissionKey" AS ENUM ('manage_games', 'manage_players', 'manage_events', 'manage_users');

-- DropForeignKey
ALTER TABLE "user_permissions" DROP CONSTRAINT "user_permissions_permission_id_fkey";

-- DropIndex
DROP INDEX "user_permissions_user_id_permission_id_key";

-- AlterTable
ALTER TABLE "user_permissions" DROP COLUMN "permission_id",
ADD COLUMN     "key" "PermissionKey" NOT NULL;

-- DropTable
DROP TABLE "permissions";

-- CreateIndex
CREATE UNIQUE INDEX "user_permissions_user_id_key_key" ON "user_permissions"("user_id", "key");
