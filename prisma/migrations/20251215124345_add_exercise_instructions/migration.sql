-- AlterTable
ALTER TABLE "exercises" ADD COLUMN     "instructions" TEXT[] DEFAULT ARRAY[]::TEXT[];
