import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import type { SaveProgramRequest } from '@/types/program';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = (await request.json()) as SaveProgramRequest;
    const { program, startDate } = body;

    // Create the program
    const savedProgram = await prisma.program.create({
      data: {
        name: program.programName,
        description: program.programDescription,
        createdBy: userId,
        source: 'ai',
        workoutPlans: {
          create: program.phases.map((phase) => ({
            userId,
            phase: phase.phase,
            phaseExplanation: `Phase ${phase.phase} - ${phase.durationWeeks} weeks`,
            phaseExpectations: 'Follow the program as prescribed, tracking your progress',
            phaseKeyPoints: phase.progressionProtocol,
            daysPerWeek: phase.trainingPlan.daysPerWeek,
            dailyCalories: phase.nutrition.dailyCalories,
            proteinGrams: phase.nutrition.macros.protein,
            carbGrams: phase.nutrition.macros.carbs,
            fatGrams: phase.nutrition.macros.fats,
            mealTiming: phase.nutrition.mealTiming || [],
            progressionProtocol: phase.progressionProtocol,
            workouts: {
              create: phase.trainingPlan.workouts.map((workout) => ({
                name: workout.name || '',
                focus: workout.focus || '',
                dayNumber: workout.dayNumber,
                warmup: workout.warmup?.activities.join(', ') || '',
                cooldown: workout.cooldown?.activities.join(', ') || '',
                exercises: {
                  create: workout.exercises.map((exercise) => ({
                    name: exercise.name,
                    sets: exercise.sets,
                    reps: typeof exercise.measure.value === 'number' ? exercise.measure.value : null,
                    measureType: exercise.measure.type.toUpperCase(),
                    measureValue: exercise.measure.value,
                    measureUnit: exercise.measure.unit,
                    restPeriod: exercise.restPeriod,
                    notes: exercise.notes,
                  })),
                },
              })),
            },
          })),
        },
      },
      include: {
        workoutPlans: {
          include: {
            workouts: {
              include: {
                exercises: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(savedProgram);
  } catch (error) {
    console.error('Error saving program:', error);
    return NextResponse.json(
      { error: 'Failed to save program' },
      { status: 500 }
    );
  }
} 