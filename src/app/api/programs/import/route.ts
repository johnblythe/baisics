// @ts-nocheck
import { NextResponse } from 'next/server';
import { workoutFilePrompt } from '@/utils/prompts/workoutFileProcessing';
import { sendMessage } from '@/utils/chat';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import { auth } from '@/auth';
import mammoth from 'mammoth';

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
// Use /tmp on Vercel (serverless has read-only filesystem except /tmp)
const UPLOADS_DIR = process.env.VERCEL ? '/tmp/uploads/programs' : path.join(process.cwd(), 'uploads', 'programs');

// Ensure uploads directory exists
async function ensureUploadsDir() {
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }
}

function validateFileType(base64String: string): { valid: boolean; mimeType: string | null; error?: string } {
  try {
    // Extract the MIME type from the base64 string
    const mimeMatch = base64String.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
    
    if (!mimeMatch) {
      return {
        valid: false,
        mimeType: null,
        error: 'Invalid file format. File must be a PDF, Word document, or image.'
      };
    }

    const mimeType = mimeMatch[1].toLowerCase();

    if (!ALLOWED_FILE_TYPES.includes(mimeType)) {
      return {
        valid: false,
        mimeType,
        error: `Unsupported file type: ${mimeType}. File must be a PDF, Word document (.docx), or image.`
      };
    }

    // Check file size
    const base64Data = base64String.replace(/^data:.*?;base64,/, '');
    const fileSize = (base64Data.length * 3) / 4; // Approximate size in bytes

    if (fileSize > MAX_FILE_SIZE) {
      return {
        valid: false,
        mimeType,
        error: 'File size exceeds 10MB limit.'
      };
    }

    return { valid: true, mimeType };
  } catch (error) {
    return { 
      valid: false, 
      mimeType: null,
      error: 'Failed to validate file type.'
    };
  }
}

