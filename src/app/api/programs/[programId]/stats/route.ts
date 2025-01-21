import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// Response type
interface ProgramStats {
  completedWorkouts: number;
  checkIn: {
    nextDate: string;
    isCheckInDay: boolean;
    isOverdue: boolean;
    daysUntilNext: number;
  };
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

    const program = await prisma.program.findFirst({
      where: { 
        id: programId,
        createdBy: session.user.id,
      },
      include: {
        workoutLogs: {
          where: {
            status: 'completed',
          },
        },
        checkIns: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Calculate next check-in (every Monday)
    const today = new Date();
    const lastMonday = new Date(today);
    lastMonday.setDate(lastMonday.getDate() - ((lastMonday.getDay() + 6) % 7));
    const nextMonday = new Date(today);
    nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7));

    const isCheckInDay = today.getDay() === 1; // Is it Monday?
    const isOverdue = today > lastMonday && today < nextMonday && !isCheckInDay;
    const daysUntilNext = Math.ceil((nextMonday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const stats: ProgramStats = {
      completedWorkouts: program.workoutLogs.length,
      checkIn: {
        nextDate: nextMonday.toISOString(),
        isCheckInDay,
        isOverdue,
        daysUntilNext,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching program stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 