-- Add coaching_notes field to exercise_library for mid-workout AI chat context
ALTER TABLE "exercise_library" ADD COLUMN "coaching_notes" TEXT;
