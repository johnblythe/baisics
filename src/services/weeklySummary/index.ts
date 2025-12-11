import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { createWeeklySummaryEmail, WeeklySummaryData } from '@/lib/email/templates/weekly-summary';

interface UserWeeklyData {
  userId: string;
  email: string;
  name: string;
  programId: string;
  programName: string;
}

/**
 * Get the start and end of the previous week (Monday-Sunday)
 */
function getLastWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysToLastMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const lastMonday = new Date(now);
  lastMonday.setDate(now.getDate() - daysToLastMonday - 7);
  lastMonday.setHours(0, 0, 0, 0);

  const lastSunday = new Date(lastMonday);
  lastSunday.setDate(lastMonday.getDate() + 6);
  lastSunday.setHours(23, 59, 59, 999);

  return { start: lastMonday, end: lastSunday };
}

/**
 * Calculate the week number for a program
 */
function calculateWeekNumber(programStartDate: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - programStartDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.ceil(diffDays / 7);
}

/**
 * Get weekly summary data for a user
 */
export async function getWeeklySummaryData(
  userId: string,
  programId: string
): Promise<WeeklySummaryData | null> {
  const { start, end } = getLastWeekRange();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user?.email) return null;

  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: {
      workoutPlans: {
        include: {
          workouts: {
            include: {
              exercises: true,
              workoutLogs: {
                where: {
                  completedAt: { gte: start, lte: end },
                },
                include: {
                  exerciseLogs: true,
                },
              },
            },
          },
        },
      },
      checkIns: {
        where: {
          createdAt: { gte: start, lte: end },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          stats: true,
        },
      },
    },
  });

  if (!program) return null;

  // Calculate workout stats
  const workoutsPlanned = program.workoutPlans[0]?.workouts?.length || 0;
  const workoutsCompleted = program.workoutPlans[0]?.workouts?.filter(
    (w) => w.workoutLogs.length > 0
  ).length || 0;

  // Calculate total exercises done
  const totalExercises = program.workoutPlans[0]?.workouts?.reduce(
    (sum: number, w) => sum + w.workoutLogs.reduce(
      (logSum: number, log) => logSum + (log.exerciseLogs?.length || 0),
      0
    ),
    0
  ) || 0;

  // Check if check-in was completed
  const checkInCompleted = program.checkIns.length > 0;

  // Get weight data from UserStats
  const previousWeekStart = new Date(start);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);

  const [currentWeekStats, previousWeekStats] = await Promise.all([
    prisma.userStats.findFirst({
      where: {
        userId,
        checkIn: {
          createdAt: { gte: start, lte: end },
        },
        weight: { not: null },
      },
      orderBy: { checkIn: { createdAt: 'desc' } },
    }),
    prisma.userStats.findFirst({
      where: {
        userId,
        checkIn: {
          createdAt: { gte: previousWeekStart, lt: start },
        },
        weight: { not: null },
      },
      orderBy: { checkIn: { createdAt: 'desc' } },
    }),
  ]);

  const weightChange = currentWeekStats?.weight && previousWeekStats?.weight
    ? {
        current: currentWeekStats.weight,
        previous: previousWeekStats.weight,
        change: currentWeekStats.weight - previousWeekStats.weight,
      }
    : undefined;

  // Calculate streak (consecutive weeks with at least one workout)
  let streak = 0;
  let checkDate = new Date(end);

  while (true) {
    const weekStart = new Date(checkDate);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
    checkDate.setHours(23, 59, 59, 999);

    const weekWorkouts = await prisma.workoutLog.count({
      where: {
        programId,
        completedAt: { gte: weekStart, lte: checkDate },
      },
    });

    if (weekWorkouts > 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 7);
    } else {
      break;
    }

    // Limit to checking 52 weeks
    if (streak >= 52) break;
  }

  // Get next workout
  const nextWorkoutData = await prisma.workout.findFirst({
    where: {
      workoutPlan: { programId },
      workoutLogs: { none: {} },
    },
    orderBy: { dayNumber: 'asc' },
    select: {
      name: true,
      dayNumber: true,
      focus: true,
    },
  });

  const nextWorkout = nextWorkoutData
    ? {
        name: nextWorkoutData.name,
        dayNumber: nextWorkoutData.dayNumber,
        focus: nextWorkoutData.focus || 'Full Body',
      }
    : undefined;

  return {
    userName: user.name || 'there',
    weekNumber: calculateWeekNumber(program.createdAt),
    programName: program.name,
    workoutsCompleted,
    workoutsPlanned,
    totalExercises,
    checkInCompleted,
    weightChange,
    nextWorkout,
    streak,
    motivationalMessage: '', // Will be generated by the template
  };
}

/**
 * Send weekly summary email to a user
 */
export async function sendWeeklySummaryEmail(
  userId: string,
  programId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user?.email) {
      return { success: false, error: 'User email not found' };
    }

    const summaryData = await getWeeklySummaryData(userId, programId);

    if (!summaryData) {
      return { success: false, error: 'Could not generate summary data' };
    }

    const emailContent = createWeeklySummaryEmail(summaryData);

    const result = await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    if (result.success) {
      return { success: true };
    } else {
      return { success: false, error: String(result.error) };
    }
  } catch (error) {
    console.error('Error sending weekly summary:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get all users who should receive weekly summaries
 */
export async function getUsersForWeeklySummary(): Promise<UserWeeklyData[]> {
  const users = await prisma.user.findMany({
    where: {
      email: { not: null },
      programs: {
        some: {}, // Has at least one program
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      programs: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return users
    .filter(u => u.email && u.programs.length > 0)
    .map(u => ({
      userId: u.id,
      email: u.email!,
      name: u.name || 'User',
      programId: u.programs[0].id,
      programName: u.programs[0].name,
    }));
}

/**
 * Send weekly summaries to all eligible users
 */
export async function sendAllWeeklySummaries(): Promise<{
  sent: number;
  failed: number;
  errors: string[];
}> {
  const users = await getUsersForWeeklySummary();
  const results = { sent: 0, failed: 0, errors: [] as string[] };

  for (const user of users) {
    const result = await sendWeeklySummaryEmail(user.userId, user.programId);

    if (result.success) {
      results.sent++;
    } else {
      results.failed++;
      results.errors.push(`${user.email}: ${result.error}`);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}
