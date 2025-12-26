/**
 * Lean vs Full Generation A/B Comparison
 *
 * Runs both generation methods side-by-side for the same personas
 * to compare output quality and timing.
 *
 * Run: npx tsx scripts/compare-lean-vs-full.ts
 */

import Anthropic from '@anthropic-ai/sdk';
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

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Same personas from model comparison
const TEST_PERSONAS: { id: string; name: string; profile: UserProfile }[] = [
  {
    id: 'beginner-home',
    name: 'Beginner Home Workout',
    profile: {
      sex: 'female',
      age: 32,
      weight: 145,
      height: 64,
      experienceLevel: 'beginner',
      trainingGoal: 'Lose 20 lbs and build basic strength',
      daysAvailable: 3,
      timePerSession: 30,
      environment: { primary: 'home' },
      equipment: {
        type: 'minimal',
        available: ['resistance bands', 'yoga mat', 'adjustable dumbbells (5-25 lbs)'],
      },
      injuries: ['Lower back tightness from desk job'],
      additionalInfo: 'First time working out consistently. Want something I can stick to.',
    },
  },
  {
    id: 'intermediate-gym',
    name: 'Intermediate Gym Goer',
    profile: {
      sex: 'male',
      age: 28,
      weight: 185,
      height: 71,
      experienceLevel: 'intermediate',
      trainingGoal: 'Build muscle mass, especially upper body. Currently stuck at bench 185 for reps.',
      daysAvailable: 5,
      timePerSession: 75,
      environment: { primary: 'gym' },
      equipment: {
        type: 'full-gym',
        available: ['full rack', 'barbells', 'dumbbells', 'cables', 'machines'],
      },
      injuries: ['Right shoulder impingement - no behind neck press'],
      additionalInfo: 'Been training 2 years, want to break through plateaus.',
    },
  },
  {
    id: 'advanced-athlete',
    name: 'Advanced Competitive Athlete',
    profile: {
      sex: 'male',
      age: 35,
      weight: 200,
      height: 73,
      experienceLevel: 'advanced',
      trainingGoal: 'Preparing for powerlifting meet in 12 weeks. Current maxes: S 405, B 285, D 455',
      daysAvailable: 4,
      timePerSession: 90,
      environment: { primary: 'gym' },
      equipment: {
        type: 'full-gym',
        available: ['competition rack', 'calibrated plates', 'deadlift platform', 'specialty bars', 'bands', 'chains'],
      },
      additionalInfo: '83kg weight class. Need to peak properly for meet.',
    },
  },
  {
    id: 'senior-wellness',
    name: 'Active Senior',
    profile: {
      sex: 'female',
      age: 67,
      weight: 155,
      height: 62,
      experienceLevel: 'beginner',
      trainingGoal: 'Maintain bone density, improve balance, stay independent',
      daysAvailable: 4,
      timePerSession: 45,
      environment: { primary: 'gym' },
      equipment: {
        type: 'specific',
        available: ['machines', 'light dumbbells', 'resistance bands', 'stability ball', 'TRX'],
      },
      injuries: ['Mild arthritis in knees', 'Previous hip replacement (left) - 3 years ago'],
      additionalInfo: 'Doctor cleared me for exercise. Want to stay active for grandkids.',
    },
  },
  {
    id: 'hybrid-professional',
    name: 'Busy Professional Hybrid',
    profile: {
      sex: 'other',
      age: 40,
      weight: 165,
      height: 68,
      experienceLevel: 'intermediate',
      trainingGoal: 'Improve endurance for hiking and maintain strength. Training for Mt. Rainier climb.',
      daysAvailable: 4,
      timePerSession: 60,
      environment: { primary: 'gym' },
      equipment: {
        type: 'full-gym',
        available: ['full gym', 'stair climber', 'rowing machine', 'trail access', 'weighted vest'],
      },
      additionalInfo: 'Travel frequently for work. Need exercises I can do in hotel gyms too.',
    },
  },
  {
    id: 'postpartum-recovery',
    name: 'Postpartum Recovery',
    profile: {
      sex: 'female',
      age: 34,
      weight: 170,
      height: 66,
      experienceLevel: 'intermediate',
      trainingGoal: 'Rebuild core strength, regain pre-pregnancy fitness. 6 months postpartum.',
      daysAvailable: 3,
      timePerSession: 40,
      environment: { primary: 'home' },
      equipment: {
        type: 'minimal',
        available: ['dumbbells (5-30 lbs)', 'resistance bands', 'yoga mat', 'pull-up bar'],
      },
      injuries: ['Diastasis recti (2 finger gap) - cleared by PT for exercise'],
      additionalInfo: 'Used to lift regularly before pregnancy. Cleared by doctor. Want to progress safely.',
    },
  },
];

