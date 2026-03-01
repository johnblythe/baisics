import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma - must be hoisted
vi.mock('@/lib/prisma', () => ({
  prisma: {
    buddyGroup: {
      findUnique: vi.fn(),
    },
    buddyMembership: {
      findFirst: vi.fn(),
    },
  },
}));

// Import after mocking
import { prisma } from '@/lib/prisma';
import {
  MAX_BUDDY_GROUP_SIZE,
  generateInviteCode,
  getBuddyUserIds,
  isBuddy,
  getUserBuddyGroup,
} from '@/lib/buddy';

// Type assertion for mocked prisma
const mockPrisma = prisma as unknown as {
  buddyGroup: {
    findUnique: ReturnType<typeof vi.fn>;
  };
  buddyMembership: {
    findFirst: ReturnType<typeof vi.fn>;
  };
};

describe('Buddy Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // MAX_BUDDY_GROUP_SIZE
  // ============================================
  describe('MAX_BUDDY_GROUP_SIZE', () => {
    it('equals 5', () => {
      expect(MAX_BUDDY_GROUP_SIZE).toBe(5);
    });
  });

  // ============================================
  // generateInviteCode
  // ============================================
  describe('generateInviteCode', () => {
    it('generates an 8-character code', async () => {
      mockPrisma.buddyGroup.findUnique.mockResolvedValue(null);

      const code = await generateInviteCode();

      expect(code).toHaveLength(8);
    });

    it('only uses valid charset (no 0/O/1/I/L)', async () => {
      mockPrisma.buddyGroup.findUnique.mockResolvedValue(null);

      const code = await generateInviteCode();
      const validChars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

      for (const char of code) {
        expect(validChars).toContain(char);
      }
      // Explicitly verify excluded characters
      expect(code).not.toMatch(/[01OIL]/);
    });

    it('retries on collision and returns unique code on second attempt', async () => {
      mockPrisma.buddyGroup.findUnique
        .mockResolvedValueOnce({ id: 'existing-group' }) // first call: collision
        .mockResolvedValueOnce(null); // second call: no collision

      const code = await generateInviteCode();

      expect(code).toHaveLength(8);
      expect(mockPrisma.buddyGroup.findUnique).toHaveBeenCalledTimes(2);
    });

    it('throws after 5 consecutive collisions', async () => {
      mockPrisma.buddyGroup.findUnique.mockResolvedValue({ id: 'existing-group' });

      await expect(generateInviteCode()).rejects.toThrow(
        'Failed to generate unique invite code after 5 attempts'
      );
      expect(mockPrisma.buddyGroup.findUnique).toHaveBeenCalledTimes(5);
    });

    it('checks uniqueness via buddyGroup.findUnique with inviteCode', async () => {
      mockPrisma.buddyGroup.findUnique.mockResolvedValue(null);

      await generateInviteCode();

      expect(mockPrisma.buddyGroup.findUnique).toHaveBeenCalledWith({
        where: { inviteCode: expect.any(String) },
      });
    });
  });

  // ============================================
  // getBuddyUserIds
  // ============================================
  describe('getBuddyUserIds', () => {
    it('returns empty array when user has no membership', async () => {
      mockPrisma.buddyMembership.findFirst.mockResolvedValue(null);

      const result = await getBuddyUserIds('user-1');

      expect(result).toEqual([]);
    });

    it('returns buddy IDs excluding the caller', async () => {
      mockPrisma.buddyMembership.findFirst.mockResolvedValue({
        group: {
          memberships: [
            { userId: 'user-1' },
            { userId: 'user-2' },
            { userId: 'user-3' },
          ],
        },
      });

      const result = await getBuddyUserIds('user-1');

      expect(result).toEqual(['user-2', 'user-3']);
      expect(result).not.toContain('user-1');
    });

    it('handles a single buddy', async () => {
      mockPrisma.buddyMembership.findFirst.mockResolvedValue({
        group: {
          memberships: [
            { userId: 'user-1' },
            { userId: 'user-2' },
          ],
        },
      });

      const result = await getBuddyUserIds('user-1');

      expect(result).toEqual(['user-2']);
    });

    it('handles multiple buddies (4 members)', async () => {
      mockPrisma.buddyMembership.findFirst.mockResolvedValue({
        group: {
          memberships: [
            { userId: 'user-1' },
            { userId: 'user-2' },
            { userId: 'user-3' },
            { userId: 'user-4' },
          ],
        },
      });

      const result = await getBuddyUserIds('user-1');

      expect(result).toEqual(['user-2', 'user-3', 'user-4']);
      expect(result).toHaveLength(3);
    });

    it('queries with correct structure', async () => {
      mockPrisma.buddyMembership.findFirst.mockResolvedValue(null);

      await getBuddyUserIds('user-1');

      expect(mockPrisma.buddyMembership.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        select: {
          group: {
            select: {
              memberships: {
                select: { userId: true },
              },
            },
          },
        },
      });
    });
  });

  // ============================================
  // isBuddy
  // ============================================
  describe('isBuddy', () => {
    it('returns true when target is in buddy group', async () => {
      mockPrisma.buddyMembership.findFirst.mockResolvedValue({
        group: {
          memberships: [
            { userId: 'user-1' },
            { userId: 'user-2' },
            { userId: 'user-3' },
          ],
        },
      });

      const result = await isBuddy('user-1', 'user-2');

      expect(result).toBe(true);
    });

    it('returns false when target is not a buddy', async () => {
      mockPrisma.buddyMembership.findFirst.mockResolvedValue({
        group: {
          memberships: [
            { userId: 'user-1' },
            { userId: 'user-2' },
          ],
        },
      });

      const result = await isBuddy('user-1', 'user-99');

      expect(result).toBe(false);
    });

    it('returns false when user has no group', async () => {
      mockPrisma.buddyMembership.findFirst.mockResolvedValue(null);

      const result = await isBuddy('user-1', 'user-2');

      expect(result).toBe(false);
    });
  });

  // ============================================
  // getUserBuddyGroup
  // ============================================
  describe('getUserBuddyGroup', () => {
    it('returns null when user has no membership', async () => {
      mockPrisma.buddyMembership.findFirst.mockResolvedValue(null);

      const result = await getUserBuddyGroup('user-1');

      expect(result).toBeNull();
    });

    it('returns group with members when user is in a group', async () => {
      const mockGroup = {
        id: 'group-1',
        inviteCode: 'ABC12345',
        createdAt: new Date('2026-01-15'),
        memberships: [
          {
            id: 'mem-1',
            joinedAt: new Date('2026-01-15'),
            user: { id: 'user-1', name: 'Alice', image: null, email: 'alice@test.com' },
          },
          {
            id: 'mem-2',
            joinedAt: new Date('2026-01-16'),
            user: { id: 'user-2', name: 'Bob', image: 'bob.jpg', email: 'bob@test.com' },
          },
        ],
      };

      mockPrisma.buddyMembership.findFirst.mockResolvedValue({
        group: mockGroup,
      });

      const result = await getUserBuddyGroup('user-1');

      expect(result).toEqual(mockGroup);
      expect(result?.id).toBe('group-1');
      expect(result?.inviteCode).toBe('ABC12345');
      expect(result?.memberships).toHaveLength(2);
      expect(result?.memberships[0].user.name).toBe('Alice');
      expect(result?.memberships[1].user.name).toBe('Bob');
    });

    it('queries with correct structure including orderBy', async () => {
      mockPrisma.buddyMembership.findFirst.mockResolvedValue(null);

      await getUserBuddyGroup('user-1');

      expect(mockPrisma.buddyMembership.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        select: {
          group: {
            select: {
              id: true,
              inviteCode: true,
              createdAt: true,
              memberships: {
                select: {
                  id: true,
                  joinedAt: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      image: true,
                      email: true,
                    },
                  },
                },
                orderBy: { joinedAt: 'asc' },
              },
            },
          },
        },
      });
    });
  });
});
