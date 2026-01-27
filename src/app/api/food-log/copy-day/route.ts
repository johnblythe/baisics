import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { MealType } from '@prisma/client';

// POST /api/food-log/copy-day
// Copies selected meals from a source date to a target date
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sourceDate, targetDate, meals } = body;

    // Validate required fields
    if (!sourceDate || !targetDate || !meals) {
      return NextResponse.json(
        { error: 'Required fields: sourceDate, targetDate, meals (array of meal types)' },
        { status: 400 }
      );
    }

    // Validate meals is an array
    if (!Array.isArray(meals) || meals.length === 0) {
      return NextResponse.json(
        { error: 'meals must be a non-empty array of meal types' },
        { status: 400 }
      );
    }

    // Validate each meal type
    for (const meal of meals) {
      if (!Object.values(MealType).includes(meal)) {
        return NextResponse.json(
          { error: `Invalid meal type: ${meal}. Must be one of: ${Object.values(MealType).join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Parse dates
    // Add time component to parse as local time (avoids UTC midnight → previous day in local)
    const source = new Date(sourceDate + 'T00:00:00');
    source.setHours(0, 0, 0, 0);

    const target = new Date(targetDate + 'T00:00:00');
    target.setHours(0, 0, 0, 0);

    // Get all source entries for selected meals
    const sourceEntries = await prisma.foodLogEntry.findMany({
      where: {
        userId: session.user.id,
        date: source,
        meal: { in: meals as MealType[] },
      },
    });

    // Handle empty meals gracefully - return success with 0 items
    if (sourceEntries.length === 0) {
      return NextResponse.json({
        copied: 0,
        byMeal: {},
        message: 'No entries found to copy',
      });
    }

    // Create new entries for target date
    const createdEntries = await prisma.foodLogEntry.createMany({
      data: sourceEntries.map((entry) => ({
        userId: session.user.id,
        date: target,
        meal: entry.meal,
        name: entry.name,
        calories: entry.calories,
        protein: entry.protein,
        carbs: entry.carbs,
        fat: entry.fat,
        servingSize: entry.servingSize,
        servingUnit: entry.servingUnit,
        fdcId: entry.fdcId,
        brand: entry.brand,
        source: entry.source,
        recipeId: entry.recipeId,
        notes: entry.notes,
        isApproximate: entry.isApproximate,
      })),
    });

    // Calculate count per meal type
    const byMeal: Record<string, number> = {};
    for (const entry of sourceEntries) {
      byMeal[entry.meal] = (byMeal[entry.meal] || 0) + 1;
    }

    return NextResponse.json({
      copied: createdEntries.count,
      byMeal,
      message: `Copied ${createdEntries.count} items from ${sourceDate}`,
    });
  } catch (error) {
    console.error('Error copying day:', error);
    return NextResponse.json(
      { error: 'Failed to copy day' },
      { status: 500 }
    );
  }
}
