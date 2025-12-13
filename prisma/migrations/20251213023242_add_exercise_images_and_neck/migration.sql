-- AlterEnum
ALTER TYPE "MuscleGroup" ADD VALUE 'NECK';

-- AlterTable
ALTER TABLE "exercise_library" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
