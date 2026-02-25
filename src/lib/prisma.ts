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
    // Read operations: filter out soft-deleted rows
    if (['findMany', 'findFirst', 'count', 'aggregate', 'groupBy'].includes(params.action)) {
      params.args = params.args || {};
      params.args.where = { ...params.args.where, deletedAt: null };
    }

    // findUnique can't accept non-unique fields, so convert to findFirst
    if (params.action === 'findUnique') {
      params.action = 'findFirst';
      params.args = params.args || {};
      params.args.where = { ...params.args.where, deletedAt: null };
    }

    // Convert hard deletes to soft deletes
    if (params.action === 'delete') {
      params.action = 'update';
      params.args.data = { deletedAt: new Date() };
    }
    if (params.action === 'deleteMany') {
      params.action = 'updateMany';
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