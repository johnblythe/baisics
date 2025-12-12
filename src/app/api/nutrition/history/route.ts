import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');

    // Build date filter
    const dateFilter: { gte?: Date; lte?: Date } = {};

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      dateFilter.gte = start;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }

    // Default: last 30 days if no dates specified
    if (!startDate && !endDate) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      dateFilter.gte = thirtyDaysAgo;
    }

    const nutritionLogs = await prisma.nutritionLog.findMany({
      where: {
        userId: session.user.id,
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
      },
      orderBy: { date: 'desc' },
      take: limit ? parseInt(limit, 10) : undefined,
    });

    // Calculate summary stats
    const totalDays = nutritionLogs.length;
    const avgCalories = totalDays > 0
      ? Math.round(nutritionLogs.reduce((sum: number, log) => sum + log.calories, 0) / totalDays)
      : 0;
    const avgProtein = totalDays > 0
      ? Math.round(nutritionLogs.reduce((sum: number, log) => sum + log.protein, 0) / totalDays)
      : 0;
    const avgCarbs = totalDays > 0
      ? Math.round(nutritionLogs.reduce((sum: number, log) => sum + log.carbs, 0) / totalDays)
      : 0;
    const avgFats = totalDays > 0
      ? Math.round(nutritionLogs.reduce((sum: number, log) => sum + log.fats, 0) / totalDays)
      : 0;

    return NextResponse.json({
      logs: nutritionLogs,
      summary: {
        totalDays,
        avgCalories,
        avgProtein,
        avgCarbs,
        avgFats,
      },
    });
  } catch (error) {
    console.error('Error fetching nutrition history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nutrition history' },
      { status: 500 }
    );
  }
}
