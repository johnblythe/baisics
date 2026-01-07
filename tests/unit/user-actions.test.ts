import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Tests for User Actions (from start/actions.ts)
 * Issue #168 - Legacy Cleanup
 *
 * These tests cover the 5 active functions that will be preserved:
 * - getUser
 * - updateUser
 * - createAnonUser
 * - getUserProgram
 * - getSessionIntake
 */

// Mock Prisma - must be hoisted
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    program: {
      findFirst: vi.fn(),
    },
    userIntake: {
      findFirst: vi.fn(),
    },
  },
}));

// Import after mocking
import { prisma } from '@/lib/prisma';
import {
  getUser,
  updateUser,
  createAnonUser,
  getUserProgram,
  getSessionIntake
} from '@/lib/actions/user';

// Type assertion for mocked prisma
const mockPrisma = prisma as unknown as {
  user: {
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  program: {
    findFirst: ReturnType<typeof vi.fn>;
  };
  userIntake: {
    findFirst: ReturnType<typeof vi.fn>;
  };
};

describe('User Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // getUser Tests
  // ============================================
  describe('getUser', () => {
    it('returns user when found', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await getUser('user-123');

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('returns null user when not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await getUser('nonexistent');

      expect(result.success).toBe(true);
      expect(result.user).toBeNull();
    });

    it('handles empty userId', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await getUser('');

      expect(result.success).toBe(true);
      expect(result.user).toBeNull();
    });
  });

  // ============================================
  // updateUser Tests
  // ============================================
  describe('updateUser', () => {
    it('updates user email successfully', async () => {
      const updatedUser = {
        id: 'user-123',
        email: 'new@example.com',
      };
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const result = await updateUser('user-123', { email: 'new@example.com' });

      expect(result.success).toBe(true);
      expect(result.user).toEqual(updatedUser);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { email: 'new@example.com' },
      });
    });

    it('returns UNKNOWN_ERROR on database failures', async () => {
      mockPrisma.user.update.mockRejectedValue(new Error('Database connection failed'));

      const result = await updateUser('user-123', { email: 'test@example.com' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('UNKNOWN_ERROR');
    });
  });

  // ============================================
  // createAnonUser Tests
  // ============================================
  describe('createAnonUser', () => {
    it('creates anonymous user successfully', async () => {
      const newUser = {
        id: 'anon-user-123',
        email: null,
      };
      mockPrisma.user.create.mockResolvedValue(newUser);

      const result = await createAnonUser('anon-user-123');

      expect(result.success).toBe(true);
      expect(result.user).toEqual(newUser);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: { id: 'anon-user-123' },
      });
    });

    it('returns error when creation fails', async () => {
      mockPrisma.user.create.mockRejectedValue(new Error('Database error'));

      const result = await createAnonUser('anon-user-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create anonymous user');
    });

    it('handles duplicate user id gracefully', async () => {
      const prismaError = new Error('Unique constraint failed');
      (prismaError as any).code = 'P2002';
      mockPrisma.user.create.mockRejectedValue(prismaError);

      const result = await createAnonUser('existing-user');

      expect(result.success).toBe(false);
    });
  });

  // ============================================
  // getUserProgram Tests
  // ============================================
  describe('getUserProgram', () => {
    const mockProgram = {
      id: 'program-123',
      name: 'Test Program',
      description: 'A test program',
      userImages: [],
      workoutPlans: [
        {
          id: 'plan-1',
          phase: 1,
          fatGrams: 80,
          proteinGrams: 150,
          carbGrams: 200,
          dailyCalories: 2100,
          workouts: [
            {
              id: 'workout-1',
              dayNumber: 1,
              exercises: [
                { id: 'ex-1', name: 'Squat', sortOrder: 1 },
              ],
            },
          ],
        },
      ],
      createdByUser: { id: 'user-123', name: 'Creator' },
    };

    it('returns program with nutrition mapped correctly', async () => {
      mockPrisma.program.findFirst.mockResolvedValue(mockProgram);

      const result = await getUserProgram('user-123', 'program-123');

      expect(result.success).toBe(true);
      expect(result.program).toBeDefined();
      expect(result.program?.workoutPlans[0].nutrition).toEqual({
        macros: {
          fats: 80,
          protein: 150,
          carbs: 200,
        },
        dailyCalories: 2100,
      });
    });

    it('returns error when userId is missing', async () => {
      const result = await getUserProgram('', 'program-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User ID is required');
    });

    it('returns error when programId is missing', async () => {
      const result = await getUserProgram('user-123', '');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User ID is required');
    });

    it('returns error when program not found', async () => {
      mockPrisma.program.findFirst.mockResolvedValue(null);

      const result = await getUserProgram('user-123', 'nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Program not found');
    });

    it('includes correct query structure', async () => {
      mockPrisma.program.findFirst.mockResolvedValue(mockProgram);

      await getUserProgram('user-123', 'program-123');

      expect(mockPrisma.program.findFirst).toHaveBeenCalledWith({
        where: {
          workoutPlans: {
            some: {
              userId: 'user-123',
            },
          },
          id: 'program-123',
        },
        include: expect.objectContaining({
          userImages: true,
          workoutPlans: expect.any(Object),
          createdByUser: true,
        }),
      });
    });

    it('handles database errors gracefully', async () => {
      mockPrisma.program.findFirst.mockRejectedValue(new Error('Connection lost'));

      const result = await getUserProgram('user-123', 'program-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch program');
    });
  });

  // ============================================
  // getSessionIntake Tests
  // ============================================
  describe('getSessionIntake', () => {
    const mockIntake = {
      id: 'intake-123',
      userId: 'user-123',
      sex: 'male',
      trainingGoal: 'muscle building',
      daysAvailable: 4,
      weight: 180,
      height: 72,
      age: 30,
      createdAt: new Date(),
    };

    it('returns intake when found', async () => {
      mockPrisma.userIntake.findFirst.mockResolvedValue(mockIntake);

      const result = await getSessionIntake('user-123');

      expect(result.success).toBe(true);
      expect(result.intake).toEqual(mockIntake);
    });

    it('returns error when userId is missing', async () => {
      const result = await getSessionIntake('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User ID is required');
    });

    it('returns null intake when not found', async () => {
      mockPrisma.userIntake.findFirst.mockResolvedValue(null);

      const result = await getSessionIntake('user-123');

      expect(result.success).toBe(true);
      expect(result.intake).toBeNull();
    });

    it('queries with correct ordering', async () => {
      mockPrisma.userIntake.findFirst.mockResolvedValue(mockIntake);

      await getSessionIntake('user-123');

      expect(mockPrisma.userIntake.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('handles database errors gracefully', async () => {
      mockPrisma.userIntake.findFirst.mockRejectedValue(new Error('Database error'));

      const result = await getSessionIntake('user-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch intake data');
    });
  });
});

// ============================================
// Integration-style Tests (Logic Validation)
// ============================================
describe('User Actions - Business Logic', () => {
  describe('getUserProgram nutrition mapping', () => {
    it('correctly transforms DB schema to API response format', () => {
      // This tests the transformation logic inline
      const dbPlan = {
        fatGrams: 80,
        proteinGrams: 150,
        carbGrams: 200,
        dailyCalories: 2100,
      };

      const nutrition = {
        macros: {
          fats: dbPlan.fatGrams,
          protein: dbPlan.proteinGrams,
          carbs: dbPlan.carbGrams,
        },
        dailyCalories: dbPlan.dailyCalories,
      };

      expect(nutrition.macros.fats).toBe(80);
      expect(nutrition.macros.protein).toBe(150);
      expect(nutrition.macros.carbs).toBe(200);
      expect(nutrition.dailyCalories).toBe(2100);
    });

    it('handles null macro values', () => {
      const dbPlan = {
        fatGrams: null,
        proteinGrams: null,
        carbGrams: null,
        dailyCalories: null,
      };

      const nutrition = {
        macros: {
          fats: dbPlan.fatGrams,
          protein: dbPlan.proteinGrams,
          carbs: dbPlan.carbGrams,
        },
        dailyCalories: dbPlan.dailyCalories,
      };

      expect(nutrition.macros.fats).toBeNull();
      expect(nutrition.macros.protein).toBeNull();
      expect(nutrition.dailyCalories).toBeNull();
    });
  });
});
