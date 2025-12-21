import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAfter } from 'date-fns';

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session ID' },
        { status: 400 }
      );
    }

    // Find and validate the purchase session
    const purchaseSession = await prisma.purchaseSession.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!purchaseSession) {
      return NextResponse.json(
        { error: 'Invalid purchase session' },
        { status: 400 }
      );
    }

    if (purchaseSession.status !== 'pending') {
      return NextResponse.json(
        { error: 'Purchase session already used' },
        { status: 400 }
      );
    }

    if (isAfter(new Date(), purchaseSession.expiresAt)) {
      return NextResponse.json(
        { error: 'Purchase session expired' },
        { status: 400 }
      );
    }

    // Update user and purchase session
    await prisma.$transaction([
      prisma.user.update({
        where: { id: purchaseSession.userId },
        data: { isPremium: true },
      }),
      prisma.purchaseSession.update({
        where: { id: sessionId },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      email: purchaseSession.user.email,
      userId: purchaseSession.userId
    });
  } catch (error) {
    console.error('Failed to complete purchase session:', error);
    return NextResponse.json(
      { error: 'Failed to complete purchase session' },
      { status: 500 }
    );
  }
} 