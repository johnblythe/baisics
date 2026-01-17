-- Add weekly summary notification preferences
ALTER TABLE "users" ADD COLUMN "weekly_summary_enabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN "weekly_summary_day" VARCHAR(10) NOT NULL DEFAULT 'monday';
