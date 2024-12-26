'use server'

import { prisma } from '@/lib/prisma';
import { sendMessage } from '@/utils/chat';
import { generateInitialProgramPrompt } from './prompts';
import { Exercise, Workout, ProgramData, PhasesData } from './types';
import { MessageParam } from '@anthropic-ai/sdk/src/resources/messages.js';
import { User, UserImages } from '@prisma/client';
import { fileToBase64 } from '@/utils/fileHandling';
import { IntakeFormData } from '../hi/types';
// Add new types for the form data
export type TrainingGoal = 'weight loss' | 'maintenance' | 'body recomposition' | 'strength gains' | 'weight gain' | 'muscle building' | 'other';
export type Sex = 'man' | 'woman' | 'other';
export type TrainingPreference = 'cardio' | 'resistance' | 'free weights' | 'machines' | 'kettlebell' | 'running' | 'plyometrics' | 'yoga';

export type ImageUpload = {
  fileName: string;
  base64Data: string;
  userId: string;
  intakeForm?: IntakeFormData;
};

// rn just storing base64 data, can deal w uploads later
export async function uploadImages(images: ImageUpload[]) {
  try {
    const savedImages = await Promise.all(
      images.map(async (image) => {
        console.log("🚀 ~ images.map ~ image:", image)
        const savedImage = await prisma.userImages.create({
          data: {
            fileName: image.fileName,
            base64Data: image.base64Data,
            userId: image.userId,
          },
        });

        console.log("🚀 ~ images.map ~ savedImage:", savedImage)
        return savedImage;
      })
    );

    return { success: true, images: savedImages };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: 'Upload failed' };
  }
}

export async function getSessionImages(userId: string) {
  if (!userId) {
    return { success: false, error: 'User ID is required' };
  }

  try {
    const images = await prisma.userImages.findMany({
      where: {
        userId: userId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, images };
  } catch (error) {
    console.error('Failed to fetch images:', error);
    return { success: false, error: 'Failed to fetch images' };
  }
}

export async function deleteImage(imageId: string) {
  try {
    await prisma.userImages.update({
      where: {
        id: imageId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, error: 'Failed to delete image' };
  }
}

// specifically from anon state
export async function createNewUser({ userId, email }: { userId: string, email: string }) {
  try {
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        email,
      },
      create: {
        id: userId,
        email,
      },
    });

    return { success: true, user };
  } catch (error) {
    console.error('Failed to create new user:', error);
    return { success: false, error: 'Failed to create new user' };
  }
}

export async function updateUser(userId: string, data: Partial<User>) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });

  return { success: true, user };
} 

export async function createAnonUser(userId: string) {
  try {
    const user = await prisma.user.create({
      data: {
        id: userId,
      },
    });

    return { success: true, user };
  } catch (error) {
    console.error('Failed to create anonymous user:', error);
    return { success: false, error: 'Failed to create anonymous user' };
  }
}

// todo: consider upserting
export async function saveIntakeForm(userId: string, intakeForm: IntakeFormData) {
  try {
    const uploadedImages = [];
    // Handle any uploaded files if they exist
    if ('files' in intakeForm) {
      const { files, ...intakeData } = intakeForm as IntakeFormData & { files: File[] };
      
      if (files?.length) {
        // Convert Files to base64 first
        const base64Files = await Promise.all(
          files.map(async (file) => ({
            fileName: file.name,
            base64Data: await fileToBase64(file),
            userId
          }))
        );
        
        const imageUploadResult = await uploadImages(base64Files);
        
        if (!imageUploadResult.success) {
          throw new Error('Failed to upload images');
        }

        uploadedImages.push(imageUploadResult.images);
      }
      
      intakeForm = intakeData;
    }
    
    const intakeData = {
      userId,
      sex: intakeForm.sex as Sex,
      trainingGoal: intakeForm.trainingGoal as TrainingGoal,
      daysAvailable: intakeForm.daysAvailable,
      dailyBudget: intakeForm.dailyBudget,
      age: intakeForm.age,
      experienceLevel: intakeForm.experienceLevel || "",
      weight: intakeForm.weight,
      height: intakeForm.height,
      trainingPreferences: intakeForm.trainingPreferences,
      additionalInfo: intakeForm.additionalInfo,
    };

    const savedIntake = await prisma.userIntake.upsert({
      where: { userId },
      update: intakeData,
      create: intakeData,
    });

    return { success: true, intake: savedIntake, images: uploadedImages };
  } catch (error) {
    console.error('Intake form save error:', error);
    return { success: false, error: 'Failed to save intake form failed here' };
  }
}

