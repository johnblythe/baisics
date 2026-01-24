/**
 * Unified Food Search Types
 * Common types for multi-source food search
 */

/** Source of a food search result */
export type FoodSearchSource = 'QUICK_FOOD' | 'USDA' | 'OPEN_FOOD_FACTS' | 'AI_ESTIMATED';

/** Unified food result from any source */
export interface UnifiedFoodResult {
  /** Unique identifier - format depends on source */
  id: string;
  /** Food name */
  name: string;
  /** Brand name if applicable */
  brand?: string;
  /** Calories per 100g or serving */
  calories: number;
  /** Protein in grams */
  protein: number;
  /** Carbohydrates in grams */
  carbs: number;
  /** Fat in grams */
  fat: number;
  /** Source of this result */
  source: FoodSearchSource;
  /** For USDA foods, the FDC ID */
  fdcId?: number;
  /** For user QuickFoods, serving info */
  servingSize?: number;
  servingUnit?: string;
  /** For sorting: user's personal usage count */
  usageCount?: number;
}

/** Options for unified search */
export interface UnifiedSearchOptions {
  /** User ID for searching QuickFoods */
  userId?: string;
  /** Maximum results per source */
  pageSize?: number;
  /** Skip USDA search */
  skipUsda?: boolean;
  /** Skip Open Food Facts search */
  skipOff?: boolean;
}

/** Result of unified search */
export interface UnifiedSearchResult {
  /** Combined results from all sources */
  results: UnifiedFoodResult[];
  /** Count of results by source */
  counts: {
    quickFoods: number;
    usda: number;
    openFoodFacts: number;
  };
}
