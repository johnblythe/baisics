import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { MealType } from '@prisma/client';

// GET /api/food-log/day-meals?date=2024-01-24
// Returns summary of all meals for a specific date (for copy day modal)
export async function GET(request: Request) {
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

    // Parse the date
    const targetDate = new Date(dateParam);
    targetDate.setHours(0, 0, 0, 0);

    // Get all entries for the date
    const entries = await prisma.foodLogEntry.findMany({
      where: {
        userId: session.user.id,
        date: targetDate,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by meal type and calculate totals
    const mealSummaries = Object.values(MealType).map((mealType) => {
      const mealEntries = entries.filter((e) => e.meal === mealType);
      const totalCalories = mealEntries.reduce((sum, e) => sum + e.calories, 0);
      const totalProtein = mealEntries.reduce((sum, e) => sum + e.protein, 0);

      return {
        meal: mealType,
        calories: totalCalories,
        protein: totalProtein,
        entryCount: mealEntries.length,
        hasEntries: mealEntries.length > 0,
      };
    });

    // Calculate grand total
    const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);
    const totalProtein = entries.reduce((sum, e) => sum + e.protein, 0);

    return NextResponse.json({
      date: dateParam,
      meals: mealSummaries,
      totalCalories,
      totalProtein,
      totalEntries: entries.length,
      hasAnyEntries: entries.length > 0,
    });
  } catch (error) {
    console.error('Error fetching day meals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch day meals' },
      { status: 500 }
    );
  }
}
