import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { updateStreak } from '@/lib/streaks';
import { checkAndAwardMilestone } from '@/lib/milestone-service';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
    }

    // Parse optional completedAt from request body
    let customCompletedAt: Date | undefined;
    try {
      const body = await request.json();
      if (body.completedAt) {
        customCompletedAt = new Date(body.completedAt);
        const now = new Date();
        // Set to end of today to allow completing for today
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        if (customCompletedAt > endOfToday) {
          return NextResponse.json({ error: 'Cannot complete workouts for future dates' }, { status: 400 });
        }
      }
    } catch {
      // No body or invalid JSON - use default (now)
    }

    // Get the workout log to verify ownership
    const workoutLog = await prisma.workoutLog.findUnique({
      where: { id },
    });

    if (!workoutLog) {
      return new NextResponse('Workout log not found', { status: 404 });
    }

    if (workoutLog.userId !== userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const completionTime = customCompletedAt || new Date();

    // Update the workout log status and completedAt
    const updatedWorkoutLog = await prisma.workoutLog.update({
      where: { id },
      data: {
        status: 'completed',
        completedAt: completionTime,
      },
      include: {
        exerciseLogs: {
          include: {
            setLogs: true,
          },
        },
      },
    });

    // Also mark all exercise logs as completed
    await prisma.exerciseLog.updateMany({
      where: {
        workoutLogId: id,
        completedAt: null,
      },
      data: {
        completedAt: completionTime,
      },
    });

    // Update workout streak (non-blocking - don't fail if streak update fails)
    let streakData = { current: 0, longest: 0, extended: false };
    try {
      streakData = await updateStreak(userId);
    } catch (streakError) {
      console.error('Failed to update streak (workout still completed):', {
        userId,
        workoutLogId: id,
        error: streakError instanceof Error ? streakError.message : String(streakError)
      });
    }

    // Check for milestone achievements (non-blocking)
    let milestoneData = { unlocked: false, milestone: null as string | null, totalWorkouts: 0, totalVolume: 0 };
    try {
      milestoneData = await checkAndAwardMilestone(userId);
    } catch (milestoneError) {
      console.error('Failed to check milestones (workout still completed):', {
        userId,
        workoutLogId: id,
        error: milestoneError instanceof Error ? milestoneError.message : String(milestoneError)
      });
    }

    // Calculate workout stats for this specific workout
    let workoutStats = { setsCompleted: 0, totalVolume: 0 };
    try {
      const completedSets = updatedWorkoutLog.exerciseLogs.flatMap(el => el.setLogs.filter(s => s.completedAt));
      workoutStats.setsCompleted = completedSets.length;
      workoutStats.totalVolume = completedSets.reduce((sum, set) => {
        return sum + ((set.weight || 0) * set.reps);
      }, 0);
    } catch (statsError) {
      console.error('Failed to calculate workout stats:', statsError);
    }

    // Determine if this is the user's first workout (WORKOUT_1 milestone just unlocked)
    const isFirstWorkout = milestoneData.unlocked && milestoneData.milestone === 'WORKOUT_1';

    return NextResponse.json({
      ...updatedWorkoutLog,
      streak: {
        current: streakData.current,
        longest: streakData.longest,
        extended: streakData.extended
      },
      milestone: milestoneData.unlocked ? {
        unlocked: true,
        type: milestoneData.milestone,
        totalWorkouts: milestoneData.totalWorkouts,
        totalVolume: milestoneData.totalVolume,
      } : null,
      isFirstWorkout,
      workoutStats,
    });
  } catch (error) {
    console.error('Error completing workout:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 