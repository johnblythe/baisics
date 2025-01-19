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