import { anthropic } from '@/lib/anthropic';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { adminProgramCreationTemplate } from '@/lib/email/templates';
import type { MessageParam } from '@anthropic-ai/sdk/src/resources/messages.js';
import { ExerciseMeasureUnit, ExerciseMeasureType } from '@prisma/client';

import type {
  UserProfile,
  GenerationContext,
  GeneratedProgram,
  GenerationResult,
} from './types';
import { validateProgram, generatedProgramSchema } from './schema';
import { SYSTEM_PROMPT, buildGenerationPrompt, buildContinuationPrompt } from './prompts';

/**
 * Unified Program Generation Service
 *
 * Single entry point for all program generation:
 * - New users (from /hi conversational intake)
 * - Returning users (from /dashboard/new-program)
 * - Program modifications
 */

const MODEL = process.env.SONNET_MODEL || 'claude-sonnet-4-20250514';
const MAX_TOKENS = 8192; // Increased for full program generation

export interface GenerateProgramOptions {
  userId: string;
  profile: UserProfile;
  context?: GenerationContext;
}

/**
 * Main generation function - generates a complete program in 1-2 AI calls
 */
export async function generateProgram(
  options: GenerateProgramOptions
): Promise<GenerationResult> {
  const startTime = Date.now();
  const { userId, profile, context } = options;

  try {
    // Build the generation prompt
    const prompt = buildGenerationPrompt(profile, context);

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
    let programData: unknown;
    try {
      programData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', responseText.substring(0, 500));
      throw new Error('Invalid JSON in AI response');
    }

    // Validate with Zod
    const validation = validateProgram(programData);
    if (!validation.success) {
      console.error('Program validation failed:', validation.errors?.issues);
      throw new Error(`Program validation failed: ${validation.errors?.issues.map((i) => i.message).join(', ')}`);
    }

    const program = validation.data!;

    // Check if response was truncated (stop_reason === 'max_tokens')
    // If so, make continuation call for remaining phases
    if (response.stop_reason === 'max_tokens') {
      const expectedPhases = profile.experienceLevel === 'beginner' ? 1 :
        profile.experienceLevel === 'intermediate' ? 2 : 3;

      if (program.phases.length < expectedPhases) {
        const continuedProgram = await continueGeneration(
          profile,
          program.phases,
          expectedPhases - program.phases.length
        );
        if (continuedProgram) {
          program.phases = [...program.phases, ...continuedProgram.phases];
        }
      }
    }

    const generationTime = Date.now() - startTime;

    return {
      success: true,
      program,
      metadata: {
        generationTimeMs: generationTime,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        model: MODEL,
      },
    };
  } catch (error) {
    console.error('Program generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      metadata: {
        generationTimeMs: Date.now() - startTime,
        model: MODEL,
      },
    };
  }
}

/**
 * Continue generation if initial response was truncated
 */
async function continueGeneration(
  profile: UserProfile,
  existingPhases: GeneratedProgram['phases'],
  remainingCount: number
): Promise<{ phases: GeneratedProgram['phases'] } | null> {
  try {
    const prompt = buildContinuationPrompt(profile, existingPhases, remainingCount);

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }] as MessageParam[],
    });

    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return null;
    }

    let responseText = textContent.text.trim();
    if (responseText.startsWith('```json')) responseText = responseText.slice(7);
    if (responseText.startsWith('```')) responseText = responseText.slice(3);
    if (responseText.endsWith('```')) responseText = responseText.slice(0, -3);
    responseText = responseText.trim();

    const data = JSON.parse(responseText);
    return { phases: data.phases || [] };
  } catch (error) {
    console.error('Continuation generation failed:', error);
    return null;
  }
}

/**
 * Save generated program to database
 */
export async function saveProgramToDatabase(
  program: GeneratedProgram,
  userId: string
): Promise<{ id: string; name: string }> {
  const savedProgram = await prisma.program.create({
    data: {
      name: program.name,
      description: program.description,
      createdBy: userId,
      workoutPlans: {
        create: program.phases.map((phase) => ({
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
          user: { connect: { id: userId } },
          workouts: {
            create: phase.workouts.map((workout) => ({
              name: workout.name,
              dayNumber: workout.dayNumber,
              focus: workout.focus,
              warmup: JSON.stringify(workout.warmup),
              cooldown: JSON.stringify(workout.cooldown),
              exercises: {
                create: workout.exercises.map((exercise) => {
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
                    notes: `${exercise.intensity || ''} ${exercise.notes || ''}`.trim() || null,
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
        })),
      },
    },
    include: {
      workoutPlans: {
        include: {
          workouts: {
            include: {
              exercises: true,
            },
          },
        },
      },
      user: true,
    },
  });

  // Send admin notification (non-blocking)
  sendAdminNotification(savedProgram).catch(console.error);

  return { id: savedProgram.id, name: savedProgram.name };
}

async function sendAdminNotification(savedProgram: any): Promise<void> {
  try {
    await sendEmail({
      to: process.env.NEXT_PUBLIC_ADMIN_EMAIL!,
      subject: `New Program Created: ${savedProgram.name}`,
      html: adminProgramCreationTemplate({
        programId: savedProgram.id,
        programName: savedProgram.name,
        programDescription: savedProgram.description || '',
        userId: savedProgram.createdBy,
        userEmail: savedProgram.user?.email,
        workoutPlans: savedProgram.workoutPlans.map((plan: any) => ({
          phase: plan.phase,
          daysPerWeek: plan.daysPerWeek,
          dailyCalories: plan.dailyCalories,
          proteinGrams: plan.proteinGrams,
          carbGrams: plan.carbGrams,
          fatGrams: plan.fatGrams,
          phaseExplanation: plan.phaseExplanation,
          workouts: plan.workouts.map((workout: any) => ({
            name: workout.name,
            focus: workout.focus,
            exercises: workout.exercises.map((exercise: any) => ({
              name: exercise.name,
              sets: exercise.sets,
              reps: exercise.reps,
              measureType: exercise.measureType,
              measureValue: exercise.measureValue,
              measureUnit: exercise.measureUnit,
            })),
          })),
        })),
      }),
    });
  } catch (error) {
    console.error('Failed to send admin notification:', error);
  }
}

/**
 * Convert legacy IntakeFormData to UserProfile
 */
export function convertIntakeToProfile(intake: any): UserProfile {
  return {
    sex: intake.sex || 'other',
    trainingGoal: intake.trainingGoal || intake.goals || 'general fitness',
    weight: intake.weight || 150,
    age: intake.age,
    height: intake.height,
    experienceLevel: intake.experienceLevel || 'beginner',
    daysAvailable: intake.daysAvailable || intake.daysPerWeek || 3,
    timePerSession: intake.dailyBudget || intake.timePerDay || 60,
    environment: {
      primary: intake.workoutEnvironment?.primary || 'gym',
      secondary: intake.workoutEnvironment?.secondary,
      limitations: intake.workoutEnvironment?.limitations || [],
    },
    equipment: {
      type: intake.equipmentAccess?.type || 'full-gym',
      available: intake.equipmentAccess?.available || [],
    },
    style: intake.workoutStyle
      ? {
          primary: intake.workoutStyle.primary || 'strength',
          secondary: intake.workoutStyle.secondary,
        }
      : undefined,
    injuries: [],
    preferences: intake.trainingPreferences || [],
    additionalInfo: intake.additionalInfo,
  };
}

// Re-export types
export type { UserProfile, GenerationContext, GeneratedProgram, GenerationResult };
