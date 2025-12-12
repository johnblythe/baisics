-- CreateEnum
CREATE TYPE "NutritionSource" AS ENUM ('MANUAL', 'SCREENSHOT');

-- CreateTable
CREATE TABLE "nutrition_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "protein" INTEGER NOT NULL,
    "carbs" INTEGER NOT NULL,
    "fats" INTEGER NOT NULL,
    "calories" INTEGER NOT NULL,
    "source" "NutritionSource" NOT NULL DEFAULT 'MANUAL',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "nutrition_logs_user_id_idx" ON "nutrition_logs"("user_id");

-- CreateIndex
CREATE INDEX "nutrition_logs_date_idx" ON "nutrition_logs"("date");

-- CreateIndex
CREATE UNIQUE INDEX "nutrition_logs_user_id_date_key" ON "nutrition_logs"("user_id", "date");

-- AddForeignKey
ALTER TABLE "nutrition_logs" ADD CONSTRAINT "nutrition_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
