import { UnifiedFoodResult, FoodSearchSource } from "@/lib/food-search/types";
import { USDAFood, USDASearchResult } from "@/lib/usda/types";
import { OFFProduct, OFFSearchResult } from "@/lib/openfoodfacts/types";

/**
 * Mock data for nutrition E2E tests
 * Contains sample foods from different sources for testing search, logging, etc.
 */

// ============================================================================
// Unified Food Results (what the API returns)
// ============================================================================

/** Mock chicken breast from USDA */
export const MOCK_CHICKEN_BREAST: UnifiedFoodResult = {
  id: "usda-171077",
  name: "Chicken, broilers or fryers, breast, meat only, cooked, roasted",
  calories: 165,
  protein: 31,
  carbs: 0,
  fat: 3.6,
  source: "USDA" as FoodSearchSource,
  fdcId: 171077,
};

/** Mock Greek yogurt from Open Food Facts */
export const MOCK_GREEK_YOGURT: UnifiedFoodResult = {
  id: "off-3329770057142",
  name: "Greek Yogurt Plain",
  brand: "Fage",
  calories: 97,
  protein: 17,
  carbs: 3.3,
  fat: 0.7,
  source: "OPEN_FOOD_FACTS" as FoodSearchSource,
};

/** Mock banana from USDA */
export const MOCK_BANANA: UnifiedFoodResult = {
  id: "usda-173944",
  name: "Bananas, raw",
  calories: 89,
  protein: 1.1,
  carbs: 22.8,
  fat: 0.3,
  source: "USDA" as FoodSearchSource,
  fdcId: 173944,
};

/** Mock oatmeal from USDA */
export const MOCK_OATMEAL: UnifiedFoodResult = {
  id: "usda-169705",
  name: "Cereals, oats, instant, fortified, plain, dry",
  calories: 379,
  protein: 13.2,
  carbs: 67.7,
  fat: 6.5,
  source: "USDA" as FoodSearchSource,
  fdcId: 169705,
};

/** Mock protein shake from user's QuickFoods */
export const MOCK_PROTEIN_SHAKE: UnifiedFoodResult = {
  id: "quickfood-abc123",
  name: "Protein Shake - Chocolate",
  brand: "My QuickFood",
  calories: 160,
  protein: 25,
  carbs: 8,
  fat: 3,
  source: "QUICK_FOOD" as FoodSearchSource,
  servingSize: 1,
  servingUnit: "scoop",
  usageCount: 15,
};

/** Mock salmon from Open Food Facts */
export const MOCK_SALMON: UnifiedFoodResult = {
  id: "off-0074326610002",
  name: "Atlantic Salmon Fillet",
  brand: "Costco",
  calories: 208,
  protein: 20,
  carbs: 0,
  fat: 13,
  source: "OPEN_FOOD_FACTS" as FoodSearchSource,
};

/** Mock rice from USDA */
export const MOCK_RICE: UnifiedFoodResult = {
  id: "usda-169756",
  name: "Rice, white, long-grain, regular, cooked",
  calories: 130,
  protein: 2.7,
  carbs: 28.2,
  fat: 0.3,
  source: "USDA" as FoodSearchSource,
  fdcId: 169756,
};

/** Mock almonds from USDA */
export const MOCK_ALMONDS: UnifiedFoodResult = {
  id: "usda-170567",
  name: "Nuts, almonds, dry roasted, without salt added",
  calories: 598,
  protein: 21,
  carbs: 20.4,
  fat: 52.5,
  source: "USDA" as FoodSearchSource,
  fdcId: 170567,
};

/** Mock coffee from user's QuickFoods */
export const MOCK_BLACK_COFFEE: UnifiedFoodResult = {
  id: "quickfood-coffee123",
  name: "Black Coffee",
  calories: 2,
  protein: 0.3,
  carbs: 0,
  fat: 0,
  source: "QUICK_FOOD" as FoodSearchSource,
  servingSize: 8,
  servingUnit: "oz",
  usageCount: 47,
};

/** Mock AI-estimated food */
export const MOCK_AI_ESTIMATED_FOOD: UnifiedFoodResult = {
  id: "ai-est-001",
  name: "Grilled chicken breast (6oz)",
  calories: 280,
  protein: 52,
  carbs: 0,
  fat: 6,
  source: "AI_ESTIMATED" as FoodSearchSource,
};

// ============================================================================
// Food Search Response Mocks
// ============================================================================

/** Mock search response for "chicken" query */
export const MOCK_CHICKEN_SEARCH_RESPONSE = {
  foods: [
    MOCK_CHICKEN_BREAST,
    {
      id: "usda-171116",
      name: "Chicken, thigh, meat only, cooked, roasted",
      calories: 209,
      protein: 26,
      carbs: 0,
      fat: 10.9,
      source: "USDA" as FoodSearchSource,
      fdcId: 171116,
    },
    {
      id: "usda-171166",
      name: "Chicken, drumstick, meat only, cooked, roasted",
      calories: 172,
      protein: 28.3,
      carbs: 0,
      fat: 5.7,
      source: "USDA" as FoodSearchSource,
      fdcId: 171166,
    },
  ],
  counts: {
    quickFoods: 0,
    usda: 3,
    openFoodFacts: 0,
  },
  searchId: "search-mock-123",
};

/** Mock search response for "yogurt" query */
export const MOCK_YOGURT_SEARCH_RESPONSE = {
  foods: [
    MOCK_GREEK_YOGURT,
    {
      id: "off-0028000520861",
      name: "Vanilla Greek Yogurt",
      brand: "Chobani",
      calories: 120,
      protein: 12,
      carbs: 13,
      fat: 2,
      source: "OPEN_FOOD_FACTS" as FoodSearchSource,
    },
  ],
  counts: {
    quickFoods: 0,
    usda: 0,
    openFoodFacts: 2,
  },
  searchId: "search-mock-456",
};

