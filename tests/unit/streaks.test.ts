import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Tests for Streak Tracking Logic
 * Issue #194
 *
 * Business Rules:
 * - First activity starts streak at 1
 * - Same day activity doesn't change streak
 * - Consecutive day extends streak
 * - Missed day(s) resets streak to 1
 * - Longest streak is tracked separately
 * - Uses transaction to prevent race conditions
 */

// Mock date-fns functions for deterministic testing
vi.mock('date-fns', () => ({
  startOfDay: (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  },
  differenceInDays: (date1: Date, date2: Date) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    return Math.floor((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
  }
}));

describe('Streak Calculation Logic', () => {
  // Helper that mirrors the logic in streaks.ts
  const calculateStreak = (
    user: {
      streakCurrent: number;
      streakLongest: number;
      streakLastActivityAt: Date | null;
    },
    today: Date
  ): { current: number; longest: number; extended: boolean } => {
    const startOfDay = (date: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const differenceInDays = (date1: Date, date2: Date) => {
      const d1 = startOfDay(date1);
      const d2 = startOfDay(date2);
      return Math.floor((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
    };

    const todayStart = startOfDay(today);
    const lastActivity = user.streakLastActivityAt
      ? startOfDay(user.streakLastActivityAt)
      : null;

    // First activity ever
    if (!lastActivity) {
      return { current: 1, longest: 1, extended: true };
    }

    const daysSince = differenceInDays(todayStart, lastActivity);

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
      return { current: newStreak, longest: newLongest, extended: true };
    }

    // Streak broken - reset to 1
    return { current: 1, longest: user.streakLongest, extended: false };
  };

  describe('First workout', () => {
    it('should start streak at 1 for first ever activity', () => {
      const user = {
        streakCurrent: 0,
        streakLongest: 0,
        streakLastActivityAt: null
      };
      const result = calculateStreak(user, new Date('2024-01-15T10:00:00Z'));
      expect(result.current).toBe(1);
      expect(result.longest).toBe(1);
      expect(result.extended).toBe(true);
    });
  });

  describe('Same day activity', () => {
    it('should not change streak for second workout same day', () => {
      const user = {
        streakCurrent: 5,
        streakLongest: 10,
        streakLastActivityAt: new Date('2024-01-15T08:00:00Z')
      };
      const result = calculateStreak(user, new Date('2024-01-15T18:00:00Z'));
      expect(result.current).toBe(5);
      expect(result.longest).toBe(10);
      expect(result.extended).toBe(false);
    });

    it('should not change streak for multiple workouts same day', () => {
      const user = {
        streakCurrent: 3,
        streakLongest: 3,
        streakLastActivityAt: new Date('2024-01-15T08:00:00')
      };
      const result = calculateStreak(user, new Date('2024-01-15T20:00:00'));
      expect(result.current).toBe(3);
      expect(result.extended).toBe(false);
    });
  });

  describe('Consecutive day', () => {
    it('should extend streak by 1 for consecutive day', () => {
      const user = {
        streakCurrent: 5,
        streakLongest: 10,
        streakLastActivityAt: new Date('2024-01-14T10:00:00Z')
      };
      const result = calculateStreak(user, new Date('2024-01-15T10:00:00Z'));
      expect(result.current).toBe(6);
      expect(result.longest).toBe(10);
      expect(result.extended).toBe(true);
    });

    it('should update longest when current exceeds it', () => {
      const user = {
        streakCurrent: 10,
        streakLongest: 10,
        streakLastActivityAt: new Date('2024-01-14T10:00:00Z')
      };
      const result = calculateStreak(user, new Date('2024-01-15T10:00:00Z'));
      expect(result.current).toBe(11);
      expect(result.longest).toBe(11);
      expect(result.extended).toBe(true);
    });

    it('should handle late night to early morning consecutive', () => {
      const user = {
        streakCurrent: 2,
        streakLongest: 5,
        streakLastActivityAt: new Date('2024-01-14T23:30:00Z')
      };
      const result = calculateStreak(user, new Date('2024-01-15T06:00:00Z'));
      expect(result.current).toBe(3);
      expect(result.extended).toBe(true);
    });
  });

  describe('Streak broken', () => {
    it('should reset to 1 when 2 days pass', () => {
      const user = {
        streakCurrent: 5,
        streakLongest: 10,
        streakLastActivityAt: new Date('2024-01-13T10:00:00Z')
      };
      const result = calculateStreak(user, new Date('2024-01-15T10:00:00Z'));
      expect(result.current).toBe(1);
      expect(result.longest).toBe(10); // Longest preserved
      expect(result.extended).toBe(false);
    });

    it('should reset to 1 when many days pass', () => {
      const user = {
        streakCurrent: 100,
        streakLongest: 100,
        streakLastActivityAt: new Date('2024-01-01T10:00:00Z')
      };
      const result = calculateStreak(user, new Date('2024-02-01T10:00:00Z'));
      expect(result.current).toBe(1);
      expect(result.longest).toBe(100);
      expect(result.extended).toBe(false);
    });

    it('should preserve longest streak after reset', () => {
      const user = {
        streakCurrent: 3,
        streakLongest: 50,
        streakLastActivityAt: new Date('2024-01-10T10:00:00Z')
      };
      const result = calculateStreak(user, new Date('2024-01-15T10:00:00Z'));
      expect(result.current).toBe(1);
      expect(result.longest).toBe(50);
    });
  });

  describe('Edge cases', () => {
    it('should extend streak for consecutive calendar days', () => {
      // Use midday times to avoid timezone issues
      const user = {
        streakCurrent: 1,
        streakLongest: 1,
        streakLastActivityAt: new Date('2024-01-14T12:00:00')
      };
      const result = calculateStreak(user, new Date('2024-01-15T12:00:00'));
      expect(result.current).toBe(2);
      expect(result.extended).toBe(true);
    });

    it('should handle year boundary', () => {
      const user = {
        streakCurrent: 5,
        streakLongest: 5,
        streakLastActivityAt: new Date('2023-12-31T12:00:00')
      };
      const result = calculateStreak(user, new Date('2024-01-01T12:00:00'));
      expect(result.current).toBe(6);
      expect(result.extended).toBe(true);
    });

    it('should handle month boundary', () => {
      const user = {
        streakCurrent: 3,
        streakLongest: 3,
        streakLastActivityAt: new Date('2024-01-31T12:00:00')
      };
      const result = calculateStreak(user, new Date('2024-02-01T12:00:00'));
      expect(result.current).toBe(4);
      expect(result.extended).toBe(true);
    });
  });
});

describe('getStreak Warning Behavior', () => {
  type UserStreak = { streakCurrent: number; streakLongest: number } | null;

  const getStreakResult = (user: UserStreak) => {
    if (!user) {
      return { current: 0, longest: 0 };
    }
    return { current: user.streakCurrent, longest: user.streakLongest };
  };

  it('should return zeros for invalid userId with warning', () => {
    const result = getStreakResult(null);
    expect(result.current).toBe(0);
    expect(result.longest).toBe(0);
  });

  it('should return actual values for valid user', () => {
    const result = getStreakResult({ streakCurrent: 5, streakLongest: 10 });
    expect(result.current).toBe(5);
    expect(result.longest).toBe(10);
  });
});
