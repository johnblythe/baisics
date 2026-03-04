import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { resolveNutritionTargets } from '@/lib/nutrition/resolveTargets';

/**
 * Validation bounds for nutrition values
 */
const VALIDATION_BOUNDS = {
  dailyCalories: { min: 800, max: 6000 },
  proteinGrams: { min: 30, max: 400 },
  carbGrams: { min: 0, max: 800 },
  fatGrams: { min: 20, max: 300 },
} as const;

/**
 * GET /api/nutrition-plan
 * Fetches current nutrition targets for the authenticated user.
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await resolveNutritionTargets(session.user.id);

    return NextResponse.json({
      plan: result.plan,
      source: result.source,
      isDefault: result.isDefault,
      restDayTargets: result.plan.restDayCalories != null ? {
        dailyCalories: result.plan.restDayCalories,
        proteinGrams: result.plan.restDayProtein,
        carbGrams: result.plan.restDayCarbs,
        fatGrams: result.plan.restDayFat,
      } : null,
      hasRestDayTargets: result.hasRestDayTargets,
    });
  } catch (error) {
    console.error('Error fetching nutrition plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nutrition plan' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/nutrition-plan
 * Saves new nutrition targets with version history.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { dailyCalories, proteinGrams, carbGrams, fatGrams, restDayCalories, restDayProtein, restDayCarbs, restDayFat } = body;

    // Validate required fields
    if (
      typeof dailyCalories !== 'number' ||
      typeof proteinGrams !== 'number' ||
      typeof carbGrams !== 'number' ||
      typeof fatGrams !== 'number'
    ) {
      return NextResponse.json(
        { error: 'Missing required fields: dailyCalories, proteinGrams, carbGrams, fatGrams' },
        { status: 400 }
      );
    }

    // Validate bounds
    const validationErrors: string[] = [];

    if (dailyCalories < VALIDATION_BOUNDS.dailyCalories.min || dailyCalories > VALIDATION_BOUNDS.dailyCalories.max) {
      validationErrors.push(`dailyCalories must be between ${VALIDATION_BOUNDS.dailyCalories.min} and ${VALIDATION_BOUNDS.dailyCalories.max}`);
    }
    if (proteinGrams < VALIDATION_BOUNDS.proteinGrams.min || proteinGrams > VALIDATION_BOUNDS.proteinGrams.max) {
      validationErrors.push(`proteinGrams must be between ${VALIDATION_BOUNDS.proteinGrams.min} and ${VALIDATION_BOUNDS.proteinGrams.max}`);
    }
    if (carbGrams < VALIDATION_BOUNDS.carbGrams.min || carbGrams > VALIDATION_BOUNDS.carbGrams.max) {
      validationErrors.push(`carbGrams must be between ${VALIDATION_BOUNDS.carbGrams.min} and ${VALIDATION_BOUNDS.carbGrams.max}`);
    }
    if (fatGrams < VALIDATION_BOUNDS.fatGrams.min || fatGrams > VALIDATION_BOUNDS.fatGrams.max) {
      validationErrors.push(`fatGrams must be between ${VALIDATION_BOUNDS.fatGrams.min} and ${VALIDATION_BOUNDS.fatGrams.max}`);
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Rest-day fields: premium gate + validation
    const hasRestFields = restDayCalories != null || restDayProtein != null || restDayCarbs != null || restDayFat != null;
    if (hasRestFields) {
      // All four rest-day fields must be provided together
      if (restDayCalories == null || restDayProtein == null || restDayCarbs == null || restDayFat == null) {
        return NextResponse.json(
          { error: 'All rest day fields (calories, protein, carbs, fat) must be provided together' },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({ where: { id: userId }, select: { isPremium: true } });
      if (!user?.isPremium) {
        return NextResponse.json({ error: 'Rest day targets require a Jacked subscription' }, { status: 403 });
      }

      // Validate rest-day fields (same bounds as training)
      const restValidationErrors: string[] = [];
      if (restDayCalories != null && (typeof restDayCalories !== 'number' || restDayCalories < VALIDATION_BOUNDS.dailyCalories.min || restDayCalories > VALIDATION_BOUNDS.dailyCalories.max)) {
        restValidationErrors.push(`restDayCalories must be a number between ${VALIDATION_BOUNDS.dailyCalories.min} and ${VALIDATION_BOUNDS.dailyCalories.max}`);
      }
      if (restDayProtein != null && (typeof restDayProtein !== 'number' || restDayProtein < VALIDATION_BOUNDS.proteinGrams.min || restDayProtein > VALIDATION_BOUNDS.proteinGrams.max)) {
        restValidationErrors.push(`restDayProtein must be a number between ${VALIDATION_BOUNDS.proteinGrams.min} and ${VALIDATION_BOUNDS.proteinGrams.max}`);
      }
      if (restDayCarbs != null && (typeof restDayCarbs !== 'number' || restDayCarbs < VALIDATION_BOUNDS.carbGrams.min || restDayCarbs > VALIDATION_BOUNDS.carbGrams.max)) {
        restValidationErrors.push(`restDayCarbs must be a number between ${VALIDATION_BOUNDS.carbGrams.min} and ${VALIDATION_BOUNDS.carbGrams.max}`);
      }
      if (restDayFat != null && (typeof restDayFat !== 'number' || restDayFat < VALIDATION_BOUNDS.fatGrams.min || restDayFat > VALIDATION_BOUNDS.fatGrams.max)) {
        restValidationErrors.push(`restDayFat must be a number between ${VALIDATION_BOUNDS.fatGrams.min} and ${VALIDATION_BOUNDS.fatGrams.max}`);
      }

      if (restValidationErrors.length > 0) {
        return NextResponse.json(
          { error: 'Validation failed', details: restValidationErrors },
          { status: 400 }
        );
      }
    }
    // Strip time — effectiveDate is date-level, not time-level
    // Use UTC midnight so timezone doesn't shift the calendar date
    const today = new Date();
    const now = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

    // Build rest-day data (null values clear rest targets)
    const restDayData = {
      restDayCalories: restDayCalories ?? null,
      restDayProtein: restDayProtein ?? null,
      restDayCarbs: restDayCarbs ?? null,
      restDayFat: restDayFat ?? null,
    };

    // Check if user has an active program
    const activeProgram = await prisma.program.findFirst({
      where: {
        userId,
        active: true,
      },
      select: {
        id: true,
        currentPhase: true,
      },
    });

    let createdPlan: any = null;

    if (activeProgram) {
      // Program user: version the program's NutritionPlan
      await prisma.$transaction(async (tx) => {
        // End current program nutrition plan (if exists)
        await tx.nutritionPlan.updateMany({
          where: {
            programId: activeProgram.id,
            phaseNumber: activeProgram.currentPhase,
            endDate: null,
          },
          data: {
            endDate: now,
          },
        });

        // Create new version
        createdPlan = await tx.nutritionPlan.create({
          data: {
            programId: activeProgram.id,
            phaseNumber: activeProgram.currentPhase,
            dailyCalories,
            proteinGrams,
            carbGrams,
            fatGrams,
            ...restDayData,
            effectiveDate: now,
          },
        });
      });
    } else {
      // Standalone user: version their standalone NutritionPlan
      await prisma.$transaction(async (tx) => {
        // End current standalone nutrition plan (if exists)
        await tx.nutritionPlan.updateMany({
          where: {
            userId,
            programId: null,
            endDate: null,
          },
          data: {
            endDate: now,
          },
        });

        // Create new standalone version
        createdPlan = await tx.nutritionPlan.create({
          data: {
            userId,
            dailyCalories,
            proteinGrams,
            carbGrams,
            fatGrams,
            ...restDayData,
            effectiveDate: now,
          },
        });
      });
    }

    if (!createdPlan) {
      console.error('nutrition-plan POST: transaction completed but createdPlan is null', { userId });
      return NextResponse.json({ error: 'Plan was saved but response failed. Please refresh.' }, { status: 500 });
    }

    return NextResponse.json(
      {
        plan: {
          id: createdPlan.id,
          dailyCalories: createdPlan.dailyCalories,
          proteinGrams: createdPlan.proteinGrams,
          carbGrams: createdPlan.carbGrams,
          fatGrams: createdPlan.fatGrams,
          effectiveDate: createdPlan.effectiveDate,
        },
        restDayTargets: createdPlan.restDayCalories != null ? {
          dailyCalories: createdPlan.restDayCalories,
          proteinGrams: createdPlan.restDayProtein,
          carbGrams: createdPlan.restDayCarbs,
          fatGrams: createdPlan.restDayFat,
        } : null,
        hasRestDayTargets: createdPlan.restDayCalories != null,
        source: activeProgram ? 'program' : 'standalone',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving nutrition plan:', error);
    return NextResponse.json(
      { error: 'Failed to save nutrition plan' },
      { status: 500 }
    );
  }
}
