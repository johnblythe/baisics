import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = process.env.TEST_USER_ID;
    if (!userId) {
      throw new Error('TEST_USER_ID environment variable is required');
    }

    const { id } = await context.params;

    const workout = await prisma.workout.findUnique({
      where: {
        id,
      },
      include: {
        exercises: {
          include: {
            exerciseLibrary: true,
          },
        },
        workoutLogs: {
          where: {
            userId,
            status: 'in_progress',
          },
          include: {
            exerciseLogs: {
              include: {
                setLogs: true,
              },
            },
          },
          orderBy: {
            startedAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!workout) {
      return new NextResponse('Workout not found', { status: 404 });
    }

    return NextResponse.json(workout);
  } catch (error) {
    console.error('Error fetching workout:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 