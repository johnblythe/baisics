import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { PrimaryGoal } from '@prisma/client';

/**
 * Valid primary goal values
 */
const VALID_PRIMARY_GOALS: PrimaryGoal[] = [
  'LOSE_WEIGHT',
  'BUILD_MUSCLE',
  'MAINTAIN',
  'HEALTH',
];

/**
 * GET /api/goal
 * Fetches the current user's fitness goal, or null if none set.
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goal = await prisma.goal.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        primaryGoal: true,
        targetWeight: true,
        timeframe: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ goal });
  } catch (error) {
    console.error('Error fetching goal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goal' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/goal
 * Creates or updates the user's fitness goal (upsert).
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { primaryGoal, targetWeight, timeframe, notes } = body;

    // Validate required field: primaryGoal
    if (!primaryGoal || typeof primaryGoal !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: primaryGoal' },
        { status: 400 }
      );
    }

    // Validate primaryGoal is a valid enum value
    if (!VALID_PRIMARY_GOALS.includes(primaryGoal as PrimaryGoal)) {
      return NextResponse.json(
        { error: `Invalid primaryGoal. Must be one of: ${VALID_PRIMARY_GOALS.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate optional fields if provided
    if (targetWeight !== undefined && targetWeight !== null) {
      if (typeof targetWeight !== 'number' || targetWeight <= 0) {
        return NextResponse.json(
          { error: 'targetWeight must be a positive number' },
          { status: 400 }
        );
      }
    }

    if (timeframe !== undefined && timeframe !== null) {
      if (typeof timeframe !== 'string') {
        return NextResponse.json(
          { error: 'timeframe must be a string' },
          { status: 400 }
        );
      }
    }

    if (notes !== undefined && notes !== null) {
      if (typeof notes !== 'string') {
        return NextResponse.json(
          { error: 'notes must be a string' },
          { status: 400 }
        );
      }
    }

    // Upsert the goal (create if doesn't exist, update if does)
    const goal = await prisma.goal.upsert({
      where: {
        userId: session.user.id,
      },
      create: {
        userId: session.user.id,
        primaryGoal: primaryGoal as PrimaryGoal,
        targetWeight: targetWeight ?? null,
        timeframe: timeframe ?? null,
        notes: notes ?? null,
      },
      update: {
        primaryGoal: primaryGoal as PrimaryGoal,
        targetWeight: targetWeight ?? null,
        timeframe: timeframe ?? null,
        notes: notes ?? null,
      },
      select: {
        id: true,
        primaryGoal: true,
        targetWeight: true,
        timeframe: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error('Error saving goal:', error);
    return NextResponse.json(
      { error: 'Failed to save goal' },
      { status: 500 }
    );
  }
}
