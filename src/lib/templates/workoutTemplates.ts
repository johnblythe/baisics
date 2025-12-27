/**
 * Warmup, cooldown, and progression templates for program generation
 *
 * These templates are used to hydrate lean AI-generated programs
 * with standard warmup/cooldown activities, reducing token usage
 * while maintaining quality.
 *
 * CONSTRAINT-AWARE: Templates respect user limitations like:
 * - no-jump: No jumping/plyometric activities
 * - no-floor: No exercises that require getting on the floor
 * - low-impact: Gentle movements only (seniors, injuries)
 */

export interface WarmupTemplate {
  duration: number; // minutes
  activities: string[];
}

export interface CooldownTemplate {
  duration: number; // minutes
  activities: string[];
}

export interface ProgressionTemplate {
  protocol: string[];
}

// User constraints that affect template selection
export interface UserConstraints {
  noJump?: boolean;      // No jumping exercises (neighbors, joints, postpartum)
  noFloor?: boolean;     // No floor exercises (seniors, mobility issues)
  lowImpact?: boolean;   // Low impact only (injuries, seniors)
  pregnant?: boolean;    // Pregnancy-safe only
  postpartum?: boolean;  // Postpartum-safe (diastasis recti awareness)
}

/**
 * Parse user profile to extract constraints
 */
export function extractConstraints(profile: {
  injuries?: string[];
  preferences?: string[];
  additionalInfo?: string;
  age?: number;
  environment?: {
    primary?: string;
    secondary?: string;
    limitations?: string[];
  };
}): UserConstraints {
  const constraints: UserConstraints = {};

  const allText = [
    ...(profile.injuries || []),
    ...(profile.preferences || []),
    ...(profile.environment?.limitations || []),
    profile.additionalInfo || '',
  ].join(' ').toLowerCase();

  // Check for no-jump constraints
  if (
    allText.includes('no jump') ||
    allText.includes('no jumping') ||
    allText.includes('neighbor') ||
    allText.includes('apartment') ||
    allText.includes('knee') ||
    allText.includes('joint') ||
    allText.includes('lower back') ||
    allText.includes('back pain') ||
    allText.includes('spine')
  ) {
    constraints.noJump = true;
  }

  // Check for no-floor constraints
  if (
    allText.includes('no floor') ||
    allText.includes('hard to get up') ||
    allText.includes('can\'t get up') ||
    allText.includes('hip replacement') ||
    allText.includes('knee replacement')
  ) {
    constraints.noFloor = true;
  }

  // Check for low-impact needs
  if (
    allText.includes('arthritis') ||
    allText.includes('senior') ||
    allText.includes('osteoporosis') ||
    (profile.age && profile.age >= 60)
  ) {
    constraints.lowImpact = true;
    constraints.noJump = true; // Low impact implies no jumping
  }

  // Check for postpartum
  if (
    allText.includes('postpartum') ||
    allText.includes('diastasis') ||
    allText.includes('post-partum') ||
    allText.includes('after pregnancy')
  ) {
    constraints.postpartum = true;
    constraints.noJump = true; // Postpartum should avoid jumping initially
  }

  // Check for pregnancy
  if (
    allText.includes('pregnant') ||
    allText.includes('pregnancy')
  ) {
    constraints.pregnant = true;
    constraints.noJump = true;
  }

  return constraints;
}

