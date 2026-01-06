import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock env vars before importing
vi.stubEnv('STRIPE_PRICE_COACH_SWOLE', 'price_test_swole')
vi.stubEnv('STRIPE_PRICE_COACH_YOKED', 'price_test_yoked')

// Need to import after stubbing env
const {
  COACH_TIER_CONFIG,
  getTierFromPriceId,
  getClientLimit,
  canAddMoreClients
} = await import('@/lib/coach-tiers')

describe('Coach Tiers', () => {
  describe('COACH_TIER_CONFIG', () => {
    it('should have FREE tier with 2 client limit', () => {
      expect(COACH_TIER_CONFIG.FREE.clientLimit).toBe(2)
      expect(COACH_TIER_CONFIG.FREE.price).toBe(0)
      expect(COACH_TIER_CONFIG.FREE.priceId).toBeNull()
    })

    it('should have SWOLE tier with 15 client limit', () => {
      expect(COACH_TIER_CONFIG.SWOLE.clientLimit).toBe(15)
      expect(COACH_TIER_CONFIG.SWOLE.price).toBe(29)
    })

    it('should have YOKED tier with unlimited clients', () => {
      expect(COACH_TIER_CONFIG.YOKED.clientLimit).toBe(Infinity)
      expect(COACH_TIER_CONFIG.YOKED.price).toBe(59)
    })
  })

  describe('getTierFromPriceId', () => {
    it('should return FREE for null priceId', () => {
      expect(getTierFromPriceId(null)).toBe('FREE')
    })

    it('should return FREE for unknown priceId', () => {
      expect(getTierFromPriceId('price_unknown')).toBe('FREE')
    })

    it('should return SWOLE for swole price ID', () => {
      expect(getTierFromPriceId('price_test_swole')).toBe('SWOLE')
    })

    it('should return YOKED for yoked price ID', () => {
      expect(getTierFromPriceId('price_test_yoked')).toBe('YOKED')
    })
  })

  describe('getClientLimit', () => {
    it('should return 2 for FREE tier', () => {
      expect(getClientLimit('FREE')).toBe(2)
    })

    it('should return 15 for SWOLE tier', () => {
      expect(getClientLimit('SWOLE')).toBe(15)
    })

    it('should return Infinity for YOKED tier', () => {
      expect(getClientLimit('YOKED')).toBe(Infinity)
    })
  })

  describe('canAddMoreClients', () => {
    describe('FREE tier (2 clients)', () => {
      it('should allow adding when at 0 clients', () => {
        expect(canAddMoreClients('FREE', 0)).toBe(true)
      })

      it('should allow adding when at 1 client', () => {
        expect(canAddMoreClients('FREE', 1)).toBe(true)
      })

      it('should NOT allow adding when at 2 clients', () => {
        expect(canAddMoreClients('FREE', 2)).toBe(false)
      })

      it('should NOT allow adding when over limit', () => {
        expect(canAddMoreClients('FREE', 5)).toBe(false)
      })
    })

    describe('SWOLE tier (15 clients)', () => {
      it('should allow adding when at 0 clients', () => {
        expect(canAddMoreClients('SWOLE', 0)).toBe(true)
      })

      it('should allow adding when at 14 clients', () => {
        expect(canAddMoreClients('SWOLE', 14)).toBe(true)
      })

      it('should NOT allow adding when at 15 clients', () => {
        expect(canAddMoreClients('SWOLE', 15)).toBe(false)
      })
    })

    describe('YOKED tier (unlimited)', () => {
      it('should always allow adding clients', () => {
        expect(canAddMoreClients('YOKED', 0)).toBe(true)
        expect(canAddMoreClients('YOKED', 100)).toBe(true)
        expect(canAddMoreClients('YOKED', 1000)).toBe(true)
      })
    })
  })
})

describe('Tier upgrade paths', () => {
  it('FREE → SWOLE increases limit from 2 to 15', () => {
    expect(getClientLimit('FREE')).toBe(2)
    expect(getClientLimit('SWOLE')).toBe(15)
  })

  it('SWOLE → YOKED removes limit entirely', () => {
    expect(getClientLimit('SWOLE')).toBe(15)
    expect(getClientLimit('YOKED')).toBe(Infinity)
  })

  it('coach at FREE limit can add after upgrading to SWOLE', () => {
    const clientCount = 2
    expect(canAddMoreClients('FREE', clientCount)).toBe(false)
    expect(canAddMoreClients('SWOLE', clientCount)).toBe(true)
  })

  it('coach at SWOLE limit can add after upgrading to YOKED', () => {
    const clientCount = 15
    expect(canAddMoreClients('SWOLE', clientCount)).toBe(false)
    expect(canAddMoreClients('YOKED', clientCount)).toBe(true)
  })
})
