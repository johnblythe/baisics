import { PrismaClient } from '@prisma/client'

// Prevent multiple instances of Prisma Client in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined 
}

export const prisma = 
  global.prisma || 
  new PrismaClient({
    log: [
      // { level: 'query', emit: 'event' },
      { level: 'error', emit: 'event' },
      // { level: 'info', emit: 'event' },
      // { level: 'warn', emit: 'event' },
    ],
  })

// Soft-delete middleware for FoodLogEntry
// - Reads auto-filter where deletedAt IS NULL
// - Deletes become updates setting deletedAt
// - Use $queryRaw to bypass when you need to see soft-deleted rows
prisma.$use(async (params, next) => {
  if (params.model === 'FoodLogEntry') {
    const action = params.action;

    // findUnique can't accept non-unique fields — convert to findFirst
    if (action === 'findUnique') {
      params.action = 'findFirst';
    }

    // Read operations: filter out soft-deleted rows
    if (['findMany', 'findFirst', 'findUnique', 'count', 'aggregate', 'groupBy'].includes(action)) {
      params.args = params.args || {};
      params.args.where = { ...params.args.where, deletedAt: null };
    } else if (action === 'update' || action === 'updateMany') {
      // Prevent updates to soft-deleted rows
      params.args = params.args || {};
      params.args.where = { ...params.args.where, deletedAt: null };
    } else if (action === 'delete') {
      params.action = 'update';
      params.args.data = { ...params.args?.data, deletedAt: new Date() };
    } else if (action === 'deleteMany') {
      params.action = 'updateMany';
      params.args.where = { ...params.args?.where, deletedAt: null };
      params.args.data = { ...params.args?.data, deletedAt: new Date() };
    }
  }
  return next(params);
});

// Add event listeners for logging
prisma.$on('query' as never, (e: any) => {
  // console.log('Query:', e.query)
  // console.log('Params:', e.params)
  // console.log('Duration:', e.duration + 'ms')
})

prisma.$on('error' as never, (e: any) => {
  console.error('Prisma Error:', e)
})

prisma.$on('info' as never, (e: any) => {
  // console.log('Prisma Info:', e)
})

prisma.$on('warn' as never, (e: any) => {
  console.warn('Prisma Warning:', e)
})

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}