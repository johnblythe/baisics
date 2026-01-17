-- AlterTable: Add Week 2 check-in fields to programs table
ALTER TABLE "programs" ADD COLUMN "week2_check_in_shown" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "programs" ADD COLUMN "week2_check_in_shown_at" TIMESTAMP(3);
ALTER TABLE "programs" ADD COLUMN "week2_check_in_option" TEXT;
