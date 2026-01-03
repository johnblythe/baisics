import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Tests for Cron Endpoint Authentication
 * Issue #193
 *
 * Security Rules:
 * - CRON_SECRET must be configured (fail closed)
 * - Authorization header must match Bearer <secret>
 * - Returns 500 if secret not configured
 * - Returns 401 if secret doesn't match
 */

describe('Cron Authentication Logic', () => {
  // Helper that mirrors the auth logic in daily-reminders
  const validateCronAuth = (
    authHeader: string | null,
    cronSecret: string | undefined
  ): { allowed: boolean; status: number; error?: string } => {
    // Fail closed if secret not configured
    if (!cronSecret) {
      return { allowed: false, status: 500, error: 'Server configuration error' };
    }

    // Check auth header matches
    if (authHeader !== `Bearer ${cronSecret}`) {
      return { allowed: false, status: 401, error: 'Unauthorized' };
    }

    return { allowed: true, status: 200 };
  };

  describe('CRON_SECRET not configured', () => {
    it('should return 500 when CRON_SECRET is undefined', () => {
      const result = validateCronAuth('Bearer anything', undefined);
      expect(result.allowed).toBe(false);
      expect(result.status).toBe(500);
      expect(result.error).toBe('Server configuration error');
    });

    it('should return 500 when CRON_SECRET is empty string', () => {
      const result = validateCronAuth('Bearer token', '');
      expect(result.allowed).toBe(false);
      expect(result.status).toBe(500);
    });

    it('should not allow request without auth header when secret missing', () => {
      const result = validateCronAuth(null, undefined);
      expect(result.allowed).toBe(false);
      expect(result.status).toBe(500);
    });
  });

  describe('CRON_SECRET configured - valid auth', () => {
    it('should allow request with matching Bearer token', () => {
      const result = validateCronAuth('Bearer my-secret-123', 'my-secret-123');
      expect(result.allowed).toBe(true);
      expect(result.status).toBe(200);
    });

    it('should allow request with complex secret', () => {
      const secret = 'super-long-secret-with-special-chars!@#$%^&*()';
      const result = validateCronAuth(`Bearer ${secret}`, secret);
      expect(result.allowed).toBe(true);
    });
  });

  describe('CRON_SECRET configured - invalid auth', () => {
    it('should reject request without auth header', () => {
      const result = validateCronAuth(null, 'my-secret');
      expect(result.allowed).toBe(false);
      expect(result.status).toBe(401);
      expect(result.error).toBe('Unauthorized');
    });

    it('should reject request with wrong secret', () => {
      const result = validateCronAuth('Bearer wrong-secret', 'correct-secret');
      expect(result.allowed).toBe(false);
      expect(result.status).toBe(401);
    });

    it('should reject request without Bearer prefix', () => {
      const result = validateCronAuth('my-secret', 'my-secret');
      expect(result.allowed).toBe(false);
      expect(result.status).toBe(401);
    });

    it('should reject request with Basic auth instead of Bearer', () => {
      const result = validateCronAuth('Basic my-secret', 'my-secret');
      expect(result.allowed).toBe(false);
      expect(result.status).toBe(401);
    });

    it('should be case-sensitive on Bearer prefix', () => {
      const result = validateCronAuth('bearer my-secret', 'my-secret');
      expect(result.allowed).toBe(false);
      expect(result.status).toBe(401);
    });

    it('should be case-sensitive on secret', () => {
      const result = validateCronAuth('Bearer MY-SECRET', 'my-secret');
      expect(result.allowed).toBe(false);
      expect(result.status).toBe(401);
    });
  });
});

describe('Email Result Counting Logic', () => {
  // Mirrors the reduce logic in daily-reminders
  type PromiseResult =
    | { status: 'fulfilled'; value: { success: boolean; userId?: string } | { skipped: boolean; userId?: string } }
    | { status: 'rejected'; reason: Error };

  const countResults = (results: PromiseResult[]): { sent: number; failed: number } => {
    return results.reduce(
      (acc, r) => {
        if (r.status === 'rejected') {
          acc.failed++;
        } else if (r.value && 'success' in r.value) {
          r.value.success ? acc.sent++ : acc.failed++;
        }
        return acc;
      },
      { sent: 0, failed: 0 }
    );
  };

  it('should count successful sends', () => {
    const results: PromiseResult[] = [
      { status: 'fulfilled', value: { success: true, userId: '1' } },
      { status: 'fulfilled', value: { success: true, userId: '2' } },
      { status: 'fulfilled', value: { success: true, userId: '3' } },
    ];
    const { sent, failed } = countResults(results);
    expect(sent).toBe(3);
    expect(failed).toBe(0);
  });

  it('should count failed sends', () => {
    const results: PromiseResult[] = [
      { status: 'fulfilled', value: { success: false, userId: '1' } },
      { status: 'fulfilled', value: { success: false, userId: '2' } },
    ];
    const { sent, failed } = countResults(results);
    expect(sent).toBe(0);
    expect(failed).toBe(2);
  });

  it('should count rejected promises as failures', () => {
    const results: PromiseResult[] = [
      { status: 'rejected', reason: new Error('Network error') },
      { status: 'rejected', reason: new Error('Timeout') },
    ];
    const { sent, failed } = countResults(results);
    expect(sent).toBe(0);
    expect(failed).toBe(2);
  });

  it('should handle mixed results', () => {
    const results: PromiseResult[] = [
      { status: 'fulfilled', value: { success: true, userId: '1' } },
      { status: 'fulfilled', value: { success: false, userId: '2' } },
      { status: 'rejected', reason: new Error('Error') },
      { status: 'fulfilled', value: { success: true, userId: '4' } },
    ];
    const { sent, failed } = countResults(results);
    expect(sent).toBe(2);
    expect(failed).toBe(2);
  });

  it('should ignore skipped results', () => {
    const results: PromiseResult[] = [
      { status: 'fulfilled', value: { success: true, userId: '1' } },
      { status: 'fulfilled', value: { skipped: true, userId: '2' } },
      { status: 'fulfilled', value: { success: true, userId: '3' } },
    ];
    const { sent, failed } = countResults(results);
    expect(sent).toBe(2);
    expect(failed).toBe(0);
  });

  it('should handle empty results', () => {
    const results: PromiseResult[] = [];
    const { sent, failed } = countResults(results);
    expect(sent).toBe(0);
    expect(failed).toBe(0);
  });
});
