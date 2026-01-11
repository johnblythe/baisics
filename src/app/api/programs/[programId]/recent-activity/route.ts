import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// Calculate workout streak (consecutive days with workouts)
function calculateStreak(workoutDates: Date[]): number {
  if (workoutDates.length === 0) return 0;

  // Get unique dates (ignore time)
  const uniqueDays = [...new Set(
    workoutDates.map(d => new Date(d).toDateString())
  )].map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());

  if (uniqueDays.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if most recent workout is today or yesterday
  const mostRecent = uniqueDays[0];
  mostRecent.setHours(0, 0, 0, 0);

  if (mostRecent < yesterday) return 0; // Streak broken

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const current = uniqueDays[i];
    const previous = uniqueDays[i - 1];
    current.setHours(0, 0, 0, 0);
    previous.setHours(0, 0, 0, 0);

    const diffDays = Math.round((previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

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

    // Get all completed workouts for streak calculation
    const allCompletedLogs = await prisma.workoutLog.findMany({
      where: {
        programId,
        status: 'completed',
        completedAt: { not: null },
      },
      select: { completedAt: true },
      orderBy: { completedAt: 'desc' },
    });

    const streak = calculateStreak(
      allCompletedLogs.map(l => l.completedAt!).filter(Boolean)
    );

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
          include: {
            exerciseLogs: {
              include: {
                setLogs: true,
              },
            },
          },
        },
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    const recentActivity = program.workoutLogs.map(log => {
      const workout = program.workoutPlans?.[0]?.workouts.find(w => w.id === log.workoutId);

      // Calculate stats
      const exerciseCount = log.exerciseLogs.length;
      const totalVolume = log.exerciseLogs.reduce(
        (sum, el) => sum + el.setLogs.reduce(
          (setSum, set) => setSum + ((set.weight || 0) * (set.reps || 0)),
          0
        ),
        0
      );
      const duration = log.completedAt && log.startedAt
        ? Math.round((new Date(log.completedAt).getTime() - new Date(log.startedAt).getTime()) / 60000)
        : null;

      return {
        id: log.id,
        workoutId: log.workoutId,
        workoutName: workout?.name || 'Unknown workout',
        dayNumber: workout?.dayNumber || 0,
        focus: workout?.focus || '',
        completedAt: log.completedAt,
        exerciseCount,
        totalVolume: Math.round(totalVolume),
        duration,
      };
    });

    return NextResponse.json({ workouts: recentActivity, streak });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 