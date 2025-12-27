/**
 * Lean Program Generation Types
 *
 * These slim types define what the AI generates (minimal tokens).
 * The enrichment layer hydrates these into full GeneratedProgram types.
 *
 * Token savings: ~3000-10000 tokens → ~500-1500 tokens
 */

// ============================================
// SLIM OUTPUT TYPES - What AI generates
// ============================================

/**
 * Slim exercise - just the AI decisions
 * ~15 tokens vs ~110 tokens for full GeneratedExercise
 */
export interface SlimExercise {
  slug: string;           // References ExerciseLibrary.name (normalized)
  sets: number;
  reps?: number;          // For rep-based exercises
  duration?: number;      // For time-based exercises (seconds)
  rpe?: number;           // Rate of perceived exertion (1-10)
  notes?: string;         // User-specific notes ONLY (injury mods, etc)
  tierOverride?: 1 | 2 | 3; // Override default tier for this user's needs
}

/**
 * Slim workout - no warmup/cooldown (use templates)
 * ~100 tokens vs ~600 tokens for full GeneratedWorkout
 */
export interface SlimWorkout {
  name: string;
  focusArea: 'lower' | 'upper' | 'push' | 'pull' | 'full' | 'cardio' | 'flexibility';
  exercises: SlimExercise[];
}

/**
 * Slim nutrition - just the numbers
 */
export interface SlimNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  notes?: string;         // User-specific notes only
}

/**
 * Slim phase - minimal metadata
 * ~200 tokens vs ~2200 tokens for full GeneratedPhase
 */
export interface SlimPhase {
  name: string;
  focus: string;          // 1 sentence
  splitType: string;
  workouts: SlimWorkout[];
  nutrition: SlimNutrition;
}

/**
 * Slim program - what AI returns
 * Total: ~500-1500 tokens vs ~3000-10000 tokens
 */
export interface SlimProgram {
  name: string;
  description: string;    // 1-2 sentences max
  phases: SlimPhase[];
}

// ============================================
// EXERCISE LIBRARY REFERENCE - For prompts
// ============================================

/**
 * Minimal exercise info sent to AI for selection
 * Keeps prompt size manageable (~50-80 exercises)
 */
export interface ExerciseOption {
  slug: string;
  tier: 1 | 2 | 3;
  equipment: string[];
  compound: boolean;
  pattern: string;        // PUSH, PULL, HINGE, etc.
  muscles: string[];      // Primary target muscles
}

/**
 * Filtered exercise list for a specific user's context
 */
export interface FilteredExerciseList {
  exercises: ExerciseOption[];
  filters: {
    equipment: string[];
    environment: string;
    excludedForInjuries: string[];
  };
}

// ============================================
// ENRICHMENT TYPES
// ============================================

/**
 * Result of looking up an exercise from the library
 */
export interface EnrichedExercise {
  found: boolean;
  libraryId?: string;
  name: string;
  instructions: string[];
  equipment: string[];
  alternatives: string[];
  category: 'primary' | 'secondary' | 'isolation' | 'cardio' | 'flexibility';
}

/**
 * Mapping from tier to category
 */
export function tierToCategory(tier: 1 | 2 | 3): 'primary' | 'secondary' | 'isolation' {
  switch (tier) {
    case 1: return 'primary';
    case 2: return 'secondary';
    case 3: return 'isolation';
  }
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate slim program structure
 */
export function validateSlimProgram(program: unknown): program is SlimProgram {
  if (!program || typeof program !== 'object') return false;

  const p = program as Record<string, unknown>;

  if (typeof p.name !== 'string') return false;
  if (typeof p.description !== 'string') return false;
  if (!Array.isArray(p.phases)) return false;

  for (const phase of p.phases) {
    if (!validateSlimPhase(phase)) return false;
  }

  return true;
}

export function validateSlimPhase(phase: unknown): phase is SlimPhase {
  if (!phase || typeof phase !== 'object') return false;

  const p = phase as Record<string, unknown>;

  if (typeof p.name !== 'string') return false;
  if (typeof p.focus !== 'string') return false;
  if (typeof p.splitType !== 'string') return false;
  if (!Array.isArray(p.workouts)) return false;

  for (const workout of p.workouts) {
    if (!validateSlimWorkout(workout)) return false;
  }

  return true;
}

function validateSlimWorkout(workout: unknown): workout is SlimWorkout {
  if (!workout || typeof workout !== 'object') return false;

  const w = workout as Record<string, unknown>;

  if (typeof w.name !== 'string') return false;
  if (typeof w.focusArea !== 'string') return false;
  if (!Array.isArray(w.exercises)) return false;

  for (const exercise of w.exercises) {
    if (!validateSlimExercise(exercise)) return false;
  }

  return true;
}

function validateSlimExercise(exercise: unknown): exercise is SlimExercise {
  if (!exercise || typeof exercise !== 'object') return false;

  const e = exercise as Record<string, unknown>;

  if (typeof e.slug !== 'string') return false;
  if (typeof e.sets !== 'number') return false;
  // reps or duration must be present
  if (typeof e.reps !== 'number' && typeof e.duration !== 'number') return false;

  return true;
}
