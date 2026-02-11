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

    const { parsed, isTemplate, clientId } = await request.json();

    if (!parsed) {
      return NextResponse.json({
        error: true,
        reason: 'Missing data',
        details: ['No parsed program data provided']
      }, { status: 400 });
    }

    // If clientId provided, verify coach-client relationship
    if (clientId) {
      const relationship = await prisma.coachClient.findFirst({
        where: { coachId: session.user.id, clientId, inviteStatus: 'ACCEPTED' },
      });
      if (!relationship) {
        return NextResponse.json({
          error: true,
          reason: 'Unauthorized',
          details: ['Client not found or not in your client list']
        }, { status: 403 });
      }
    }

    // For coach flow: don't set userId on the master program (it's a template/source)
    // For consumer flow: set userId to themselves
    const isCoachFlow = clientId || isTemplate;

    // Create the program in the database
    const savedProgram = await prisma.program.create({
      data: {
        name: parsed.program?.name || 'Imported Program',
        description: parsed.program?.description || '',
        createdBy: session.user.id,
        userId: isCoachFlow ? null : session.user.id,
        source: 'uploaded',
        active: isCoachFlow ? false : true,
        isTemplate: isTemplate || false,
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

    // For consumer flow: deactivate their other programs
    if (!isCoachFlow) {
      await prisma.program.updateMany({
        where: {
          userId: session.user.id,
          id: { not: savedProgram.id },
          active: true
        },
        data: { active: false }
      });
    }

    // If clientId provided, clone and assign to client
    let assignedProgramId: string | undefined;
    if (clientId) {
      // Deactivate client's existing programs
      await prisma.program.updateMany({
        where: { userId: clientId, active: true },
        data: { active: false },
      });

      const slug = `${savedProgram.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

      const clonedProgram = await prisma.program.create({
        data: {
          name: savedProgram.name,
          slug,
          description: savedProgram.description,
          createdBy: session.user.id,
          userId: clientId,
          active: true,
          source: 'assigned',
          isTemplate: false,
          clonedFromId: savedProgram.id,
          workoutPlans: {
            create: savedProgram.workoutPlans.map((plan) => ({
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
                    create: w.exercises.map((ex) => ({
                      name: ex.name,
                      sets: ex.sets,
                      reps: ex.reps,
                      restPeriod: ex.restPeriod,
                      intensity: ex.intensity,
                      measureType: ex.measureType,
                      measureValue: ex.measureValue,
                      measureUnit: ex.measureUnit,
                      notes: ex.notes,
                      sortOrder: ex.sortOrder,
                      exerciseLibraryId: ex.exerciseLibraryId,
                    })),
                  },
                })),
              },
            })),
          },
        },
      });

      // Increment clone count on source program
      await prisma.program.update({
        where: { id: savedProgram.id },
        data: { cloneCount: { increment: 1 } },
      });

      assignedProgramId = clonedProgram.id;
    }

    return NextResponse.json({
      success: true,
      program: savedProgram,
      assignedProgramId,
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
