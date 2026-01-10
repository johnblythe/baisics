import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ programId: string }> }
) {
  const { programId } = await params;
  
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const program = await prisma.program.findFirst({
      where: { 
        id: programId,
        createdBy: session.user.id,
      },
      include: {
        workoutPlans: {
          include: {
            workouts: {
              orderBy: {
                dayNumber: 'asc',
              },
              include: {
                exercises: { orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        },
        workoutLogs: {
          where: {
            status: 'completed',
          },
          orderBy: {
            completedAt: 'desc',
          },
          take: 1, // We only need the most recent one
        },
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Get the ordered sequence of workouts
    const workoutSequence = program.workoutPlans[0]?.workouts || [];
    if (workoutSequence.length === 0) {
      return NextResponse.json({ error: 'No workouts found in program' }, { status: 404 });
    }

    // Get the most recently completed workout
    const lastWorkoutLog = program.workoutLogs[0];

    // Find the index of the last completed workout in our sequence
    const lastWorkoutIndex = lastWorkoutLog
      ? workoutSequence.findIndex(w => w.id === lastWorkoutLog.workoutId)
      : -1;

    // Get the next workout in the sequence (loop back to start if needed)
    const nextWorkoutIndex = lastWorkoutIndex === -1
      ? 0 // Start with first workout if no logs exist
      : (lastWorkoutIndex + 1) % workoutSequence.length; // Loop back to 0 if we hit the end

    const nextWorkout = workoutSequence[nextWorkoutIndex];

    // Get most recent completion date for each workout
    const workoutCompletions = await prisma.workoutLog.groupBy({
      by: ['workoutId'],
      where: {
        programId,
        status: 'completed',
      },
      _max: {
        completedAt: true,
      },
    });

    // Create a map of workoutId -> lastCompletedAt
    const completionMap = new Map(
      workoutCompletions.map(wc => [wc.workoutId, wc._max.completedAt])
    );

    // Build allWorkouts array with completion info
    const allWorkouts = workoutSequence.map(workout => ({
      id: workout.id,
      dayNumber: workout.dayNumber,
      name: workout.name,
      focus: workout.focus,
      exerciseCount: workout.exercises.length,
      lastCompletedAt: completionMap.get(workout.id) || null,
    }));

    return NextResponse.json({
      nextWorkout: {
        id: nextWorkout.id,
        name: nextWorkout.name,
        dayNumber: nextWorkout.dayNumber,
        focus: nextWorkout.focus,
        exerciseCount: nextWorkout.exercises.length
      },
      totalWorkouts: workoutSequence.length,
      lastCompletedAt: lastWorkoutLog?.completedAt || null,
      allWorkouts,
    });
  } catch (error) {
    console.error('Error fetching current workout:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 