-- Add email preferences and streak tracking to users
ALTER TABLE "users" ADD COLUMN "email_reminders" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN "streak_current" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "streak_longest" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "streak_last_activity_at" TIMESTAMP(3);

-- Add share_id to programs for public sharing
ALTER TABLE "programs" ADD COLUMN "share_id" TEXT;

-- Create unique index on share_id
CREATE UNIQUE INDEX "programs_share_id_key" ON "programs"("share_id");

-- Create index for faster share_id lookups
CREATE INDEX "programs_share_id_idx" ON "programs"("share_id");
