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
}

/**
 * Result of resolving nutrition targets
 */
export interface ResolveNutritionResult {
  plan: NutritionTargets
  source: 'program' | 'standalone' | 'default'
  isDefault: boolean
  planId?: string
}

/**
 * Resolves nutrition targets for a user with point-in-time support.
 *
 * Resolution order:
 * 1. Active Program's NutritionPlan (phase-matched, point-in-time)
 * 2. Standalone NutritionPlan (point-in-time)
 * 3. Default targets
 *
 * @param userId - The user's ID
 * @param forDate - Optional date for point-in-time lookup (defaults to now)
 * @returns Resolved nutrition targets with source info
 */
export async function resolveNutritionTargets(
  userId: string,
  forDate?: Date
): Promise<ResolveNutritionResult> {
  const targetDate = forDate ?? new Date()

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

  if (activeProgram) {
    // Find program-level nutrition plan for current phase, effective at targetDate
    const programPlan = await prisma.nutritionPlan.findFirst({
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
      select: {
        id: true,
        dailyCalories: true,
        proteinGrams: true,
        carbGrams: true,
        fatGrams: true,
      },
    })

    if (programPlan) {
      return {
        plan: {
          dailyCalories: programPlan.dailyCalories,
          proteinGrams: programPlan.proteinGrams,
          carbGrams: programPlan.carbGrams,
          fatGrams: programPlan.fatGrams,
        },
        source: 'program',
        isDefault: false,
        planId: programPlan.id,
      }
    }
  }

  // 2. Try standalone nutrition plan for user (point-in-time)
  const standalonePlan = await prisma.nutritionPlan.findFirst({
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
    select: {
      id: true,
      dailyCalories: true,
      proteinGrams: true,
      carbGrams: true,
      fatGrams: true,
    },
  })

  if (standalonePlan) {
    return {
      plan: {
        dailyCalories: standalonePlan.dailyCalories,
        proteinGrams: standalonePlan.proteinGrams,
        carbGrams: standalonePlan.carbGrams,
        fatGrams: standalonePlan.fatGrams,
      },
      source: 'standalone',
      isDefault: false,
      planId: standalonePlan.id,
    }
  }

  // 3. Fall back to defaults
  return {
    plan: { ...DEFAULT_TARGETS },
    source: 'default',
    isDefault: true,
  }
}
