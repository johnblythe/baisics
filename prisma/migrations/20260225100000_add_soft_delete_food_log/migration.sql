-- Add soft-delete column to food_log_entries
ALTER TABLE food_log_entries ADD COLUMN deleted_at TIMESTAMPTZ;

-- Partial unique index for staple auto-log dedup safety
-- Only one entry per (user, date, staple) — including soft-deleted rows
CREATE UNIQUE INDEX food_log_entries_user_date_staple_unique
  ON food_log_entries (user_id, date, staple_id)
  WHERE staple_id IS NOT NULL;
