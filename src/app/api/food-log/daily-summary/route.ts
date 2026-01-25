import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { resolveNutritionTargets } from '@/lib/nutrition/resolveTargets';

/**
 * GET /api/food-log/daily-summary
 *
 * Returns today's nutrition data and targets, plus weekly history.
 * Uses resolveNutritionTargets for target resolution with point-in-time support.
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);

    // Allow specifying a date for historical lookups (defaults to today)
    const dateParam = searchParams.get('date');
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Get start of week (7 days ago from target date)
    const weekStart = new Date(targetDate);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    // Batch fetch entire week's entries in single query (fixes N+1)
    const weekEntries = await prisma.nutritionLog.findMany({
      where: {
        userId,
        date: {
          gte: weekStart,
          lte: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000 - 1), // End of target date
        },
      },
      orderBy: { date: 'asc' },
    });

    // Group entries by date string for easy lookup
    const entriesByDate = new Map<string, typeof weekEntries[0]>();
    for (const entry of weekEntries) {
      const dateKey = entry.date.toISOString().split('T')[0];
      entriesByDate.set(dateKey, entry);
    }

    // Get today's entry (target date)
    const todayKey = targetDate.toISOString().split('T')[0];
    const todayEntry = entriesByDate.get(todayKey);

    // Resolve nutrition targets for target date (point-in-time)
    const nutritionResult = await resolveNutritionTargets(userId, targetDate);

    // Build weekly data with targets for each day
    // For historical accuracy, we resolve targets per-day
    const weeklyData: Array<{
      date: string;
      logged: {
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
      } | null;
      targets: {
        dailyCalories: number;
        proteinGrams: number;
        carbGrams: number;
        fatGrams: number;
      };
    }> = [];

    // Build array of days for the week
    for (let i = 0; i <= 6; i++) {
      const dayDate = new Date(weekStart);
      dayDate.setDate(dayDate.getDate() + i);
      const dayKey = dayDate.toISOString().split('T')[0];

      const entry = entriesByDate.get(dayKey);

      // For historical accuracy, resolve targets for each day
      // This handles cases where nutrition plan changed mid-week
      const dayTargets = await resolveNutritionTargets(userId, dayDate);

      weeklyData.push({
        date: dayKey,
        logged: entry ? {
          calories: entry.calories,
          protein: entry.protein,
          carbs: entry.carbs,
          fats: entry.fats,
        } : null,
        targets: dayTargets.plan,
      });
    }

    // Check if user has any NutritionPlan (program or standalone)
    const hasPersonalizedTargets = await checkHasPersonalizedTargets(userId);

    return NextResponse.json({
      // Today's data
      today: {
        date: todayKey,
        logged: todayEntry ? {
          calories: todayEntry.calories,
          protein: todayEntry.protein,
          carbs: todayEntry.carbs,
          fats: todayEntry.fats,
          notes: todayEntry.notes,
        } : null,
        targets: nutritionResult.plan,
        source: nutritionResult.source,
        isDefault: nutritionResult.isDefault,
      },
      // Weekly data for charts/trends
      weekly: weeklyData,
      // Whether user has set personalized targets
      hasPersonalizedTargets,
    });
  } catch (error) {
    console.error('Error fetching daily summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily summary' },
      { status: 500 }
    );
  }
}

/**
 * Check if user has any NutritionPlan record (either program-linked or standalone)
 */
async function checkHasPersonalizedTargets(userId: string): Promise<boolean> {
  // Check for standalone plan
  const standalonePlan = await prisma.nutritionPlan.findFirst({
    where: {
      userId,
      programId: null,
    },
    select: { id: true },
  });

  if (standalonePlan) return true;

  // Check for program-linked plan through user's active program
  const activeProgram = await prisma.program.findFirst({
    where: {
      userId,
      active: true,
    },
    select: { id: true },
  });

  if (activeProgram) {
    const programPlan = await prisma.nutritionPlan.findFirst({
      where: {
        programId: activeProgram.id,
      },
      select: { id: true },
    });

    if (programPlan) return true;
  }

  return false;
}
