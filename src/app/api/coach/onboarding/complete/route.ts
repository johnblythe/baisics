import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a coach before marking onboarding complete
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isCoach: true },
    });

    if (!user?.isCoach) {
      return NextResponse.json({ error: 'Not a coach account' }, { status: 403 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { coachOnboardedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
