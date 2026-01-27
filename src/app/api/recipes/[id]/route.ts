import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

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

    if (body.name !== undefined) updateData.name = body.name;
    if (body.emoji !== undefined) updateData.emoji = body.emoji || null;
    if (body.isPublic !== undefined) updateData.isPublic = body.isPublic === true;
    if (body.servingSize !== undefined) {
      updateData.servingSize = body.servingSize != null ? parseFloat(body.servingSize.toString()) : 1;
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

      updateData.calories = Math.round(totals.calories);
      updateData.protein = Math.round(totals.protein * 10) / 10;
      updateData.carbs = Math.round(totals.carbs * 10) / 10;
      updateData.fat = Math.round(totals.fat * 10) / 10;
    } else {
      // If no ingredients update, allow direct macro updates (backwards compatibility)
      if (body.calories !== undefined) updateData.calories = Math.round(body.calories);
      if (body.protein !== undefined) updateData.protein = parseFloat(body.protein.toString());
      if (body.carbs !== undefined) updateData.carbs = parseFloat(body.carbs.toString());
      if (body.fat !== undefined) updateData.fat = parseFloat(body.fat.toString());
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
