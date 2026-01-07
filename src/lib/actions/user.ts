'use server'

import { prisma } from '@/lib/prisma';
import { User } from '@prisma/client';
import { Prisma } from '@prisma/client';

/**
 * User-related server actions
 * Extracted from src/app/start/actions.ts during legacy cleanup (#168)
 */

export async function getUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  return { success: true, user };
}

export async function updateUser(userId: string, data: { email?: string }): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data
    });
    return { success: true, user };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { success: false, error: 'EMAIL_EXISTS' };
      }
    }
    console.error('Error updating user:', error);
    return { success: false, error: 'UNKNOWN_ERROR' };
  }
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
        userImages: true,
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
                exercises: { orderBy: { sortOrder: 'asc' } },
              }
            }
          }
        },
        createdByUser: true,
      },
    });

    if (!program) {
      return { success: false, error: 'Program not found' };
    }

    // Transform DB schema to API response format
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
    return { success: true, program: finalProgram };
  } catch (error) {
    console.error('Failed to fetch program:', error);
    return { success: false, error: 'Failed to fetch program' };
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
