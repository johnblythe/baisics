/**
 * Fuzzy matching for exercise names
 * Matches AI-generated exercise names to ExerciseLibrary entries
 */

import { prisma } from '@/lib/prisma';

// Simple trigram similarity (Postgres has pg_trgm but we do it in JS for flexibility)
function trigrams(str: string): Set<string> {
  const s = `  ${str.toLowerCase()}  `;
  const result = new Set<string>();
  for (let i = 0; i < s.length - 2; i++) {
    result.add(s.slice(i, i + 3));
  }
  return result;
}

function similarity(a: string, b: string): number {
  const triA = trigrams(a);
  const triB = trigrams(b);
  const intersection = new Set([...triA].filter(x => triB.has(x)));
  const union = new Set([...triA, ...triB]);
  return intersection.size / union.size;
}

// Normalize exercise name for better matching
function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/\bdumbbell\b|\bdb\b/gi, 'dumbbell')
    .replace(/\bbarbell\b|\bbb\b/gi, 'barbell')
    .replace(/\bez[- ]?bar\b/gi, 'ez bar')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface MatchResult {
  id: string;
  name: string;
  score: number;
  exact: boolean;
}

// Cache for exercise names (refreshed on first call)
let exerciseCache: { id: string; name: string; normalizedName: string }[] | null = null;

async function getExerciseCache() {
  if (!exerciseCache) {
    try {
      const exercises = await prisma.exerciseLibrary.findMany({
        select: { id: true, name: true },
      });
      exerciseCache = exercises.map(e => ({
        id: e.id,
        name: e.name,
        normalizedName: normalize(e.name),
      }));
    } catch (error) {
      console.error('Failed to load exercise library cache:', error);
      throw new Error(`Exercise library unavailable: ${error instanceof Error ? error.message : 'Database error'}`);
    }
  }
  return exerciseCache;
}

// Clear cache (call after imports)
export function clearExerciseCache() {
  exerciseCache = null;
}

/**
 * Find best matching exercise from library
 * Returns null if no good match found (below threshold)
 */
export async function findMatchingExercise(
  name: string,
  threshold = 0.4
): Promise<MatchResult | null> {
  const cache = await getExerciseCache();
  const normalizedInput = normalize(name);

  // Check exact match first
  const exact = cache.find(e => e.normalizedName === normalizedInput);
  if (exact) {
    return { id: exact.id, name: exact.name, score: 1, exact: true };
  }

  // Fuzzy match
  let bestMatch: MatchResult | null = null;
  let bestScore = 0;

  for (const exercise of cache) {
    const score = similarity(normalizedInput, exercise.normalizedName);
    if (score > bestScore && score >= threshold) {
      bestScore = score;
      bestMatch = { id: exercise.id, name: exercise.name, score, exact: false };
    }
  }

  return bestMatch;
}

/**
 * Get or create exercise library entry with exact matching only
 * Fuzzy/AI matching deferred to future enhancement
 * Use this instead of raw connectOrCreate
 */
export async function getOrCreateExercise(
  name: string,
  category = 'default'
): Promise<{ id: string; name: string; wasMatched: boolean }> {
  const cache = await getExerciseCache();
  const normalizedInput = normalize(name);

  // Exact match only (after normalization for DB/Dumbbell etc)
  const exact = cache.find(e => e.normalizedName === normalizedInput);
  if (exact) {
    return { id: exact.id, name: exact.name, wasMatched: true };
  }

  // No exact match - create new sparse entry
  try {
    const created = await prisma.exerciseLibrary.upsert({
      where: { name },
      update: {},
      create: { name, category },
    });

    // Clear cache since we added a new entry
    clearExerciseCache();

    return { id: created.id, name: created.name, wasMatched: false };
  } catch (error) {
    console.error(`Failed to create exercise "${name}":`, error);
    throw new Error(`Could not save exercise "${name}": ${error instanceof Error ? error.message : 'Database error'}`);
  }
}
