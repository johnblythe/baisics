import { describe, it, expect } from 'vitest';

/**
 * Tests for Client-Facing Coach Branding
 * Issue #210 - Coach UX: Client Dashboard Branding
 *
 * Business Rules:
 * - Clients see their coach's branding in their dashboard
 * - Coach branding includes: name (brandName or fallback to name), brandColor, brandLogo
 * - Only ACTIVE + ACCEPTED coach relationships show branding
 * - Default brandColor is #FF6B6B if not set
 */

interface CoachInfo {
  id: string;
  name: string;
  brandName: string | null;
  brandColor: string | null;
  brandLogo: string | null;
}

interface CoachRelation {
  status: 'ACTIVE' | 'INACTIVE';
  inviteStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  coach: CoachInfo;
}

interface ProcessedCoach {
  id: string;
  name: string;
  brandColor: string;
  brandLogo: string | null;
}

// Logic that mirrors the API response processing
function processCoachForClient(relations: CoachRelation[]): ProcessedCoach | null {
  // Filter for active + accepted relationships
  const activeRelation = relations.find(
    (r) => r.status === 'ACTIVE' && r.inviteStatus === 'ACCEPTED'
  );

  if (!activeRelation) {
    return null;
  }

  const { coach } = activeRelation;

  return {
    id: coach.id,
    name: coach.brandName || coach.name,
    brandColor: coach.brandColor || '#FF6B6B',
    brandLogo: coach.brandLogo,
  };
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter((n) => n.length > 0)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

describe('Client-Facing Coach Branding', () => {
  describe('Coach Relationship Filtering', () => {
    it('returns null when no coach relationships exist', () => {
      expect(processCoachForClient([])).toBeNull();
    });

    it('returns null when only PENDING relationships exist', () => {
      const relations: CoachRelation[] = [
        {
          status: 'ACTIVE',
          inviteStatus: 'PENDING',
          coach: {
            id: '1',
            name: 'John Coach',
            brandName: null,
            brandColor: null,
            brandLogo: null,
          },
        },
      ];
      expect(processCoachForClient(relations)).toBeNull();
    });

    it('returns null when only REJECTED relationships exist', () => {
      const relations: CoachRelation[] = [
        {
          status: 'ACTIVE',
          inviteStatus: 'REJECTED',
          coach: {
            id: '1',
            name: 'John Coach',
            brandName: null,
            brandColor: null,
            brandLogo: null,
          },
        },
      ];
      expect(processCoachForClient(relations)).toBeNull();
    });

    it('returns null when relationship is INACTIVE', () => {
      const relations: CoachRelation[] = [
        {
          status: 'INACTIVE',
          inviteStatus: 'ACCEPTED',
          coach: {
            id: '1',
            name: 'John Coach',
            brandName: null,
            brandColor: null,
            brandLogo: null,
          },
        },
      ];
      expect(processCoachForClient(relations)).toBeNull();
    });

    it('returns coach when ACTIVE and ACCEPTED', () => {
      const relations: CoachRelation[] = [
        {
          status: 'ACTIVE',
          inviteStatus: 'ACCEPTED',
          coach: {
            id: '1',
            name: 'John Coach',
            brandName: 'FitPro',
            brandColor: '#4F46E5',
            brandLogo: null,
          },
        },
      ];
      const result = processCoachForClient(relations);
      expect(result).not.toBeNull();
      expect(result?.id).toBe('1');
    });

    it('returns first ACTIVE+ACCEPTED when multiple coaches exist', () => {
      const relations: CoachRelation[] = [
        {
          status: 'INACTIVE',
          inviteStatus: 'ACCEPTED',
          coach: {
            id: '1',
            name: 'Old Coach',
            brandName: null,
            brandColor: null,
            brandLogo: null,
          },
        },
        {
          status: 'ACTIVE',
          inviteStatus: 'ACCEPTED',
          coach: {
            id: '2',
            name: 'Current Coach',
            brandName: 'ActiveFit',
            brandColor: '#059669',
            brandLogo: null,
          },
        },
      ];
      const result = processCoachForClient(relations);
      expect(result?.id).toBe('2');
      expect(result?.name).toBe('ActiveFit');
    });
  });

  describe('Coach Name Display', () => {
    it('uses brandName when set', () => {
      const relations: CoachRelation[] = [
        {
          status: 'ACTIVE',
          inviteStatus: 'ACCEPTED',
          coach: {
            id: '1',
            name: 'John Doe',
            brandName: 'Elite Training Co',
            brandColor: null,
            brandLogo: null,
          },
        },
      ];
      const result = processCoachForClient(relations);
      expect(result?.name).toBe('Elite Training Co');
    });

    it('falls back to name when brandName is null', () => {
      const relations: CoachRelation[] = [
        {
          status: 'ACTIVE',
          inviteStatus: 'ACCEPTED',
          coach: {
            id: '1',
            name: 'John Doe',
            brandName: null,
            brandColor: null,
            brandLogo: null,
          },
        },
      ];
      const result = processCoachForClient(relations);
      expect(result?.name).toBe('John Doe');
    });

    it('falls back to name when brandName is empty string', () => {
      const relations: CoachRelation[] = [
        {
          status: 'ACTIVE',
          inviteStatus: 'ACCEPTED',
          coach: {
            id: '1',
            name: 'John Doe',
            brandName: '',
            brandColor: null,
            brandLogo: null,
          },
        },
      ];
      const result = processCoachForClient(relations);
      // Empty string is falsy, so falls back to name
      expect(result?.name).toBe('John Doe');
    });
  });

  describe('Coach Brand Color', () => {
    it('uses brandColor when set', () => {
      const relations: CoachRelation[] = [
        {
          status: 'ACTIVE',
          inviteStatus: 'ACCEPTED',
          coach: {
            id: '1',
            name: 'John Doe',
            brandName: null,
            brandColor: '#4F46E5',
            brandLogo: null,
          },
        },
      ];
      const result = processCoachForClient(relations);
      expect(result?.brandColor).toBe('#4F46E5');
    });

    it('defaults to #FF6B6B when brandColor is null', () => {
      const relations: CoachRelation[] = [
        {
          status: 'ACTIVE',
          inviteStatus: 'ACCEPTED',
          coach: {
            id: '1',
            name: 'John Doe',
            brandName: null,
            brandColor: null,
            brandLogo: null,
          },
        },
      ];
      const result = processCoachForClient(relations);
      expect(result?.brandColor).toBe('#FF6B6B');
    });
  });

  describe('Coach Brand Logo', () => {
    it('includes brandLogo when set', () => {
      const relations: CoachRelation[] = [
        {
          status: 'ACTIVE',
          inviteStatus: 'ACCEPTED',
          coach: {
            id: '1',
            name: 'John Doe',
            brandName: null,
            brandColor: null,
            brandLogo: 'https://example.com/logo.png',
          },
        },
      ];
      const result = processCoachForClient(relations);
      expect(result?.brandLogo).toBe('https://example.com/logo.png');
    });

    it('returns null brandLogo when not set', () => {
      const relations: CoachRelation[] = [
        {
          status: 'ACTIVE',
          inviteStatus: 'ACCEPTED',
          coach: {
            id: '1',
            name: 'John Doe',
            brandName: null,
            brandColor: null,
            brandLogo: null,
          },
        },
      ];
      const result = processCoachForClient(relations);
      expect(result?.brandLogo).toBeNull();
    });
  });

  describe('Initials Generation', () => {
    it('returns first letter for single word', () => {
      expect(getInitials('Coach')).toBe('C');
    });

    it('returns first letter of first and last word for two words', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });

    it('returns first two initials for multiple words', () => {
      expect(getInitials('The Best Coach')).toBe('TB');
    });

    it('handles extra whitespace', () => {
      expect(getInitials('  John   Doe  ')).toBe('JD');
    });

    it('uppercases result', () => {
      expect(getInitials('john doe')).toBe('JD');
    });

    it('handles single character name', () => {
      expect(getInitials('A')).toBe('A');
    });
  });

  describe('Complete Coach Response Structure', () => {
    it('returns correctly structured coach object', () => {
      const relations: CoachRelation[] = [
        {
          status: 'ACTIVE',
          inviteStatus: 'ACCEPTED',
          coach: {
            id: 'coach-uuid-123',
            name: 'Jane Smith',
            brandName: 'PowerFit Training',
            brandColor: '#DC2626',
            brandLogo: 'https://cdn.example.com/logo.jpg',
          },
        },
      ];

      const result = processCoachForClient(relations);

      expect(result).toEqual({
        id: 'coach-uuid-123',
        name: 'PowerFit Training',
        brandColor: '#DC2626',
        brandLogo: 'https://cdn.example.com/logo.jpg',
      });
    });

    it('returns correctly structured coach object with defaults', () => {
      const relations: CoachRelation[] = [
        {
          status: 'ACTIVE',
          inviteStatus: 'ACCEPTED',
          coach: {
            id: 'coach-uuid-456',
            name: 'Bob Trainer',
            brandName: null,
            brandColor: null,
            brandLogo: null,
          },
        },
      ];

      const result = processCoachForClient(relations);

      expect(result).toEqual({
        id: 'coach-uuid-456',
        name: 'Bob Trainer',
        brandColor: '#FF6B6B',
        brandLogo: null,
      });
    });
  });
});
