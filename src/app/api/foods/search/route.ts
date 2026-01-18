import { NextResponse } from 'next/server';
import { searchFoods, simplifyFood } from '@/lib/usda/client';
import { SimplifiedFood } from '@/lib/usda/types';

/**
 * Search foods in USDA FoodData Central
 * GET /api/foods/search?q=chicken&limit=10
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim() || '';
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  // Validate query
  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: 'Query must be at least 2 characters' },
      { status: 400 }
    );
  }

  try {
    const result = await searchFoods(query, limit);

    // Return empty array if no results
    if (!result.foods || result.foods.length === 0) {
      return NextResponse.json({ foods: [] });
    }

    // Simplify foods to only return needed fields
    const foods: SimplifiedFood[] = result.foods.map(simplifyFood);

    return NextResponse.json({ foods });
  } catch (error) {
    console.error('USDA API error:', error);
    return NextResponse.json(
      { error: 'Failed to search USDA database' },
      { status: 502 }
    );
  }
}
