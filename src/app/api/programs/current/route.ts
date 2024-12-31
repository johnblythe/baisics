import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const userId = process.env.TEST_USER_ID;
    if (!userId) {
      throw new Error('TEST_USER_ID environment variable is required');
    }

    const program = await prisma.program.findFirst({
      where: {
        createdBy: userId,
      },
      orderBy: {
        createdAt: 'desc',
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
        workoutLogs: {
          where: {
            status: 'completed',
          },
          orderBy: {
            completedAt: 'desc',
          },
        },
      },
    });

    if (!program) {
      return new NextResponse('No program found', { status: 404 });
    }

    return NextResponse.json(program);
  } catch (error) {
    console.error('Error fetching program:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 