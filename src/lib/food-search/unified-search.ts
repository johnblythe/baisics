/**
 * Unified Food Search Service
 *
 * Searches multiple food sources in priority order:
 * 1. User's QuickFoods (highest priority)
 * 2. USDA FoodData Central
 * 3. Open Food Facts
 *
 * Results are deduplicated by name+brand similarity and sorted with user's foods first.
 */

import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/logger';
import { searchFoods as searchUsda, simplifyFood } from '@/lib/usda/client';
import { searchFoods as searchOff } from '@/lib/openfoodfacts/client';
import {
  UnifiedFoodResult,
  UnifiedSearchOptions,
  UnifiedSearchResult,
  FoodSearchSource,
} from './types';

/** Default page size for each source */
const DEFAULT_PAGE_SIZE = 25;

/** Similarity threshold for deduplication (0-1, where 1 is exact match) */
const SIMILARITY_THRESHOLD = 0.85;

/**
 * Round a number to whole number
 */
function roundMacro(value: number): number {
  return Math.round(value);
}

/**
 * Check if a food has valid nutrition data
 * Filters out junk entries with 0 everything or clearly bad data
 */
function hasValidNutrition(food: UnifiedFoodResult): boolean {
  if (food.isVerified) return true;
  // Must have at least some calories or macros
  if (food.calories === 0 && food.protein === 0 && food.carbs === 0 && food.fat === 0) {
    return false;
  }
  // Reject obviously bad data (negative values, impossibly high per-100g values)
  // Raised thresholds: oils = 884 cal/100g, protein isolates = 90g+/100g
  if (food.calories < 0 || food.calories > 1200) return false;
  if (food.protein < 0 || food.protein > 120) return false;
  if (food.carbs < 0 || food.carbs > 100) return false;
  if (food.fat < 0 || food.fat > 100) return false;
  return true;
}

/**
 * Calculate relevance score for a food result based on query match
 * Higher score = more relevant
 *
 * Prioritizes name matches over brand matches to avoid "brand pollution"
 * where searching "fresh blueberries" returns "Meadow Fresh" branded products.
 */
/** Named scoring constants for relevance calculation */
const SCORING = {
  exactNameMatch: 100,
  nameStartsWithQuery: 50,
  queryWordInName: 25,
  queryWordInBrandOnly: 5,
  allWordsInNameBonus: 30,
  brandOnlyPenalty: -20,
  quickFoodBoost: 200,
  verifiedBoost: 150,
  lowCaloriePenalty: -20,
} as const;

function calculateRelevanceScore(food: UnifiedFoodResult, query: string): number {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(Boolean);
  const nameLower = food.name.toLowerCase();
  const brandLower = (food.brand || '').toLowerCase();

  let score = 0;

  if (nameLower === queryLower) score += SCORING.exactNameMatch;
  if (nameLower.startsWith(queryLower)) score += SCORING.nameStartsWithQuery;

  let nameMatches = 0;
  let brandOnlyMatches = 0;

  for (const word of queryWords) {
    const inName = nameLower.includes(word);
    const inBrand = brandLower.includes(word);

    if (inName) {
      score += SCORING.queryWordInName;
      nameMatches++;
    } else if (inBrand) {
      score += SCORING.queryWordInBrandOnly;
      brandOnlyMatches++;
    }
  }

  if (queryWords.length > 0) {
    const nameMatchRatio = nameMatches / queryWords.length;
    score += Math.round(nameMatchRatio * SCORING.allWordsInNameBonus);
  }

  if (nameMatches === 0 && brandOnlyMatches > 0) {
    score += SCORING.brandOnlyPenalty;
  }

  // Fuzzy name match: boost foods whose name is similar to the query
  // even when exact substring match fails (e.g., "bnana" → "banana")
  if (nameMatches === 0) {
    const fuzzySim = trigramSimilarity(nameLower, queryLower);
    if (fuzzySim >= 0.3) score += Math.round(fuzzySim * 50);
  }

  if (food.source === 'QUICK_FOOD') score += SCORING.quickFoodBoost;
  if (food.isVerified) score += SCORING.verifiedBoost;
  if (food.calories < 5) score += SCORING.lowCaloriePenalty;

  return score;
}

/**
 * Character-level trigram similarity (mirrors pg_trgm logic).
 * Used in relevance scoring so fuzzy DB matches aren't penalized
 * by the exact-string relevance checks.
 */
function trigramSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const trgA = new Set<string>();
  const trgB = new Set<string>();
  for (let i = 0; i <= a.length - 3; i++) trgA.add(a.slice(i, i + 3));
  for (let i = 0; i <= b.length - 3; i++) trgB.add(b.slice(i, i + 3));
  if (trgA.size === 0 && trgB.size === 0) return 1;
  if (trgA.size === 0 || trgB.size === 0) return 0;
  let intersection = 0;
  for (const t of trgA) if (trgB.has(t)) intersection++;
  return intersection / (trgA.size + trgB.size - intersection);
}

/**
 * Calculate simple similarity between two strings (case-insensitive)
 * Uses Jaccard similarity on word tokens
 */
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.toLowerCase().split(/\s+/).filter(Boolean));
  const words2 = new Set(str2.toLowerCase().split(/\s+/).filter(Boolean));

  if (words1.size === 0 && words2.size === 0) return 1;
  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Check if two foods are duplicates based on name and brand similarity
 */
function isDuplicate(food1: UnifiedFoodResult, food2: UnifiedFoodResult): boolean {
  const nameSimilarity = calculateSimilarity(food1.name, food2.name);

  // If names are very similar
  if (nameSimilarity >= SIMILARITY_THRESHOLD) {
    // If both have brands, check brand similarity too
    if (food1.brand && food2.brand) {
      const brandSimilarity = calculateSimilarity(food1.brand, food2.brand);
      return brandSimilarity >= SIMILARITY_THRESHOLD;
    }
    // If neither has brand, consider duplicate
    if (!food1.brand && !food2.brand) {
      return true;
    }
  }

  return false;
}

/**
 * Determine if a candidate should replace an existing entry during dedup.
 * Verified foods beat non-verified; QuickFoods always win.
 */
function shouldReplace(existing: UnifiedFoodResult, candidate: UnifiedFoodResult): boolean {
  if (existing.source === 'QUICK_FOOD') return false;
  if (candidate.source === 'QUICK_FOOD') return true;
  if (candidate.isVerified && !existing.isVerified) return true;
  return false;
}

/**
 * Deduplicate results, keeping the best occurrence per name+brand.
 * Uses shouldReplace() to prefer verified/QuickFood entries.
 */
function deduplicateResults(results: UnifiedFoodResult[]): UnifiedFoodResult[] {
  const unique: UnifiedFoodResult[] = [];

  for (const food of results) {
    const dupeIndex = unique.findIndex(existing => isDuplicate(existing, food));
    if (dupeIndex === -1) {
      unique.push(food);
    } else if (shouldReplace(unique[dupeIndex], food)) {
      unique[dupeIndex] = food;
    }
  }

  return unique;
}

/**
 * Search user's QuickFoods
 */
async function searchQuickFoods(
  query: string,
  userId: string,
  pageSize: number
): Promise<UnifiedFoodResult[]> {
  const quickFoods = await prisma.quickFood.findMany({
    where: {
      userId,
      name: {
        contains: query,
        mode: 'insensitive',
      },
    },
    orderBy: [
      { isStarter: 'asc' }, // User's own foods first
      { usageCount: 'desc' }, // Most used first
      { name: 'asc' },
    ],
    take: pageSize,
  });

  return quickFoods.map((food) => ({
    id: `quickfood:${food.id}`,
    name: food.name,
    brand: food.brand ?? undefined,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    source: 'QUICK_FOOD' as FoodSearchSource,
    servingSize: food.servingSize,
    servingUnit: food.servingUnit,
    usageCount: food.usageCount,
  }));
}

/**
 * Search USDA FoodData Central
 */
async function searchUsdaFoods(
  query: string,
  pageSize: number,
  errors?: Record<string, string>
): Promise<UnifiedFoodResult[]> {
  try {
    const result = await searchUsda(query, pageSize);
    return result.foods.map((food) => {
      const simplified = simplifyFood(food);
      return {
        id: `usda:${simplified.fdcId}`,
        name: simplified.name,
        brand: simplified.brand,
        calories: simplified.calories,
        protein: simplified.protein,
        carbs: simplified.carbs,
        fat: simplified.fat,
        source: 'USDA' as FoodSearchSource,
        fdcId: simplified.fdcId,
        servingSize: simplified.servingSize,
        servingUnit: simplified.servingSizeUnit,
      };
    });
  } catch (error) {
    logError('food-search:usda', error, { query });
    if (errors) errors.usda = error instanceof Error ? error.message : 'Unknown error';
    return [];
  }
}

