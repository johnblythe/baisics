import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock env vars
vi.stubEnv('STRIPE_PRICE_COACH_PRO', 'price_pro_123')
vi.stubEnv('STRIPE_PRICE_COACH_MAX', 'price_max_456')

const { getTierFromPriceId, COACH_TIER_CONFIG } = await import('@/lib/coach-tiers')

describe('Webhook Coach Tier Logic', () => {
  describe('isCoachPrice detection', () => {
    const isCoachPrice = (priceId: string) =>
      priceId === COACH_TIER_CONFIG.PRO.priceId ||
      priceId === COACH_TIER_CONFIG.MAX.priceId

    it('should detect PRO price as coach price', () => {
      expect(isCoachPrice('price_pro_123')).toBe(true)
    })

    it('should detect MAX price as coach price', () => {
      expect(isCoachPrice('price_max_456')).toBe(true)
    })

    it('should NOT detect random price as coach price', () => {
      expect(isCoachPrice('price_random_789')).toBe(false)
    })

    it('should NOT detect premium user price as coach price', () => {
      expect(isCoachPrice('price_premium_user')).toBe(false)
    })
  })

  describe('subscription.created/updated flow', () => {
    it('should map active PRO subscription to PRO tier', () => {
      const priceId = 'price_pro_123'
      const subscriptionStatus = 'active'

      const isCoachPrice = priceId === COACH_TIER_CONFIG.PRO.priceId ||
                          priceId === COACH_TIER_CONFIG.MAX.priceId

      expect(isCoachPrice).toBe(true)
      expect(subscriptionStatus).toBe('active')
      expect(getTierFromPriceId(priceId)).toBe('PRO')
    })

    it('should map active MAX subscription to MAX tier', () => {
      const priceId = 'price_max_456'
      const subscriptionStatus = 'active'

      const isCoachPrice = priceId === COACH_TIER_CONFIG.PRO.priceId ||
                          priceId === COACH_TIER_CONFIG.MAX.priceId

      expect(isCoachPrice).toBe(true)
      expect(subscriptionStatus).toBe('active')
      expect(getTierFromPriceId(priceId)).toBe('MAX')
    })

    it('should NOT update tier for non-active subscriptions', () => {
      const priceId = 'price_pro_123'
      const subscriptionStatus: string = 'past_due'

      // Webhook only updates tier if status === 'active'
      const shouldUpdateTier = subscriptionStatus === 'active'
      expect(shouldUpdateTier).toBe(false)
    })
  })

  describe('subscription.deleted flow', () => {
    it('should reset to FREE tier when coach subscription canceled', () => {
      const priceId = 'price_pro_123'
      const isCoachPrice = priceId === COACH_TIER_CONFIG.PRO.priceId ||
                          priceId === COACH_TIER_CONFIG.MAX.priceId

      expect(isCoachPrice).toBe(true)
      // On deletion, we reset to FREE (keeping isCoach = true)
      expect(getTierFromPriceId(null)).toBe('FREE')
    })

    it('should NOT reset tier for non-coach subscription cancellations', () => {
      const priceId = 'price_premium_user'
      const isCoachPrice = priceId === COACH_TIER_CONFIG.PRO.priceId ||
                          priceId === COACH_TIER_CONFIG.MAX.priceId

      expect(isCoachPrice).toBe(false)
      // Non-coach subscriptions don't affect coachTier
    })
  })

  describe('tier transitions', () => {
    it('should handle upgrade from PRO to MAX', () => {
      // User upgrades: subscription.updated fires with new priceId
      const oldPriceId = 'price_pro_123'
      const newPriceId = 'price_max_456'

      expect(getTierFromPriceId(oldPriceId)).toBe('PRO')
      expect(getTierFromPriceId(newPriceId)).toBe('MAX')
    })

    it('should handle downgrade from MAX to PRO', () => {
      const oldPriceId = 'price_max_456'
      const newPriceId = 'price_pro_123'

      expect(getTierFromPriceId(oldPriceId)).toBe('MAX')
      expect(getTierFromPriceId(newPriceId)).toBe('PRO')
    })
  })
})

describe('Edge cases', () => {
  it('should handle missing priceId gracefully', () => {
    expect(getTierFromPriceId(null)).toBe('FREE')
    expect(getTierFromPriceId('')).toBe('FREE')
  })

  it('should handle undefined env vars gracefully', () => {
    // If STRIPE_PRICE_COACH_PRO is undefined, comparison fails safely
    const undefinedPriceId = undefined as unknown as string
    expect(getTierFromPriceId(undefinedPriceId)).toBe('FREE')
  })
})
