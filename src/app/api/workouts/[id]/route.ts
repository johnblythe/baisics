import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'User not authenticated' });
    }
    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' });
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
          orderBy: { sortOrder: 'asc' },
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