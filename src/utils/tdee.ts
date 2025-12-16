/**
 * TDEE (Total Daily Energy Expenditure) calculation utilities
 *
 * Supports multiple BMR formulas:
 * - Mifflin-St Jeor (default, most accurate for most people)
 * - Harris-Benedict (revised 1984, traditional)
 * - Katch-McArdle (requires body fat %, most accurate when BF is known)
 */

export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type TDEEFormula = 'mifflin' | 'harris' | 'katch';

export interface TDEEInput {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: Sex;
  activityLevel: ActivityLevel;
  bodyFatPercent?: number; // Required for Katch-McArdle
}

export interface TDEEResult {
  bmr: number;
  tdee: number;
  cutCalories: number;    // -500 deficit
  maintainCalories: number;
  bulkCalories: number;   // +300 surplus
  formula: TDEEFormula;
}

export interface AllFormulasResult {
  mifflin: TDEEResult;
  harris: TDEEResult;
  katch?: TDEEResult; // Only if body fat % provided
}

// Activity multipliers (PAL - Physical Activity Level)
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,      // Little/no exercise, desk job
  light: 1.375,        // Light exercise 1-3 days/week
  moderate: 1.55,      // Moderate exercise 3-5 days/week
  active: 1.725,       // Hard exercise 6-7 days/week
  very_active: 1.9,    // Very hard exercise, physical job
};

// Activity level labels for UI
export const ACTIVITY_LABELS: Record<ActivityLevel, { label: string; description: string; examples: string }> = {
  sedentary: {
    label: 'Sedentary',
    description: 'Little to no exercise',
    examples: 'Desk job, minimal walking'
  },
  light: {
    label: 'Lightly Active',
    description: 'Light exercise 1-3 days/week',
    examples: 'Walking, light yoga, casual sports'
  },
  moderate: {
    label: 'Moderately Active',
    description: 'Moderate exercise 3-5 days/week',
    examples: '30-60 min sessions, jogging, swimming'
  },
  active: {
    label: 'Very Active',
    description: 'Hard exercise 6-7 days/week',
    examples: 'Intense gym sessions, sports practice'
  },
  very_active: {
    label: 'Extremely Active',
    description: 'Very hard daily exercise or physical job',
    examples: 'Athletes, construction workers, 2x/day training'
  },
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
 * Katch-McArdle BMR Formula
 * Most accurate when body fat percentage is known
 * Uses Lean Body Mass (LBM) instead of total weight
 *
 * BMR = 370 + (21.6 × LBM in kg)
 * where LBM = weight × (1 - body fat %)
 */
function calculateKatchBMR(weightKg: number, bodyFatPercent: number): number {
  const leanBodyMass = weightKg * (1 - bodyFatPercent / 100);
  return 370 + (21.6 * leanBodyMass);
}

/**
 * Calculate TDEE using a specific formula
 */
export function calculateTDEE(input: TDEEInput, formula: TDEEFormula = 'mifflin'): TDEEResult {
  const { weightKg, heightCm, age, sex, activityLevel, bodyFatPercent } = input;

  let bmr: number;

  switch (formula) {
    case 'mifflin':
      bmr = calculateMifflinBMR(weightKg, heightCm, age, sex);
      break;
    case 'harris':
      bmr = calculateHarrisBMR(weightKg, heightCm, age, sex);
      break;
    case 'katch':
      if (bodyFatPercent === undefined) {
        throw new Error('Body fat percentage required for Katch-McArdle formula');
      }
      bmr = calculateKatchBMR(weightKg, bodyFatPercent);
      break;
    default:
      bmr = calculateMifflinBMR(weightKg, heightCm, age, sex);
  }

  const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel];

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    cutCalories: Math.round(tdee - 500),
    maintainCalories: Math.round(tdee),
    bulkCalories: Math.round(tdee + 300),
    formula,
  };
}

/**
 * Calculate TDEE using all available formulas for comparison
 */
export function calculateAllFormulas(input: TDEEInput): AllFormulasResult {
  const result: AllFormulasResult = {
    mifflin: calculateTDEE(input, 'mifflin'),
    harris: calculateTDEE(input, 'harris'),
  };

  if (input.bodyFatPercent !== undefined) {
    result.katch = calculateTDEE(input, 'katch');
  }

  return result;
}

// Helper: convert lbs to kg
export function lbsToKg(lbs: number): number {
  return lbs / 2.205;
}

// Helper: convert feet/inches to cm
export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54;
}

// Formula descriptions for UI
export const FORMULA_INFO: Record<TDEEFormula, { name: string; description: string; bestFor: string }> = {
  mifflin: {
    name: 'Mifflin-St Jeor',
    description: 'Uses weight, height, age, and sex. Most validated formula for modern populations.',
    bestFor: 'Most people (default)'
  },
  harris: {
    name: 'Harris-Benedict',
    description: 'Classic formula from 1919, revised in 1984. Uses weight, height, age, and sex.',
    bestFor: 'Traditional/comparison purposes'
  },
  katch: {
    name: 'Katch-McArdle',
    description: 'Uses lean body mass instead of total weight. Requires body fat percentage.',
    bestFor: 'Athletes and those who know their body fat %'
  },
};
