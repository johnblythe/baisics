-- Add template and library fields to programs table

-- Add slug column
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "slug" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "programs_slug_key" ON "programs"("slug");

-- Add source column
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "source" TEXT;

-- Add template fields
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "is_template" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "is_public" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "cloned_from_id" UUID;
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "clone_count" INTEGER NOT NULL DEFAULT 0;

-- Add metadata fields
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "difficulty" TEXT;
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "duration_weeks" INTEGER;
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "days_per_week" INTEGER;
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "equipment" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "goals" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Add SEO & display fields
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "author" TEXT;
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "image_url" TEXT;
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "popularity_score" INTEGER NOT NULL DEFAULT 0;

-- Add foreign key for cloned_from_id (skip if exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'programs_cloned_from_id_fkey'
  ) THEN
    ALTER TABLE "programs" ADD CONSTRAINT "programs_cloned_from_id_fkey"
      FOREIGN KEY ("cloned_from_id") REFERENCES "programs"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS "programs_name_idx" ON "programs"("name");
CREATE INDEX IF NOT EXISTS "programs_slug_idx" ON "programs"("slug");
CREATE INDEX IF NOT EXISTS "programs_created_by_idx" ON "programs"("created_by");
CREATE INDEX IF NOT EXISTS "programs_description_idx" ON "programs"("description");
CREATE INDEX IF NOT EXISTS "programs_is_template_idx" ON "programs"("is_template");
CREATE INDEX IF NOT EXISTS "programs_is_public_idx" ON "programs"("is_public");
CREATE INDEX IF NOT EXISTS "programs_category_idx" ON "programs"("category");
CREATE INDEX IF NOT EXISTS "programs_difficulty_idx" ON "programs"("difficulty");
