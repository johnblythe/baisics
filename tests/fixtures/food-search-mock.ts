import { Page } from "@playwright/test";
import {
  MOCK_CHICKEN_SEARCH_RESPONSE,
  MOCK_EMPTY_SEARCH_RESPONSE,
  MOCK_BANANA,
  MOCK_RICE,
  MOCK_SALMON,
  MOCK_ALMONDS,
  MOCK_OATMEAL,
} from "./nutrition-mocks";
import { FoodSearchSource } from "@/lib/food-search/types";

// Additional mocks not in nutrition-mocks.ts
const MOCK_EGGS_RESULT = {
  id: "usda-172185",
  name: "Egg, whole, cooked, scrambled",
  calories: 149,
  protein: 10.6,
  carbs: 1.6,
  fat: 11,
  source: "USDA" as FoodSearchSource,
  fdcId: 172185,
};

const MOCK_BEEF_RESULT = {
  id: "usda-174032",
  name: "Beef, ground, 85% lean meat / 15% fat, cooked",
  calories: 250,
  protein: 26,
  carbs: 0,
  fat: 15.4,
  source: "USDA" as FoodSearchSource,
  fdcId: 174032,
};

const MOCK_STEAK_RESULT = {
  id: "usda-175168",
  name: "Beef, top sirloin, steak, cooked, grilled",
  calories: 206,
  protein: 30.2,
  carbs: 0,
  fat: 8.7,
  source: "USDA" as FoodSearchSource,
  fdcId: 175168,
};

const MOCK_POTATO_RESULT = {
  id: "usda-170026",
  name: "Potatoes, baked, flesh and skin",
  calories: 93,
  protein: 2.5,
  carbs: 21.2,
  fat: 0.1,
  source: "USDA" as FoodSearchSource,
  fdcId: 170026,
};

const MOCK_APPLE_RESULT = {
  id: "usda-171688",
  name: "Apples, raw, with skin",
  calories: 52,
  protein: 0.3,
  carbs: 13.8,
  fat: 0.2,
  source: "USDA" as FoodSearchSource,
  fdcId: 171688,
};

/**
 * Map of search queries to mock responses.
 * Keys are lowercase search terms; values are API-shaped responses.
 */
const SEARCH_RESPONSES: Record<string, { foods: any[]; counts: any; searchId: string }> = {
  chicken: MOCK_CHICKEN_SEARCH_RESPONSE,
  banana: {
    foods: [MOCK_BANANA],
    counts: { quickFoods: 0, usda: 1, openFoodFacts: 0 },
    searchId: "search-mock-banana",
  },
  rice: {
    foods: [MOCK_RICE],
    counts: { quickFoods: 0, usda: 1, openFoodFacts: 0 },
    searchId: "search-mock-rice",
  },
  salmon: {
    foods: [MOCK_SALMON],
    counts: { quickFoods: 0, usda: 0, openFoodFacts: 1 },
    searchId: "search-mock-salmon",
  },
  almonds: {
    foods: [MOCK_ALMONDS],
    counts: { quickFoods: 0, usda: 1, openFoodFacts: 0 },
    searchId: "search-mock-almonds",
  },
  oatmeal: {
    foods: [MOCK_OATMEAL],
    counts: { quickFoods: 0, usda: 1, openFoodFacts: 0 },
    searchId: "search-mock-oatmeal",
  },
  eggs: {
    foods: [MOCK_EGGS_RESULT],
    counts: { quickFoods: 0, usda: 1, openFoodFacts: 0 },
    searchId: "search-mock-eggs",
  },
  egg: {
    foods: [MOCK_EGGS_RESULT],
    counts: { quickFoods: 0, usda: 1, openFoodFacts: 0 },
    searchId: "search-mock-egg",
  },
  beef: {
    foods: [MOCK_BEEF_RESULT],
    counts: { quickFoods: 0, usda: 1, openFoodFacts: 0 },
    searchId: "search-mock-beef",
  },
  steak: {
    foods: [MOCK_STEAK_RESULT],
    counts: { quickFoods: 0, usda: 1, openFoodFacts: 0 },
    searchId: "search-mock-steak",
  },
  potato: {
    foods: [MOCK_POTATO_RESULT],
    counts: { quickFoods: 0, usda: 1, openFoodFacts: 0 },
    searchId: "search-mock-potato",
  },
  apple: {
    foods: [MOCK_APPLE_RESULT],
    counts: { quickFoods: 0, usda: 1, openFoodFacts: 0 },
    searchId: "search-mock-apple",
  },
};

/**
 * Intercepts `/api/foods/search` requests and returns mock data.
 * Call this in `beforeEach` for any test that uses food search.
 *
 * The mock reads the `q` query param and returns matching data from
 * SEARCH_RESPONSES. Unknown queries return an empty response.
 */
export async function setupFoodSearchMock(page: Page): Promise<void> {
  await page.route("**/api/foods/search?*", async (route) => {
    const url = new URL(route.request().url());
    const query = (url.searchParams.get("q") || "").toLowerCase().trim();

    // Find a matching mock — check if query starts with or equals a known key
    const response = SEARCH_RESPONSES[query] ?? MOCK_EMPTY_SEARCH_RESPONSE;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(response),
    });
  });
}
