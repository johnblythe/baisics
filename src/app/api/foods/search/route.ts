import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { searchFoods, simplifyFood } from '@/lib/usda/client';
import { SimplifiedFood } from '@/lib/usda/types';

/**
 * Search foods in USDA FoodData Central
 * GET /api/foods/search?q=chicken&limit=10
 */
export async function GET(request: Request) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim() || '';
  const parsedLimit = parseInt(searchParams.get('limit') || '10', 10);
  // Validate limit: handle NaN, clamp between 1 and 50
  const limit = isNaN(parsedLimit) ? 10 : Math.min(Math.max(parsedLimit, 1), 50);

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

    const errorMessage = error instanceof Error ? error.message : String(error);
    const isDev = process.env.NODE_ENV === 'development';

    // Categorize errors and return user-friendly messages
    if (errorMessage.toLowerCase().includes('api_key') || errorMessage.toLowerCase().includes('api key')) {
      return NextResponse.json(
        {
          error: 'Food search temporarily unavailable',
          ...(isDev && { details: errorMessage })
        },
        { status: 503 }
      );
    }

    if (errorMessage.toLowerCase().includes('network')) {
      return NextResponse.json(
        {
          error: 'Unable to reach food database',
          ...(isDev && { details: errorMessage })
        },
        { status: 503 }
      );
    }

    if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('rate')) {
      return NextResponse.json(
        {
          error: 'Too many requests, please wait',
          ...(isDev && { details: errorMessage })
        },
        { status: 429 }
      );
    }

    // Default error for unrecognized errors
    return NextResponse.json(
      {
        error: 'Failed to search USDA database',
        ...(isDev && { details: errorMessage })
      },
      { status: 502 }
    );
  }
}
