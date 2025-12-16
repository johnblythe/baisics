/**
 * Body Fat Estimation utilities
 *
 * Supports two modes:
 * - AI photo analysis (vision model)
 * - Visual comparison chart (manual selection)
 */

export type Sex = 'male' | 'female';

export interface BodyFatEstimate {
  lowEstimate: number;
  highEstimate: number;
  midpoint: number;
  confidence: 'low' | 'medium' | 'high';
  category: BodyFatCategory;
  recommendation: GoalRecommendation;
}

export type BodyFatCategory =
  | 'essential'
  | 'athletic'
  | 'fitness'
  | 'average'
  | 'above_average'
  | 'obese';

export type GoalRecommendation = 'cut' | 'maintain' | 'bulk' | 'recomp';

export interface ReferenceRange {
  min: number;
  max: number;
  category: BodyFatCategory;
  label: string;
  description: string;
}

// Body fat reference ranges by sex
export const BODY_FAT_RANGES: Record<Sex, ReferenceRange[]> = {
  male: [
    { min: 2, max: 5, category: 'essential', label: 'Essential Fat', description: 'Competition bodybuilders, unsustainable long-term' },
    { min: 6, max: 13, category: 'athletic', label: 'Athletic', description: 'Visible abs, very lean, athletes and fitness models' },
    { min: 14, max: 17, category: 'fitness', label: 'Fitness', description: 'Some ab definition, lean and fit appearance' },
    { min: 18, max: 24, category: 'average', label: 'Average', description: 'Healthy range for most men, soft midsection' },
    { min: 25, max: 31, category: 'above_average', label: 'Above Average', description: 'Noticeable fat around waist, health risks increase' },
    { min: 32, max: 50, category: 'obese', label: 'Obese', description: 'High health risk, significant fat accumulation' },
  ],
  female: [
    { min: 10, max: 13, category: 'essential', label: 'Essential Fat', description: 'Competition level, may affect hormones' },
    { min: 14, max: 20, category: 'athletic', label: 'Athletic', description: 'Very lean, athletes and fitness competitors' },
    { min: 21, max: 24, category: 'fitness', label: 'Fitness', description: 'Toned appearance, fit and healthy' },
    { min: 25, max: 31, category: 'average', label: 'Average', description: 'Healthy range for most women' },
    { min: 32, max: 39, category: 'above_average', label: 'Above Average', description: 'Health risks begin to increase' },
    { min: 40, max: 50, category: 'obese', label: 'Obese', description: 'High health risk, significant fat accumulation' },
  ],
};

// Visual comparison chart data
export interface VisualReference {
  range: string;
  min: number;
  max: number;
  description: string;
  visualCues: string[];
}

export const VISUAL_REFERENCES: Record<Sex, VisualReference[]> = {
  male: [
    {
      range: '6-9%',
      min: 6,
      max: 9,
      description: 'Competition lean',
      visualCues: ['Extreme vascularity', 'Striations visible', 'All abs clearly defined', 'Very little subcutaneous fat'],
    },
    {
      range: '10-14%',
      min: 10,
      max: 14,
      description: 'Athletic/Beach ready',
      visualCues: ['Visible abs (especially upper)', 'Some vascularity in arms', 'Muscle separation visible', 'V-taper noticeable'],
    },
    {
      range: '15-19%',
      min: 15,
      max: 19,
      description: 'Fit',
      visualCues: ['Faint ab outline possible', 'Some muscle definition', 'Soft midsection', 'Face appears lean'],
    },
    {
      range: '20-24%',
      min: 20,
      max: 24,
      description: 'Average',
      visualCues: ['No visible abs', 'Waist wider than hips', 'Some belly fat', 'Arms still have some shape'],
    },
    {
      range: '25-29%',
      min: 25,
      max: 29,
      description: 'Above average',
      visualCues: ['Noticeable belly', 'Fat around waist', 'Little muscle definition', 'Rounder face'],
    },
    {
      range: '30%+',
      min: 30,
      max: 50,
      description: 'High',
      visualCues: ['Significant belly', 'Fat deposits on chest', 'No muscle definition', 'Round midsection'],
    },
  ],
  female: [
    {
      range: '14-17%',
      min: 14,
      max: 17,
      description: 'Competition lean',
      visualCues: ['Very defined muscles', 'Visible abs', 'Low fat on hips/thighs', 'May affect menstruation'],
    },
    {
      range: '18-22%',
      min: 18,
      max: 22,
      description: 'Athletic/Fit',
      visualCues: ['Some ab definition', 'Toned arms and legs', 'Moderate curves', 'Athletic appearance'],
    },
    {
      range: '23-27%',
      min: 23,
      max: 27,
      description: 'Fit/Healthy',
      visualCues: ['Soft muscle definition', 'Natural curves', 'Healthy appearance', 'Slight belly softness'],
    },
    {
      range: '28-32%',
      min: 28,
      max: 32,
      description: 'Average',
      visualCues: ['Curvy figure', 'Soft midsection', 'Fuller hips/thighs', 'No muscle definition'],
    },
    {
      range: '33-37%',
      min: 33,
      max: 37,
      description: 'Above average',
      visualCues: ['Noticeable belly', 'Wider hips', 'Rounder face', 'Fat distribution in typical female pattern'],
    },
    {
      range: '38%+',
      min: 38,
      max: 50,
      description: 'High',
      visualCues: ['Significant fat accumulation', 'Round midsection', 'Health risks elevated', 'Very soft appearance'],
    },
  ],
};

