/**
 * Macro calculation utilities
 *
 * Supports multiple BMR formulas:
 * - Mifflin-St Jeor (default, most accurate for most people)
 * - Harris-Benedict (revised 1984, traditional)
 */

export type Sex = 'male' | 'female';
export type Goal = 'lose' | 'maintain' | 'gain';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type FormulaType = 'mifflin' | 'harris';

export interface MacroInput {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: Sex;
  activityLevel: ActivityLevel;
  goal: Goal;
  formula?: FormulaType;
}

export interface MacroResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  formula: FormulaType;
}

// Activity multipliers (PAL - Physical Activity Level)
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,      // Little/no exercise, desk job
  light: 1.375,        // Light exercise 1-3 days/week
  moderate: 1.55,      // Moderate exercise 3-5 days/week
  active: 1.725,       // Hard exercise 6-7 days/week
  very_active: 1.9,    // Very hard exercise, physical job
};

// Goal caloric adjustments
const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  lose: -500,     // ~1 lb/week deficit
  maintain: 0,
  gain: 300,      // Lean bulk surplus
};

/**
 * Mifflin-St Jeor BMR Formula (1990)
 * Generally considered most accurate for most populations
 *
 * Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5
 * Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) - 161
 */
function calculateMifflinBMR(weightKg: number, heightCm: number, age: number, sex: Sex): number {
  const base = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  return sex === 'male' ? base + 5 : base - 161;
}

/**
 * Harris-Benedict BMR Formula (Revised 1984)
 * Traditional formula, slightly less accurate but widely used
 *
 * Men: BMR = (13.397 × weight in kg) + (4.799 × height in cm) - (5.677 × age) + 88.362
 * Women: BMR = (9.247 × weight in kg) + (3.098 × height in cm) - (4.330 × age) + 447.593
 */
function calculateHarrisBMR(weightKg: number, heightCm: number, age: number, sex: Sex): number {
  if (sex === 'male') {
    return (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age) + 88.362;
  }
  return (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age) + 447.593;
}

/**
 * Calculate macros based on input parameters
 */
export function calculateMacros(input: MacroInput): MacroResult {
  const { weightKg, heightCm, age, sex, activityLevel, goal, formula = 'mifflin' } = input;

  // Calculate BMR based on selected formula
  const bmr = formula === 'mifflin'
    ? calculateMifflinBMR(weightKg, heightCm, age, sex)
    : calculateHarrisBMR(weightKg, heightCm, age, sex);

  // Calculate TDEE
  const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel];

  // Apply goal adjustment
  const targetCalories = Math.round(tdee + GOAL_ADJUSTMENTS[goal]);

  // Calculate macros
  // Protein: 0.8-1g per lb bodyweight for active individuals (using 0.9g/lb)
  const weightLbs = weightKg * 2.205;
  const protein = Math.round(weightLbs * 0.9);

  // Fat: 25-30% of calories (using 27%)
  const fatCalories = targetCalories * 0.27;
  const fats = Math.round(fatCalories / 9);

  // Carbs: remainder
  const proteinCalories = protein * 4;
  const carbCalories = targetCalories - proteinCalories - fatCalories;
  const carbs = Math.round(carbCalories / 4);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories,
    protein,
    carbs,
    fats,
    formula,
  };
}

// Helper: convert lbs to kg
export function lbsToKg(lbs: number): number {
  return lbs / 2.205;
}

// Helper: convert feet/inches to cm
export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54;
}

// Activity level labels for UI
export const ACTIVITY_LABELS: Record<ActivityLevel, { label: string; description: string }> = {
  sedentary: { label: 'Sedentary', description: 'Little/no exercise, desk job' },
  light: { label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
  moderate: { label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
  active: { label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
  very_active: { label: 'Extremely Active', description: 'Very hard exercise, physical job' },
};

// Goal labels for UI
export const GOAL_LABELS: Record<Goal, { label: string; description: string }> = {
  lose: { label: 'Lose Weight', description: '~1 lb/week deficit' },
  maintain: { label: 'Maintain Weight', description: 'Stay at current weight' },
  gain: { label: 'Build Muscle', description: 'Lean bulk surplus' },
};
