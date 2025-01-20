import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Program, CheckIn, WorkoutLog, UserActivity } from '@prisma/client';

// Let's define proper types for the stats and photos
interface UserStat {
  id: string;
  weight: number;
  createdAt: Date;
  // Add other stat fields as needed
}

interface ProgressPhotoType {
  id: string;
  type: 'FRONT' | 'BACK' | 'SIDE_LEFT' | 'SIDE_RIGHT' | 'CUSTOM' | null;
  userImage: {
    id: string;
    base64Data: string;
    type: string | null;
  };
  userStats: {
    bodyFatLow: number;
    bodyFatHigh: number;
    muscleMassDistribution: string;
  } | null;
}

export type ProgramWithRelations = Program & {
  checkIns?: (CheckIn & {
    stats: UserStat[];
    photos: {
      id: string;
      base64Data: string;
      progressPhoto: {
        id: string;
        type: 'FRONT' | 'BACK' | 'SIDE_LEFT' | 'SIDE_RIGHT' | 'CUSTOM' | null;
        userStats: {
          bodyFatLow: number;
          bodyFatHigh: number;
          muscleMassDistribution: string;
        } | null;
      }[];
    }[];
  })[];
  workoutLogs?: WorkoutLog[];
  activities?: UserActivity[];
  workoutPlans?: {
    id: string;
    workouts: {
      id: string;
      name: string;
      dayNumber: number;
      focus: string;
      exercises: any[]; // Define proper Exercise type if needed
    }[];
    proteinGrams: number;
    carbGrams: number;
    fatGrams: number;
    dailyCalories: number;
  }[];
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
      checkIns: program.checkIns?.map(checkIn => ({
        ...checkIn,
        date: checkIn.date.toISOString(),
        createdAt: checkIn.createdAt.toISOString(),
        progressPhoto: checkIn.photos?.map(photo => ({
          id: photo.id,
          userImage: {
            id: photo.id,
            base64Data: photo.base64Data,
            type: photo.progressPhoto?.[0]?.type || null
          },
          type: photo.progressPhoto?.[0]?.type || null,
          userStats: null
        })) || [],
        stats: checkIn.stats.map(stat => ({
          ...stat,
          createdAt: stat.createdAt.toISOString()
        }))
      })) || [],
      workoutLogs: program.workoutLogs?.map(log => ({
        ...log,
        completedAt: log.completedAt?.toISOString(),
      })) || [],
      activities: program.activities?.map(activity => ({
        ...activity,
        timestamp: activity.timestamp.toISOString(),
      })) || []
    };

    return NextResponse.json(transformedProgram);
  } catch (error) {
    console.error('Error fetching program:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 