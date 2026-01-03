import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { updateStreak } from '@/lib/streaks';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
    }

    // Get the workout log to verify ownership
    const workoutLog = await prisma.workoutLog.findUnique({
      where: { id },
    });

    if (!workoutLog) {
      return new NextResponse('Workout log not found', { status: 404 });
    }

    if (workoutLog.userId !== userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Update the workout log status and completedAt
    const updatedWorkoutLog = await prisma.workoutLog.update({
      where: { id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
      include: {
        exerciseLogs: {
          include: {
            setLogs: true,
          },
        },
      },
    });

    // Also mark all exercise logs as completed
    await prisma.exerciseLog.updateMany({
      where: {
        workoutLogId: id,
        completedAt: null,
      },
      data: {
        completedAt: new Date(),
      },
    });

    // Update workout streak (non-blocking - don't fail if streak update fails)
    let streakData = { current: 0, longest: 0, extended: false };
    try {
      streakData = await updateStreak(userId);
    } catch (streakError) {
      console.error('Failed to update streak (workout still completed):', {
        userId,
        workoutLogId: id,
        error: streakError instanceof Error ? streakError.message : String(streakError)
      });
    }

    return NextResponse.json({
      ...updatedWorkoutLog,
      streak: {
        current: streakData.current,
        longest: streakData.longest,
        extended: streakData.extended
      }
    });
  } catch (error) {
    console.error('Error completing workout:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 