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
    const source = new Date(sourceDate);
    source.setHours(0, 0, 0, 0);

    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);

    // Get all source entries for selected meals
    const sourceEntries = await prisma.foodLogEntry.findMany({
      where: {
        userId: session.user.id,
        date: source,
        meal: { in: meals as MealType[] },
      },
    });

    if (sourceEntries.length === 0) {
      return NextResponse.json(
        { error: 'No entries found for the source date and selected meals' },
        { status: 404 }
      );
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

    // Calculate totals
    const totalCalories = sourceEntries.reduce((sum, e) => sum + e.calories, 0);

    return NextResponse.json({
      copied: createdEntries.count,
      meals: meals,
      totalCalories,
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
