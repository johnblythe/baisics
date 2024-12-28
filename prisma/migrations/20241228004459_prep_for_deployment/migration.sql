-- CreateEnum
CREATE TYPE "MuscleGroup" AS ENUM ('CHEST', 'SHOULDERS', 'SHOULDERS_FRONT', 'SHOULDERS_SIDE', 'SHOULDERS_REAR', 'BICEPS', 'TRICEPS', 'FOREARMS', 'UPPER_BACK', 'TRAPS', 'TRAPEZIUS', 'TRAPEZIUS_UPPER', 'TRAPEZIUS_MIDDLE', 'TRAPEZIUS_LOWER', 'LATS', 'RHOMBOIDS', 'BACK', 'CORE_FRONT', 'CORE_SIDE', 'LOWER_BACK', 'CORE', 'QUADRICEPS', 'HIP_FLEXORS', 'HAMSTRINGS', 'GLUTES', 'CALVES', 'CALVES_OUTER', 'CALVES_INNER', 'ROTATOR_CUFF', 'SERRATUS', 'HIP_ABDUCTORS', 'HIP_ADDUCTORS');

-- CreateEnum
CREATE TYPE "MovementPattern" AS ENUM ('PUSH', 'PULL', 'HINGE', 'SQUAT', 'LUNGE', 'CARRY', 'ROTATION', 'PLANK');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateTable
CREATE TABLE "user_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "base64_data" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_intake" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "sex" TEXT NOT NULL,
    "training_goal" TEXT NOT NULL,
    "days_available" INTEGER NOT NULL,
    "daily_budget" INTEGER,
    "experience_level" TEXT,
    "age" INTEGER,
    "weight" INTEGER,
    "height" INTEGER,
    "training_preferences" TEXT[],
    "additional_info" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_intake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "input_tokens" INTEGER,
    "output_tokens" INTEGER,
    "model" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prompt_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT,
    "password" TEXT,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "program_id" UUID NOT NULL,
    "body_fat_percentage" DOUBLE PRECISION NOT NULL,
    "muscle_mass_distribution" TEXT NOT NULL,
    "days_per_week" INTEGER NOT NULL,
    "daily_calories" INTEGER NOT NULL,
    "protein_grams" INTEGER NOT NULL,
    "carb_grams" INTEGER NOT NULL,
    "fat_grams" INTEGER NOT NULL,
    "meal_timing" TEXT[],
    "progression_protocol" TEXT[],
    "phase" INTEGER NOT NULL,
    "phase_explanation" TEXT,
    "phase_expectations" TEXT,
    "phase_key_points" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "split_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workout_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workouts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workout_plan_id" UUID NOT NULL,
    "day_number" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_library" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "equipment" TEXT[],
    "description" TEXT,
    "instructions" TEXT[],
    "commonMistakes" TEXT[],
    "benefits" TEXT[],
    "difficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
    "isCompound" BOOLEAN NOT NULL DEFAULT false,
    "movementPattern" "MovementPattern" NOT NULL DEFAULT 'PUSH',
    "targetMuscles" "MuscleGroup"[],
    "secondaryMuscles" "MuscleGroup"[],
    "video_url" TEXT,
    "parentId" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercise_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workout_id" UUID NOT NULL,
    "exercise_library_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "rest_period" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlist_leads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "source" TEXT,
    "status" TEXT DEFAULT 'active',
    "cookie" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waitlist_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_images_user_id_idx" ON "user_images"("user_id");

-- CreateIndex
CREATE INDEX "user_intake_user_id_idx" ON "user_intake"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_intake_user_id_key" ON "user_intake"("user_id");

-- CreateIndex
CREATE INDEX "prompt_log_user_id_idx" ON "prompt_log"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "workout_plans_user_id_idx" ON "workout_plans"("user_id");

-- CreateIndex
CREATE INDEX "workout_plans_program_id_idx" ON "workout_plans"("program_id");

-- CreateIndex
CREATE INDEX "workouts_workout_plan_id_idx" ON "workouts"("workout_plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "exercise_library_name_key" ON "exercise_library"("name");

-- CreateIndex
CREATE INDEX "exercise_library_name_idx" ON "exercise_library"("name");

-- CreateIndex
CREATE INDEX "exercise_library_category_idx" ON "exercise_library"("category");

-- CreateIndex
CREATE INDEX "exercise_library_equipment_idx" ON "exercise_library"("equipment");

-- CreateIndex
CREATE INDEX "exercise_library_difficulty_idx" ON "exercise_library"("difficulty");

-- CreateIndex
CREATE INDEX "exercise_library_isCompound_idx" ON "exercise_library"("isCompound");

-- CreateIndex
CREATE INDEX "exercise_library_movementPattern_idx" ON "exercise_library"("movementPattern");

-- CreateIndex
CREATE INDEX "exercise_library_targetMuscles_idx" ON "exercise_library"("targetMuscles");

-- CreateIndex
CREATE INDEX "exercise_library_secondaryMuscles_idx" ON "exercise_library"("secondaryMuscles");

-- CreateIndex
CREATE INDEX "exercises_workout_id_idx" ON "exercises"("workout_id");

-- CreateIndex
CREATE INDEX "exercises_exercise_library_id_idx" ON "exercises"("exercise_library_id");

-- CreateIndex
CREATE INDEX "exercises_name_idx" ON "exercises"("name");

-- CreateIndex
CREATE INDEX "programs_name_idx" ON "programs"("name");

-- CreateIndex
CREATE INDEX "programs_created_by_idx" ON "programs"("created_by");

-- CreateIndex
CREATE INDEX "programs_description_idx" ON "programs"("description");

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_leads_email_key" ON "waitlist_leads"("email");

-- CreateIndex
CREATE INDEX "waitlist_leads_email_idx" ON "waitlist_leads"("email");

-- AddForeignKey
ALTER TABLE "user_images" ADD CONSTRAINT "user_images_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_intake" ADD CONSTRAINT "user_intake_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_log" ADD CONSTRAINT "prompt_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_workout_plan_id_fkey" FOREIGN KEY ("workout_plan_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_library" ADD CONSTRAINT "exercise_library_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "exercise_library"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_exercise_library_id_fkey" FOREIGN KEY ("exercise_library_id") REFERENCES "exercise_library"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
