import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({
        error: true,
        reason: 'Unauthorized',
        details: ['User must be authenticated to save programs']
      }, { status: 401 });
    }

    const { parsed } = await request.json();

    if (!parsed) {
      return NextResponse.json({
        error: true,
        reason: 'Missing data',
        details: ['No parsed program data provided']
      }, { status: 400 });
    }

    // Create the program in the database
    const savedProgram = await prisma.program.create({
      data: {
        name: parsed.program?.name || 'Imported Program',
        description: parsed.program?.description || '',
        createdBy: session.user.id,
        userId: session.user.id,
        source: 'uploaded',
        active: true,
        workoutPlans: {
          create: {
            phase: parsed.workoutPlan?.phase || 1,
            phaseExplanation: parsed.workoutPlan?.phaseExplanation || '',
            phaseExpectations: parsed.workoutPlan?.phaseExpectations || '',
            phaseKeyPoints: parsed.workoutPlan?.phaseKeyPoints || [],
            progressionProtocol: parsed.workoutPlan?.progressionProtocol || [],
            daysPerWeek: parsed.workouts?.length || parsed.workoutPlan?.daysPerWeek || 1,
            splitType: parsed.workoutPlan?.splitType || 'Custom',
            dailyCalories: 2000,
            proteinGrams: 150,
            carbGrams: 200,
            fatGrams: 70,
            user: {
              connect: {
                id: session.user.id
              }
            },
            workouts: {
              create: (parsed.workouts || []).map((workout: any) => ({
                name: workout.name || 'Workout',
                focus: workout.focus || '',
                dayNumber: workout.dayNumber || 1,
                warmup: workout.warmup || '',
                cooldown: workout.cooldown || '',
                exercises: {
                  create: (workout.exercises || []).map((exercise: any, exerciseIndex: number) => ({
                    name: exercise.name || 'Exercise',
                    sets: exercise.sets || 1,
                    reps: exercise.reps || (exercise.measure?.type === 'REPS' ? exercise.measure.value : null),
                    restPeriod: exercise.restPeriod || 60,
                    intensity: exercise.intensity || 0,
                    measureType: exercise.measure?.type || 'REPS',
                    measureValue: exercise.measure?.value || exercise.reps || 0,
                    measureUnit: exercise.measure?.unit,
                    sortOrder: exerciseIndex,
                    notes: exercise.notes || '',
                    exerciseLibrary: {
                      connectOrCreate: {
                        where: { name: exercise.name || 'Exercise' },
                        create: {
                          name: exercise.name || 'Exercise',
                          category: exercise.category || 'default',
                          difficulty: 'BEGINNER',
                          movementPattern: 'PUSH',
                          equipment: [],
                          targetMuscles: [],
                          secondaryMuscles: []
                        }
                      }
                    }
                  }))
                }
              }))
            }
          }
        }
      },
      include: {
        workoutPlans: {
          include: {
            workouts: {
              include: {
                exercises: { orderBy: { sortOrder: 'asc' } }
              }
            }
          }
        }
      }
    });

    // Deactivate other programs for this user
    await prisma.program.updateMany({
      where: {
        userId: session.user.id,
        id: { not: savedProgram.id },
        active: true
      },
      data: { active: false }
    });

    return NextResponse.json({
      success: true,
      program: savedProgram
    });

  } catch (error) {
    console.error('Error saving program:', error);
    return NextResponse.json({
      error: true,
      reason: 'Failed to save program',
      details: [error instanceof Error ? error.message : 'Unknown error']
    }, { status: 500 });
  }
}
