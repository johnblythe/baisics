'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
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

const CoachProgramSchema = z.object({
  name: z.string().min(1, 'Program name is required'),
  description: z.string().optional(),
  goal: z.string().optional(),
  daysPerWeek: z.number().int().min(1).max(7),
  workouts: z.array(WorkoutSchema).min(1, 'At least one workout is required'),
  isTemplate: z.boolean().optional(),
  clientId: z.string().uuid().optional().nullable(),
});

export type CoachProgramFormData = z.infer<typeof CoachProgramSchema>;

export async function createCoachProgram(data: CoachProgramFormData): Promise<{
  programId: string;
  assignedProgramId?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Authentication required');
  }

  const coachUserId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: coachUserId },
    select: { isCoach: true },
  });
  if (!user?.isCoach) {
    throw new Error('Coach access required');
  }

  const parsed = CoachProgramSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.flatten().formErrors.join(', ') || 'Invalid program data');
  }

  const { name, description, goal, daysPerWeek, workouts, isTemplate, clientId } = parsed.data;

  if (clientId) {
    const relationship = await prisma.coachClient.findFirst({
      where: { coachId: coachUserId, clientId, inviteStatus: 'ACCEPTED' },
    });
    if (!relationship) {
      throw new Error('Client not found or not in your client list');
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const program = await tx.program.create({
      data: {
        name,
        description: description || null,
        source: 'manual',
        createdBy: coachUserId,
        isTemplate: clientId ? false : (isTemplate !== false),
        active: false,
      },
    });

    const workoutPlan = await tx.workoutPlan.create({
      data: {
        userId: coachUserId,
        programId: program.id,
        phase: 1,
        daysPerWeek,
        splitType: goal || 'custom',
        phaseExplanation: 'Coach-created program',
        dailyCalories: 0,
        proteinGrams: 0,
        carbGrams: 0,
        fatGrams: 0,
      },
    });

    for (const workout of workouts) {
      const createdWorkout = await tx.workout.create({
        data: {
          name: workout.name,
          focus: workout.focus,
          dayNumber: workout.dayNumber,
          workoutPlanId: workoutPlan.id,
        },
      });

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

    let assignedProgramId: string | undefined;

    if (clientId) {
      const sourceProgram = await tx.program.findUnique({
        where: { id: program.id },
        include: {
          workoutPlans: {
            include: {
              workouts: { include: { exercises: true } },
            },
          },
        },
      });
      if (!sourceProgram) throw new Error('Failed to load created program for cloning');

      await tx.program.updateMany({
        where: { userId: clientId, active: true },
        data: { active: false },
      });

      const slug = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

      const clonedProgram = await tx.program.create({
        data: {
          name: sourceProgram.name,
          slug,
          description: sourceProgram.description,
          createdBy: coachUserId,
          userId: clientId,
          active: true,
          source: 'assigned',
          isTemplate: false,
          isPublic: false,
          clonedFromId: sourceProgram.id,
          category: sourceProgram.category,
          difficulty: sourceProgram.difficulty,
          durationWeeks: sourceProgram.durationWeeks,
          daysPerWeek: sourceProgram.daysPerWeek,
          equipment: sourceProgram.equipment,
          goals: sourceProgram.goals,
          tags: sourceProgram.tags,
          workoutPlans: {
            create: sourceProgram.workoutPlans.map((plan) => ({
              phase: plan.phase,
              phaseName: plan.phaseName,
              phaseDurationWeeks: plan.phaseDurationWeeks,
              daysPerWeek: plan.daysPerWeek,
              dailyCalories: plan.dailyCalories,
              proteinGrams: plan.proteinGrams,
              carbGrams: plan.carbGrams,
              fatGrams: plan.fatGrams,
              splitType: plan.splitType,
              phaseExplanation: plan.phaseExplanation,
              phaseExpectations: plan.phaseExpectations,
              phaseKeyPoints: plan.phaseKeyPoints,
              mealTiming: plan.mealTiming,
              progressionProtocol: plan.progressionProtocol,
              user: { connect: { id: clientId } },
              workouts: {
                create: plan.workouts.map((w) => ({
                  name: w.name,
                  dayNumber: w.dayNumber,
                  focus: w.focus,
                  warmup: w.warmup,
                  cooldown: w.cooldown,
                  exercises: {
                    create: w.exercises
                      .filter((ex) => ex.exerciseLibraryId)
                      .map((ex) => ({
                        name: ex.name,
                        sets: ex.sets,
                        reps: ex.reps,
                        restPeriod: ex.restPeriod,
                        intensity: ex.intensity,
                        measureType: ex.measureType,
                        measureValue: ex.measureValue,
                        measureUnit: ex.measureUnit,
                        notes: ex.notes,
                        instructions: ex.instructions,
                        sortOrder: ex.sortOrder,
                        exerciseLibrary: { connect: { id: ex.exerciseLibraryId! } },
                      })),
                  },
                })),
              },
            })),
          },
        },
      });

      await tx.program.update({
        where: { id: program.id },
        data: { cloneCount: { increment: 1 } },
      });

      assignedProgramId = clonedProgram.id;
    }

    return { programId: program.id, assignedProgramId };
  });

  return result;
}
