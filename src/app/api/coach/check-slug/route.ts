import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const slug = req.nextUrl.searchParams.get('slug');
    if (!slug) {
      return NextResponse.json({ error: 'Slug required' }, { status: 400 });
    }

    // Normalize
    const normalizedSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (normalizedSlug.length < 3) {
      return NextResponse.json({ available: false, reason: 'Too short (min 3 chars)' });
    }

    if (normalizedSlug.length > 30) {
      return NextResponse.json({ available: false, reason: 'Too long (max 30 chars)' });
    }

    // Check if taken by someone else
    const existing = await prisma.user.findFirst({
      where: {
        inviteSlug: normalizedSlug,
        NOT: { id: session.user.id },
      },
    });

    if (existing) {
      return NextResponse.json({ available: false, reason: 'Already taken' });
    }

    return NextResponse.json({ available: true, normalized: normalizedSlug });
  } catch (error) {
    console.error('Check slug error:', error);
    return NextResponse.json({ error: 'Check failed' }, { status: 500 });
  }
}
