-- CreateEnum
CREATE TYPE "PrimaryGoal" AS ENUM ('LOSE_WEIGHT', 'BUILD_MUSCLE', 'MAINTAIN', 'HEALTH');

-- AlterTable
ALTER TABLE "programs" ADD COLUMN "current_phase" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "nutrition_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "program_id" UUID,
    "phase_number" INTEGER NOT NULL DEFAULT 1,
    "daily_calories" INTEGER NOT NULL,
    "protein_grams" INTEGER NOT NULL,
    "carb_grams" INTEGER NOT NULL,
    "fat_grams" INTEGER NOT NULL,
    "effective_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "primary_goal" "PrimaryGoal" NOT NULL,
    "target_weight" DOUBLE PRECISION,
    "timeframe" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "nutrition_plans_user_id_end_date_idx" ON "nutrition_plans"("user_id", "end_date");

-- CreateIndex
CREATE INDEX "nutrition_plans_program_id_phase_number_end_date_idx" ON "nutrition_plans"("program_id", "phase_number", "end_date");

-- CreateIndex
CREATE UNIQUE INDEX "goals_user_id_key" ON "goals"("user_id");

-- AddForeignKey
ALTER TABLE "nutrition_plans" ADD CONSTRAINT "nutrition_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_plans" ADD CONSTRAINT "nutrition_plans_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add ownership constraint: NutritionPlan must belong to either a user OR a program, not both, not neither
ALTER TABLE "nutrition_plans" ADD CONSTRAINT "nutrition_plans_ownership_check"
    CHECK ((user_id IS NOT NULL AND program_id IS NULL) OR (user_id IS NULL AND program_id IS NOT NULL));
