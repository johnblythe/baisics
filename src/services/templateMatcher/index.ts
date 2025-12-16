/**
 * Tool-to-Template Matching Service
 *
 * Maps tool results (macro calculator, body fat estimator) to appropriate
 * program templates for auto-assignment during claim flow.
 */

import { PROGRAM_TEMPLATES, ProgramTemplate } from '@/data/templates';

export type ToolSource = 'macro-calculator' | 'body-fat-estimator' | 'unknown';

// Macro calculator tool data structure
interface MacroToolData {
  macros: {
    targetCalories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  inputs: {
    sex: 'male' | 'female';
    age: number;
    weight: number;
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    goal: 'lose' | 'maintain' | 'gain';
  };
}

// Body fat estimator tool data structure
interface BodyFatToolData {
  estimate: {
    bodyFatPercentage: number;
    category?: string;
    sex?: 'male' | 'female';
  };
}

export interface MatchResult {
  template: ProgramTemplate;
  score: number;
  reason: string;
}

/**
 * Match tool data to best program template
 */
export function matchTemplateToToolData(
  source: ToolSource,
  toolData: Record<string, unknown> | undefined
): MatchResult | null {
  if (!toolData) {
    return getDefaultMatch();
  }

  switch (source) {
    case 'macro-calculator':
      return matchMacroData(toolData as unknown as MacroToolData);
    case 'body-fat-estimator':
      return matchBodyFatData(toolData as unknown as BodyFatToolData);
    default:
      return getDefaultMatch();
  }
}

/**
 * Match macro calculator results to template
 */
function matchMacroData(data: MacroToolData): MatchResult {
  const { inputs } = data;
  const { goal, activityLevel } = inputs;

  // Determine target category based on goal
  const targetCategories: ProgramTemplate['category'][] =
    goal === 'lose'
      ? ['general', 'athletic']
      : goal === 'gain'
        ? ['hypertrophy', 'strength']
        : ['general', 'hypertrophy'];

  // Determine target days/week based on activity level
  const targetDays = getTargetDaysPerWeek(activityLevel);

  // Determine difficulty (beginners often use calculators, so lean beginner/intermediate)
  const targetDifficulty: ProgramTemplate['difficulty'][] = ['beginner', 'intermediate'];

  // Score and rank templates
  const scored = PROGRAM_TEMPLATES.map(template => ({
    template,
    score: scoreTemplate(template, {
      categories: targetCategories,
      daysPerWeek: targetDays,
      difficulties: targetDifficulty,
      goalKeywords: getGoalKeywords(goal),
    }),
  }))
    .filter(t => t.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return getDefaultMatch();
  }

  const best = scored[0];
  const reason = buildReason(goal, activityLevel, best.template);

  return {
    template: best.template,
    score: best.score,
    reason,
  };
}

/**
 * Match body fat estimator results to template
 */
function matchBodyFatData(data: BodyFatToolData): MatchResult {
  const { estimate } = data;
  const { bodyFatPercentage, sex = 'male' } = estimate;

  // Categorize body fat level
  const isHighBf = sex === 'male' ? bodyFatPercentage > 25 : bodyFatPercentage > 32;
  const isLowBf = sex === 'male' ? bodyFatPercentage < 15 : bodyFatPercentage < 22;

  // Determine targets based on body fat
  let targetCategories: ProgramTemplate['category'][];
  let targetDifficulty: ProgramTemplate['difficulty'][];
  let goalKeywords: string[];

  if (isHighBf) {
    // Higher body fat → fat loss, conditioning, beginner-friendly
    targetCategories = ['general', 'athletic'];
    targetDifficulty = ['beginner', 'intermediate'];
    goalKeywords = ['Lose fat', 'Improve conditioning', 'body composition'];
  } else if (isLowBf) {
    // Low body fat → they're likely experienced, strength/performance focus
    targetCategories = ['strength', 'powerlifting', 'hypertrophy'];
    targetDifficulty = ['intermediate', 'advanced'];
    goalKeywords = ['Build strength', 'Build muscle', 'performance'];
  } else {
    // Medium body fat → balanced approach
    targetCategories = ['hypertrophy', 'general', 'strength'];
    targetDifficulty = ['beginner', 'intermediate'];
    goalKeywords = ['Build muscle', 'Improve aesthetics', 'Build strength'];
  }

  // Default to 4 days/week for body fat claims (reasonable middle ground)
  const targetDays = { min: 3, max: 5 };

  const scored = PROGRAM_TEMPLATES.map(template => ({
    template,
    score: scoreTemplate(template, {
      categories: targetCategories,
      daysPerWeek: targetDays,
      difficulties: targetDifficulty,
      goalKeywords,
    }),
  }))
    .filter(t => t.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return getDefaultMatch();
  }

  const best = scored[0];
  const bfCategory = isHighBf ? 'higher' : isLowBf ? 'lower' : 'healthy';
  const reason = `Based on your ${bfCategory} body fat level, we selected "${best.template.name}" - ${best.template.description.split('.')[0]}.`;

  return {
    template: best.template,
    score: best.score,
    reason,
  };
}

/**
 * Score a template based on matching criteria
 */
function scoreTemplate(
  template: ProgramTemplate,
  criteria: {
    categories: ProgramTemplate['category'][];
    daysPerWeek: { min: number; max: number };
    difficulties: ProgramTemplate['difficulty'][];
    goalKeywords: string[];
  }
): number {
  let score = 0;

  // Category match (weighted heavily)
  const categoryIndex = criteria.categories.indexOf(template.category);
  if (categoryIndex !== -1) {
    score += (criteria.categories.length - categoryIndex) * 20;
  }

  // Days per week match
  if (template.daysPerWeek >= criteria.daysPerWeek.min &&
      template.daysPerWeek <= criteria.daysPerWeek.max) {
    score += 15;
    // Bonus for hitting the middle of the range
    const mid = (criteria.daysPerWeek.min + criteria.daysPerWeek.max) / 2;
    if (Math.abs(template.daysPerWeek - mid) <= 0.5) {
      score += 5;
    }
  }

  // Difficulty match
  const diffIndex = criteria.difficulties.indexOf(template.difficulty);
  if (diffIndex !== -1) {
    score += (criteria.difficulties.length - diffIndex) * 10;
  }

  // Goal keyword matches
  const goalMatches = template.goals.filter(g =>
    criteria.goalKeywords.some(kw =>
      g.toLowerCase().includes(kw.toLowerCase()) ||
      kw.toLowerCase().includes(g.toLowerCase())
    )
  );
  score += goalMatches.length * 8;

  // Popularity bonus (slight tie-breaker)
  score += template.popularityScore / 20;

  return score;
}

/**
 * Get target days per week based on activity level
 */
function getTargetDaysPerWeek(activityLevel: string): { min: number; max: number } {
  switch (activityLevel) {
    case 'sedentary':
    case 'light':
      return { min: 3, max: 4 };
    case 'moderate':
      return { min: 3, max: 5 };
    case 'active':
      return { min: 4, max: 5 };
    case 'very_active':
      return { min: 5, max: 6 };
    default:
      return { min: 3, max: 5 };
  }
}

/**
 * Get goal keywords for matching
 */
function getGoalKeywords(goal: string): string[] {
  switch (goal) {
    case 'lose':
      return ['Lose fat', 'Improve conditioning', 'body composition', 'Preserve muscle'];
    case 'gain':
      return ['Build muscle', 'Build strength', 'muscle growth', 'hypertrophy'];
    case 'maintain':
    default:
      return ['Maintain', 'Build muscle', 'Balanced'];
  }
}

/**
 * Build human-readable reason for selection
 */
function buildReason(
  goal: string,
  activityLevel: string,
  template: ProgramTemplate
): string {
  const goalText = goal === 'lose'
    ? 'weight loss goal'
    : goal === 'gain'
      ? 'muscle-building goal'
      : 'maintenance goal';

  const activityText = activityLevel === 'very_active' || activityLevel === 'active'
    ? 'active lifestyle'
    : activityLevel === 'moderate'
      ? 'moderate activity level'
      : 'schedule';

  return `Based on your ${goalText} and ${activityText}, we selected "${template.name}" - a ${template.daysPerWeek}-day ${template.category} program perfect for getting started.`;
}

/**
 * Default match when no tool data or matching fails
 */
function getDefaultMatch(): MatchResult {
  // Default to a beginner-friendly, popular program
  const defaultTemplate = PROGRAM_TEMPLATES.find(t => t.id === 'starting-strength')
    || PROGRAM_TEMPLATES.find(t => t.difficulty === 'beginner')
    || PROGRAM_TEMPLATES[0];

  return {
    template: defaultTemplate,
    score: 50,
    reason: `We've selected "${defaultTemplate.name}" - a proven program that's perfect for getting started. You can always generate a custom program later.`,
  };
}
