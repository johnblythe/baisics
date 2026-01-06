-- Add program generation tracking fields for subscription limits
ALTER TABLE "users" ADD COLUMN "program_generations_this_month" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "generations_reset_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
