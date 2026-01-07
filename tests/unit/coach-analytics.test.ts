import { describe, it, expect } from 'vitest';

/**
 * Tests for Coach Analytics
 * Issue #201
 *
 * Business Rules:
 * - Analytics aggregate data across all coach's clients
 * - Weekly trends show last 4 weeks of activity
 * - Active = logged workout in last 7 days
 * - Program completion = completed workouts / total workouts
 */

describe('Coach Analytics Logic', () => {
  describe('Activity calculation', () => {
    const isActiveThisWeek = (lastWorkoutDate: Date | null): boolean => {
      if (!lastWorkoutDate) return false;
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return lastWorkoutDate >= weekAgo;
    };

    it('should mark client as active if workout within 7 days', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(isActiveThisWeek(yesterday)).toBe(true);
    });

    it('should mark client as inactive if no workout in 7+ days', () => {
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      expect(isActiveThisWeek(twoWeeksAgo)).toBe(false);
    });

    it('should mark client as inactive if no workouts ever', () => {
      expect(isActiveThisWeek(null)).toBe(false);
    });

    it('should handle edge case at exactly 7 days', () => {
      const exactlyWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      expect(isActiveThisWeek(exactlyWeekAgo)).toBe(true);
    });
  });

  describe('Program completion rate', () => {
    const calculateCompletionRate = (
      completedWorkouts: number,
      totalWorkouts: number
    ): number => {
      if (totalWorkouts === 0) return 0;
      return Math.round((completedWorkouts / totalWorkouts) * 100);
    };

    it('should calculate 50% for half completed', () => {
      expect(calculateCompletionRate(5, 10)).toBe(50);
    });

    it('should calculate 100% for fully completed', () => {
      expect(calculateCompletionRate(10, 10)).toBe(100);
    });

    it('should calculate 0% for no completions', () => {
      expect(calculateCompletionRate(0, 10)).toBe(0);
    });

    it('should handle empty program', () => {
      expect(calculateCompletionRate(0, 0)).toBe(0);
    });

    it('should round to nearest integer', () => {
      expect(calculateCompletionRate(1, 3)).toBe(33);
      expect(calculateCompletionRate(2, 3)).toBe(67);
    });
  });

  describe('Average workouts per week', () => {
    const calculateAvgWorkoutsPerWeek = (
      totalWorkouts: number,
      weeks: number,
      activeClientCount: number
    ): number => {
      if (activeClientCount === 0 || weeks === 0) return 0;
      return Math.round((totalWorkouts / weeks / activeClientCount) * 10) / 10;
    };

    it('should calculate average correctly', () => {
      // 16 workouts over 4 weeks with 2 clients = 2 per week per client
      expect(calculateAvgWorkoutsPerWeek(16, 4, 2)).toBe(2);
    });

    it('should handle single client', () => {
      // 8 workouts over 4 weeks with 1 client = 2 per week
      expect(calculateAvgWorkoutsPerWeek(8, 4, 1)).toBe(2);
    });

    it('should return 0 for no clients', () => {
      expect(calculateAvgWorkoutsPerWeek(10, 4, 0)).toBe(0);
    });

    it('should return decimal values', () => {
      // 10 workouts over 4 weeks with 2 clients = 1.25 per week per client
      expect(calculateAvgWorkoutsPerWeek(10, 4, 2)).toBe(1.3);
    });
  });

  describe('Weekly trend bucketing', () => {
    const getWeekBucket = (date: Date, now: Date): number => {
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
      return Math.floor(diffDays / 7);
    };

    it('should bucket today as week 0', () => {
      const now = new Date();
      const today = new Date(now);
      expect(getWeekBucket(today, now)).toBe(0);
    });

    it('should bucket 8 days ago as week 1', () => {
      const now = new Date();
      const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
      expect(getWeekBucket(eightDaysAgo, now)).toBe(1);
    });

    it('should bucket 15 days ago as week 2', () => {
      const now = new Date();
      const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
      expect(getWeekBucket(fifteenDaysAgo, now)).toBe(2);
    });

    it('should bucket 28 days ago as week 4', () => {
      const now = new Date();
      const twentyEightDaysAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
      expect(getWeekBucket(twentyEightDaysAgo, now)).toBe(4);
    });
  });
});

describe('Coach Engagement Metrics', () => {
  describe('Client activity classification', () => {
    type ActivityLevel = 'high' | 'medium' | 'low' | 'inactive';

    const classifyActivity = (workoutsPerWeek: number): ActivityLevel => {
      if (workoutsPerWeek >= 4) return 'high';
      if (workoutsPerWeek >= 2) return 'medium';
      if (workoutsPerWeek >= 1) return 'low';
      return 'inactive';
    };

    it('should classify 4+ workouts/week as high', () => {
      expect(classifyActivity(4)).toBe('high');
      expect(classifyActivity(5)).toBe('high');
    });

    it('should classify 2-3 workouts/week as medium', () => {
      expect(classifyActivity(2)).toBe('medium');
      expect(classifyActivity(3)).toBe('medium');
    });

    it('should classify 1 workout/week as low', () => {
      expect(classifyActivity(1)).toBe('low');
    });

    it('should classify 0 workouts/week as inactive', () => {
      expect(classifyActivity(0)).toBe('inactive');
    });
  });

  describe('Engagement rate calculation', () => {
    const calculateEngagementRate = (
      activeClients: number,
      totalClients: number
    ): number => {
      if (totalClients === 0) return 0;
      return Math.round((activeClients / totalClients) * 100);
    };

    it('should calculate 100% when all active', () => {
      expect(calculateEngagementRate(5, 5)).toBe(100);
    });

    it('should calculate 50% when half active', () => {
      expect(calculateEngagementRate(5, 10)).toBe(50);
    });

    it('should calculate 0% when none active', () => {
      expect(calculateEngagementRate(0, 10)).toBe(0);
    });

    it('should handle zero clients', () => {
      expect(calculateEngagementRate(0, 0)).toBe(0);
    });
  });
});

describe('Coach Onboarding', () => {
  describe('Onboarding status', () => {
    const shouldShowOnboarding = (
      isCoach: boolean,
      onboardedAt: Date | null
    ): boolean => {
      return isCoach && onboardedAt === null;
    };

    it('should show onboarding for new coach', () => {
      expect(shouldShowOnboarding(true, null)).toBe(true);
    });

    it('should not show onboarding for onboarded coach', () => {
      expect(shouldShowOnboarding(true, new Date())).toBe(false);
    });

    it('should not show onboarding for non-coach', () => {
      expect(shouldShowOnboarding(false, null)).toBe(false);
    });
  });

  describe('Onboarding steps', () => {
    const ONBOARDING_STEPS = ['welcome', 'clients', 'programs', 'branding'];

    it('should have 4 onboarding steps', () => {
      expect(ONBOARDING_STEPS.length).toBe(4);
    });

    it('should start with welcome', () => {
      expect(ONBOARDING_STEPS[0]).toBe('welcome');
    });

    it('should end with branding', () => {
      expect(ONBOARDING_STEPS[ONBOARDING_STEPS.length - 1]).toBe('branding');
    });
  });
});