/**
 * Search Open Food Facts
 */
async function searchOpenFoodFacts(
  query: string,
  pageSize: number,
  errors?: Record<string, string>
): Promise<UnifiedFoodResult[]> {
  try {
    const foods = await searchOff(query, pageSize);
    return foods.map((food) => ({
      id: `off:${food.id}`,
      name: food.name,
      brand: food.brand,
      calories: roundMacro(food.calories),
      protein: roundMacro(food.protein),
      carbs: roundMacro(food.carbs),
      fat: roundMacro(food.fat),
      source: 'OPEN_FOOD_FACTS' as FoodSearchSource,
    }));
  } catch (error) {
    logError('food-search:off-api', error, { query });
    if (errors) errors.offApi = error instanceof Error ? error.message : 'Unknown error';
    return [];
  }
}

/**
 * Row type for raw SQL query against foods_off table
 * Mirrors Prisma FoodsOff model columns used in search
 */
interface FoodsOffRow {
  id: string;
  code: string;
  product_name: string;
  brands: string | null;
  calories_per_100g: number | null;
  protein_per_100g: number | null;
  carbs_per_100g: number | null;
  fat_per_100g: number | null;
  serving_size: string | null;
  is_verified: boolean;
  verified_serving_unit: string | null;
  verified_serving_grams: number | null;
}

/**
 * Search local Open Food Facts cache via Postgres tsvector + trigram fuzzy fallback
 */
async function searchLocalOff(
  query: string,
  pageSize: number,
  errors?: Record<string, string>
): Promise<UnifiedFoodResult[]> {
  try {
    // Phase 1: tsvector exact-stem search
    const tsResults = await prisma.$queryRaw<FoodsOffRow[]>`
      WITH q AS (SELECT plainto_tsquery('english', ${query}) AS tsq)
      SELECT f.id, f.code, f.product_name, f.brands,
             f.calories_per_100g, f.protein_per_100g, f.carbs_per_100g, f.fat_per_100g,
             f.serving_size, f.is_verified, f.verified_serving_unit, f.verified_serving_grams
      FROM foods_off f, q
      WHERE f.search_vector @@ q.tsq
      ORDER BY f.is_verified DESC, ts_rank(f.search_vector, q.tsq) DESC
      LIMIT ${pageSize}
    `;

    // Phase 2: trigram fuzzy fallback — only when tsvector returned few results.
    // Own try-catch so Phase 1 results survive if pg_trgm is unavailable.
    let fuzzyResults: FoodsOffRow[] = [];
    if (tsResults.length < 5 && query.trim().length >= 3) {
      try {
        fuzzyResults = await prisma.$transaction(async (tx) => {
          await tx.$executeRaw`SET LOCAL pg_trgm.similarity_threshold = 0.4`;
          // Verified fuzzy first — tiny subset (~100-250 verified foods), instant
          const verifiedFuzzy = await tx.$queryRaw<FoodsOffRow[]>`
            SELECT f.id, f.code, f.product_name, f.brands,
                   f.calories_per_100g, f.protein_per_100g, f.carbs_per_100g, f.fat_per_100g,
                   f.serving_size, f.is_verified, f.verified_serving_unit, f.verified_serving_grams
            FROM foods_off f
            WHERE f.product_name % ${query} AND f.is_verified = true
            ORDER BY f.product_name <-> ${query}
            LIMIT 5
          `;
          // General fuzzy to fill remaining slots
          const generalFuzzy = await tx.$queryRaw<FoodsOffRow[]>`
            SELECT f.id, f.code, f.product_name, f.brands,
                   f.calories_per_100g, f.protein_per_100g, f.carbs_per_100g, f.fat_per_100g,
                   f.serving_size, f.is_verified, f.verified_serving_unit, f.verified_serving_grams
            FROM foods_off f
            WHERE f.product_name % ${query}
            ORDER BY f.product_name <-> ${query}
            LIMIT ${pageSize}
          `;
          return [...verifiedFuzzy, ...generalFuzzy];
        });
      } catch (fuzzyError) {
        logError('food-search:off-local:fuzzy', fuzzyError, { query });
      }
    }

    // Merge: tsvector first, then fuzzy. Cap to pageSize. deduplicateResults() handles overlap.
    const allRows = [...tsResults, ...fuzzyResults].slice(0, pageSize);
    return allRows.map(food => ({
      id: `off-local:${food.code}`,
      name: food.product_name,
      brand: food.brands ?? undefined,
      calories: Math.round(food.calories_per_100g ?? 0),
      protein: Math.round(food.protein_per_100g ?? 0),
      carbs: Math.round(food.carbs_per_100g ?? 0),
      fat: Math.round(food.fat_per_100g ?? 0),
      source: food.is_verified ? 'VERIFIED' : 'OPEN_FOOD_FACTS',
      offCode: food.code,
      isVerified: food.is_verified,
      verifiedServingUnit: food.verified_serving_unit ?? undefined,
      verifiedServingGrams: food.verified_serving_grams ?? undefined,
    }));
  } catch (error) {
    logError('food-search:off-local', error, { query });
    if (errors) errors.offLocal = error instanceof Error ? error.message : 'Unknown error';
    return [];
  }
}

