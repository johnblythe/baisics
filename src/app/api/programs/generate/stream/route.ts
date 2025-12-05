import { auth } from '@/auth';
import { anthropic } from '@/lib/anthropic';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { adminProgramCreationTemplate } from '@/lib/email/templates';
import { ExerciseMeasureUnit, ExerciseMeasureType } from '@prisma/client';
import type { MessageParam } from '@anthropic-ai/sdk/src/resources/messages.js';

import {
  convertIntakeToProfile,
  type UserProfile,
  type GenerationContext,
  type GeneratedProgram,
} from '@/services/programGeneration';
import { validateProgram } from '@/services/programGeneration/schema';
import { SYSTEM_PROMPT, buildGenerationPrompt } from '@/services/programGeneration/prompts';

const MODEL = process.env.SONNET_MODEL || 'claude-sonnet-4-20250514';
const MAX_TOKENS = 8192;

/**
 * POST /api/programs/generate/stream
 *
 * Streaming endpoint for program generation with progress updates.
 * Uses Server-Sent Events to send progress to client.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userId = session.user.id;

  try {
    const body = await request.json();
    const { profile, intakeData, context } = body;

    // Convert legacy intake format if needed
    let userProfile: UserProfile;
    if (profile) {
      userProfile = profile;
    } else if (intakeData) {
      userProfile = convertIntakeToProfile(intakeData);
    } else {
      return new Response(JSON.stringify({ error: 'Missing profile or intakeData' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const generationContext: GenerationContext = {
      generationType: context?.generationType || 'new',
      previousPrograms: context?.previousPrograms,
      recentCheckIn: context?.recentCheckIn,
      modifications: context?.modifications,
    };

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: any) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        try {
          // Stage 1: Analyzing profile
          sendEvent('progress', { stage: 'analyzing', message: 'Analyzing your profile...', progress: 10 });

          const prompt = buildGenerationPrompt(userProfile, generationContext);

          // Stage 2: Generating program
          sendEvent('progress', { stage: 'generating', message: 'Designing your program...', progress: 20 });

          const response = await anthropic.messages.create({
            model: MODEL,
            max_tokens: MAX_TOKENS,
            system: SYSTEM_PROMPT,
            messages: [{ role: 'user', content: prompt }] as MessageParam[],
          });

          sendEvent('progress', { stage: 'processing', message: 'Processing workout structure...', progress: 50 });

          // Extract text content
          const textContent = response.content.find((block) => block.type === 'text');
          if (!textContent || textContent.type !== 'text') {
            throw new Error('No text content in AI response');
          }

          let responseText = textContent.text.trim();

          // Clean up response
          if (responseText.startsWith('```json')) responseText = responseText.slice(7);
          if (responseText.startsWith('```')) responseText = responseText.slice(3);
          if (responseText.endsWith('```')) responseText = responseText.slice(0, -3);
          responseText = responseText.trim();

          sendEvent('progress', { stage: 'validating', message: 'Validating program...', progress: 70 });

          // Parse JSON
          const programData = JSON.parse(responseText);

          // Validate
          const validation = validateProgram(programData);
          if (!validation.success) {
            throw new Error(`Validation failed: ${validation.errors?.issues.map((i) => i.message).join(', ')}`);
          }

          const program = validation.data!;

          sendEvent('progress', { stage: 'saving', message: 'Saving your program...', progress: 85 });

          // Save to database
          const savedProgram = await saveProgramToDatabase(program, userId);

          sendEvent('progress', { stage: 'complete', message: 'Your program is ready!', progress: 100 });

          // Send final result
          sendEvent('complete', {
            success: true,
            program,
            savedProgram,
            metadata: {
              tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
              model: MODEL,
            },
          });
        } catch (error) {
          console.error('Streaming generation error:', error);
          sendEvent('error', {
            error: error instanceof Error ? error.message : 'Generation failed',
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Stream setup error:', error);
    return new Response(JSON.stringify({ error: 'Failed to start generation' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Simplified save function for streaming endpoint
async function saveProgramToDatabase(
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
      user: true,
    },
  });

  // Send admin notification (non-blocking)
  sendAdminNotification(savedProgram, program).catch(console.error);

  return { id: savedProgram.id, name: savedProgram.name };
}

async function sendAdminNotification(savedProgram: any, program: GeneratedProgram): Promise<void> {
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
        workoutPlans: program.phases.map((phase) => ({
          phase: phase.phaseNumber,
          daysPerWeek: phase.workouts.length,
          dailyCalories: phase.nutrition.dailyCalories,
          proteinGrams: phase.nutrition.macros.protein,
          carbGrams: phase.nutrition.macros.carbs,
          fatGrams: phase.nutrition.macros.fats,
          phaseExplanation: phase.explanation,
          workouts: phase.workouts.map((workout) => ({
            name: workout.name,
            focus: workout.focus,
            exercises: workout.exercises.map((exercise) => ({
              name: exercise.name,
              sets: exercise.sets,
              reps: exercise.measure.type === 'reps' ? exercise.measure.value : 0,
              measureType: exercise.measure.type.toUpperCase(),
              measureValue: exercise.measure.value,
              measureUnit: exercise.measure.unit?.toUpperCase() || undefined,
            })),
          })),
        })),
      }),
    });
  } catch (error) {
    console.error('Failed to send admin notification:', error);
  }
}
