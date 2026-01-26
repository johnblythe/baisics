import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/quick-foods - returns user's quick foods
// Ordering: user's logged foods (by usageCount DESC) first, then starter foods
// Limited to 12 items total for Quick Add display
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
        { isStarter: 'asc' },    // User foods (isStarter=false) first
        { usageCount: 'desc' },  // Most used foods first
        { lastUsedAt: 'desc' },  // Recently used foods next
        { createdAt: 'desc' },   // Newest foods last
      ],
      take: 12, // Limit to 12 items for Quick Add
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

// POST /api/quick-foods - creates or updates a quick food entry (upsert by name)
// When user logs a food, this upserts to Quick Add list
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
      incrementUsage = false, // If true, increment usageCount (when logging food)
    } = body;

    // Validate required fields
    if (!name || calories == null || protein == null || carbs == null || fat == null) {
      return NextResponse.json(
        { error: 'Required fields: name, calories, protein, carbs, fat' },
        { status: 400 }
      );
    }

    // Check if food already exists (by name for this user)
    const existingFood = await prisma.quickFood.findFirst({
      where: {
        userId: session.user.id,
        name: { equals: name, mode: 'insensitive' },
      },
    });

    if (existingFood) {
      // Update existing food - increment usageCount if specified
      const quickFood = await prisma.quickFood.update({
        where: { id: existingFood.id },
        data: {
          usageCount: incrementUsage ? existingFood.usageCount + 1 : existingFood.usageCount,
          lastUsedAt: incrementUsage ? new Date() : existingFood.lastUsedAt,
          // Update macros if they've changed
          calories: Math.round(calories),
          protein: parseFloat(protein.toString()),
          carbs: parseFloat(carbs.toString()),
          fat: parseFloat(fat.toString()),
        },
      });
      return NextResponse.json(quickFood, { status: 200 });
    }

    // Get max sortOrder for auto-increment (low values for user foods)
    const maxUserSortOrder = await prisma.quickFood.aggregate({
      where: {
        userId: session.user.id,
        isStarter: false,
      },
      _max: { sortOrder: true },
    });
    // User foods get sortOrder 0-999, starters are 1000+
    const nextSortOrder = Math.min((maxUserSortOrder._max.sortOrder ?? -1) + 1, 999);

    // Create entry - user foods are not starters
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
        usageCount: incrementUsage ? 1 : 0,
        lastUsedAt: incrementUsage ? new Date() : null,
        isStarter: false, // User-created foods are never starters
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
