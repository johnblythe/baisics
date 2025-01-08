import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'User not authenticated' });
    }
    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' });
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
        },
        activities: true,
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'No program found' });
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
    const initialCheckIn = program.checkIns?.find(c => c.type === 'initial');
    const latestCheckIn = program.checkIns?.[0]; // Already ordered by desc

    // Determine weights
    const startWeight = initialCheckIn?.stats?.[0]?.weight || userIntake?.weight;
    const currentWeight = latestCheckIn?.stats?.[0]?.weight || startWeight;

    // Get progress photos from latest check-in
    const progressPhotos = latestCheckIn?.photos?.map(photo => ({
      id: photo.id,
      url: photo.base64Data,
      type: photo.ProgressPhoto?.[0]?.type || null
    })) || [];

    // Transform the data for the frontend
    const transformedProgram = {
      ...program,
      startWeight,
      currentWeight,
      progressPhotos,
      checkIns: program.checkIns?.map(checkIn => ({
        ...checkIn,
        createdAt: checkIn.createdAt.toISOString(),
      })) || [],
      workoutLogs: program.workoutLogs?.map(log => ({
        ...log,
        completedAt: log.completedAt?.toISOString(),
      })) || [],
      activities: program.activities?.map(activity => ({
        ...activity,
        timestamp: activity.timestamp.toISOString(),
      })) || [],
    };

    return NextResponse.json(transformedProgram);
  } catch (error) {
    console.error('Error fetching program:', error);
    return NextResponse.json({ error: 'Internal Server Error' });
  }
} 