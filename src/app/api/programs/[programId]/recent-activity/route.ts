import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ programId: string }> }
) {
  const { programId } = await params;
  
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const program = await prisma.program.findFirst({
      where: { 
        id: programId,
        createdBy: session.user.id,
      },
      include: {
        workoutPlans: {
          include: {
            workouts: true,
          },
        },
        workoutLogs: {
          where: {
            status: 'completed',
          },
          orderBy: {
            completedAt: 'desc',
          },
          take: 5,
        },
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    const recentActivity = program.workoutLogs.map(log => {
      const workout = program.workoutPlans?.[0]?.workouts.find(w => w.id === log.workoutId);
      return {
        id: log.id,
        workoutId: log.workoutId,
        workoutName: workout?.name || 'Unknown workout',
        dayNumber: workout?.dayNumber || 0,
        focus: workout?.focus || '',
        completedAt: log.completedAt
      };
    });

    return NextResponse.json(recentActivity);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 