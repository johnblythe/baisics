import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { withDebugOverrides, logDebugState } from '@/lib/debug/api';

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
  {
    title: 'Stress Impacts Recovery',
    tip: 'High cortisol from stress can slow muscle repair. Use rest days for mental recovery too - meditate, read, or relax.',
    source: 'Psychophysiology Research',
    icon: 'heart',
  },
  {
    title: 'Nutrition Timing Matters Less Than You Think',
    tip: 'Total daily protein intake matters more than timing. Focus on hitting your daily target across all meals.',
    source: 'International Journal of Sport Nutrition',
    icon: 'chart',
  },
  {
    title: 'Foam Rolling Reduces DOMS',
    tip: 'Self-myofascial release for 10-15 minutes can reduce delayed onset muscle soreness and improve flexibility.',
    source: 'Journal of Athletic Training',
    icon: 'muscle',
  },
  {
    title: 'Cold Exposure Has Benefits',
    tip: 'A cold shower or ice bath can reduce inflammation and speed recovery, especially after intense sessions.',
    source: 'Sports Medicine Research',
    icon: 'water',
  },
  {
    title: 'Your Nervous System Needs Rest Too',
    tip: 'Heavy training taxes your central nervous system. Rest days allow neural pathways to recover for better performance.',
    source: 'Neuromuscular Research',
    icon: 'muscle',
  },
  {
    title: 'Walking is Underrated',
    tip: 'A 20-30 minute walk promotes blood flow to muscles, aiding nutrient delivery and waste removal.',
    source: 'Active Recovery Studies',
    icon: 'heart',
  },
  {
    title: 'Magnesium Supports Recovery',
    tip: 'Magnesium helps with muscle relaxation and sleep quality. Consider foods like spinach, almonds, and dark chocolate.',
    source: 'Nutritional Biochemistry',
    icon: 'chart',
  },
  {
    title: 'Rest Days Prevent Overtraining',
    tip: 'Overtraining syndrome leads to decreased performance, fatigue, and injury. Strategic rest prevents burnout.',
    source: 'Sports Medicine Journal',
    icon: 'muscle',
  },
  {
    title: 'Consistency Over Intensity',
    tip: 'Taking rest days helps you train consistently long-term. Pushing through fatigue leads to forced time off from injury.',
    source: 'Training Periodization Research',
    icon: 'chart',
  },
  {
    title: 'Sleep Quality Over Quantity',
    tip: 'Deep sleep phases matter most for recovery. Limit screens before bed and keep your room cool and dark.',
    source: 'Sleep Research',
    icon: 'moon',
  },
  {
    title: 'Glycogen Replenishment',
    tip: 'Carbs on rest days help restore muscle glycogen. Don\'t skip them - they fuel your next workout.',
    source: 'Sports Nutrition Science',
    icon: 'chart',
  },
  {
    title: 'Mental Benefits of Rest',
    tip: 'Rest days reduce exercise burnout and keep motivation high. Missing workouts strategically is different from quitting.',
    source: 'Sports Psychology',
    icon: 'heart',
  },
  {
    title: 'Contrast Therapy Works',
    tip: 'Alternating hot and cold (showers, baths) can improve circulation and reduce muscle soreness effectively.',
    source: 'Physical Therapy Research',
    icon: 'water',
  },
  {
    title: 'Omega-3s Fight Inflammation',
    tip: 'Fatty fish, walnuts, and flaxseeds contain omega-3s that help reduce exercise-induced inflammation.',
    source: 'Nutritional Science',
    icon: 'chart',
  },
  {
    title: 'Your Body Adapts During Rest',
    tip: 'Supercompensation happens during recovery - your body rebuilds stronger than before. Trust the process.',
    source: 'Training Adaptation Theory',
    icon: 'muscle',
  },
];

// Day status types for weekly progress indicators
type DayStatus = 'completed' | 'today' | 'rest' | 'scheduled' | 'missed';

interface DayInfo {
  dayName: string;
  status: DayStatus;
  isToday: boolean;
}

