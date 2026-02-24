-- AlterEnum
ALTER TYPE "FoodSource" ADD VALUE 'STAPLE';

-- AlterTable
ALTER TABLE "food_log_entries" ADD COLUMN     "staple_id" UUID;

-- CreateTable
CREATE TABLE "food_staples" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "meal_slot" "MealType" NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT,
    "calories" INTEGER NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "recipe_id" UUID,
    "quick_food_id" UUID,
    "items" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_staples_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "food_staples_user_id_meal_slot_idx" ON "food_staples"("user_id", "meal_slot");

-- AddForeignKey
ALTER TABLE "food_log_entries" ADD CONSTRAINT "food_log_entries_staple_id_fkey" FOREIGN KEY ("staple_id") REFERENCES "food_staples"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_staples" ADD CONSTRAINT "food_staples_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_staples" ADD CONSTRAINT "food_staples_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_staples" ADD CONSTRAINT "food_staples_quick_food_id_fkey" FOREIGN KEY ("quick_food_id") REFERENCES "quick_foods"("id") ON DELETE SET NULL ON UPDATE CASCADE;
