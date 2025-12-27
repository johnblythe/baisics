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

import { prisma } from "@/lib/prisma";
import type { ExerciseTier } from "@prisma/client";
import type {
  SlimProgram,
  SlimPhase,
  SlimWorkout,
  SlimExercise,
} from "./leanTypes";
import type {
  GeneratedProgram,
  GeneratedPhase,
  GeneratedWorkout,
  GeneratedExercise,
  GeneratedNutrition,
  UserProfile,
} from "./types";
import {
  getWarmupTemplate,
  getCooldownTemplate,
  getProgressionTemplate,
  extractConstraints,
  type UserConstraints,
} from "@/lib/templates/workoutTemplates";

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

// Track lookup issues for admin review
interface LookupIssue {
  slug: string;
  issue:
    | "not_found"
    | "low_confidence"
    | "empty_instructions"
    | "equipment_mismatch";
  matchedTo?: string;
  confidence?: number;
  userEquipment?: string[];
  exerciseEquipment?: string[];
  timestamp: Date;
}

const lookupIssues: LookupIssue[] = [];

/**
 * Get and clear accumulated lookup issues (for logging after generation)
 */
export function getAndClearLookupIssues(): LookupIssue[] {
  const issues = [...lookupIssues];
  lookupIssues.length = 0;
  return issues;
}

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
    const key = exercise.name.toLowerCase().replace(/\s+/g, "-");
    exerciseCache.set(key, exercise);

    // Also index by original name
    exerciseCache.set(exercise.name.toLowerCase(), exercise);
  }

  return exerciseCache;
}

function clearExerciseCache(): void {
  exerciseCache = null;
}

/**
 * Calculate word overlap score between two strings
 * Returns 0-1 where 1 is perfect match
 */