export async function POST(request: Request) {
  try {
    const { file, fileName, text, autoSave = false, allowGuest = false } = await request.json();

    // Get authenticated user
    const session = await auth();

    // Require auth for saving, but allow guest for preview-only
    if (!session?.user?.id && (autoSave || !allowGuest)) {
      return NextResponse.json({
        error: true,
        reason: 'Unauthorized',
        details: ['User must be authenticated to save programs']
      }, { status: 401 });
    }

    let messages;

    // Handle text input mode - no file validation needed
    if (text && typeof text === 'string') {
      if (text.trim().length === 0) {
        return NextResponse.json({
          error: true,
          reason: 'Text validation failed',
          details: ['Text input cannot be empty']
        });
      }

      messages = [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: workoutFilePrompt + `\n\nAnalyze this workout program text:\n\n${text}`
          },
        ],
      }];
    } else if (file) {
      // Handle file upload mode - existing logic
      // Validate file type and size
      const validation = validateFileType(file);

      if (!validation.valid) {
        return NextResponse.json({
          error: true,
          reason: 'File validation failed',
          details: [validation.error || 'Unknown validation error']
        });
      }

      // Extract just the base64 data without the data URL prefix
      const base64Data = file.split(',')[1];

      // Save the raw file (only if authenticated)
      if (session?.user?.id) {
        await ensureUploadsDir();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rawFilePath = path.join(UPLOADS_DIR, `${timestamp}_${fileName}`);
        await fs.writeFile(rawFilePath, base64Data, 'base64');
      }

      // Handle DOCX files - extract text first with mammoth
      const isDocx = validation.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      if (isDocx) {
        // Convert base64 to buffer and extract text with mammoth
        const buffer = Buffer.from(base64Data, 'base64');
        const { value: extractedText } = await mammoth.extractRawText({ buffer });

        messages = [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: workoutFilePrompt + `\n\nAnalyze this workout program text extracted from a Word document (${fileName}):\n\n${extractedText}`
            },
          ],
        }];
      } else {
        // PDF and images - use document/vision
        messages = [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: validation.mimeType || 'application/pdf',
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: workoutFilePrompt + `\n\nAnalyze the workout file above (${fileName}).`
            },
          ],
        }];
      }
    } else {
      return NextResponse.json({
        error: true,
        reason: 'Invalid request',
        details: ['Either text or file must be provided']
      });
    }

    const response = await sendMessage(messages, 'system');

    if (!response.success) {
      return NextResponse.json({
        error: true,
        reason: 'Failed to process with Claude',
        details: [response.error || 'Unknown error']
      });
    }

    // Parse Claude's response
    const content = Array.isArray(response.data?.content)
      ? response.data.content.find(block => 'text' in block)?.text || ''
      : '';

    if (!content) {
      return NextResponse.json({
        error: true,
        reason: 'No content in response',
        details: ['Claude returned an empty response']
      });
    }

    try {
      // Strip markdown code blocks if present (Claude sometimes wraps in ```json ... ```)
      let jsonContent = content.trim();
      if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
      }

      const parsed = JSON.parse(jsonContent);
      
      // If autoSave is false, just return the parsed data
      if (!autoSave) {
        return NextResponse.json({ parsed });
      }

      // Save to database only if autoSave is true
      const savedProgram = await prisma.program.create({
        data: {
          name: parsed.program?.name || 'Imported Workout Program',
          description: parsed.program?.description || '',
          createdBy: session.user.id,
          source: 'uploaded',
          workoutPlans: {
            create: {
              phase: parsed.workoutPlan?.phase || 1,
              phaseExplanation: parsed.workoutPlan?.phaseExplanation || '',
              phaseExpectations: parsed.workoutPlan?.phaseExpectations || '',
              phaseKeyPoints: parsed.workoutPlan?.phaseKeyPoints || [],
              progressionProtocol: parsed.workoutPlan?.progressionProtocol || [],
              daysPerWeek: parsed.workoutPlan?.daysPerWeek || 1,
              splitType: parsed.workoutPlan?.splitType || 'Full Body',
              dailyCalories: 2000,
              proteinGrams: 150,
              carbGrams: 200,
              fatGrams: 70,
              user: {
                connect: {
                  id: session.user.id
                }
              },
              workouts: {
                create: (parsed.workouts || []).map((workout: any) => ({
                  name: workout.name || 'Workout',
                  focus: workout.focus || '',
                  dayNumber: workout.dayNumber || 1,
                  warmup: workout.warmup || '',
                  cooldown: workout.cooldown || '',
                  exercises: {
                    create: (workout.exercises || []).map((exercise: any, exerciseIndex: number) => ({
                      name: exercise.name || 'Exercise',
                      sets: exercise.sets || 1,
                      reps: exercise.measure?.type === 'REPS' ? exercise.measure.value : null,
                      restPeriod: exercise.restPeriod || 60,
                      intensity: exercise.intensity || 0,
                      measureType: exercise.measure?.type || 'REPS',
                      measureValue: exercise.measure?.value || 0,
                      measureUnit: exercise.measure?.unit,
                      sortOrder: exerciseIndex,
                      notes: exercise.notes || '',
                      exerciseLibrary: {
                        connectOrCreate: {
                          where: { name: exercise.name || 'Exercise' },
                          create: {
                            name: exercise.name || 'Exercise',
                            category: exercise.category || 'default',
                            difficulty: 'BEGINNER',
                            movementPattern: 'PUSH',
                            equipment: [],
                            targetMuscles: [],
                            secondaryMuscles: []
                          }
                        }
                      }
                    }))
                  }
                }))
              }
            }
          }
        },
        include: {
          workoutPlans: {
            include: {
              workouts: {
                include: {
                  exercises: { orderBy: { sortOrder: 'asc' } }
                }
              }
            }
          }
        }
      });

      // Return both the parsed data and the saved program
      return NextResponse.json({
        parsed,
        saved: savedProgram
      });

    } catch (error) {
      console.error('Error saving to database:', error);
      return NextResponse.json({
        error: true,
        reason: 'Failed to save to database',
        details: [error instanceof Error ? error.message : 'Unknown error']
      });
    }

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({
      error: true,
      reason: 'Server error',
      details: [error instanceof Error ? error.message : 'Unknown error']
    });
  }
} 