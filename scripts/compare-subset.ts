/**
 * Quick A/B comparison for specific personas
 * Usage: npx tsx scripts/compare-subset.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Load .env.local
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

import { generateProgramLean } from '../src/services/programGeneration/leanGeneration';
import type { UserProfile } from '../src/services/programGeneration/types';

// Test personas - subset for quick verification
const TEST_PERSONAS: Record<string, UserProfile> = {
  'postpartum-mom': {
    odometer: 'new',
    odometer_value: 0,
    sex: 'female',
    age: 32,
    weight: 155,
    heightFeet: 5,
    heightInches: 5,
    trainingGoal: 'Build strength and lose baby weight safely',
    experienceLevel: 'beginner',
    daysAvailable: 3,
    timePerSession: 30,
    equipment: {
      type: 'minimal',
      available: ['dumbbells', 'resistance bands', 'yoga mat'],
    },
    environment: {
      primary: 'home',
      limitations: ['baby sleeping - no jumping or loud exercises'],
    },
    injuries: [],
    preferences: ['postpartum-safe exercises', 'diastasis recti friendly'],
    additionalInfo: '4 months postpartum, cleared by doctor for exercise',
  },

  'senior-beginner': {
    odometer: 'new',
    odometer_value: 0,
    sex: 'male',
    age: 68,
    weight: 185,
    heightFeet: 5,
    heightInches: 10,
    trainingGoal: 'Maintain mobility and build functional strength',
    experienceLevel: 'beginner',
    daysAvailable: 3,
    timePerSession: 45,
    equipment: {
      type: 'minimal',
      available: ['light dumbbells', 'resistance bands', 'chair'],
    },
    environment: {
      primary: 'home',
      limitations: [],
    },
    injuries: ['mild arthritis in knees'],
    preferences: ['low impact', 'joint-friendly'],
    additionalInfo: 'Had knee replacement 2 years ago, doing well but need to be careful',
  },
};

async function runComparison() {
  console.log('Running lean generation for postpartum and senior personas...\n');

  fs.mkdirSync('model-comparison-results', { recursive: true });

  for (const [name, profile] of Object.entries(TEST_PERSONAS)) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${name}`);
    console.log('='.repeat(60));

    try {
      const startTime = Date.now();
      const result = await generateProgramLean(profile);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      if (result.success && result.program) {
        console.log(`✓ Generated in ${elapsed}s`);
        console.log(`  Program: ${result.program.name}`);
        console.log(`  Phases: ${result.program.phases.length}`);

        // Check warmups for issues
        const phase1 = result.program.phases[0];
        if (phase1?.workouts?.[0]?.warmup) {
          const warmup = phase1.workouts[0].warmup;
          console.log(`\n  Warmup activities:`);
          for (const act of warmup.activities) {
            const hasJump = act.toLowerCase().includes('jump') || act.toLowerCase().includes('hop');
            const hasFloor = act.toLowerCase().includes('lying') || act.toLowerCase().includes('floor');
            const flag = hasJump ? ' ⚠️ JUMP' : hasFloor ? ' ⚠️ FLOOR' : '';
            console.log(`    - ${act}${flag}`);
          }
        }

        // Check exercises
        if (phase1?.workouts?.[0]?.exercises) {
          console.log(`\n  Day 1 exercises:`);
          for (const ex of phase1.workouts[0].exercises) {
            const hasInstructions = ex.instructions && ex.instructions.length > 0;
            const flag = hasInstructions ? '' : ' ⚠️ NO INSTRUCTIONS';
            console.log(`    - ${ex.name} (${ex.sets}x${ex.measure?.value})${flag}`);
          }
        }

        // Save result
        const filename = `model-comparison-results/lean-${name}.json`;
        fs.writeFileSync(filename, JSON.stringify(result.program, null, 2));
        console.log(`\n  Saved to: ${filename}`);
      } else {
        console.log(`✗ Failed: ${result.error}`);
      }
    } catch (error) {
      console.log(`✗ Error: ${error}`);
    }
  }

  console.log('\n\nDone! Check model-comparison-results/ for outputs.');
  console.log('View at: http://localhost:3001/compare');
}

runComparison().catch(console.error);
