import { prisma } from './prisma';
import { startOfDay, differenceInDays } from 'date-fns';

export interface StreakResult {
  current: number;
  longest: number;
  extended: boolean;
}

/**
 * Updates a user's workout streak.
 * - First activity: starts streak at 1
 * - Same day: no change
 * - Consecutive day: extends streak
 * - Missed day(s): resets to 1
 *
 * Uses transaction to prevent race conditions from concurrent updates.
 */
export async function updateStreak(userId: string): Promise<StreakResult> {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: {
        streakCurrent: true,
        streakLongest: true,
        streakLastActivityAt: true
      }
    });

    if (!user) throw new Error('User not found');

    const today = startOfDay(new Date());
    const lastActivity = user.streakLastActivityAt
      ? startOfDay(user.streakLastActivityAt)
      : null;

    // First activity ever
    if (!lastActivity) {
      await tx.user.update({
        where: { id: userId },
        data: {
          streakCurrent: 1,
          streakLongest: 1,
          streakLastActivityAt: today
        }
      });
      return { current: 1, longest: 1, extended: true };
    }

    const daysSince = differenceInDays(today, lastActivity);

    // Already logged today
    if (daysSince === 0) {
      return {
        current: user.streakCurrent,
        longest: user.streakLongest,
        extended: false
      };
    }

    // Consecutive day - extend streak
    if (daysSince === 1) {
      const newStreak = user.streakCurrent + 1;
      const newLongest = Math.max(user.streakLongest, newStreak);

      await tx.user.update({
        where: { id: userId },
        data: {
          streakCurrent: newStreak,
          streakLongest: newLongest,
          streakLastActivityAt: today
        }
      });
      return { current: newStreak, longest: newLongest, extended: true };
    }

    // Streak broken - reset to 1
    await tx.user.update({
      where: { id: userId },
      data: {
        streakCurrent: 1,
        streakLastActivityAt: today
      }
    });
    return { current: 1, longest: user.streakLongest, extended: false };
  });
}

/**
 * Get a user's current streak without modifying it.
 * Returns zeros if user not found (with warning log).
 */
export async function getStreak(userId: string): Promise<{ current: number; longest: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streakCurrent: true, streakLongest: true }
  });

  if (!user) {
    console.warn('getStreak called with invalid userId:', userId);
    return { current: 0, longest: 0 };
  }

  return {
    current: user.streakCurrent,
    longest: user.streakLongest
  };
}
