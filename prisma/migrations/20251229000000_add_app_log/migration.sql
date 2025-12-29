-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('INFO', 'WARN', 'ERROR');

-- CreateTable
CREATE TABLE "app_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "level" "LogLevel" NOT NULL DEFAULT 'INFO',
    "category" VARCHAR(100) NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "app_logs_level_created_at_idx" ON "app_logs"("level", "created_at");

-- CreateIndex
CREATE INDEX "app_logs_category_type_idx" ON "app_logs"("category", "type");

-- CreateIndex
CREATE INDEX "app_logs_created_at_idx" ON "app_logs"("created_at");

-- AddForeignKey
ALTER TABLE "app_logs" ADD CONSTRAINT "app_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
