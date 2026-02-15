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

    // Get 12 weeks of data
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (12 * 7)); // 12 weeks ago

    const program = await prisma.program.findFirst({
      where: { 
        id: programId,
        createdBy: session.user.id,
      },
      include: {
        workoutLogs: {
          where: {
            completedAt: {
              gte: startDate
            }
          },
          select: {
            id: true,
            completedAt: true,
          }
        },
        checkIns: {
          where: {
            date: {
              gte: startDate
            }
          },
          select: {
            id: true,
            date: true,
          }
        },
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // De-duplicate workouts: only one workout entry per day
    const seenWorkoutDays = new Set<string>();
    const dedupedWorkoutLogs = program.workoutLogs.filter(log => {
      if (!log.completedAt) return false;
      const dayKey = log.completedAt.toISOString().split('T')[0];
      if (seenWorkoutDays.has(dayKey)) return false;
      seenWorkoutDays.add(dayKey);
      return true;
    });

    // De-duplicate check-ins: only one check-in entry per day
    const seenCheckInDays = new Set<string>();
    const dedupedCheckIns = program.checkIns.filter(checkIn => {
      const dayKey = checkIn.date.toISOString().split('T')[0];
      if (seenCheckInDays.has(dayKey)) return false;
      seenCheckInDays.add(dayKey);
      return true;
    });

    // Combine all activities
    const activities = [
      ...dedupedWorkoutLogs.map(log => ({
        date: log.completedAt ? log.completedAt.toISOString() : '',
        type: 'workout' as const
      })),
      ...dedupedCheckIns.map(checkIn => ({
        date: checkIn.date.toISOString(),
        type: 'check-in' as const
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 