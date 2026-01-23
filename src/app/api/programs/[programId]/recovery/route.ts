import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { withDebugOverrides, logDebugState } from '@/lib/debug/api';

// Recovery tier messaging - only triggers after 5+ days of inactivity
interface RecoveryTier {
  type: 'recovery';
  daysMissed: number;
  headline: string;
  subheadline: string;
  encouragement: string;
}

const getRecoveryTier = (daysSinceLastWorkout: number): RecoveryTier => {
  // Only called when daysSinceLastWorkout >= 5
  return {
    type: 'recovery',
    daysMissed: daysSinceLastWorkout,
    headline: "Ready when you are",
    subheadline: "Your progress is still here.",
    encouragement: "Pick up where you left off, or ease back in with a lighter session.",
  };
};

// Response type
export interface RecoveryData {
  needsRecovery: boolean;
  recoveryTier: RecoveryTier | null;
  daysSinceLastWorkout: number;
  lifetimeStats: {
    totalWorkouts: number;
    totalVolume: number;
    currentStreak: number;
    longestStreak: number;
  };
  weeklyProgress: {
    completed: number;
    target: number;
  };
  programProgress: {
    name: string;
    week: number;
    percentComplete: number;
  };
  nextWorkout: {
    id: string;
    name: string;
    focus: string;
    exerciseCount: number;
  } | null;
  quickComebackWorkout: {
    id: string;
    name: string;
    description: string;
    exercises: {
      name: string;
      sets: number;
      reps: number;
      originalSets: number;
    }[];
    estimatedMinutes: number;
  } | null;
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

    const userId = session.user.id;

    // Get program with workout plan info
    const program = await prisma.program.findFirst({
      where: {
        id: programId,
        createdBy: userId,
      },
      include: {
        workoutPlans: {
          include: {
            workouts: {
              orderBy: { dayNumber: 'asc' },
              include: {
                exercises: {
                  orderBy: { sortOrder: 'asc' },
                  include: {
                    exerciseLibrary: true,
                  },
                },
              },
            },
          },
        },
        workoutLogs: {
          where: { status: 'completed' },
          orderBy: { completedAt: 'desc' },
        },
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Get user for streak info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        streakCurrent: true,
        streakLongest: true,
      },
    });

    const workoutPlan = program.workoutPlans[0];
    const daysPerWeek = workoutPlan?.daysPerWeek || 3;

    // Calculate days since last workout
    const lastWorkoutLog = program.workoutLogs[0];
    const now = new Date();
    let daysSinceLastWorkout = 0;

    if (lastWorkoutLog?.completedAt) {
      const lastWorkoutDate = new Date(lastWorkoutLog.completedAt);
      const diffTime = now.getTime() - lastWorkoutDate.getTime();
      daysSinceLastWorkout = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } else {
      // No workouts completed yet - check days since program start
      const programStart = new Date(program.createdAt);
      const diffTime = now.getTime() - programStart.getTime();
      daysSinceLastWorkout = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    // Calculate weekly progress (current calendar week)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    const workoutsThisWeek = program.workoutLogs.filter((log) => {
      const completedAt = new Date(log.completedAt!);
      return completedAt >= startOfWeek;
    });

    const weeklyCompleted = workoutsThisWeek.length;
    const weeklyTarget = daysPerWeek;

    // Check if today is a rest day (using same logic as rest-day route)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedToday = workoutsThisWeek.some((log) => {
      const completedAt = new Date(log.completedAt!);
      completedAt.setHours(0, 0, 0, 0);
      return completedAt.getTime() === today.getTime();
    });

    const isRestDay = weeklyCompleted >= weeklyTarget || completedToday;

    // Determine if recovery screen is needed
    // Only show recovery screen for significant absences (5+ days)
    // Short breaks (1-4 days) don't need a check-in - just let them work out
    const needsRecovery = daysSinceLastWorkout >= 5 && !isRestDay;

    // Get total volume lifted
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

    // Get total workout count
    const totalWorkouts = await prisma.workoutLog.count({
      where: {
        userId,
        status: 'completed',
      },
    });

    // Calculate program week and progress
    const programStartDate = new Date(program.createdAt);
    const weeksSinceStart = Math.floor(
      (now.getTime() - programStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    const programWeek = Math.max(1, weeksSinceStart + 1);

    // Calculate program percent complete
    const totalProgramWorkouts =
      program.workoutLogs.filter((l) => l.programId === programId).length;
    const expectedWorkouts = programWeek * daysPerWeek;
    const percentComplete = Math.min(
      100,
      Math.round((totalProgramWorkouts / Math.max(1, expectedWorkouts)) * 100)
    );

    // Get next workout info
    const workouts = workoutPlan?.workouts || [];
    const lastWorkoutIndex = lastWorkoutLog
      ? workouts.findIndex((w) => w.id === lastWorkoutLog.workoutId)
      : -1;
    const nextWorkoutIndex =
      lastWorkoutIndex === -1 ? 0 : (lastWorkoutIndex + 1) % workouts.length;
    const nextWorkout = workouts[nextWorkoutIndex];

    // Generate Quick Comeback Workout if 5+ days missed
    let quickComebackWorkout = null;
    if (daysSinceLastWorkout >= 5 && nextWorkout) {
      // Take the next scheduled workout and reduce it
      // 3 compound movements, 50% sets, target 70% intensity
      const compoundExercises = nextWorkout.exercises.filter(
        (e) => e.exerciseLibrary.isCompound
      );
      const nonCompoundExercises = nextWorkout.exercises.filter(
        (e) => !e.exerciseLibrary.isCompound
      );

      // Prefer compound exercises, fill with non-compound if needed
      const selectedExercises = [
        ...compoundExercises.slice(0, 3),
        ...nonCompoundExercises.slice(0, Math.max(0, 3 - compoundExercises.length)),
      ].slice(0, 3);

      quickComebackWorkout = {
        id: nextWorkout.id,
        name: `Quick Comeback: ${nextWorkout.name}`,
        description:
          '3 exercises, reduced volume. Perfect for getting back in the groove.',
        exercises: selectedExercises.map((e) => ({
          name: e.name,
          sets: Math.max(2, Math.ceil(e.sets * 0.5)), // 50% sets, min 2
          reps: e.reps || 8,
          originalSets: e.sets,
        })),
        estimatedMinutes: 20,
      };
    }

    const recoveryTier = needsRecovery
      ? getRecoveryTier(daysSinceLastWorkout)
      : null;

    const response: RecoveryData = {
      needsRecovery,
      recoveryTier,
      daysSinceLastWorkout,
      lifetimeStats: {
        totalWorkouts,
        totalVolume,
        currentStreak: user?.streakCurrent || 0,
        longestStreak: user?.streakLongest || 0,
      },
      weeklyProgress: {
        completed: weeklyCompleted,
        target: weeklyTarget,
      },
      programProgress: {
        name: program.name,
        week: programWeek,
        percentComplete,
      },
      nextWorkout: nextWorkout
        ? {
            id: nextWorkout.id,
            name: nextWorkout.name,
            focus: nextWorkout.focus,
            exerciseCount: nextWorkout.exercises.length,
          }
        : null,
      quickComebackWorkout,
    };

    // Apply debug overrides if in development
    await logDebugState('recovery');
    const finalResponse = await withDebugOverrides(response, 'recovery');

    return NextResponse.json(finalResponse);
  } catch (error) {
    console.error('Error fetching recovery data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recovery data' },
      { status: 500 }
    );
  }
}
