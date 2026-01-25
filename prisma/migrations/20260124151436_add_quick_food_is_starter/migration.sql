-- AlterTable
ALTER TABLE "quick_foods" ADD COLUMN     "is_starter" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_used_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "quick_foods_is_starter_idx" ON "quick_foods"("is_starter");
