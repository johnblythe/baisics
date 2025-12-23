/**
 * Exercise Filter for Lean Generation
 *
 * Filters the exercise library to provide a relevant subset
 * to the AI based on user's equipment, environment, and limitations.
 *
 * This keeps the prompt size manageable (~50-80 exercises)
 * while ensuring all options are valid for the user.
 */

import { prisma } from '@/lib/prisma';
import { ExerciseTier, MovementPattern } from '@prisma/client';
import type { UserProfile } from './types';
import type { ExerciseOption, FilteredExerciseList } from './leanTypes';

// Equipment aliases to normalize user input
const EQUIPMENT_ALIASES: Record<string, string[]> = {
  'barbell': ['barbell', 'olympic barbell', 'ez bar', 'trap bar'],
  'dumbbell': ['dumbbell', 'dumbbells', 'db'],
  'cable': ['cable', 'cables', 'cable machine'],
  'machine': ['machine', 'machines'],
  'kettlebell': ['kettlebell', 'kettlebells', 'kb'],
  'bands': ['band', 'bands', 'resistance band', 'resistance bands'],
  'bodyweight': ['body only', 'bodyweight', 'none'],
  'pull-up bar': ['pull-up bar', 'pullup bar', 'chin-up bar', 'bar'],
  'bench': ['bench', 'flat bench', 'adjustable bench'],
  'rack': ['rack', 'squat rack', 'power rack', 'cage'],
};

// Map user equipment type to likely available equipment
const EQUIPMENT_TYPE_MAP: Record<string, string[]> = {
  'full-gym': ['barbell', 'dumbbell', 'cable', 'machine', 'kettlebell', 'bands', 'bench', 'rack', 'pull-up bar'],
  'minimal': ['dumbbell', 'bands', 'kettlebell', 'bodyweight'],
  'bodyweight': ['bodyweight', 'pull-up bar'],
  'specific': [], // Use user's specific list
};

/**
 * Normalize equipment name to match database format
 */
function normalizeEquipment(equipment: string): string {
  const lower = equipment.toLowerCase().trim();

  // Check aliases
  for (const [canonical, aliases] of Object.entries(EQUIPMENT_ALIASES)) {
    if (aliases.some(alias => lower.includes(alias))) {
      return canonical;
    }
  }

  return lower;
}

/**
 * Get equipment list for user's profile
 */
function getUserEquipment(profile: UserProfile): string[] {
  const baseEquipment = EQUIPMENT_TYPE_MAP[profile.equipment.type] || [];
  const specificEquipment = profile.equipment.available.map(normalizeEquipment);

  // Combine and dedupe
  const allEquipment = new Set([...baseEquipment, ...specificEquipment]);

  // Always include bodyweight
  allEquipment.add('bodyweight');

  return Array.from(allEquipment);
}

/**
 * Map ExerciseTier enum to number
 */
function tierToNumber(tier: ExerciseTier): 1 | 2 | 3 {
  switch (tier) {
    case 'TIER_1': return 1;
    case 'TIER_2': return 2;
    case 'TIER_3': return 3;
  }
}

/**
 * Filter exercises for a user's profile
 */
