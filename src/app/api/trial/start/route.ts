import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { calculateTrialEnd } from '@/lib/trial';

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPremium: true, trialStartedAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.isPremium) {
      return NextResponse.json({ error: 'Already premium' }, { status: 400 });
    }

    if (user.trialStartedAt) {
      return NextResponse.json({ error: 'Trial already used' }, { status: 400 });
    }

    const now = new Date();
    const trialEndsAt = calculateTrialEnd();

    await prisma.user.update({
      where: { id: session.user.id },
      data: { trialStartedAt: now, trialEndsAt },
    });

    return NextResponse.json({
      success: true,
      trialEndsAt: trialEndsAt.toISOString(),
    });
  } catch (error) {
    console.error('Error starting trial:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
