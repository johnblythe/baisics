/**
 * Import exercises from free-exercise-db into ExerciseLibrary
 *
 * Usage: npx ts-node src/scripts/import-exercises.ts
 *
 * Source: https://github.com/yuhonas/free-exercise-db
 */

import { PrismaClient, MuscleGroup, MovementPattern, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

const EXERCISE_DB_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

// Mapping from free-exercise-db muscle names to our MuscleGroup enum
const muscleMapping: Record<string, MuscleGroup> = {
  'abdominals': MuscleGroup.CORE,
  'abductors': MuscleGroup.HIP_ABDUCTORS,
  'adductors': MuscleGroup.HIP_ADDUCTORS,
  'biceps': MuscleGroup.BICEPS,
  'calves': MuscleGroup.CALVES,
  'chest': MuscleGroup.CHEST,
  'forearms': MuscleGroup.FOREARMS,
  'glutes': MuscleGroup.GLUTES,
  'hamstrings': MuscleGroup.HAMSTRINGS,
  'lats': MuscleGroup.LATS,
  'lower back': MuscleGroup.LOWER_BACK,
  'middle back': MuscleGroup.UPPER_BACK,
  'neck': MuscleGroup.NECK,
  'quadriceps': MuscleGroup.QUADRICEPS,
  'shoulders': MuscleGroup.SHOULDERS,
  'traps': MuscleGroup.TRAPS,
  'triceps': MuscleGroup.TRICEPS,
};

// Mapping from free-exercise-db level to our Difficulty enum
const difficultyMapping: Record<string, Difficulty> = {
  'beginner': Difficulty.BEGINNER,
  'intermediate': Difficulty.INTERMEDIATE,
  'expert': Difficulty.EXPERT,
};

// Mapping from free-exercise-db force to our MovementPattern enum
const forceMapping: Record<string, MovementPattern> = {
  'pull': MovementPattern.PULL,
  'push': MovementPattern.PUSH,
  'static': MovementPattern.PLANK,
};

// Equipment normalization
const normalizeEquipment = (equipment: string | null): string[] => {
  if (!equipment || equipment === 'body only' || equipment === 'other') {
    return [];
  }
  return [equipment];
};

interface ExternalExercise {
  id: string;
  name: string;
  force: string | null;
  level: string;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
}

async function fetchExercises(): Promise<ExternalExercise[]> {
  console.log('Fetching exercises from free-exercise-db...');
  const response = await fetch(EXERCISE_DB_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }
  return response.json();
}

function mapMuscles(muscles: string[]): MuscleGroup[] {
  return muscles
    .map(m => muscleMapping[m.toLowerCase()])
    .filter((m): m is MuscleGroup => m !== undefined);
}

function mapExercise(ext: ExternalExercise) {
  return {
    name: ext.name,
    category: ext.category || 'strength',
    equipment: normalizeEquipment(ext.equipment),
    instructions: ext.instructions,
    difficulty: difficultyMapping[ext.level] || Difficulty.BEGINNER,
    isCompound: ext.mechanic === 'compound',
    movementPattern: ext.force ? (forceMapping[ext.force] || MovementPattern.OTHER) : MovementPattern.OTHER,
    targetMuscles: mapMuscles(ext.primaryMuscles),
    secondaryMuscles: mapMuscles(ext.secondaryMuscles),
    images: ext.images.map(img => `${IMAGE_BASE_URL}/${img}`),
  };
}

async function importExercises(dryRun = false) {
  try {
    const exercises = await fetchExercises();
    console.log(`Fetched ${exercises.length} exercises`);

    if (dryRun) {
      console.log('\n=== DRY RUN MODE ===\n');

      // Sample exercises
      const samples = [exercises[0], exercises[100], exercises[400], exercises[800]].filter(Boolean);
      console.log('Sample mappings:');
      for (const ext of samples) {
        const mapped = mapExercise(ext);
        console.log(`\n"${ext.name}":`);
        console.log(`  category: ${mapped.category}`);
        console.log(`  difficulty: ${mapped.difficulty}`);
        console.log(`  isCompound: ${mapped.isCompound}`);
        console.log(`  movementPattern: ${mapped.movementPattern}`);
        console.log(`  equipment: [${mapped.equipment.join(', ')}]`);
        console.log(`  targetMuscles: [${mapped.targetMuscles.join(', ')}]`);
        console.log(`  secondaryMuscles: [${mapped.secondaryMuscles.join(', ')}]`);
        console.log(`  instructions: ${mapped.instructions.length} steps`);
        console.log(`  images: ${mapped.images.length} images`);
      }

      // Stats
      const categories = new Set(exercises.map(e => e.category));
      const withImages = exercises.filter(e => e.images.length > 0).length;
      const withInstructions = exercises.filter(e => e.instructions.length > 0).length;

      console.log('\n=== STATS ===');
      console.log(`Total exercises: ${exercises.length}`);
      console.log(`Categories: ${[...categories].join(', ')}`);
      console.log(`With images: ${withImages}/${exercises.length}`);
      console.log(`With instructions: ${withInstructions}/${exercises.length}`);
      console.log('\nRun without --dry-run to import.');
      return;
    }

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const ext of exercises) {
      try {
        const data = mapExercise(ext);

        await prisma.exerciseLibrary.upsert({
          where: { name: data.name },
          update: data,
          create: data,
        });

        imported++;
        if (imported % 100 === 0) {
          console.log(`Imported ${imported}/${exercises.length}...`);
        }
      } catch (err) {
        if ((err as Error).message?.includes('Unique constraint')) {
          skipped++;
        } else {
          errors++;
          console.error(`Error importing "${ext.name}":`, (err as Error).message);
        }
      }
    }

    console.log(`\nImport complete!`);
    console.log(`  Imported: ${imported}`);
    console.log(`  Skipped (duplicates): ${skipped}`);
    console.log(`  Errors: ${errors}`);

  } catch (err) {
    console.error('Import failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const dryRun = process.argv.includes('--dry-run');
importExercises(dryRun);
