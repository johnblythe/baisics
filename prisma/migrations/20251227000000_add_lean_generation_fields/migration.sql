-- CreateEnum (if not exists)
DO $$ BEGIN
    CREATE TYPE "ExerciseTier" AS ENUM ('TIER_1', 'TIER_2', 'TIER_3');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add lean generation columns to exercise_library
ALTER TABLE "exercise_library" ADD COLUMN IF NOT EXISTS "default_tier" "ExerciseTier" NOT NULL DEFAULT 'TIER_2';
ALTER TABLE "exercise_library" ADD COLUMN IF NOT EXISTS "contraindications" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "exercise_library" ADD COLUMN IF NOT EXISTS "environments" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Create index on default_tier
CREATE INDEX IF NOT EXISTS "exercise_library_default_tier_idx" ON "exercise_library"("default_tier");
