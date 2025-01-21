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

    // Mock visit data for now
    const mockVisits = Array.from({ length: 10 }, () => ({
      date: new Date(
        startDate.getTime() + Math.random() * (Date.now() - startDate.getTime())
      ).toISOString(),
      type: 'visit' as const
    }));

    // Combine all activities
    const activities = [
      ...program.workoutLogs.map(log => ({
        date: log.completedAt.toISOString(),
        type: 'workout' as const
      })),
      ...program.checkIns.map(checkIn => ({
        date: checkIn.date.toISOString(),
        type: 'check-in' as const
      })),
      ...mockVisits
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 