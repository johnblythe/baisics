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