// Full generation (original verbose approach)
const FULL_SYSTEM_PROMPT = `You are a world-class fitness coach. Create personalized training programs.
Rules:
- Only use exercises appropriate for user's equipment
- Never include exercises that conflict with injuries
- Order exercises: compound first, isolation last
Response: Valid JSON only, no markdown.`;

function buildFullPrompt(profile: UserProfile): string {
  const phaseCount = profile.experienceLevel === 'beginner' ? 1 : profile.experienceLevel === 'intermediate' ? 2 : 3;
  return `Create a ${phaseCount * 4}-week fitness program:

PROFILE:
- ${profile.sex}, ${profile.age}yo, ${profile.weight}lbs
- Experience: ${profile.experienceLevel}
- Goal: ${profile.trainingGoal}
- Days: ${profile.daysAvailable}/week, ${profile.timePerSession}min/session
- Environment: ${profile.environment.primary}
- Equipment: ${profile.equipment.available?.join(', ') || 'minimal'}
${profile.injuries?.length ? `- Injuries: ${profile.injuries.join(', ')}` : ''}
${profile.additionalInfo ? `- Notes: ${profile.additionalInfo}` : ''}

Return JSON:
{
  "name": "Program name",
  "description": "Overview",
  "totalWeeks": ${phaseCount * 4},
  "phases": [{
    "phaseNumber": 1,
    "name": "Phase name",
    "durationWeeks": 4,
    "focus": "Focus description",
    "explanation": "What this accomplishes",
    "expectations": "What to expect",
    "keyPoints": ["Point 1", "Point 2"],
    "splitType": "Full Body|Upper/Lower|PPL",
    "workouts": [{
      "dayNumber": 1,
      "name": "Workout A",
      "focus": "Focus",
      "warmup": {"duration": 5, "activities": ["Activity"]},
      "cooldown": {"duration": 5, "activities": ["Activity"]},
      "exercises": [{
        "name": "Exercise",
        "sets": 3,
        "measure": {"type": "reps", "value": 10},
        "restPeriod": 90,
        "equipment": ["dumbbell"],
        "alternatives": ["Alt"],
        "category": "primary|secondary|isolation",
        "intensity": "RPE 7",
        "notes": "Note",
        "instructions": ["Step 1", "Step 2"]
      }]
    }],
    "nutrition": {
      "dailyCalories": 2000,
      "macros": {"protein": 150, "carbs": 200, "fats": 70},
      "mealTiming": ["Timing note"],
      "notes": "Nutrition notes"
    },
    "progressionProtocol": ["Week 1-2: Focus on form"]
  }]
}`;
}

