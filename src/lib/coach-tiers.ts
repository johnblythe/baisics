import { CoachTier } from '@prisma/client'

export const COACH_TIER_CONFIG = {
  FREE: {
    tier: 'FREE' as CoachTier,
    name: 'Free',
    clientLimit: 2,
    priceId: null,
    price: 0,
  },
  PRO: {
    tier: 'PRO' as CoachTier,
    name: 'Pro',
    clientLimit: 15,
    priceId: process.env.STRIPE_PRICE_COACH_PRO,
    price: 29,
  },
  MAX: {
    tier: 'MAX' as CoachTier,
    name: 'Max',
    clientLimit: Infinity,
    priceId: process.env.STRIPE_PRICE_COACH_MAX,
    price: 59,
  },
} as const

export function getTierFromPriceId(priceId: string | null): CoachTier {
  if (!priceId) return 'FREE'
  if (priceId === COACH_TIER_CONFIG.PRO.priceId) return 'PRO'
  if (priceId === COACH_TIER_CONFIG.MAX.priceId) return 'MAX'
  return 'FREE'
}

export function getClientLimit(tier: CoachTier): number {
  return COACH_TIER_CONFIG[tier].clientLimit
}

export function canAddMoreClients(tier: CoachTier, currentClientCount: number): boolean {
  const limit = getClientLimit(tier)
  return currentClientCount < limit
}
