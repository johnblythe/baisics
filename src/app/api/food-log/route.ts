import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { MealType, FoodSource } from '@prisma/client';

// GET /api/food-log - returns entries for a specified date grouped by meal
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

    // Parse date and normalize to start of day
    // Add time component to parse as local time (avoids UTC midnight → previous day in local)
    const date = new Date(dateParam + 'T00:00:00');
    date.setHours(0, 0, 0, 0);

    const entries = await prisma.foodLogEntry.findMany({
      where: {
        userId: session.user.id,
        date: date,
      },
      orderBy: [
        { meal: 'asc' },
        { createdAt: 'asc' },
      ],
      include: {
        recipe: {
          select: {
            id: true,
            name: true,
            emoji: true,
          },
        },
      },
    });

    // Group entries by meal
    const grouped: Record<MealType, typeof entries> = {
      BREAKFAST: [],
      LUNCH: [],
      DINNER: [],
      SNACK: [],
    };

    for (const entry of entries) {
      grouped[entry.meal].push(entry);
    }

    return NextResponse.json({
      date: date.toISOString().split('T')[0],
      meals: grouped,
    });
  } catch (error) {
    console.error('Error fetching food log entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch food log entries' },
      { status: 500 }
    );
  }
}

// POST /api/food-log - creates a new food log entry
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      calories,
      protein,
      carbs,
      fat,
      date,
      meal,
      fdcId,
      brand,
      servingSize,
      servingUnit,
      source,
      recipeId,
      notes,
      isApproximate,
    } = body;

    // Validate required fields
    if (!name || calories == null || protein == null || carbs == null || fat == null || !date || !meal) {
      return NextResponse.json(
        { error: 'Required fields: name, calories, protein, carbs, fat, date, meal' },
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

    // Parse and normalize date
    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);

    // Validate source if provided
    let foodSource: FoodSource = FoodSource.MANUAL;
    if (source) {
      if (!Object.values(FoodSource).includes(source)) {
        return NextResponse.json(
          { error: `Invalid source. Must be one of: ${Object.values(FoodSource).join(', ')}` },
          { status: 400 }
        );
      }
      foodSource = source as FoodSource;
    }

    // Create entry
    // Auto-set isApproximate to true for AI_ESTIMATED source
    const shouldBeApproximate = isApproximate === true || foodSource === FoodSource.AI_ESTIMATED;

    const entry = await prisma.foodLogEntry.create({
      data: {
        userId: session.user.id,
        date: logDate,
        meal: meal as MealType,
        name,
        calories: Math.round(calories),
        protein: parseFloat(protein.toString()),
        carbs: parseFloat(carbs.toString()),
        fat: parseFloat(fat.toString()),
        fdcId: fdcId || null,
        brand: brand || null,
        servingSize: servingSize != null ? parseFloat(servingSize.toString()) : 1,
        servingUnit: servingUnit || 'serving',
        source: foodSource,
        recipeId: recipeId || null,
        notes: notes || null,
        isApproximate: shouldBeApproximate,
      },
      include: {
        recipe: {
          select: {
            id: true,
            name: true,
            emoji: true,
          },
        },
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error creating food log entry:', error);
    return NextResponse.json(
      { error: 'Failed to create food log entry' },
      { status: 500 }
    );
  }
}

// DELETE /api/food-log?date=YYYY-MM-DD - deletes all entries for a specified date
export async function DELETE(request: Request) {
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
    // Add time component to parse as local time (avoids UTC midnight → previous day in local)
    const date = new Date(dateParam + 'T00:00:00');
    date.setHours(0, 0, 0, 0);

    // Delete all entries for this user on this date
    const result = await prisma.foodLogEntry.deleteMany({
      where: {
        userId: session.user.id,
        date: date,
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      date: date.toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('Error deleting food log entries:', error);
    return NextResponse.json(
      { error: 'Failed to delete food log entries' },
      { status: 500 }
    );
  }
}
