-- CreateEnum
CREATE TYPE "MilestoneType" AS ENUM ('WORKOUT_1', 'WORKOUT_10', 'WORKOUT_25', 'WORKOUT_50', 'WORKOUT_100', 'WORKOUT_250', 'WORKOUT_365', 'WORKOUT_500', 'WORKOUT_1000');

-- CreateTable
CREATE TABLE "milestone_achievements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "MilestoneType" NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_workouts" INTEGER NOT NULL,
    "total_volume" DOUBLE PRECISION,

    CONSTRAINT "milestone_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "milestone_achievements_user_id_idx" ON "milestone_achievements"("user_id");

-- CreateIndex
CREATE INDEX "milestone_achievements_type_idx" ON "milestone_achievements"("type");

-- CreateIndex
CREATE UNIQUE INDEX "milestone_achievements_user_id_type_key" ON "milestone_achievements"("user_id", "type");

-- AddForeignKey
ALTER TABLE "milestone_achievements" ADD CONSTRAINT "milestone_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
