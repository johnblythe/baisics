import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/logger';
import { checkRateLimit, rateLimitedResponse } from '@/utils/security/rateLimit';
import { randomUUID } from 'crypto';

/**
 * Create a community food entry
 * POST /api/foods/community
 * Body: { name, brand?, protein, carbs, fat }
 */
export async function POST(request: NextRequest) {
  const { ok } = checkRateLimit(request, 20, 60_000);
  if (!ok) return rateLimitedResponse();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { name?: string; brand?: string; protein?: number; carbs?: number; fat?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, brand, protein: rawProtein, carbs: rawCarbs, fat: rawFat } = body;

  // Validate name
  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 200) {
    return NextResponse.json({ error: 'Name must be 2-200 characters' }, { status: 400 });
  }

  // Validate brand
  if (brand !== undefined && brand !== null && (typeof brand !== 'string' || brand.trim().length > 100)) {
    return NextResponse.json({ error: 'Brand must be under 100 characters' }, { status: 400 });
  }

  // Validate macros
  const p = Number(rawProtein);
  const c = Number(rawCarbs);
  const f = Number(rawFat);
  if (isNaN(p) || isNaN(c) || isNaN(f) || p < 0 || c < 0 || f < 0) {
    return NextResponse.json({ error: 'Macros must be non-negative numbers' }, { status: 400 });
  }
  if (p > 100 || c > 100 || f > 100) {
    return NextResponse.json({ error: 'Macro values per 100g seem too high. Please double-check.' }, { status: 400 });
  }
  if (p === 0 && c === 0 && f === 0) {
    return NextResponse.json({ error: 'Enter at least one macro value' }, { status: 400 });
  }

  const protein = Math.round(p * 10) / 10;
  const carbs = Math.round(c * 10) / 10;
  const fat = Math.round(f * 10) / 10;
  const calories = Math.round(p * 4 + c * 4 + f * 9);

  const code = `community:${randomUUID()}`;

  try {
    const food = await prisma.foodsOff.create({
      data: {
        code,
        productName: name.trim(),
        brands: brand?.trim() || null,
        caloriesPer100g: calories,
        proteinPer100g: protein,
        carbsPer100g: carbs,
        fatPer100g: fat,
        isCommunity: true,
        createdByUserId: session.user.id,
      },
    });

    return NextResponse.json({
      id: `off-local:${food.code}`,
      name: food.productName,
      brand: food.brands ?? undefined,
      calories,
      protein,
      carbs,
      fat,
      source: 'COMMUNITY',
      offCode: food.code,
    });
  } catch (error) {
    logError('foods:community:create', error, { userId: session.user.id, foodName: name.trim() });
    return NextResponse.json({ error: 'Failed to create food entry' }, { status: 500 });
  }
}
