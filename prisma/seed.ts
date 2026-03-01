/**
 * Seed script for database
 * Run: npx prisma db seed
 *
 * Configure in package.json:
 * "prisma": { "seed": "npx tsx prisma/seed.ts" }
 */

import { PrismaClient, Difficulty, MovementPattern, MuscleGroup, ExerciseTier, SubscriptionStatus, MilestoneType, InviteStatus, MealType } from '@prisma/client';
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
  CoachClientSeed,
  CoachTemplateSeed,
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
        isCoach: persona.user.isCoach ?? false,
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
        isCoach: persona.user.isCoach ?? false,
        streakCurrent: persona.user.streakCurrent,
        streakLongest: persona.user.streakLongest,
        streakLastActivityAt: persona.user.streakLastActivityAt
          ? relativeDateToDate(persona.user.streakLastActivityAt)
          : null,
      },
    });

    // 2. Upsert UserIntake (optional for coaches)
    if (persona.intake) {
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
    }

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

    for (const programSeed of persona.programs || []) {
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

    // 7. Seed Coach-specific data (clients and templates)
    if (persona.user.isCoach) {
      // Seed coach templates
      if (persona.templates && persona.templates.length > 0) {
        for (const templateSeed of persona.templates) {
          const template = await prisma.program.create({
            data: {
              name: templateSeed.name,
              description: templateSeed.description,
              createdBy: user.id,
              userId: null, // Templates have no owner
              active: false,
              isTemplate: true,
              cloneCount: templateSeed.cloneCount ?? 0,
              category: templateSeed.category,
              difficulty: templateSeed.difficulty,
              durationWeeks: templateSeed.durationWeeks,
              daysPerWeek: templateSeed.daysPerWeek,
            },
          });

          // Create WorkoutPlan for template
          const workoutPlan = await prisma.workoutPlan.create({
            data: {
              programId: template.id,
              userId: user.id,
              daysPerWeek: templateSeed.workoutPlan.daysPerWeek,
              phase: templateSeed.workoutPlan.phase ?? 1,
              phaseName: templateSeed.workoutPlan.phaseName,
              splitType: templateSeed.workoutPlan.splitType,
              dailyCalories: templateSeed.workoutPlan.dailyCalories ?? 2000,
              proteinGrams: templateSeed.workoutPlan.proteinGrams ?? 150,
              carbGrams: templateSeed.workoutPlan.carbGrams ?? 200,
              fatGrams: templateSeed.workoutPlan.fatGrams ?? 70,
            },
          });

          // Create Workouts and Exercises for template
          for (const workoutSeed of templateSeed.workoutPlan.workouts) {
            const workout = await prisma.workout.create({
              data: {
                workoutPlanId: workoutPlan.id,
                name: workoutSeed.name,
                focus: workoutSeed.focus,
                dayNumber: workoutSeed.dayNumber,
                warmup: workoutSeed.warmup,
                cooldown: workoutSeed.cooldown,
              },
            });

            for (const exerciseSeed of workoutSeed.exercises) {
              const exerciseLib = await prisma.exerciseLibrary.findUnique({
                where: { name: exerciseSeed.name },
              });
              if (exerciseLib) {
                await prisma.exercise.create({
                  data: {
                    workoutId: workout.id,
                    exerciseLibraryId: exerciseLib.id,
                    name: exerciseSeed.name,
                    sets: exerciseSeed.sets,
                    reps: exerciseSeed.reps,
                    restPeriod: exerciseSeed.restPeriod,
                    sortOrder: exerciseSeed.sortOrder ?? 0,
                    notes: exerciseSeed.notes,
                  },
                });
              }
            }
          }
          console.log(`      Created template: ${template.name}`);
        }
      }

      // Seed coach-client relationships (clients must be seeded first)
      if (persona.clients && persona.clients.length > 0) {
        for (const clientSeed of persona.clients) {
          // Find the client user by email
          const clientUser = await prisma.user.findUnique({
            where: { email: clientSeed.clientEmail },
          });
          if (clientUser) {
            const inviteSentAt = new Date();
            inviteSentAt.setDate(inviteSentAt.getDate() - clientSeed.invitedAtDaysAgo);

            await prisma.coachClient.upsert({
              where: {
                coachId_clientId: {
                  coachId: user.id,
                  clientId: clientUser.id,
                },
              },
              update: {
                nickname: clientSeed.nickname,
                inviteStatus: clientSeed.inviteStatus as InviteStatus,
                inviteSentAt,
              },
              create: {
                coachId: user.id,
                clientId: clientUser.id,
                nickname: clientSeed.nickname,
                inviteStatus: clientSeed.inviteStatus as InviteStatus,
                inviteSentAt,
              },
            });
            console.log(`      Linked client: ${clientSeed.clientEmail} (${clientSeed.inviteStatus})`);
          } else {
            console.log(`      ⚠ Client not found: ${clientSeed.clientEmail}`);
          }
        }
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

/**
 * Seed persona-specific food data: recipes, quick foods, and food staples
 * for users who would realistically have food data (meticulous trackers, paid users)
 */
async function seedPersonaFoodData() {
  console.log('Seeding persona food data...');

  // ============ Data Definitions ============

  type RecipeSeed = {
    name: string;
    emoji?: string;
    servingSize: number;
    servingUnit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    ingredients: Array<{ name: string; amount: string; unit: string; calories: number; protein: number; carbs: number; fat: number }>;
    usageCount: number;
  };

  type QuickFoodSeed = {
    name: string;
    emoji?: string;
    brand?: string;
    servingSize: number;
    servingUnit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    usageCount: number;
    lastUsedDaysAgo?: number;
  };

  type FoodStapleSeed = {
    mealSlot: MealType;
    name: string;
    emoji?: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sortOrder: number;
  };

  type PersonaFoodData = {
    email: string;
    recipes: RecipeSeed[];
    quickFoods: QuickFoodSeed[];
    staples: FoodStapleSeed[];
  };

  // ---------- Marcus: Gym bro, meticulous tracker, protein-heavy ----------
  const marcusFoods: PersonaFoodData = {
    email: 'marcus@test.baisics.app',
    recipes: [
      {
        name: 'Chicken Rice Bowl',
        emoji: '🍗',
        servingSize: 1,
        servingUnit: 'bowl',
        calories: 520,
        protein: 48,
        carbs: 52,
        fat: 12,
        ingredients: [
          { name: 'Chicken breast', amount: '6', unit: 'oz', calories: 280, protein: 52, carbs: 0, fat: 6 },
          { name: 'White rice', amount: '1', unit: 'cup cooked', calories: 206, protein: 4, carbs: 45, fat: 0 },
          { name: 'Broccoli', amount: '1', unit: 'cup', calories: 34, protein: 3, carbs: 7, fat: 0 },
        ],
        usageCount: 14,
      },
      {
        name: 'Protein Oatmeal',
        emoji: '🥣',
        servingSize: 1,
        servingUnit: 'bowl',
        calories: 440,
        protein: 38,
        carbs: 48,
        fat: 12,
        ingredients: [
          { name: 'Oats', amount: '1', unit: 'cup dry', calories: 300, protein: 10, carbs: 54, fat: 5 },
          { name: 'Whey protein', amount: '1', unit: 'scoop', calories: 120, protein: 24, carbs: 3, fat: 2 },
          { name: 'Banana', amount: '0.5', unit: 'medium', calories: 53, protein: 1, carbs: 14, fat: 0 },
          { name: 'Peanut butter', amount: '1', unit: 'tbsp', calories: 95, protein: 4, carbs: 3, fat: 8 },
        ],
        usageCount: 18,
      },
      {
        name: 'Ground Turkey Stir Fry',
        emoji: '🥘',
        servingSize: 1,
        servingUnit: 'plate',
        calories: 480,
        protein: 42,
        carbs: 38,
        fat: 16,
        ingredients: [
          { name: 'Ground turkey 93/7', amount: '6', unit: 'oz', calories: 240, protein: 38, carbs: 0, fat: 10 },
          { name: 'Mixed vegetables', amount: '2', unit: 'cups', calories: 80, protein: 4, carbs: 16, fat: 0 },
          { name: 'Jasmine rice', amount: '0.75', unit: 'cup cooked', calories: 155, protein: 3, carbs: 34, fat: 0 },
          { name: 'Soy sauce', amount: '1', unit: 'tbsp', calories: 10, protein: 1, carbs: 1, fat: 0 },
          { name: 'Sesame oil', amount: '1', unit: 'tsp', calories: 40, protein: 0, carbs: 0, fat: 5 },
        ],
        usageCount: 9,
      },
      {
        name: 'Post-Workout Shake',
        emoji: '🥤',
        servingSize: 1,
        servingUnit: 'shake',
        calories: 380,
        protein: 50,
        carbs: 40,
        fat: 4,
        ingredients: [
          { name: 'Whey protein', amount: '2', unit: 'scoops', calories: 240, protein: 48, carbs: 6, fat: 3 },
          { name: 'Banana', amount: '1', unit: 'medium', calories: 105, protein: 1, carbs: 27, fat: 0 },
          { name: 'Skim milk', amount: '8', unit: 'oz', calories: 80, protein: 8, carbs: 12, fat: 0 },
        ],
        usageCount: 20,
      },
      {
        name: 'Beef and Sweet Potato',
        emoji: '🥩',
        servingSize: 1,
        servingUnit: 'plate',
        calories: 560,
        protein: 44,
        carbs: 48,
        fat: 20,
        ingredients: [
          { name: 'Ground beef 90/10', amount: '6', unit: 'oz', calories: 340, protein: 40, carbs: 0, fat: 18 },
          { name: 'Sweet potato', amount: '1', unit: 'medium', calories: 115, protein: 2, carbs: 27, fat: 0 },
          { name: 'Green beans', amount: '1', unit: 'cup', calories: 35, protein: 2, carbs: 8, fat: 0 },
          { name: 'Olive oil', amount: '0.5', unit: 'tbsp', calories: 60, protein: 0, carbs: 0, fat: 7 },
        ],
        usageCount: 7,
      },
    ],
    quickFoods: [
      { name: 'Whey Protein Shake', emoji: '🥤', brand: 'Optimum Nutrition', servingSize: 1, servingUnit: 'scoop', calories: 120, protein: 24, carbs: 3, fat: 1.5, usageCount: 22, lastUsedDaysAgo: 0 },
      { name: 'Greek Yogurt', emoji: '🥛', brand: 'Fage 0%', servingSize: 1, servingUnit: 'cup', calories: 100, protein: 18, carbs: 6, fat: 0, usageCount: 15, lastUsedDaysAgo: 1 },
      { name: 'Hard Boiled Eggs', emoji: '🥚', servingSize: 3, servingUnit: 'eggs', calories: 216, protein: 19, carbs: 1, fat: 15, usageCount: 12, lastUsedDaysAgo: 0 },
      { name: 'Almonds', emoji: '🥜', servingSize: 1, servingUnit: 'oz (23 nuts)', calories: 164, protein: 6, carbs: 6, fat: 14, usageCount: 8, lastUsedDaysAgo: 2 },
      { name: 'Rice Cakes + PB', emoji: '🍘', servingSize: 2, servingUnit: 'cakes', calories: 260, protein: 8, carbs: 30, fat: 12, usageCount: 6, lastUsedDaysAgo: 3 },
    ],
    staples: [
      { mealSlot: 'BREAKFAST', name: 'Protein Oatmeal', emoji: '🥣', calories: 440, protein: 38, carbs: 48, fat: 12, sortOrder: 0 },
      { mealSlot: 'SNACK', name: 'Whey Protein Shake', emoji: '🥤', calories: 120, protein: 24, carbs: 3, fat: 1.5, sortOrder: 0 },
      { mealSlot: 'DINNER', name: 'Chicken Rice Bowl', emoji: '🍗', calories: 520, protein: 48, carbs: 52, fat: 12, sortOrder: 0 },
    ],
  };

  // ---------- Priya: Weight loss, calorie-conscious, consistent tracker ----------
  const priyaFoods: PersonaFoodData = {
    email: 'priya@test.baisics.app',
    recipes: [
      {
        name: 'Greek Salad with Grilled Chicken',
        emoji: '🥗',
        servingSize: 1,
        servingUnit: 'bowl',
        calories: 380,
        protein: 38,
        carbs: 14,
        fat: 18,
        ingredients: [
          { name: 'Chicken breast grilled', amount: '5', unit: 'oz', calories: 230, protein: 35, carbs: 0, fat: 5 },
          { name: 'Mixed greens', amount: '3', unit: 'cups', calories: 20, protein: 2, carbs: 4, fat: 0 },
          { name: 'Cucumber', amount: '0.5', unit: 'cup', calories: 8, protein: 0, carbs: 2, fat: 0 },
          { name: 'Cherry tomatoes', amount: '0.5', unit: 'cup', calories: 15, protein: 1, carbs: 3, fat: 0 },
          { name: 'Feta cheese', amount: '1', unit: 'oz', calories: 75, protein: 4, carbs: 1, fat: 6 },
          { name: 'Olive oil dressing', amount: '1', unit: 'tbsp', calories: 72, protein: 0, carbs: 0, fat: 8 },
        ],
        usageCount: 16,
      },
      {
        name: 'Turkey Lettuce Wraps',
        emoji: '🥬',
        servingSize: 3,
        servingUnit: 'wraps',
        calories: 310,
        protein: 32,
        carbs: 12,
        fat: 14,
        ingredients: [
          { name: 'Ground turkey 99% lean', amount: '5', unit: 'oz', calories: 175, protein: 30, carbs: 0, fat: 5 },
          { name: 'Butter lettuce leaves', amount: '3', unit: 'large', calories: 5, protein: 1, carbs: 1, fat: 0 },
          { name: 'Diced tomato', amount: '0.25', unit: 'cup', calories: 8, protein: 0, carbs: 2, fat: 0 },
          { name: 'Avocado', amount: '0.25', unit: 'medium', calories: 80, protein: 1, carbs: 4, fat: 7 },
          { name: 'Salsa', amount: '2', unit: 'tbsp', calories: 10, protein: 0, carbs: 2, fat: 0 },
        ],
        usageCount: 10,
      },
      {
        name: 'Egg White Veggie Scramble',
        emoji: '🍳',
        servingSize: 1,
        servingUnit: 'plate',
        calories: 220,
        protein: 28,
        carbs: 10,
        fat: 8,
        ingredients: [
          { name: 'Egg whites', amount: '6', unit: 'large', calories: 102, protein: 22, carbs: 1, fat: 0 },
          { name: 'Whole egg', amount: '1', unit: 'large', calories: 72, protein: 6, carbs: 0, fat: 5 },
          { name: 'Spinach', amount: '1', unit: 'cup', calories: 7, protein: 1, carbs: 1, fat: 0 },
          { name: 'Bell pepper', amount: '0.5', unit: 'cup diced', calories: 15, protein: 1, carbs: 3, fat: 0 },
          { name: 'Mushrooms', amount: '0.5', unit: 'cup', calories: 8, protein: 1, carbs: 1, fat: 0 },
          { name: 'Cooking spray', amount: '1', unit: 'spray', calories: 5, protein: 0, carbs: 0, fat: 1 },
        ],
        usageCount: 12,
      },
      {
        name: 'Zucchini Noodle Shrimp Bowl',
        emoji: '🍤',
        servingSize: 1,
        servingUnit: 'bowl',
        calories: 290,
        protein: 34,
        carbs: 16,
        fat: 10,
        ingredients: [
          { name: 'Shrimp', amount: '6', unit: 'oz', calories: 170, protein: 32, carbs: 1, fat: 3 },
          { name: 'Zucchini noodles', amount: '2', unit: 'cups', calories: 40, protein: 3, carbs: 7, fat: 1 },
          { name: 'Cherry tomatoes', amount: '0.5', unit: 'cup', calories: 15, protein: 1, carbs: 3, fat: 0 },
          { name: 'Garlic', amount: '2', unit: 'cloves', calories: 10, protein: 0, carbs: 2, fat: 0 },
          { name: 'Olive oil', amount: '1', unit: 'tsp', calories: 40, protein: 0, carbs: 0, fat: 5 },
          { name: 'Lemon juice', amount: '1', unit: 'tbsp', calories: 4, protein: 0, carbs: 1, fat: 0 },
        ],
        usageCount: 7,
      },
    ],
    quickFoods: [
      { name: 'Protein Bar', emoji: '🍫', brand: 'Quest', servingSize: 1, servingUnit: 'bar', calories: 190, protein: 21, carbs: 21, fat: 7, usageCount: 18, lastUsedDaysAgo: 1 },
      { name: 'Apple + Almond Butter', emoji: '🍎', servingSize: 1, servingUnit: 'apple + 1 tbsp', calories: 195, protein: 4, carbs: 30, fat: 9, usageCount: 11, lastUsedDaysAgo: 0 },
      { name: 'Cottage Cheese', emoji: '🧀', brand: 'Good Culture', servingSize: 1, servingUnit: 'cup', calories: 120, protein: 20, carbs: 5, fat: 2.5, usageCount: 14, lastUsedDaysAgo: 1 },
      { name: 'Turkey Jerky', emoji: '🥩', brand: 'Chomps', servingSize: 1, servingUnit: 'stick', calories: 100, protein: 10, carbs: 2, fat: 6, usageCount: 8, lastUsedDaysAgo: 3 },
      { name: 'Rice Cake', emoji: '🍘', servingSize: 1, servingUnit: 'cake', calories: 35, protein: 1, carbs: 7, fat: 0, usageCount: 10, lastUsedDaysAgo: 2 },
    ],
    staples: [
      { mealSlot: 'BREAKFAST', name: 'Egg White Veggie Scramble', emoji: '🍳', calories: 220, protein: 28, carbs: 10, fat: 8, sortOrder: 0 },
      { mealSlot: 'LUNCH', name: 'Greek Salad with Grilled Chicken', emoji: '🥗', calories: 380, protein: 38, carbs: 14, fat: 18, sortOrder: 0 },
      { mealSlot: 'SNACK', name: 'Cottage Cheese', emoji: '🧀', calories: 120, protein: 20, carbs: 5, fat: 2.5, sortOrder: 0 },
    ],
  };

  // ---------- Derek: Veteran, former athlete, varied diet ----------
  const derekFoods: PersonaFoodData = {
    email: 'derek@test.baisics.app',
    recipes: [
      {
        name: 'Steak and Eggs Breakfast',
        emoji: '🥩',
        servingSize: 1,
        servingUnit: 'plate',
        calories: 620,
        protein: 52,
        carbs: 4,
        fat: 42,
        ingredients: [
          { name: 'Sirloin steak', amount: '6', unit: 'oz', calories: 340, protein: 40, carbs: 0, fat: 18 },
          { name: 'Whole eggs', amount: '3', unit: 'large', calories: 216, protein: 19, carbs: 1, fat: 15 },
          { name: 'Butter', amount: '1', unit: 'tbsp', calories: 100, protein: 0, carbs: 0, fat: 11 },
          { name: 'Salt & pepper', amount: '1', unit: 'pinch', calories: 0, protein: 0, carbs: 0, fat: 0 },
        ],
        usageCount: 8,
      },
      {
        name: 'Salmon Rice Bowl',
        emoji: '🐟',
        servingSize: 1,
        servingUnit: 'bowl',
        calories: 580,
        protein: 42,
        carbs: 52,
        fat: 22,
        ingredients: [
          { name: 'Salmon fillet', amount: '6', unit: 'oz', calories: 354, protein: 39, carbs: 0, fat: 21 },
          { name: 'Brown rice', amount: '1', unit: 'cup cooked', calories: 216, protein: 5, carbs: 45, fat: 2 },
          { name: 'Edamame', amount: '0.5', unit: 'cup', calories: 95, protein: 9, carbs: 7, fat: 4 },
          { name: 'Soy sauce', amount: '1', unit: 'tbsp', calories: 10, protein: 1, carbs: 1, fat: 0 },
        ],
        usageCount: 6,
      },
      {
        name: 'Turkey Chili',
        emoji: '🌶️',
        servingSize: 1.5,
        servingUnit: 'cups',
        calories: 420,
        protein: 38,
        carbs: 36,
        fat: 14,
        ingredients: [
          { name: 'Ground turkey', amount: '6', unit: 'oz', calories: 240, protein: 34, carbs: 0, fat: 10 },
          { name: 'Kidney beans', amount: '0.5', unit: 'cup', calories: 110, protein: 8, carbs: 20, fat: 0 },
          { name: 'Diced tomatoes', amount: '0.5', unit: 'cup', calories: 25, protein: 1, carbs: 6, fat: 0 },
          { name: 'Onion', amount: '0.25', unit: 'cup diced', calories: 16, protein: 0, carbs: 4, fat: 0 },
          { name: 'Chili powder & cumin', amount: '1', unit: 'tbsp each', calories: 20, protein: 1, carbs: 3, fat: 1 },
          { name: 'Olive oil', amount: '0.5', unit: 'tbsp', calories: 60, protein: 0, carbs: 0, fat: 7 },
        ],
        usageCount: 5,
      },
      {
        name: 'BBQ Chicken Wrap',
        emoji: '🌯',
        servingSize: 1,
        servingUnit: 'wrap',
        calories: 490,
        protein: 40,
        carbs: 44,
        fat: 16,
        ingredients: [
          { name: 'Chicken breast grilled', amount: '5', unit: 'oz', calories: 230, protein: 35, carbs: 0, fat: 5 },
          { name: 'Large flour tortilla', amount: '1', unit: 'tortilla', calories: 160, protein: 4, carbs: 28, fat: 4 },
          { name: 'BBQ sauce', amount: '2', unit: 'tbsp', calories: 60, protein: 0, carbs: 14, fat: 0 },
          { name: 'Coleslaw mix', amount: '0.5', unit: 'cup', calories: 15, protein: 1, carbs: 3, fat: 0 },
          { name: 'Ranch dressing', amount: '1', unit: 'tbsp', calories: 65, protein: 0, carbs: 1, fat: 7 },
        ],
        usageCount: 4,
      },
      {
        name: 'Peanut Butter Banana Smoothie',
        emoji: '🥜',
        servingSize: 1,
        servingUnit: 'smoothie',
        calories: 450,
        protein: 34,
        carbs: 48,
        fat: 16,
        ingredients: [
          { name: 'Whey protein', amount: '1', unit: 'scoop', calories: 120, protein: 24, carbs: 3, fat: 2 },
          { name: 'Banana', amount: '1', unit: 'medium', calories: 105, protein: 1, carbs: 27, fat: 0 },
          { name: 'Peanut butter', amount: '2', unit: 'tbsp', calories: 190, protein: 8, carbs: 6, fat: 16 },
          { name: 'Whole milk', amount: '8', unit: 'oz', calories: 150, protein: 8, carbs: 12, fat: 8 },
        ],
        usageCount: 11,
      },
    ],
    quickFoods: [
      { name: 'Beef Jerky', emoji: '🥩', brand: 'Jack Links', servingSize: 1, servingUnit: 'oz', calories: 80, protein: 10, carbs: 5, fat: 2, usageCount: 9, lastUsedDaysAgo: 1 },
      { name: 'Protein Shake', emoji: '🥤', brand: 'Dymatize ISO100', servingSize: 1, servingUnit: 'scoop', calories: 120, protein: 25, carbs: 2, fat: 0.5, usageCount: 16, lastUsedDaysAgo: 0 },
      { name: 'Trail Mix', emoji: '🥜', servingSize: 0.25, servingUnit: 'cup', calories: 175, protein: 5, carbs: 16, fat: 11, usageCount: 7, lastUsedDaysAgo: 2 },
      { name: 'String Cheese', emoji: '🧀', servingSize: 2, servingUnit: 'sticks', calories: 160, protein: 14, carbs: 2, fat: 10, usageCount: 10, lastUsedDaysAgo: 1 },
      { name: 'Banana', emoji: '🍌', servingSize: 1, servingUnit: 'medium', calories: 105, protein: 1, carbs: 27, fat: 0, usageCount: 13, lastUsedDaysAgo: 0 },
    ],
    staples: [
      { mealSlot: 'BREAKFAST', name: 'Steak and Eggs Breakfast', emoji: '🥩', calories: 620, protein: 52, carbs: 4, fat: 42, sortOrder: 0 },
      { mealSlot: 'LUNCH', name: 'BBQ Chicken Wrap', emoji: '🌯', calories: 490, protein: 40, carbs: 44, fat: 16, sortOrder: 0 },
      { mealSlot: 'SNACK', name: 'Protein Shake', emoji: '🥤', calories: 120, protein: 25, carbs: 2, fat: 0.5, sortOrder: 0 },
    ],
  };

  // ============ Seed Loop ============

  const allPersonaFoods = [marcusFoods, priyaFoods, derekFoods];

  for (const personaFood of allPersonaFoods) {
    const user = await prisma.user.findUnique({
      where: { email: personaFood.email },
    });

    if (!user) {
      console.log(`  Skipping ${personaFood.email} - user not found`);
      continue;
    }

    // Clean up existing non-starter food data for this user
    await prisma.foodStaple.deleteMany({ where: { userId: user.id } });
    await prisma.quickFood.deleteMany({ where: { userId: user.id, isStarter: false } });
    await prisma.recipe.deleteMany({ where: { userId: user.id } });

    // --- Recipes ---
    const recipeIdsByName: Map<string, string> = new Map();
    for (const recipeSeed of personaFood.recipes) {
      const recipe = await prisma.recipe.create({
        data: {
          userId: user.id,
          name: recipeSeed.name,
          emoji: recipeSeed.emoji,
          servingSize: recipeSeed.servingSize,
          servingUnit: recipeSeed.servingUnit,
          calories: recipeSeed.calories,
          protein: recipeSeed.protein,
          carbs: recipeSeed.carbs,
          fat: recipeSeed.fat,
          ingredients: recipeSeed.ingredients,
          usageCount: recipeSeed.usageCount,
        },
      });
      recipeIdsByName.set(recipeSeed.name, recipe.id);
    }

    // --- Quick Foods (user-created, non-starter) ---
    const quickFoodIdsByName: Map<string, string> = new Map();
    for (let i = 0; i < personaFood.quickFoods.length; i++) {
      const qfSeed = personaFood.quickFoods[i];
      const quickFood = await prisma.quickFood.create({
        data: {
          userId: user.id,
          name: qfSeed.name,
          emoji: qfSeed.emoji,
          brand: qfSeed.brand,
          servingSize: qfSeed.servingSize,
          servingUnit: qfSeed.servingUnit,
          calories: qfSeed.calories,
          protein: qfSeed.protein,
          carbs: qfSeed.carbs,
          fat: qfSeed.fat,
          sortOrder: i,
          usageCount: qfSeed.usageCount,
          isStarter: false,
          lastUsedAt: qfSeed.lastUsedDaysAgo !== undefined
            ? new Date(Date.now() - qfSeed.lastUsedDaysAgo * 24 * 60 * 60 * 1000)
            : null,
        },
      });
      quickFoodIdsByName.set(qfSeed.name, quickFood.id);
    }

    // --- Food Staples ---
    for (const stapleSeed of personaFood.staples) {
      // Try to link to recipe or quick food by name match
      const recipeId = recipeIdsByName.get(stapleSeed.name) ?? null;
      const quickFoodId = !recipeId ? (quickFoodIdsByName.get(stapleSeed.name) ?? null) : null;

      await prisma.foodStaple.create({
        data: {
          userId: user.id,
          mealSlot: stapleSeed.mealSlot,
          name: stapleSeed.name,
          emoji: stapleSeed.emoji,
          calories: stapleSeed.calories,
          protein: stapleSeed.protein,
          carbs: stapleSeed.carbs,
          fat: stapleSeed.fat,
          recipeId,
          quickFoodId,
          sortOrder: stapleSeed.sortOrder,
        },
      });
    }

    console.log(`  ✓ ${personaFood.email}: ${personaFood.recipes.length} recipes, ${personaFood.quickFoods.length} quick foods, ${personaFood.staples.length} staples`);
  }

  console.log('Persona food data seeded');
}

async function main() {
  console.log('Starting database seed...\n');

  await seedExercises();
  await seedPersonas();
  await seedSpecialUsers();
  await seedStarterQuickFoods();
  await seedPersonaFoodData();

  console.log('\nSeed complete!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
