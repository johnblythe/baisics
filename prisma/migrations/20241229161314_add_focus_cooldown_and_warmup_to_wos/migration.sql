/*
  Warnings:

  - Added the required column `focus` to the `workouts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `workouts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "workout_plans" ALTER COLUMN "body_fat_percentage" DROP NOT NULL,
ALTER COLUMN "muscle_mass_distribution" DROP NOT NULL,
ALTER COLUMN "meal_timing" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "progression_protocol" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "workouts" ADD COLUMN     "cooldown" TEXT,
ADD COLUMN     "focus" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "warmup" TEXT;