function calculateMatchScore(search: string, candidate: string): number {
  const searchWords = search
    .toLowerCase()
    .replace(/-/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const candidateWords = candidate
    .toLowerCase()
    .replace(/-/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (searchWords.length === 0 || candidateWords.length === 0) return 0;

  // Count matching words
  let matches = 0;
  for (const sw of searchWords) {
    for (const cw of candidateWords) {
      // Exact word match or one contains the other (for variations like "squat" vs "squats")
      if (
        sw === cw ||
        (sw.length >= 4 && (cw.startsWith(sw) || sw.startsWith(cw)))
      ) {
        matches++;
        break;
      }
    }
  }

  // Score based on: matches / max(search words, candidate words)
  // This penalizes both missing words and extra words
  const maxWords = Math.max(searchWords.length, candidateWords.length);
  return matches / maxWords;
}

// Minimum confidence for fuzzy match (0.5 = at least half the words must match)
const MIN_FUZZY_CONFIDENCE = 0.5;

async function lookupExercise(slug: string): Promise<ExerciseDetails | null> {
  const cache = await loadExerciseCache();

  // Try exact match first
  const normalized = slug.toLowerCase().replace(/\s+/g, "-");
  if (cache.has(normalized)) {
    const result = cache.get(normalized)!;
    // Log if empty instructions
    if (result.instructions.length === 0) {
      lookupIssues.push({
        slug,
        issue: "empty_instructions",
        matchedTo: result.name,
        timestamp: new Date(),
      });
    }
    return result;
  }

  // Try without hyphens
  const withSpaces = slug.toLowerCase().replace(/-/g, " ");
  if (cache.has(withSpaces)) {
    const result = cache.get(withSpaces)!;
    if (result.instructions.length === 0) {
      lookupIssues.push({
        slug,
        issue: "empty_instructions",
        matchedTo: result.name,
        timestamp: new Date(),
      });
    }
    return result;
  }

  // Fuzzy match with scoring - find best match above threshold
  let bestMatch: ExerciseDetails | null = null;
  let bestScore = 0;
  let bestKey = "";

  // Only check unique exercises (avoid duplicate from slug + name indexing)
  const seen = new Set<string>();

  for (const [key, exercise] of cache.entries()) {
    if (seen.has(exercise.id)) continue;
    seen.add(exercise.id);

    const score = calculateMatchScore(normalized, key);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = exercise;
      bestKey = key;
    }
  }

  // Only return if above confidence threshold
  if (bestMatch && bestScore >= MIN_FUZZY_CONFIDENCE) {
    // Log low-confidence matches for review
    if (bestScore < 0.8) {
      lookupIssues.push({
        slug,
        issue: "low_confidence",
        matchedTo: bestMatch.name,
        confidence: bestScore,
        timestamp: new Date(),
      });
      console.warn(
        `[Enrichment] Low confidence match: "${slug}" → "${bestMatch.name}" (${(bestScore * 100).toFixed(0)}%)`,
      );
    }

    if (bestMatch.instructions.length === 0) {
      lookupIssues.push({
        slug,
        issue: "empty_instructions",
        matchedTo: bestMatch.name,
        timestamp: new Date(),
      });
    }

    return bestMatch;
  }

  // No match found
  lookupIssues.push({
    slug,
    issue: "not_found",
    timestamp: new Date(),
  });
  console.warn(`[Enrichment] Exercise not found: "${slug}"`);

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

  return exercise.variations.map((v) => v.name);
}

// ============================================
// EQUIPMENT VALIDATION
// ============================================

// Equipment aliases for special cases only (semantic equivalents)
const EQUIPMENT_ALIASES: Record<string, string[]> = {
  "trap bar": ["hex bar"],
  cable: ["cable machine"],
  bodyweight: ["body only", "none"],
  "pull-up bar": ["pullup bar", "chin-up bar", "chinup bar"],
  "stability ball": ["exercise ball", "swiss ball"],
  trx: ["suspension trainer", "suspension"],
  "battle rope": ["battling rope"],
  "medicine ball": ["med ball"],
  band: ["resistance band"],
};

/**
 * Normalize equipment name for comparison
 * - lowercase
 * - strip trailing 's' for plurals
 * - check semantic aliases
 */
function normalizeEquipmentForValidation(equipment: string): string {
  let normalized = equipment.toLowerCase().trim();

  // Strip trailing 's' for plurals (but not 'ss' like "swiss")
  if (normalized.endsWith("s") && !normalized.endsWith("ss")) {
    normalized = normalized.slice(0, -1);
  }

  // Check semantic aliases
  for (const [canonical, aliases] of Object.entries(EQUIPMENT_ALIASES)) {
    if (aliases.some((alias) => normalized.includes(alias))) {
      return canonical;
    }
  }

  return normalized;
}

/**
 * Validate that exercise equipment matches user's available equipment
 * Returns true if equipment is compatible, false otherwise
 */
function validateExerciseEquipment(
  exerciseEquipment: string[],
  userEquipment: string[],
): boolean {
  // Normalize user equipment
  const normalizedUserEquipment = userEquipment.map(
    normalizeEquipmentForValidation,
  );

  // Bodyweight exercises always pass
  if (exerciseEquipment.length === 0) return true;
  if (
    exerciseEquipment.every(
      (eq) =>
        eq.toLowerCase() === "body only" || eq.toLowerCase() === "bodyweight",
    )
  ) {
    return true;
  }

  // Check if user has all required equipment
  for (const eq of exerciseEquipment) {
    const normalized = normalizeEquipmentForValidation(eq);
    if (normalized === "bodyweight") continue;

    if (!normalizedUserEquipment.includes(normalized)) {
      return false;
    }
  }

  return true;
}

// ============================================
// TIER TO CATEGORY MAPPING
// ============================================

function tierToCategory(
  tier: ExerciseTier | 1 | 2 | 3,
): "primary" | "secondary" | "isolation" {
  if (tier === "TIER_1" || tier === 1) return "primary";
  if (tier === "TIER_2" || tier === 2) return "secondary";
  return "isolation";
}

/**
 * Generate fallback instructions based on exercise name patterns
 * Used when DB has no instructions (stopgap until data quality fixed)
 */
function getFallbackInstructions(name: string): string[] {
  const lower = name.toLowerCase();

  // Squat patterns
  if (lower.includes("squat")) {
    return [
      "Stand with feet shoulder-width apart",
      "Lower by pushing hips back and bending knees",
      "Keep chest up and knees tracking over toes",
    ];
  }

  // Deadlift patterns
  if (lower.includes("deadlift") || lower.includes("rdl")) {
    return [
      "Hinge at hips while maintaining neutral spine",
      "Keep weight close to body throughout movement",
      "Drive through heels to return to standing",
    ];
  }

  // Press patterns
  if (lower.includes("press") || lower.includes("push")) {
    return [
      "Maintain controlled movement throughout",
      "Keep core engaged and stable",
      "Full range of motion, controlled tempo",
    ];
  }

  // Row patterns
  if (lower.includes("row")) {
    return [
      "Pull with elbows, squeeze shoulder blades together",
      "Keep core tight and back neutral",
      "Control the weight on the return",
    ];
  }

  // Pull-up/chin-up patterns
  if (
    lower.includes("pull-up") ||
    lower.includes("pullup") ||
    lower.includes("chin")
  ) {
    return [
      "Start from full hang with arms extended",
      "Pull until chin clears the bar",
      "Lower with control to full extension",
    ];
  }

  // Curl patterns
  if (lower.includes("curl")) {
    return [
      "Keep elbows stationary at your sides",
      "Control the weight through full range",
      "Squeeze at the top of the movement",
    ];
  }

  // Lunge patterns
  if (lower.includes("lunge")) {
    return [
      "Step forward/back with control",
      "Lower until back knee nearly touches ground",
      "Keep front knee tracking over ankle",
    ];
  }

  // Plank patterns
  if (lower.includes("plank")) {
    return [
      "Maintain straight line from head to heels",
      "Engage core and glutes throughout",
      "Breathe steadily, don't hold breath",
    ];
  }

  // Default generic instructions
  return [
    "Maintain proper form throughout",
    "Use controlled tempo, no momentum",
    "Full range of motion each rep",
  ];
}

// ============================================
// ENRICHMENT FUNCTIONS
// ============================================

/**
 * Enrich a slim exercise into a full GeneratedExercise
 */
async function enrichExercise(
  slim: SlimExercise,
  fallbackCategory: "primary" | "secondary" | "isolation" = "secondary",
  userEquipment?: string[],
): Promise<GeneratedExercise> {
  const details = await lookupExercise(slim.slug);

  // Validate equipment if we have user equipment info
  if (details && userEquipment && userEquipment.length > 0) {
    if (!validateExerciseEquipment(details.equipment, userEquipment)) {
      lookupIssues.push({
        slug: slim.slug,
        issue: "equipment_mismatch",
        matchedTo: details.name,
        userEquipment,
        exerciseEquipment: details.equipment,
        timestamp: new Date(),
      });
      console.warn(
        `[Enrichment] Equipment mismatch: "${details.name}" requires [${details.equipment.join(", ")}] but user only has [${userEquipment.join(", ")}]`,
      );
    }
  }

  if (!details) {
    // Exercise not found - create entry with fallback instructions
    const displayName = slim.slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    console.warn(`Exercise not found: ${slim.slug}`);
    return {
      name: displayName,
      sets: slim.sets,
      measure: slim.reps
        ? { type: "reps", value: slim.reps }
        : { type: "time", value: slim.duration || 30, unit: "seconds" },
      restPeriod:
        slim.rpe && slim.rpe >= 8 ? 180 : slim.rpe && slim.rpe >= 6 ? 90 : 60,
      equipment: [],
      alternatives: [],
      category: slim.tierOverride
        ? tierToCategory(slim.tierOverride)
        : fallbackCategory,
      intensity: slim.rpe ? `RPE ${slim.rpe}` : undefined,
      notes: slim.notes,
      instructions: getFallbackInstructions(displayName),
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
      ? { type: "reps", value: slim.reps }
      : { type: "time", value: slim.duration || 30, unit: "seconds" },
    restPeriod,
    equipment: details.equipment,
    alternatives,
    category: slim.tierOverride
      ? tierToCategory(slim.tierOverride)
      : tierToCategory(details.defaultTier),
    intensity: slim.rpe ? `RPE ${slim.rpe}` : undefined,
    notes: slim.notes,
    instructions:
      details.instructions.length > 0
        ? details.instructions.slice(0, 3)
        : getFallbackInstructions(details.name),
  };
}

/**
 * Enrich a slim workout into a full GeneratedWorkout
 */
async function enrichWorkout(
  slim: SlimWorkout,
  dayNumber: number,
  constraints?: UserConstraints,
  userEquipment?: string[],
): Promise<GeneratedWorkout> {
  // Get templates based on focus area, applying user constraints
  const warmup = getWarmupTemplate(slim.focusArea, constraints);
  const cooldown = getCooldownTemplate(slim.focusArea, constraints);

  // Enrich exercises
  const exercises: GeneratedExercise[] = [];
  for (let i = 0; i < slim.exercises.length; i++) {
    const slimExercise = slim.exercises[i];
    // Determine fallback category based on position
    const fallbackCategory: "primary" | "secondary" | "isolation" =
      i < 2 ? "primary" : i < 4 ? "secondary" : "isolation";

    const enriched = await enrichExercise(
      slimExercise,
      fallbackCategory,
      userEquipment,
    );
    exercises.push(enriched);
  }

  // Sort by category to ensure correct order
  const categoryOrder = {
    primary: 0,
    secondary: 1,
    isolation: 2,
    cardio: 3,
    flexibility: 4,
  };
  exercises.sort(
    (a, b) => categoryOrder[a.category] - categoryOrder[b.category],
  );

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
function enrichNutrition(slim: {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  notes?: string;
}): GeneratedNutrition {
  return {
    dailyCalories: slim.calories,
    macros: {
      protein: slim.protein,
      carbs: slim.carbs,
      fats: slim.fats,
    },
    mealTiming: [
      "Eat protein with each meal (25-40g)",
      "Pre-workout: Light meal 1-2 hours before",
      "Post-workout: Protein + carbs within 2 hours",
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
  experienceLevel: string,
  constraints?: UserConstraints,
  userEquipment?: string[],
): Promise<GeneratedPhase> {
  // Enrich workouts
  const workouts: GeneratedWorkout[] = [];
  for (let i = 0; i < slim.workouts.length; i++) {
    const enriched = await enrichWorkout(
      slim.workouts[i],
      i + 1,
      constraints,
      userEquipment,
    );
    workouts.push(enriched);
  }

  // Get progression template
  const progression = getProgressionTemplate(experienceLevel);

  // Generate phase metadata
  const expectations =
    phaseNumber === 1
      ? "Focus on learning proper form and building habits. Some muscle soreness is normal."
      : phaseNumber === 2
        ? "You should feel stronger and more confident. Progressive overload becomes the focus."
        : "Peak intensity phase. Listen to your body and prioritize recovery.";

  const keyPoints = [
    "Consistency is more important than perfection",
    "Track your weights and reps to ensure progression",
    "Get 7-9 hours of sleep for optimal recovery",
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
  profile: UserProfile,
): Promise<GeneratedProgram> {
  try {
    // Extract user constraints for warmup/cooldown template selection
    const constraints = extractConstraints(profile);

    // Get user equipment for validation
    const userEquipment = profile.equipment.available || [];

    // Enrich all phases
    const phases: GeneratedPhase[] = [];
    for (let i = 0; i < slim.phases.length; i++) {
      const enriched = await enrichPhase(
        slim.phases[i],
        i + 1,
        profile.experienceLevel || "beginner",
        constraints,
        userEquipment,
      );
      phases.push(enriched);
    }

    // Calculate total weeks
    const totalWeeks = phases.reduce((sum, p) => sum + p.durationWeeks, 0);

    // Log any lookup issues for admin review
    const issues = getAndClearLookupIssues();
    if (issues.length > 0) {
      console.log(
        "[Enrichment] Lookup issues:",
        JSON.stringify(issues, null, 2),
      );
      // TODO: In production, send to monitoring/logging service
    }

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
  profile: UserProfile,
): Promise<GeneratedPhase> {
  try {
    const constraints = extractConstraints(profile);
    const userEquipment = profile.equipment.available || [];
    const result = await enrichPhase(
      slim,
      phaseNumber,
      profile.experienceLevel || "beginner",
      constraints,
      userEquipment,
    );

    // Log any lookup issues for admin review
    const issues = getAndClearLookupIssues();
    if (issues.length > 0) {
      console.log(
        `[Enrichment] Phase ${phaseNumber} lookup issues:`,
        JSON.stringify(issues, null, 2),
      );
    }

    return result;
  } finally {
    clearExerciseCache();
  }
}
