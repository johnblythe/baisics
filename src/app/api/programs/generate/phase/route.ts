import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ExerciseMeasureUnit, ExerciseMeasureType } from '@prisma/client';

import {
  convertIntakeToProfile,
  type UserProfile,
} from '@/services/programGeneration';
import { ValidatedPhase } from '@/services/programGeneration/schema';
import { sanitizeUserProfile, logSuspiciousInput } from '@/utils/security/promptSanitizer';
import { generatePhaseLean } from '@/services/programGeneration/leanGeneration';
import type { GeneratedPhase } from '@/services/programGeneration/types';
import { canGenerateProgram, shouldResetGenerations } from '@/lib/user-tiers';

// Exercise category ordering
const CATEGORY_ORDER: Record<string, number> = {
  primary: 1,
  secondary: 2,
  isolation: 3,
  cardio: 4,
  flexibility: 5,
};

function sortExercisesInPhase(phase: ValidatedPhase): void {
  for (const workout of phase.workouts) {
    workout.exercises.sort((a, b) => {
      const orderA = CATEGORY_ORDER[a.category] ?? 99;
      const orderB = CATEGORY_ORDER[b.category] ?? 99;
      return orderA - orderB;
    });
  }
}

/**
 * Convert GeneratedPhase (from lean generation) to ValidatedPhase format
 */
function convertGeneratedToValidated(generated: GeneratedPhase, phaseNumber: number): ValidatedPhase {
  return {
    phaseNumber,
    name: generated.name,
    durationWeeks: generated.durationWeeks,
    focus: generated.focus,
    explanation: generated.explanation,
    expectations: generated.expectations,
    keyPoints: generated.keyPoints,
    splitType: generated.splitType,
    workouts: generated.workouts.map(w => ({
      dayNumber: w.dayNumber,
      name: w.name,
      focus: w.focus,
      warmup: w.warmup,
      cooldown: w.cooldown,
      exercises: w.exercises.map(e => ({
        name: e.name,
        sets: e.sets,
        measure: e.measure,
        restPeriod: e.restPeriod,
        equipment: e.equipment,
        alternatives: e.alternatives,
        category: e.category,
        intensity: e.intensity,
        notes: e.notes,
        instructions: e.instructions,
      })),
    })),
    nutrition: generated.nutrition,
    progressionProtocol: generated.progressionProtocol,
  };
}

interface PhaseGenerationRequest {
  userId?: string;
  profile?: UserProfile;
  intakeData?: any;
  phaseNumber: number;
  totalPhases: number;
  previousPhases: ValidatedPhase[];
  programId?: string; // For adding to existing program
  programName?: string; // For creating program on first phase
  programDescription?: string;
}

/**
 * POST /api/programs/generate/phase
 *
 * Generates a single phase of a fitness program.
 * Called sequentially by the client for each phase.
 * Each call is <60s, avoiding Vercel timeout.
 */
