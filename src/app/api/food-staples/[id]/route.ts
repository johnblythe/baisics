import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { MealType } from '@prisma/client';

// PATCH /api/food-staples/[id] - update a food staple
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.foodStaple.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await request.json();
    const { sortOrder, mealSlot, name, emoji, calories, protein, carbs, fat, autoLog } = body;

    // Validate mealSlot if provided
    if (mealSlot && !Object.values(MealType).includes(mealSlot)) {
      return NextResponse.json(
        { error: `Invalid mealSlot. Must be one of: ${Object.values(MealType).join(', ')}` },
        { status: 400 }
      );
    }

    const staple = await prisma.foodStaple.update({
      where: { id },
      data: {
        ...(sortOrder != null ? { sortOrder } : {}),
        ...(mealSlot ? { mealSlot: mealSlot as MealType } : {}),
        ...(name ? { name } : {}),
        ...(emoji !== undefined ? { emoji: emoji || null } : {}),
        ...(calories != null ? { calories: Math.round(calories) } : {}),
        ...(protein != null ? { protein: parseFloat(protein.toString()) } : {}),
        ...(carbs != null ? { carbs: parseFloat(carbs.toString()) } : {}),
        ...(fat != null ? { fat: parseFloat(fat.toString()) } : {}),
        ...(autoLog != null ? { autoLog: Boolean(autoLog) } : {}),
      },
    });

    return NextResponse.json({ staple });
  } catch (error) {
    console.error('Error updating food staple:', error);
    return NextResponse.json(
      { error: 'Failed to update food staple' },
      { status: 500 }
    );
  }
}

// DELETE /api/food-staples/[id] - delete a food staple
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.foodStaple.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.foodStaple.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting food staple:', error);
    return NextResponse.json(
      { error: 'Failed to delete food staple' },
      { status: 500 }
    );
  }
}
