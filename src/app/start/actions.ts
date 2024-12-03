'use server'

import { prisma } from '@/lib/prisma';
import { sendMessage } from '@/utils/chat';
import { generateTrainingProgramPrompt } from './prompts';
import { Exercise, Workout, ProgramData, PhasesData } from './types';
import { MessageParam } from '@anthropic-ai/sdk/src/resources/messages.js';
import { User, UserImages } from '@prisma/client';

// Add new types for the form data
export type TrainingGoal = 'weight loss' | 'maintenance' | 'body recomposition' | 'strength gains' | 'weight gain' | 'muscle building' | 'other';
export type Sex = 'man' | 'woman' | 'other';
export type TrainingPreference = 'cardio' | 'resistance' | 'free weights' | 'machines' | 'kettlebell' | 'running' | 'plyometrics' | 'yoga';

export interface IntakeFormData {
  sex: Sex;
  trainingGoal: TrainingGoal;
  daysAvailable: number;
  trainingPreferences: TrainingPreference[];
  additionalInfo: string;
  dailyBudget?: number;
  age?: number;
  weight?: number;
  height?: number;
  experienceLevel?: string;
}

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
        const savedImage = await prisma.userImages.create({
          data: {
            fileName: image.fileName,
            base64Data: image.base64Data,
            userId: image.userId,
          },
        });

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
    await prisma.userImages.delete({
      where: {
        id: imageId,
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
  await prisma.user.update({
    where: { id: userId },
    data,
  });
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
      const { files, ...intakeData } = intakeForm as IntakeFormData & { files: ImageUpload[] };
      
      // Upload images if present
      if (files?.length) {
        const imageUploadResult = await uploadImages(
          files.map(file => ({
            ...file,
            userId,
            intakeForm: intakeData
          }))
        );
        
        if (!imageUploadResult.success) {
          throw new Error('Failed to upload images');
        }

        uploadedImages.push(imageUploadResult.images);
      }
      
      intakeForm = intakeData;
    } else {
      console.log("🚀 ~ saveIntakeForm ~ no files in intake form")
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

// Get workout plan for a previously saved session
export async function getSessionWorkoutPlans(userId: string) {
  if (!userId) {
    return { success: false, error: 'User ID is required' };
  }

  try {
    const program = await prisma.program.findFirst({
      where: {
        workoutPlans: {
          some: {
            userId: userId,
          },
        },
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
        }
      },
    });

    return { success: true, program };
  } catch (error) {
    console.error('Failed to fetch workout plan:', error);
    return { success: false, error: 'Failed to fetch workout plan' };
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
    const workoutPlans = await Promise.all(
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

    return { success: true, program: newProgram, workoutPlans: workoutPlans };
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
    const clientDataPrompt = generateTrainingProgramPrompt(intakeData); 
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
    console.log("🚀 ~ messageContent:", messageContent)
    
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
          model: 'claude-3-haiku-20240307',
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

