'use server'

import { prisma } from '@/lib/prisma';
import { sendMessage } from '@/utils/chat';
import { generateTrainingProgramPrompt } from './prompts';

// Add new types for the form data
export type TrainingGoal = 'weight loss' | 'maintenance' | 'body recomposition' | 'strength gains' | 'weight gain' | 'muscle building' | 'other';
export type Sex = 'man' | 'woman' | 'other';
export type TrainingPreference = 'cardio' | 'resistance' | 'free weights' | 'machines' | 'kettlebell' | 'running' | 'plyometrics' | 'yoga';

export type IntakeFormData = {
  sex: Sex;
  trainingGoal: TrainingGoal;
  daysAvailable: number;
  budget?: number;
  trainingPreferences: TrainingPreference[];
  additionalInfo?: string;
};

export type ImageUpload = {
  fileName: string;
  base64Data: string;
  sessionId: string;
  intakeForm?: IntakeFormData;  // Make intake form optional for backwards compatibility
};

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

        const intakeData = await prisma.userIntake.findFirst({
          where: {
            sessionId: image.sessionId,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        const base64String = image.base64Data.split(',')[1];
        const mediaType = image.base64Data.split(';')[0].split(':')[1];

        const prompt = intakeData 
          ? generateTrainingProgramPrompt(intakeData) 
          : "Please analyze this image and estimate body fat percentage.";

        const messages = [{
          role: 'user',
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64String,
              },
            },
            { 
              type: 'text', 
              text: prompt
            },
          ],
        }];

        const aiResponse = await sendMessage(messages);
        
        if (aiResponse.success) {
          // Log the prompt and response
          await prisma.promptLog.create({
            data: {
              sessionId: image.sessionId,
              prompt: prompt,
              response: aiResponse.data?.content[0].text || '',
              model: 'claude-3-5-sonnet-20240620', // todo: make this dynamic / envar
            },
          });

          return {
            ...savedImage,
            aiDescription: aiResponse.data?.content[0].text
          };
        }

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

export async function saveIntakeForm(sessionId: string, intakeForm: IntakeFormData) {
  try {
    const savedIntake = await prisma.userIntake.create({
      data: {
        sessionId,
        sex: intakeForm.sex,
        trainingGoal: intakeForm.trainingGoal,
        daysAvailable: intakeForm.daysAvailable,
        budget: intakeForm.budget,
        trainingPreferences: intakeForm.trainingPreferences,
        additionalInfo: intakeForm.additionalInfo,
      },
    });

    // Get the latest AI response from prompt logs
    const latestPromptLog = await prisma.promptLog.findFirst({
      where: {
        sessionId: sessionId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (latestPromptLog) {
      try {
        // Parse the AI response and save workout plan
        const aiResponse = JSON.parse(latestPromptLog.response) as WorkoutPlanData;
        const workoutPlanResult = await saveWorkoutPlan(sessionId, aiResponse);
        
        return { 
          success: true, 
          intake: savedIntake,
          workoutPlan: workoutPlanResult.success ? workoutPlanResult.workoutPlan : null,
        };
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        // Continue even if workout plan saving fails
        return { success: true, intake: savedIntake };
      }
    }

    return { success: true, intake: savedIntake };
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

// Add new types for workout data
type Exercise = {
  name: string;
  sets: number;
  reps: number;
  restPeriod: string;
};

type Workout = {
  day: number;
  exercises: Exercise[];
};

type WorkoutPlanData = {
  bodyComposition: {
    bodyFatPercentage: number;
    muscleMassDistribution: string;
  };
  workoutPlan: {
    daysPerWeek: number;
    workouts: Workout[];
  };
  nutrition: {
    dailyCalories: number;
    macros: {
      protein: number;
      carbs: number;
      fats: number;
    };
    mealTiming: string[];
  };
  progressionProtocol: string[];
};

// Function to save workout plan from Claude's response
export async function saveWorkoutPlan(sessionId: string, planData: WorkoutPlanData) {
  try {
    const workoutPlan = await prisma.workoutPlan.create({
      data: {
        sessionId,
        bodyFatPercentage: planData.bodyComposition.bodyFatPercentage,
        muscleMassDistribution: planData.bodyComposition.muscleMassDistribution,
        daysPerWeek: planData.workoutPlan.daysPerWeek,
        dailyCalories: planData.nutrition.dailyCalories,
        proteinGrams: planData.nutrition.macros.protein,
        carbGrams: planData.nutrition.macros.carbs,
        fatGrams: planData.nutrition.macros.fats,
        mealTiming: planData.nutrition.mealTiming,
        progressionProtocol: planData.progressionProtocol,
        workouts: {
          create: planData.workoutPlan.workouts.map(workout => ({
            dayNumber: workout.day,
            exercises: {
              create: workout.exercises.map(exercise => ({
                name: exercise.name,
                sets: exercise.sets,
                reps: exercise.reps,
                restPeriod: exercise.restPeriod,
              })),
            },
          })),
        },
      },
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

// Function to get workout plan for a session
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