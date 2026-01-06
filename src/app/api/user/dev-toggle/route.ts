import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const isDev = process.env.NODE_ENV === 'development';

/**
 * POST /api/user/dev-toggle
 * Dev-only endpoint to toggle user roles (isCoach, isPro)
 */
export async function POST(request: Request) {
  // Only allow in development
  if (!isDev) {
    return NextResponse.json({ error: 'Not available' }, { status: 403 });
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { field, value } = await request.json();

    // Only allow specific fields
    if (!['isCoach', 'isPremium'].includes(field)) {
      return NextResponse.json({ error: 'Invalid field' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { [field]: Boolean(value) },
      select: {
        id: true,
        isCoach: true,
        isPremium: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Dev toggle error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