export async function getSessionIntake(userId: string) {
  if (!userId) {
    return { success: false, error: 'User ID is required' };
  }

  try {
    const intake = await prisma.userIntake.findFirst({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, intake };
  } catch (error) {
    console.error('Failed to fetch intake:', error);
    return { success: false, error: 'Failed to fetch intake data' };
  }
}

// Add a new function to retrieve prompt logs
export async function getSessionPromptLogs(userId: string) {
  if (!userId) {
    return { success: false, error: 'User ID is required' };
  }

  try {
    const log = await prisma.promptLog.findFirst({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, log };
  } catch (error) {
    console.error('Failed to fetch prompt logs:', error);
    return { success: false, error: 'Failed to fetch prompt logs' };
  }
}

export async function getUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  return { success: true, user };
}

export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return { success: true, user };
}

export async function getProgram(programId: string) {
  const program = await prisma.program.findUnique({
    where: { id: programId },
  });
  return { success: true, program };
}

// Get workout plan for a previously saved session
export async function getUserProgram(userId: string, programId: string) {
  if (!userId || !programId) {
    return { success: false, error: 'User ID is required' };
  }

  try {
    const program = await prisma.program.findFirst({
      where: {
        workoutPlans: {
          some: {
            userId,
          },
        },
        id: programId,
      },
      include: {
        workoutPlans: {
          orderBy: {
            phase: 'asc',
          },
          include: {
            workouts: {
              orderBy: {
                dayNumber: 'asc',
              },
              include: {
                exercises: true,
              }
            }
          } 
        },
        user: true,
      },
    });

    if (!program) {
      return { success: false, error: 'Program not found' };
    }

    // todo: this is a temp hack, need to fix this
    // will eventually refactor models to have nutrition as a separate model
    const finalProgram = {
      ...program,
      workoutPlans: program.workoutPlans.map(plan => ({
        ...plan,
        nutrition: {
          macros: {
            fats: plan.fatGrams,
            protein: plan.proteinGrams, 
            carbs: plan.carbGrams,
          },
          dailyCalories: plan.dailyCalories,
        }
      }))
    }
    console.log("🚀 ~ getUserProgram ~ finalProgram:", finalProgram)

    return { success: true, program: finalProgram };
  } catch (error) {
    console.error('Failed to fetch program:', error);
    return { success: false, error: 'Failed to fetch program' };
  }
}

