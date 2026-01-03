-- Add phase metadata to workout_plans
ALTER TABLE workout_plans ADD COLUMN phase_name VARCHAR(100);
ALTER TABLE workout_plans ADD COLUMN phase_duration_weeks INT;

-- Set default phase names for existing records based on phase number
UPDATE workout_plans SET phase_name = 'Phase ' || phase WHERE phase_name IS NULL;
