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
 * Search for foods in USDA FoodData Central
 * @param query - Search term
 * @param pageSize - Number of results (default 25, max 200)
 * @returns Search results with foods array
 */
export async function searchFoods(
  query: string,
  pageSize: number = 25
): Promise<USDASearchResult> {
  const apiKey = getApiKey();

  const response = await fetch(`${USDA_BASE_URL}/foods/search?api_key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      pageSize: Math.min(pageSize, 200),
      dataType: ['Branded', 'Foundation', 'SR Legacy'],
    }),
  });

  if (!response.ok) {
    throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get detailed food information by FDC ID
 * @param fdcId - USDA Food Data Central ID
 * @returns Full food details with nutrients
 */
export async function getFoodDetails(fdcId: number): Promise<USDAFood> {
  const apiKey = getApiKey();

  const response = await fetch(
    `${USDA_BASE_URL}/food/${fdcId}?api_key=${apiKey}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
