import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
// import { getSession } from '@/lib/auth';

export async function trackActivity(req: NextRequest) {
  const userId = process.env.TEST_USER_ID;
  try {
    // const session = await getSession();
    if (!userId) return;

    const currentProgram = await prisma.program.findFirst({
      where: {
        createdBy: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!currentProgram) return;

    // Track the activity
    await prisma.userActivity.create({
      data: {
        userId: userId,
        programId: currentProgram.id,
        type: 'visit',
        metadata: {
          path: req.nextUrl.pathname,
          userAgent: req.headers.get('user-agent'),
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Failed to track activity:', error);
  }
}

export async function middleware(request: NextRequest) {
  // Only track activity for HTML pages
  if (!request.headers.get('accept')?.includes('text/html')) {
    return NextResponse.next();
  }

  // Don't track activity for API routes or static files
  if (request.nextUrl.pathname.startsWith('/api') || 
      request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.startsWith('/static')) {
    return NextResponse.next();
  }

  await trackActivity(request);
  return NextResponse.next();
} 