/** Mock empty search response */
export const MOCK_EMPTY_SEARCH_RESPONSE = {
  foods: [],
  counts: {
    quickFoods: 0,
    usda: 0,
    openFoodFacts: 0,
  },
  searchId: "search-mock-empty",
};

// ============================================================================
// Raw API Response Mocks (for route handler testing)
// ============================================================================

/** Mock USDA API search response */
export const MOCK_USDA_API_RESPONSE: USDASearchResult = {
  totalHits: 100,
  currentPage: 1,
  totalPages: 10,
  foods: [
    {
      fdcId: 171077,
      description: "Chicken, broilers or fryers, breast, meat only, cooked, roasted",
      dataType: "SR Legacy",
      foodNutrients: [
        { nutrientId: 1008, nutrientName: "Energy", nutrientNumber: "208", unitName: "kcal", value: 165 },
        { nutrientId: 1003, nutrientName: "Protein", nutrientNumber: "203", unitName: "g", value: 31 },
        { nutrientId: 1005, nutrientName: "Carbohydrate", nutrientNumber: "205", unitName: "g", value: 0 },
        { nutrientId: 1004, nutrientName: "Total lipid (fat)", nutrientNumber: "204", unitName: "g", value: 3.6 },
      ],
    } as USDAFood,
  ],
};

/** Mock Open Food Facts API search response */
export const MOCK_OFF_API_RESPONSE: OFFSearchResult = {
  count: 50,
  page: 1,
  page_count: 5,
  page_size: 10,
  products: [
    {
      code: "3329770057142",
      product_name: "Greek Yogurt Plain",
      product_name_en: "Greek Yogurt Plain",
      brands: "Fage",
      nutriments: {
        "energy-kcal_100g": 97,
        proteins_100g: 17,
        carbohydrates_100g: 3.3,
        fat_100g: 0.7,
      },
    } as OFFProduct,
  ],
};

// ============================================================================
// Nutrition Targets Mocks
// ============================================================================

/** Default nutrition targets for testing */
export const MOCK_DEFAULT_TARGETS = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 67,
};

/** High protein targets */
export const MOCK_HIGH_PROTEIN_TARGETS = {
  calories: 2200,
  protein: 200,
  carbs: 180,
  fat: 60,
};

/** Low carb targets */
export const MOCK_LOW_CARB_TARGETS = {
  calories: 1800,
  protein: 140,
  carbs: 50,
  fat: 120,
};

/** Weight loss targets */
export const MOCK_WEIGHT_LOSS_TARGETS = {
  calories: 1500,
  protein: 130,
  carbs: 120,
  fat: 50,
};

// ============================================================================
// TDEE Calculator Mocks
// ============================================================================

/** Sample TDEE calculator inputs */
export const MOCK_TDEE_INPUTS = {
  male_moderate: {
    sex: "male" as const,
    age: 30,
    weight: 180, // lbs
    height: 70, // inches (5'10")
    activityLevel: "moderate" as const,
    goal: "maintain" as const,
    // Expected TDEE: ~2500-2600 kcal
  },
  female_sedentary: {
    sex: "female" as const,
    age: 28,
    weight: 140, // lbs
    height: 65, // inches (5'5")
    activityLevel: "sedentary" as const,
    goal: "lose" as const,
    // Expected TDEE: ~1600-1700 kcal, with deficit ~1300-1400
  },
  male_active: {
    sex: "male" as const,
    age: 25,
    weight: 200,
    height: 74, // 6'2"
    activityLevel: "active" as const,
    goal: "gain" as const,
    // Expected TDEE: ~3200, with surplus ~3500-3700
  },
};

// ============================================================================
// QuickPills Mocks (pre-set quick add foods)
// ============================================================================

/** Mock QuickPills for testing one-tap add */
export const MOCK_QUICK_PILLS = [
  {
    id: "qp-coffee",
    name: "Coffee",
    emoji: "☕",
    calories: 2,
    protein: 0,
    carbs: 0,
    fat: 0,
  },
  {
    id: "qp-banana",
    name: "Banana",
    emoji: "🍌",
    calories: 89,
    protein: 1,
    carbs: 23,
    fat: 0,
  },
  {
    id: "qp-eggs",
    name: "2 Eggs",
    emoji: "🥚",
    calories: 140,
    protein: 12,
    carbs: 1,
    fat: 10,
  },
  {
    id: "qp-water",
    name: "Water",
    emoji: "💧",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a mock food log entry for database seeding
 */
export function createMockFoodLogEntry(
  userId: string,
  food: UnifiedFoodResult,
  options?: {
    date?: Date;
    meal?: "breakfast" | "lunch" | "dinner" | "snacks";
    servingSize?: number;
  }
) {
  return {
    userId,
    name: food.name,
    brand: food.brand || null,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    servingSize: options?.servingSize || 1,
    servingUnit: food.servingUnit || "serving",
    meal: options?.meal || "breakfast",
    date: options?.date || new Date(),
    source: food.source,
    externalId: food.id,
    isApproximate: food.source === "AI_ESTIMATED",
  };
}

/**
 * Get all mock foods as an array for seeding
 */
export function getAllMockFoods(): UnifiedFoodResult[] {
  return [
    MOCK_CHICKEN_BREAST,
    MOCK_GREEK_YOGURT,
    MOCK_BANANA,
    MOCK_OATMEAL,
    MOCK_PROTEIN_SHAKE,
    MOCK_SALMON,
    MOCK_RICE,
    MOCK_ALMONDS,
    MOCK_BLACK_COFFEE,
  ];
}
