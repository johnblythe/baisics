-- AlterEnum
ALTER TYPE "FoodSource" ADD VALUE 'COMMUNITY';

-- AlterTable: add community columns to foods_off
ALTER TABLE "foods_off" ADD COLUMN "is_community" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "foods_off" ADD COLUMN "created_by_user_id" UUID;

-- Update search_vector trigger to include community foods
-- (community foods already have product_name, so existing tsvector generation covers them)
