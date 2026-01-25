/**
 * USDA FoodData Central API Client
 * @see https://fdc.nal.usda.gov/api-guide.html
 */

import {
  USDASearchResult,
  USDAFood,
  SimplifiedFood,
  FoodNutrient,
  NUTRIENT_IDS,
} from './types';

const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

function getApiKey(): string {
  const key = process.env.USDA_API_KEY;
  if (!key) {
    throw new Error('USDA_API_KEY environment variable is not set');
  }
  return key;
}

/**
 * Extract a specific nutrient value from the nutrients array
 */
function extractNutrient(nutrients: FoodNutrient[], nutrientId: number): number {
  const nutrient = nutrients.find((n) => n.nutrientId === nutrientId);
  return nutrient?.value ?? 0;
}

/**
 * Convert USDA food to simplified format with macros per 100g
 */
export function simplifyFood(food: USDAFood): SimplifiedFood {
  return {
    fdcId: food.fdcId,
    name: food.description,
    brand: food.brandOwner || food.brandName,
    calories: extractNutrient(food.foodNutrients, NUTRIENT_IDS.ENERGY),
    protein: extractNutrient(food.foodNutrients, NUTRIENT_IDS.PROTEIN),
    carbs: extractNutrient(food.foodNutrients, NUTRIENT_IDS.CARBOHYDRATES),
    fat: extractNutrient(food.foodNutrients, NUTRIENT_IDS.FAT),
  };
}

/**
 * Parse error details from USDA API response body
 */
async function parseErrorBody(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (body.error) {
      return typeof body.error === 'string' ? body.error : JSON.stringify(body.error);
    }
    if (body.message) {
      return body.message;
    }
    return JSON.stringify(body);
  } catch {
    return response.statusText;
  }
}

/** Data types available in USDA FoodData Central */
export type USDADataType = 'Branded' | 'Foundation' | 'SR Legacy';

/**
 * Execute a single search request against USDA API
 */
async function executeSearch(
  apiKey: string,
  query: string,
  pageSize: number,
  dataTypes: USDADataType[]
): Promise<USDASearchResult> {
  let response: Response;
  try {
    response = await fetch(`${USDA_BASE_URL}/foods/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify({
        query,
        pageSize: Math.min(pageSize, 200),
        dataType: dataTypes,
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`USDA API network error: ${message}`);
  }

  if (!response.ok) {
    const errorDetail = await parseErrorBody(response);
    throw new Error(`USDA API error ${response.status}: ${errorDetail}`);
  }

  return response.json();
}

/**
 * Sort foods with Branded first, then alphabetically by name
 */
function sortFoodsByPriority(foods: USDAFood[]): USDAFood[] {
  return [...foods].sort((a, b) => {
    // Branded items come first
    const aIsBranded = a.dataType === 'Branded' ? 0 : 1;
    const bIsBranded = b.dataType === 'Branded' ? 0 : 1;
    if (aIsBranded !== bIsBranded) {
      return aIsBranded - bIsBranded;
    }
    // Within same type, sort alphabetically by name
    return a.description.localeCompare(b.description);
  });
}

/** Minimum number of Branded results before searching other data types */
const BRANDED_THRESHOLD = 5;

/**
 * Search for foods in USDA FoodData Central with tiered approach
 *
 * Strategy:
 * 1. Search Branded foods first (these are products with brands)
 * 2. If <5 Branded results, supplement with Foundation and SR Legacy
 * 3. Sort results: Branded first, then by name
 *
 * @param query - Search term
 * @param pageSize - Number of results (default 25, max 200)
 * @returns Search results with foods array sorted by priority
 */
export async function searchFoods(
  query: string,
  pageSize: number = 25
): Promise<USDASearchResult> {
  const apiKey = getApiKey();
  const effectivePageSize = Math.min(pageSize, 200);

  // Step 1: Search Branded foods first
  const brandedResult = await executeSearch(apiKey, query, effectivePageSize, ['Branded']);
  const brandedFoods = brandedResult.foods;

  // Step 2: If we have enough Branded results, return them sorted
  if (brandedFoods.length >= BRANDED_THRESHOLD) {
    return {
      ...brandedResult,
      foods: sortFoodsByPriority(brandedFoods),
    };
  }

  // Step 3: Not enough Branded results - search Foundation and SR Legacy
  const remainingSlots = effectivePageSize - brandedFoods.length;
  const genericResult = await executeSearch(apiKey, query, remainingSlots, ['Foundation', 'SR Legacy']);

  // Combine and sort: Branded first, then generic foods
  const combinedFoods = sortFoodsByPriority([...brandedFoods, ...genericResult.foods]);

  return {
    totalHits: brandedResult.totalHits + genericResult.totalHits,
    currentPage: 1,
    totalPages: Math.ceil((brandedResult.totalHits + genericResult.totalHits) / effectivePageSize),
    foods: combinedFoods,
  };
}

/**
 * Get detailed food information by FDC ID
 * @param fdcId - USDA Food Data Central ID
 * @returns Full food details with nutrients
 */
export async function getFoodDetails(fdcId: number): Promise<USDAFood> {
  const apiKey = getApiKey();

  let response: Response;
  try {
    response = await fetch(`${USDA_BASE_URL}/food/${fdcId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`USDA API network error: ${message}`);
  }

  if (!response.ok) {
    const errorDetail = await parseErrorBody(response);
    throw new Error(`USDA API error ${response.status}: ${errorDetail}`);
  }

  return response.json();
}
