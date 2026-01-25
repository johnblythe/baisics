import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { resolveNutritionTargets } from '@/lib/nutrition/resolveTargets';

/**
 * GET /api/nutrition-plan
 * Fetches current nutrition targets for the authenticated user.
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await resolveNutritionTargets(session.user.id);

    return NextResponse.json({
      plan: result.plan,
      source: result.source,
      isDefault: result.isDefault,
    });
  } catch (error) {
    console.error('Error fetching nutrition plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nutrition plan' },
      { status: 500 }
    );
  }
}
