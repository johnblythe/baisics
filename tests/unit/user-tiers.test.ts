import { describe, it, expect, vi } from 'vitest'

// Mock env vars before importing
vi.stubEnv('STRIPE_PRICE_JACKED', 'price_test_jacked')

const {
  USER_TIER_CONFIG,
  isJackedPrice,
  hasFeature,
  getLimit,
  canGenerateProgram
} = await import('@/lib/user-tiers')

describe('User Tiers', () => {
  describe('USER_TIER_CONFIG', () => {
    it('should have FREE tier with correct limits', () => {
      expect(USER_TIER_CONFIG.FREE.price).toBe(0)
      expect(USER_TIER_CONFIG.FREE.limits.programGenerations).toBe(4)
      expect(USER_TIER_CONFIG.FREE.limits.activePrograms).toBe(1)
      expect(USER_TIER_CONFIG.FREE.limits.mealPlanDays).toBe(1)
    })

    it('should have JACKED tier with unlimited access', () => {
      expect(USER_TIER_CONFIG.JACKED.price).toBe(5)
      expect(USER_TIER_CONFIG.JACKED.limits.programGenerations).toBe(Infinity)
      expect(USER_TIER_CONFIG.JACKED.limits.activePrograms).toBe(Infinity)
      expect(USER_TIER_CONFIG.JACKED.limits.mealPlanDays).toBe(7)
    })

    it('FREE should have core features enabled', () => {
      expect(USER_TIER_CONFIG.FREE.features.workoutTracking).toBe(true)
      expect(USER_TIER_CONFIG.FREE.features.checkIns).toBe(true)
      expect(USER_TIER_CONFIG.FREE.features.progressAnalysis).toBe(true)
      expect(USER_TIER_CONFIG.FREE.features.nutritionLogging).toBe(true)
      expect(USER_TIER_CONFIG.FREE.features.mealPlans).toBe(true)
      expect(USER_TIER_CONFIG.FREE.features.programImport).toBe(true)
      expect(USER_TIER_CONFIG.FREE.features.exerciseLibrary).toBe(true)
    })

    it('FREE should have premium features disabled', () => {
      expect(USER_TIER_CONFIG.FREE.features.checkInReminders).toBe(false)
      expect(USER_TIER_CONFIG.FREE.features.mealPlanFilters).toBe(false)
      expect(USER_TIER_CONFIG.FREE.features.shoppingLists).toBe(false)
      expect(USER_TIER_CONFIG.FREE.features.liveWorkoutCoach).toBe(false)
      expect(USER_TIER_CONFIG.FREE.features.programLibrary).toBe(false)
      expect(USER_TIER_CONFIG.FREE.features.bodyFatEstimator).toBe(false)
      expect(USER_TIER_CONFIG.FREE.features.programHistory).toBe(false)
    })

    it('JACKED should have all features enabled', () => {
      const features = Object.values(USER_TIER_CONFIG.JACKED.features)
      expect(features.every(f => f === true)).toBe(true)
    })
  })

  describe('isJackedPrice', () => {
    it('should return true for JACKED price ID', () => {
      expect(isJackedPrice('price_test_jacked')).toBe(true)
    })

    it('should return false for null', () => {
      expect(isJackedPrice(null)).toBe(false)
    })

    it('should return false for unknown price', () => {
      expect(isJackedPrice('price_unknown')).toBe(false)
    })

    it('should return false for coach price IDs', () => {
      expect(isJackedPrice('price_coach_swole')).toBe(false)
      expect(isJackedPrice('price_coach_yoked')).toBe(false)
    })
  })

  describe('hasFeature', () => {
    it('should return true for FREE features when not premium', () => {
      expect(hasFeature(false, 'workoutTracking')).toBe(true)
      expect(hasFeature(false, 'checkIns')).toBe(true)
      expect(hasFeature(false, 'mealPlans')).toBe(true)
    })

    it('should return false for JACKED features when not premium', () => {
      expect(hasFeature(false, 'checkInReminders')).toBe(false)
      expect(hasFeature(false, 'liveWorkoutCoach')).toBe(false)
      expect(hasFeature(false, 'shoppingLists')).toBe(false)
    })

    it('should return true for all features when premium', () => {
      expect(hasFeature(true, 'checkInReminders')).toBe(true)
      expect(hasFeature(true, 'liveWorkoutCoach')).toBe(true)
      expect(hasFeature(true, 'shoppingLists')).toBe(true)
      expect(hasFeature(true, 'workoutTracking')).toBe(true)
    })
  })

  describe('getLimit', () => {
    it('should return FREE limits when not premium', () => {
      expect(getLimit(false, 'programGenerations')).toBe(4)
      expect(getLimit(false, 'activePrograms')).toBe(1)
      expect(getLimit(false, 'mealPlanDays')).toBe(1)
    })

    it('should return JACKED limits when premium', () => {
      expect(getLimit(true, 'programGenerations')).toBe(Infinity)
      expect(getLimit(true, 'activePrograms')).toBe(Infinity)
      expect(getLimit(true, 'mealPlanDays')).toBe(7)
    })
  })

  describe('canGenerateProgram', () => {
    describe('FREE tier (4 generations/mo)', () => {
      it('should allow at 0 generations', () => {
        expect(canGenerateProgram(false, 0)).toBe(true)
      })

      it('should allow at 3 generations', () => {
        expect(canGenerateProgram(false, 3)).toBe(true)
      })

      it('should NOT allow at 4 generations', () => {
        expect(canGenerateProgram(false, 4)).toBe(false)
      })

      it('should NOT allow when over limit', () => {
        expect(canGenerateProgram(false, 10)).toBe(false)
      })
    })

    describe('JACKED tier (unlimited)', () => {
      it('should always allow generating', () => {
        expect(canGenerateProgram(true, 0)).toBe(true)
        expect(canGenerateProgram(true, 100)).toBe(true)
        expect(canGenerateProgram(true, 1000)).toBe(true)
      })
    })
  })
})

describe('Upgrade value proposition', () => {
  it('FREE → JACKED unlocks reminders', () => {
    expect(hasFeature(false, 'checkInReminders')).toBe(false)
    expect(hasFeature(true, 'checkInReminders')).toBe(true)
  })

  it('FREE → JACKED unlocks live workout coach', () => {
    expect(hasFeature(false, 'liveWorkoutCoach')).toBe(false)
    expect(hasFeature(true, 'liveWorkoutCoach')).toBe(true)
  })

  it('FREE → JACKED removes program generation limit', () => {
    // At limit on FREE
    expect(canGenerateProgram(false, 4)).toBe(false)
    // Unlimited on JACKED
    expect(canGenerateProgram(true, 4)).toBe(true)
  })

  it('FREE → JACKED removes active program limit', () => {
    expect(getLimit(false, 'activePrograms')).toBe(1)
    expect(getLimit(true, 'activePrograms')).toBe(Infinity)
  })
})
