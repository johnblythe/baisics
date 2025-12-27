/**
 * Populate missing exercise instructions
 *
 * 1. Uses seed data for exercises that have it
 * 2. Uses Claude to generate for the rest
 *
 * Run: npx tsx scripts/populate-instructions.ts [--apply]
 */
import * as fs from 'fs';
import * as path from 'path';
import Anthropic from '@anthropic-ai/sdk';

// Load env
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  }
}

import { prisma } from '../src/lib/prisma';

// Seed data extracted from _seed.ts (commented sections)
const SEED_INSTRUCTIONS: Record<string, string[]> = {
  'Barbell Back Squat': [
    'Position the barbell on your upper back, resting it on your traps or rear deltoids',
    'Stand with feet shoulder-width apart, toes slightly pointed outward',
    'Brace your core and maintain a neutral spine',
    'Lower your body by bending at the knees and hips, as if sitting back into a chair',
    'Continue until thighs are parallel to the ground or slightly below',
    'Drive through your heels to return to the starting position',
  ],
  'Bench Press': [
    'Lie flat on bench with feet planted firmly on the ground',
    'Grip the barbell slightly wider than shoulder width',
    'Unrack the bar and position it over your chest',
    'Lower the bar with control to mid-chest',
    'Press the bar back up to starting position while maintaining proper form',
  ],
  'Deadlift': [
    'Stand with feet hip-width apart, barbell over mid-foot',
    'Hinge at hips to grip the bar just outside knees',
    'Keep chest up and spine neutral',
    'Take slack out of the bar and brace core',
    'Drive through feet while keeping bar close to body',
    'Lock out hips and knees at the top',
  ],
  'Pull-Up': [
    'Hang from pull-up bar with hands slightly wider than shoulder-width',
    'Engage your lats by pulling shoulders down and back',
    'Pull yourself up until chin clears the bar',
    'Lower with control to full extension',
  ],
  'Romanian Deadlift': [
    'Stand with feet hip-width apart, holding barbell at hip level',
    'Keep slight bend in knees throughout movement',
    'Hinge at hips pushing them back while lowering the bar',
    'Keep bar close to legs and back flat',
    'Lower until you feel stretch in hamstrings',
    'Drive hips forward to return to start',
  ],
  'Dumbbell Shoulder Press': [
    'Sit or stand with dumbbells at shoulder height',
    'Keep core tight and maintain neutral spine',
    'Press weights overhead until arms are fully extended',
    'Lower with control back to starting position',
  ],
  'Bulgarian Split Squat': [
    'Place rear foot on bench behind you',
    'Stand on working leg about 2 feet in front of bench',
    'Lower until rear knee nearly touches ground',
    'Keep torso upright throughout movement',
    'Drive through front heel to return to start',
  ],
  'Barbell Row': [
    'Hinge forward at hips, keeping back straight',
    'Grip barbell slightly wider than shoulder width',
    'Pull bar toward lower chest/upper abdomen',
    'Squeeze shoulder blades together at top',
    'Lower with control and repeat',
  ],
  'Dumbbell Curl': [
    'Stand with dumbbells at sides, palms facing forward',
    'Keep upper arms stationary against sides',
    'Curl weights up while contracting biceps',
    'Squeeze at the top of the movement',
    'Lower with control to starting position',
  ],
  'Tricep Pushdown': [
    'Stand facing cable machine with rope at upper chest height',
    'Grab rope with palms facing each other',
    'Keep elbows tucked at sides',
    'Push down until arms are fully extended',
    'Control the weight back up',
  ],
  'Lat Pulldown': [
    'Sit at machine with thighs secured under pad',
    'Grab bar with wide overhand grip',
    'Pull bar down to upper chest',
    'Squeeze lats at bottom of movement',
    'Control the bar back up with straight arms',
  ],
  'Face Pull': [
    'Set cable at upper chest height with rope attachment',
    'Pull rope towards face, separating ends at ears',
    'Squeeze rear delts and external rotate shoulders',
    'Control the weight back to start',
  ],
  'Plank': [
    'Start in push-up position on forearms',
    'Keep body in straight line from head to heels',
    'Engage core and glutes',
    'Maintain neutral spine',
    'Breathe steadily throughout hold',
  ],
  'Walking Lunge': [
    'Stand with dumbbells at sides',
    'Step forward into a lunge position',
    'Lower until both knees are at 90 degrees',
    'Push off front foot and step into next lunge',
    'Keep torso upright throughout',
  ],
  'Cable Woodchop': [
    'Set cable at high position',
    'Stand sideways to machine',
    'Rotate torso while pulling cable diagonally down',
    'Control the return to starting position',
    'Keep arms relatively straight throughout',
  ],
  'Dip': [
    'Support body on dip bars with straight arms',
    'Lower body by bending elbows',
    'Lean forward slightly for chest emphasis',
    'Push back up to starting position',
    'Keep core engaged throughout',
  ],
  'Leg Press': [
    'Sit in machine with feet shoulder-width on platform',
    'Lower weight by bending knees',
    'Press through heels to extend legs',
    'Don\'t lock out knees at top',
  ],
  'Incline Dumbbell Press': [
    'Lie on incline bench set to 30-45 degrees',
    'Hold dumbbells at shoulder level',
    'Press weights up and slightly together',
    'Lower with control to starting position',
  ],
  'Lateral Raise': [
    'Stand with dumbbells at sides',
    'Raise arms out to sides until parallel with ground',
    'Keep slight bend in elbows',
    'Lower with control',
  ],
  'Standing Calf Raise': [
    'Stand on platform with balls of feet',
    'Lower heels below platform level',
    'Rise up onto toes as high as possible',
    'Squeeze calves at top',
    'Lower with control',
  ],
  'Hammer Curl': [
    'Stand with dumbbells at sides, palms facing each other',
    'Keep upper arms stationary',
    'Curl weights up while maintaining neutral grip',
    'Lower with control',
  ],
  'Russian Twist': [
    'Sit with knees bent, feet off ground',
    'Lean back slightly, maintaining straight back',
    'Rotate torso side to side',
    'Touch weight to ground on each side',
    'Keep core engaged throughout',
  ],
  'Front Squat': [
    'Rest barbell on front deltoids and collarbone',
    'Keep elbows high, upper arms parallel to floor',
    'Squat down while keeping torso upright',
    'Drive through heels to stand',
  ],
  'Hip Thrust': [
    'Lie on back with knees bent, feet flat',
    'Position barbell over hips',
    'Drive through heels to lift hips',
    'Squeeze glutes at top',
    'Lower with control',
  ],
  'Chin-Up': [
    'Hang from bar with palms facing you',
    'Engage lats and pull up',
    'Pull until chin clears bar',
    'Lower with control to full extension',
  ],
  'Overhead Press': [
    'Hold barbell at shoulder level',
    'Brace core and maintain neutral spine',
    'Press bar overhead until arms locked out',
    'Lower with control to shoulders',
  ],
  'Farmer\'s Walk': [
    'Hold heavy weights at sides',
    'Stand tall with shoulders back',
    'Walk with controlled steps',
    'Maintain tight core throughout',
  ],
  'Good Morning': [
    'Place bar on upper back',
    'Hinge at hips pushing them back',
    'Lower torso until near parallel',
    'Drive hips forward to return',
    'Keep slight knee bend throughout',
  ],
};

