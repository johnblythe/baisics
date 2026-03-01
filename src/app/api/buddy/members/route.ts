import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// DELETE — leave buddy group (hard-delete own membership; last member = delete group)
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const membership = await prisma.buddyMembership.findFirst({
      where: { userId: session.user.id },
      include: {
        group: {
          include: {
            _count: { select: { memberships: true } },
          },
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'not_in_group', message: 'You are not in a buddy group' },
        { status: 404 }
      );
    }

    const isLastMember = membership.group._count.memberships <= 1;

    if (isLastMember) {
      // Delete the entire group (cascade deletes membership too)
      await prisma.buddyGroup.delete({
        where: { id: membership.groupId },
      });
    } else {
      // Just remove this membership
      await prisma.buddyMembership.delete({
        where: { id: membership.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error leaving buddy group:', error);
    return NextResponse.json(
      { error: 'Failed to leave buddy group' },
      { status: 500 }
    );
  }
}
