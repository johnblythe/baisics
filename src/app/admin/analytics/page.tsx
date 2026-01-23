import { prisma } from '@/lib/prisma';
import AnalyticsClient from './AnalyticsClient';

interface SearchParams {
  days?: string;
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const days = parseInt(params.days || '30', 10);

  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - days);

  // Funnel metrics
  const [funnelData, dailyData, recentUsers, recentPrograms] = await Promise.all([
    // Aggregate funnel counts
    prisma.appLog.groupBy({
      by: ['type'],
      where: {
        createdAt: { gte: dateLimit },
        category: { in: ['auth', 'onboarding', 'program', 'workout'] },
      },
      _count: { type: true },
    }),

    // Daily breakdown
    prisma.$queryRaw<Array<{
      day: Date;
      magic_links: bigint;
      signups: bigint;
      onboarding: bigint;
      programs: bigint;
      workouts: bigint;
    }>>`
      SELECT
        DATE(created_at) as day,
        SUM(CASE WHEN type = 'magic_link_requested' THEN 1 ELSE 0 END)::bigint as magic_links,
        SUM(CASE WHEN type = 'signup_completed' THEN 1 ELSE 0 END)::bigint as signups,
        SUM(CASE WHEN type = 'onboarding_started' THEN 1 ELSE 0 END)::bigint as onboarding,
        SUM(CASE WHEN type = 'program_generation_completed' THEN 1 ELSE 0 END)::bigint as programs,
        SUM(CASE WHEN type IN ('workout_completed', 'first_workout_completed') THEN 1 ELSE 0 END)::bigint as workouts
      FROM app_logs
      WHERE created_at > ${dateLimit}
      GROUP BY DATE(created_at)
      ORDER BY day DESC
      LIMIT 30
    `,

    // Recent signups with activity
    prisma.user.findMany({
      where: {
        createdAt: { gte: dateLimit },
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            ownedPrograms: true,
            workoutLogs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),

    // Recent programs
    prisma.program.findMany({
      where: {
        createdAt: { gte: dateLimit },
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        ownerUser: {
          select: { email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  // Process funnel data into counts
  const funnelCounts: Record<string, number> = {};
  for (const row of funnelData) {
    funnelCounts[row.type] = row._count.type;
  }

  // Process daily data (convert bigints to numbers)
  const dailyStats = dailyData.map(row => ({
    day: row.day.toISOString().split('T')[0],
    magicLinks: Number(row.magic_links),
    signups: Number(row.signups),
    onboarding: Number(row.onboarding),
    programs: Number(row.programs),
    workouts: Number(row.workouts),
  }));

  // Calculate totals
  const totals = {
    magicLinks: funnelCounts['magic_link_requested'] || 0,
    signups: funnelCounts['signup_completed'] || 0,
    onboarding: funnelCounts['onboarding_started'] || 0,
    programsStarted: funnelCounts['program_generation_started'] || 0,
    programsCompleted: funnelCounts['program_generation_completed'] || 0,
    workoutsStarted: funnelCounts['workout_started'] || 0,
    workoutsCompleted: (funnelCounts['workout_completed'] || 0) + (funnelCounts['first_workout_completed'] || 0),
    firstWorkouts: funnelCounts['first_workout_completed'] || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-sm text-gray-500">
            Last {days} days of user activity
          </p>
        </div>

        <AnalyticsClient
          totals={totals}
          dailyStats={dailyStats}
          recentUsers={recentUsers.map(u => ({
            id: u.id,
            email: u.email || '(no email)',
            createdAt: u.createdAt.toISOString(),
            programs: u._count.ownedPrograms,
            workouts: u._count.workoutLogs,
          }))}
          recentPrograms={recentPrograms.map(p => ({
            id: p.id,
            name: p.name,
            createdAt: p.createdAt.toISOString(),
            userEmail: p.ownerUser?.email || '(anonymous)',
          }))}
          currentDays={days}
        />
      </div>
    </div>
  );
}