// Add function to delete workout plan
export async function deleteWorkoutPlan(userId: string) {
  try {
    await prisma.workoutPlan.deleteMany({
      where: {
        userId: userId,
      },
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to delete workout plan:', error);
    return { success: false, error: 'Failed to delete workout plan' };
  }
}
/**
 * Parse the workout plan data from the AI response
 * to save all the exercises in the core library
 * and then the workouts themselves
 * @NOTE / @TODO: UNSURE I LOVE THIS APPROACH 
 * 
 * @param data - The workout plan data from the AI response
 * @returns The parsed workout plan data
 */
const prepareWorkoutPlanObject = async (phases: PhasesData[]) => {
  const workouts = await Promise.all(phases.map(async (phase) => 
    phase.trainingPlan.workouts.map((workout: Workout) => ({
      dayNumber: workout.day,
      exercises: {
        create: workout.exercises.map((exercise: Exercise) => ({
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          restPeriod: exercise.restPeriod,
          exerciseLibrary: {
            connectOrCreate: {
              where: { name: exercise.name },
              create: {
                name: exercise.name,
                category: 'default',
                difficulty: 'intermediate'
              }
            }
          }
        })),
      }
    }))
  ));

  // Create a workout plan for each phase
  return phases.map((phase, index) => ({
    phase: phase.phase,
    bodyFatPercentage: phase.bodyComposition.bodyFatPercentage,
    muscleMassDistribution: phase.bodyComposition.muscleMassDistribution,
    dailyCalories: phase.nutrition.dailyCalories,
    proteinGrams: phase.nutrition.macros.protein,
    carbGrams: phase.nutrition.macros.carbs,
    fatGrams: phase.nutrition.macros.fats,
    mealTiming: phase.nutrition.mealTiming,
    progressionProtocol: phase.progressionProtocol,
    daysPerWeek: phase.trainingPlan.daysPerWeek,
    workouts: {
      create: workouts[index]
    }
  }));
};

// Save workout plan to db
export async function createNewProgram(programData: ProgramData, userId: string) {
  // create a new program with the descriptoin and name and a fake userid 82dd7d11-6683-4c7c-a3bf-e7f059ae2e24
  try {
    const { phases, ...programDetails } = programData;
    const newProgram = await prisma.program.create({
      data: {
        name: programDetails.programName,
        description: programDetails.programDescription,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    const preppedPlans = await prepareWorkoutPlanObject(phases);
    
    // Create all workout plans for each phase
    const newWorkoutPlans = await Promise.all(
      preppedPlans.map(async (plan, index) => {
        const createData = {
          ...plan,
          userId,
          programId: newProgram.id,
        };
        
        return prisma.workoutPlan.create({
          data: createData,
          include: {
            workouts: {
              include: {
                exercises: true
              }
            }
          }
        });
      })
    );

    const program = await getUserProgram(userId, newProgram.id);

    return program;
  } catch (error) {
    console.error('Failed to save workout plan:', error);
    return { success: false, error: 'Failed to save workout plan' };
  }
}

// todo: rename to its more specific purpose
export async function preparePromptForAI(
  userId: string,
  intakeData?: IntakeFormData,
  images?: UserImages[]
) {
  console.log("🚀 ~ preparePromptForAI ~ images:", images)
  console.time('preparePromptForAI-total');
  try {
    console.time('fetch-intake-data');
    // rethink this, seems sloppy/verbose
    if (userId && !intakeData) {
      const dbIntake = await prisma.userIntake.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      
      if (dbIntake) {
        intakeData = {
          sex: dbIntake.sex as Sex,
          trainingGoal: dbIntake.trainingGoal as TrainingGoal,
          daysAvailable: dbIntake.daysAvailable,
          trainingPreferences: dbIntake.trainingPreferences as TrainingPreference[],
          additionalInfo: dbIntake.additionalInfo || '',
          dailyBudget: dbIntake.dailyBudget || undefined,
          age: dbIntake.age || undefined,
          weight: dbIntake.weight || undefined,
          height: dbIntake.height || undefined,
        };
      }
    }
    console.timeEnd('fetch-intake-data');

    if (!intakeData) {
      console.error("🚀 ~ preparePromptForAI ~ no intake data sent or found")
      return { success: false, error: 'No intake data found' };
    }

    console.time('generate-prompt');
    const clientDataPrompt = generateInitialProgramPrompt(intakeData); 
    const clientPicturePrompt = "Please analyze this image and estimate body fat percentage.";
    console.timeEnd('generate-prompt');

    // Base message content
    const messageContent: MessageParam['content'] = [];

    console.time('process-images');
    // Add images to message content if provided
    if (images?.length) {
      console.log("🚀 ~ preparePromptForAI ~ attempting to add images to message content:", images.length)
      for (const image of images) {
        const base64String = image.base64Data.split(',')[1];
        const mediaType = image.base64Data.split(';')[0].split(':')[1];
        
        messageContent.push({
          type: "image",
          source: {
            type: "base64",
            media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: base64String,
          },
        });
      }
      messageContent.push({ type: 'text', text: clientPicturePrompt });
    }
    console.timeEnd('process-images');

    // Add text prompt
    messageContent.push({ type: 'text', text: clientDataPrompt });
    
    console.time('ai-response');
    // Send message to AI
    const aiResponse = await sendMessage([{
      role: 'user',
      content: messageContent,
    }]);
    console.timeEnd('ai-response');

    if (aiResponse.success) {
      console.time('save-prompt-log');
      await prisma.promptLog.create({
        data: {
          userId,
          prompt: JSON.stringify(messageContent),
          response: aiResponse.data?.content[0].text || '',
          inputTokens: aiResponse.data?.usage?.input_tokens,
          outputTokens: aiResponse.data?.usage?.output_tokens,
          model: process.env.SONNET_MODEL!,
        },
      });
      console.timeEnd('save-prompt-log');
      console.timeEnd('preparePromptForAI-total');
      return {
        success: true,
        response: aiResponse.data?.content[0].text,
        images: images?.map(img => ({ fileName: img.fileName }))
      };
    }

    console.timeEnd('preparePromptForAI-total');
    return { success: false, error: 'AI response failed' };
  } catch (error) {
    console.timeEnd('preparePromptForAI-total');
    console.error('Claude processing error:', error);
    return { success: false, error: 'Failed to process with Claude' };
  }
}

