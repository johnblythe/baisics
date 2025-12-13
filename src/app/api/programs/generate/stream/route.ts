import { auth } from '@/auth';
import { anthropic } from '@/lib/anthropic';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { adminProgramCreationTemplate } from '@/lib/email/templates';
import { ExerciseMeasureUnit, ExerciseMeasureType } from '@prisma/client';

import {
  convertIntakeToProfile,
  type UserProfile,
  type GenerationContext,
  type GeneratedProgram,
  type GeneratedPhase,
} from '@/services/programGeneration';
import { ValidatedPhase } from '@/services/programGeneration/schema';
import { STREAMING_SYSTEM_PROMPT, buildStreamingGenerationPrompt } from '@/services/programGeneration/prompts';
import { StreamingPhaseParser, ProgramMeta } from '@/services/programGeneration/streamingParser';
import { sanitizeUserProfile, logSuspiciousInput } from '@/utils/security/promptSanitizer';

// Use Opus for program generation - core product, quality matters most
const MODEL = process.env.OPUS_MODEL || 'claude-opus-4-5-20250514';
const MAX_TOKENS = 16384;
const ESTIMATED_GENERATION_TIME_MS = 60000; // 60 seconds estimated

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
 * POST /api/programs/generate/stream
 *
 * Streaming endpoint for program generation with incremental phase display.
 * Uses Server-Sent Events to send phases as they're generated.
 */
export async function POST(request: Request) {
  const session = await auth();

  let body: any;
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

  try {
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

    // Sanitize user input to prevent prompt injection
    const { sanitizedProfile, riskReport } = sanitizeUserProfile(userProfile);
    for (const report of riskReport) {
      if (report.riskLevel !== 'low') {
        logSuspiciousInput(userId, report.field, report.riskLevel, report.flaggedPatterns);
      }
    }

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let isClosed = false;

        const sendEvent = (event: string, data: any) => {
          if (isClosed) {
            console.log(`[Stream] Skipping event ${event} - controller closed`);
            return;
          }
          try {
            controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
          } catch (err) {
            console.error(`[Stream] Failed to send event ${event}:`, err);
            isClosed = true;
          }
        };

        // Time-based progress tracking
        const startTime = Date.now();
        let progressInterval: NodeJS.Timeout | null = null;

        const updateProgress = () => {
          const elapsed = Date.now() - startTime;
          // Smooth progress from 10% to 85% over estimated time
          const progress = Math.min(10 + (elapsed / ESTIMATED_GENERATION_TIME_MS) * 75, 85);
          sendEvent('progress', {
            stage: 'generating',
            message: 'Generating your program...',
            progress: Math.round(progress),
          });
        };

        try {
          // Stage 1: Analyzing profile
          sendEvent('progress', { stage: 'analyzing', message: 'Analyzing your profile...', progress: 5 });

          const prompt = buildStreamingGenerationPrompt(sanitizedProfile as UserProfile, generationContext);

          // Start time-based progress updates
          progressInterval = setInterval(updateProgress, 2000);

          // Stage 2: Stream generation with true streaming API
          sendEvent('progress', { stage: 'generating', message: 'Designing your program...', progress: 10 });

          const parser = new StreamingPhaseParser();
          const completedPhases: ValidatedPhase[] = [];
          let programMeta: ProgramMeta | null = null;
          let programId: string | null = null;

          // Use streaming API
          const messageStream = anthropic.messages.stream({
            model: MODEL,
            max_tokens: MAX_TOKENS,
            system: STREAMING_SYSTEM_PROMPT,
            messages: [{ role: 'user', content: prompt }],
          });

          // Process streaming chunks
          for await (const event of messageStream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const chunk = event.delta.text;
              const results = parser.addChunk(chunk);

              for (const result of results) {
                if (result.type === 'phase' && result.phase) {
                  // Sort exercises in the phase
                  sortExercisesInPhase(result.phase);
                  completedPhases.push(result.phase);

                  // Create program on first phase if not exists
                  if (!programId) {
                    const program = await prisma.program.create({
                      data: {
                        name: `Program (generating...)`,
                        description: 'Program generation in progress...',
                        createdBy: userId,
                      },
                    });
                    programId = program.id;
                  }

                  // Save phase to database incrementally
                  await savePhaseToDatabase(result.phase, programId, userId);

                  // Send phase to client
                  sendEvent('phase', {
                    phaseNumber: result.phase.phaseNumber,
                    phase: result.phase,
                    totalPhases: completedPhases.length,
                  });

                  console.log(`[Stream] Phase ${result.phase.phaseNumber} complete and saved`);
                } else if (result.type === 'meta' && result.meta) {
                  programMeta = result.meta;

                  // Update program with final metadata
                  if (programId) {
                    await prisma.program.update({
                      where: { id: programId },
                      data: {
                        name: programMeta.name,
                        description: programMeta.description,
                      },
                    });
                  }

                  sendEvent('program_meta', {
                    name: programMeta.name,
                    description: programMeta.description,
                    totalWeeks: programMeta.totalWeeks,
                  });

                  console.log(`[Stream] Program meta received: ${programMeta.name}`);
                } else if (result.error) {
                  console.error(`[Stream] Parse error: ${result.error}`);
                }
              }
            }
          }

          // Stop progress updates
          if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
          }

          // Get final message for token usage
          const finalMessage = await messageStream.finalMessage();

          // Verify we have everything
          if (completedPhases.length === 0) {
            throw new Error('No phases were generated');
          }

          // If no meta received, use defaults
          if (!programMeta) {
            programMeta = {
              name: 'Custom Fitness Program',
              description: 'A personalized fitness program designed for your goals.',
              totalWeeks: completedPhases.reduce((sum, p) => sum + p.durationWeeks, 0),
            };

            if (programId) {
              await prisma.program.update({
                where: { id: programId },
                data: {
                  name: programMeta.name,
                  description: programMeta.description,
                },
              });
            }
          }

          sendEvent('progress', { stage: 'complete', message: 'Your program is ready!', progress: 100 });

          // Construct final program object for response
          const program: GeneratedProgram = {
            name: programMeta.name,
            description: programMeta.description,
            totalWeeks: programMeta.totalWeeks,
            phases: completedPhases as GeneratedPhase[],
          };

          // Send admin notification (non-blocking)
          if (programId) {
            const savedProgram = await prisma.program.findUnique({
              where: { id: programId },
              include: { user: true },
            });
            if (savedProgram) {
              sendAdminNotification(savedProgram, program).catch(console.error);
            }
          }

          // Send final result
          sendEvent('complete', {
            success: true,
            program,
            savedProgram: { id: programId, name: programMeta.name },
            metadata: {
              tokensUsed: finalMessage.usage.input_tokens + finalMessage.usage.output_tokens,
              model: MODEL,
              phasesGenerated: completedPhases.length,
            },
          });
        } catch (error) {
          console.error('Streaming generation error:', error);

          // Clean up progress interval
          if (progressInterval) {
            clearInterval(progressInterval);
          }

          sendEvent('error', {
            error: error instanceof Error ? error.message : 'Generation failed',
          });
        } finally {
          isClosed = true;
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
