/**
 * Seed script for database
 * Run: npx prisma db seed
 *
 * Configure in package.json:
 * "prisma": { "seed": "npx tsx prisma/seed.ts" }
 */

import { PrismaClient, Difficulty, MovementPattern, MuscleGroup, ExerciseTier } from '@prisma/client';
import exercisesData from './seed-data/exercises.json';

const prisma = new PrismaClient();

// Type for the JSON data (enums come as strings)
type ExerciseJson = {
  id: string;
  name: string;
  category: string;
  equipment: string[];
  description: string | null;
  instructions: string[];
  commonMistakes: string[];
  benefits: string[];
  difficulty: string;
  isCompound: boolean;
  movementPattern: string;
  targetMuscles: string[];
  secondaryMuscles: string[];
  videoUrl: string | null;
  images: string[];
  defaultTier: string;
  contraindications: string[];
  environments: string[];
};

async function seedExercises() {
  console.log('Seeding ExerciseLibrary...');

  // Upsert to avoid duplicates (uses unique `name` field)
  let created = 0;
  let updated = 0;

  for (const exercise of exercisesData as ExerciseJson[]) {
    const data = {
      name: exercise.name,
      category: exercise.category,
      equipment: exercise.equipment,
      description: exercise.description,
      instructions: exercise.instructions,
      commonMistakes: exercise.commonMistakes,
      benefits: exercise.benefits,
      difficulty: exercise.difficulty as Difficulty,
      isCompound: exercise.isCompound,
      movementPattern: exercise.movementPattern as MovementPattern,
      targetMuscles: exercise.targetMuscles as MuscleGroup[],
      secondaryMuscles: exercise.secondaryMuscles as MuscleGroup[],
      videoUrl: exercise.videoUrl,
      images: exercise.images,
      defaultTier: exercise.defaultTier as ExerciseTier,
      contraindications: exercise.contraindications,
      environments: exercise.environments,
    };

    const result = await prisma.exerciseLibrary.upsert({
      where: { name: exercise.name },
      create: data,
      update: data,
    });

    // Check if it was created or updated (prisma doesn't tell us directly)
    // We'll just count based on whether the ID matches
    if (result.id === exercise.id) {
      updated++;
    } else {
      created++;
    }
  }

  console.log(`ExerciseLibrary: ${exercisesData.length} exercises processed`);
}

async function main() {
  console.log('Starting database seed...\n');

  await seedExercises();

  console.log('\nSeed complete!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
