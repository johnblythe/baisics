import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { MealType } from '@prisma/client';
import { getBuddyUserIds } from '@/lib/buddy';

const MAX_BUDDY_STAPLES_PER_SLOT = 3;

// GET /api/food-staples - returns staples for user + buddy staples, optionally filtered by mealSlot
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mealSlot = searchParams.get('mealSlot');

    // Validate mealSlot if provided
    if (mealSlot && !Object.values(MealType).includes(mealSlot as MealType)) {
      return NextResponse.json(
        { error: `Invalid mealSlot. Must be one of: ${Object.values(MealType).join(', ')}` },
        { status: 400 }
      );
    }

    const slotFilter = mealSlot ? { mealSlot: mealSlot as MealType } : {};

    // Own staples (full set)
    const ownStaples = await prisma.foodStaple.findMany({
      where: {
        userId: session.user.id,
        ...slotFilter,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: [
        { mealSlot: 'asc' },
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    // Buddy staples (capped per slot) — gracefully degrade if buddy tables aren't ready
    let buddyStaples: typeof ownStaples = [];
    try {
      const buddyIds = await getBuddyUserIds(session.user.id);

      if (buddyIds.length > 0) {
        const allBuddyStaples = await prisma.foodStaple.findMany({
          where: {
            userId: { in: buddyIds },
            ...slotFilter,
          },
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
          orderBy: [
            { mealSlot: 'asc' },
            { sortOrder: 'asc' },
          ],
        });

        // Cap buddy staples to MAX_BUDDY_STAPLES_PER_SLOT per slot
        const slotCounts: Record<string, number> = {};
        buddyStaples = allBuddyStaples.filter((s) => {
          const slot = s.mealSlot;
          slotCounts[slot] = (slotCounts[slot] || 0) + 1;
          return slotCounts[slot] <= MAX_BUDDY_STAPLES_PER_SLOT;
        });
      }
    } catch (e) {
      // Buddy tables may not exist yet — return own staples only
      console.warn('Buddy staples query failed, skipping:', e);
    }

    return NextResponse.json({ staples: ownStaples, buddyStaples });
  } catch (error) {
    console.error('Error fetching food staples:', error);
    return NextResponse.json(
      { error: 'Failed to fetch food staples' },
      { status: 500 }
    );
  }
}

// POST /api/food-staples - create a new food staple
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { mealSlot, name, emoji, calories, protein, carbs, fat, recipeId, quickFoodId, items } = body;

    // Validate required fields
    if (!mealSlot || !name || calories == null || protein == null || carbs == null || fat == null) {
      return NextResponse.json(
        { error: 'Required fields: mealSlot, name, calories, protein, carbs, fat' },
        { status: 400 }
      );
    }

    // Validate mealSlot
    if (!Object.values(MealType).includes(mealSlot)) {
      return NextResponse.json(
        { error: `Invalid mealSlot. Must be one of: ${Object.values(MealType).join(', ')}` },
        { status: 400 }
      );
    }

    // Validate mutual exclusivity
    if (recipeId && quickFoodId) {
      return NextResponse.json(
        { error: 'Cannot set both recipeId and quickFoodId' },
        { status: 400 }
      );
    }

    // Check for duplicate (same name in same slot)
    const existing = await prisma.foodStaple.findFirst({
      where: {
        userId: session.user.id,
        mealSlot: mealSlot as MealType,
        name: { equals: name, mode: 'insensitive' },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Already pinned as a staple', staple: existing },
        { status: 409 }
      );
    }

    // Max 5 per slot — count + insert in transaction to prevent race
    const staple = await prisma.$transaction(async (tx) => {
      const count = await tx.foodStaple.count({
        where: {
          userId: session.user!.id!,
          mealSlot: mealSlot as MealType,
        },
      });

      if (count >= 5) {
        throw new Error('MAX_STAPLES_PER_SLOT');
      }

      return tx.foodStaple.create({
        data: {
          userId: session.user!.id!,
          mealSlot: mealSlot as MealType,
          name,
          emoji: emoji || null,
          calories: Math.round(calories),
          protein: parseFloat(protein.toString()),
          carbs: parseFloat(carbs.toString()),
          fat: parseFloat(fat.toString()),
          recipeId: recipeId || null,
          quickFoodId: quickFoodId || null,
          items: items || null,
          sortOrder: count, // append to end
        },
      });
    });

    return NextResponse.json({ staple }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'MAX_STAPLES_PER_SLOT') {
      return NextResponse.json(
        { error: 'Maximum 5 staples per meal slot' },
        { status: 409 }
      );
    }
    console.error('Error creating food staple:', error);
    return NextResponse.json(
      { error: 'Failed to create food staple' },
      { status: 500 }
    );
  }
}
