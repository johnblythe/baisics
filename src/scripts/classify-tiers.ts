/**
 * Classify exercises into tiers for workout ordering
 *
 * TIER_1: Main compound lifts - typically first in workout
 * TIER_2: Supporting movements - typically middle
 * TIER_3: Accessories/isolation - typically last
 *
 * Usage: npx tsx src/scripts/classify-tiers.ts [--dry-run]
 */

import { PrismaClient, MovementPattern, ExerciseTier } from '@prisma/client';

const prisma = new PrismaClient();

// Explicit Tier 1 exercises (main lifts)
const TIER_1_NAMES = new Set([
  // Squat variations (main barbell movements)
  'barbell squat', 'back squat', 'front squat', 'squat',
  'barbell full squat', 'barbell back squat', 'low bar squat', 'high bar squat',
  // Deadlift variations
  'deadlift', 'barbell deadlift', 'conventional deadlift',
  'sumo deadlift', 'trap bar deadlift', 'hex bar deadlift',
  // Bench variations (main)
  'bench press', 'barbell bench press', 'flat bench press',
  'barbell bench press - medium grip', 'pause bench press', 'paused bench press',
  // Row variations (main)
  'barbell row', 'bent over barbell row', 'bent-over barbell row', 'bent over row',
  'pendlay row', 't-bar row', 'barbell rows',
  // Overhead press
  'overhead press', 'standing military press', 'military press',
  'barbell shoulder press', 'push press', 'strict press',
  // Olympic lifts
  'clean', 'power clean', 'clean and jerk', 'snatch', 'power snatch',
  'clean and press', 'hang clean',
]);

// Explicit Tier 2 exercises (supporting compounds)
const TIER_2_NAMES = new Set([
  // Squat accessories
  'goblet squat', 'leg press', 'hack squat', 'bulgarian split squat',
  'bulgarian split squats', 'split squat', 'box squat',
  // Deadlift accessories
  'romanian deadlift', 'rdl', 'stiff leg deadlift', 'stiff-legged deadlift',
  'good morning', 'hip thrust', 'barbell hip thrust',
  // Bench accessories
  'incline bench press', 'incline barbell bench press',
  'decline bench press', 'dumbbell bench press', 'dumbbell press',
  'close grip bench press', 'close-grip bench press', 'floor press',
  // Row accessories
  'dumbbell row', 'one arm dumbbell row', 'cable row', 'seated cable row',
  'chest supported row', 'meadows row',
  // Pull variations
  'pull-up', 'pullup', 'pull up', 'chin-up', 'chinup', 'chin up',
  'weighted pull-up', 'weighted pull-ups', 'weighted pullup', 'weighted pullups',
  'weighted chin-up', 'weighted chin-ups', 'weighted chinup', 'weighted chinups',
  'lat pulldown', 'lat pull-down', 'wide grip lat pulldown',
  // Push variations
  'dip', 'dips', 'chest dip', 'tricep dip', 'tricep dips',
  'push-up', 'pushup', 'push up',
  // Lunge variations
  'lunge', 'walking lunge', 'reverse lunge', 'forward lunge',
  'dumbbell lunge', 'barbell lunge',
  // Shoulder
  'dumbbell shoulder press', 'arnold press', 'seated dumbbell press',
]);

// Patterns that indicate Tier 3 (isolation/accessories)
const TIER_3_PATTERNS = [
  /curl/i,
  /extension/i,
  /raise/i,
  /fly/i,
  /flye/i,
  /kickback/i,
  /pullover/i,
  /shrug/i,
  /calf/i,
  /crunch/i,
  /sit-up/i,
  /situp/i,
  /plank/i,
  /twist/i,
  /rotation/i,
  /wrist/i,
  /forearm/i,
  /face pull/i,
  /reverse fly/i,
  /lateral raise/i,
  /front raise/i,
  /rear delt/i,
  /tricep/i,
  /bicep/i,
  /hamstring curl/i,
  /leg curl/i,
  /leg extension/i,
  /ab /i,
  /abdominal/i,
];

// Normalize name for matching (removes plurals, extra spaces, etc)
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/s$/, '')           // Remove trailing 's'
    .replace(/-/g, ' ')          // Replace hyphens with spaces
    .replace(/\s+/g, ' ')        // Normalize spaces
    .trim();
}

