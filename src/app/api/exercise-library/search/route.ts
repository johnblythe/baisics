import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const movementPattern = searchParams.get('movementPattern');
    const limit = parseInt(searchParams.get('limit') || '20');

    const whereClause: any = {};

    // Text search
    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (category) {
      whereClause.category = { equals: category, mode: 'insensitive' };
    }

    // Movement pattern filter
    if (movementPattern) {
      whereClause.movementPattern = movementPattern;
    }

    const exercises = await prisma.exerciseLibrary.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        category: true,
        equipment: true,
        description: true,
        difficulty: true,
        movementPattern: true,
        targetMuscles: true,
        isCompound: true,
        videoUrl: true,
      },
      orderBy: [
        { name: 'asc' },
      ],
      take: limit,
    });

    // Get unique categories for filtering
    const categories = await prisma.exerciseLibrary.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    return NextResponse.json({
      exercises,
      categories: categories.map(c => c.category).filter(Boolean),
    });
  } catch (error) {
    console.error('Error searching exercise library:', error);
    return NextResponse.json(
      { error: 'Failed to search exercise library' },
      { status: 500 }
    );
  }
}
