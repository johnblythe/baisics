import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/programs/templates
 * Returns user's programs with optional filter.
 *
 * Query params:
 *   ?filter=all        (default) All programs created by this user
 *   ?filter=templates   Programs where isTemplate = true
 *   ?filter=assigned    Programs where source = 'assigned'
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const filter = request.nextUrl.searchParams.get('filter') || 'all';

    // Build where clause based on filter
    const where: Record<string, unknown> = {
      createdBy: session.user.id,
    };

    if (filter === 'templates') {
      where.isTemplate = true;
    } else if (filter === 'assigned') {
      where.source = 'assigned';
    }
    // 'all' = no extra filters (all programs by this coach)

    const templates = await prisma.program.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        difficulty: true,
        daysPerWeek: true,
        durationWeeks: true,
        isPublic: true,
        isTemplate: true,
        cloneCount: true,
        source: true,
        active: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        ownerUser: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: {
            clones: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Get templates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
