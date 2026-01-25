import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/quick-foods - returns user's quick foods ordered by sortOrder
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const quickFoods = await prisma.quickFood.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { usageCount: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(quickFoods);
  } catch (error) {
    console.error('Error fetching quick foods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quick foods' },
      { status: 500 }
    );
  }
}

// POST /api/quick-foods - creates a new quick food entry
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
      fdcId,
      brand,
      emoji,
      servingSize,
      servingUnit,
    } = body;

    // Validate required fields
    if (!name || calories == null || protein == null || carbs == null || fat == null) {
      return NextResponse.json(
        { error: 'Required fields: name, calories, protein, carbs, fat' },
        { status: 400 }
      );
    }

    // Get max sortOrder for auto-increment
    const maxSortOrder = await prisma.quickFood.aggregate({
      where: { userId: session.user.id },
      _max: { sortOrder: true },
    });
    const nextSortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;

    // Create entry
    const quickFood = await prisma.quickFood.create({
      data: {
        userId: session.user.id,
        name,
        calories: Math.round(calories),
        protein: parseFloat(protein.toString()),
        carbs: parseFloat(carbs.toString()),
        fat: parseFloat(fat.toString()),
        fdcId: fdcId || null,
        brand: brand || null,
        emoji: emoji || null,
        servingSize: servingSize != null ? parseFloat(servingSize.toString()) : 1,
        servingUnit: servingUnit || 'serving',
        sortOrder: nextSortOrder,
      },
    });

    return NextResponse.json(quickFood, { status: 201 });
  } catch (error) {
    console.error('Error creating quick food:', error);
    return NextResponse.json(
      { error: 'Failed to create quick food' },
      { status: 500 }
    );
  }
}
