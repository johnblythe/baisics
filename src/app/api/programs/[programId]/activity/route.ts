import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

type Params = {
  params: {
    programId: string;
  };
};

export async function GET(
  req: Request,
  context: Promise<Params>
): Promise<NextResponse> {
  const { params } = await context;
  
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get last 84 days (12 weeks) of activity
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 84);

    const program = await prisma.program.findFirst({
      where: { 
        id: params.programId,
        createdBy: session.user.id,
      },
      include: {
        workoutLogs: {
          where: {
            completedAt: {
              gte: startDate,
            },
            status: 'completed',
          },
        },
        checkIns: {
          where: {
            createdAt: {
              gte: startDate,
            },
          },
        },
        activities: {
          where: {
            timestamp: {
              gte: startDate,
            },
          },
        },
        workoutPlans: {
          include: {
            workouts: true,
          },
        },
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Create a map of activities by date
    const activityMap = new Map<string, {
      date: string;
      activities: {
        type: 'check-in' | 'workout' | 'visit';
        metadata?: {
          workoutName?: string;
          checkInType?: string;
          path?: string;
        };
      }[];
    }>();

    // Add workout logs
    program.workoutLogs?.forEach(log => {
      if (!log.completedAt) return;
      const date = new Date(log.completedAt).toISOString().split('T')[0];
      const workout = program.workoutPlans?.[0]?.workouts.find(w => w.id === log.workoutId);
      
      if (!activityMap.has(date)) {
        activityMap.set(date, { date, activities: [] });
      }
      activityMap.get(date)?.activities.push({
        type: 'workout',
        metadata: { workoutName: workout?.name },
      });
    });

    // Add check-ins
    program.checkIns?.forEach(checkIn => {
      const date = new Date(checkIn.createdAt).toISOString().split('T')[0];
      if (!activityMap.has(date)) {
        activityMap.set(date, { date, activities: [] });
      }
      activityMap.get(date)?.activities.push({
        type: 'check-in',
        metadata: { checkInType: checkIn.type },
      });
    });

    // Add visits/activities
    program.activities?.forEach(activity => {
      const date = new Date(activity.timestamp).toISOString().split('T')[0];
      if (!activityMap.has(date)) {
        activityMap.set(date, { date, activities: [] });
      }
      activityMap.get(date)?.activities.push({
        type: 'visit',
        metadata: { path: activity.metadata?.path },
      });
    });

    return NextResponse.json(Array.from(activityMap.values()));
  } catch (error) {
    console.error('Error fetching activity data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 