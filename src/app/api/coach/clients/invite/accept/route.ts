import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    const coachClient = await prisma.coachClient.findUnique({
      where: { inviteToken: token },
    });

    if (!coachClient) {
      return NextResponse.json({ error: 'Invalid invite' }, { status: 404 });
    }

    if (coachClient.inviteStatus !== 'PENDING') {
      return NextResponse.json(
        { error: 'Invite already used or expired' },
        { status: 400 }
      );
    }

    // Update the coach-client relationship
    await prisma.coachClient.update({
      where: { id: coachClient.id },
      data: {
        clientId: session.user.id,
        inviteStatus: 'ACCEPTED',
        inviteToken: null, // Clear token after use
        inviteEmail: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Invite accepted successfully',
    });
  } catch (error) {
    console.error('Error accepting invite:', error);
    return NextResponse.json(
      { error: 'Failed to accept invite' },
      { status: 500 }
    );
  }
}
