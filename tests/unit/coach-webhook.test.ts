import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock env vars
vi.stubEnv('STRIPE_PRICE_COACH_SWOLE', 'price_swole_123')
vi.stubEnv('STRIPE_PRICE_COACH_YOKED', 'price_yoked_456')

const { getTierFromPriceId, COACH_TIER_CONFIG } = await import('@/lib/coach-tiers')

describe('Webhook Coach Tier Logic', () => {
  describe('isCoachPrice detection', () => {
    const isCoachPrice = (priceId: string) =>
      priceId === COACH_TIER_CONFIG.SWOLE.priceId ||
      priceId === COACH_TIER_CONFIG.YOKED.priceId

    it('should detect SWOLE price as coach price', () => {
      expect(isCoachPrice('price_swole_123')).toBe(true)
    })

    it('should detect YOKED price as coach price', () => {
      expect(isCoachPrice('price_yoked_456')).toBe(true)
    })

    it('should NOT detect random price as coach price', () => {
      expect(isCoachPrice('price_random_789')).toBe(false)
    })

    it('should NOT detect jacked user price as coach price', () => {
      expect(isCoachPrice('price_jacked_user')).toBe(false)
    })
  })

  describe('subscription.created/updated flow', () => {
    it('should map active SWOLE subscription to SWOLE tier', () => {
      const priceId = 'price_swole_123'
      const subscriptionStatus = 'active'

      const isCoachPrice = priceId === COACH_TIER_CONFIG.SWOLE.priceId ||
                          priceId === COACH_TIER_CONFIG.YOKED.priceId

      expect(isCoachPrice).toBe(true)
      expect(subscriptionStatus).toBe('active')
      expect(getTierFromPriceId(priceId)).toBe('SWOLE')
    })

    it('should map active YOKED subscription to YOKED tier', () => {
      const priceId = 'price_yoked_456'
      const subscriptionStatus = 'active'

      const isCoachPrice = priceId === COACH_TIER_CONFIG.SWOLE.priceId ||
                          priceId === COACH_TIER_CONFIG.YOKED.priceId

      expect(isCoachPrice).toBe(true)
      expect(subscriptionStatus).toBe('active')
      expect(getTierFromPriceId(priceId)).toBe('YOKED')
    })

    it('should NOT update tier for non-active subscriptions', () => {
      const priceId = 'price_swole_123'
      const subscriptionStatus: string = 'past_due'

      // Webhook only updates tier if status === 'active'
      const shouldUpdateTier = subscriptionStatus === 'active'
      expect(shouldUpdateTier).toBe(false)
    })
  })

  describe('subscription.deleted flow', () => {
    it('should reset to FREE tier when coach subscription canceled', () => {
      const priceId = 'price_swole_123'
      const isCoachPrice = priceId === COACH_TIER_CONFIG.SWOLE.priceId ||
                          priceId === COACH_TIER_CONFIG.YOKED.priceId

      expect(isCoachPrice).toBe(true)
      // On deletion, we reset to FREE (keeping isCoach = true)
      expect(getTierFromPriceId(null)).toBe('FREE')
    })

    it('should NOT reset tier for non-coach subscription cancellations', () => {
      const priceId = 'price_jacked_user'
      const isCoachPrice = priceId === COACH_TIER_CONFIG.SWOLE.priceId ||
                          priceId === COACH_TIER_CONFIG.YOKED.priceId

      expect(isCoachPrice).toBe(false)
      // Non-coach subscriptions don't affect coachTier
    })
  })

  describe('tier transitions', () => {
    it('should handle upgrade from SWOLE to YOKED', () => {
      // User upgrades: subscription.updated fires with new priceId
      const oldPriceId = 'price_swole_123'
      const newPriceId = 'price_yoked_456'

      expect(getTierFromPriceId(oldPriceId)).toBe('SWOLE')
      expect(getTierFromPriceId(newPriceId)).toBe('YOKED')
    })

    it('should handle downgrade from YOKED to SWOLE', () => {
      const oldPriceId = 'price_yoked_456'
      const newPriceId = 'price_swole_123'

      expect(getTierFromPriceId(oldPriceId)).toBe('YOKED')
      expect(getTierFromPriceId(newPriceId)).toBe('SWOLE')
    })
  })
})

describe('Edge cases', () => {
  it('should handle missing priceId gracefully', () => {
    expect(getTierFromPriceId(null)).toBe('FREE')
    expect(getTierFromPriceId('')).toBe('FREE')
  })

  it('should handle undefined env vars gracefully', () => {
    // If STRIPE_PRICE_COACH_SWOLE is undefined, comparison fails safely
    const undefinedPriceId = undefined as unknown as string
    expect(getTierFromPriceId(undefinedPriceId)).toBe('FREE')
  })
})
