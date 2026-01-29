import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { MealType, FoodSource } from '@prisma/client';

// POST /api/recipes/[id]/log - logs a recipe as a food entry and increments usageCount
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { meal, date } = body;

    // Validate meal type
    if (!meal || !Object.values(MealType).includes(meal)) {
      return NextResponse.json(
        { error: `Invalid meal type. Must be one of: ${Object.values(MealType).join(', ')}` },
        { status: 400 }
      );
    }

    // Validate date
    if (!date) {
      return NextResponse.json(
        { error: 'date is required' },
        { status: 400 }
      );
    }

    // Find recipe (allow public recipes or user's own recipes)
    const recipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Allow access if user owns the recipe OR it's public
    if (recipe.userId !== session.user.id && !recipe.isPublic) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse and normalize date
    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);

    // Use a transaction to create entry and increment usageCount atomically
    const [entry] = await prisma.$transaction([
      prisma.foodLogEntry.create({
        data: {
          userId: session.user.id,
          date: logDate,
          meal: meal as MealType,
          name: recipe.name,
          calories: recipe.calories,
          protein: recipe.protein,
          carbs: recipe.carbs,
          fat: recipe.fat,
          servingSize: recipe.servingSize,
          servingUnit: recipe.servingUnit,
          source: FoodSource.RECIPE,
          recipeId: recipe.id,
          isApproximate: false,
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
      }),
      prisma.recipe.update({
        where: { id: recipe.id },
        data: {
          usageCount: { increment: 1 },
        },
      }),
    ]);

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error logging recipe:', error);
    return NextResponse.json(
      { error: 'Failed to log recipe' },
      { status: 500 }
    );
  }
}
