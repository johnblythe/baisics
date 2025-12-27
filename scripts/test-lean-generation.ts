/**
 * Test Lean Generation
 *
 * Runs a few test personas through the lean generation pipeline
 * to verify it works and measure performance.
 *
 * Usage: npx tsx scripts/test-lean-generation.ts
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

const TEST_PROFILES: { name: string; profile: UserProfile }[] = [
  {
    name: 'Beginner Home',
    profile: {
      sex: 'female',
      age: 32,
      weight: 145,
      trainingGoal: 'Lose weight and build basic strength',
      experienceLevel: 'beginner',
      daysAvailable: 3,
      timePerSession: 30,
      environment: { primary: 'home' },
      equipment: {
        type: 'minimal',
        available: ['dumbbells', 'resistance bands', 'yoga mat'],
      },
      injuries: ['Lower back tightness'],
    },
  },
  {
    name: 'Intermediate Gym',
    profile: {
      sex: 'male',
      age: 28,
      weight: 185,
      trainingGoal: 'Build muscle mass',
      experienceLevel: 'intermediate',
      daysAvailable: 4,
      timePerSession: 60,
      environment: { primary: 'gym' },
      equipment: {
        type: 'full-gym',
        available: ['barbell', 'dumbbells', 'cables', 'machines'],
      },
    },
  },
];

async function main() {
  console.log('='.repeat(60));
  console.log('LEAN GENERATION TEST');
  console.log('='.repeat(60));

  for (const { name, profile } of TEST_PROFILES) {
    console.log(`\n[${name}]`);
    console.log('-'.repeat(40));

    try {
      const result = await generateProgramLean(profile, undefined, { model: 'fast' });

      if (result.success && result.program) {
        console.log(`✓ Success!`);
        console.log(`  Program: ${result.program.name}`);
        console.log(`  Phases: ${result.program.phases.length}`);
        console.log(`  Total weeks: ${result.program.totalWeeks}`);
        console.log(`  Workouts/phase: ${result.program.phases[0]?.workouts.length || 0}`);
        console.log(`  Exercises/workout: ${result.program.phases[0]?.workouts[0]?.exercises.length || 0}`);
      } else {
        console.log(`✗ Failed: ${result.error}`);
      }

      console.log(`\n  Timing:`);
      console.log(`    Total: ${result.metadata.generationTimeMs}ms`);
      console.log(`    AI: ${result.metadata.aiTimeMs}ms`);
      console.log(`    Enrichment: ${result.metadata.enrichmentTimeMs}ms`);
      console.log(`  Tokens:`);
      console.log(`    Input: ${result.metadata.inputTokens}`);
      console.log(`    Output: ${result.metadata.outputTokens}`);
      console.log(`  Model: ${result.metadata.model}`);
      console.log(`  Exercises available: ${result.metadata.exerciseCount}`);

      // Save output for inspection
      if (result.success && result.program) {
        const outputPath = path.join(__dirname, '../model-comparison-results', `lean-${name.toLowerCase().replace(/\s+/g, '-')}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(result.program, null, 2));
        console.log(`\n  Output saved: ${outputPath}`);
      }
    } catch (error) {
      console.log(`✗ Error: ${error}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('DONE');
}

main().catch(console.error);
