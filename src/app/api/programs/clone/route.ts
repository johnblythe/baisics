import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { cloneProgram } from '@/services/programClone';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sourceId, sourceType = 'database' } = body;

    if (!sourceId) {
      return NextResponse.json({ error: 'sourceId is required' }, { status: 400 });
    }

    if (sourceType !== 'static' && sourceType !== 'database') {
      return NextResponse.json(
        { error: 'sourceType must be "static" or "database"' },
        { status: 400 }
      );
    }

    // Check tier restriction for free users
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPremium: true },
    });

    if (!user?.isPremium) {
      // Check if user already has a program
      const existingPrograms = await prisma.program.count({
        where: {
          createdBy: session.user.id,
          isTemplate: false,
        },
      });

      if (existingPrograms > 0) {
        // Get the user's current active program for context
        const activeProgram = await prisma.program.findFirst({
          where: {
            createdBy: session.user.id,
            isTemplate: false,
          },
          orderBy: { createdAt: 'desc' },
          select: { id: true, name: true },
        });

        return NextResponse.json(
          {
            error: 'upgrade_required',
            message: 'Free accounts are limited to one active program at a time.',
            currentProgram: activeProgram,
          },
          { status: 403 }
        );
      }
    }

    const result = await cloneProgram(sourceId, session.user.id, sourceType);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      programId: result.programId,
      programName: result.programName,
      redirectUrl: `/dashboard/${result.programId}`,
    });
  } catch (error) {
    console.error('Clone program error:', error);
    return NextResponse.json(
      { error: 'Failed to clone program' },
      { status: 500 }
    );
  }
}
