import { prisma } from '@/lib/prisma';
import { LogLevel } from '@prisma/client';
import LogsClient from './LogsClient';

interface SearchParams {
  level?: string;
  category?: string;
  page?: string;
  days?: string;
}

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const pageSize = 25;
  const days = parseInt(params.days || '7', 10);
  const levelFilter = params.level as LogLevel | undefined;
  const categoryFilter = params.category;

  // Build where clause
  const where: {
    level?: LogLevel;
    category?: string;
    createdAt?: { gte: Date };
  } = {};

  if (levelFilter && Object.values(LogLevel).includes(levelFilter)) {
    where.level = levelFilter;
  }

  if (categoryFilter) {
    where.category = categoryFilter;
  }

  // Date filter
  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - days);
  where.createdAt = { gte: dateLimit };

  // Fetch logs with pagination
  const [logs, totalCount, categories] = await Promise.all([
    prisma.appLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: {
          select: { email: true },
        },
      },
    }),
    prisma.appLog.count({ where }),
    prisma.appLog.findMany({
      select: { category: true },
      distinct: ['category'],
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const uniqueCategories = categories.map((c) => c.category);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Application Logs
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {totalCount} logs in the last {days} days
          </p>
        </div>

        <LogsClient
          logs={logs.map((log) => ({
            id: log.id,
            level: log.level,
            category: log.category,
            type: log.type,
            message: log.message,
            metadata: log.metadata as Record<string, unknown> | null,
            userId: log.userId,
            userEmail: log.user?.email || null,
            createdAt: log.createdAt.toISOString(),
          }))}
          totalPages={totalPages}
          currentPage={page}
          categories={uniqueCategories}
          currentLevel={levelFilter || ''}
          currentCategory={categoryFilter || ''}
          currentDays={days}
        />
      </div>
    </div>
  );
}
