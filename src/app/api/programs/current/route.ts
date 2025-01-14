import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Program, CheckIn, WorkoutLog, UserActivity } from '@prisma/client';

type ProgramWithRelations = Program & {
  checkIns?: (CheckIn & {
    stats: any[];
    photos: {
      id: string;
      base64Data: string;
      progressPhoto: { type: string }[];
    }[];
  })[];
  workoutLogs?: WorkoutLog[];
  activities?: UserActivity[];
  workoutPlans?: any[];
};

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
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
                progressPhoto: true
              }
            }
          }
        },
        activities: true,
      },
    }) as ProgramWithRelations | null;

    if (!program) {
      return NextResponse.json({ error: 'No program found' }, { status: 404 });
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
    const startWeight = initialCheckIn?.stats?.[0]?.weight || userIntake?.weight || 0;
    const currentWeight = latestCheckIn?.stats?.[0]?.weight || startWeight;

    // Get progress photos from latest check-in
    const progressPhotos = latestCheckIn?.photos?.map(photo => ({
      id: photo.id,
      url: photo.base64Data,
      type: photo.progressPhoto?.[0]?.type || null
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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 