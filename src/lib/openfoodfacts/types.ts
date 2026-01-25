/**
 * Open Food Facts API Types
 * @see https://wiki.openfoodfacts.org/API
 */

/** Nutriment data from Open Food Facts (per 100g) */
export interface OFFNutriments {
  'energy-kcal_100g'?: number;
  energy_kcal_100g?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
}

/** Product from Open Food Facts search results */
export interface OFFProduct {
  code: string;
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  nutriments?: OFFNutriments;
}

/** Open Food Facts search API response */
export interface OFFSearchResult {
  count: number;
  page: number;
  page_count: number;
  page_size: number;
  products: OFFProduct[];
}

/** Simplified food data matching USDA format */
export interface SimplifiedOFFFood {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
