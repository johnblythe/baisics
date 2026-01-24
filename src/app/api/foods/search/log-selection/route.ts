import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Log when a user selects a search result
 * POST /api/foods/search/log-selection
 *
 * Body: { searchId, selectedFdcId, selectedName, source, searchDurationMs? }
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { searchId, selectedFdcId, selectedName, source, searchDurationMs } = body;

    if (!searchId) {
      return NextResponse.json(
        { error: 'searchId is required' },
        { status: 400 }
      );
    }

    // Verify the search log belongs to this user
    const existingLog = await prisma.foodSearchLog.findFirst({
      where: {
        id: searchId,
        userId: session.user.id,
      },
    });

    if (!existingLog) {
      return NextResponse.json(
        { error: 'Search log not found' },
        { status: 404 }
      );
    }

    // Update the search log with selection details
    await prisma.foodSearchLog.update({
      where: { id: searchId },
      data: {
        action: 'SELECTED',
        selectedFdcId: selectedFdcId || null,
        selectedName: selectedName || null,
        source: source || null,
        searchDurationMs: searchDurationMs || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Log selection error:', error);
    return NextResponse.json(
      { error: 'Failed to log selection' },
      { status: 500 }
    );
  }
}
