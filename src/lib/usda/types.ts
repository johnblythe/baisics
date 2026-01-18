/**
 * USDA FoodData Central API Types
 * @see https://fdc.nal.usda.gov/api-guide.html
 */

/** Individual nutrient data from USDA */
export interface FoodNutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  unitName: string;
  value: number;
}

/** USDA food item from search results */
export interface USDAFood {
  fdcId: number;
  description: string;
  dataType: string;
  brandOwner?: string;
  brandName?: string;
  ingredients?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients: FoodNutrient[];
}

/** USDA search API response */
export interface USDASearchResult {
  totalHits: number;
  currentPage: number;
  totalPages: number;
  foods: USDAFood[];
}

/** Simplified food data with extracted macros (per 100g) */
export interface SimplifiedFood {
  fdcId: number;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** Nutrient IDs in USDA FoodData Central */
export const NUTRIENT_IDS = {
  ENERGY: 1008, // Calories (kcal)
  PROTEIN: 1003,
  CARBOHYDRATES: 1005,
  FAT: 1004,
} as const;
