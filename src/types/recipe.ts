/**
 * Shared recipe types used by API routes and client components (#425, #420)
 */

/** Ingredient parsed from AI with DB enrichment metadata */
export interface ParsedRecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: 'database' | 'ai_estimated';
}

/** Response from POST /api/recipes/parse-text */
export interface ParseRecipeResponse {
  ingredients: ParsedRecipeIngredient[];
  suggestedName: string | null;
  detectedServings: number | null;
  originalText: string;
}

/** Ingredient in the recipe create/edit modal */
export interface RecipeIngredient {
  id: string;
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  /** Original per-100g values for recalculation (optional for AI-parsed ingredients) */
  baseCalories?: number;
  baseProtein?: number;
  baseCarbs?: number;
  baseFat?: number;
  /** Source of macro data */
  source: 'database' | 'ai_estimated' | 'manual';
}
