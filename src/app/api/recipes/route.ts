import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { validateIngredients, clamp } from '@/lib/ai/parse-helpers';

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

    // Validation limits (#424)
    if (typeof name !== 'string' || name.length > 200) {
      return NextResponse.json(
        { error: 'Recipe name must be under 200 characters' },
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

    if (Array.isArray(ingredients)) {
      const ingError = validateIngredients(ingredients);
      if (ingError) {
        return NextResponse.json({ error: ingError }, { status: 400 });
      }
    }

    // Validate numeric fields
    const cal = Number(calories);
    const prot = Number(protein);
    const carb = Number(carbs);
    const fatVal = Number(fat);
    const sSize = servingSize != null ? Number(servingSize) : 1;
    if (!isFinite(cal) || !isFinite(prot) || !isFinite(carb) || !isFinite(fatVal) || !isFinite(sSize)) {
      return NextResponse.json(
        { error: 'Numeric fields must be valid finite numbers' },
        { status: 400 }
      );
    }

    const recipe = await prisma.recipe.create({
      data: {
        userId: session.user.id,
        name,
        calories: clamp(Math.round(cal), 0, 99999),
        protein: clamp(Math.round(prot * 10) / 10, 0, 9999),
        carbs: clamp(Math.round(carb * 10) / 10, 0, 9999),
        fat: clamp(Math.round(fatVal * 10) / 10, 0, 9999),
        emoji: emoji || null,
        isPublic: false, // User-created recipes are always private (#421)
        servingSize: clamp(sSize, 0.01, 10000),
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
