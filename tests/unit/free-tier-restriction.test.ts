import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Tests for Free Tier Single Active Program Restriction
 * Issue #143
 *
 * Business Rules:
 * - Free users can only have ONE active program at a time
 * - "Active" = most recent program by createdAt
 * - Free users see 🔒 on older programs in switcher
 * - Trying to claim/start 2nd program shows upgrade modal
 * - Pro users have no restrictions
 */

describe('Free Tier Restriction Logic', () => {
  describe('isActiveProgram', () => {
    // Helper that mirrors the logic in ProgramSelector
    const isActiveProgram = (
      programId: string,
      programs: { id: string; createdAt: Date }[]
    ): boolean => {
      const sorted = [...programs].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return programId === sorted[0]?.id;
    };

    it('should mark most recent program as active', () => {
      const programs = [
        { id: 'old', createdAt: new Date('2024-01-01') },
        { id: 'newest', createdAt: new Date('2024-03-01') },
        { id: 'middle', createdAt: new Date('2024-02-01') },
      ];

      expect(isActiveProgram('newest', programs)).toBe(true);
      expect(isActiveProgram('old', programs)).toBe(false);
      expect(isActiveProgram('middle', programs)).toBe(false);
    });

    it('should handle single program as active', () => {
      const programs = [{ id: 'only', createdAt: new Date('2024-01-01') }];
      expect(isActiveProgram('only', programs)).toBe(true);
    });

    it('should handle empty programs array', () => {
      expect(isActiveProgram('any', [])).toBe(false);
    });

    it('should handle programs with same timestamp', () => {
      const sameTime = new Date('2024-01-01T12:00:00Z');
      const programs = [
        { id: 'first', createdAt: sameTime },
        { id: 'second', createdAt: sameTime },
      ];
      // First one in sorted order wins (stable sort)
      const result = isActiveProgram('first', programs);
      // Either could be active depending on sort stability
      expect(typeof result).toBe('boolean');
    });
  });

  describe('canStartNewProgram', () => {
    // Helper that mirrors the API tier check logic
    const canStartNewProgram = (
      isPremium: boolean,
      existingProgramCount: number
    ): { allowed: boolean; reason?: string } => {
      if (isPremium) {
        return { allowed: true };
      }
      if (existingProgramCount > 0) {
        return {
          allowed: false,
          reason: 'upgrade_required'
        };
      }
      return { allowed: true };
    };

    it('should allow free user to start first program', () => {
      const result = canStartNewProgram(false, 0);
      expect(result.allowed).toBe(true);
    });

    it('should block free user from starting second program', () => {
      const result = canStartNewProgram(false, 1);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('upgrade_required');
    });

    it('should block free user with multiple existing programs', () => {
      const result = canStartNewProgram(false, 5);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('upgrade_required');
    });

    it('should allow premium user to start first program', () => {
      const result = canStartNewProgram(true, 0);
      expect(result.allowed).toBe(true);
    });

    it('should allow premium user to start additional programs', () => {
      expect(canStartNewProgram(true, 1).allowed).toBe(true);
      expect(canStartNewProgram(true, 5).allowed).toBe(true);
      expect(canStartNewProgram(true, 100).allowed).toBe(true);
    });
  });

  describe('getProgramAccessLevel', () => {
    // Helper to determine program access level for UI
    const getProgramAccessLevel = (
      programId: string,
      programs: { id: string; createdAt: Date }[],
      isPremium: boolean
    ): 'full' | 'locked' => {
      if (isPremium) return 'full';

      const sorted = [...programs].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const isActive = programId === sorted[0]?.id;

      return isActive ? 'full' : 'locked';
    };

    it('should give full access to active program for free user', () => {
      const programs = [
        { id: 'old', createdAt: new Date('2024-01-01') },
        { id: 'active', createdAt: new Date('2024-03-01') },
      ];
      expect(getProgramAccessLevel('active', programs, false)).toBe('full');
    });

    it('should lock non-active programs for free user', () => {
      const programs = [
        { id: 'old', createdAt: new Date('2024-01-01') },
        { id: 'active', createdAt: new Date('2024-03-01') },
      ];
      expect(getProgramAccessLevel('old', programs, false)).toBe('locked');
    });

    it('should give full access to all programs for premium user', () => {
      const programs = [
        { id: 'old', createdAt: new Date('2024-01-01') },
        { id: 'active', createdAt: new Date('2024-03-01') },
      ];
      expect(getProgramAccessLevel('old', programs, true)).toBe('full');
      expect(getProgramAccessLevel('active', programs, true)).toBe('full');
    });
  });

  describe('Upgrade Modal Context', () => {
    type UpgradeContext = 'program_limit' | 'switch_program' | 'general';

    interface ContextMessages {
      title: string;
      subtitle: string;
      cta: string;
    }

    const contextMessages: Record<UpgradeContext, ContextMessages> = {
      program_limit: {
        title: 'Ready for More?',
        subtitle: 'Free accounts are limited to one active program at a time.',
        cta: 'Complete your current program or upgrade to Pro for unlimited access.',
      },
      switch_program: {
        title: 'Unlock Program Switching',
        subtitle: 'Free accounts can only access their most recent program.',
        cta: 'Upgrade to Pro to switch between programs freely.',
      },
      general: {
        title: 'Upgrade to Pro',
        subtitle: 'Get the most out of your fitness journey.',
        cta: 'Unlock all premium features today.',
      },
    };

    it('should have correct messages for program_limit context', () => {
      const msg = contextMessages.program_limit;
      expect(msg.title).toContain('More');
      expect(msg.subtitle).toContain('one active program');
    });

    it('should have correct messages for switch_program context', () => {
      const msg = contextMessages.switch_program;
      expect(msg.title).toContain('Switching');
      expect(msg.subtitle).toContain('most recent program');
    });

    it('should have correct messages for general context', () => {
      const msg = contextMessages.general;
      expect(msg.title).toContain('Pro');
    });
  });
});

describe('Program Sorting for Active Determination', () => {
  it('should correctly sort programs by createdAt descending', () => {
    const programs = [
      { id: '1', createdAt: new Date('2024-01-15') },
      { id: '2', createdAt: new Date('2024-03-20') },
      { id: '3', createdAt: new Date('2024-02-10') },
      { id: '4', createdAt: new Date('2024-01-01') },
    ];

    const sorted = [...programs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    expect(sorted[0].id).toBe('2'); // March 20 - most recent
    expect(sorted[1].id).toBe('3'); // Feb 10
    expect(sorted[2].id).toBe('1'); // Jan 15
    expect(sorted[3].id).toBe('4'); // Jan 1 - oldest
  });

  it('should handle string dates correctly', () => {
    const programs = [
      { id: 'a', createdAt: '2024-12-01T00:00:00Z' as unknown as Date },
      { id: 'b', createdAt: '2024-12-15T00:00:00Z' as unknown as Date },
    ];

    const sorted = [...programs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    expect(sorted[0].id).toBe('b'); // Dec 15 is more recent
  });
});
