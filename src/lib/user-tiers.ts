/**
 * Consumer (non-coach) subscription tiers
 *
 * FREE: Limited but fully functional
 * JACKED: $5/mo - all features unlocked
 */

export const USER_TIER_CONFIG = {
  FREE: {
    name: 'Free',
    priceId: null,
    price: 0,
    limits: {
      programGenerations: 4,      // per month
      activePrograms: 1,
      mealPlanDays: 1,            // can generate 1 day at a time
    },
    features: {
      workoutTracking: true,
      checkIns: true,
      checkInReminders: false,    // JACKED only
      progressAnalysis: true,
      nutritionLogging: true,
      mealPlans: true,
      mealPlanFilters: false,     // dietary filters JACKED only
      shoppingLists: false,
      liveWorkoutCoach: false,
      programLibrary: false,
      bodyFatEstimator: false,    // in-app version, tools page is free
      programHistory: false,
      programImport: true,
      exerciseLibrary: true,
    },
  },
  JACKED: {
    name: 'Jacked',
    priceId: process.env.STRIPE_PRICE_JACKED,
    price: 5,
    limits: {
      programGenerations: Infinity,
      activePrograms: Infinity,
      mealPlanDays: 7,
    },
    features: {
      workoutTracking: true,
      checkIns: true,
      checkInReminders: true,
      progressAnalysis: true,
      nutritionLogging: true,
      mealPlans: true,
      mealPlanFilters: true,
      shoppingLists: true,
      liveWorkoutCoach: true,
      programLibrary: true,
      bodyFatEstimator: true,
      programHistory: true,
      programImport: true,
      exerciseLibrary: true,
    },
  },
} as const

export type UserTier = keyof typeof USER_TIER_CONFIG
export type UserFeature = keyof typeof USER_TIER_CONFIG.FREE.features

export function isJackedPrice(priceId: string | null): boolean {
  return priceId === USER_TIER_CONFIG.JACKED.priceId
}

export function hasFeature(isPremium: boolean, feature: UserFeature): boolean {
  const tier = isPremium ? 'JACKED' : 'FREE'
  return USER_TIER_CONFIG[tier].features[feature]
}

export function getLimit(isPremium: boolean, limit: keyof typeof USER_TIER_CONFIG.FREE.limits): number {
  const tier = isPremium ? 'JACKED' : 'FREE'
  return USER_TIER_CONFIG[tier].limits[limit]
}

export function canGenerateProgram(isPremium: boolean, generationsThisMonth: number): boolean {
  const limit = getLimit(isPremium, 'programGenerations')
  return generationsThisMonth < limit
}

/**
 * Check if we need to reset the monthly generation counter
 */
export function shouldResetGenerations(resetAt: Date): boolean {
  const now = new Date()
  const resetDate = new Date(resetAt)

  // Reset if we're in a new month
  return now.getMonth() !== resetDate.getMonth() ||
         now.getFullYear() !== resetDate.getFullYear()
}
