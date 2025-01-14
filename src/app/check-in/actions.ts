'use server';

import { CheckIn } from "./page";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from '@/auth';
import { CheckInFormData } from "./page";

export async function createCheckIn(formData: CheckInFormData) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error('Not authenticated');
    }

    if (!session.user?.id) {
      throw new Error('User ID not found');
    }

    // Get current program
    const program = await prisma.program.findFirst({
      where: {
        createdBy: session.user.id,
        // Add any other conditions to get the active program
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!program) {
      throw new Error('No active program found');
    }

    // Create the check-in
    const checkIn = await prisma.checkIn.create({
      data: {
        userId: session.user?.id,
        programId: program.id,
        type: formData.type,
        notes: formData.notes,
      },
    });

    // Create user stats
    await prisma.userStats.create({
      data: {
        userId: session.user?.id,
        programId: program.id,
        checkInId: checkIn.id,
        weight: formData.weight,
        bodyFat: formData.bodyFat,
        notes: formData.statsNotes,
        
        // Body Measurements
        chest: formData.chest,
        waist: formData.waist,
        hips: formData.hips,
        bicepLeft: formData.bicepLeft,
        bicepRight: formData.bicepRight,
        bicepLeftFlex: formData.bicepLeftFlex,
        bicepRightFlex: formData.bicepRightFlex,
        thighLeft: formData.thighLeft,
        thighRight: formData.thighRight,
        calfLeft: formData.calfLeft,
        calfRight: formData.calfRight,

        // Wellness
        sleepHours: formData.sleepHours,
        sleepQuality: formData.sleepQuality,
        energyLevel: formData.energyLevel,
        stressLevel: formData.stressLevel,
        soreness: formData.soreness,
        recovery: formData.recovery,
      },
    });

    // Handle photos
    for (const photo of formData.photos) {
      if (photo.file && photo.base64Data) {
        // Create UserImage first
        const userImage = await prisma.userImages.create({
          data: {
            userId: session.user.id,
            programId: program.id,
            checkInId: checkIn.id,
            fileName: photo.file.name,
            type: photo.type,
            base64Data: photo.base64Data,
          },
        });

        // Create ProgressPhoto linking
        await prisma.progressPhoto.create({
          data: {
            checkInId: checkIn.id,
            userImageId: userImage.id,
            type: photo.type,
          },
        });
      }
    }

    revalidatePath('/dashboard');
    return { success: true, checkIn };
  } catch (error) {
    console.error('Error creating check-in:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create check-in' 
    };
  }
}

export const getLatestCheckIn = async (programId: string) => {
  const checkIn = await prisma.checkIn.findFirst({
    where: {
      programId,
    },
    include: {
      stats: true,
      progressPhoto: {
        include: {
          userImage: {
            select: {
              id: true,
              base64Data: true,
              type: true,
            },
          },
          userStats: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return checkIn;
}