// Warmup templates by workout focus
export const WARMUP_TEMPLATES: Record<string, WarmupTemplate> = {
  lower: {
    duration: 5,
    activities: [
      'Hip circles - 10 each direction',
      'Leg swings (front/back) - 10 each leg',
      'Leg swings (side to side) - 10 each leg',
      'Bodyweight squats - 10 reps',
      'Glute bridges - 10 reps',
    ],
  },
  upper: {
    duration: 5,
    activities: [
      'Arm circles - 10 each direction',
      'Band pull-aparts - 15 reps',
      'Wall slides - 10 reps',
      'Push-up to downward dog - 5 reps',
      'Cat-cow stretches - 8 reps',
    ],
  },
  push: {
    duration: 5,
    activities: [
      'Arm circles - 10 each direction',
      'Band pull-aparts - 15 reps',
      'Scapular push-ups - 10 reps',
      'Wall slides - 10 reps',
      'Light push-ups - 10 reps',
    ],
  },
  pull: {
    duration: 5,
    activities: [
      'Arm circles - 10 each direction',
      'Band pull-aparts - 15 reps',
      'Cat-cow stretches - 8 reps',
      'Thread the needle - 5 each side',
      'Dead hangs - 20 seconds',
    ],
  },
  full: {
    duration: 5,
    activities: [
      'Jumping jacks - 30 seconds',
      'Arm circles - 10 each direction',
      'Hip circles - 10 each direction',
      'Bodyweight squats - 10 reps',
      'Push-ups - 5 reps',
    ],
  },
  cardio: {
    duration: 5,
    activities: [
      'Light jog or march in place - 2 minutes',
      'Dynamic leg swings - 10 each leg',
      'Arm swings - 30 seconds',
      'High knees - 30 seconds',
      'Butt kicks - 30 seconds',
    ],
  },
  flexibility: {
    duration: 3,
    activities: [
      'Deep breathing - 5 breaths',
      'Neck rolls - 5 each direction',
      'Shoulder rolls - 10 each direction',
      'Gentle spinal twists - 5 each side',
    ],
  },
};

// Cooldown templates by workout focus
export const COOLDOWN_TEMPLATES: Record<string, CooldownTemplate> = {
  lower: {
    duration: 5,
    activities: [
      'Pigeon pose - 30 seconds each side',
      'Lying hamstring stretch - 30 seconds each side',
      'Quad stretch - 30 seconds each side',
      'Child\'s pose - 30 seconds',
      'Deep breathing - 5 breaths',
    ],
  },
  upper: {
    duration: 5,
    activities: [
      'Chest doorway stretch - 30 seconds each side',
      'Cross-body shoulder stretch - 30 seconds each side',
      'Tricep stretch - 30 seconds each side',
      'Cat-cow stretches - 5 reps',
      'Deep breathing - 5 breaths',
    ],
  },
  push: {
    duration: 5,
    activities: [
      'Chest doorway stretch - 30 seconds each side',
      'Tricep stretch - 30 seconds each side',
      'Shoulder stretch - 30 seconds each side',
      'Child\'s pose with reach - 30 seconds',
      'Deep breathing - 5 breaths',
    ],
  },
  pull: {
    duration: 5,
    activities: [
      'Lat stretch - 30 seconds each side',
      'Bicep wall stretch - 30 seconds each side',
      'Cat-cow stretches - 5 reps',
      'Child\'s pose - 30 seconds',
      'Deep breathing - 5 breaths',
    ],
  },
  full: {
    duration: 5,
    activities: [
      'Forward fold - 30 seconds',
      'Pigeon pose - 30 seconds each side',
      'Chest stretch - 30 seconds',
      'Child\'s pose - 30 seconds',
      'Deep breathing - 5 breaths',
    ],
  },
  cardio: {
    duration: 5,
    activities: [
      'Slow walk - 2 minutes',
      'Standing quad stretch - 30 seconds each side',
      'Calf stretch - 30 seconds each side',
      'Hip flexor stretch - 30 seconds each side',
      'Deep breathing - 5 breaths',
    ],
  },
  flexibility: {
    duration: 3,
    activities: [
      'Savasana or lying rest - 1 minute',
      'Gentle spinal twist - 30 seconds each side',
      'Deep breathing - 5 breaths',
    ],
  },
};

// Progression templates by experience level
export const PROGRESSION_TEMPLATES: Record<string, ProgressionTemplate> = {
  beginner: {
    protocol: [
      'Focus on form and movement quality first',
      'When all sets feel comfortable (RPE 6-7), add 1-2 reps',
      'Once reaching top of rep range with good form, increase weight by 2.5-5 lbs',
      'If form breaks down, reduce weight and rebuild',
    ],
  },
  intermediate: {
    protocol: [
      'Week 1-2: Establish working weights at RPE 7',
      'Week 3-4: Push to RPE 8, add weight when completing all reps',
      'Add 5-10 lbs to lower body, 2.5-5 lbs to upper body when ready',
      'Deload every 4-6 weeks: reduce volume by 40-50%',
    ],
  },
  advanced: {
    protocol: [
      'Follow prescribed RPE targets for each exercise',
      'Progress weight when hitting top of rep range at target RPE',
      'Implement planned deloads every 3-4 weeks',
      'Track volume and adjust based on recovery',
    ],
  },
};

