import { auth } from '@/auth';
import { anthropic } from '@/lib/anthropic';
import { prisma } from '@/lib/prisma';
import { ExerciseMeasureUnit, ExerciseMeasureType } from '@prisma/client';
import type { MessageParam } from '@anthropic-ai/sdk/src/resources/messages.js';

import {
  convertIntakeToProfile,
  type UserProfile,
  type GenerationContext,
} from '@/services/programGeneration';
import { validatePhase, ValidatedPhase } from '@/services/programGeneration/schema';
import { SYSTEM_PROMPT, buildSinglePhasePrompt } from '@/services/programGeneration/prompts';
import { sanitizeUserProfile, logSuspiciousInput } from '@/utils/security/promptSanitizer';

// Use Opus for program generation - core product, quality matters most
const MODEL = process.env.OPUS_MODEL || 'claude-opus-4-5-20251101';
const MAX_TOKENS = 8192; // Single phase needs less tokens

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

interface PhaseGenerationRequest {
  userId?: string;
  profile?: UserProfile;
  intakeData?: any;
  context?: GenerationContext;
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

    // Build the single-phase prompt
    const prompt = buildSinglePhasePrompt(
      sanitizedProfile as UserProfile,
      phaseNumber,
      totalPhases,
      previousPhases,
      body.context
    );

    console.log(`[Phase ${phaseNumber}/${totalPhases}] Starting generation for user ${userId}`);

    // Call Claude
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }] as MessageParam[],
    });

    // Extract text content
    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in AI response');
    }

    let responseText = textContent.text.trim();

    // Clean up response - remove markdown code blocks if present
    if (responseText.startsWith('```json')) {
      responseText = responseText.slice(7);
    }
    if (responseText.startsWith('```')) {
      responseText = responseText.slice(3);
    }
    if (responseText.endsWith('```')) {
      responseText = responseText.slice(0, -3);
    }
    responseText = responseText.trim();

    // Parse JSON
    let phaseData: unknown;
    try {
      phaseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', responseText.substring(0, 500));
      throw new Error('Invalid JSON in AI response');
    }

    // Validate with Zod
    const validation = validatePhase(phaseData);
    if (!validation.success) {
      console.error('Phase validation failed:', validation.errors?.issues);
      throw new Error(
        `Phase validation failed: ${validation.errors?.issues.map((i) => i.message).join(', ')}`
      );
    }

    const phase = validation.data!;

    // Sort exercises by category
    sortExercisesInPhase(phase);

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

    const generationTime = Date.now() - startTime;
    console.log(
      `[Phase ${phaseNumber}/${totalPhases}] Completed in ${generationTime}ms, tokens: ${response.usage.input_tokens + response.usage.output_tokens}`
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
          tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
          model: MODEL,
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
