import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        isPremium: true,
        isCoach: true,
        streakCurrent: true,
        streakLongest: true,
        subscription: {
          select: {
            status: true,
          },
        },
        // Get this user's coach (if they have one)
        coachOf: {
          where: {
            status: 'ACTIVE',
            inviteStatus: 'ACCEPTED',
          },
          take: 1,
          select: {
            coach: {
              select: {
                id: true,
                name: true,
                brandName: true,
                brandColor: true,
                brandLogo: true,
              },
            },
          },
        },
      },
    });

    // Extract coach info if exists
    const coachRelation = user?.coachOf?.[0];
    const coach = coachRelation?.coach
      ? {
          id: coachRelation.coach.id,
          name: coachRelation.coach.brandName || coachRelation.coach.name,
          brandColor: coachRelation.coach.brandColor || '#FF6B6B',
          brandLogo: coachRelation.coach.brandLogo,
        }
      : null;

    // Flatten for easier consumption
    return NextResponse.json({
      id: user?.id,
      email: user?.email,
      name: user?.name,
      isPremium: user?.isPremium,
      isCoach: user?.isCoach,
      streakCurrent: user?.streakCurrent,
      streakLongest: user?.streakLongest,
      subscriptionStatus: user?.subscription?.status || null,
      coach,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 