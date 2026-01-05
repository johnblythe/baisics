import { describe, it, expect } from 'vitest';

/**
 * Tests for Coach Settings Logic
 * Issue #210 - Coach UX: Settings, Client Branding & Dashboard Polish
 *
 * Business Rules:
 * - Coaches can set brandName, brandColor, brandLogo, inviteSlug
 * - inviteSlug: 3-30 chars, alphanumeric + hyphens, lowercase
 * - brandColor: hex format #RRGGBB
 * - Custom invite URL: /join/{inviteSlug}
 */

// Slug validation logic (mirrors API)
function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function validateSlug(slug: string): { valid: boolean; error?: string } {
  const normalized = normalizeSlug(slug);

  if (normalized.length < 3) {
    return { valid: false, error: 'Invite slug must be at least 3 characters' };
  }

  if (normalized.length > 30) {
    return { valid: false, error: 'Invite slug must be 30 characters or less' };
  }

  return { valid: true };
}

function validateHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

function buildInviteUrl(baseUrl: string, inviteSlug: string | null, tokenFallback: string | null): string | null {
  if (inviteSlug) {
    return `${baseUrl}/join/${inviteSlug}`;
  }
  if (tokenFallback) {
    return `${baseUrl}/coach/invite/${tokenFallback}`;
  }
  return null;
}

