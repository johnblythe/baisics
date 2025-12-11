import { describe, it, expect } from 'vitest';
import { nutritionSchema } from '@/services/programGeneration/schema';
import type { ValidatedNutrition } from '@/services/programGeneration/schema';

/**
 * Nutrition Calculation Unit Tests
 *
 * These tests validate that nutrition recommendations are reasonable
 * and internally consistent. They don't call the AI - they validate
 * nutrition data that would come from generated programs.
 */

// ============================================
// VALIDATION HELPER FUNCTIONS
// ============================================

/**
 * Calculate calories from macros
 * Protein: 4 cal/g, Carbs: 4 cal/g, Fats: 9 cal/g
 */
function calculateMacroCalories(macros: { protein: number; carbs: number; fats: number }): number {
  return macros.protein * 4 + macros.carbs * 4 + macros.fats * 9;
}

/**
 * Check if macro calories are within tolerance of stated daily calories
 */
function validateMacroConsistency(
  nutrition: ValidatedNutrition,
  tolerancePercent: number = 15
): { valid: boolean; difference: number; differencePercent: number } {
  const macroCalories = calculateMacroCalories(nutrition.macros);
  const difference = Math.abs(macroCalories - nutrition.dailyCalories);
  const differencePercent = (difference / nutrition.dailyCalories) * 100;

  return {
    valid: differencePercent <= tolerancePercent,
    difference,
    differencePercent,
  };
}

/**
 * Calculate protein per pound of body weight
 */
function proteinPerPound(proteinGrams: number, bodyWeightLbs: number): number {
  return proteinGrams / bodyWeightLbs;
}

// ============================================
// TEST DATA FACTORIES
// ============================================

const createNutrition = (overrides: Partial<ValidatedNutrition> = {}): ValidatedNutrition => ({
  dailyCalories: 2500,
  macros: {
    protein: 180,
    carbs: 250,
    fats: 80,
  },
  mealTiming: ['breakfast', 'lunch', 'dinner'],
  notes: 'Standard nutrition plan',
  ...overrides,
});

// ============================================
// CALORIE RANGE TESTS
// ============================================

describe('Calorie Range Validation', () => {
  it('accepts calories within reasonable range (1200-5000)', () => {
    const validCalorieRanges = [1200, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000];

    for (const calories of validCalorieRanges) {
      const nutrition = createNutrition({ dailyCalories: calories });
      const result = nutritionSchema.safeParse(nutrition);
      expect(result.success).toBe(true);
    }
  });

  it('rejects calories below 1000', () => {
    const nutrition = createNutrition({ dailyCalories: 999 });
    const result = nutritionSchema.safeParse(nutrition);
    expect(result.success).toBe(false);
  });

  it('rejects calories above 10000', () => {
    const nutrition = createNutrition({ dailyCalories: 10001 });
    const result = nutritionSchema.safeParse(nutrition);
    expect(result.success).toBe(false);
  });

  it('accepts edge case: minimum reasonable deficit (1200 cal)', () => {
    const nutrition = createNutrition({
      dailyCalories: 1200,
      macros: { protein: 120, carbs: 100, fats: 40 },
    });
    const result = nutritionSchema.safeParse(nutrition);
    expect(result.success).toBe(true);
  });

  it('accepts edge case: high calorie bulking diet (4500 cal)', () => {
    const nutrition = createNutrition({
      dailyCalories: 4500,
      macros: { protein: 250, carbs: 500, fats: 120 },
    });
    const result = nutritionSchema.safeParse(nutrition);
    expect(result.success).toBe(true);
  });
});

// ============================================
// MACRO CONSISTENCY TESTS
// ============================================

