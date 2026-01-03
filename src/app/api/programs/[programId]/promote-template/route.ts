import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/programs/[programId]/promote-template
 * Promotes a program to a template (sets isTemplate: true)
 * Only the program author can promote their own program
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { programId } = await params;

    let isPublic = false;
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      try {
        const body = await request.json();
        isPublic = body.isPublic ?? false;
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
      }
    }

    // Verify program exists and user owns it
    const program = await prisma.program.findUnique({
      where: { id: programId },
      select: {
        id: true,
        name: true,
        createdBy: true,
        isTemplate: true,
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    if (program.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the program author can promote to template' },
        { status: 403 }
      );
    }

    if (program.isTemplate) {
      return NextResponse.json(
        { error: 'Program is already a template' },
        { status: 400 }
      );
    }

    // Promote to template
    const updated = await prisma.program.update({
      where: { id: programId },
      data: {
        isTemplate: true,
        isPublic,
      },
      select: {
        id: true,
        name: true,
        isTemplate: true,
        isPublic: true,
      },
    });

    return NextResponse.json({
      success: true,
      program: updated,
    });
  } catch (error) {
    console.error('Promote template error:', error);
    return NextResponse.json(
      { error: 'Failed to promote program to template' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/programs/[programId]/promote-template
 * Demotes a template back to a regular program
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { programId } = await params;

    // Verify program exists and user owns it
    const program = await prisma.program.findUnique({
      where: { id: programId },
      select: {
        id: true,
        createdBy: true,
        isTemplate: true,
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    if (program.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the program author can demote a template' },
        { status: 403 }
      );
    }

    if (!program.isTemplate) {
      return NextResponse.json(
        { error: 'Program is not a template' },
        { status: 400 }
      );
    }

    // Demote from template
    await prisma.program.update({
      where: { id: programId },
      data: {
        isTemplate: false,
        isPublic: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Demote template error:', error);
    return NextResponse.json(
      { error: 'Failed to demote template' },
      { status: 500 }
    );
  }
}
