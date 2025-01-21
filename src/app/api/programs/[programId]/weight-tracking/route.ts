import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

interface WeightTrackingResponse {
  currentWeight: number;
  startWeight: number;
  weightHistory: {
    date: Date;
    displayDate: string;
    weight: number | null;
  }[];
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ programId: string }> }
): Promise<NextResponse<WeightTrackingResponse> | NextResponse<{ error: string }>> {
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
        checkIns: {
          include: {
            stats: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Get initial weight from user intake if no check-ins
    const userIntake = await prisma.userIntake.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: { weight: true, createdAt: true },
    });

    const initialCheckIn = program.checkIns?.find(c => c.type === 'initial');
    const latestCheckIn = program.checkIns?.[0];

    const startWeight = initialCheckIn?.stats?.[0]?.weight || userIntake?.weight || 0;
    const currentWeight = latestCheckIn?.stats?.[0]?.weight || startWeight;

    const weightHistory = program.checkIns
      ?.flatMap(checkIn => checkIn.stats)
      .filter(stat => typeof stat.weight === 'number')
      .map(stat => ({
        date: stat.createdAt,
        displayDate: new Date(stat.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        weight: stat.weight,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // grab the user's intake data to plop into the front of the history
      const firstWeight = userIntake?.weight;
      if (firstWeight) {
        weightHistory?.unshift({
          date: new Date(userIntake.createdAt),
          displayDate: new Date(userIntake.createdAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric'
          }),
          weight: firstWeight
        });
      }

    const response: WeightTrackingResponse = {
      currentWeight,
      startWeight,
      weightHistory: weightHistory || [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching weight data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 