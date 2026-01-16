import { prisma } from '@/lib/prisma';
import { MilestoneType } from '@prisma/client';
import { MILESTONES, checkMilestoneThresholdCrossed } from '@/lib/milestones';

export interface MilestoneUnlockResult {
  unlocked: boolean;
  milestone: MilestoneType | null;
  totalWorkouts: number;
  totalVolume: number;
}

/**
 * Check if a user crossed a milestone threshold and award it if so.
 * Called after workout completion.
 */
export async function checkAndAwardMilestone(userId: string): Promise<MilestoneUnlockResult> {
  // Get total completed workouts
  const totalWorkouts = await prisma.workoutLog.count({
    where: {
      userId,
      status: 'completed',
    },
  });

  // Get total volume lifted
  const setLogs = await prisma.setLog.findMany({
    where: {
      exerciseLog: {
        workoutLog: {
          userId,
          status: 'completed',
        },
      },
      weight: { not: null },
    },
    select: {
      weight: true,
      reps: true,
    },
  });

  const totalVolume = setLogs.reduce((sum, set) => {
    return sum + (set.weight || 0) * set.reps;
  }, 0);

  // Get already earned milestones
  const earnedMilestones = await prisma.milestoneAchievement.findMany({
    where: { userId },
    select: { type: true },
  });

  const earnedTypes = new Set(earnedMilestones.map((m) => m.type));

  // Check which milestones should be unlocked
  // We need to find milestones where threshold <= totalWorkouts AND not already earned
  const eligibleMilestones = MILESTONES.filter(
    (m) => m.threshold <= totalWorkouts && !earnedTypes.has(m.type)
  );

  // Award all eligible milestones (in case user completed multiple workouts without checking)
  for (const milestone of eligibleMilestones) {
    await prisma.milestoneAchievement.create({
      data: {
        userId,
        type: milestone.type,
        totalWorkouts,
        totalVolume,
      },
    });
  }

  // Return the highest newly unlocked milestone (for celebration display)
  if (eligibleMilestones.length > 0) {
    const highestMilestone = eligibleMilestones.reduce((max, m) =>
      m.threshold > max.threshold ? m : max
    );

    return {
      unlocked: true,
      milestone: highestMilestone.type,
      totalWorkouts,
      totalVolume,
    };
  }

  return {
    unlocked: false,
    milestone: null,
    totalWorkouts,
    totalVolume,
  };
}

/**
 * Get all milestones for a user
 */
export async function getUserMilestones(userId: string) {
  const milestones = await prisma.milestoneAchievement.findMany({
    where: { userId },
    orderBy: { earnedAt: 'asc' },
  });

  const totalWorkouts = await prisma.workoutLog.count({
    where: {
      userId,
      status: 'completed',
    },
  });

  return {
    milestones,
    totalWorkouts,
  };
}
