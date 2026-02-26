import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { resolveNutritionTargets } from '@/lib/nutrition/resolveTargets';

interface DailyTotals {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  entryCount: number;
}

interface DayCompliance {
  date: string;
  logged: boolean;
  adherencePercent: number | null;
  protein: number;
  calories: number;
}

// GET /api/food-log/daily-summary - returns daily totals and weekly compliance
// Uses resolveNutritionTargets for point-in-time target resolution
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    // Default to today if no date provided
    // Add time component to parse as local time (avoids UTC midnight → previous day in local)
    const date = dateParam ? new Date(dateParam + 'T00:00:00') : new Date();
    date.setHours(0, 0, 0, 0);

    // Get entries for the specified date using FoodLogEntry
    const entries = await prisma.foodLogEntry.findMany({
      where: {
        userId,
        date: date,
      },
      select: {
        calories: true,
        protein: true,
        carbs: true,
        fat: true,
      },
    });

    // Calculate totals
    const totals: DailyTotals = {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      entryCount: entries.length,
    };

    for (const entry of entries) {
      totals.totalCalories += entry.calories;
      totals.totalProtein += entry.protein;
      totals.totalCarbs += entry.carbs;
      totals.totalFat += entry.fat;
    }

    // Round totals for display
    totals.totalCalories = Math.round(totals.totalCalories);
    totals.totalProtein = Math.round(totals.totalProtein);
    totals.totalCarbs = Math.round(totals.totalCarbs);
    totals.totalFat = Math.round(totals.totalFat);

    // Use resolveNutritionTargets for point-in-time target resolution
    const nutritionResult = await resolveNutritionTargets(userId, date);
    const targets = {
      dailyCalories: nutritionResult.plan.dailyCalories,
      proteinGrams: nutritionResult.plan.proteinGrams,
      carbGrams: nutritionResult.plan.carbGrams,
      fatGrams: nutritionResult.plan.fatGrams,
    };

    // Calculate weekly compliance (Sun-Sat week containing the specified date)
    // Single groupBy query instead of 7 individual queries
    const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ...
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - dayOfWeek); // back to Sunday
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Saturday

    const weeklyAggregates = await prisma.foodLogEntry.groupBy({
      by: ['date'],
      where: {
        userId,
        date: { gte: weekStart, lte: weekEnd },
      },
      _sum: { calories: true, protein: true },
      _count: { id: true },
    });

    // Index aggregates by date string for O(1) lookup
    const aggregatesByDate = new Map(
      weeklyAggregates.map((agg) => [
        new Date(agg.date).toISOString().split('T')[0],
        agg,
      ])
    );

    const weeklyCompliance: DayCompliance[] = [];
    for (let i = 0; i <= 6; i++) {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + i);
      dayDate.setHours(0, 0, 0, 0);
      const dayKey = dayDate.toISOString().split('T')[0];

      const agg = aggregatesByDate.get(dayKey);
      const logged = !!agg && (agg._count?.id ?? 0) > 0;
      const dayCalories = agg?._sum?.calories ?? 0;
      const dayProtein = agg?._sum?.protein ?? 0;

      let adherencePercent: number | null = null;
      if (logged && targets) {
        const rawPercent = (dayProtein / targets.proteinGrams) * 100;
        adherencePercent = Math.min(100, Math.round(rawPercent));
      }

      weeklyCompliance.push({
        date: dayKey,
        logged,
        adherencePercent,
        protein: Math.round(dayProtein * 10) / 10,
        calories: Math.round(dayCalories),
      });
    }

    // Check if user has personalized targets
    const hasPersonalizedTargets = !nutritionResult.isDefault;

    return NextResponse.json({
      date: date.toISOString().split('T')[0],
      totals,
      targets,
      weeklyCompliance,
      // Additional fields for nutrition-architecture compatibility
      source: nutritionResult.source,
      isDefault: nutritionResult.isDefault,
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
