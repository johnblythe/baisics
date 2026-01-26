import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { MealType } from '@prisma/client';

// POST /api/food-log/copy-meal
// Copies all food entries from a source date/meal to a target date
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sourceDate, targetDate, meal } = body;

    // Validate required fields
    if (!sourceDate || !targetDate || !meal) {
      return NextResponse.json(
        { error: 'Required fields: sourceDate, targetDate, meal' },
        { status: 400 }
      );
    }

    // Validate meal type
    if (!Object.values(MealType).includes(meal)) {
      return NextResponse.json(
        { error: `Invalid meal type. Must be one of: ${Object.values(MealType).join(', ')}` },
        { status: 400 }
      );
    }

    // Parse dates
    // Add time component to parse as local time (avoids UTC midnight → previous day in local)
    const source = new Date(sourceDate + 'T00:00:00');
    source.setHours(0, 0, 0, 0);

    const target = new Date(targetDate + 'T00:00:00');
    target.setHours(0, 0, 0, 0);

    // Get source entries
    const sourceEntries = await prisma.foodLogEntry.findMany({
      where: {
        userId: session.user.id,
        date: source,
        meal: meal as MealType,
      },
    });

    if (sourceEntries.length === 0) {
      return NextResponse.json(
        { error: 'No entries found for the source date and meal' },
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

    // Fetch the created entries to return full details
    const newEntries = await prisma.foodLogEntry.findMany({
      where: {
        userId: session.user.id,
        date: target,
        meal: meal as MealType,
      },
      orderBy: { createdAt: 'desc' },
      take: createdEntries.count,
    });

    return NextResponse.json({
      copied: createdEntries.count,
      entries: newEntries,
      message: `Copied ${createdEntries.count} items from ${sourceDate}`,
    });
  } catch (error) {
    console.error('Error copying meal:', error);
    return NextResponse.json(
      { error: 'Failed to copy meal' },
      { status: 500 }
    );
  }
}
