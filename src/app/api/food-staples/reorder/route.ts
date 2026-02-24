import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { MealType } from '@prisma/client';

// PATCH /api/food-staples/reorder - batch reorder staples within a meal slot
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { mealSlot, stapleIds } = body as { mealSlot: MealType; stapleIds: string[] };

    if (!mealSlot || !Object.values(MealType).includes(mealSlot)) {
      return NextResponse.json(
        { error: `Invalid mealSlot. Must be one of: ${Object.values(MealType).join(', ')}` },
        { status: 400 }
      );
    }

    if (!Array.isArray(stapleIds) || stapleIds.length === 0) {
      return NextResponse.json({ error: 'stapleIds must be a non-empty array' }, { status: 400 });
    }

    // Verify all IDs belong to user and the correct meal slot
    const existing = await prisma.foodStaple.findMany({
      where: {
        id: { in: stapleIds },
        userId: session.user.id,
        mealSlot,
      },
      select: { id: true },
    });

    if (existing.length !== stapleIds.length) {
      return NextResponse.json(
        { error: 'One or more staple IDs are invalid or do not belong to this meal slot' },
        { status: 400 }
      );
    }

    // Batch update sort orders in a transaction
    await prisma.$transaction(
      stapleIds.map((id, i) =>
        prisma.foodStaple.update({
          where: { id },
          data: { sortOrder: i },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering food staples:', error);
    return NextResponse.json(
      { error: 'Failed to reorder food staples' },
      { status: 500 }
    );
  }
}
