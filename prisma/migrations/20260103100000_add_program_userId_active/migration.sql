-- Add userId and active columns to programs table
-- userId: owner/tracker of the program (who logs workouts)
-- active: is this the user's current program?

-- Add new columns
ALTER TABLE programs ADD COLUMN user_id UUID;
ALTER TABLE programs ADD COLUMN active BOOLEAN NOT NULL DEFAULT true;

-- Add foreign key constraint
ALTER TABLE programs
ADD CONSTRAINT programs_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Add indexes
CREATE INDEX idx_programs_user_id ON programs(user_id);
CREATE INDEX idx_programs_active ON programs(active);

-- Backfill: set user_id = created_by for all existing programs
UPDATE programs SET user_id = created_by WHERE user_id IS NULL;

-- Set active = false for all but the most recent program per user
-- This matches the current implicit behavior (most recent = active)
WITH ranked_programs AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
  FROM programs
  WHERE user_id IS NOT NULL
)
UPDATE programs
SET active = false
WHERE id IN (
  SELECT id FROM ranked_programs WHERE rn > 1
);
