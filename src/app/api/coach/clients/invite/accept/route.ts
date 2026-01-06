import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { canAddMoreClients, getClientLimit } from '@/lib/coach-tiers';

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

    const isPublicInvite = coachClient.inviteEmail === null;

    // For private invites, check status
    if (!isPublicInvite && coachClient.inviteStatus !== 'PENDING') {
      return NextResponse.json(
        { error: 'Invite already used or expired' },
        { status: 400 }
      );
    }

    // Check if user is already a client of this coach
    const existingRelation = await prisma.coachClient.findFirst({
      where: {
        coachId: coachClient.coachId,
        clientId: session.user.id,
      },
    });

    if (existingRelation) {
      return NextResponse.json(
        { error: 'You are already a client of this coach' },
        { status: 400 }
      );
    }

    // Check if coach has reached their client limit
    const coach = await prisma.user.findUnique({
      where: { id: coachClient.coachId },
      select: {
        coachTier: true,
        _count: {
          select: {
            coachClients: {
              where: {
                clientId: { not: null }, // Only count actual clients, not placeholder invites
              },
            },
          },
        },
      },
    });

    if (coach && !canAddMoreClients(coach.coachTier, coach._count.coachClients)) {
      const limit = getClientLimit(coach.coachTier);
      return NextResponse.json(
        {
          error: 'coach_client_limit_reached',
          message: 'This coach has reached their client limit',
          limit,
        },
        { status: 403 }
      );
    }

    if (isPublicInvite) {
      // Public invite: create NEW CoachClient, keep the public invite intact
      await prisma.coachClient.create({
        data: {
          coachId: coachClient.coachId,
          clientId: session.user.id,
          inviteStatus: 'ACCEPTED',
          status: 'ACTIVE',
        },
      });
    } else {
      // Private invite: update the existing record
      await prisma.coachClient.update({
        where: { id: coachClient.id },
        data: {
          clientId: session.user.id,
          inviteStatus: 'ACCEPTED',
          inviteToken: null,
          inviteEmail: null,
        },
      });
    }

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
