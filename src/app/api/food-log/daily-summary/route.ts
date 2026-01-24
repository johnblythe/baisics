import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

interface DailyTotals {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  entryCount: number;
}

interface NutritionTargets {
  dailyCalories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
}

interface DayCompliance {
  date: string;
  logged: boolean;
  adherencePercent: number | null;
  protein: number;
  calories: number;
}

interface DailySummaryResponse {
  date: string;
  totals: DailyTotals;
  targets: NutritionTargets | null;
  weeklyCompliance: DayCompliance[];
}

// GET /api/food-log/daily-summary - returns daily totals and weekly compliance
export async function GET(request: Request): Promise<NextResponse<DailySummaryResponse | { error: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    if (!dateParam) {
      return NextResponse.json(
        { error: 'date query parameter is required' },
        { status: 400 }
      );
    }

    // Parse date and normalize to start of day
    const date = new Date(dateParam);
    date.setHours(0, 0, 0, 0);

    // Get entries for the specified date
    const entries = await prisma.foodLogEntry.findMany({
      where: {
        userId: session.user.id,
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

    // Fetch targets from user's active program WorkoutPlan
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        ownedPrograms: {
          where: { active: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            workoutPlans: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: {
                dailyCalories: true,
                proteinGrams: true,
                carbGrams: true,
                fatGrams: true,
              },
            },
          },
        },
      },
    });

    let targets: NutritionTargets | null = null;
    const activeProgram = user?.ownedPrograms[0];
    const workoutPlan = activeProgram?.workoutPlans[0];

    if (workoutPlan) {
      targets = {
        dailyCalories: workoutPlan.dailyCalories,
        proteinGrams: workoutPlan.proteinGrams,
        carbGrams: workoutPlan.carbGrams,
        fatGrams: workoutPlan.fatGrams,
      };
    }

    // Calculate weekly compliance (last 7 days ending on the specified date)
    const weeklyCompliance: DayCompliance[] = [];

    for (let i = 6; i >= 0; i--) {
      const dayDate = new Date(date);
      dayDate.setDate(date.getDate() - i);
      dayDate.setHours(0, 0, 0, 0);

      const dayEntries = await prisma.foodLogEntry.findMany({
        where: {
          userId: session.user.id,
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

    return NextResponse.json({
      date: date.toISOString().split('T')[0],
      totals,
      targets,
      weeklyCompliance,
    });
  } catch (error) {
    console.error('Error fetching daily summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily summary' },
      { status: 500 }
    );
  }
}