// Check if name matches any in set (with normalization)
function matchesSet(name: string, set: Set<string>): boolean {
  const normalized = normalizeName(name);

  // Direct match
  if (set.has(normalized)) return true;

  // Check if any set entry is contained in or contains the name
  for (const entry of set) {
    const normalizedEntry = normalizeName(entry);
    if (normalized.includes(normalizedEntry) || normalizedEntry.includes(normalized)) {
      return true;
    }
  }

  return false;
}

function classifyExercise(exercise: {
  name: string;
  isCompound: boolean;
  movementPattern: MovementPattern;
}): ExerciseTier {
  const nameLower = exercise.name.toLowerCase();

  // Check explicit Tier 2 FIRST (more specific variations take precedence)
  // e.g., "close-grip bench press" should be TIER_2, not TIER_1 like "bench press"
  if (matchesSet(nameLower, TIER_2_NAMES)) {
    return 'TIER_2';
  }

  // Then check explicit Tier 1 (main lifts)
  if (matchesSet(nameLower, TIER_1_NAMES)) {
    return 'TIER_1';
  }

  // Check Tier 3 patterns
  for (const pattern of TIER_3_PATTERNS) {
    if (pattern.test(nameLower)) {
      return 'TIER_3';
    }
  }

  // Heuristics based on compound + movement pattern
  if (exercise.isCompound) {
    // Main compound patterns
    if (['SQUAT', 'HINGE'].includes(exercise.movementPattern)) {
      return 'TIER_1';
    }
    // Other compound movements
    if (['PUSH', 'PULL', 'LUNGE'].includes(exercise.movementPattern)) {
      return 'TIER_2';
    }
  }

  // Non-compound = Tier 3
  if (!exercise.isCompound) {
    return 'TIER_3';
  }

  // Default to Tier 2
  return 'TIER_2';
}

async function classifyAllExercises(dryRun = false) {
  console.log('Fetching exercises...');

  const exercises = await prisma.exerciseLibrary.findMany({
    select: {
      id: true,
      name: true,
      isCompound: true,
      movementPattern: true,
      defaultTier: true,
    },
  });

  console.log(`Found ${exercises.length} exercises\n`);

  const tierCounts = { TIER_1: 0, TIER_2: 0, TIER_3: 0 };
  const changes: { id: string; name: string; from: ExerciseTier; to: ExerciseTier }[] = [];

  for (const exercise of exercises) {
    const newTier = classifyExercise(exercise);
    tierCounts[newTier]++;

    if (exercise.defaultTier !== newTier) {
      changes.push({
        id: exercise.id,
        name: exercise.name,
        from: exercise.defaultTier,
        to: newTier,
      });
    }
  }

  console.log('=== Classification Summary ===');
  console.log(`TIER_1 (main lifts):     ${tierCounts.TIER_1}`);
  console.log(`TIER_2 (supporting):     ${tierCounts.TIER_2}`);
  console.log(`TIER_3 (accessories):    ${tierCounts.TIER_3}`);
  console.log(`\nChanges needed: ${changes.length}`);

  if (dryRun) {
    console.log('\n=== DRY RUN - Sample Changes ===');
    const samples = changes.slice(0, 20);
    for (const change of samples) {
      console.log(`  "${change.name}": ${change.from} → ${change.to}`);
    }
    if (changes.length > 20) {
      console.log(`  ... and ${changes.length - 20} more`);
    }
    console.log('\nRun without --dry-run to apply changes.');
    return;
  }

  // Apply changes
  console.log('\nApplying changes...');
  let applied = 0;

  for (const change of changes) {
    await prisma.exerciseLibrary.update({
      where: { id: change.id },
      data: { defaultTier: change.to },
    });
    applied++;

    if (applied % 100 === 0) {
      console.log(`  Updated ${applied}/${changes.length}...`);
    }
  }

  console.log(`\nDone! Updated ${applied} exercises.`);

  // Show some examples of each tier
  console.log('\n=== Sample Exercises by Tier ===');

  for (const tier of ['TIER_1', 'TIER_2', 'TIER_3'] as ExerciseTier[]) {
    const samples = await prisma.exerciseLibrary.findMany({
      where: { defaultTier: tier },
      select: { name: true },
      take: 5,
    });
    console.log(`\n${tier}:`);
    for (const s of samples) {
      console.log(`  - ${s.name}`);
    }
  }
}

const dryRun = process.argv.includes('--dry-run');
classifyAllExercises(dryRun)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
