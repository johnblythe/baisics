/**
 * Program Enrichment Service
 *
 * Hydrates slim AI-generated programs into full programs by:
 * - Looking up exercise details from ExerciseLibrary
 * - Applying warmup/cooldown templates
 * - Adding progression protocols
 * - Filling in standard metadata
 *
 * This is the key to lean generation - AI decides, DB provides details.
 */

import { prisma } from '@/lib/prisma';
import type { ExerciseTier } from '@prisma/client';
import type {
  SlimProgram,
  SlimPhase,
  SlimWorkout,
  SlimExercise,
} from './leanTypes';
import type {
  GeneratedProgram,
  GeneratedPhase,
  GeneratedWorkout,
  GeneratedExercise,
  GeneratedNutrition,
  UserProfile,
} from './types';
import {
  getWarmupTemplate,
  getCooldownTemplate,
  getProgressionTemplate,
} from '@/lib/templates/workoutTemplates';

// ============================================
// EXERCISE LOOKUP
// ============================================

interface ExerciseDetails {
  id: string;
  name: string;
  instructions: string[];
  equipment: string[];
  defaultTier: ExerciseTier;
  isCompound: boolean;
}

// Cache for exercise lookups within a single enrichment
let exerciseCache: Map<string, ExerciseDetails> | null = null;

async function loadExerciseCache(): Promise<Map<string, ExerciseDetails>> {
  if (exerciseCache) return exerciseCache;

  const exercises = await prisma.exerciseLibrary.findMany({
    select: {
      id: true,
      name: true,
      instructions: true,
      equipment: true,
      defaultTier: true,
      isCompound: true,
    },
  });

  exerciseCache = new Map();
  for (const exercise of exercises) {
    // Index by normalized name (slug-like)
    const key = exercise.name.toLowerCase().replace(/\s+/g, '-');
    exerciseCache.set(key, exercise);

    // Also index by original name
    exerciseCache.set(exercise.name.toLowerCase(), exercise);
  }

  return exerciseCache;
}

function clearExerciseCache(): void {
  exerciseCache = null;
}

async function lookupExercise(slug: string): Promise<ExerciseDetails | null> {
  const cache = await loadExerciseCache();

  // Try exact match first
  const normalized = slug.toLowerCase().replace(/\s+/g, '-');
  if (cache.has(normalized)) {
    return cache.get(normalized)!;
  }

  // Try without hyphens
  const withSpaces = slug.toLowerCase().replace(/-/g, ' ');
  if (cache.has(withSpaces)) {
    return cache.get(withSpaces)!;
  }

  // Fuzzy match - find closest
  for (const [key, exercise] of cache.entries()) {
    if (key.includes(normalized) || normalized.includes(key)) {
      return exercise;
    }
  }

  return null;
}

/**
 * Get alternatives for an exercise from variations relation
 */
async function getExerciseAlternatives(exerciseId: string): Promise<string[]> {
  const exercise = await prisma.exerciseLibrary.findUnique({
    where: { id: exerciseId },
    include: {
      variations: {
        select: { name: true },
        take: 3,
      },
    },
  });

  if (!exercise?.variations.length) {
    return [];
  }

  return exercise.variations.map(v => v.name);
}

// ============================================
// TIER TO CATEGORY MAPPING
// ============================================

function tierToCategory(tier: ExerciseTier | 1 | 2 | 3): 'primary' | 'secondary' | 'isolation' {
  if (tier === 'TIER_1' || tier === 1) return 'primary';
  if (tier === 'TIER_2' || tier === 2) return 'secondary';
  return 'isolation';
}

// ============================================
// ENRICHMENT FUNCTIONS
// ============================================

/**
 * Enrich a slim exercise into a full GeneratedExercise
 */
async function enrichExercise(
  slim: SlimExercise,
  fallbackCategory: 'primary' | 'secondary' | 'isolation' = 'secondary'
): Promise<GeneratedExercise> {
  const details = await lookupExercise(slim.slug);

  if (!details) {
    // Exercise not found - create minimal entry
    console.warn(`Exercise not found: ${slim.slug}`);
    return {
      name: slim.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      sets: slim.sets,
      measure: slim.reps
        ? { type: 'reps', value: slim.reps }
        : { type: 'time', value: slim.duration || 30, unit: 'seconds' },
      restPeriod: slim.rpe && slim.rpe >= 8 ? 180 : slim.rpe && slim.rpe >= 6 ? 90 : 60,
      equipment: [],
      alternatives: [],
      category: slim.tierOverride ? tierToCategory(slim.tierOverride) : fallbackCategory,
      intensity: slim.rpe ? `RPE ${slim.rpe}` : undefined,
      notes: slim.notes,
      instructions: [],
    };
  }

  // Get alternatives
  const alternatives = await getExerciseAlternatives(details.id);

  // Calculate rest period based on RPE and exercise type
  let restPeriod = 60;
  if (details.isCompound) {
    restPeriod = slim.rpe && slim.rpe >= 8 ? 180 : 120;
  } else {
    restPeriod = slim.rpe && slim.rpe >= 8 ? 90 : 60;
  }

  return {
    name: details.name,
    sets: slim.sets,
    measure: slim.reps
      ? { type: 'reps', value: slim.reps }
      : { type: 'time', value: slim.duration || 30, unit: 'seconds' },
    restPeriod,
    equipment: details.equipment,
    alternatives,
    category: slim.tierOverride
      ? tierToCategory(slim.tierOverride)
      : tierToCategory(details.defaultTier),
    intensity: slim.rpe ? `RPE ${slim.rpe}` : undefined,
    notes: slim.notes,
    instructions: details.instructions.slice(0, 3), // Max 3 instructions
  };
}

