import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = process.env.TEST_USER_ID;
    if (!userId) {
      throw new Error('TEST_USER_ID environment variable is required');
    }

    // Get the workout log to verify ownership
    const workoutLog = await prisma.workoutLog.findUnique({
      where: { id: params.id },
    });

    if (!workoutLog) {
      return new NextResponse('Workout log not found', { status: 404 });
    }

    if (workoutLog.userId !== userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Update the workout log status and completedAt
    const updatedWorkoutLog = await prisma.workoutLog.update({
      where: { id: params.id },
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
        workoutLogId: params.id,
        completedAt: null,
      },
      data: {
        completedAt: new Date(),
      },
    });

    return NextResponse.json(updatedWorkoutLog);
  } catch (error) {
    console.error('Error completing workout:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 