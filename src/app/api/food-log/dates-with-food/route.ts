import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/food-log/dates-with-food
 * Returns a list of dates that have logged food entries for the user
 * Used to highlight selectable dates in the date picker for "Copy from any day"
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    // Optional: limit how far back to look (default 90 days)
    const daysBack = parseInt(searchParams.get('days') || '90', 10);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    startDate.setHours(0, 0, 0, 0);

    // Get distinct dates with food entries
    const entries = await prisma.foodLogEntry.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lt: new Date(), // Only past dates (not today or future)
        },
      },
      select: {
        date: true,
      },
      distinct: ['date'],
      orderBy: {
        date: 'desc',
      },
    });

    // Extract unique dates as ISO strings (YYYY-MM-DD)
    const dates = entries.map((entry) => {
      const d = new Date(entry.date);
      return d.toISOString().split('T')[0];
    });

    // Remove duplicates (in case of timezone issues) and sort descending
    const uniqueDates = [...new Set(dates)].sort((a, b) => b.localeCompare(a));

    return NextResponse.json({
      dates: uniqueDates,
      count: uniqueDates.length,
      startDate: startDate.toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('Error fetching dates with food:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dates' },
      { status: 500 }
    );
  }
}