/**
 * Enrich a slim workout into a full GeneratedWorkout
 */
async function enrichWorkout(
  slim: SlimWorkout,
  dayNumber: number
): Promise<GeneratedWorkout> {
  // Get templates based on focus area
  const warmup = getWarmupTemplate(slim.focusArea);
  const cooldown = getCooldownTemplate(slim.focusArea);

  // Enrich exercises
  const exercises: GeneratedExercise[] = [];
  for (let i = 0; i < slim.exercises.length; i++) {
    const slimExercise = slim.exercises[i];
    // Determine fallback category based on position
    const fallbackCategory: 'primary' | 'secondary' | 'isolation' =
      i < 2 ? 'primary' : i < 4 ? 'secondary' : 'isolation';

    const enriched = await enrichExercise(slimExercise, fallbackCategory);
    exercises.push(enriched);
  }

  // Sort by category to ensure correct order
  const categoryOrder = { primary: 0, secondary: 1, isolation: 2, cardio: 3, flexibility: 4 };
  exercises.sort((a, b) => categoryOrder[a.category] - categoryOrder[b.category]);

  return {
    dayNumber,
    name: slim.name,
    focus: slim.focusArea,
    warmup: {
      duration: warmup.duration,
      activities: warmup.activities,
    },
    cooldown: {
      duration: cooldown.duration,
      activities: cooldown.activities,
    },
    exercises,
  };
}

/**
 * Enrich slim nutrition into full GeneratedNutrition
 */
function enrichNutrition(slim: { calories: number; protein: number; carbs: number; fats: number; notes?: string }): GeneratedNutrition {
  return {
    dailyCalories: slim.calories,
    macros: {
      protein: slim.protein,
      carbs: slim.carbs,
      fats: slim.fats,
    },
    mealTiming: [
      'Eat protein with each meal (25-40g)',
      'Pre-workout: Light meal 1-2 hours before',
      'Post-workout: Protein + carbs within 2 hours',
    ],
    notes: slim.notes,
  };
}

/**
 * Enrich a slim phase into a full GeneratedPhase
 */
async function enrichPhase(
  slim: SlimPhase,
  phaseNumber: number,
  experienceLevel: string
): Promise<GeneratedPhase> {
  // Enrich workouts
  const workouts: GeneratedWorkout[] = [];
  for (let i = 0; i < slim.workouts.length; i++) {
    const enriched = await enrichWorkout(slim.workouts[i], i + 1);
    workouts.push(enriched);
  }

  // Get progression template
  const progression = getProgressionTemplate(experienceLevel);

  // Generate phase metadata
  const expectations = phaseNumber === 1
    ? 'Focus on learning proper form and building habits. Some muscle soreness is normal.'
    : phaseNumber === 2
      ? 'You should feel stronger and more confident. Progressive overload becomes the focus.'
      : 'Peak intensity phase. Listen to your body and prioritize recovery.';

  const keyPoints = [
    'Consistency is more important than perfection',
    'Track your weights and reps to ensure progression',
    'Get 7-9 hours of sleep for optimal recovery',
  ];

  return {
    phaseNumber,
    name: slim.name,
    durationWeeks: 4, // Standard phase length
    focus: slim.focus,
    explanation: `Phase ${phaseNumber} focuses on ${slim.focus.toLowerCase()}. ${slim.splitType} split optimizes recovery between sessions.`,
    expectations,
    keyPoints,
    splitType: slim.splitType,
    workouts,
    nutrition: enrichNutrition(slim.nutrition),
    progressionProtocol: progression.protocol,
  };
}

/**
 * Main enrichment function - converts slim program to full program
 */
export async function enrichProgram(
  slim: SlimProgram,
  profile: UserProfile
): Promise<GeneratedProgram> {
  try {
    // Enrich all phases
    const phases: GeneratedPhase[] = [];
    for (let i = 0; i < slim.phases.length; i++) {
      const enriched = await enrichPhase(
        slim.phases[i],
        i + 1,
        profile.experienceLevel || 'beginner'
      );
      phases.push(enriched);
    }

    // Calculate total weeks
    const totalWeeks = phases.reduce((sum, p) => sum + p.durationWeeks, 0);

    return {
      name: slim.name,
      description: slim.description,
      totalWeeks,
      phases,
    };
  } finally {
    // Clear cache after enrichment
    clearExerciseCache();
  }
}

/**
 * Enrich a single phase (for streaming/incremental generation)
 */
export async function enrichSinglePhase(
  slim: SlimPhase,
  phaseNumber: number,
  profile: UserProfile
): Promise<GeneratedPhase> {
  try {
    return await enrichPhase(slim, phaseNumber, profile.experienceLevel || 'beginner');
  } finally {
    clearExerciseCache();
  }
}
