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
        checkIns: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            stats: true,
            photos: {
              include: {
                ProgressPhoto: true
              }
            }
          }
        }
      },
    });

    if (!program) {
      return new NextResponse('No program found', { status: 404 });
    }

    // Get user intake for initial weight if no check-ins
    const userIntake = await prisma.userIntake.findFirst({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Find initial check-in for starting weight
    const initialCheckIn = program.checkIns.find(c => c.type === 'initial');
    const latestCheckIn = program.checkIns[0]; // Already ordered by desc

    // Determine weights
    const startWeight = initialCheckIn?.stats[0]?.weight || userIntake?.weight;
    const currentWeight = latestCheckIn?.stats[0]?.weight || startWeight;

    // Get progress photos from latest check-in
    const progressPhotos = latestCheckIn?.photos.map(photo => ({
      id: photo.id,
      url: photo.base64Data,
      type: photo.ProgressPhoto[0]?.type || null
    })) || [];

    // Transform the data for the frontend
    const transformedProgram = {
      ...program,
      startWeight,
      currentWeight,
      progressPhotos,
      checkIns: undefined, // Remove raw check-ins data
    };

    return NextResponse.json(transformedProgram);
  } catch (error) {
    console.error('Error fetching program:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 