describe('Coach Settings', () => {
  describe('Slug Normalization', () => {
    it('converts to lowercase', () => {
      expect(normalizeSlug('JohnDoe')).toBe('johndoe');
    });

    it('replaces spaces with hyphens', () => {
      expect(normalizeSlug('john doe')).toBe('john-doe');
    });

    it('replaces special chars with hyphens', () => {
      expect(normalizeSlug('john@doe!')).toBe('john-doe');
    });

    it('collapses multiple hyphens', () => {
      expect(normalizeSlug('john---doe')).toBe('john-doe');
    });

    it('trims leading/trailing hyphens', () => {
      expect(normalizeSlug('-john-doe-')).toBe('john-doe');
      expect(normalizeSlug('---coach---')).toBe('coach');
    });

    it('handles all special chars becoming hyphens', () => {
      expect(normalizeSlug('!!!abc!!!')).toBe('abc');
    });

    it('preserves numbers', () => {
      expect(normalizeSlug('coach123')).toBe('coach123');
    });
  });

  describe('Slug Validation', () => {
    it('rejects slugs shorter than 3 chars', () => {
      expect(validateSlug('ab')).toEqual({
        valid: false,
        error: 'Invite slug must be at least 3 characters',
      });
    });

    it('accepts slugs with 3 chars', () => {
      expect(validateSlug('abc')).toEqual({ valid: true });
    });

    it('accepts slugs with 30 chars', () => {
      const slug = 'a'.repeat(30);
      expect(validateSlug(slug)).toEqual({ valid: true });
    });

    it('rejects slugs longer than 30 chars', () => {
      const slug = 'a'.repeat(31);
      expect(validateSlug(slug)).toEqual({
        valid: false,
        error: 'Invite slug must be 30 characters or less',
      });
    });

    it('validates after normalization', () => {
      // "a b" normalizes to "a-b" which is 3 chars
      expect(validateSlug('a b')).toEqual({ valid: true });
    });

    it('rejects when normalized result is too short', () => {
      // "!!!" normalizes to "" which is too short
      expect(validateSlug('!!!')).toEqual({
        valid: false,
        error: 'Invite slug must be at least 3 characters',
      });
    });
  });

  describe('Hex Color Validation', () => {
    it('accepts valid 6-digit hex colors', () => {
      expect(validateHexColor('#FF6B6B')).toBe(true);
      expect(validateHexColor('#000000')).toBe(true);
      expect(validateHexColor('#ffffff')).toBe(true);
      expect(validateHexColor('#AbCdEf')).toBe(true);
    });

    it('rejects 3-digit hex colors', () => {
      expect(validateHexColor('#FFF')).toBe(false);
    });

    it('rejects colors without hash', () => {
      expect(validateHexColor('FF6B6B')).toBe(false);
    });

    it('rejects invalid characters', () => {
      expect(validateHexColor('#GGGGGG')).toBe(false);
      expect(validateHexColor('#FF6B6!')).toBe(false);
    });

    it('rejects wrong length', () => {
      expect(validateHexColor('#FF6B6')).toBe(false);
      expect(validateHexColor('#FF6B6BB')).toBe(false);
    });
  });

  describe('Invite URL Building', () => {
    const baseUrl = 'https://baisics.app';

    it('uses custom slug when available', () => {
      expect(buildInviteUrl(baseUrl, 'johndoe', 'some-token')).toBe(
        'https://baisics.app/join/johndoe'
      );
    });

    it('falls back to token when no slug', () => {
      expect(buildInviteUrl(baseUrl, null, 'abc-123-def')).toBe(
        'https://baisics.app/coach/invite/abc-123-def'
      );
    });

    it('returns null when neither available', () => {
      expect(buildInviteUrl(baseUrl, null, null)).toBeNull();
    });

    it('prefers slug over token', () => {
      expect(buildInviteUrl(baseUrl, 'custom', 'fallback-token')).toBe(
        'https://baisics.app/join/custom'
      );
    });
  });

  describe('Settings Data Structure', () => {
    interface CoachSettings {
      name: string | null;
      brandName: string | null;
      brandColor: string;
      brandLogo: string | null;
      inviteSlug: string | null;
      inviteUrl: string | null;
    }

    function getDefaultSettings(): CoachSettings {
      return {
        name: null,
        brandName: null,
        brandColor: '#FF6B6B', // Default coral
        brandLogo: null,
        inviteSlug: null,
        inviteUrl: null,
      };
    }

    it('has correct default values', () => {
      const settings = getDefaultSettings();
      expect(settings.brandColor).toBe('#FF6B6B');
      expect(settings.brandName).toBeNull();
      expect(settings.brandLogo).toBeNull();
      expect(settings.inviteSlug).toBeNull();
    });

    it('uses brandName for display when set', () => {
      const settings: CoachSettings = {
        name: 'John Doe',
        brandName: 'FitCoach Pro',
        brandColor: '#FF6B6B',
        brandLogo: null,
        inviteSlug: null,
        inviteUrl: null,
      };

      const displayName = settings.brandName || settings.name || 'Coach';
      expect(displayName).toBe('FitCoach Pro');
    });

    it('falls back to name when no brandName', () => {
      const settings: CoachSettings = {
        name: 'John Doe',
        brandName: null,
        brandColor: '#FF6B6B',
        brandLogo: null,
        inviteSlug: null,
        inviteUrl: null,
      };

      const displayName = settings.brandName || settings.name || 'Coach';
      expect(displayName).toBe('John Doe');
    });

    it('falls back to "Coach" when neither set', () => {
      const settings: CoachSettings = {
        name: null,
        brandName: null,
        brandColor: '#FF6B6B',
        brandLogo: null,
        inviteSlug: null,
        inviteUrl: null,
      };

      const displayName = settings.brandName || settings.name || 'Coach';
      expect(displayName).toBe('Coach');
    });
  });

  describe('Initials Generation', () => {
    function getInitials(name: string | null): string {
      if (!name) return 'C';
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }

    it('returns "C" for null name', () => {
      expect(getInitials(null)).toBe('C');
    });

    it('returns first two chars for single word', () => {
      expect(getInitials('John')).toBe('JO');
    });

    it('returns first and last initials for two words', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });

    it('returns first and last initials for multiple words', () => {
      expect(getInitials('John Middle Doe')).toBe('JD');
    });

    it('handles extra whitespace', () => {
      expect(getInitials('  John   Doe  ')).toBe('JD');
    });

    it('uppercases result', () => {
      expect(getInitials('john doe')).toBe('JD');
    });
  });

  describe('Slug Uniqueness Validation', () => {
    interface ExistingSlug {
      id: string;
      inviteSlug: string;
    }

    /**
     * Simulates the API's slug uniqueness check logic:
     * - Normalizes the incoming slug
     * - Checks against existing slugs (excluding current user)
     * - Returns error if duplicate found
     */
    function checkSlugUniqueness(
      incomingSlug: string,
      currentUserId: string,
      existingSlugs: ExistingSlug[]
    ): { valid: boolean; error?: string; normalizedSlug: string } {
      // Normalize the slug (same logic as API)
      const normalizedSlug = incomingSlug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      // Check if any OTHER user has this slug
      const duplicate = existingSlugs.find(
        (s) => s.inviteSlug === normalizedSlug && s.id !== currentUserId
      );

      if (duplicate) {
        return {
          valid: false,
          error: 'This invite slug is already taken',
          normalizedSlug,
        };
      }

      return { valid: true, normalizedSlug };
    }

    it('allows slug when no existing slugs', () => {
      const result = checkSlugUniqueness('johndoe', 'user-1', []);
      expect(result.valid).toBe(true);
      expect(result.normalizedSlug).toBe('johndoe');
    });

    it('allows slug when not taken by anyone', () => {
      const existingSlugs = [
        { id: 'user-2', inviteSlug: 'janedoe' },
        { id: 'user-3', inviteSlug: 'bobsmith' },
      ];
      const result = checkSlugUniqueness('johndoe', 'user-1', existingSlugs);
      expect(result.valid).toBe(true);
    });

    it('rejects slug when taken by another user', () => {
      const existingSlugs = [
        { id: 'user-2', inviteSlug: 'johndoe' },
      ];
      const result = checkSlugUniqueness('johndoe', 'user-1', existingSlugs);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('This invite slug is already taken');
    });

    it('allows user to keep their own existing slug', () => {
      const existingSlugs = [
        { id: 'user-1', inviteSlug: 'johndoe' }, // Same user
      ];
      const result = checkSlugUniqueness('johndoe', 'user-1', existingSlugs);
      expect(result.valid).toBe(true);
    });

    it('normalizes before checking uniqueness', () => {
      const existingSlugs = [
        { id: 'user-2', inviteSlug: 'johndoe' },
      ];
      // Input "JohnDoe" normalizes to "johndoe" which is taken
      const result = checkSlugUniqueness('JohnDoe', 'user-1', existingSlugs);
      expect(result.valid).toBe(false);
      expect(result.normalizedSlug).toBe('johndoe');
    });

    it('normalizes special chars before checking uniqueness', () => {
      const existingSlugs = [
        { id: 'user-2', inviteSlug: 'john-doe' },
      ];
      // Input "john doe" normalizes to "john-doe" which is taken
      const result = checkSlugUniqueness('john doe', 'user-1', existingSlugs);
      expect(result.valid).toBe(false);
      expect(result.normalizedSlug).toBe('john-doe');
    });

    it('handles case where user is updating to a different slug', () => {
      const existingSlugs = [
        { id: 'user-1', inviteSlug: 'oldslug' },
        { id: 'user-2', inviteSlug: 'newslug' },
      ];
      // user-1 trying to change to 'newslug' which user-2 has
      const result = checkSlugUniqueness('newslug', 'user-1', existingSlugs);
      expect(result.valid).toBe(false);
    });

    it('allows user to update to available slug', () => {
      const existingSlugs = [
        { id: 'user-1', inviteSlug: 'oldslug' },
        { id: 'user-2', inviteSlug: 'takenslug' },
      ];
      // user-1 changing to 'newslug' which is available
      const result = checkSlugUniqueness('newslug', 'user-1', existingSlugs);
      expect(result.valid).toBe(true);
    });
  });

  describe('Lookup Slug API Logic', () => {
    /**
     * Tests for /api/coach/lookup-slug
     * This API resolves a custom slug to coach info + invite token
     */

    interface CoachRecord {
      id: string;
      name: string;
      brandName: string | null;
      brandColor: string | null;
      brandLogo: string | null;
      inviteSlug: string | null;
      isCoach: boolean;
    }

    interface PublicInvite {
      coachId: string;
      inviteToken: string;
      inviteEmail: string | null;
      clientId: string | null;
    }

    // Simulates finding coach by slug (mirrors API logic)
    function findCoachBySlug(
      slug: string,
      users: CoachRecord[]
    ): CoachRecord | null {
      return (
        users.find(
          (u) =>
            u.inviteSlug === slug.toLowerCase() && u.isCoach === true
        ) || null
      );
    }

    // Simulates getting or creating public invite
    function getOrCreatePublicInvite(
      coachId: string,
      existingInvites: PublicInvite[]
    ): PublicInvite {
      const existing = existingInvites.find(
        (inv) =>
          inv.coachId === coachId &&
          inv.inviteEmail === null &&
          inv.clientId === null
      );

      if (existing) {
        return existing;
      }

      return {
        coachId,
        inviteToken: 'new-generated-token',
        inviteEmail: null,
        clientId: null,
      };
    }

    // Simulates building coach response
    function buildCoachResponse(coach: CoachRecord): {
      name: string;
      brandColor: string;
      brandLogo: string | null;
    } {
      return {
        name: coach.brandName || coach.name,
        brandColor: coach.brandColor || '#FF6B6B',
        brandLogo: coach.brandLogo,
      };
    }

    describe('Slug Resolution', () => {
      const users: CoachRecord[] = [
        {
          id: 'coach-1',
          name: 'John Coach',
          brandName: 'FitPro',
          brandColor: '#4F46E5',
          brandLogo: null,
          inviteSlug: 'fitpro',
          isCoach: true,
        },
        {
          id: 'user-2',
          name: 'Jane Client',
          brandName: null,
          brandColor: null,
          brandLogo: null,
          inviteSlug: 'janeclient',
          isCoach: false,
        },
        {
          id: 'coach-3',
          name: 'Bob Trainer',
          brandName: null,
          brandColor: null,
          brandLogo: null,
          inviteSlug: null,
          isCoach: true,
        },
      ];

      it('finds coach by exact slug match', () => {
        const coach = findCoachBySlug('fitpro', users);
        expect(coach).not.toBeNull();
        expect(coach?.id).toBe('coach-1');
      });

      it('finds coach by slug case-insensitively', () => {
        const coach = findCoachBySlug('FITPRO', users);
        expect(coach).not.toBeNull();
        expect(coach?.id).toBe('coach-1');
      });

      it('returns null for non-existent slug', () => {
        const coach = findCoachBySlug('nonexistent', users);
        expect(coach).toBeNull();
      });

      it('only finds coaches (isCoach: true)', () => {
        // janeclient has a slug but is not a coach
        const coach = findCoachBySlug('janeclient', users);
        expect(coach).toBeNull();
      });

      it('returns null when coach has no slug', () => {
        // coach-3 is a coach but has no slug
        const coach = findCoachBySlug('bobtrainer', users);
        expect(coach).toBeNull();
      });
    });

    describe('Coach Response Building', () => {
      it('uses brandName when set', () => {
        const coach: CoachRecord = {
          id: '1',
          name: 'John Doe',
          brandName: 'Elite Training',
          brandColor: '#4F46E5',
          brandLogo: 'https://example.com/logo.png',
          inviteSlug: 'elite',
          isCoach: true,
        };

        const response = buildCoachResponse(coach);
        expect(response.name).toBe('Elite Training');
      });

      it('falls back to name when no brandName', () => {
        const coach: CoachRecord = {
          id: '1',
          name: 'John Doe',
          brandName: null,
          brandColor: '#4F46E5',
          brandLogo: null,
          inviteSlug: 'johndoe',
          isCoach: true,
        };

        const response = buildCoachResponse(coach);
        expect(response.name).toBe('John Doe');
      });

      it('uses brandColor when set', () => {
        const coach: CoachRecord = {
          id: '1',
          name: 'John Doe',
          brandName: null,
          brandColor: '#059669',
          brandLogo: null,
          inviteSlug: 'johndoe',
          isCoach: true,
        };

        const response = buildCoachResponse(coach);
        expect(response.brandColor).toBe('#059669');
      });

      it('defaults brandColor to #FF6B6B when not set', () => {
        const coach: CoachRecord = {
          id: '1',
          name: 'John Doe',
          brandName: null,
          brandColor: null,
          brandLogo: null,
          inviteSlug: 'johndoe',
          isCoach: true,
        };

        const response = buildCoachResponse(coach);
        expect(response.brandColor).toBe('#FF6B6B');
      });

      it('includes brandLogo when set', () => {
        const coach: CoachRecord = {
          id: '1',
          name: 'John Doe',
          brandName: null,
          brandColor: null,
          brandLogo: 'https://example.com/logo.png',
          inviteSlug: 'johndoe',
          isCoach: true,
        };

        const response = buildCoachResponse(coach);
        expect(response.brandLogo).toBe('https://example.com/logo.png');
      });

      it('returns null brandLogo when not set', () => {
        const coach: CoachRecord = {
          id: '1',
          name: 'John Doe',
          brandName: null,
          brandColor: null,
          brandLogo: null,
          inviteSlug: 'johndoe',
          isCoach: true,
        };

        const response = buildCoachResponse(coach);
        expect(response.brandLogo).toBeNull();
      });
    });

    describe('Public Invite Logic', () => {
      it('returns existing public invite when available', () => {
        const existingInvites: PublicInvite[] = [
          {
            coachId: 'coach-1',
            inviteToken: 'existing-token-abc',
            inviteEmail: null,
            clientId: null,
          },
        ];

        const invite = getOrCreatePublicInvite('coach-1', existingInvites);
        expect(invite.inviteToken).toBe('existing-token-abc');
      });

      it('creates new invite when none exists', () => {
        const invite = getOrCreatePublicInvite('coach-1', []);
        expect(invite.inviteToken).toBe('new-generated-token');
        expect(invite.coachId).toBe('coach-1');
      });

      it('public invite has null email and clientId', () => {
        const invite = getOrCreatePublicInvite('coach-1', []);
        expect(invite.inviteEmail).toBeNull();
        expect(invite.clientId).toBeNull();
      });

      it('ignores private invites (with email)', () => {
        const existingInvites: PublicInvite[] = [
          {
            coachId: 'coach-1',
            inviteToken: 'private-token',
            inviteEmail: 'client@example.com',
            clientId: null,
          },
        ];

        const invite = getOrCreatePublicInvite('coach-1', existingInvites);
        // Should create new since existing has email
        expect(invite.inviteToken).toBe('new-generated-token');
      });

      it('ignores assigned invites (with clientId)', () => {
        const existingInvites: PublicInvite[] = [
          {
            coachId: 'coach-1',
            inviteToken: 'assigned-token',
            inviteEmail: null,
            clientId: 'client-123',
          },
        ];

        const invite = getOrCreatePublicInvite('coach-1', existingInvites);
        // Should create new since existing has clientId
        expect(invite.inviteToken).toBe('new-generated-token');
      });

      it('finds public invite among mixed invites', () => {
        const existingInvites: PublicInvite[] = [
          {
            coachId: 'coach-1',
            inviteToken: 'private-token',
            inviteEmail: 'someone@example.com',
            clientId: null,
          },
          {
            coachId: 'coach-1',
            inviteToken: 'public-token-xyz',
            inviteEmail: null,
            clientId: null,
          },
          {
            coachId: 'coach-1',
            inviteToken: 'assigned-token',
            inviteEmail: null,
            clientId: 'client-456',
          },
        ];

        const invite = getOrCreatePublicInvite('coach-1', existingInvites);
        expect(invite.inviteToken).toBe('public-token-xyz');
      });
    });
  });

  describe('API Error Scenarios', () => {
    /**
     * Tests for error handling logic across coach-related APIs
     * - /api/coach/settings (GET/PUT)
     * - /api/coach/lookup-slug (GET)
     * - /api/user (GET)
     */

    // HTTP status codes
    const HTTP_OK = 200;
    const HTTP_BAD_REQUEST = 400;
    const HTTP_UNAUTHORIZED = 401;
    const HTTP_FORBIDDEN = 403;
    const HTTP_NOT_FOUND = 404;
    const HTTP_SERVER_ERROR = 500;

    interface Session {
      user?: { id?: string; email?: string };
    }

    interface User {
      id: string;
      isCoach: boolean;
    }

    // Simulates auth check (mirrors API logic)
    function checkAuth(session: Session | null): { status: number; error?: string } {
      if (!session?.user?.id) {
        return { status: HTTP_UNAUTHORIZED, error: 'Unauthorized' };
      }
      return { status: HTTP_OK };
    }

    // Simulates coach permission check
    function checkCoachPermission(
      session: Session | null,
      user: User | null
    ): { status: number; error?: string } {
      const authResult = checkAuth(session);
      if (authResult.status !== HTTP_OK) {
        return authResult;
      }

      if (!user?.isCoach) {
        return { status: HTTP_FORBIDDEN, error: 'Not a coach account' };
      }

      return { status: HTTP_OK };
    }

    // Simulates slug validation errors
    function validateSlugInput(
      slug: string | null | undefined
    ): { status: number; error?: string } {
      if (slug === undefined || slug === null) {
        return { status: HTTP_OK }; // Optional field
      }

      const normalized = slug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      if (normalized.length < 3) {
        return {
          status: HTTP_BAD_REQUEST,
          error: 'Invite slug must be at least 3 characters',
        };
      }

      if (normalized.length > 30) {
        return {
          status: HTTP_BAD_REQUEST,
          error: 'Invite slug must be 30 characters or less',
        };
      }

      return { status: HTTP_OK };
    }

    // Simulates color validation
    function validateColorInput(
      color: string | null | undefined
    ): { status: number; error?: string } {
      if (!color) {
        return { status: HTTP_OK }; // Optional field
      }

      if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
        return {
          status: HTTP_BAD_REQUEST,
          error: 'Invalid color format. Use hex like #FF6B6B',
        };
      }

      return { status: HTTP_OK };
    }

    // Simulates lookup-slug input validation
    function validateLookupSlugInput(
      slug: string | null
    ): { status: number; error?: string } {
      if (!slug) {
        return { status: HTTP_BAD_REQUEST, error: 'Slug required' };
      }
      return { status: HTTP_OK };
    }

    // Simulates coach not found error
    function checkCoachExists(
      coachFound: boolean
    ): { status: number; error?: string } {
      if (!coachFound) {
        return { status: HTTP_NOT_FOUND, error: 'Coach not found' };
      }
      return { status: HTTP_OK };
    }

    describe('Authentication Errors', () => {
      it('returns 401 when session is null', () => {
        const result = checkAuth(null);
        expect(result.status).toBe(HTTP_UNAUTHORIZED);
        expect(result.error).toBe('Unauthorized');
      });

      it('returns 401 when session.user is undefined', () => {
        const result = checkAuth({});
        expect(result.status).toBe(HTTP_UNAUTHORIZED);
      });

      it('returns 401 when session.user.id is undefined', () => {
        const result = checkAuth({ user: { email: 'test@example.com' } });
        expect(result.status).toBe(HTTP_UNAUTHORIZED);
      });

      it('returns 200 when properly authenticated', () => {
        const result = checkAuth({ user: { id: 'user-123' } });
        expect(result.status).toBe(HTTP_OK);
      });
    });

    describe('Coach Permission Errors', () => {
      it('returns 401 before checking coach status if not authenticated', () => {
        const result = checkCoachPermission(null, { id: '1', isCoach: true });
        expect(result.status).toBe(HTTP_UNAUTHORIZED);
      });

      it('returns 403 when user is not a coach', () => {
        const session = { user: { id: 'user-123' } };
        const user = { id: 'user-123', isCoach: false };
        const result = checkCoachPermission(session, user);
        expect(result.status).toBe(HTTP_FORBIDDEN);
        expect(result.error).toBe('Not a coach account');
      });

      it('returns 403 when user is null', () => {
        const session = { user: { id: 'user-123' } };
        const result = checkCoachPermission(session, null);
        expect(result.status).toBe(HTTP_FORBIDDEN);
      });

      it('returns 200 when user is a coach', () => {
        const session = { user: { id: 'user-123' } };
        const user = { id: 'user-123', isCoach: true };
        const result = checkCoachPermission(session, user);
        expect(result.status).toBe(HTTP_OK);
      });
    });

    describe('Slug Validation Errors', () => {
      it('returns 400 when slug is too short after normalization', () => {
        const result = validateSlugInput('ab');
        expect(result.status).toBe(HTTP_BAD_REQUEST);
        expect(result.error).toBe('Invite slug must be at least 3 characters');
      });

      it('returns 400 when slug normalizes to empty', () => {
        const result = validateSlugInput('!!!');
        expect(result.status).toBe(HTTP_BAD_REQUEST);
        expect(result.error).toBe('Invite slug must be at least 3 characters');
      });

      it('returns 400 when slug is too long', () => {
        const result = validateSlugInput('a'.repeat(31));
        expect(result.status).toBe(HTTP_BAD_REQUEST);
        expect(result.error).toBe('Invite slug must be 30 characters or less');
      });

      it('returns 200 when slug is valid', () => {
        const result = validateSlugInput('valid-slug');
        expect(result.status).toBe(HTTP_OK);
      });

      it('returns 200 when slug is undefined (optional)', () => {
        const result = validateSlugInput(undefined);
        expect(result.status).toBe(HTTP_OK);
      });

      it('returns 200 when slug is null (clearing value)', () => {
        const result = validateSlugInput(null);
        expect(result.status).toBe(HTTP_OK);
      });
    });

    describe('Color Validation Errors', () => {
      it('returns 400 for invalid hex format (no hash)', () => {
        const result = validateColorInput('FF6B6B');
        expect(result.status).toBe(HTTP_BAD_REQUEST);
        expect(result.error).toBe('Invalid color format. Use hex like #FF6B6B');
      });

      it('returns 400 for 3-digit hex', () => {
        const result = validateColorInput('#FFF');
        expect(result.status).toBe(HTTP_BAD_REQUEST);
      });

      it('returns 400 for invalid characters', () => {
        const result = validateColorInput('#GGGGGG');
        expect(result.status).toBe(HTTP_BAD_REQUEST);
      });

      it('returns 400 for wrong length', () => {
        const result = validateColorInput('#FF6B6');
        expect(result.status).toBe(HTTP_BAD_REQUEST);
      });

      it('returns 200 for valid hex color', () => {
        const result = validateColorInput('#FF6B6B');
        expect(result.status).toBe(HTTP_OK);
      });

      it('returns 200 when color is null/undefined (optional)', () => {
        expect(validateColorInput(null).status).toBe(HTTP_OK);
        expect(validateColorInput(undefined).status).toBe(HTTP_OK);
      });
    });

    describe('Lookup Slug Input Errors', () => {
      it('returns 400 when slug param is missing', () => {
        const result = validateLookupSlugInput(null);
        expect(result.status).toBe(HTTP_BAD_REQUEST);
        expect(result.error).toBe('Slug required');
      });

      it('returns 400 when slug param is empty string', () => {
        const result = validateLookupSlugInput('');
        expect(result.status).toBe(HTTP_BAD_REQUEST);
      });

      it('returns 200 when slug param is provided', () => {
        const result = validateLookupSlugInput('some-slug');
        expect(result.status).toBe(HTTP_OK);
      });
    });

    describe('Coach Not Found Errors', () => {
      it('returns 404 when coach not found by slug', () => {
        const result = checkCoachExists(false);
        expect(result.status).toBe(HTTP_NOT_FOUND);
        expect(result.error).toBe('Coach not found');
      });

      it('returns 200 when coach found', () => {
        const result = checkCoachExists(true);
        expect(result.status).toBe(HTTP_OK);
      });
    });

    describe('Combined Validation Flow', () => {
      interface UpdateSettingsInput {
        brandName?: string | null;
        brandColor?: string | null;
        inviteSlug?: string | null;
      }

      function validateUpdateSettings(
        session: Session | null,
        user: User | null,
        input: UpdateSettingsInput
      ): { status: number; error?: string } {
        // 1. Check auth
        const authResult = checkAuth(session);
        if (authResult.status !== HTTP_OK) return authResult;

        // 2. Check coach permission
        const permResult = checkCoachPermission(session, user);
        if (permResult.status !== HTTP_OK) return permResult;

        // 3. Validate slug
        const slugResult = validateSlugInput(input.inviteSlug);
        if (slugResult.status !== HTTP_OK) return slugResult;

        // 4. Validate color
        const colorResult = validateColorInput(input.brandColor);
        if (colorResult.status !== HTTP_OK) return colorResult;

        return { status: HTTP_OK };
      }

      it('validates in correct order: auth → permission → input', () => {
        // No session - should fail at auth, not reveal coach check
        const result1 = validateUpdateSettings(
          null,
          { id: '1', isCoach: false },
          { inviteSlug: 'x' } // Invalid but shouldn't matter
        );
        expect(result1.status).toBe(HTTP_UNAUTHORIZED);

        // Has session but not coach - should fail at permission
        const result2 = validateUpdateSettings(
          { user: { id: '1' } },
          { id: '1', isCoach: false },
          { inviteSlug: 'x' }
        );
        expect(result2.status).toBe(HTTP_FORBIDDEN);

        // Is coach but invalid input - should fail at validation
        const result3 = validateUpdateSettings(
          { user: { id: '1' } },
          { id: '1', isCoach: true },
          { inviteSlug: 'x' }
        );
        expect(result3.status).toBe(HTTP_BAD_REQUEST);

        // All valid - should succeed
        const result4 = validateUpdateSettings(
          { user: { id: '1' } },
          { id: '1', isCoach: true },
          { inviteSlug: 'valid-slug', brandColor: '#FF6B6B' }
        );
        expect(result4.status).toBe(HTTP_OK);
      });

      it('returns first error encountered', () => {
        // Both slug and color are invalid
        const result = validateUpdateSettings(
          { user: { id: '1' } },
          { id: '1', isCoach: true },
          { inviteSlug: 'x', brandColor: 'invalid' }
        );
        // Slug is validated first
        expect(result.status).toBe(HTTP_BAD_REQUEST);
        expect(result.error).toBe('Invite slug must be at least 3 characters');
      });
    });
  });
});
