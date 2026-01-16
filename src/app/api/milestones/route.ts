import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's earned milestones
    const milestones = await prisma.milestoneAchievement.findMany({
      where: { userId },
      orderBy: { earnedAt: 'asc' },
    });

    // Get total workout count (completed workouts across all programs)
    const totalWorkouts = await prisma.workoutLog.count({
      where: {
        userId,
        status: 'completed',
      },
    });

    // Get total volume lifted
    const volumeResult = await prisma.setLog.aggregate({
      where: {
        exerciseLog: {
          workoutLog: {
            userId,
            status: 'completed',
          },
        },
        weight: { not: null },
      },
      _sum: {
        weight: true,
      },
    });

    // Calculate total volume (sum of weight * reps for each set)
    const setLogs = await prisma.setLog.findMany({
      where: {
        exerciseLog: {
          workoutLog: {
            userId,
            status: 'completed',
          },
        },
        weight: { not: null },
      },
      select: {
        weight: true,
        reps: true,
      },
    });

    const totalVolume = setLogs.reduce((sum, set) => {
      return sum + (set.weight || 0) * set.reps;
    }, 0);

    return NextResponse.json({
      milestones: milestones.map((m) => ({
        type: m.type,
        earnedAt: m.earnedAt,
        totalWorkouts: m.totalWorkouts,
        totalVolume: m.totalVolume,
      })),
      stats: {
        totalWorkouts,
        totalVolume,
      },
    });
  } catch (error) {
    console.error('Error fetching milestones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch milestones' },
      { status: 500 }
    );
  }
}