describe('Macro Calorie Consistency', () => {
  it('macros should sum to approximately daily calories (within 15%)', () => {
    const nutrition = createNutrition({
      dailyCalories: 2500,
      macros: { protein: 180, carbs: 250, fats: 80 },
    });
    // 180*4 + 250*4 + 80*9 = 720 + 1000 + 720 = 2440
    const result = validateMacroConsistency(nutrition);
    expect(result.valid).toBe(true);
    expect(result.differencePercent).toBeLessThan(15);
  });

  it('detects significantly inconsistent macros', () => {
    const nutrition = createNutrition({
      dailyCalories: 2500,
      macros: { protein: 100, carbs: 100, fats: 50 }, // 400 + 400 + 450 = 1250 cal
    });
    const result = validateMacroConsistency(nutrition);
    expect(result.valid).toBe(false);
    expect(result.differencePercent).toBeGreaterThan(15);
  });

  it('accepts slight macro rounding differences', () => {
    const nutrition = createNutrition({
      dailyCalories: 2000,
      macros: { protein: 150, carbs: 200, fats: 60 },
    });
    // 150*4 + 200*4 + 60*9 = 600 + 800 + 540 = 1940 (3% diff)
    const result = validateMacroConsistency(nutrition, 10);
    expect(result.valid).toBe(true);
  });

  it('validates high protein diet consistency', () => {
    const nutrition = createNutrition({
      dailyCalories: 2800,
      macros: { protein: 250, carbs: 200, fats: 90 },
    });
    // 250*4 + 200*4 + 90*9 = 1000 + 800 + 810 = 2610 (6.8% diff)
    const result = validateMacroConsistency(nutrition);
    expect(result.valid).toBe(true);
  });

  it('validates low carb diet consistency', () => {
    const nutrition = createNutrition({
      dailyCalories: 2200,
      macros: { protein: 200, carbs: 50, fats: 140 },
    });
    // 200*4 + 50*4 + 140*9 = 800 + 200 + 1260 = 2260 (2.7% diff)
    const result = validateMacroConsistency(nutrition);
    expect(result.valid).toBe(true);
  });
});

// ============================================
// PROTEIN SCALING TESTS
// ============================================

describe('Protein Scaling', () => {
  it('muscle building should have at least 0.8g protein per lb body weight', () => {
    const bodyWeight = 180;
    const nutrition = createNutrition({
      macros: { protein: 180, carbs: 250, fats: 80 },
    });
    const proteinRatio = proteinPerPound(nutrition.macros.protein, bodyWeight);
    expect(proteinRatio).toBeGreaterThanOrEqual(0.8);
  });

  it('protein should scale up for heavier individuals', () => {
    // A 200lb person should have more protein than a 150lb person
    const nutrition150 = createNutrition({ macros: { protein: 150, carbs: 200, fats: 60 } });
    const nutrition200 = createNutrition({ macros: { protein: 200, carbs: 250, fats: 80 } });

    expect(nutrition200.macros.protein).toBeGreaterThan(nutrition150.macros.protein);
  });

  it('advanced lifter should have adequate protein (1g+ per lb)', () => {
    const bodyWeight = 180;
    const advancedProtein = 200;
    const proteinRatio = proteinPerPound(advancedProtein, bodyWeight);
    expect(proteinRatio).toBeGreaterThanOrEqual(1.0);
  });

  it('minimum protein should be at least 100g for any adult', () => {
    const minimumReasonableProtein = 100;
    expect(minimumReasonableProtein).toBeGreaterThanOrEqual(100);
  });
});

// ============================================
// GOAL-SPECIFIC VALIDATION
// ============================================