// Response type
interface RestDayData {
  isRestDay: boolean;
  weeklyProgress: {
    completed: number;
    target: number;
    percent: number;
    days: DayInfo[];
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

    // Build per-day status for the week indicators
    // Logic:
    // - Days with completed workouts this week = 'completed'
    // - Today = 'today' (or 'rest' if weekly target met or already worked out)
    // - Past days without workout when one was expected = based on schedule
    // - Future days = 'scheduled' or 'rest' based on typical workout schedule
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayIndex = now.getDay();

    // Map of day index -> completion date for workouts this week
    const completionsByDay = new Map<number, boolean>();
    workoutsThisWeek.forEach((log) => {
      const completedAt = new Date(log.completedAt!);
      completionsByDay.set(completedAt.getDay(), true);
    });

    // Determine how many workout days have passed and been completed
    // Simple heuristic: distribute workout days evenly across the week
    // For a 3-day program, typical days might be Mon/Wed/Fri = indices 1, 3, 5
    // For a 4-day program: Mon/Tue/Thu/Fri = indices 1, 2, 4, 5
    const getExpectedWorkoutDays = (daysPerWeek: number): number[] => {
      switch (daysPerWeek) {
        case 1: return [1]; // Monday
        case 2: return [1, 4]; // Mon, Thu
        case 3: return [1, 3, 5]; // Mon, Wed, Fri
        case 4: return [1, 2, 4, 5]; // Mon, Tue, Thu, Fri
        case 5: return [1, 2, 3, 4, 5]; // Mon-Fri
        case 6: return [1, 2, 3, 4, 5, 6]; // Mon-Sat
        case 7: return [0, 1, 2, 3, 4, 5, 6]; // Every day
        default: return [1, 3, 5]; // Default to 3 days
      }
    };

    const expectedWorkoutDays = new Set(getExpectedWorkoutDays(daysPerWeek));

    const weekDays: DayInfo[] = dayNames.map((dayName, dayIndex) => {
      const dayIsToday = dayIndex === todayIndex;
      const wasCompleted = completionsByDay.has(dayIndex);
      const isExpectedWorkoutDay = expectedWorkoutDays.has(dayIndex);
      const isPastDay = dayIndex < todayIndex;

      let status: DayStatus;

      if (wasCompleted) {
        status = 'completed';
      } else if (dayIsToday) {
        // Today: if it's expected workout day and not done yet, show as 'today'
        // If weekly target met or already worked out today, it's a rest day
        if (isRestDay) {
          status = 'rest';
        } else if (isExpectedWorkoutDay) {
          status = 'today';
        } else {
          status = 'rest';
        }
      } else if (isPastDay) {
        // Past day without completion
        if (isExpectedWorkoutDay) {
          // Expected to work out but didn't - could show as missed, but let's be kind
          // Only show missed if they're behind on their weekly target
          if (weeklyCompleted < expectedWorkoutDays.size &&
              Array.from(expectedWorkoutDays).filter(d => d <= todayIndex).length > weeklyCompleted) {
            status = 'scheduled'; // Don't shame - just show as scheduled
          } else {
            status = 'rest';
          }
        } else {
          status = 'rest';
        }
      } else {
        // Future day
        if (isExpectedWorkoutDay && weeklyCompleted < weeklyTarget) {
          status = 'scheduled';
        } else {
          status = 'rest';
        }
      }

      return {
        dayName,
        status,
        isToday: dayIsToday,
      };
    });

    const response: RestDayData = {
      isRestDay,
      weeklyProgress: {
        completed: weeklyCompleted,
        target: weeklyTarget,
        percent: Math.min(100, weeklyPercent),
        days: weekDays,
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

    // Apply debug overrides if in development
    await logDebugState('rest-day');
    const finalResponse = await withDebugOverrides(response, 'rest-day');

    return NextResponse.json(finalResponse);
  } catch (error) {
    console.error('Error fetching rest day data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rest day data' },
      { status: 500 }
    );
  }
}