/**
 * Get the body fat category for a given percentage and sex
 */
export function getBodyFatCategory(percentage: number, sex: Sex): ReferenceRange | null {
  const ranges = BODY_FAT_RANGES[sex];
  return ranges.find(r => percentage >= r.min && percentage <= r.max) || null;
}

/**
 * Get goal recommendation based on body fat percentage and sex
 */
export function getGoalRecommendation(percentage: number, sex: Sex): GoalRecommendation {
  const athleticMax = sex === 'male' ? 13 : 20;
  const fitnessMax = sex === 'male' ? 17 : 24;
  const averageMax = sex === 'male' ? 24 : 31;

  if (percentage <= athleticMax) {
    return 'maintain'; // Already lean, maintain or slow bulk
  } else if (percentage <= fitnessMax) {
    return 'recomp'; // Good position for body recomposition
  } else if (percentage <= averageMax) {
    return 'cut'; // Would benefit from cutting
  } else {
    return 'cut'; // Focus on fat loss for health
  }
}

/**
 * Create a body fat estimate from low/high values
 */
export function createEstimate(lowEstimate: number, highEstimate: number, sex: Sex, confidence: 'low' | 'medium' | 'high' = 'medium'): BodyFatEstimate {
  const midpoint = Math.round((lowEstimate + highEstimate) / 2);
  const category = getBodyFatCategory(midpoint, sex)?.category || 'average';
  const recommendation = getGoalRecommendation(midpoint, sex);

  return {
    lowEstimate,
    highEstimate,
    midpoint,
    confidence,
    category,
    recommendation,
  };
}

/**
 * Generate personalized CTA copy based on body fat estimate
 */
export function generateCTACopy(estimate: BodyFatEstimate, sex: Sex): { headline: string; subtext: string; buttonText: string } {
  const { midpoint, recommendation } = estimate;
  const targetBf = sex === 'male' ? 12 : 20;

  switch (recommendation) {
    case 'cut':
      const deficit = midpoint - targetBf;
      return {
        headline: 'Ready to get lean?',
        subtext: `Your personalized program: ${midpoint}% → ${targetBf}% target`,
        buttonText: 'Get My Cutting Program →',
      };
    case 'bulk':
      return {
        headline: 'Time to build muscle',
        subtext: `You're lean enough to bulk. Let's add some size.`,
        buttonText: 'Get My Bulking Program →',
      };
    case 'recomp':
      return {
        headline: 'Perfect position for a recomp',
        subtext: `Build muscle while losing fat with the right program.`,
        buttonText: 'Get My Recomp Program →',
      };
    case 'maintain':
    default:
      return {
        headline: "You're in great shape",
        subtext: `Let's dial in your training to maintain or optimize.`,
        buttonText: 'Optimize My Program →',
      };
  }
}

// AI Analysis prompt template
export const BODY_FAT_ANALYSIS_PROMPT = `Analyze this physique photo and estimate body fat percentage.

Provide your response as JSON with these exact keys:
{
  "bodyFatPercentageLow": number,
  "bodyFatPercentageHigh": number,
  "confidence": "low" | "medium" | "high",
  "reasoning": string,
  "error": string | null
}

Guidelines:
- Give a realistic range (e.g., 15-18%, not 15-25%)
- "low" confidence: poor lighting, baggy clothes, partial view
- "medium" confidence: decent photo, clear view of torso
- "high" confidence: well-lit, clear full or upper body shot
- error: describe issues preventing accurate analysis (null if no issues)

Do not include any other text. Answer only in JSON format.`;
