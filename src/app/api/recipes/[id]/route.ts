import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { validateIngredients, clamp } from '@/lib/ai/parse-helpers';

// GET /api/recipes/[id] - returns recipe details with ingredients
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

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

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    );
  }
}

// PATCH /api/recipes/[id] - updates a recipe (validates ownership, public recipes not editable)
export async function PATCH(
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

    // Find recipe
    const recipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Only owner can update their recipe
    if (recipe.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Public recipes (system recipes) cannot be edited
    if (recipe.isPublic && recipe.userId === null) {
      return NextResponse.json(
        { error: 'Public system recipes cannot be edited' },
        { status: 403 }
      );
    }

    // Build update data - only include fields that were provided
    const updateData: Record<string, unknown> = {};

    // Validation limits (#424)
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.length > 200) {
        return NextResponse.json(
          { error: 'Recipe name must be under 200 characters' },
          { status: 400 }
        );
      }
      updateData.name = body.name;
    }
    if (body.emoji !== undefined) updateData.emoji = body.emoji || null;
    // isPublic is not user-settable (#421)
    if (body.servingSize !== undefined) {
      const sv = Number(body.servingSize);
      if (!isFinite(sv)) {
        return NextResponse.json({ error: 'servingSize must be a valid finite number' }, { status: 400 });
      }
      updateData.servingSize = clamp(sv, 0.01, 10000);
    }
    if (body.servingUnit !== undefined) updateData.servingUnit = body.servingUnit || 'serving';

    // Handle ingredients update with macro recalculation
    if (body.ingredients !== undefined) {
      if (!Array.isArray(body.ingredients)) {
        return NextResponse.json(
          { error: 'ingredients must be an array' },
          { status: 400 }
        );
      }
      const ingError = validateIngredients(body.ingredients);
      if (ingError) {
        return NextResponse.json({ error: ingError }, { status: 400 });
      }
      updateData.ingredients = body.ingredients;

      // Recalculate total macros from ingredients
      interface Ingredient {
        calories?: number;
        protein?: number;
        carbs?: number;
        fat?: number;
      }
      interface MacroTotals {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      }
      const totals = (body.ingredients as Ingredient[]).reduce<MacroTotals>(
        (acc, ing) => ({
          calories: acc.calories + (Number(ing.calories) || 0),
          protein: acc.protein + (Number(ing.protein) || 0),
          carbs: acc.carbs + (Number(ing.carbs) || 0),
          fat: acc.fat + (Number(ing.fat) || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      updateData.calories = clamp(Math.round(totals.calories), 0, 99999);
      updateData.protein = clamp(Math.round(totals.protein * 10) / 10, 0, 9999);
      updateData.carbs = clamp(Math.round(totals.carbs * 10) / 10, 0, 9999);
      updateData.fat = clamp(Math.round(totals.fat * 10) / 10, 0, 9999);
    } else {
      // If no ingredients update, allow direct macro updates (backwards compatibility)
      if (body.calories !== undefined) {
        const v = Number(body.calories);
        if (!isFinite(v)) return NextResponse.json({ error: 'calories must be a valid finite number' }, { status: 400 });
        updateData.calories = clamp(Math.round(v), 0, 99999);
      }
      if (body.protein !== undefined) {
        const v = Number(body.protein);
        if (!isFinite(v)) return NextResponse.json({ error: 'protein must be a valid finite number' }, { status: 400 });
        updateData.protein = clamp(Math.round(v * 10) / 10, 0, 9999);
      }
      if (body.carbs !== undefined) {
        const v = Number(body.carbs);
        if (!isFinite(v)) return NextResponse.json({ error: 'carbs must be a valid finite number' }, { status: 400 });
        updateData.carbs = clamp(Math.round(v * 10) / 10, 0, 9999);
      }
      if (body.fat !== undefined) {
        const v = Number(body.fat);
        if (!isFinite(v)) return NextResponse.json({ error: 'fat must be a valid finite number' }, { status: 400 });
        updateData.fat = clamp(Math.round(v * 10) / 10, 0, 9999);
      }
    }

    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedRecipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to update recipe' },
      { status: 500 }
    );
  }
}

// DELETE /api/recipes/[id] - deletes a recipe (validates ownership)
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    // Find recipe
    const recipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Only owner can delete their recipe
    if (recipe.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.recipe.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    );
  }
}
