import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { MAX_BUDDY_GROUP_SIZE } from '@/lib/buddy';

// POST — join a buddy group by invite code
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const code = (body.code as string)?.trim().toUpperCase();

    if (!code || code.length !== 8) {
      return NextResponse.json(
        { error: 'invalid_code', message: 'Please enter a valid 8-character code' },
        { status: 400 }
      );
    }

    // Check user isn't already in a group
    const existingMembership = await prisma.buddyMembership.findFirst({
      where: { userId: session.user.id },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: 'already_in_group', message: 'You are already in a buddy group. Leave your current group first.' },
        { status: 409 }
      );
    }

    // Find the group by code
    const group = await prisma.buddyGroup.findUnique({
      where: { inviteCode: code },
      include: {
        _count: { select: { memberships: true } },
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

    if (!group) {
      return NextResponse.json(
        { error: 'invalid_code', message: 'No group found with that code' },
        { status: 404 }
      );
    }

    if (group._count.memberships >= MAX_BUDDY_GROUP_SIZE) {
      return NextResponse.json(
        { error: 'group_full', message: `This group already has ${MAX_BUDDY_GROUP_SIZE} members` },
        { status: 409 }
      );
    }

    // Create membership
    await prisma.buddyMembership.create({
      data: {
        groupId: group.id,
        userId: session.user.id,
      },
    });

    // Return updated group
    const updatedGroup = await prisma.buddyGroup.findUnique({
      where: { id: group.id },
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

    return NextResponse.json({ group: updatedGroup }, { status: 201 });
  } catch (error) {
    console.error('Error joining buddy group:', error);
    return NextResponse.json(
      { error: 'Failed to join buddy group' },
      { status: 500 }
    );
  }
}