export async function POST(request: Request) {
  const startTime = Date.now();
  const session = await auth();

  let body: PhaseGenerationRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Allow userId from session OR from body (for anonymous /hi flow)
  const userId = session?.user?.id || body.userId;
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Missing userId' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { phaseNumber, totalPhases, previousPhases, programId: existingProgramId } = body;

  // Check generation limits on first phase only (one program = one generation credit)
  if (phaseNumber === 1) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isPremium: true,
        programGenerationsThisMonth: true,
        generationsResetAt: true,
      },
    });

    if (user) {
      // Reset counter if new month
      let generationsThisMonth = user.programGenerationsThisMonth;
      if (shouldResetGenerations(user.generationsResetAt)) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            programGenerationsThisMonth: 0,
            generationsResetAt: new Date(),
          },
        });
        generationsThisMonth = 0;
      }

      // Check if user can generate
      if (!canGenerateProgram(user.isPremium, generationsThisMonth)) {
        return new Response(
          JSON.stringify({
            error: 'generation_limit_reached',
            message: 'You have reached your monthly program generation limit',
            limit: user.isPremium ? Infinity : 4,
            used: generationsThisMonth,
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  // Validate phase number
  if (!phaseNumber || phaseNumber < 1 || phaseNumber > totalPhases) {
    return new Response(
      JSON.stringify({ error: `Invalid phaseNumber: ${phaseNumber}` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Convert legacy intake format if needed
    let userProfile: UserProfile;
    if (body.profile) {
      userProfile = body.profile;
    } else if (body.intakeData) {
      userProfile = convertIntakeToProfile(body.intakeData);
    } else {
      return new Response(JSON.stringify({ error: 'Missing profile or intakeData' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Sanitize user input to prevent prompt injection
    const { sanitizedProfile, riskReport } = sanitizeUserProfile(userProfile);
    for (const report of riskReport) {
      if (report.riskLevel !== 'low') {
        logSuspiciousInput(userId, report.field, report.riskLevel, report.flaggedPatterns);
      }
    }

    // Generate phase using lean generation
    console.log(`[Phase ${phaseNumber}/${totalPhases}] Generating for user ${userId}`);

    const previousPhasesFocus = previousPhases.map(p => p.focus);

    const leanResult = await generatePhaseLean(
      sanitizedProfile as UserProfile,
      phaseNumber,
      totalPhases,
      previousPhasesFocus
    );

    if (!leanResult.success || !leanResult.phase) {
      throw new Error(leanResult.error || 'Phase generation failed');
    }

    // Convert GeneratedPhase to ValidatedPhase format
    const phase = convertGeneratedToValidated(leanResult.phase, phaseNumber);
    const tokensUsed = leanResult.metadata.inputTokens + leanResult.metadata.outputTokens;
    const modelUsed = leanResult.metadata.model;

    console.log(
      `[Phase ${phaseNumber}/${totalPhases}] Completed in ${leanResult.metadata.generationTimeMs}ms, tokens: ${tokensUsed}`
    );

    // Ensure phaseNumber matches what we requested
    phase.phaseNumber = phaseNumber;

    // Create or get program
    let programId = existingProgramId;
    if (!programId && phaseNumber === 1) {
      // Create program on first phase
      const program = await prisma.program.create({
        data: {
          name: body.programName || 'Custom Fitness Program',
          description: body.programDescription || 'A personalized fitness program.',
          createdBy: userId,
        },
      });
      programId = program.id;
    }

    if (!programId) {
      throw new Error('No programId provided and this is not phase 1');
    }

    // Save phase to database
    await savePhaseToDatabase(phase, programId, userId);

    // Increment generation counter on first phase (one program = one credit)
    if (phaseNumber === 1) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          programGenerationsThisMonth: { increment: 1 },
        },
      });
    }

    const generationTime = Date.now() - startTime;
    console.log(
      `[Phase ${phaseNumber}/${totalPhases}] Completed in ${generationTime}ms, tokens: ${tokensUsed}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        phase,
        programId,
        metadata: {
          phaseNumber,
          totalPhases,
          generationTimeMs: generationTime,
          tokensUsed,
          model: modelUsed,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error(`[Phase ${phaseNumber}/${totalPhases}] Generation failed:`, error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Phase generation failed',
        phaseNumber,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Save a single phase to the database
 */
async function savePhaseToDatabase(
  phase: ValidatedPhase,
  programId: string,
  userId: string
): Promise<void> {
  await prisma.workoutPlan.create({
    data: {
      phase: phase.phaseNumber,
      bodyFatPercentage: 0,
      muscleMassDistribution: 'Balanced',
      dailyCalories: phase.nutrition.dailyCalories,
      proteinGrams: phase.nutrition.macros.protein,
      carbGrams: phase.nutrition.macros.carbs,
      fatGrams: phase.nutrition.macros.fats,
      daysPerWeek: phase.workouts.length,
      phaseExplanation: phase.explanation,
      phaseExpectations: phase.expectations,
      phaseKeyPoints: phase.keyPoints,
      program: { connect: { id: programId } },
      user: { connect: { id: userId } },
      workouts: {
        create: phase.workouts.map((workout) => ({
          name: workout.name,
          dayNumber: workout.dayNumber,
          focus: workout.focus,
          warmup: JSON.stringify(workout.warmup),
          cooldown: JSON.stringify(workout.cooldown),
          exercises: {
            create: workout.exercises.map((exercise, exerciseIndex) => {
              const reps = exercise.measure.type === 'reps' ? Math.round(exercise.measure.value) : 0;
              const measureType = exercise.measure.type.toUpperCase() as ExerciseMeasureType;

              let measureUnit: ExerciseMeasureUnit | null = null;
              let measureValue = exercise.measure.value;

              if (exercise.measure.unit) {
                switch (exercise.measure.unit) {
                  case 'seconds':
                    measureUnit = 'SECONDS';
                    break;
                  case 'minutes':
                    measureUnit = 'SECONDS';
                    measureValue = measureValue * 60;
                    break;
                  case 'meters':
                    measureUnit = 'METERS';
                    break;
                  case 'km':
                    measureUnit = 'KILOMETERS';
                    break;
                  case 'miles':
                    measureUnit = 'MILES' as ExerciseMeasureUnit;
                    break;
                }
              }

              return {
                name: exercise.name,
                sets: exercise.sets,
                reps,
                restPeriod: Math.round(exercise.restPeriod),
                measureType,
                measureValue,
                measureUnit,
                intensity: 0,
                sortOrder: exerciseIndex,
                notes: `${exercise.intensity || ''} ${exercise.notes || ''}`.trim() || null,
                instructions: exercise.instructions || [],
                exerciseLibrary: {
                  connectOrCreate: {
                    where: { name: exercise.name },
                    create: {
                      name: exercise.name,
                      category: exercise.category || 'default',
                    },
                  },
                },
              };
            }),
          },
        })),
      },
    },
  });
}
