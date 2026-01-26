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
    totals.totalProtein = Math.round(totals.totalProtein * 10) / 10;
    totals.totalCarbs = Math.round(totals.totalCarbs * 10) / 10;
    totals.totalFat = Math.round(totals.totalFat * 10) / 10;

    // Use resolveNutritionTargets for point-in-time target resolution
    const nutritionResult = await resolveNutritionTargets(userId, date);
    const targets = {
      dailyCalories: nutritionResult.plan.dailyCalories,
      proteinGrams: nutritionResult.plan.proteinGrams,
      carbGrams: nutritionResult.plan.carbGrams,
      fatGrams: nutritionResult.plan.fatGrams,
    };

    // Calculate weekly compliance (last 7 days ending on the specified date)
    const weeklyCompliance: DayCompliance[] = [];

    for (let i = 6; i >= 0; i--) {
      const dayDate = new Date(date);
      dayDate.setDate(date.getDate() - i);
      dayDate.setHours(0, 0, 0, 0);

      const dayEntries = await prisma.foodLogEntry.findMany({
        where: {
          userId,
          date: dayDate,
        },
        select: {
          calories: true,
          protein: true,
        },
      });

      const logged = dayEntries.length > 0;
      let adherencePercent: number | null = null;

      // Calculate day totals
      const dayCalories = dayEntries.reduce((sum, e) => sum + e.calories, 0);
      const dayProtein = dayEntries.reduce((sum, e) => sum + e.protein, 0);

      if (logged && targets) {
        // Calculate adherence based on protein (protein is primary goal)
        const rawPercent = (dayProtein / targets.proteinGrams) * 100;
        // Cap at 100% - hitting or exceeding protein target = 100%
        adherencePercent = Math.min(100, Math.round(rawPercent));
      }

      weeklyCompliance.push({
        date: dayDate.toISOString().split('T')[0],
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
