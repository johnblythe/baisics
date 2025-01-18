/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripe_customer_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Made the column `rest_period` on table `exercises` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ExerciseMeasureType" AS ENUM ('REPS', 'TIME', 'DISTANCE', 'WEIGHT', 'BODY_WEIGHT');

-- CreateEnum
CREATE TYPE "ExerciseMeasureUnit" AS ENUM ('KG', 'LB', 'PERCENT', 'SECONDS', 'METERS', 'KILOMETERS');

-- CreateEnum
CREATE TYPE "PhotoType" AS ENUM ('FRONT', 'BACK', 'SIDE_LEFT', 'SIDE_RIGHT', 'CUSTOM');

-- AlterTable
ALTER TABLE "exercises" ADD COLUMN     "intensity" INTEGER DEFAULT 0,
ADD COLUMN     "measure_type" "ExerciseMeasureType" NOT NULL DEFAULT 'REPS',
ADD COLUMN     "measure_unit" "ExerciseMeasureUnit" DEFAULT 'LB',
ADD COLUMN     "measure_value" DOUBLE PRECISION,
ADD COLUMN     "notes" TEXT,
ALTER COLUMN "sets" SET DEFAULT 1,
ALTER COLUMN "reps" DROP NOT NULL,
ALTER COLUMN "rest_period" SET NOT NULL,
ALTER COLUMN "rest_period" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "user_images" ADD COLUMN     "check_in_id" UUID;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verified" TIMESTAMP(3),
ADD COLUMN     "image" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "stripe_auth_token" TEXT,
ADD COLUMN     "stripe_customer_id" TEXT;

-- CreateTable
CREATE TABLE "workout_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "workout_id" UUID NOT NULL,
    "program_id" UUID NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "notes" TEXT,

    CONSTRAINT "workout_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workout_log_id" UUID NOT NULL,
    "exercise_id" UUID NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "exercise_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "set_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "exercise_log_id" UUID NOT NULL,
    "set_number" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION,
    "reps" INTEGER NOT NULL,
    "notes" TEXT,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "set_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_stats" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "program_id" UUID NOT NULL,
    "check_in_id" UUID NOT NULL,
    "weight" DOUBLE PRECISION,
    "body_fat_low" DOUBLE PRECISION,
    "body_fat_high" DOUBLE PRECISION,
    "muscle_mass_distribution" TEXT,
    "notes" TEXT,
    "sleep_hours" DOUBLE PRECISION,
    "sleep_quality" INTEGER,
    "energy_level" INTEGER,
    "stress_level" INTEGER,
    "soreness" INTEGER,
    "recovery" INTEGER,
    "calories" INTEGER,
    "protein_grams" DOUBLE PRECISION,
    "carb_grams" DOUBLE PRECISION,
    "fat_grams" DOUBLE PRECISION,
    "water_liters" DOUBLE PRECISION,
    "diet_adherence" INTEGER,
    "hunger_levels" INTEGER,
    "cravings" INTEGER,
    "chest" DOUBLE PRECISION,
    "waist" DOUBLE PRECISION,
    "hips" DOUBLE PRECISION,
    "bicep_left" DOUBLE PRECISION,
    "bicep_right" DOUBLE PRECISION,
    "bicep_left_flex" DOUBLE PRECISION,
    "bicep_right_flex" DOUBLE PRECISION,
    "thigh_left" DOUBLE PRECISION,
    "thigh_right" DOUBLE PRECISION,
    "calf_left" DOUBLE PRECISION,
    "calf_right" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "check_ins" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "program_id" UUID NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'progress',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress_photos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "check_in_id" UUID NOT NULL,
    "user_image_id" UUID NOT NULL,
    "type" "PhotoType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "userStatsId" UUID,

    CONSTRAINT "progress_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_activities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "program_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "user_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_token" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "purchase_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workout_logs_user_id_idx" ON "workout_logs"("user_id");

-- CreateIndex
CREATE INDEX "workout_logs_workout_id_idx" ON "workout_logs"("workout_id");

-- CreateIndex
CREATE INDEX "exercise_logs_workout_log_id_idx" ON "exercise_logs"("workout_log_id");

-- CreateIndex
CREATE INDEX "exercise_logs_exercise_id_idx" ON "exercise_logs"("exercise_id");

-- CreateIndex
CREATE INDEX "set_logs_exercise_log_id_idx" ON "set_logs"("exercise_log_id");

-- CreateIndex
CREATE INDEX "user_stats_user_id_idx" ON "user_stats"("user_id");

-- CreateIndex
CREATE INDEX "user_stats_program_id_idx" ON "user_stats"("program_id");

-- CreateIndex
CREATE INDEX "user_stats_check_in_id_idx" ON "user_stats"("check_in_id");

-- CreateIndex
CREATE INDEX "check_ins_user_id_idx" ON "check_ins"("user_id");

-- CreateIndex
CREATE INDEX "check_ins_program_id_idx" ON "check_ins"("program_id");

-- CreateIndex
CREATE INDEX "progress_photos_check_in_id_idx" ON "progress_photos"("check_in_id");

-- CreateIndex
CREATE INDEX "progress_photos_user_image_id_idx" ON "progress_photos"("user_image_id");

-- CreateIndex
CREATE INDEX "user_activities_user_id_idx" ON "user_activities"("user_id");

-- CreateIndex
CREATE INDEX "user_activities_program_id_idx" ON "user_activities"("program_id");

-- CreateIndex
CREATE INDEX "user_activities_type_idx" ON "user_activities"("type");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "purchase_sessions_user_id_idx" ON "purchase_sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripe_customer_id_key" ON "users"("stripe_customer_id");

-- AddForeignKey
ALTER TABLE "user_images" ADD CONSTRAINT "user_images_check_in_id_fkey" FOREIGN KEY ("check_in_id") REFERENCES "check_ins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_logs" ADD CONSTRAINT "exercise_logs_workout_log_id_fkey" FOREIGN KEY ("workout_log_id") REFERENCES "workout_logs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_logs" ADD CONSTRAINT "exercise_logs_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "set_logs" ADD CONSTRAINT "set_logs_exercise_log_id_fkey" FOREIGN KEY ("exercise_log_id") REFERENCES "exercise_logs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_check_in_id_fkey" FOREIGN KEY ("check_in_id") REFERENCES "check_ins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_photos" ADD CONSTRAINT "progress_photos_check_in_id_fkey" FOREIGN KEY ("check_in_id") REFERENCES "check_ins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_photos" ADD CONSTRAINT "progress_photos_user_image_id_fkey" FOREIGN KEY ("user_image_id") REFERENCES "user_images"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_photos" ADD CONSTRAINT "progress_photos_userStatsId_fkey" FOREIGN KEY ("userStatsId") REFERENCES "user_stats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_sessions" ADD CONSTRAINT "purchase_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
