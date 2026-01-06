import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock env vars before importing
vi.stubEnv('STRIPE_PRICE_COACH_PRO', 'price_test_pro')
vi.stubEnv('STRIPE_PRICE_COACH_MAX', 'price_test_max')

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

    it('should have PRO tier with 15 client limit', () => {
      expect(COACH_TIER_CONFIG.PRO.clientLimit).toBe(15)
      expect(COACH_TIER_CONFIG.PRO.price).toBe(29)
    })

    it('should have MAX tier with unlimited clients', () => {
      expect(COACH_TIER_CONFIG.MAX.clientLimit).toBe(Infinity)
      expect(COACH_TIER_CONFIG.MAX.price).toBe(59)
    })
  })

  describe('getTierFromPriceId', () => {
    it('should return FREE for null priceId', () => {
      expect(getTierFromPriceId(null)).toBe('FREE')
    })

    it('should return FREE for unknown priceId', () => {
      expect(getTierFromPriceId('price_unknown')).toBe('FREE')
    })

    it('should return PRO for pro price ID', () => {
      expect(getTierFromPriceId('price_test_pro')).toBe('PRO')
    })

    it('should return MAX for max price ID', () => {
      expect(getTierFromPriceId('price_test_max')).toBe('MAX')
    })
  })

  describe('getClientLimit', () => {
    it('should return 2 for FREE tier', () => {
      expect(getClientLimit('FREE')).toBe(2)
    })

    it('should return 15 for PRO tier', () => {
      expect(getClientLimit('PRO')).toBe(15)
    })

    it('should return Infinity for MAX tier', () => {
      expect(getClientLimit('MAX')).toBe(Infinity)
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

    describe('PRO tier (15 clients)', () => {
      it('should allow adding when at 0 clients', () => {
        expect(canAddMoreClients('PRO', 0)).toBe(true)
      })

      it('should allow adding when at 14 clients', () => {
        expect(canAddMoreClients('PRO', 14)).toBe(true)
      })

      it('should NOT allow adding when at 15 clients', () => {
        expect(canAddMoreClients('PRO', 15)).toBe(false)
      })
    })

    describe('MAX tier (unlimited)', () => {
      it('should always allow adding clients', () => {
        expect(canAddMoreClients('MAX', 0)).toBe(true)
        expect(canAddMoreClients('MAX', 100)).toBe(true)
        expect(canAddMoreClients('MAX', 1000)).toBe(true)
      })
    })
  })
})

describe('Tier upgrade paths', () => {
  it('FREE → PRO increases limit from 2 to 15', () => {
    expect(getClientLimit('FREE')).toBe(2)
    expect(getClientLimit('PRO')).toBe(15)
  })

  it('PRO → MAX removes limit entirely', () => {
    expect(getClientLimit('PRO')).toBe(15)
    expect(getClientLimit('MAX')).toBe(Infinity)
  })

  it('coach at FREE limit can add after upgrading to PRO', () => {
    const clientCount = 2
    expect(canAddMoreClients('FREE', clientCount)).toBe(false)
    expect(canAddMoreClients('PRO', clientCount)).toBe(true)
  })

  it('coach at PRO limit can add after upgrading to MAX', () => {
    const clientCount = 15
    expect(canAddMoreClients('PRO', clientCount)).toBe(false)
    expect(canAddMoreClients('MAX', clientCount)).toBe(true)
  })
})
