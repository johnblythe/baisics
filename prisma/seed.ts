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
    // First, find all programs for this user to get their IDs
    const existingPrograms = await prisma.program.findMany({
      where: { userId: user.id },
      select: { id: true },
    });
    const existingProgramIds = existingPrograms.map((p) => p.id);

    if (existingProgramIds.length > 0) {
      // Delete dependent records in correct order (deepest first)
      // 1. Delete CheckIns and their related UserStats
      await prisma.userStats.deleteMany({
        where: {
          checkIn: {
            programId: { in: existingProgramIds },
          },
        },
      });
      await prisma.checkIn.deleteMany({
        where: { programId: { in: existingProgramIds } },
      });

      // 2. Delete WorkoutLogs chain using CTE for atomic cascading delete
      // Single statement ensures all deletes happen together
      await prisma.$executeRaw`
        WITH program_ids AS (
          SELECT unnest(${existingProgramIds}::uuid[]) AS id
        ),
        workout_log_ids AS (
          SELECT wl.id FROM workout_logs wl
          WHERE wl.program_id IN (SELECT id FROM program_ids)
        ),
        exercise_log_ids AS (
          SELECT el.id FROM exercise_logs el
          WHERE el.workout_log_id IN (SELECT id FROM workout_log_ids)
        ),
        deleted_set_logs AS (
          DELETE FROM set_logs
          WHERE exercise_log_id IN (SELECT id FROM exercise_log_ids)
          RETURNING id
        ),
        deleted_exercise_logs AS (
          DELETE FROM exercise_logs
          WHERE id IN (SELECT id FROM exercise_log_ids)
          RETURNING id
        )
        DELETE FROM workout_logs
        WHERE id IN (SELECT id FROM workout_log_ids)
      `;

      // 3. Delete WorkoutPlan chain: Exercises -> Workouts -> WorkoutPlans
      // Explicit deletion to avoid race conditions during parallel E2E tests
      await prisma.$executeRaw`
        WITH program_ids AS (
          SELECT unnest(${existingProgramIds}::uuid[]) AS id
        ),
        workout_plan_ids AS (
          SELECT wp.id FROM workout_plans wp
          WHERE wp.program_id IN (SELECT id FROM program_ids)
        ),
        workout_ids AS (
          SELECT w.id FROM workouts w
          WHERE w.workout_plan_id IN (SELECT id FROM workout_plan_ids)
        ),
        deleted_exercises AS (
          DELETE FROM exercises
          WHERE workout_id IN (SELECT id FROM workout_ids)
          RETURNING id
        ),
        deleted_workouts AS (
          DELETE FROM workouts
          WHERE id IN (SELECT id FROM workout_ids)
          RETURNING id
        )
        DELETE FROM workout_plans
        WHERE id IN (SELECT id FROM workout_plan_ids)
      `;

      // 3.5. Delete NutritionPlans tied to these programs (and standalone for this user)
      await prisma.nutritionPlan.deleteMany({
        where: {
          OR: [
            { programId: { in: existingProgramIds } },
            { userId: user.id },
          ],
        },
      });

      // 3.6. Delete Goal for this user
      await prisma.goal.deleteMany({
        where: { userId: user.id },
      });

      // 4. Now safe to delete Programs
      await prisma.program.deleteMany({
        where: { userId: user.id },
      });
    }

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

    // 5. Upsert Milestones (use upsert to handle parallel test execution)
    if (persona.milestones) {
      for (const milestoneSeed of persona.milestones) {
        const milestoneData = {
          earnedAt: new Date(Date.now() - milestoneSeed.earnedAtDaysAgo * 24 * 60 * 60 * 1000),
          totalWorkouts: milestoneSeed.totalWorkouts,
          totalVolume: milestoneSeed.totalVolume,
        };
        await prisma.milestoneAchievement.upsert({
          where: {
            userId_type: {
              userId: user.id,
              type: milestoneSeed.type,
            },
          },
          update: milestoneData,
          create: {
            userId: user.id,
            type: milestoneSeed.type,
            ...milestoneData,
          },
        });
      }
    }

    console.log(`    ✓ ${persona.id} seeded successfully`);
  }

  console.log(`Personas: ${personas.length} personas seeded`);
}

/**
 * Seed special users (admin, coach) for development
 */
async function seedSpecialUsers() {
  console.log('Seeding special users...');

  // Admin user
  await prisma.user.upsert({
    where: { email: 'johnblythe@gmail.com' },
    update: {
      name: 'John Blythe',
      isPremium: true,
    },
    create: {
      email: 'johnblythe@gmail.com',
      name: 'John Blythe',
      isPremium: true,
    },
  });
  console.log('  ✓ Admin user (johnblythe@gmail.com)');

  // Coach user
  await prisma.user.upsert({
    where: { email: 'johnblythe+coach@gmail.com' },
    update: {
      name: 'Coach John',
      isPremium: true,
      isCoach: true,
      coachType: 'pro',
      coachTier: 'YOKED',
      inviteSlug: 'coach-john',
      brandName: 'Coach John Fitness',
      coachOnboardedAt: new Date(),
    },
    create: {
      email: 'johnblythe+coach@gmail.com',
      name: 'Coach John',
      isPremium: true,
      isCoach: true,
      coachType: 'pro',
      coachTier: 'YOKED',
      inviteSlug: 'coach-john',
      brandName: 'Coach John Fitness',
      coachOnboardedAt: new Date(),
    },
  });
  console.log('  ✓ Coach user (johnblythe+coach@gmail.com)');
}

