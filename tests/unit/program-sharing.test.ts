import { describe, it, expect, vi } from 'vitest';

/**
 * Tests for Program Sharing
 * Issue #195
 *
 * Key behaviors:
 * - Only program owner can generate share link
 * - Share ID is idempotent (same ID returned for same program)
 * - Share page shows program preview without auth
 * - Clone requires authentication
 * - Share button shows errors to user
 */

describe('Share Link Generation', () => {
  // Helper that mirrors share API validation
  const validateShareRequest = (
    session: { user?: { id?: string } } | null,
    program: { id: string; createdBy: string; shareId?: string | null } | null,
    requestedProgramId: string
  ): {
    allowed: boolean;
    status: number;
    error?: string;
    shareId?: string;
  } => {
    // Auth check
    if (!session?.user?.id) {
      return { allowed: false, status: 401, error: 'Unauthorized' };
    }

    // Ownership check
    if (!program) {
      return { allowed: false, status: 404, error: 'Program not found' };
    }

    if (program.createdBy !== session.user.id) {
      return { allowed: false, status: 404, error: 'Program not found' };
    }

    // Return existing or generate new
    const shareId = program.shareId ?? 'new-share-id';
    return { allowed: true, status: 200, shareId };
  };

  describe('Authentication', () => {
    it('should return 401 for unauthenticated request', () => {
      const result = validateShareRequest(
        null,
        { id: 'prog-1', createdBy: 'user-1' },
        'prog-1'
      );
      expect(result.status).toBe(401);
      expect(result.error).toBe('Unauthorized');
    });

    it('should return 401 for session without user id', () => {
      const result = validateShareRequest(
        { user: {} },
        { id: 'prog-1', createdBy: 'user-1' },
        'prog-1'
      );
      expect(result.status).toBe(401);
    });
  });

  describe('Ownership', () => {
    it('should return 404 when program not found', () => {
      const result = validateShareRequest(
        { user: { id: 'user-1' } },
        null,
        'nonexistent'
      );
      expect(result.status).toBe(404);
      expect(result.error).toBe('Program not found');
    });

    it('should return 404 when user does not own program', () => {
      const result = validateShareRequest(
        { user: { id: 'user-1' } },
        { id: 'prog-1', createdBy: 'other-user' },
        'prog-1'
      );
      expect(result.status).toBe(404);
      expect(result.error).toBe('Program not found');
    });

    it('should allow owner to generate share link', () => {
      const result = validateShareRequest(
        { user: { id: 'user-1' } },
        { id: 'prog-1', createdBy: 'user-1' },
        'prog-1'
      );
      expect(result.allowed).toBe(true);
      expect(result.shareId).toBeDefined();
    });
  });

  describe('Idempotency', () => {
    it('should return existing share ID if already set', () => {
      const result = validateShareRequest(
        { user: { id: 'user-1' } },
        { id: 'prog-1', createdBy: 'user-1', shareId: 'existing-id' },
        'prog-1'
      );
      expect(result.shareId).toBe('existing-id');
    });

    it('should generate new ID if not set', () => {
      const result = validateShareRequest(
        { user: { id: 'user-1' } },
        { id: 'prog-1', createdBy: 'user-1', shareId: null },
        'prog-1'
      );
      expect(result.shareId).toBe('new-share-id');
    });
  });
});

