/*
  Warnings:

  - A unique constraint covering the columns `[check_in_id]` on the table `user_stats` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_stats_check_in_id_key" ON "user_stats"("check_in_id");
