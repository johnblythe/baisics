import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Program, CheckIn, WorkoutLog, UserActivity } from '@prisma/client';

interface CheckInStat {
  id: string;
  weight: number;
  bodyFatPercentage?: number;
  bodyFatLow?: number;
  bodyFatHigh?: number;
  muscleMassDistribution?: string;
  createdAt: string;
}

interface ProgressPhotoData {
  id: string;
  type: 'FRONT' | 'BACK' | 'SIDE_LEFT' | 'SIDE_RIGHT' | 'CUSTOM' | null;
  userStats: {
    bodyFatLow: number;
    bodyFatHigh: number;
    muscleMassDistribution: string;
  } | null;
}

interface CheckInPhoto {
  id: string;
  base64Data: string;
  progressPhoto: ProgressPhotoData[];
}

interface CheckInData {
  id: string;
  createdAt: string;
  date: string;
  notes: string | null;
  programId: string;
  type: 'initial' | 'progress' | 'end';
  userId: string;
  stats: CheckInStat[];
  photos: CheckInPhoto[];
}

export interface TransformedProgram {
  id: string;
  name: string;
  description: string | null;
  workoutPlans: {
    id: string;
    proteinGrams: number;
    carbGrams: number;
    fatGrams: number;
    dailyCalories: number;
    workouts: {
      id: string;
      name: string;
      dayNumber: number;
      focus: string;
      exercises: any[];
    }[];
  }[];
  workoutLogs: WorkoutLog[];
  currentWeight?: number;
  startWeight?: number;
  progressPhotos: {
    id: string;
    url: string;
    type: 'FRONT' | 'BACK' | 'SIDE_LEFT' | 'SIDE_RIGHT' | 'CUSTOM' | null;
  }[];
  checkIns?: {
    id: string;
    date: string;
    type: 'initial' | 'progress' | 'end';
  }[];
  activities?: {
    id: string;
    timestamp: string;
    type: string;
    metadata?: {
      path?: string;
      userAgent?: string;
    };
  }[];
}

export type ProgramWithRelations = Program & {
  checkIns?: CheckInData[];
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
      checkIns: program.checkIns?.map(checkIn => ({
        ...checkIn,
        date: checkIn.date,
        createdAt: checkIn.createdAt,
        photos: checkIn.photos?.map(photo => ({
          id: photo.id,
          base64Data: photo.base64Data,
          progressPhoto: photo.progressPhoto.map(pp => ({
            id: pp.id,
            type: pp.type,
            userStats: pp.userStats
          }))
        })) || [],
        stats: checkIn.stats.map(stat => ({
          ...stat,
          createdAt: stat.createdAt
        }))
      })) || [],
      workoutLogs: program.workoutLogs?.map(log => ({
        ...log,
        completedAt: log.completedAt
      })) || [],
      activities: program.activities?.map(activity => ({
        ...activity,
        timestamp: activity.timestamp
      })) || [],
      workoutPlans: program.workoutPlans?.map(plan => ({
        ...plan,
        workouts: plan.workouts.map((workout: any) => ({
          ...workout,
          exercises: workout.exercises
        }))
      })) || [],
      progressPhotos
    };

    return NextResponse.json(transformedProgram);
  } catch (error) {
    console.error('Error fetching program:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 