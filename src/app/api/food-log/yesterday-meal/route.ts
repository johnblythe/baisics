import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { MealType } from '@prisma/client';

// GET /api/food-log/yesterday-meal?meal=BREAKFAST&date=2024-01-24
// Returns yesterday's food for a specific meal type (relative to the given date)
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mealParam = searchParams.get('meal');
    const dateParam = searchParams.get('date');

    if (!mealParam) {
      return NextResponse.json(
        { error: 'meal query parameter is required' },
        { status: 400 }
      );
    }

    // Validate meal type
    if (!Object.values(MealType).includes(mealParam as MealType)) {
      return NextResponse.json(
        { error: `Invalid meal type. Must be one of: ${Object.values(MealType).join(', ')}` },
        { status: 400 }
      );
    }

    // Calculate yesterday's date (relative to the provided date or today)
    // Add time component to parse as local time (avoids UTC midnight → previous day in local)
    const baseDate = dateParam ? new Date(dateParam + 'T00:00:00') : new Date();
    baseDate.setHours(0, 0, 0, 0);

    const yesterdayDate = new Date(baseDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    const entries = await prisma.foodLogEntry.findMany({
      where: {
        userId: session.user.id,
        date: yesterdayDate,
        meal: mealParam as MealType,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Calculate total calories for the meal
    const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0);

    return NextResponse.json({
      date: yesterdayDate.toISOString().split('T')[0],
      meal: mealParam,
      entries,
      totalCalories,
      hasEntries: entries.length > 0,
    });
  } catch (error) {
    console.error('Error fetching yesterday meal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch yesterday meal' },
      { status: 500 }
    );
  }
}
