import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

/**
 * Generate a share link for a program
 * POST /api/programs/share
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { programId } = body;

    if (!programId) {
      return NextResponse.json({ error: 'programId is required' }, { status: 400 });
    }

    // Verify ownership
    const program = await prisma.program.findFirst({
      where: { id: programId, createdBy: session.user.id }
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Generate or return existing share ID
    let shareId = program.shareId;
    if (!shareId) {
      shareId = nanoid(10); // Short, URL-safe ID
      await prisma.program.update({
        where: { id: programId },
        data: { shareId }
      });
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://baisics.app'}/p/${shareId}`;

    return NextResponse.json({
      success: true,
      shareId,
      shareUrl
    });
  } catch (error) {
    console.error('Error generating share link:', error);
    return NextResponse.json(
      { error: 'Failed to generate share link' },
      { status: 500 }
    );
  }
}
