import { prisma } from '@/lib/prisma';

export const MAX_BUDDY_GROUP_SIZE = 5;

// Unambiguous charset: no 0/O, 1/I/L
const INVITE_CHARSET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const INVITE_CODE_LENGTH = 8;

/**
 * Generate a unique 8-char invite code.
 * Retries on collision (astronomically unlikely with 30^8 = ~656B combinations).
 */
export async function generateInviteCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    let code = '';
    for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
      code += INVITE_CHARSET[Math.floor(Math.random() * INVITE_CHARSET.length)];
    }

    const existing = await prisma.buddyGroup.findUnique({
      where: { inviteCode: code },
    });

    if (!existing) return code;
  }

  throw new Error('Failed to generate unique invite code after 5 attempts');
}

/**
 * Get all buddy user IDs for a given user, EXCLUDING the caller.
 * Returns [] if user is not in any group.
 */
export async function getBuddyUserIds(userId: string): Promise<string[]> {
  const membership = await prisma.buddyMembership.findFirst({
    where: { userId },
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

  if (!membership) return [];

  return membership.group.memberships
    .map((m) => m.userId)
    .filter((id) => id !== userId);
}

/**
 * Check if targetUserId is a buddy of userId.
 */
export async function isBuddy(
  userId: string,
  targetUserId: string
): Promise<boolean> {
  const buddyIds = await getBuddyUserIds(userId);
  return buddyIds.includes(targetUserId);
}

/**
 * Get the user's current buddy group with members, or null.
 */
export async function getUserBuddyGroup(userId: string) {
  const membership = await prisma.buddyMembership.findFirst({
    where: { userId },
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

  return membership?.group ?? null;
}
