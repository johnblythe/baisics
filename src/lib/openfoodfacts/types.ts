/**
 * Open Food Facts API Types (Search-a-licious / Elasticsearch)
 * @see https://search.openfoodfacts.org/docs
 */

/** Nutriment data from Open Food Facts (per 100g) */
export interface OFFNutriments {
  'energy-kcal_100g'?: number;
  energy_kcal_100g?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
}

/** Product from Search-a-licious results */
export interface OFFProduct {
  code: string;
  product_name?: string;
  product_name_en?: string;
  brands?: string[];  // Search-a-licious returns array, not comma-separated string
  nutriments?: OFFNutriments;
}

/** Search-a-licious search response */
export interface OFFSearchResult {
  count: number;
  page: number;
  page_count: number;
  page_size: number;
  hits: OFFProduct[];
  took?: number;
  timed_out?: boolean;
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
