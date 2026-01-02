'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const ExerciseSchema = z.object({
  exerciseLibraryId: z.string().uuid(),
  name: z.string().min(1),
  sets: z.number().int().min(1).max(20),
  measureType: z.enum(['REPS', 'TIME', 'DISTANCE']),
  measureValue: z.number().min(1),
  restPeriod: z.number().int().min(0).max(600).optional(),
  sortOrder: z.number().int(),
});

const WorkoutSchema = z.object({
  name: z.string().min(1),
  focus: z.string().min(1),
  dayNumber: z.number().int().min(1),
  exercises: z.array(ExerciseSchema).min(1),
});

const ProgramSchema = z.object({
  name: z.string().min(1, 'Program name is required'),
  description: z.string().optional(),
  goal: z.string().optional(),
  daysPerWeek: z.number().int().min(1).max(7),
  workouts: z.array(WorkoutSchema).min(1, 'At least one workout is required'),
});

export type ProgramFormData = z.infer<typeof ProgramSchema>;
export type WorkoutFormData = z.infer<typeof WorkoutSchema>;
export type ExerciseFormData = z.infer<typeof ExerciseSchema>;

export async function createManualProgram(data: ProgramFormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Authentication required');
  }

  const userId = session.user.id;

  // Validate input
  const parsed = ProgramSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  const { name, description, goal, daysPerWeek, workouts } = parsed.data;

  let programId: string | null = null;

  try {
    // Create program with nested workoutPlan, workouts, and exercises in transaction
    const program = await prisma.$transaction(async (tx) => {
      // Create Program
      const prog = await tx.program.create({
        data: {
          name,
          description: description || null,
          source: 'manual',
          createdBy: userId,
        },
      });

      // Create WorkoutPlan (single phase for MVP)
      const workoutPlan = await tx.workoutPlan.create({
        data: {
          userId,
          programId: prog.id,
          phase: 1,
          daysPerWeek,
          splitType: goal || 'custom',
          phaseExplanation: 'Manually created program',
          dailyCalories: 0,
          proteinGrams: 0,
          carbGrams: 0,
          fatGrams: 0,
        },
      });

      // Create Workouts and Exercises
      for (const workout of workouts) {
        const createdWorkout = await tx.workout.create({
          data: {
            name: workout.name,
            focus: workout.focus,
            dayNumber: workout.dayNumber,
            workoutPlanId: workoutPlan.id,
          },
        });

        // Create exercises for this workout
        for (const exercise of workout.exercises) {
          await tx.exercise.create({
            data: {
              name: exercise.name,
              sets: exercise.sets,
              measureType: exercise.measureType,
              measureValue: exercise.measureValue,
              restPeriod: exercise.restPeriod || 60,
              sortOrder: exercise.sortOrder,
              workoutId: createdWorkout.id,
              exerciseLibraryId: exercise.exerciseLibraryId,
            },
          });
        }
      }

      return prog;
    });

    programId = program.id;
  } catch (error) {
    console.error('Failed to create program:', error);
    return { error: { formErrors: ['Failed to create program. Please try again.'], fieldErrors: {} } };
  }

  // Redirect outside try/catch - redirect() throws NEXT_REDIRECT internally
  revalidatePath('/dashboard');
  redirect(`/program/${programId}`);
}

export async function searchExercises(query: string, limit = 20) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Authentication required');
  }

  if (!query || query.length < 2) {
    return [];
  }

  // Sanitize and limit query length
  const sanitizedQuery = query.trim().slice(0, 100);

  try {
    const exercises = await prisma.exerciseLibrary.findMany({
      where: {
        name: { contains: sanitizedQuery, mode: 'insensitive' },
      },
      select: {
        id: true,
        name: true,
        category: true,
        equipment: true,
        targetMuscles: true,
      },
      take: limit,
      orderBy: { name: 'asc' },
    });

    return exercises;
  } catch (error) {
    console.error('Exercise search failed:', {
      query: sanitizedQuery,
      error: error instanceof Error ? error.message : error,
    });
    throw new Error('Unable to search exercises. Please try again.');
  }
}