// Activity replacements for constraints
const JUMP_REPLACEMENTS: Record<string, string> = {
  'Jumping jacks - 30 seconds': 'March in place - 30 seconds',
  'High knees - 30 seconds': 'Marching high knees - 30 seconds',
  'Butt kicks - 30 seconds': 'Standing hamstring curls - 30 seconds',
};

const FLOOR_REPLACEMENTS: Record<string, string> = {
  'Pigeon pose - 30 seconds each side': 'Standing hip flexor stretch - 30 seconds each side',
  'Child\'s pose - 30 seconds': 'Standing forward fold - 30 seconds',
  'Child\'s pose with reach - 30 seconds': 'Standing side stretch - 30 seconds each side',
  'Cat-cow stretches - 8 reps': 'Standing spinal circles - 8 reps',
  'Cat-cow stretches - 5 reps': 'Standing spinal circles - 5 reps',
  'Lying hamstring stretch - 30 seconds each side': 'Standing hamstring stretch - 30 seconds each side',
  'Push-ups - 5 reps': 'Wall push-ups - 10 reps',
  'Light push-ups - 10 reps': 'Wall push-ups - 10 reps',
  'Push-up to downward dog - 5 reps': 'Wall push-ups - 5 reps',
  'Scapular push-ups - 10 reps': 'Wall scapular push-ups - 10 reps',
  'Glute bridges - 10 reps': 'Standing glute squeezes - 10 reps',
  'Forward fold - 30 seconds': 'Seated forward fold (on chair) - 30 seconds',
  'Savasana or lying rest - 1 minute': 'Seated rest with deep breathing - 1 minute',
  'Gentle spinal twist - 30 seconds each side': 'Seated spinal twist - 30 seconds each side',
  'Thread the needle - 5 each side': 'Seated thoracic rotation - 5 each side',
  'Dead hangs - 20 seconds': 'Lat stretch on wall - 20 seconds',
};

/**
 * Apply constraints to activity list
 */
function applyConstraints(activities: string[], constraints: UserConstraints): string[] {
  let result = [...activities];

  // Replace jump activities
  if (constraints.noJump) {
    result = result.map(act => JUMP_REPLACEMENTS[act] || act);
    // Also filter out any remaining jump-related activities
    result = result.filter(act =>
      !act.toLowerCase().includes('jump') &&
      !act.toLowerCase().includes('hop') &&
      !act.toLowerCase().includes('bound')
    );
  }

  // Replace floor activities
  if (constraints.noFloor) {
    result = result.map(act => FLOOR_REPLACEMENTS[act] || act);
    // Filter out any remaining floor activities
    result = result.filter(act =>
      !act.toLowerCase().includes('lying') &&
      !act.toLowerCase().includes('plank') &&
      !act.toLowerCase().includes('floor') &&
      !act.toLowerCase().includes('ground')
    );
  }

  // Low impact - remove any remaining high-intensity activities
  if (constraints.lowImpact) {
    result = result.filter(act =>
      !act.toLowerCase().includes('explosive') &&
      !act.toLowerCase().includes('sprint') &&
      !act.toLowerCase().includes('burpee')
    );
  }

  return result;
}

// Helper functions
export function getWarmupTemplate(focus: string, constraints?: UserConstraints): WarmupTemplate {
  const normalized = focus.toLowerCase();
  const template = WARMUP_TEMPLATES[normalized] || WARMUP_TEMPLATES.full;

  if (!constraints) {
    return template;
  }

  return {
    duration: template.duration,
    activities: applyConstraints(template.activities, constraints),
  };
}

export function getCooldownTemplate(focus: string, constraints?: UserConstraints): CooldownTemplate {
  const normalized = focus.toLowerCase();
  const template = COOLDOWN_TEMPLATES[normalized] || COOLDOWN_TEMPLATES.full;

  if (!constraints) {
    return template;
  }

  return {
    duration: template.duration,
    activities: applyConstraints(template.activities, constraints),
  };
}

export function getProgressionTemplate(level: string): ProgressionTemplate {
  const normalized = level.toLowerCase();
  return PROGRESSION_TEMPLATES[normalized] || PROGRESSION_TEMPLATES.intermediate;
}
