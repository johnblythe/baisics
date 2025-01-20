/*
  Warnings:

  - You are about to drop the column `userStatsId` on the `progress_photos` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "progress_photos" DROP CONSTRAINT "progress_photos_userStatsId_fkey";

-- AlterTable
ALTER TABLE "progress_photos" DROP COLUMN "userStatsId",
ADD COLUMN     "user_stats_id" UUID;

-- AddForeignKey
ALTER TABLE "progress_photos" ADD CONSTRAINT "progress_photos_user_stats_id_fkey" FOREIGN KEY ("user_stats_id") REFERENCES "user_stats"("id") ON DELETE SET NULL ON UPDATE CASCADE;
