import { CoachTier } from '@prisma/client'

export const COACH_TIER_CONFIG = {
  FREE: {
    tier: 'FREE' as CoachTier,
    name: 'Free',
    clientLimit: 2,
    priceId: null,
    price: 0,
  },
  SWOLE: {
    tier: 'SWOLE' as CoachTier,
    name: 'Swole',
    clientLimit: 15,
    priceId: process.env.STRIPE_PRICE_COACH_SWOLE,
    price: 29,
  },
  YOKED: {
    tier: 'YOKED' as CoachTier,
    name: 'Yoked',
    clientLimit: Infinity,
    priceId: process.env.STRIPE_PRICE_COACH_YOKED,
    price: 59,
  },
} as const

export function getTierFromPriceId(priceId: string | null): CoachTier {
  if (!priceId) return 'FREE'
  if (priceId === COACH_TIER_CONFIG.SWOLE.priceId) return 'SWOLE'
  if (priceId === COACH_TIER_CONFIG.YOKED.priceId) return 'YOKED'
  return 'FREE'
}

export function getClientLimit(tier: CoachTier): number {
  return COACH_TIER_CONFIG[tier].clientLimit
}

export function canAddMoreClients(tier: CoachTier, currentClientCount: number): boolean {
  const limit = getClientLimit(tier)
  return currentClientCount < limit
}
