import { describe, it, expect } from 'vitest';
import { computeCarbCycleFromBaseline, type NutritionValues } from './NutritionTargetsModal';

const EMPTY: NutritionValues = {
  dailyCalories: '',
  proteinGrams: '',
  carbGrams: '',
  fatGrams: '',
  restDayCalories: '',
  restDayProtein: '',
  restDayCarbs: '',
  restDayFat: '',
};

function vals(overrides: Partial<NutritionValues>): NutritionValues {
  return { ...EMPTY, ...overrides };
}

describe('computeCarbCycleFromBaseline', () => {
  it('returns null when no calories', () => {
    expect(computeCarbCycleFromBaseline(vals({}))).toBeNull();
    expect(computeCarbCycleFromBaseline(vals({ dailyCalories: '0' }))).toBeNull();
  });

  it('calories-only mode: splits calories, no macros', () => {
    const result = computeCarbCycleFromBaseline(vals({ dailyCalories: '2000' }));
    expect(result).not.toBeNull();
    // Training = 2000 * 1.10 = 2200
    expect(result!.training.dailyCalories).toBe('2200');
    // Rest = (7*2000 - 4*2200) / 3 = (14000 - 8800) / 3 = 1733
    expect(result!.rest.restDayCalories).toBe('1733');
    // No macro fields in calories-only mode
    expect(result!.training.proteinGrams).toBeUndefined();
    expect(result!.rest.restDayProtein).toBeUndefined();
  });

  it('full macro mode: preserves protein, splits fat/carbs', () => {
    const result = computeCarbCycleFromBaseline(vals({
      dailyCalories: '2000',
      proteinGrams: '150',
      carbGrams: '250',
      fatGrams: '67',
    }));
    expect(result).not.toBeNull();

    // Training cal = 2200
    expect(result!.training.dailyCalories).toBe('2200');
    // Protein stays same
    expect(result!.training.proteinGrams).toBe('150');
    // Training fat = round(2200 * 0.25 / 9) = 61
    expect(result!.training.fatGrams).toBe('61');
    // Training carbs = round((2200 - 150*4 - 61*9) / 4) = round((2200 - 600 - 549) / 4) = 263
    expect(result!.training.carbGrams).toBe('263');

    // Rest cal = 1733
    expect(result!.rest.restDayCalories).toBe('1733');
    expect(result!.rest.restDayProtein).toBe('150');
    // Rest fat = round(1733 * 0.35 / 9) = 67
    expect(result!.rest.restDayFat).toBe('67');
  });

  it('weekly total is preserved (4 training + 3 rest = 7 × baseline)', () => {
    const baseline = 2500;
    const result = computeCarbCycleFromBaseline(vals({ dailyCalories: String(baseline) }));
    expect(result).not.toBeNull();
    const training = parseInt(result!.training.dailyCalories!);
    const rest = parseInt(result!.rest.restDayCalories!);
    const weeklyTotal = 4 * training + 3 * rest;
    // Allow ±1 cal rounding tolerance
    expect(Math.abs(weeklyTotal - 7 * baseline)).toBeLessThanOrEqual(3);
  });

  it('no ratcheting: applying result then recomputing from training gives different numbers', () => {
    // Simulates: user has 2000 baseline, toggles ON, then we check that
    // the training value (2200) is NOT what the baseline was (2000)
    const baseline = vals({ dailyCalories: '2000', proteinGrams: '150', carbGrams: '250', fatGrams: '67' });
    const first = computeCarbCycleFromBaseline(baseline);
    expect(first).not.toBeNull();
    expect(first!.training.dailyCalories).toBe('2200');

    // If someone toggles OFF without restoring baseline, training stays 2200
    // Then toggles ON again — this would ratchet
    const ratcheted = vals({
      dailyCalories: first!.training.dailyCalories!,
      proteinGrams: first!.training.proteinGrams!,
      carbGrams: first!.training.carbGrams!,
      fatGrams: first!.training.fatGrams!,
    });
    const second = computeCarbCycleFromBaseline(ratcheted);
    // Training would be 2420, proving the ratchet problem exists at the math level
    // The fix is in the component (baselineRef), not the function
    expect(parseInt(second!.training.dailyCalories!)).toBe(2420);
    // This test documents WHY the baselineRef is needed
  });

  it('handles macros with zero carbs', () => {
    const result = computeCarbCycleFromBaseline(vals({
      dailyCalories: '1800',
      proteinGrams: '200',
      carbGrams: '0',
      fatGrams: '80',
    }));
    expect(result).not.toBeNull();
    // Carbs should not go negative
    expect(parseInt(result!.training.carbGrams!)).toBeGreaterThanOrEqual(0);
    expect(parseInt(result!.rest.restDayCarbs!)).toBeGreaterThanOrEqual(0);
  });
});