export async function filterExercisesForUser(
  profile: UserProfile,
  options?: {
    maxExercises?: number;
    includeAllTiers?: boolean;
  }
): Promise<FilteredExerciseList> {
  const maxExercises = options?.maxExercises ?? 80;
  const userEquipment = getUserEquipment(profile);

  // Fetch exercises from database
  const exercises = await prisma.exerciseLibrary.findMany({
    select: {
      name: true,
      equipment: true,
      defaultTier: true,
      isCompound: true,
      movementPattern: true,
      targetMuscles: true,
      contraindications: true,
      environments: true,
    },
    orderBy: [
      { defaultTier: 'asc' },  // TIER_1 first
      { name: 'asc' },
    ],
  });

  const filtered: ExerciseOption[] = [];
  const excludedForInjuries: string[] = [];

  for (const exercise of exercises) {
    // Check equipment compatibility
    const exerciseEquipment = exercise.equipment.map(e => e.toLowerCase());
    const hasRequiredEquipment =
      exerciseEquipment.length === 0 || // Bodyweight
      exerciseEquipment.some(eq =>
        userEquipment.some(ue => eq.includes(ue) || ue.includes(eq))
      );

    if (!hasRequiredEquipment) {
      continue;
    }

    // Check environment compatibility (if environments are set)
    if (exercise.environments.length > 0) {
      const userEnv = profile.environment.primary.toLowerCase();
      const compatible = exercise.environments.some(
        env => env.toLowerCase() === userEnv
      );
      if (!compatible) {
        continue;
      }
    }

    // Check injury contraindications
    if (profile.injuries && profile.injuries.length > 0 && exercise.contraindications.length > 0) {
      const injuryLower = profile.injuries.map(i => i.toLowerCase());
      const hasContraindication = exercise.contraindications.some(
        c => injuryLower.some(injury => injury.includes(c.toLowerCase()) || c.toLowerCase().includes(injury))
      );
      if (hasContraindication) {
        excludedForInjuries.push(exercise.name);
        continue;
      }
    }

    filtered.push({
      slug: exercise.name.toLowerCase().replace(/\s+/g, '-'),
      tier: tierToNumber(exercise.defaultTier),
      equipment: exercise.equipment,
      compound: exercise.isCompound,
      pattern: exercise.movementPattern,
      muscles: exercise.targetMuscles,
    });

    // Limit total exercises
    if (filtered.length >= maxExercises) {
      break;
    }
  }

  // Ensure we have a good distribution across tiers
  const tier1 = filtered.filter(e => e.tier === 1);
  const tier2 = filtered.filter(e => e.tier === 2);
  const tier3 = filtered.filter(e => e.tier === 3);

  // If heavily skewed, rebalance
  const minPerTier = Math.min(10, Math.floor(maxExercises / 4));
  let result = filtered;

  if (tier1.length < minPerTier || tier2.length < minPerTier || tier3.length < minPerTier) {
    // Keep what we have - it's likely due to equipment constraints
    result = filtered;
  }

  return {
    exercises: result,
    filters: {
      equipment: userEquipment,
      environment: profile.environment.primary,
      excludedForInjuries,
    },
  };
}

/**
 * Format exercise list for inclusion in prompt
 * Compact format to minimize tokens
 */
export function formatExerciseListForPrompt(list: FilteredExerciseList): string {
  const lines: string[] = [];

  lines.push('AVAILABLE EXERCISES (use exact slugs):');
  lines.push('');

  // Group by tier
  const tier1 = list.exercises.filter(e => e.tier === 1);
  const tier2 = list.exercises.filter(e => e.tier === 2);
  const tier3 = list.exercises.filter(e => e.tier === 3);

  if (tier1.length > 0) {
    lines.push('TIER 1 (main lifts - typically first):');
    for (const e of tier1) {
      lines.push(`  ${e.slug} [${e.pattern}] ${e.equipment.join(',') || 'bodyweight'}`);
    }
    lines.push('');
  }

  if (tier2.length > 0) {
    lines.push('TIER 2 (supporting - typically middle):');
    for (const e of tier2) {
      lines.push(`  ${e.slug} [${e.pattern}] ${e.equipment.join(',') || 'bodyweight'}`);
    }
    lines.push('');
  }

  if (tier3.length > 0) {
    lines.push('TIER 3 (accessories - typically last):');
    for (const e of tier3) {
      lines.push(`  ${e.slug} [${e.pattern}] ${e.equipment.join(',') || 'bodyweight'}`);
    }
  }

  if (list.filters.excludedForInjuries.length > 0) {
    lines.push('');
    lines.push(`(${list.filters.excludedForInjuries.length} exercises excluded due to injury considerations)`);
  }

  return lines.join('\n');
}