/**
 * Search all food sources and return unified, deduplicated results
 *
 * Search order:
 * 1. User's QuickFoods (highest priority - always appear first)
 * 2. USDA FoodData Central
 * 3. Open Food Facts
 *
 * @param query - Search term
 * @param options - Search options
 * @returns Combined, deduplicated results with user's foods first
 */
export async function unifiedSearch(
  query: string,
  options: UnifiedSearchOptions = {}
): Promise<UnifiedSearchResult> {
  const {
    userId,
    pageSize = DEFAULT_PAGE_SIZE,
    skipUsda = false,
    skipOff = false,
    skipOffFallback = false,
  } = options;

  const errors: Record<string, string> = {};

  // Phase 1: parallel search — QuickFoods + USDA + local OFF
  // Each source is individually try/caught to prevent one failure from crashing others
  const searchQuickFoodsSafe = async (): Promise<UnifiedFoodResult[]> => {
    if (!userId) return [];
    try {
      return await searchQuickFoods(query, userId, pageSize);
    } catch (error) {
      logError('food-search:quickfoods', error, { query, userId });
      errors.quickFoods = error instanceof Error ? error.message : 'Unknown error';
      return [];
    }
  };

  const [quickFoodResults, usdaResults, offLocalResults] = await Promise.all([
    searchQuickFoodsSafe(),
    skipUsda ? Promise.resolve([]) : searchUsdaFoods(query, pageSize, errors),
    skipOff ? Promise.resolve([]) : searchLocalOff(query, pageSize, errors),
  ]);

  // Phase 2: conditional SAL fallback — only if local OFF is thin and not skipped (#417)
  let offSalResults: UnifiedFoodResult[] = [];
  if (!skipOff && !skipOffFallback && offLocalResults.length < 5) {
    offSalResults = await searchOpenFoodFacts(query, pageSize, errors);
  }

  // Log high-severity warning when ALL sources failed
  if (Object.keys(errors).length > 0) {
    const sourceCount = [!skipUsda, !skipOff, !!userId].filter(Boolean).length;
    if (Object.keys(errors).length >= sourceCount && sourceCount > 0) {
      logError('food-search:all-sources-failed', new Error('All food sources failed'), { query, errors, sourceCount });
    }
  }

  // Combine all results
  const combined = [...quickFoodResults, ...usdaResults, ...offLocalResults, ...offSalResults];

  // Filter out bad data (0 cal/0 everything, invalid values)
  const validResults = combined.filter(hasValidNutrition);

  // Deduplicate
  const deduplicated = deduplicateResults(validResults);

  // Pre-compute relevance scores, then sort (avoids re-computing inside comparator)
  const scored = deduplicated.map(food => ({ food, score: calculateRelevanceScore(food, query) }));
  scored.sort((a, b) => b.score - a.score);
  const sorted = scored.map(s => s.food);

  const verifiedCount = offLocalResults.filter(f => f.isVerified).length;

  return {
    results: sorted,
    counts: {
      quickFoods: quickFoodResults.length,
      usda: usdaResults.length,
      openFoodFacts: offLocalResults.length - verifiedCount + offSalResults.length,
      verified: verifiedCount,
    },
    ...(Object.keys(errors).length > 0 && { errors }),
  };
}
