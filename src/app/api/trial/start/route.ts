import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { calculateTrialEnd } from '@/lib/trial';
import { logError } from '@/lib/logger';

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const trialEndsAt = calculateTrialEnd(now);

    // Atomic check-and-set: only update if not premium AND no existing trial
    const result = await prisma.user.updateMany({
      where: {
        id: session.user.id,
        isPremium: false,
        trialStartedAt: null,
      },
      data: { trialStartedAt: now, trialEndsAt },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Trial already used or already premium' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      trialEndsAt: trialEndsAt.toISOString(),
    });
  } catch (error) {
    logError('api/trial/start', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
