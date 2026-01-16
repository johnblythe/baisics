import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// Educational content for rest days (rotating)
const RECOVERY_TIPS = [
  {
    title: 'Muscle Growth Happens at Rest',
    tip: 'Training creates the stimulus; recovery builds the muscle. Your body is getting stronger right now.',
    source: 'Exercise Physiology',
    icon: 'muscle',
  },
  {
    title: 'Sleep is Your Superpower',
    tip: 'Growth hormone peaks during deep sleep. Aim for 7-9 hours to maximize recovery and muscle repair.',
    source: 'Sleep Science',
    icon: 'moon',
  },
  {
    title: 'Hydration Fuels Recovery',
    tip: 'Water supports nutrient delivery to muscles. Aim for half your body weight in ounces daily.',
    source: 'Sports Nutrition',
    icon: 'water',
  },
  {
    title: 'Active Recovery Works',
    tip: 'Light walking or stretching can reduce soreness by 40% compared to complete rest.',
    source: 'Journal of Sports Medicine',
    icon: 'heart',
  },
  {
    title: 'Protein Synthesis Window',
    tip: 'Protein synthesis remains elevated 24-48 hours after training. Today is when gains are made.',
    source: 'Muscle & Fitness Research',
    icon: 'chart',
  },
];

// Response type
interface RestDayData {
  isRestDay: boolean;
  weeklyProgress: {
    completed: number;
    target: number;
    percent: number;
  };
  lifetimeStats: {
    totalWorkouts: number;
    totalVolume: number;
    currentStreak: number;
    longestStreak: number;
  };
  nextWorkout: {
    id: string;
    name: string;
    focus: string;
    dayOfWeek: string;
  } | null;
  recoveryTip: {
    title: string;
    tip: string;
    source: string;
    icon: string;
  };
  programName: string;
  programWeek: number;
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

    // Calculate weekly progress (current calendar week)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    const workoutsThisWeek = program.workoutLogs.filter((log) => {
      const completedAt = new Date(log.completedAt!);
      return completedAt >= startOfWeek;
    });

    const weeklyCompleted = workoutsThisWeek.length;
    const weeklyTarget = daysPerWeek;
    const weeklyPercent = Math.round((weeklyCompleted / weeklyTarget) * 100);

    // Determine if it's a "rest day" - user has completed their weekly target
    // or they completed a workout today already
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedToday = workoutsThisWeek.some((log) => {
      const completedAt = new Date(log.completedAt!);
      completedAt.setHours(0, 0, 0, 0);
      return completedAt.getTime() === today.getTime();
    });

    const isRestDay = weeklyCompleted >= weeklyTarget || completedToday;

    // Get total volume lifted (sum of weight * reps)
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

    // Calculate program week
    const programStartDate = new Date(program.createdAt);
    const weeksSinceStart = Math.floor(
      (now.getTime() - programStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    const programWeek = Math.max(1, weeksSinceStart + 1);

    // Get next workout info
    const workouts = workoutPlan?.workouts || [];
    const lastWorkoutLog = program.workoutLogs[0];
    const lastWorkoutIndex = lastWorkoutLog
      ? workouts.findIndex((w) => w.id === lastWorkoutLog.workoutId)
      : -1;
    const nextWorkoutIndex =
      lastWorkoutIndex === -1 ? 0 : (lastWorkoutIndex + 1) % workouts.length;
    const nextWorkout = workouts[nextWorkoutIndex];

    // Get day of week for next workout (simple logic: tomorrow if rest day, or next available)
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const tomorrowIndex = (now.getDay() + 1) % 7;
    const nextWorkoutDay = isRestDay ? daysOfWeek[tomorrowIndex] : 'Today';

    // Get rotating recovery tip based on day of year
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) /
        (24 * 60 * 60 * 1000)
    );
    const tipIndex = dayOfYear % RECOVERY_TIPS.length;
    const recoveryTip = RECOVERY_TIPS[tipIndex];

    const response: RestDayData = {
      isRestDay,
      weeklyProgress: {
        completed: weeklyCompleted,
        target: weeklyTarget,
        percent: Math.min(100, weeklyPercent),
      },
      lifetimeStats: {
        totalWorkouts,
        totalVolume,
        currentStreak: user?.streakCurrent || 0,
        longestStreak: user?.streakLongest || 0,
      },
      nextWorkout: nextWorkout
        ? {
            id: nextWorkout.id,
            name: nextWorkout.name,
            focus: nextWorkout.focus,
            dayOfWeek: nextWorkoutDay,
          }
        : null,
      recoveryTip,
      programName: program.name,
      programWeek,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching rest day data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rest day data' },
      { status: 500 }
    );
  }
}
