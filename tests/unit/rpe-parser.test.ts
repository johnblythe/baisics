import { describe, it, expect } from 'vitest';

/**
 * Tests for RPE (Rate of Perceived Exertion) parsing from exercise notes.
 *
 * The parseRPE function is defined inline in src/app/workout/[id]/page.tsx.
 * We reimplement the same regex logic here for unit testing.
 *
 * RPE values are stored in exercise notes like "RPE 8 Keep core tight"
 * and displayed as coral badges with hover tooltips on the workout page.
 *
 * Related: PR #352
 */

// Reimplementation of parseRPE from src/app/workout/[id]/page.tsx (line 45-49)
function parseRPE(notes?: string | null): string | null {
  if (!notes) return null;
  const match = notes.match(/RPE\s+([\d]+-?[\d]*)/i);
  return match ? match[1] : null;
}

describe('parseRPE', () => {
  it('extracts RPE value from notes with trailing text', () => {
    expect(parseRPE('RPE 8 Keep core tight')).toBe('8');
  });

  it('extracts RPE value when it is the only content', () => {
    expect(parseRPE('RPE 10')).toBe('10');
  });

  it('extracts RPE range from notes with trailing text', () => {
    expect(parseRPE('RPE 6-7 Moderate effort')).toBe('6-7');
  });

  it('returns null when notes contain no RPE', () => {
    expect(parseRPE('Keep core tight, no RPE')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseRPE('')).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(parseRPE(undefined)).toBeNull();
  });

  it('returns null for null', () => {
    expect(parseRPE(null)).toBeNull();
  });

  it('handles case-insensitive RPE prefix', () => {
    expect(parseRPE('rpe 7')).toBe('7');
    expect(parseRPE('Rpe 9')).toBe('9');
  });

  it('handles RPE with extra whitespace', () => {
    expect(parseRPE('RPE  8')).toBe('8');
  });

  it('extracts first RPE when multiple are present', () => {
    expect(parseRPE('RPE 7 then RPE 9 on last set')).toBe('7');
  });

  it('handles RPE at end of notes without trailing text', () => {
    expect(parseRPE('Focus on form RPE 6')).toBe('6');
  });
});
