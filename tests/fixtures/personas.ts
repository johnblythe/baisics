/**
 * Test Persona Fixture
 *
 * Provides easy access to test persona data for E2E tests.
 * Data matches the seeded test users in prisma/seed-data/personas/.
 *
 * @see docs/personas.md for full persona documentation
 */

export type PersonaTier = "free" | "paid";

export type PersonaJourney =
  | "fresh"
  | "early"
  | "week2"
  | "cruising"
  | "veteran"
  | "returning"
  | "lapsed";

export interface Persona {
  email: string;
  tier: PersonaTier;
  journey: PersonaJourney;
  workoutCount: number;
  hasProgram: boolean;
  /** Whether this user has nutrition data (food logs, targets) */
  hasNutritionData?: boolean;
}

/**
 * All 11 test personas with their key attributes.
 * Use these for E2E tests to login as specific user types.
 */
export const PERSONAS = {
  alex: {
    email: "alex@test.baisics.app",
    tier: "free" as PersonaTier,
    journey: "fresh" as PersonaJourney,
    workoutCount: 0,
    hasProgram: true,
  },
  sarah: {
    email: "sarah@test.baisics.app",
    tier: "free" as PersonaTier,
    journey: "early" as PersonaJourney,
    workoutCount: 4,
    hasProgram: true,
  },
  jordan: {
    email: "jordan@test.baisics.app",
    tier: "free" as PersonaTier,
    journey: "week2" as PersonaJourney,
    workoutCount: 7,
    hasProgram: true,
  },
  chris: {
    email: "chris@test.baisics.app",
    tier: "paid" as PersonaTier,
    journey: "early" as PersonaJourney,
    workoutCount: 5,
    hasProgram: true,
  },
  kim: {
    email: "kim@test.baisics.app",
    tier: "free" as PersonaTier,
    journey: "week2" as PersonaJourney,
    workoutCount: 6,
    hasProgram: true,
  },
  taylor: {
    email: "taylor@test.baisics.app",
    tier: "free" as PersonaTier,
    journey: "lapsed" as PersonaJourney,
    workoutCount: 12,
    hasProgram: true,
  },
  robert: {
    email: "robert@test.baisics.app",
    tier: "free" as PersonaTier,
    journey: "cruising" as PersonaJourney,
    workoutCount: 16,
    hasProgram: true,
  },
  marcus: {
    email: "marcus@test.baisics.app",
    tier: "paid" as PersonaTier,
    journey: "cruising" as PersonaJourney,
    workoutCount: 18,
    hasProgram: true,
  },
  priya: {
    email: "priya@test.baisics.app",
    tier: "paid" as PersonaTier,
    journey: "cruising" as PersonaJourney,
    workoutCount: 20,
    hasProgram: true,
  },
  derek: {
    email: "derek@test.baisics.app",
    tier: "paid" as PersonaTier,
    journey: "veteran" as PersonaJourney,
    workoutCount: 45,
    hasProgram: true,
  },
  maya: {
    email: "maya@test.baisics.app",
    tier: "paid" as PersonaTier,
    journey: "returning" as PersonaJourney,
    workoutCount: 65,
    hasProgram: true,
  },
} as const;

export type PersonaName = keyof typeof PERSONAS;

/**
 * Get a persona by name.
 *
 * @param name - The persona name (alex, sarah, jordan, etc.)
 * @returns The persona object with email, tier, journey, workoutCount, hasProgram
 * @throws Error if persona name is not found
 *
 * @example
 * const marcus = getPersona('marcus');
 * await loginAsUser(page, marcus.email);
 */
export function getPersona(name: PersonaName): Persona {
  const persona = PERSONAS[name];
  if (!persona) {
    throw new Error(`Unknown persona: ${name}. Available: ${Object.keys(PERSONAS).join(", ")}`);
  }
  return persona;
}

/**
 * Get a persona suitable for nutrition testing (fresh state, no nutrition data).
 * Use "alex" by default as they have no workouts and represent a fresh user.
 *
 * @returns Persona suitable for fresh nutrition testing
 */
export function getFreshNutritionPersona(): Persona {
  return getPersona("alex");
}

/**
 * Get personas grouped by nutrition testing needs.
 */
export const NUTRITION_TEST_PERSONAS = {
  /** Fresh user with no nutrition data */
  fresh: getPersona("alex"),
  /** Free tier user for basic nutrition features */
  freeTier: getPersona("sarah"),
  /** Paid tier user for advanced nutrition features */
  paidTier: getPersona("marcus"),
} as const;
