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
  // Must have at least some calories or macros
  if (food.calories === 0 && food.protein === 0 && food.carbs === 0 && food.fat === 0) {
    return false;
  }
  // Reject obviously bad data (negative values, impossibly high values)
  if (food.calories < 0 || food.calories > 1000) return false;
  if (food.protein < 0 || food.protein > 100) return false;
  if (food.carbs < 0 || food.carbs > 100) return false;
  if (food.fat < 0 || food.fat > 100) return false;
  return true;
}

/**
 * Calculate relevance score for a food result based on query match
 * Higher score = more relevant
 */
function calculateRelevanceScore(food: UnifiedFoodResult, query: string): number {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(Boolean);
  const nameLower = food.name.toLowerCase();
  const brandLower = (food.brand || '').toLowerCase();

  let score = 0;

  // Exact name match = highest boost
  if (nameLower === queryLower) score += 100;

  // Name starts with query = good
  if (nameLower.startsWith(queryLower)) score += 50;

  // Brand match = big boost (user searching for specific brand)
  for (const word of queryWords) {
    if (brandLower.includes(word)) score += 30;
    if (nameLower.includes(word)) score += 10;
  }

  // User's own foods get priority boost
  if (food.source === 'QUICK_FOOD') score += 200;

  // Penalize results with very low calories (likely incomplete data)
  if (food.calories < 5) score -= 20;

  return score;
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
 * Deduplicate results, keeping the first occurrence (preserves priority order)
 */
function deduplicateResults(results: UnifiedFoodResult[]): UnifiedFoodResult[] {
  const unique: UnifiedFoodResult[] = [];

  for (const food of results) {
    const hasDuplicate = unique.some(existing => isDuplicate(existing, food));
    if (!hasDuplicate) {
      unique.push(food);
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
  pageSize: number
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
      };
    });
  } catch (error) {
    console.error('USDA search error:', error);
    return [];
  }
}

/**
 * Search Open Food Facts
 */
async function searchOpenFoodFacts(
  query: string,
  pageSize: number
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
    console.error('Open Food Facts search error:', error);
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
  } = options;

  // Search all sources concurrently
  const [quickFoodResults, usdaResults, offResults] = await Promise.all([
    userId ? searchQuickFoods(query, userId, pageSize) : Promise.resolve([]),
    skipUsda ? Promise.resolve([]) : searchUsdaFoods(query, pageSize),
    skipOff ? Promise.resolve([]) : searchOpenFoodFacts(query, pageSize),
  ]);

  // Combine all results
  const combined = [...quickFoodResults, ...usdaResults, ...offResults];

  // Filter out bad data (0 cal/0 everything, invalid values)
  const validResults = combined.filter(hasValidNutrition);

  // Deduplicate
  const deduplicated = deduplicateResults(validResults);

  // Sort by relevance score (higher = better match)
  const sorted = deduplicated.sort((a, b) => {
    const scoreA = calculateRelevanceScore(a, query);
    const scoreB = calculateRelevanceScore(b, query);
    return scoreB - scoreA; // Descending (highest score first)
  });

  return {
    results: sorted,
    counts: {
      quickFoods: quickFoodResults.length,
      usda: usdaResults.length,
      openFoodFacts: offResults.length,
    },
  };
}