async function generateFull(profile: UserProfile): Promise<{
  program: unknown;
  timing: number;
  inputTokens: number;
  outputTokens: number;
}> {
  const prompt = buildFullPrompt(profile);
  const startTime = Date.now();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 16384,
    system: FULL_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const timing = Date.now() - startTime;
  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  let program: unknown;
  try {
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    program = JSON.parse(cleaned.trim());
  } catch {
    program = { error: 'Failed to parse JSON', raw: text.slice(0, 500) };
  }

  return {
    program,
    timing,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}

interface ComparisonResult {
  id: string;
  name: string;
  lean: {
    timing: number;
    aiTime: number;
    enrichTime: number;
    inputTokens: number;
    outputTokens: number;
    exerciseCount: number;
    program: unknown;
  };
  full: {
    timing: number;
    inputTokens: number;
    outputTokens: number;
    program: unknown;
  };
}

async function main() {
  const outputDir = path.join(__dirname, '../model-comparison-results');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const results: ComparisonResult[] = [];

  console.log('='.repeat(60));
  console.log('LEAN vs FULL GENERATION COMPARISON');
  console.log('='.repeat(60));
  console.log(`Testing ${TEST_PERSONAS.length} personas\n`);

  for (const persona of TEST_PERSONAS) {
    console.log(`\n[${persona.id}] ${persona.name}`);
    console.log('-'.repeat(50));

    const result: ComparisonResult = {
      id: persona.id,
      name: persona.name,
      lean: { timing: 0, aiTime: 0, enrichTime: 0, inputTokens: 0, outputTokens: 0, exerciseCount: 0, program: null },
      full: { timing: 0, inputTokens: 0, outputTokens: 0, program: null },
    };

    // Lean generation
    try {
      console.log('  Lean generation...');
      const leanResult = await generateProgramLean(persona.profile, undefined, { model: 'fast' });

      result.lean = {
        timing: leanResult.metadata.generationTimeMs,
        aiTime: leanResult.metadata.aiTimeMs,
        enrichTime: leanResult.metadata.enrichmentTimeMs,
        inputTokens: leanResult.metadata.inputTokens,
        outputTokens: leanResult.metadata.outputTokens,
        exerciseCount: leanResult.metadata.exerciseCount,
        program: leanResult.program,
      };

      console.log(`    ✓ ${(result.lean.timing / 1000).toFixed(1)}s (AI: ${(result.lean.aiTime / 1000).toFixed(1)}s, Enrich: ${(result.lean.enrichTime / 1000).toFixed(1)}s)`);
      console.log(`      ${result.lean.inputTokens}→${result.lean.outputTokens} tokens`);

      // Save lean output
      fs.writeFileSync(
        path.join(outputDir, `ab-${persona.id}-lean.json`),
        JSON.stringify(leanResult.program, null, 2)
      );
    } catch (error) {
      console.log(`    ✗ Lean error: ${error}`);
    }

    // Full generation
    try {
      console.log('  Full generation...');
      const fullResult = await generateFull(persona.profile);

      result.full = {
        timing: fullResult.timing,
        inputTokens: fullResult.inputTokens,
        outputTokens: fullResult.outputTokens,
        program: fullResult.program,
      };

      console.log(`    ✓ ${(result.full.timing / 1000).toFixed(1)}s`);
      console.log(`      ${result.full.inputTokens}→${result.full.outputTokens} tokens`);

      // Save full output
      fs.writeFileSync(
        path.join(outputDir, `ab-${persona.id}-full.json`),
        JSON.stringify(fullResult.program, null, 2)
      );
    } catch (error) {
      console.log(`    ✗ Full error: ${error}`);
    }

    // Comparison
    if (result.lean.timing && result.full.timing) {
      const speedup = result.full.timing / result.lean.timing;
      const tokenReduction = ((result.full.outputTokens - result.lean.outputTokens) / result.full.outputTokens * 100);
      console.log(`  → Lean is ${speedup.toFixed(1)}x faster, ${tokenReduction.toFixed(0)}% fewer output tokens`);
    }

    results.push(result);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));

  let leanTotal = 0, fullTotal = 0;
  let leanTokens = 0, fullTokens = 0;

  for (const r of results) {
    leanTotal += r.lean.timing;
    fullTotal += r.full.timing;
    leanTokens += r.lean.outputTokens;
    fullTokens += r.full.outputTokens;
  }

  const avgLean = leanTotal / results.length / 1000;
  const avgFull = fullTotal / results.length / 1000;

  console.log(`\nLean: ${(leanTotal / 1000).toFixed(1)}s total | avg ${avgLean.toFixed(1)}s | ${leanTokens} output tokens`);
  console.log(`Full: ${(fullTotal / 1000).toFixed(1)}s total | avg ${avgFull.toFixed(1)}s | ${fullTokens} output tokens`);
  console.log(`\nSpeedup: ${(fullTotal / leanTotal).toFixed(1)}x faster with lean`);
  console.log(`Token reduction: ${((fullTokens - leanTokens) / fullTokens * 100).toFixed(0)}% fewer output tokens`);

  // Save summary
  const summaryPath = path.join(outputDir, `ab-comparison-${timestamp}.json`);
  fs.writeFileSync(summaryPath, JSON.stringify({
    timestamp,
    summary: {
      leanTotalMs: leanTotal,
      fullTotalMs: fullTotal,
      speedup: fullTotal / leanTotal,
      leanOutputTokens: leanTokens,
      fullOutputTokens: fullTokens,
      tokenReduction: (fullTokens - leanTokens) / fullTokens,
    },
    results,
  }, null, 2));

  console.log(`\nResults saved to: ${outputDir}/ab-*.json`);
  console.log('\nCompare outputs side-by-side:');
  for (const r of results) {
    console.log(`  ${r.id}: ab-${r.id}-lean.json vs ab-${r.id}-full.json`);
  }
}

main().catch(console.error);
