'use server'

import { prisma } from '@/lib/prisma';
import { sendMessage } from '@/utils/chat';
import { generateTrainingProgramPrompt } from './prompts';
import { Exercise, WorkoutPlanData, Workout } from './types';
import { MessageParam } from '@anthropic-ai/sdk/src/resources/messages.js';
import { UserImages } from '@prisma/client';
import { Message } from '@anthropic-ai/sdk/resources/messages.mjs';

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
}

export type ImageUpload = {
  fileName: string;
  base64Data: string;
  sessionId: string;
  intakeForm?: IntakeFormData;  // Make intake form optional for backwards compatibility
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
            sessionId: image.sessionId,
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

export async function getSessionImages(sessionId: string) {
  if (!sessionId) {
    return { success: false, error: 'Session ID is required' };
  }

  try {
    const images = await prisma.userImages.findMany({
      where: {
        sessionId: sessionId,
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

// todo: consider upserting
export async function saveIntakeForm(sessionId: string, intakeForm: IntakeFormData) {
  try {
    let uploadedImages = [];
    // Handle any uploaded files if they exist
    if ('files' in intakeForm) {
      const { files, ...intakeData } = intakeForm as IntakeFormData & { files: ImageUpload[] };
      
      // Upload images if present
      if (files?.length) {
        const imageUploadResult = await uploadImages(
          files.map(file => ({
            ...file,
            sessionId,
            intakeForm: intakeData
          }))
        );
        
        if (!imageUploadResult.success) {
          throw new Error('Failed to upload images');
        }

        uploadedImages.push(imageUploadResult.images);
      }
      
      intakeForm = intakeData;
    }

    const savedIntake = await prisma.userIntake.create({
      data: {
        sessionId,
        sex: intakeForm.sex,
        trainingGoal: intakeForm.trainingGoal,
        daysAvailable: intakeForm.daysAvailable,
        budget: intakeForm.dailyBudget,
        age: intakeForm.age,
        weight: intakeForm.weight,
        height: intakeForm.height,
        trainingPreferences: intakeForm.trainingPreferences,
        additionalInfo: intakeForm.additionalInfo,
      },
    });

    return { success: true, intake: savedIntake, images: uploadedImages };
  } catch (error) {
    console.error('Intake form save error:', error);
    return { success: false, error: 'Failed to save intake form' };
  }
}

export async function getSessionIntake(sessionId: string) {
  if (!sessionId) {
    return { success: false, error: 'Session ID is required' };
  }

  try {
    const intake = await prisma.userIntake.findFirst({
      where: {
        sessionId: sessionId,
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
export async function getSessionPromptLogs(sessionId: string) {
  if (!sessionId) {
    return { success: false, error: 'Session ID is required' };
  }

  try {
    const logs = await prisma.promptLog.findMany({
      where: {
        sessionId: sessionId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, logs };
  } catch (error) {
    console.error('Failed to fetch prompt logs:', error);
    return { success: false, error: 'Failed to fetch prompt logs' };
  }
}

// Get workout plan for a previously saved session
export async function getSessionWorkoutPlan(sessionId: string) {
  if (!sessionId) {
    return { success: false, error: 'Session ID is required' };
  }

  try {
    const workoutPlan = await prisma.workoutPlan.findFirst({
      where: {
        sessionId: sessionId,
      },
      include: {
        workouts: {
          orderBy: {
            dayNumber: 'asc',
          },
          include: {
            exercises: true,
          },
        },
      },
    });

    return { success: true, workoutPlan };
  } catch (error) {
    console.error('Failed to fetch workout plan:', error);
    return { success: false, error: 'Failed to fetch workout plan' };
  }
}

// Add function to delete workout plan
export async function deleteWorkoutPlan(sessionId: string) {
  try {
    await prisma.workoutPlan.deleteMany({
      where: {
        sessionId: sessionId,
      },
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to delete workout plan:', error);
    return { success: false, error: 'Failed to delete workout plan' };
  }
}

async function parseWorkoutPlan(data: WorkoutPlanData) {
  const workouts = await Promise.all(data.workoutPlan.workouts.map(async (workout: Workout) => ({
    dayNumber: workout.day,
    exercises: {
      create: workout.exercises.map((exercise: Exercise) => ({
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        restPeriod: exercise.restPeriod,
        exerciseLibrary: {
          create: {
            name: exercise.name,
            category: 'default',
            difficulty: 'intermediate'
          }
        }
      })),
    },
  })));

  return {
    bodyFatPercentage: data.bodyComposition.bodyFatPercentage,
    muscleMassDistribution: data.bodyComposition.muscleMassDistribution,
    dailyCalories: data.nutrition.dailyCalories,
    proteinGrams: data.nutrition.macros.protein,
    carbGrams: data.nutrition.macros.carbs,
    fatGrams: data.nutrition.macros.fats,
    mealTiming: data.nutrition.mealTiming,
    progressionProtocol: data.progressionProtocol,
    daysPerWeek: data.workoutPlan.daysPerWeek,
    workouts: {
      create: workouts
    }
  };
}

// Save workout plan to db
export async function createWorkoutPlan(planData: WorkoutPlanData, sessionId: string) {
  try {
    const parsedPlan = await parseWorkoutPlan(planData);
    const workoutPlan = await prisma.workoutPlan.create({
      data: { ...parsedPlan, sessionId },
      include: {
        workouts: {
          include: {
            exercises: true,
          },
        },
      },
    });

    return { success: true, workoutPlan };
  } catch (error) {
    console.error('Failed to save workout plan:', error);
    return { success: false, error: 'Failed to save workout plan' };
  }
}

// todo: rename to its more specific purpose
export async function preparePromptForAI(
  sessionId: string, 
  intakeData?: IntakeFormData,
  images?: UserImages[]
) {
  try {
    // rethink this, seems sloppy/verbose
    if (!intakeData && sessionId) {
      const dbIntake = await prisma.userIntake.findFirst({
        where: { sessionId },
        orderBy: { createdAt: 'desc' },
      });
      
      if (dbIntake) {
        intakeData = {
          sex: dbIntake.sex as Sex,
          trainingGoal: dbIntake.trainingGoal as TrainingGoal,
          daysAvailable: dbIntake.daysAvailable,
          trainingPreferences: dbIntake.trainingPreferences as TrainingPreference[],
          additionalInfo: dbIntake.additionalInfo || '',
          dailyBudget: dbIntake.budget || undefined,
          age: dbIntake.age || undefined,
          weight: dbIntake.weight || undefined,
          height: dbIntake.height || undefined,
        };
      }
    }

    const clientDataPrompt = generateTrainingProgramPrompt(intakeData); 
    const clientPicturePrompt = "Please analyze this image and estimate body fat percentage.";

    // Base message content
    const messageContent: MessageParam['content'] = [];

    // Add images to message content if provided
    if (images?.length) {
      for (const image of images) {
        const base64String = image.base64Data.split(',')[1];
        const mediaType = image.base64Data.split(';')[0].split(':')[1];
        
        messageContent.push({
          type: "image",
          source: {
            type: "base64",
            media_type: mediaType,
            data: base64String,
          },
        });
      }
      messageContent.push({ type: 'text', text: clientPicturePrompt });
    }

    // Add text prompt
    messageContent.push({ type: 'text', text: clientDataPrompt });

    // Send message to AI
    const aiResponse = await sendMessage([{
      role: 'user',
      content: messageContent,
    }]);

    if (aiResponse.success) {
      await prisma.promptLog.create({
        data: {
          sessionId,
          prompt: JSON.stringify(messageContent),
          response: aiResponse.data?.content[0].text || '',
          model: 'claude-3-5-sonnet-20240620',
        },
      });

      return {
        success: true,
        response: aiResponse.data?.content[0].text,
        images: images?.map(img => ({ fileName: img.fileName }))
      };
    }

    return { success: false, error: 'AI response failed' };
  } catch (error) {
    console.error('Claude processing error:', error);
    return { success: false, error: 'Failed to process with Claude' };
  }
}

