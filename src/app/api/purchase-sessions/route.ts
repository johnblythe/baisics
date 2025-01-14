import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { add } from 'date-fns';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 400 }
      );
    }

    // Create a purchase session that expires in 15 minutes
    const purchaseSession = await prisma.purchaseSession.create({
      data: {
        userId,
        expiresAt: add(new Date(), { minutes: 15 }),
      },
    });

    return NextResponse.json({ sessionId: purchaseSession.id });
  } catch (error) {
    console.error('Failed to create purchase session:', error);
    return NextResponse.json(
      { error: 'Failed to create purchase session' },
      { status: 500 }
    );
  }
} 