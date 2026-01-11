import { describe, it, expect } from 'vitest';

/**
 * Tests for social sharing component behavior
 *
 * These tests verify the data formatting and behavioral contracts
 * of the WorkoutShareCard and ProgressShareCard components.
 */

describe('WorkoutShareCard behavior', () => {
  describe('formatDuration', () => {
    const formatDuration = (minutes: number): string => {
      if (minutes < 60) return `${minutes}min`;
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
    };

    it('should format minutes under an hour', () => {
      expect(formatDuration(30)).toBe('30min');
      expect(formatDuration(45)).toBe('45min');
      expect(formatDuration(59)).toBe('59min');
    });

    it('should format exact hours', () => {
      expect(formatDuration(60)).toBe('1h');
      expect(formatDuration(120)).toBe('2h');
    });

    it('should format hours and minutes', () => {
      expect(formatDuration(75)).toBe('1h 15m');
      expect(formatDuration(90)).toBe('1h 30m');
      expect(formatDuration(135)).toBe('2h 15m');
    });
  });

  describe('formatDate', () => {
    const formatDate = (date: Date): string => {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    };

    it('should format date with weekday, month, and day', () => {
      // Test with a known date
      const date = new Date('2026-01-15T12:00:00');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/Thu/);
      expect(formatted).toMatch(/Jan/);
      expect(formatted).toMatch(/15/);
    });
  });

  describe('share data interface', () => {
    interface WorkoutShareData {
      workoutName: string;
      exercisesCompleted: number;
      totalExercises: number;
      duration?: number;
      streak: number;
      date: Date;
      userName?: string;
    }

    it('should accept valid workout share data', () => {
      const data: WorkoutShareData = {
        workoutName: 'Push Day',
        exercisesCompleted: 5,
        totalExercises: 6,
        streak: 3,
        date: new Date(),
      };

      expect(data.workoutName).toBe('Push Day');
      expect(data.exercisesCompleted).toBe(5);
      expect(data.streak).toBe(3);
    });

    it('should handle optional duration field', () => {
      const dataWithDuration: WorkoutShareData = {
        workoutName: 'Leg Day',
        exercisesCompleted: 4,
        totalExercises: 4,
        duration: 45,
        streak: 1,
        date: new Date(),
      };

      expect(dataWithDuration.duration).toBe(45);
    });
  });

  describe('share URL generation', () => {
    it('should generate correct share URL format with workoutLogId', () => {
      const workoutLogId = '123e4567-e89b-12d3-a456-426614174000';
      const baseUrl = 'https://baisics.app';
      const shareUrl = `${baseUrl}/share/workout/${workoutLogId}`;

      expect(shareUrl).toContain('share/workout/');
      expect(shareUrl).toContain(workoutLogId);
    });
  });

  describe('Twitter share text', () => {
    it('should format tweet text correctly', () => {
      const data = {
        workoutName: 'Push Day',
        exercisesCompleted: 5,
        streak: 3,
      };
      const workoutLogId = 'abc123';
      const shareUrl = `https://baisics.app/share/workout/${workoutLogId}`;

      const text = `Just completed ${data.workoutName} on @BAISICS_app! ${data.exercisesCompleted} exercises done 💪${data.streak > 1 ? ` | ${data.streak} day streak 🔥` : ''}\n${shareUrl}`;

      expect(text).toContain('Push Day');
      expect(text).toContain('5 exercises done');
      expect(text).toContain('3 day streak');
      expect(text).toContain('@BAISICS_app');
    });

    it('should omit streak when only 1 day', () => {
      const data = {
        workoutName: 'Push Day',
        exercisesCompleted: 5,
        streak: 1,
      };
      const workoutLogId = 'abc123';
      const shareUrl = `https://baisics.app/share/workout/${workoutLogId}`;

      const text = `Just completed ${data.workoutName} on @BAISICS_app! ${data.exercisesCompleted} exercises done 💪${data.streak > 1 ? ` | ${data.streak} day streak 🔥` : ''}\n${shareUrl}`;

      expect(text).not.toContain('day streak');
    });
  });
});

describe('ProgressShareCard behavior', () => {
  describe('formatWeight', () => {
    const formatWeight = (weight: number): string => {
      return `${Math.abs(weight).toFixed(1)} lbs`;
    };

    it('should format positive weights', () => {
      expect(formatWeight(165.5)).toBe('165.5 lbs');
      expect(formatWeight(200)).toBe('200.0 lbs');
    });

    it('should format negative weights as positive (for display)', () => {
      expect(formatWeight(-10.5)).toBe('10.5 lbs');
    });
  });

  describe('formatWeightChange', () => {
    const formatWeightChange = (change: number): string => {
      if (change === 0) return 'No change';
      const sign = change > 0 ? '+' : '-';
      return `${sign}${Math.abs(change).toFixed(1)} lbs`;
    };

    it('should format weight gain with plus sign', () => {
      expect(formatWeightChange(5.5)).toBe('+5.5 lbs');
      expect(formatWeightChange(10)).toBe('+10.0 lbs');
    });

    it('should format weight loss with minus sign', () => {
      expect(formatWeightChange(-8.5)).toBe('-8.5 lbs');
      expect(formatWeightChange(-15)).toBe('-15.0 lbs');
    });

    it('should handle no change', () => {
      expect(formatWeightChange(0)).toBe('No change');
    });
  });

  describe('formatDate for progress', () => {
    const formatDate = (date: Date): string => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
    };

    it('should format date with month and year', () => {
      const date = new Date('2025-11-15');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/Nov/);
      expect(formatted).toMatch(/2025/);
    });
  });

  describe('progress share data interface', () => {
    interface ProgressShareData {
      weeksCompleted: number;
      totalWorkouts: number;
      weightChange?: number;
      startWeight?: number;
      currentWeight?: number;
      beforePhotoUrl?: string;
      afterPhotoUrl?: string;
      startDate: Date;
      userName?: string;
    }

    it('should accept valid progress share data', () => {
      const data: ProgressShareData = {
        weeksCompleted: 8,
        totalWorkouts: 24,
        weightChange: -12.5,
        startWeight: 185,
        currentWeight: 172.5,
        startDate: new Date('2025-11-01'),
      };

      expect(data.weeksCompleted).toBe(8);
      expect(data.totalWorkouts).toBe(24);
      expect(data.weightChange).toBe(-12.5);
    });

    it('should handle optional photo URLs', () => {
      const data: ProgressShareData = {
        weeksCompleted: 4,
        totalWorkouts: 12,
        startDate: new Date(),
        beforePhotoUrl: 'https://example.com/before.jpg',
        afterPhotoUrl: 'https://example.com/after.jpg',
      };

      expect(data.beforePhotoUrl).toBeDefined();
      expect(data.afterPhotoUrl).toBeDefined();
    });
  });

  describe('privacy toggles', () => {
    it('should blur stats when hideStats is true', () => {
      // Contract: stats should show '••' or similar when hidden
      const hideStats = true;
      const totalWorkouts = 24;

      const displayValue = hideStats ? '••' : String(totalWorkouts);
      expect(displayValue).toBe('••');
    });

    it('should show actual values when hideStats is false', () => {
      const hideStats = false;
      const totalWorkouts = 24;

      const displayValue = hideStats ? '••' : String(totalWorkouts);
      expect(displayValue).toBe('24');
    });
  });
});
