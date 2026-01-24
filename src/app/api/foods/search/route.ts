import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { unifiedSearch } from '@/lib/food-search';
import { prisma } from '@/lib/prisma';

/**
 * Search foods across all sources (QuickFoods, USDA, Open Food Facts)
 * GET /api/foods/search?q=chicken&limit=10
 *
 * Returns unified results with source field indicating origin.
 * User's QuickFoods appear first in results.
 */
export async function GET(request: Request) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim() || '';
  const parsedLimit = parseInt(searchParams.get('limit') || '25', 10);
  // Validate limit: handle NaN, clamp between 1 and 50
  const limit = isNaN(parsedLimit) ? 25 : Math.min(Math.max(parsedLimit, 1), 50);

  // Validate query
  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: 'Query must be at least 2 characters' },
      { status: 400 }
    );
  }

  try {
    const result = await unifiedSearch(query, {
      userId: session.user.id,
      pageSize: limit,
    });

    // Log the search query (non-blocking, don't await)
    const searchLog = await prisma.foodSearchLog.create({
      data: {
        userId: session.user.id,
        query,
        resultCount: result.results.length,
        action: 'REFINED', // Initial search is marked as REFINED until selection/abandon
      },
    });

    // Return foods with source field and searchId for tracking
    return NextResponse.json({
      foods: result.results,
      counts: result.counts,
      searchId: searchLog.id,
    });
  } catch (error) {
    console.error('Food search error:', error);

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
        error: 'Failed to search food databases',
        ...(isDev && { details: errorMessage })
      },
      { status: 502 }
    );
  }
}
