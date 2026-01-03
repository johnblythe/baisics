import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/programs/templates
 * Returns user's templates (programs where isTemplate = true)
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templates = await prisma.program.findMany({
      where: {
        createdBy: session.user.id,
        isTemplate: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        difficulty: true,
        daysPerWeek: true,
        durationWeeks: true,
        isPublic: true,
        cloneCount: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            clones: true, // Number of times this template was cloned
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