// Additional common exercises with instructions
const COMMON_INSTRUCTIONS: Record<string, string[]> = {
  'Goblet Squat': [
    'Hold dumbbell or kettlebell at chest level',
    'Stand with feet slightly wider than shoulder-width',
    'Squat down keeping chest up and elbows inside knees',
    'Drive through heels to stand',
  ],
  'Push-Up': [
    'Start in plank position with hands shoulder-width apart',
    'Lower body until chest nearly touches ground',
    'Keep body in straight line throughout',
    'Push back up to starting position',
  ],
  'Dumbbell Row': [
    'Place one hand and knee on bench for support',
    'Hold dumbbell in free hand with arm extended',
    'Pull dumbbell to hip, keeping elbow close to body',
    'Lower with control and repeat',
  ],
  'Glute Bridge': [
    'Lie on back with knees bent, feet flat on floor',
    'Drive through heels to lift hips toward ceiling',
    'Squeeze glutes at top of movement',
    'Lower with control',
  ],
  'Mountain Climbers': [
    'Start in push-up position',
    'Drive one knee toward chest',
    'Quickly switch legs in running motion',
    'Keep hips level and core engaged',
  ],
  'Burpees': [
    'Start standing, drop into squat with hands on floor',
    'Jump feet back to plank position',
    'Perform a push-up (optional)',
    'Jump feet forward and explosively jump up with arms overhead',
  ],
  'Kettlebell Swing': [
    'Stand with feet shoulder-width apart, kettlebell between feet',
    'Hinge at hips to grasp kettlebell',
    'Hike kettlebell back between legs',
    'Drive hips forward explosively to swing weight to shoulder height',
    'Let gravity bring weight back down, hinge at hips to absorb',
  ],
  'Box Jump': [
    'Stand facing box with feet shoulder-width apart',
    'Swing arms and bend knees to load jump',
    'Explosively jump onto box, landing softly with bent knees',
    'Stand fully, then step down carefully',
  ],
  'Reverse Lunge': [
    'Stand tall with feet hip-width apart',
    'Step back with one foot into lunge position',
    'Lower until both knees are at 90 degrees',
    'Push through front heel to return to standing',
  ],
  'Single-Leg Romanian Deadlift': [
    'Stand on one leg holding dumbbell',
    'Hinge at hip while extending free leg behind',
    'Lower weight toward ground keeping back flat',
    'Return to standing by driving hip forward',
  ],
};

