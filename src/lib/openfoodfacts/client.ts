/**
 * Open Food Facts API Client
 * @see https://wiki.openfoodfacts.org/API
 */

import {
  OFFSearchResult,
  OFFProduct,
  SimplifiedOFFFood,
} from './types';

const OFF_BASE_URL = 'https://world.openfoodfacts.org';
const USER_AGENT = 'Baisics/1.0 (https://baisics.app)';

/**
 * Extract calories from OFF nutriments, handling both field naming conventions
 */
function extractCalories(nutriments?: OFFProduct['nutriments']): number {
  if (!nutriments) return 0;
  return nutriments['energy-kcal_100g'] ?? nutriments.energy_kcal_100g ?? 0;
}

/**
 * Convert OFF product to simplified format with macros per 100g
 */
export function simplifyProduct(product: OFFProduct): SimplifiedOFFFood | null {
  const name = product.product_name || product.product_name_en;
  if (!name) return null;

  return {
    id: product.code,
    name,
    brand: product.brands,
    calories: extractCalories(product.nutriments),
    protein: product.nutriments?.proteins_100g ?? 0,
    carbs: product.nutriments?.carbohydrates_100g ?? 0,
    fat: product.nutriments?.fat_100g ?? 0,
  };
}

/**
 * Parse error details from OFF API response body
 */
async function parseErrorBody(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (body.status_verbose) {
      return body.status_verbose;
    }
    return JSON.stringify(body);
  } catch {
    return response.statusText;
  }
}

/**
 * Search for foods in Open Food Facts
 * @param query - Search term
 * @param pageSize - Number of results (default 25, max 100)
 * @returns Array of simplified food items
 */
export async function searchFoods(
  query: string,
  pageSize: number = 25
): Promise<SimplifiedOFFFood[]> {
  const params = new URLSearchParams({
    search_terms: query,
    json: '1',
    page_size: String(Math.min(pageSize, 100)),
    fields: 'code,product_name,product_name_en,brands,nutriments',
  });

  let response: Response;
  try {
    response = await fetch(`${OFF_BASE_URL}/cgi/search.pl?${params}`, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Open Food Facts API network error: ${message}`);
  }

  if (!response.ok) {
    const errorDetail = await parseErrorBody(response);
    throw new Error(`Open Food Facts API error ${response.status}: ${errorDetail}`);
  }

  const result: OFFSearchResult = await response.json();

  // Convert to simplified format, filtering out products without names
  return result.products
    .map(simplifyProduct)
    .filter((food): food is SimplifiedOFFFood => food !== null);
}
