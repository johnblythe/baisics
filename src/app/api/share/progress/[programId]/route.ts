import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Public endpoint to fetch shared program progress data
 * No auth required - progress data is intentionally public when shared
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const { programId } = await params;

    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        createdByUser: {
          select: {
            name: true,
          },
        },
        workoutLogs: {
          where: { status: 'completed' },
          include: {
            exerciseLogs: {
              include: {
                setLogs: true,
              },
            },
          },
          orderBy: { completedAt: 'desc' },
        },
        checkIns: {
          include: {
            stats: true,
            photos: {
              where: { type: 'FRONT' },
              take: 1,
            },
          },
          orderBy: { createdAt: 'desc' },  // newest first
        },
      },
    });

    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    // Calculate stats
    const totalWorkouts = program.workoutLogs.length;

    // Calculate weeks (from program creation to now or last workout)
    const startDate = new Date(program.createdAt);
    const endDate = program.workoutLogs[0]?.completedAt
      ? new Date(program.workoutLogs[0].completedAt)
      : new Date();
    const weeksCompleted = Math.max(1, Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
    ));

    // Calculate total volume
    const totalVolume = program.workoutLogs.reduce((sum, log) => {
      return sum + log.exerciseLogs.reduce((exSum, ex) => {
        return exSum + ex.setLogs.reduce((setSum, set) => {
          return setSum + ((set.weight || 0) * (set.reps || 0));
        }, 0);
      }, 0);
    }, 0);

    // Calculate total workout time
    const totalMinutes = program.workoutLogs.reduce((sum, log) => {
      if (log.completedAt && log.startedAt) {
        return sum + Math.round(
          (new Date(log.completedAt).getTime() - new Date(log.startedAt).getTime()) / 60000
        );
      }
      return sum;
    }, 0);

    // Weight tracking (from UserStats linked to CheckIns) - checkIns ordered newest first
    const checkInsWithWeight = program.checkIns.filter(c => c.stats[0]?.weight);
    const oldestCheckIn = checkInsWithWeight[checkInsWithWeight.length - 1];
    const newestCheckIn = checkInsWithWeight[0];
    const startWeight = oldestCheckIn?.stats[0]?.weight || null;
    const currentWeight = newestCheckIn?.stats[0]?.weight || null;
    const weightChange = startWeight && currentWeight ? currentWeight - startWeight : null;

    // Photos (first and last front photos) - checkIns ordered newest first
    const checkInsWithPhotos = program.checkIns.filter(c => c.photos.length > 0);
    const beforePhoto = checkInsWithPhotos.length > 0
      ? checkInsWithPhotos[checkInsWithPhotos.length - 1]?.photos[0]?.base64Data  // oldest
      : null;
    const afterPhoto = checkInsWithPhotos.length > 1
      ? checkInsWithPhotos[0]?.photos[0]?.base64Data  // newest
      : null;

    // Get first name only for privacy
    const firstName = program.createdByUser?.name?.split(' ')[0] || 'Someone';

    return NextResponse.json({
      id: program.id,
      programName: program.name,
      firstName,
      startDate: program.createdAt,
      stats: {
        weeksCompleted,
        totalWorkouts,
        totalVolume: Math.round(totalVolume),
        totalMinutes,
        startWeight,
        currentWeight,
        weightChange: weightChange ? Math.round(weightChange * 10) / 10 : null,
      },
      photos: {
        before: beforePhoto,
        after: afterPhoto,
      },
    });
  } catch (error) {
    console.error('Error fetching shared progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
