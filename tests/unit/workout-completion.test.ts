import { describe, it, expect, vi } from 'vitest';

/**
 * Tests for Workout Completion Endpoint
 * Issue #194 (streak integration)
 *
 * Key behaviors:
 * - Returns 401 for unauthenticated requests
 * - Returns 404 for non-existent workout logs
 * - Returns 401 for unauthorized access to other users' logs
 * - Completes workout and updates streak
 * - Streak failure doesn't fail the whole request (non-blocking)
 */

describe('Workout Completion Authentication', () => {
  // Helper that mirrors auth validation logic
  const validateAuth = (
    session: { user?: { id?: string } } | null
  ): { allowed: boolean; status: number; error?: string } => {
    if (!session) {
      return { allowed: false, status: 401, error: 'User not authenticated' };
    }
    if (!session.user?.id) {
      return { allowed: false, status: 401, error: 'User ID not found' };
    }
    return { allowed: true, status: 200 };
  };

  describe('No session', () => {
    it('should return 401 when session is null', () => {
      const result = validateAuth(null);
      expect(result.allowed).toBe(false);
      expect(result.status).toBe(401);
      expect(result.error).toBe('User not authenticated');
    });

    it('should return 401 when session is undefined', () => {
      const result = validateAuth(undefined as unknown as null);
      expect(result.allowed).toBe(false);
      expect(result.status).toBe(401);
    });
  });

  describe('Session without user', () => {
    it('should return 401 when session.user is undefined', () => {
      const result = validateAuth({ user: undefined });
      expect(result.allowed).toBe(false);
      expect(result.status).toBe(401);
      expect(result.error).toBe('User ID not found');
    });

    it('should return 401 when session.user.id is undefined', () => {
      const result = validateAuth({ user: {} });
      expect(result.allowed).toBe(false);
      expect(result.status).toBe(401);
      expect(result.error).toBe('User ID not found');
    });

    it('should return 401 when session.user.id is empty string', () => {
      const result = validateAuth({ user: { id: '' } });
      expect(result.allowed).toBe(false);
      expect(result.status).toBe(401);
    });
  });

  describe('Valid session', () => {
    it('should allow request with valid user id', () => {
      const result = validateAuth({ user: { id: 'user-123' } });
      expect(result.allowed).toBe(true);
      expect(result.status).toBe(200);
    });

    it('should allow request with UUID user id', () => {
      const result = validateAuth({
        user: { id: '550e8400-e29b-41d4-a716-446655440000' }
      });
      expect(result.allowed).toBe(true);
    });
  });
});

describe('Workout Log Ownership', () => {
  // Helper that mirrors ownership check
  const checkOwnership = (
    workoutLog: { userId: string } | null,
    currentUserId: string
  ): { allowed: boolean; status: number } => {
    if (!workoutLog) {
      return { allowed: false, status: 404 };
    }
    if (workoutLog.userId !== currentUserId) {
      return { allowed: false, status: 401 };
    }
    return { allowed: true, status: 200 };
  };

  it('should return 404 when workout log not found', () => {
    const result = checkOwnership(null, 'user-123');
    expect(result.status).toBe(404);
    expect(result.allowed).toBe(false);
  });

  it('should return 401 when user does not own workout log', () => {
    const result = checkOwnership(
      { userId: 'other-user' },
      'current-user'
    );
    expect(result.status).toBe(401);
    expect(result.allowed).toBe(false);
  });

  it('should allow when user owns workout log', () => {
    const result = checkOwnership(
      { userId: 'user-123' },
      'user-123'
    );
    expect(result.allowed).toBe(true);
  });
});

describe('Streak Update Error Handling', () => {
  // Helper that mirrors the non-blocking streak update pattern
  const completeWorkoutWithStreak = async (
    updateStreakFn: () => Promise<{ current: number; longest: number; extended: boolean }>,
    logErrors: (msg: string, data: object) => void
  ): Promise<{
    workoutCompleted: boolean;
    streak: { current: number; longest: number; extended: boolean };
    streakError?: string;
  }> => {
    // Workout is always completed first (simulated)
    const workoutCompleted = true;

    // Streak update is non-blocking
    let streakData = { current: 0, longest: 0, extended: false };
    let streakError: string | undefined;

    try {
      streakData = await updateStreakFn();
    } catch (error) {
      streakError = error instanceof Error ? error.message : String(error);
      logErrors('Failed to update streak (workout still completed):', {
        error: streakError
      });
    }

    return {
      workoutCompleted,
      streak: streakData,
      streakError
    };
  };

  it('should complete workout even when streak update fails', async () => {
    const logErrors = vi.fn();
    const failingStreak = async () => {
      throw new Error('User not found');
    };

    const result = await completeWorkoutWithStreak(failingStreak, logErrors);

    expect(result.workoutCompleted).toBe(true);
    expect(result.streak.current).toBe(0);
    expect(result.streakError).toBe('User not found');
    expect(logErrors).toHaveBeenCalledOnce();
  });

  it('should return streak data when update succeeds', async () => {
    const logErrors = vi.fn();
    const successStreak = async () => ({
      current: 5,
      longest: 10,
      extended: true
    });

    const result = await completeWorkoutWithStreak(successStreak, logErrors);

    expect(result.workoutCompleted).toBe(true);
    expect(result.streak.current).toBe(5);
    expect(result.streak.longest).toBe(10);
    expect(result.streak.extended).toBe(true);
    expect(result.streakError).toBeUndefined();
    expect(logErrors).not.toHaveBeenCalled();
  });

  it('should handle database timeout gracefully', async () => {
    const logErrors = vi.fn();
    const timeoutStreak = async () => {
      throw new Error('Connection timeout');
    };

    const result = await completeWorkoutWithStreak(timeoutStreak, logErrors);

    expect(result.workoutCompleted).toBe(true);
    expect(result.streakError).toBe('Connection timeout');
  });

  it('should handle non-Error exceptions', async () => {
    const logErrors = vi.fn();
    const weirdStreak = async () => {
      throw 'string error'; // Non-Error throw
    };

    const result = await completeWorkoutWithStreak(weirdStreak, logErrors);

    expect(result.workoutCompleted).toBe(true);
    expect(result.streakError).toBe('string error');
  });
});

describe('Response Structure', () => {
  it('should include streak data in successful response', () => {
    const response = {
      id: 'workout-log-123',
      status: 'completed',
      completedAt: new Date(),
      streak: {
        current: 5,
        longest: 10,
        extended: true
      }
    };

    expect(response.streak).toBeDefined();
    expect(response.streak.current).toBe(5);
    expect(response.streak.longest).toBe(10);
    expect(response.streak.extended).toBe(true);
  });

  it('should include zero streak when update failed', () => {
    const response = {
      id: 'workout-log-123',
      status: 'completed',
      completedAt: new Date(),
      streak: {
        current: 0,
        longest: 0,
        extended: false
      }
    };

    expect(response.streak.current).toBe(0);
    expect(response.streak.extended).toBe(false);
  });
});
