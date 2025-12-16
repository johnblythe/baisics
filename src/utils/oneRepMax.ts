/**
 * One Rep Max (1RM) calculation utilities
 *
 * Supports multiple formulas:
 * - Epley (default, most commonly used)
 * - Brzycki (accurate for lower rep ranges)
 * - Lombardi (simple power formula)
 * - Mayhew (researched on college athletes)
 * - O'Conner (simpler variant)
 */

export type OneRMFormula = 'epley' | 'brzycki' | 'lombardi' | 'mayhew' | 'oconner';

export interface OneRMInput {
  weight: number;       // Weight lifted
  reps: number;         // Reps performed (should be 1-12 for accuracy)
  exercise?: string;    // Optional exercise name for context
}

export interface OneRMResult {
  oneRepMax: number;
  formula: OneRMFormula;
}

export interface AllFormulasResult {
  epley: number;
  brzycki: number;
  lombardi: number;
  mayhew: number;
  oconner: number;
  average: number;
}

export interface PercentageChartRow {
  percentage: number;
  weight: number;
  reps: string;         // Typical rep range for this percentage
}

// Common exercises for 1RM calculation
export const COMMON_EXERCISES = [
  { value: 'bench', label: 'Bench Press' },
  { value: 'squat', label: 'Back Squat' },
  { value: 'deadlift', label: 'Deadlift' },
  { value: 'overhead', label: 'Overhead Press' },
  { value: 'row', label: 'Barbell Row' },
  { value: 'other', label: 'Other' },
] as const;

/**
 * Epley Formula (1985)
 * 1RM = weight × (1 + reps/30)
 * Most commonly used, good for moderate rep ranges
 */
function calculateEpley(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

/**
 * Brzycki Formula (1993)
 * 1RM = weight × (36 / (37 - reps))
 * Accurate for rep ranges 1-10, tends to underestimate at higher reps
 */
function calculateBrzycki(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps >= 37) return weight * 2; // Cap for safety
  return weight * (36 / (37 - reps));
}

/**
 * Lombardi Formula
 * 1RM = weight × reps^0.10
 * Simple power formula, tends to be lower than others
 */
function calculateLombardi(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * Math.pow(reps, 0.10);
}

/**
 * Mayhew Formula
 * 1RM = (100 × weight) / (52.2 + 41.9 × e^(-0.055 × reps))
 * Developed from research on college football players
 */
function calculateMayhew(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return (100 * weight) / (52.2 + 41.9 * Math.exp(-0.055 * reps));
}

/**
 * O'Conner Formula
 * 1RM = weight × (1 + reps/40)
 * Simpler variant, tends to give lower estimates
 */
function calculateOConner(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * (1 + reps / 40);
}

/**
 * Calculate 1RM using a specific formula
 */
export function calculate1RM(input: OneRMInput, formula: OneRMFormula = 'epley'): OneRMResult {
  const { weight, reps } = input;

  let oneRepMax: number;

  switch (formula) {
    case 'epley':
      oneRepMax = calculateEpley(weight, reps);
      break;
    case 'brzycki':
      oneRepMax = calculateBrzycki(weight, reps);
      break;
    case 'lombardi':
      oneRepMax = calculateLombardi(weight, reps);
      break;
    case 'mayhew':
      oneRepMax = calculateMayhew(weight, reps);
      break;
    case 'oconner':
      oneRepMax = calculateOConner(weight, reps);
      break;
    default:
      oneRepMax = calculateEpley(weight, reps);
  }

  return {
    oneRepMax: Math.round(oneRepMax),
    formula,
  };
}

/**
 * Calculate 1RM using all formulas for comparison
 */
export function calculateAllFormulas(input: OneRMInput): AllFormulasResult {
  const { weight, reps } = input;

  const results = {
    epley: Math.round(calculateEpley(weight, reps)),
    brzycki: Math.round(calculateBrzycki(weight, reps)),
    lombardi: Math.round(calculateLombardi(weight, reps)),
    mayhew: Math.round(calculateMayhew(weight, reps)),
    oconner: Math.round(calculateOConner(weight, reps)),
  };

  const values = Object.values(results);
  const average = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

  return {
    ...results,
    average,
  };
}

/**
 * Generate a percentage chart from a 1RM
 * Shows weight and typical rep ranges at each percentage
 */
export function generatePercentageChart(oneRepMax: number): PercentageChartRow[] {
  const percentages = [
    { pct: 100, reps: '1' },
    { pct: 95, reps: '2' },
    { pct: 90, reps: '3-4' },
    { pct: 85, reps: '5-6' },
    { pct: 80, reps: '7-8' },
    { pct: 75, reps: '9-10' },
    { pct: 70, reps: '11-12' },
    { pct: 65, reps: '13-15' },
    { pct: 60, reps: '16-20' },
    { pct: 55, reps: '20+' },
    { pct: 50, reps: '25+' },
  ];

  return percentages.map(({ pct, reps }) => ({
    percentage: pct,
    weight: Math.round(oneRepMax * (pct / 100)),
    reps,
  }));
}

// Formula descriptions for UI
export const FORMULA_INFO: Record<OneRMFormula, { name: string; description: string; accuracy: string }> = {
  epley: {
    name: 'Epley',
    description: '1RM = weight × (1 + reps/30)',
    accuracy: 'Most commonly used, good all-around formula'
  },
  brzycki: {
    name: 'Brzycki',
    description: '1RM = weight × 36/(37 - reps)',
    accuracy: 'Most accurate for 1-10 reps'
  },
  lombardi: {
    name: 'Lombardi',
    description: '1RM = weight × reps^0.10',
    accuracy: 'Tends to give lower estimates'
  },
  mayhew: {
    name: 'Mayhew',
    description: 'Exponential formula from college athlete research',
    accuracy: 'Good for athletic populations'
  },
  oconner: {
    name: "O'Conner",
    description: '1RM = weight × (1 + reps/40)',
    accuracy: 'Conservative estimates'
  },
};

// Rep range recommendations
export const REP_RECOMMENDATIONS = {
  warning: 'For best accuracy, use a weight you can lift for 1-10 reps. Higher rep sets become less accurate.',
  optimal: '1-6 reps: Most accurate estimates',
  acceptable: '7-10 reps: Good estimates',
  lessAccurate: '11+ reps: Estimates may vary more between formulas',
};
