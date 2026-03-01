import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { generateInviteCode, getUserBuddyGroup } from '@/lib/buddy';

// GET — my buddy group + members (or null)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const group = await getUserBuddyGroup(session.user.id);
    return NextResponse.json({ group });
  } catch (error) {
    console.error('Error fetching buddy group:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buddy group' },
      { status: 500 }
    );
  }
}

// POST — create a new buddy group
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user isn't already in a group
    const existing = await prisma.buddyMembership.findFirst({
      where: { userId: session.user.id },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'already_in_group', message: 'You are already in a buddy group' },
        { status: 409 }
      );
    }

    const inviteCode = await generateInviteCode();

    const group = await prisma.buddyGroup.create({
      data: {
        inviteCode,
        memberships: {
          create: {
            userId: session.user.id,
          },
        },
      },
      include: {
        memberships: {
          include: {
            user: {
              select: { id: true, name: true, image: true, email: true },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    console.error('Error creating buddy group:', error);
    return NextResponse.json(
      { error: 'Failed to create buddy group' },
      { status: 500 }
    );
  }
}
