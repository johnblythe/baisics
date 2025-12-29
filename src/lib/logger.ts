import { prisma } from './prisma';
import { LogLevel, Prisma } from '@prisma/client';

interface LogEntry {
  category: string;
  type: string;
  message: string;
  metadata?: Prisma.InputJsonValue;
  userId?: string;
}

function log(level: LogLevel, entry: LogEntry) {
  const message = entry.message.length > 5000
    ? entry.message.slice(0, 4980) + '... [truncated]'
    : entry.message;

  // Fire and forget - don't block the request
  prisma.appLog.create({
    data: {
      level,
      category: entry.category,
      type: entry.type,
      message,
      metadata: entry.metadata,
      userId: entry.userId,
    }
  }).catch(err => {
    console.error('[Logger] Write failed:', err);
  });

  // Also console log in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[${level}] [${entry.category}/${entry.type}] ${message}`);
  }
}

export const logger = {
  info: (entry: LogEntry) => log(LogLevel.INFO, entry),
  warn: (entry: LogEntry) => log(LogLevel.WARN, entry),
  error: (entry: LogEntry) => log(LogLevel.ERROR, entry),
};

export type { LogEntry };
