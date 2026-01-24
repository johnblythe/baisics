-- CreateEnum
CREATE TYPE "FoodSearchAction" AS ENUM ('SELECTED', 'ABANDONED', 'REFINED');

-- CreateTable
CREATE TABLE "food_search_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "query" VARCHAR(500) NOT NULL,
    "result_count" INTEGER NOT NULL,
    "selected_fdc_id" TEXT,
    "selected_name" VARCHAR(500),
    "source" VARCHAR(50),
    "action" "FoodSearchAction" NOT NULL DEFAULT 'SELECTED',
    "search_duration_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "food_search_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "food_search_logs_user_id_created_at_idx" ON "food_search_logs"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "food_search_logs" ADD CONSTRAINT "food_search_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
