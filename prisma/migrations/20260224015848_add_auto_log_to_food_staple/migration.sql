-- DropForeignKey
ALTER TABLE "food_log_entries" DROP CONSTRAINT "food_log_entries_recipe_id_fkey";

-- AlterTable
ALTER TABLE "food_staples" ADD COLUMN     "auto_log" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "food_log_entries" ADD CONSTRAINT "food_log_entries_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
