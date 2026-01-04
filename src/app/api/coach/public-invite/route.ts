import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET - Get or create public invite link for coach
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a coach
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isCoach: true },
    });

    if (!user?.isCoach) {
      return NextResponse.json({ error: 'Not a coach account' }, { status: 403 });
    }

    // Look for existing public invite (inviteEmail: null, no clientId)
    let publicInvite = await prisma.coachClient.findFirst({
      where: {
        coachId: session.user.id,
        inviteEmail: null,
        clientId: null,
      },
    });

    // Create if doesn't exist
    if (!publicInvite) {
      const inviteToken = crypto.randomUUID();
      publicInvite = await prisma.coachClient.create({
        data: {
          coachId: session.user.id,
          inviteToken,
          inviteEmail: null,
          clientId: null,
          inviteStatus: 'PENDING',
          status: 'ACTIVE',
        },
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://baisics.app';
    const inviteUrl = `${baseUrl}/coach/invite/${publicInvite.inviteToken}`;

    return NextResponse.json({
      token: publicInvite.inviteToken,
      url: inviteUrl,
    });
  } catch (error) {
    console.error('Error getting public invite:', error);
    return NextResponse.json(
      { error: 'Failed to get public invite' },
      { status: 500 }
    );
  }
}

// DELETE - Regenerate public invite token
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find and delete existing public invite
    await prisma.coachClient.deleteMany({
      where: {
        coachId: session.user.id,
        inviteEmail: null,
        clientId: null,
      },
    });

    // Create new one
    const inviteToken = crypto.randomUUID();
    const publicInvite = await prisma.coachClient.create({
      data: {
        coachId: session.user.id,
        inviteToken,
        inviteEmail: null,
        clientId: null,
        inviteStatus: 'PENDING',
        status: 'ACTIVE',
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://baisics.app';
    const inviteUrl = `${baseUrl}/coach/invite/${publicInvite.inviteToken}`;

    return NextResponse.json({
      token: publicInvite.inviteToken,
      url: inviteUrl,
    });
  } catch (error) {
    console.error('Error regenerating public invite:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate invite' },
      { status: 500 }
    );
  }
}
