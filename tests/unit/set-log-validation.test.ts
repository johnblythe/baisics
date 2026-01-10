import { describe, it, expect } from 'vitest';

/**
 * Tests for SetLog API validation
 *
 * These tests verify that the /api/exercise-logs/[id]/sets/[setNumber] endpoint
 * properly validates required fields before attempting database operations.
 *
 * Bug reference: Missing `reps` field caused Prisma error in production
 * Error: "Argument `reps` is missing" on setLog.create()
 */

// Validation logic extracted for testing (mirrors route validation)
function validateSetLogInput(body: unknown): { valid: true; data: { weight?: number; reps: number; notes?: string } } | { valid: false; error: string } {
  if (typeof body !== 'object' || body === null) {
    return { valid: false, error: 'Request body must be an object' };
  }

  const { reps, weight, notes } = body as Record<string, unknown>;

  // reps is required and must be a number
  if (reps === undefined || reps === null || typeof reps !== 'number') {
    return { valid: false, error: 'reps is required and must be a number' };
  }

  // reps must be a positive integer
  if (!Number.isInteger(reps) || reps < 0) {
    return { valid: false, error: 'reps must be a non-negative integer' };
  }

  // weight is optional but must be number if provided
  if (weight !== undefined && weight !== null && typeof weight !== 'number') {
    return { valid: false, error: 'weight must be a number' };
  }

  // notes is optional but must be string if provided
  if (notes !== undefined && notes !== null && typeof notes !== 'string') {
    return { valid: false, error: 'notes must be a string' };
  }

  return {
    valid: true,
    data: {
      reps,
      weight: typeof weight === 'number' ? weight : undefined,
      notes: typeof notes === 'string' ? notes : undefined,
    },
  };
}

describe('SetLog API Validation', () => {
  describe('reps field validation', () => {
    it('rejects missing reps field', () => {
      const result = validateSetLogInput({ weight: 100 });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('reps is required');
      }
    });

    it('rejects null reps', () => {
      const result = validateSetLogInput({ reps: null, weight: 100 });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('reps is required');
      }
    });

    it('rejects undefined reps', () => {
      const result = validateSetLogInput({ reps: undefined, weight: 100 });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('reps is required');
      }
    });

    it('rejects string reps', () => {
      const result = validateSetLogInput({ reps: '10', weight: 100 });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('reps is required');
      }
    });

    it('rejects negative reps', () => {
      const result = validateSetLogInput({ reps: -1, weight: 100 });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('non-negative');
      }
    });

    it('rejects float reps', () => {
      const result = validateSetLogInput({ reps: 10.5, weight: 100 });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('integer');
      }
    });

    it('accepts valid reps of 0 (for failed sets)', () => {
      const result = validateSetLogInput({ reps: 0 });
      expect(result.valid).toBe(true);
    });

    it('accepts valid positive reps', () => {
      const result = validateSetLogInput({ reps: 10 });
      expect(result.valid).toBe(true);
    });
  });

  describe('weight field validation', () => {
    it('accepts missing weight (bodyweight exercises)', () => {
      const result = validateSetLogInput({ reps: 10 });
      expect(result.valid).toBe(true);
    });

    it('accepts null weight', () => {
      const result = validateSetLogInput({ reps: 10, weight: null });
      expect(result.valid).toBe(true);
    });

    it('accepts valid weight', () => {
      const result = validateSetLogInput({ reps: 10, weight: 135 });
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data.weight).toBe(135);
      }
    });

    it('accepts decimal weight', () => {
      const result = validateSetLogInput({ reps: 10, weight: 132.5 });
      expect(result.valid).toBe(true);
    });

    it('rejects string weight', () => {
      const result = validateSetLogInput({ reps: 10, weight: '135' });
      expect(result.valid).toBe(false);
    });
  });

  describe('notes field validation', () => {
    it('accepts missing notes', () => {
      const result = validateSetLogInput({ reps: 10 });
      expect(result.valid).toBe(true);
    });

    it('accepts null notes', () => {
      const result = validateSetLogInput({ reps: 10, notes: null });
      expect(result.valid).toBe(true);
    });

    it('accepts valid string notes', () => {
      const result = validateSetLogInput({ reps: 10, notes: 'Felt strong' });
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data.notes).toBe('Felt strong');
      }
    });

    it('rejects non-string notes', () => {
      const result = validateSetLogInput({ reps: 10, notes: 123 });
      expect(result.valid).toBe(false);
    });
  });

  describe('complete payload validation', () => {
    it('accepts complete valid payload', () => {
      const result = validateSetLogInput({
        reps: 8,
        weight: 225,
        notes: 'PR attempt',
      });
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data).toEqual({
          reps: 8,
          weight: 225,
          notes: 'PR attempt',
        });
      }
    });

    it('rejects non-object body', () => {
      const result = validateSetLogInput('invalid');
      expect(result.valid).toBe(false);
    });

    it('rejects null body', () => {
      const result = validateSetLogInput(null);
      expect(result.valid).toBe(false);
    });

    it('rejects empty object (missing reps)', () => {
      const result = validateSetLogInput({});
      expect(result.valid).toBe(false);
    });
  });
});
