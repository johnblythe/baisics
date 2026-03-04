import { prisma } from '@/lib/prisma'

/**
 * Default nutrition targets when no plan exists
 */
const DEFAULT_TARGETS = {
  dailyCalories: 2000,
  proteinGrams: 150,
  carbGrams: 250,
  fatGrams: 65,
} as const

/**
 * Nutrition plan data returned from resolution
 */
export interface NutritionTargets {
  dailyCalories: number
  proteinGrams: number
  carbGrams: number
  fatGrams: number
  restDayCalories?: number
  restDayProtein?: number
  restDayCarbs?: number
  restDayFat?: number
  trainingDayCalories?: number
  trainingDayProtein?: number
  trainingDayCarbs?: number
  trainingDayFat?: number
}

/**
 * Result of resolving nutrition targets
 */
export interface ResolveNutritionResult {
  plan: NutritionTargets
  source: 'program' | 'standalone' | 'default'
  isDefault: boolean
  planId?: string
  dayType: 'training' | 'rest'
  hasRestDayTargets: boolean
}

const REST_DAY_SELECT = {
  id: true,
  dailyCalories: true,
  proteinGrams: true,
  carbGrams: true,
  fatGrams: true,
  restDayCalories: true,
  restDayProtein: true,
  restDayCarbs: true,
  restDayFat: true,
} as const

/**
 * Resolves nutrition targets for a user with point-in-time support.
 *
 * Resolution order:
 * 1. Active Program's NutritionPlan (phase-matched, point-in-time)
 * 2. Standalone NutritionPlan (point-in-time)
 * 3. Default targets
 *
 * When a plan has rest-day targets, the function auto-detects whether the
 * target date is a training or rest day (based on WorkoutLog), unless an
 * explicit dayType override is provided.
 *
 * @param userId - The user's ID
 * @param forDate - Optional date for point-in-time lookup (defaults to now)
 * @param dayType - Optional override for training/rest day detection
 * @returns Resolved nutrition targets with source info
 */
export async function resolveNutritionTargets(
  userId: string,
  forDate?: Date,
  dayType?: 'training' | 'rest'
): Promise<ResolveNutritionResult> {
  // Normalize to UTC midnight — comparisons are date-level, not time-level
  const d = forDate ?? new Date()
  const targetDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))

  // 1. Try to find active program's nutrition plan
  const activeProgram = await prisma.program.findFirst({
    where: {
      userId,
      active: true,
    },
    select: {
      id: true,
      currentPhase: true,
    },
  })

  let foundPlan: {
    id: string
    dailyCalories: number
    proteinGrams: number
    carbGrams: number
    fatGrams: number
    restDayCalories: number | null
    restDayProtein: number | null
    restDayCarbs: number | null
    restDayFat: number | null
  } | null = null
  let source: 'program' | 'standalone' | 'default' = 'default'

  if (activeProgram) {
    // Find program-level nutrition plan for current phase, effective at targetDate
    foundPlan = await prisma.nutritionPlan.findFirst({
      where: {
        programId: activeProgram.id,
        phaseNumber: activeProgram.currentPhase,
        effectiveDate: { lte: targetDate },
        OR: [
          { endDate: null },
          { endDate: { gt: targetDate } },
        ],
      },
      orderBy: { effectiveDate: 'desc' },
      select: REST_DAY_SELECT,
    })

    if (foundPlan) {
      source = 'program'
    }
  }

  if (!foundPlan) {
    // 2. Try standalone nutrition plan for user (point-in-time)
    foundPlan = await prisma.nutritionPlan.findFirst({
      where: {
        userId,
        programId: null,
        effectiveDate: { lte: targetDate },
        OR: [
          { endDate: null },
          { endDate: { gt: targetDate } },
        ],
      },
      orderBy: { effectiveDate: 'desc' },
      select: REST_DAY_SELECT,
    })

    if (foundPlan) {
      source = 'standalone'
    }
  }

  // 3. Fall back to defaults
  if (!foundPlan) {
    return {
      plan: { ...DEFAULT_TARGETS },
      source: 'default',
      isDefault: true,
      dayType: dayType ?? 'training',
      hasRestDayTargets: false,
    }
  }

  // Determine if plan has rest-day targets (all four must be present)
  const hasRestDayTargets =
    foundPlan.restDayCalories !== null &&
    foundPlan.restDayProtein !== null &&
    foundPlan.restDayCarbs !== null &&
    foundPlan.restDayFat !== null

  // Resolve day type: explicit override > workout detection > default to training
  let resolvedDayType: 'training' | 'rest' = dayType ?? 'training'

  if (hasRestDayTargets && !dayType) {
    // Auto-detect based on whether user has a completed workout on this date
    const startOfDay = targetDate
    const endOfDay = new Date(targetDate.getTime() + 86400000) // +24h

    const workoutOnDate = await prisma.workoutLog.findFirst({
      where: {
        userId,
        completedAt: {
          not: null,
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      select: { id: true },
    })

    resolvedDayType = workoutOnDate ? 'training' : 'rest'
  }

  // Build the plan targets — if rest day and rest columns exist, use rest values as main targets
  const isRestDay = resolvedDayType === 'rest' && hasRestDayTargets

  const plan: NutritionTargets = {
    dailyCalories: isRestDay ? foundPlan.restDayCalories! : foundPlan.dailyCalories,
    proteinGrams: isRestDay ? foundPlan.restDayProtein! : foundPlan.proteinGrams,
    carbGrams: isRestDay ? foundPlan.restDayCarbs! : foundPlan.carbGrams,
    fatGrams: isRestDay ? foundPlan.restDayFat! : foundPlan.fatGrams,
    // Always include both sets so client can display/compare
    ...(hasRestDayTargets
      ? {
          restDayCalories: foundPlan.restDayCalories!,
          restDayProtein: foundPlan.restDayProtein!,
          restDayCarbs: foundPlan.restDayCarbs!,
          restDayFat: foundPlan.restDayFat!,
          trainingDayCalories: foundPlan.dailyCalories,
          trainingDayProtein: foundPlan.proteinGrams,
          trainingDayCarbs: foundPlan.carbGrams,
          trainingDayFat: foundPlan.fatGrams,
        }
      : {}),
  }

  return {
    plan,
    source,
    isDefault: false,
    planId: foundPlan.id,
    dayType: resolvedDayType,
    hasRestDayTargets,
  }
}
