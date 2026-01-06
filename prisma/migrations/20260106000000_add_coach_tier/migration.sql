-- CreateEnum
CREATE TYPE "CoachTier" AS ENUM ('FREE', 'PRO', 'MAX');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "coach_tier" "CoachTier" NOT NULL DEFAULT 'FREE';