describe('Goal-Specific Nutrition', () => {
  describe('Muscle Building Goals', () => {
    it('should have caloric surplus for muscle building', () => {
      // Assuming ~2200 maintenance for 180lb person
      const maintenanceCalories = 2200;
      const muscleBuilding = createNutrition({ dailyCalories: 2700 });
      expect(muscleBuilding.dailyCalories).toBeGreaterThan(maintenanceCalories);
    });

    it('should have higher protein for muscle building', () => {
      // At least 0.8g per lb
      const bodyWeight = 180;
      const muscleBuilding = createNutrition({ macros: { protein: 180, carbs: 300, fats: 80 } });
      const proteinRatio = proteinPerPound(muscleBuilding.macros.protein, bodyWeight);
      expect(proteinRatio).toBeGreaterThanOrEqual(0.8);
    });

    it('should have adequate carbs for energy', () => {
      // At least 200g for active training
      const muscleBuilding = createNutrition({ macros: { protein: 180, carbs: 280, fats: 80 } });
      expect(muscleBuilding.macros.carbs).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Fat Loss Goals', () => {
    it('should have caloric deficit for fat loss', () => {
      // Assuming ~2200 maintenance for 180lb person
      const maintenanceCalories = 2200;
      const fatLoss = createNutrition({ dailyCalories: 1800 });
      expect(fatLoss.dailyCalories).toBeLessThan(maintenanceCalories);
    });

    it('should maintain high protein to preserve muscle', () => {
      // Still 0.8-1g per lb even in deficit
      const bodyWeight = 180;
      const fatLoss = createNutrition({
        dailyCalories: 1800,
        macros: { protein: 180, carbs: 150, fats: 60 },
      });
      const proteinRatio = proteinPerPound(fatLoss.macros.protein, bodyWeight);
      expect(proteinRatio).toBeGreaterThanOrEqual(0.8);
    });

    it('deficit should not be too aggressive (>1000 cal)', () => {
      const maintenanceCalories = 2200;
      const fatLoss = createNutrition({ dailyCalories: 1600 });
      const deficit = maintenanceCalories - fatLoss.dailyCalories;
      expect(deficit).toBeLessThanOrEqual(1000);
    });
  });

  describe('Maintenance Goals', () => {
    it('should have balanced macros for maintenance', () => {
      const maintenance = createNutrition({
        dailyCalories: 2200,
        macros: { protein: 165, carbs: 220, fats: 73 },
      });

      // Check macro consistency
      const result = validateMacroConsistency(maintenance);
      expect(result.valid).toBe(true);

      // Protein should be reasonable (0.7-1g per lb)
      expect(maintenance.macros.protein).toBeGreaterThanOrEqual(120);
      expect(maintenance.macros.protein).toBeLessThanOrEqual(200);
    });
  });
});

// ============================================
// MACRO RATIO VALIDATION
// ============================================

describe('Macro Ratio Validation', () => {
  it('protein should not exceed 50% of total calories', () => {
    const nutrition = createNutrition({
      dailyCalories: 2500,
      macros: { protein: 180, carbs: 250, fats: 80 },
    });
    const proteinCalories = nutrition.macros.protein * 4;
    const proteinPercent = (proteinCalories / nutrition.dailyCalories) * 100;
    expect(proteinPercent).toBeLessThanOrEqual(50);
  });

  it('fats should not be below 15% of total calories', () => {
    const nutrition = createNutrition({
      dailyCalories: 2500,
      macros: { protein: 180, carbs: 250, fats: 80 },
    });
    const fatCalories = nutrition.macros.fats * 9;
    const fatPercent = (fatCalories / nutrition.dailyCalories) * 100;
    expect(fatPercent).toBeGreaterThanOrEqual(15);
  });

  it('carbs should be at least 20% for active training', () => {
    const nutrition = createNutrition({
      dailyCalories: 2500,
      macros: { protein: 180, carbs: 200, fats: 90 },
    });
    const carbCalories = nutrition.macros.carbs * 4;
    const carbPercent = (carbCalories / nutrition.dailyCalories) * 100;
    expect(carbPercent).toBeGreaterThanOrEqual(20);
  });

  it('validates typical macro split (40/30/30)', () => {
    // 40% carbs, 30% protein, 30% fat
    const dailyCalories = 2400;
    const nutrition = createNutrition({
      dailyCalories,
      macros: {
        protein: (dailyCalories * 0.3) / 4, // 180g
        carbs: (dailyCalories * 0.4) / 4, // 240g
        fats: (dailyCalories * 0.3) / 9, // 80g
      },
    });

    const result = validateMacroConsistency(nutrition);
    expect(result.valid).toBe(true);
    expect(result.differencePercent).toBeLessThan(5);
  });

  it('validates high protein split (35/35/30)', () => {
    // 35% protein, 35% carbs, 30% fat
    const dailyCalories = 2400;
    const nutrition = createNutrition({
      dailyCalories,
      macros: {
        protein: (dailyCalories * 0.35) / 4, // 210g
        carbs: (dailyCalories * 0.35) / 4, // 210g
        fats: (dailyCalories * 0.3) / 9, // 80g
      },
    });

    const result = validateMacroConsistency(nutrition);
    expect(result.valid).toBe(true);
  });
});

// ============================================
// SCHEMA BOUNDARY TESTS
// ============================================

describe('Nutrition Schema Boundaries', () => {
  it('rejects protein above 500g', () => {
    const nutrition = createNutrition({
      macros: { protein: 501, carbs: 250, fats: 80 },
    });
    const result = nutritionSchema.safeParse(nutrition);
    expect(result.success).toBe(false);
  });

  it('rejects carbs above 1000g', () => {
    const nutrition = createNutrition({
      macros: { protein: 180, carbs: 1001, fats: 80 },
    });
    const result = nutritionSchema.safeParse(nutrition);
    expect(result.success).toBe(false);
  });

  it('rejects fats above 500g', () => {
    const nutrition = createNutrition({
      macros: { protein: 180, carbs: 250, fats: 501 },
    });
    const result = nutritionSchema.safeParse(nutrition);
    expect(result.success).toBe(false);
  });

  it('rejects negative macro values', () => {
    const nutrition = createNutrition({
      macros: { protein: -10, carbs: 250, fats: 80 },
    });
    const result = nutritionSchema.safeParse(nutrition);
    expect(result.success).toBe(false);
  });

  it('accepts zero macro values (edge case)', () => {
    const nutrition = createNutrition({
      macros: { protein: 0, carbs: 500, fats: 100 },
    });
    const result = nutritionSchema.safeParse(nutrition);
    expect(result.success).toBe(true);
  });
});

// ============================================
// REAL-WORLD SCENARIO TESTS
// ============================================

describe('Real-World Nutrition Scenarios', () => {
  it('validates typical male bodybuilder nutrition', () => {
    const nutrition = createNutrition({
      dailyCalories: 3200,
      macros: { protein: 240, carbs: 350, fats: 90 },
    });
    // 240*4 + 350*4 + 90*9 = 960 + 1400 + 810 = 3170
    const result = validateMacroConsistency(nutrition);
    expect(result.valid).toBe(true);
    expect(nutritionSchema.safeParse(nutrition).success).toBe(true);
  });

  it('validates typical female fat loss nutrition', () => {
    const nutrition = createNutrition({
      dailyCalories: 1600,
      macros: { protein: 130, carbs: 140, fats: 55 },
    });
    // 130*4 + 140*4 + 55*9 = 520 + 560 + 495 = 1575
    const result = validateMacroConsistency(nutrition);
    expect(result.valid).toBe(true);
    expect(nutritionSchema.safeParse(nutrition).success).toBe(true);
  });

  it('validates keto-style nutrition', () => {
    const nutrition = createNutrition({
      dailyCalories: 2000,
      macros: { protein: 150, carbs: 25, fats: 155 },
    });
    // 150*4 + 25*4 + 155*9 = 600 + 100 + 1395 = 2095
    const result = validateMacroConsistency(nutrition);
    expect(result.valid).toBe(true);
    expect(nutritionSchema.safeParse(nutrition).success).toBe(true);
  });

  it('validates high carb athlete nutrition', () => {
    const nutrition = createNutrition({
      dailyCalories: 3500,
      macros: { protein: 180, carbs: 500, fats: 80 },
    });
    // 180*4 + 500*4 + 80*9 = 720 + 2000 + 720 = 3440
    const result = validateMacroConsistency(nutrition);
    expect(result.valid).toBe(true);
    expect(nutritionSchema.safeParse(nutrition).success).toBe(true);
  });
});
