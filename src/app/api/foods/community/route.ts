import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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

  const { name, brand, protein, carbs, fat } = body;

  // Validate name
  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 200) {
    return NextResponse.json({ error: 'Name must be 2-200 characters' }, { status: 400 });
  }

  // Validate macros
  const p = Number(protein);
  const c = Number(carbs);
  const f = Number(fat);
  if (isNaN(p) || isNaN(c) || isNaN(f) || p < 0 || c < 0 || f < 0) {
    return NextResponse.json({ error: 'Macros must be non-negative numbers' }, { status: 400 });
  }

  // Auto-calculate calories: P*4 + C*4 + F*9
  const calories = Math.round(p * 4 + c * 4 + f * 9);

  const code = `community:${randomUUID()}`;

  try {
    const food = await prisma.foodsOff.create({
      data: {
        code,
        productName: name.trim(),
        brands: brand?.trim() || null,
        caloriesPer100g: calories,
        proteinPer100g: Math.round(p * 10) / 10,
        carbsPer100g: Math.round(c * 10) / 10,
        fatPer100g: Math.round(f * 10) / 10,
        isCommunity: true,
        createdByUserId: session.user.id,
      },
    });

    // search_vector is a GENERATED ALWAYS column — auto-populated from product_name + brands on INSERT

    return NextResponse.json({
      id: `off-local:${food.code}`,
      name: food.productName,
      brand: food.brands ?? undefined,
      calories,
      protein: Math.round(p * 10) / 10,
      carbs: Math.round(c * 10) / 10,
      fat: Math.round(f * 10) / 10,
      source: 'COMMUNITY',
      offCode: food.code,
    });
  } catch (error) {
    console.error('Failed to create community food:', error);
    return NextResponse.json({ error: 'Failed to create food entry' }, { status: 500 });
  }
}