// Merge all known instructions
const ALL_KNOWN_INSTRUCTIONS: Record<string, string[]> = {
  ...SEED_INSTRUCTIONS,
  ...COMMON_INSTRUCTIONS,
};

async function generateInstructions(exerciseName: string): Promise<string[]> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: `Generate 4-6 clear, actionable exercise instructions for "${exerciseName}".
Return ONLY a JSON array of strings, no explanation.
Focus on proper form and safety.
Example format: ["Step 1", "Step 2", "Step 3"]`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  try {
    // Clean up response
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    return JSON.parse(cleaned.trim());
  } catch {
    console.error(`Failed to parse instructions for ${exerciseName}:`, text);
    return [];
  }
}

async function main(dryRun = true) {
  console.log(dryRun ? '=== DRY RUN ===' : '=== APPLYING ===');
  console.log();

  // Find exercises with empty instructions
  const exercises = await prisma.exerciseLibrary.findMany({
    where: { instructions: { equals: [] } },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  console.log(`Found ${exercises.length} exercises with empty instructions\n`);

  const fromSeed: { id: string; name: string; instructions: string[] }[] = [];
  const needsAI: { id: string; name: string }[] = [];

  // Categorize exercises
  for (const ex of exercises) {
    // Try exact match first
    if (ALL_KNOWN_INSTRUCTIONS[ex.name]) {
      fromSeed.push({ ...ex, instructions: ALL_KNOWN_INSTRUCTIONS[ex.name] });
      continue;
    }

    // Try case-insensitive match
    const lowerName = ex.name.toLowerCase();
    const matchKey = Object.keys(ALL_KNOWN_INSTRUCTIONS).find(
      k => k.toLowerCase() === lowerName
    );
    if (matchKey) {
      fromSeed.push({ ...ex, instructions: ALL_KNOWN_INSTRUCTIONS[matchKey] });
      continue;
    }

    // Try partial match (e.g., "Barbell Squat" matches "Barbell Back Squat")
    const partialKey = Object.keys(ALL_KNOWN_INSTRUCTIONS).find(k => {
      const kWords = k.toLowerCase().split(/\s+/);
      const exWords = lowerName.split(/\s+/);
      // At least 2 words must match
      const matches = kWords.filter(w => exWords.includes(w));
      return matches.length >= 2;
    });
    if (partialKey) {
      fromSeed.push({ ...ex, instructions: ALL_KNOWN_INSTRUCTIONS[partialKey] });
      continue;
    }

    needsAI.push(ex);
  }

  console.log(`From seed/known data: ${fromSeed.length}`);
  console.log(`Needs AI generation: ${needsAI.length}\n`);

  // Show what will be updated from seed
  console.log('=== FROM SEED DATA ===');
  for (const ex of fromSeed.slice(0, 10)) {
    console.log(`  ${ex.name}`);
    console.log(`    → ${ex.instructions[0]}...`);
  }
  if (fromSeed.length > 10) {
    console.log(`  ... and ${fromSeed.length - 10} more`);
  }

  console.log('\n=== NEEDS AI GENERATION ===');
  for (const ex of needsAI.slice(0, 20)) {
    console.log(`  ${ex.name}`);
  }
  if (needsAI.length > 20) {
    console.log(`  ... and ${needsAI.length - 20} more`);
  }

  if (!dryRun) {
    console.log('\n=== APPLYING SEED DATA ===');
    for (const ex of fromSeed) {
      await prisma.exerciseLibrary.update({
        where: { id: ex.id },
        data: { instructions: ex.instructions },
      });
      console.log(`  Updated: ${ex.name}`);
    }

    console.log('\n=== GENERATING AI INSTRUCTIONS ===');
    let generated = 0;
    for (const ex of needsAI) {
      console.log(`  Generating for: ${ex.name}...`);
      const instructions = await generateInstructions(ex.name);
      if (instructions.length > 0) {
        await prisma.exerciseLibrary.update({
          where: { id: ex.id },
          data: { instructions },
        });
        console.log(`    → ${instructions.length} instructions`);
        generated++;
      } else {
        console.log(`    → FAILED`);
      }

      // Rate limit: 1 per second
      await new Promise(r => setTimeout(r, 1000));
    }

    console.log(`\nGenerated instructions for ${generated}/${needsAI.length} exercises`);
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Total missing: ${exercises.length}`);
  console.log(`From seed: ${fromSeed.length}`);
  console.log(`Needs AI: ${needsAI.length}`);

  await prisma.$disconnect();
}

// Check for --apply flag
const dryRun = !process.argv.includes('--apply');
main(dryRun);
