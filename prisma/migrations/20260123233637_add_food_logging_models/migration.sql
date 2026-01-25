-- CreateEnum
CREATE TYPE "FoodSource" AS ENUM ('MANUAL', 'USDA_SEARCH', 'AI_PARSED', 'QUICK_ADD', 'RECIPE', 'SCREENSHOT');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "weekly_summary_day" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "food_log_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "meal" "MealType" NOT NULL,
    "fdc_id" TEXT,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "serving_size" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "serving_unit" TEXT NOT NULL DEFAULT 'serving',
    "calories" INTEGER NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "source" "FoodSource" NOT NULL DEFAULT 'MANUAL',
    "recipe_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_log_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "name" TEXT NOT NULL,
    "emoji" VARCHAR(10),
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "serving_size" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "serving_unit" TEXT NOT NULL DEFAULT 'serving',
    "calories" INTEGER NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "ingredients" JSONB NOT NULL,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quick_foods" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "fdc_id" TEXT,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "emoji" VARCHAR(10),
    "serving_size" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "serving_unit" TEXT NOT NULL DEFAULT 'serving',
    "calories" INTEGER NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quick_foods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "food_log_entries_user_id_idx" ON "food_log_entries"("user_id");

-- CreateIndex
CREATE INDEX "food_log_entries_date_idx" ON "food_log_entries"("date");

-- CreateIndex
CREATE INDEX "food_log_entries_user_id_date_idx" ON "food_log_entries"("user_id", "date");

-- CreateIndex
CREATE INDEX "recipes_user_id_idx" ON "recipes"("user_id");

-- CreateIndex
CREATE INDEX "recipes_is_public_idx" ON "recipes"("is_public");

-- CreateIndex
CREATE INDEX "recipes_name_idx" ON "recipes"("name");

-- CreateIndex
CREATE INDEX "recipes_usage_count_idx" ON "recipes"("usage_count");

-- CreateIndex
CREATE INDEX "quick_foods_user_id_idx" ON "quick_foods"("user_id");

-- CreateIndex
CREATE INDEX "quick_foods_sort_order_idx" ON "quick_foods"("sort_order");

-- CreateIndex
CREATE INDEX "quick_foods_usage_count_idx" ON "quick_foods"("usage_count");

-- AddForeignKey
ALTER TABLE "food_log_entries" ADD CONSTRAINT "food_log_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_log_entries" ADD CONSTRAINT "food_log_entries_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quick_foods" ADD CONSTRAINT "quick_foods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_programs_active" RENAME TO "programs_active_idx";

-- RenameIndex
ALTER INDEX "idx_programs_user_id" RENAME TO "programs_user_id_idx";
