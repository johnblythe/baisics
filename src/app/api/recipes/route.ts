import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/recipes - returns user's recipes + public recipes
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // Build where clause: user's recipes OR public recipes
    const whereClause = {
      OR: [
        { userId: session.user.id },
        { isPublic: true },
      ],
      ...(search && {
        name: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }),
    };

    const recipes = await prisma.recipe.findMany({
      where: whereClause,
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

// POST /api/recipes - creates a new recipe
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
      emoji,
      isPublic,
      servingSize,
      servingUnit,
      ingredients,
    } = body;

    // Validate required fields
    if (!name || calories == null || protein == null || carbs == null || fat == null) {
      return NextResponse.json(
        { error: 'Required fields: name, calories, protein, carbs, fat' },
        { status: 400 }
      );
    }

    // Validate ingredients is an array if provided
    if (ingredients !== undefined && !Array.isArray(ingredients)) {
      return NextResponse.json(
        { error: 'ingredients must be an array' },
        { status: 400 }
      );
    }

    const recipe = await prisma.recipe.create({
      data: {
        userId: session.user.id,
        name,
        calories: Math.round(calories),
        protein: parseFloat(protein.toString()),
        carbs: parseFloat(carbs.toString()),
        fat: parseFloat(fat.toString()),
        emoji: emoji || null,
        isPublic: isPublic === true,
        servingSize: servingSize != null ? parseFloat(servingSize.toString()) : 1,
        servingUnit: servingUnit || 'serving',
        ingredients: ingredients || [],
      },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    );
  }
}
