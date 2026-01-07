-- Add coach onboarding tracking
ALTER TABLE "users" ADD COLUMN "coach_onboarded_at" TIMESTAMP(3);
