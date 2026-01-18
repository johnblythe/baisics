import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export interface ExerciseHistoryData {
  pr: {
    weight: number;
    reps: number;
    date: string;
  } | null;
  lastSession: {
    weight: number;
    reps: number;
    date: string;
  } | null;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: exerciseId } = await context.params;
    const userId = session.user.id;

    // Get the exercise to find its exerciseLibraryId
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      select: { exerciseLibraryId: true },
    });

    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    // Find all set logs for this exercise type (by exerciseLibraryId) for this user
    // This includes sets from any workout containing this exercise
    const setLogs = await prisma.setLog.findMany({
      where: {
        exerciseLog: {
          exercise: {
            exerciseLibraryId: exercise.exerciseLibraryId,
          },
          workoutLog: {
            userId,
            status: 'completed',
          },
        },
        weight: { not: null },
      },
      select: {
        weight: true,
        reps: true,
        completedAt: true,
        exerciseLog: {
          select: {
            workoutLog: {
              select: {
                completedAt: true,
              },
            },
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    // Calculate PR (max weight with corresponding reps)
    let pr: ExerciseHistoryData['pr'] = null;
    let maxWeight = 0;
    for (const log of setLogs) {
      if (log.weight !== null && log.weight > maxWeight) {
        maxWeight = log.weight;
        pr = {
          weight: log.weight,
          reps: log.reps,
          date: log.completedAt.toISOString(),
        };
      }
    }

    // Get last session (most recent completed set)
    let lastSession: ExerciseHistoryData['lastSession'] = null;
    if (setLogs.length > 0) {
      const mostRecent = setLogs[0];
      if (mostRecent.weight !== null) {
        lastSession = {
          weight: mostRecent.weight,
          reps: mostRecent.reps,
          date: mostRecent.completedAt.toISOString(),
        };
      }
    }

    const response: ExerciseHistoryData = {
      pr,
      lastSession,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching exercise history:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
