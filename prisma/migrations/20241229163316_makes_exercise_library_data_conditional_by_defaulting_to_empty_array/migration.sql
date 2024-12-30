-- AlterTable
ALTER TABLE "exercise_library" ALTER COLUMN "category" SET DEFAULT 'default',
ALTER COLUMN "equipment" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "instructions" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "commonMistakes" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "benefits" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "targetMuscles" SET DEFAULT ARRAY[]::"MuscleGroup"[],
ALTER COLUMN "secondaryMuscles" SET DEFAULT ARRAY[]::"MuscleGroup"[];

-- AlterTable
ALTER TABLE "user_intake" ALTER COLUMN "training_preferences" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "workout_plans" ALTER COLUMN "phase" SET DEFAULT 1;
