import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { MealType, FoodSource } from '@prisma/client';

// PATCH /api/food-log/[id] - updates a food log entry
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

    // Find entry and verify ownership
    const entry = await prisma.foodLogEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Food log entry not found' }, { status: 404 });
    }

    if (entry.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build update data - only include fields that were provided
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.calories !== undefined) updateData.calories = Math.round(body.calories);
    if (body.protein !== undefined) updateData.protein = parseFloat(body.protein.toString());
    if (body.carbs !== undefined) updateData.carbs = parseFloat(body.carbs.toString());
    if (body.fat !== undefined) updateData.fat = parseFloat(body.fat.toString());
    if (body.fdcId !== undefined) updateData.fdcId = body.fdcId || null;
    if (body.brand !== undefined) updateData.brand = body.brand || null;
    if (body.servingSize !== undefined) {
      updateData.servingSize = body.servingSize != null ? parseFloat(body.servingSize.toString()) : 1;
    }
    if (body.servingUnit !== undefined) updateData.servingUnit = body.servingUnit || 'serving';
    if (body.notes !== undefined) updateData.notes = body.notes || null;
    if (body.recipeId !== undefined) updateData.recipeId = body.recipeId || null;

    // Validate and update meal if provided
    if (body.meal !== undefined) {
      if (!Object.values(MealType).includes(body.meal)) {
        return NextResponse.json(
          { error: `Invalid meal type. Must be one of: ${Object.values(MealType).join(', ')}` },
          { status: 400 }
        );
      }
      updateData.meal = body.meal as MealType;
    }

    // Validate and update source if provided
    if (body.source !== undefined) {
      if (!Object.values(FoodSource).includes(body.source)) {
        return NextResponse.json(
          { error: `Invalid source. Must be one of: ${Object.values(FoodSource).join(', ')}` },
          { status: 400 }
        );
      }
      updateData.source = body.source as FoodSource;
    }

    // Validate and update date if provided
    if (body.date !== undefined) {
      const logDate = new Date(body.date);
      logDate.setHours(0, 0, 0, 0);
      updateData.date = logDate;
    }

    const updatedEntry = await prisma.foodLogEntry.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error('Error updating food log entry:', error);
    return NextResponse.json(
      { error: 'Failed to update food log entry' },
      { status: 500 }
    );
  }
}

// DELETE /api/food-log/[id] - deletes a food log entry
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

    // Find entry and verify ownership
    const entry = await prisma.foodLogEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Food log entry not found' }, { status: 404 });
    }

    if (entry.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.foodLogEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting food log entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete food log entry' },
      { status: 500 }
    );
  }
}