describe('Share Button Error Handling', () => {
  // Helper that mirrors the share button click handler
  const handleShareClick = async (
    fetchFn: () => Promise<{ ok: boolean; json: () => Promise<{ shareUrl?: string; error?: string }> }>,
    copyToClipboard: (text: string) => Promise<void>,
    showAlert: (msg: string) => void
  ): Promise<void> => {
    try {
      const res = await fetchFn();
      const data = await res.json();

      if (!res.ok) {
        showAlert(data.error || 'Failed to generate share link');
        return;
      }

      if (data.shareUrl) {
        await copyToClipboard(data.shareUrl);
        showAlert('Share link copied to clipboard!');
      } else {
        showAlert('Could not generate share link. Please try again.');
      }
    } catch {
      showAlert('Network error - please check your connection and try again.');
    }
  };

  it('should show success message when link copied', async () => {
    const showAlert = vi.fn();
    const copyToClipboard = vi.fn();

    await handleShareClick(
      async () => ({
        ok: true,
        json: async () => ({ shareUrl: 'https://baisics.app/p/abc123' })
      }),
      copyToClipboard,
      showAlert
    );

    expect(copyToClipboard).toHaveBeenCalledWith('https://baisics.app/p/abc123');
    expect(showAlert).toHaveBeenCalledWith('Share link copied to clipboard!');
  });

  it('should show API error when request fails', async () => {
    const showAlert = vi.fn();

    await handleShareClick(
      async () => ({
        ok: false,
        json: async () => ({ error: 'Program not found' })
      }),
      vi.fn(),
      showAlert
    );

    expect(showAlert).toHaveBeenCalledWith('Program not found');
  });

  it('should show default error when no error message', async () => {
    const showAlert = vi.fn();

    await handleShareClick(
      async () => ({
        ok: false,
        json: async () => ({})
      }),
      vi.fn(),
      showAlert
    );

    expect(showAlert).toHaveBeenCalledWith('Failed to generate share link');
  });

  it('should show retry message when shareUrl missing', async () => {
    const showAlert = vi.fn();

    await handleShareClick(
      async () => ({
        ok: true,
        json: async () => ({}) // No shareUrl
      }),
      vi.fn(),
      showAlert
    );

    expect(showAlert).toHaveBeenCalledWith('Could not generate share link. Please try again.');
  });

  it('should show network error on fetch failure', async () => {
    const showAlert = vi.fn();

    await handleShareClick(
      async () => { throw new Error('Network failure'); },
      vi.fn(),
      showAlert
    );

    expect(showAlert).toHaveBeenCalledWith(
      'Network error - please check your connection and try again.'
    );
  });
});

describe('Clone Button Behavior', () => {
  // Helper that mirrors clone button logic
  const handleCloneClick = (
    isAuthenticated: boolean,
    redirectToSignin: () => void,
    startClone: () => void
  ): void => {
    if (!isAuthenticated) {
      redirectToSignin();
      return;
    }
    startClone();
  };

  it('should redirect to signin when not authenticated', () => {
    const redirectToSignin = vi.fn();
    const startClone = vi.fn();

    handleCloneClick(false, redirectToSignin, startClone);

    expect(redirectToSignin).toHaveBeenCalled();
    expect(startClone).not.toHaveBeenCalled();
  });

  it('should start clone when authenticated', () => {
    const redirectToSignin = vi.fn();
    const startClone = vi.fn();

    handleCloneClick(true, redirectToSignin, startClone);

    expect(redirectToSignin).not.toHaveBeenCalled();
    expect(startClone).toHaveBeenCalled();
  });
});

describe('Share URL Generation', () => {
  const generateShareUrl = (shareId: string, appUrl?: string): string => {
    const baseUrl = appUrl || 'https://baisics.app';
    return `${baseUrl}/p/${shareId}`;
  };

  it('should generate correct URL with default base', () => {
    const url = generateShareUrl('abc123');
    expect(url).toBe('https://baisics.app/p/abc123');
  });

  it('should use custom app URL when provided', () => {
    const url = generateShareUrl('abc123', 'https://custom.domain.com');
    expect(url).toBe('https://custom.domain.com/p/abc123');
  });

  it('should handle short share IDs', () => {
    const url = generateShareUrl('x');
    expect(url).toBe('https://baisics.app/p/x');
  });

  it('should handle long share IDs', () => {
    const longId = 'a'.repeat(50);
    const url = generateShareUrl(longId);
    expect(url).toContain(longId);
  });
});
