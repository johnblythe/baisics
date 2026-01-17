-- Add quick log fields to workout_logs table
ALTER TABLE "workout_logs" ADD COLUMN "quick_log" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "workout_logs" ADD COLUMN "quick_log_expiry" TIMESTAMP(3);