/**
 * Seed starter quick foods for all users
 * These are common foods that appear until users build their own patterns
 * USDA-sourced macros for accuracy
 */
async function seedStarterQuickFoods() {
  console.log('Seeding starter quick foods...');

  // 10 common starter foods with USDA-sourced macros
  const starterFoods = [
    {
      name: 'Eggs',
      emoji: '🥚',
      servingSize: 1,
      servingUnit: 'large',
      calories: 72,
      protein: 6.3,
      carbs: 0.4,
      fat: 4.8,
      fdcId: '748967', // USDA FDC ID for egg, whole, raw
    },
    {
      name: 'Chicken breast',
      emoji: '🍗',
      servingSize: 170,
      servingUnit: 'g',
      calories: 280,
      protein: 52.0,
      carbs: 0,
      fat: 6.1,
      fdcId: '171077', // Chicken breast, boneless, skinless, raw
    },
    {
      name: 'White rice',
      emoji: '🍚',
      servingSize: 1,
      servingUnit: 'cup cooked',
      calories: 206,
      protein: 4.3,
      carbs: 44.5,
      fat: 0.4,
      fdcId: '169756', // Rice, white, long-grain, cooked
    },
    {
      name: 'Oatmeal',
      emoji: '🥣',
      servingSize: 1,
      servingUnit: 'cup cooked',
      calories: 166,
      protein: 5.9,
      carbs: 28.0,
      fat: 3.6,
      fdcId: '172839', // Oats, regular, cooked
    },
    {
      name: 'Banana',
      emoji: '🍌',
      servingSize: 1,
      servingUnit: 'medium',
      calories: 105,
      protein: 1.3,
      carbs: 27.0,
      fat: 0.4,
      fdcId: '173944', // Banana, raw
    },
    {
      name: 'Greek yogurt',
      emoji: '🥛',
      servingSize: 1,
      servingUnit: 'cup',
      calories: 100,
      protein: 17.0,
      carbs: 6.0,
      fat: 0.7,
      fdcId: '170903', // Yogurt, Greek, plain, nonfat
    },
    {
      name: 'Protein shake',
      emoji: '🥤',
      servingSize: 1,
      servingUnit: 'scoop',
      calories: 120,
      protein: 24.0,
      carbs: 3.0,
      fat: 1.5,
      fdcId: null, // Generic
    },
    {
      name: 'Salmon',
      emoji: '🐟',
      servingSize: 170,
      servingUnit: 'g',
      calories: 354,
      protein: 39.0,
      carbs: 0,
      fat: 21.0,
      fdcId: '175167', // Salmon, Atlantic, cooked
    },
    {
      name: 'Ground beef',
      emoji: '🥩',
      servingSize: 113,
      servingUnit: 'g',
      calories: 287,
      protein: 19.0,
      carbs: 0,
      fat: 23.0,
      fdcId: '174032', // Beef, ground, 80% lean, cooked
    },
    {
      name: 'Avocado',
      emoji: '🥑',
      servingSize: 0.5,
      servingUnit: 'medium',
      calories: 160,
      protein: 2.0,
      carbs: 8.5,
      fat: 14.7,
      fdcId: '171705', // Avocado, raw
    },
  ];

  // Get all users
  const users = await prisma.user.findMany({
    select: { id: true, email: true },
  });

  let usersSeeded = 0;

  for (const user of users) {
    // Check if user already has starter foods
    const existingStarters = await prisma.quickFood.count({
      where: {
        userId: user.id,
        isStarter: true,
      },
    });

    if (existingStarters > 0) {
      continue; // Skip if already seeded
    }

    // Seed starter foods for this user (sortOrder starts at 1000 so user foods sort first)
    for (let i = 0; i < starterFoods.length; i++) {
      const food = starterFoods[i];
      await prisma.quickFood.create({
        data: {
          userId: user.id,
          name: food.name,
          emoji: food.emoji,
          servingSize: food.servingSize,
          servingUnit: food.servingUnit,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fdcId: food.fdcId,
          sortOrder: 1000 + i, // High sortOrder so user foods appear first
          usageCount: 0,
          isStarter: true,
        },
      });
    }
    usersSeeded++;
  }

  console.log(`  ✓ Starter foods seeded for ${usersSeeded} users (${starterFoods.length} foods each)`);
}

async function main() {
  console.log('Starting database seed...\n');

  await seedExercises();
  await seedPersonas();
  await seedSpecialUsers();
  await seedStarterQuickFoods();

  console.log('\nSeed complete!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
