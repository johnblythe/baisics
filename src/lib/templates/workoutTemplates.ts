/**
 * Warmup, cooldown, and progression templates for program generation
 *
 * These templates are used to hydrate lean AI-generated programs
 * with standard warmup/cooldown activities, reducing token usage
 * while maintaining quality.
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

// Helper functions
export function getWarmupTemplate(focus: string): WarmupTemplate {
  const normalized = focus.toLowerCase();
  return WARMUP_TEMPLATES[normalized] || WARMUP_TEMPLATES.full;
}

export function getCooldownTemplate(focus: string): CooldownTemplate {
  const normalized = focus.toLowerCase();
  return COOLDOWN_TEMPLATES[normalized] || COOLDOWN_TEMPLATES.full;
}

export function getProgressionTemplate(level: string): ProgressionTemplate {
  const normalized = level.toLowerCase();
  return PROGRESSION_TEMPLATES[normalized] || PROGRESSION_TEMPLATES.intermediate;
}
