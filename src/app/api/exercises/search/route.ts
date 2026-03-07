import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { expandExerciseSynonyms } from '@/lib/exercise-synonyms';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || undefined;
  const equipment = searchParams.get('equipment') || undefined;
  const muscle = searchParams.get('muscle') || undefined;
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10) || 20, 100);

  // Allow empty query if filters are set
  const hasFilters = category || equipment || muscle;
  if ((!query || query.length < 2) && !hasFilters) {
    return NextResponse.json([]);
  }

  // Sanitize, expand synonyms, and limit query length
  const sanitizedQuery = expandExerciseSynonyms(query.trim()).slice(0, 100);

  // Build where clause
  const where: Record<string, unknown> = {};

  if (sanitizedQuery) {
    where.name = { contains: sanitizedQuery, mode: 'insensitive' };
  }

  if (category) {
    where.category = { equals: category, mode: 'insensitive' };
  }

  if (equipment) {
    where.equipment = { has: equipment };
  }

  if (muscle) {
    where.targetMuscles = { has: muscle };
  }

  try {
    const exercises = await prisma.exerciseLibrary.findMany({
      where,
      select: {
        id: true,
        name: true,
        category: true,
        equipment: true,
        targetMuscles: true,
      },
      take: limit,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(exercises);
  } catch (error) {
    console.error('Exercise search failed:', {
      query: sanitizedQuery,
      error: error instanceof Error ? error.message : error,
    });
    return NextResponse.json(
      { error: 'Unable to search exercises. Please try again.' },
      { status: 500 }
    );
  }
}
