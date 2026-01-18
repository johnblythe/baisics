/**
 * Seed script for database
 * Run: npx prisma db seed
 *
 * Configure in package.json:
 * "prisma": { "seed": "npx tsx prisma/seed.ts" }
 */

import { PrismaClient, Difficulty, MovementPattern, MuscleGroup, ExerciseTier, SubscriptionStatus, MilestoneType } from '@prisma/client';
import exercisesData from './seed-data/exercises.json';
import * as fs from 'fs';
import * as path from 'path';
import type {
  PersonaSeed,
  RelativeDate,
  WorkoutLogSeed,
  ExerciseLogSeed,
  CheckInSeed,
  MilestoneSeed,
} from './seed-data/personas/types';

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

// ============ Persona Seeding ============

/**
 * Convert a RelativeDate to an actual Date
 */
function relativeDateToDate(relDate: RelativeDate): Date {
  const now = new Date();
  const date = new Date(now);
  date.setDate(date.getDate() - relDate.daysAgo);
  if (relDate.hour !== undefined) {
    date.setHours(relDate.hour);
  }
  if (relDate.minute !== undefined) {
    date.setMinutes(relDate.minute);
  }
  return date;
}

/**
 * Read all persona JSON files from the personas directory
 */
function loadPersonaFiles(): PersonaSeed[] {
  const personasDir = path.join(__dirname, 'seed-data', 'personas');
  const personas: PersonaSeed[] = [];

  if (!fs.existsSync(personasDir)) {
    console.log('No personas directory found, skipping persona seeding');
    return [];
  }

  const files = fs.readdirSync(personasDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(personasDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const persona = JSON.parse(content) as PersonaSeed;
    personas.push(persona);
  }

  return personas;
}

/**
 * Seed all personas - main function
 */
async function seedPersonas() {
  console.log('Seeding personas...');

  const personas = loadPersonaFiles();

  if (personas.length === 0) {
    console.log('No persona files found');
    return;
  }

  for (const persona of personas) {
    console.log(`  Seeding persona: ${persona.id} (${persona.user.email})`);

    // 1. Upsert User by email
    const user = await prisma.user.upsert({
      where: { email: persona.user.email },
      update: {
        name: persona.user.name,
        isPremium: persona.user.isPremium,
        streakCurrent: persona.user.streakCurrent,
        streakLongest: persona.user.streakLongest,
        streakLastActivityAt: persona.user.streakLastActivityAt
          ? relativeDateToDate(persona.user.streakLastActivityAt)
          : null,
      },
      create: {
        email: persona.user.email,
        name: persona.user.name,
        isPremium: persona.user.isPremium,
        streakCurrent: persona.user.streakCurrent,
        streakLongest: persona.user.streakLongest,
        streakLastActivityAt: persona.user.streakLastActivityAt
          ? relativeDateToDate(persona.user.streakLastActivityAt)
          : null,
      },
    });

    // 2. Upsert UserIntake
    await prisma.userIntake.upsert({
      where: { userId: user.id },
      update: {
        sex: persona.intake.sex,
        trainingGoal: persona.intake.trainingGoal,
        daysAvailable: persona.intake.daysAvailable,
        dailyBudget: persona.intake.dailyBudget,
        experienceLevel: persona.intake.experienceLevel,
        age: persona.intake.age,
        weight: persona.intake.weight,
        height: persona.intake.height,
        trainingPreferences: persona.intake.trainingPreferences ?? [],
        additionalInfo: persona.intake.additionalInfo,
      },
      create: {
        userId: user.id,
        sex: persona.intake.sex,
        trainingGoal: persona.intake.trainingGoal,
        daysAvailable: persona.intake.daysAvailable,
        dailyBudget: persona.intake.dailyBudget,
        experienceLevel: persona.intake.experienceLevel,
        age: persona.intake.age,
        weight: persona.intake.weight,
        height: persona.intake.height,
        trainingPreferences: persona.intake.trainingPreferences ?? [],
        additionalInfo: persona.intake.additionalInfo,
      },
    });

    // 3. Create Subscription if persona is paid
    if (persona.subscription) {
      const periodStart = new Date();
      periodStart.setDate(periodStart.getDate() - persona.subscription.currentPeriodStartDaysAgo);
      const periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() + persona.subscription.currentPeriodEndDaysAhead);

      await prisma.subscription.upsert({
        where: { userId: user.id },
        update: {
          status: persona.subscription.status,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: persona.subscription.cancelAtPeriodEnd ?? false,
        },
        create: {
          userId: user.id,
          status: persona.subscription.status,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: persona.subscription.cancelAtPeriodEnd ?? false,
        },
      });
    }

    // 4. Seed Programs (delete existing for this user first for clean state)
    // Note: we delete programs owned by this user, not authored by
    await prisma.program.deleteMany({
      where: { userId: user.id },
    });

    for (const programSeed of persona.programs) {
      // Create Program
      const program = await prisma.program.create({
        data: {
          name: programSeed.name,
          description: programSeed.description,
          createdBy: user.id, // User is both author and owner for test data
          userId: user.id,
          active: programSeed.active,
          category: programSeed.category,
          difficulty: programSeed.difficulty,
          durationWeeks: programSeed.durationWeeks,
          daysPerWeek: programSeed.daysPerWeek,
          equipment: programSeed.equipment ?? [],
          goals: programSeed.goals ?? [],
          tags: programSeed.tags ?? [],
          week2CheckInShown: programSeed.week2CheckInShown ?? false,
          week2CheckInShownAt: programSeed.week2CheckInShownAtDaysAgo !== undefined
            ? new Date(Date.now() - programSeed.week2CheckInShownAtDaysAgo * 24 * 60 * 60 * 1000)
            : null,
          week2CheckInOption: programSeed.week2CheckInOption,
        },
      });

      // Create WorkoutPlan
      const workoutPlan = await prisma.workoutPlan.create({
        data: {
          userId: user.id,
          programId: program.id,
          daysPerWeek: programSeed.workoutPlan.daysPerWeek,
          dailyCalories: programSeed.workoutPlan.dailyCalories ?? 2000,
          proteinGrams: programSeed.workoutPlan.proteinGrams ?? 150,
          carbGrams: programSeed.workoutPlan.carbGrams ?? 200,
          fatGrams: programSeed.workoutPlan.fatGrams ?? 70,
          phase: programSeed.workoutPlan.phase ?? 1,
          phaseName: programSeed.workoutPlan.phaseName,
          phaseDurationWeeks: programSeed.workoutPlan.phaseDurationWeeks,
          phaseExplanation: programSeed.workoutPlan.phaseExplanation,
          splitType: programSeed.workoutPlan.splitType,
        },
      });

      // Create Workouts and Exercises
      const workoutIdByDayNumber: Map<number, string> = new Map();
      const exerciseIdByWorkoutAndName: Map<string, string> = new Map();

      for (const workoutSeed of programSeed.workoutPlan.workouts) {
        const workout = await prisma.workout.create({
          data: {
            name: workoutSeed.name,
            focus: workoutSeed.focus,
            dayNumber: workoutSeed.dayNumber,
            warmup: workoutSeed.warmup,
            cooldown: workoutSeed.cooldown,
            workoutPlanId: workoutPlan.id,
          },
        });

        workoutIdByDayNumber.set(workoutSeed.dayNumber, workout.id);

        // Create Exercises
        for (let i = 0; i < workoutSeed.exercises.length; i++) {
          const exerciseSeed = workoutSeed.exercises[i];

          // Find exercise in library
          const libraryExercise = await prisma.exerciseLibrary.findUnique({
            where: { name: exerciseSeed.name },
          });

          if (!libraryExercise) {
            console.warn(`    Warning: Exercise "${exerciseSeed.name}" not found in library, skipping`);
            continue;
          }

          const exercise = await prisma.exercise.create({
            data: {
              workoutId: workout.id,
              exerciseLibraryId: libraryExercise.id,
              name: exerciseSeed.name,
              sets: exerciseSeed.sets,
              reps: exerciseSeed.reps,
              restPeriod: exerciseSeed.restPeriod ?? 90,
              intensity: exerciseSeed.intensity,
              notes: exerciseSeed.notes,
              sortOrder: exerciseSeed.sortOrder ?? i,
            },
          });

          exerciseIdByWorkoutAndName.set(`${workout.id}:${exerciseSeed.name}`, exercise.id);
        }
      }

      // Create WorkoutLogs
      if (programSeed.workoutLogs) {
        for (const logSeed of programSeed.workoutLogs) {
          const workoutId = workoutIdByDayNumber.get(logSeed.workoutDayNumber);
          if (!workoutId) {
            console.warn(`    Warning: Workout day ${logSeed.workoutDayNumber} not found for log`);
            continue;
          }

          const workoutLog = await prisma.workoutLog.create({
            data: {
              userId: user.id,
              workoutId: workoutId,
              programId: program.id,
              startedAt: relativeDateToDate(logSeed.startedAt),
              completedAt: logSeed.completedAt ? relativeDateToDate(logSeed.completedAt) : null,
              status: logSeed.status,
              notes: logSeed.notes,
              quickLog: logSeed.quickLog ?? false,
            },
          });

          // Create ExerciseLogs if present
          if (logSeed.exerciseLogs) {
            for (const exerciseLogSeed of logSeed.exerciseLogs) {
              const exerciseId = exerciseIdByWorkoutAndName.get(`${workoutId}:${exerciseLogSeed.exerciseName}`);
              if (!exerciseId) {
                // Skip silently for skipped exercises
                if (!exerciseLogSeed.skipped) {
                  console.warn(`    Warning: Exercise "${exerciseLogSeed.exerciseName}" not found for log`);
                }
                continue;
              }

              const exerciseLog = await prisma.exerciseLog.create({
                data: {
                  workoutLogId: workoutLog.id,
                  exerciseId: exerciseId,
                  notes: exerciseLogSeed.notes,
                  completedAt: exerciseLogSeed.skipped ? null : new Date(),
                },
              });

              // Create SetLogs if present
              if (exerciseLogSeed.sets) {
                for (const setSeed of exerciseLogSeed.sets) {
                  await prisma.setLog.create({
                    data: {
                      exerciseLogId: exerciseLog.id,
                      setNumber: setSeed.setNumber,
                      weight: setSeed.weight,
                      reps: setSeed.reps,
                      notes: setSeed.notes,
                    },
                  });
                }
              }
            }
          }
        }
      }

      // Create CheckIns
      if (programSeed.checkIns) {
        for (const checkInSeed of programSeed.checkIns) {
          const checkIn = await prisma.checkIn.create({
            data: {
              userId: user.id,
              programId: program.id,
              type: checkInSeed.type,
              date: relativeDateToDate(checkInSeed.date),
              notes: checkInSeed.notes,
            },
          });

          // Create UserStats if present
          if (checkInSeed.stats) {
            await prisma.userStats.create({
              data: {
                userId: user.id,
                programId: program.id,
                checkInId: checkIn.id,
                weight: checkInSeed.stats.weight,
                bodyFatLow: checkInSeed.stats.bodyFatLow,
                bodyFatHigh: checkInSeed.stats.bodyFatHigh,
                notes: checkInSeed.stats.notes,
                sleepHours: checkInSeed.stats.sleepHours,
                sleepQuality: checkInSeed.stats.sleepQuality,
                energyLevel: checkInSeed.stats.energyLevel,
                stressLevel: checkInSeed.stats.stressLevel,
                soreness: checkInSeed.stats.soreness,
                recovery: checkInSeed.stats.recovery,
                chest: checkInSeed.stats.chest,
                waist: checkInSeed.stats.waist,
                hips: checkInSeed.stats.hips,
                bicepLeft: checkInSeed.stats.bicepLeft,
                bicepRight: checkInSeed.stats.bicepRight,
              },
            });
          }
        }
      }
    }

    // 5. Create Milestones
    if (persona.milestones) {
      // Delete existing milestones for clean state
      await prisma.milestoneAchievement.deleteMany({
        where: { userId: user.id },
      });

      for (const milestoneSeed of persona.milestones) {
        await prisma.milestoneAchievement.create({
          data: {
            userId: user.id,
            type: milestoneSeed.type,
            earnedAt: new Date(Date.now() - milestoneSeed.earnedAtDaysAgo * 24 * 60 * 60 * 1000),
            totalWorkouts: milestoneSeed.totalWorkouts,
            totalVolume: milestoneSeed.totalVolume,
          },
        });
      }
    }

    console.log(`    ✓ ${persona.id} seeded successfully`);
  }

  console.log(`Personas: ${personas.length} personas seeded`);
}

async function main() {
  console.log('Starting database seed...\n');

  await seedExercises();
  await seedPersonas();

  console.log('\nSeed complete!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
