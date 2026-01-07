import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import type { CoachAnalyticsResponse } from '@/types/coach-analytics';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isCoach: true },
    });

    if (!user?.isCoach) {
      return NextResponse.json({ error: 'Not a coach account' }, { status: 403 });
    }

    // Get all client IDs for this coach
    const coachClients = await prisma.coachClient.findMany({
      where: {
        coachId: session.user.id,
        clientId: { not: null },
        status: { not: 'ARCHIVED' },
      },
      select: { clientId: true },
    });

    const clientIds = coachClients
      .map((c) => c.clientId)
      .filter((id): id is string => id !== null);

    if (clientIds.length === 0) {
      return NextResponse.json({
        summary: {
          totalClients: 0,
          activeThisWeek: 0,
          avgWorkoutsPerWeek: 0,
          programCompletionRate: 0,
          totalWorkoutsLogged: 0,
          totalCheckIns: 0,
        },
        weeklyTrend: [],
        clientEngagement: [],
      });
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

    // Get workout logs for all clients in last 4 weeks
    const workoutLogs = await prisma.workoutLog.findMany({
      where: {
        userId: { in: clientIds },
        completedAt: { gte: fourWeeksAgo },
        status: 'completed',
      },
      select: {
        userId: true,
        completedAt: true,
        programId: true,
      },
    });

    // Get total completed workouts
    const totalWorkoutsLogged = await prisma.workoutLog.count({
      where: {
        userId: { in: clientIds },
        status: 'completed',
      },
    });

    // Get total check-ins
    const totalCheckIns = await prisma.checkIn.count({
      where: {
        userId: { in: clientIds },
      },
    });

    // Get active programs and their completion status
    const programs = await prisma.program.findMany({
      where: {
        userId: { in: clientIds },
        active: true,
      },
      include: {
        workoutPlans: {
          include: {
            workouts: true,
          },
        },
        workoutLogs: {
          where: { status: 'completed' },
        },
      },
    });

    // Calculate program completion rates
    let totalProgramWorkouts = 0;
    let completedProgramWorkouts = 0;
    programs.forEach((program) => {
      const total = program.workoutPlans.reduce(
        (acc, plan) => acc + plan.workouts.length,
        0
      );
      totalProgramWorkouts += total;
      completedProgramWorkouts += Math.min(program.workoutLogs.length, total);
    });

    const programCompletionRate =
      totalProgramWorkouts > 0
        ? Math.round((completedProgramWorkouts / totalProgramWorkouts) * 100)
        : 0;

    // Clients active this week
    const activeClientIds = new Set(
      workoutLogs
        .filter((log) => log.completedAt && log.completedAt >= weekAgo)
        .map((log) => log.userId)
    );

    // Weekly trend (last 4 weeks)
    const weeklyTrend = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);

      const weekLogs = workoutLogs.filter(
        (log) =>
          log.completedAt &&
          log.completedAt >= weekStart &&
          log.completedAt < weekEnd
      );

      const uniqueActiveClients = new Set(weekLogs.map((log) => log.userId));

      weeklyTrend.push({
        week: `Week ${4 - i}`,
        weekStart: weekStart.toISOString().split('T')[0],
        workouts: weekLogs.length,
        activeClients: uniqueActiveClients.size,
      });
    }

    // Client engagement (workouts per client this month)
    const clientEngagement = clientIds.map((clientId) => {
      const clientLogs = workoutLogs.filter((log) => log.userId === clientId);
      return {
        clientId,
        workoutsLast4Weeks: clientLogs.length,
        avgPerWeek: Math.round((clientLogs.length / 4) * 10) / 10,
        active: activeClientIds.has(clientId),
      };
    });

    // Sort by most active
    clientEngagement.sort((a, b) => b.workoutsLast4Weeks - a.workoutsLast4Weeks);

    // Average workouts per week per client (who has logged at least one)
    const activeClientCount = clientEngagement.filter((c) => c.workoutsLast4Weeks > 0).length;
    const totalWorkoutsLast4Weeks = workoutLogs.length;
    const avgWorkoutsPerWeek =
      activeClientCount > 0
        ? Math.round((totalWorkoutsLast4Weeks / 4 / activeClientCount) * 10) / 10
        : 0;

    const response: CoachAnalyticsResponse = {
      summary: {
        totalClients: clientIds.length,
        activeThisWeek: activeClientIds.size,
        avgWorkoutsPerWeek,
        programCompletionRate,
        totalWorkoutsLogged,
        totalCheckIns,
      },
      weeklyTrend,
      clientEngagement: clientEngagement.slice(0, 10), // Top 10
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching coach analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
