import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { updateStreak } from '@/lib/streaks';
import { checkAndAwardMilestone } from '@/lib/milestone-service';

/**
 * Quick Log API - "I Did It" button
 * Creates a completed workout log without exercise details
 * User has 48 hours to backfill the details
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
    }

    const body = await request.json();
    const { workoutId } = body;

    if (!workoutId) {
      return NextResponse.json({ error: 'workoutId is required' }, { status: 400 });
    }

    // Get the workout to verify it exists and get its program
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
      include: {
        workoutPlan: {
          include: {
            program: true
          }
        }
      }
    });

    if (!workout || !workout.workoutPlan?.program) {
      return NextResponse.json({ error: 'Workout or program not found' }, { status: 404 });
    }

    const now = new Date();
    const expiryDate = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours from now

    // Check for existing completed log for this workout on the same day
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const existingLog = await prisma.workoutLog.findFirst({
      where: {
        userId,
        workoutId,
        status: 'completed',
        completedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        workout: true,
      },
    });

    // If already logged today, return existing log instead of creating duplicate
    if (existingLog) {
      return NextResponse.json({
        success: true,
        alreadyLogged: true,
        workoutLog: {
          id: existingLog.id,
          workoutId: existingLog.workoutId,
          workoutName: existingLog.workout.name,
          completedAt: existingLog.completedAt,
          quickLog: existingLog.quickLog,
          quickLogExpiry: existingLog.quickLogExpiry,
        },
        message: 'This workout was already logged today.',
      });
    }

    // Create a completed workout log with quickLog flag
    const workoutLog = await prisma.workoutLog.create({
      data: {
        userId,
        workoutId,
        programId: workout.workoutPlan.program.id,
        status: 'completed',
        startedAt: now,
        completedAt: now,
        quickLog: true,
        quickLogExpiry: expiryDate,
        notes: 'Quick logged - details can be added within 48 hours',
      },
      include: {
        workout: true
      }
    });

    // Update workout streak (non-blocking)
    let streakData = { current: 0, longest: 0, extended: false };
    try {
      streakData = await updateStreak(userId);
    } catch (streakError) {
      console.error('Failed to update streak (workout still logged):', {
        userId,
        workoutLogId: workoutLog.id,
        error: streakError instanceof Error ? streakError.message : String(streakError)
      });
    }

    // Check for milestone achievements (non-blocking)
    let milestoneData = { unlocked: false, milestone: null as string | null, totalWorkouts: 0, totalVolume: 0 };
    try {
      milestoneData = await checkAndAwardMilestone(userId);
    } catch (milestoneError) {
      console.error('Failed to check milestones (workout still logged):', {
        userId,
        workoutLogId: workoutLog.id,
        error: milestoneError instanceof Error ? milestoneError.message : String(milestoneError)
      });
    }

    return NextResponse.json({
      success: true,
      workoutLog: {
        id: workoutLog.id,
        workoutId: workoutLog.workoutId,
        workoutName: workoutLog.workout.name,
        completedAt: workoutLog.completedAt,
        quickLog: workoutLog.quickLog,
        quickLogExpiry: workoutLog.quickLogExpiry,
      },
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
      message: 'Workout logged! You can add details within 48 hours.',
    });
  } catch (error) {
    console.error('Error creating quick log:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
