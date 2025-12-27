/**
 * Model Quality Comparison Script
 *
 * Generates programs with Sonnet 4.5 vs Opus 4.5 for the same personas
 * to evaluate quality trade-offs before changing models.
 *
 * Run: npx tsx scripts/compare-models.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local manually
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Test personas covering diverse use cases
const TEST_PERSONAS = [
  {
    id: 'beginner-home',
    name: 'Beginner Home Workout',
    profile: {
      sex: 'female' as const,
      age: 32,
      weight: 145,
      height: 64, // 5'4"
      experienceLevel: 'beginner' as const,
      trainingGoal: 'Lose 20 lbs and build basic strength',
      daysAvailable: 3,
      timePerSession: 30,
      environment: {
        primary: 'home' as const,
        limitations: ['Small apartment, no jumping exercises - neighbors below'],
      },
      equipment: {
        type: 'minimal' as const,
        available: ['resistance bands', 'yoga mat', 'adjustable dumbbells (5-25 lbs)'],
      },
      style: { primary: 'strength' as const },
      injuries: ['Lower back tightness from desk job'],
      preferences: ['Morning workouts before work'],
      additionalInfo: 'First time working out consistently. Want something I can stick to.',
    },
  },
  {
    id: 'intermediate-gym',
    name: 'Intermediate Gym Goer',
    profile: {
      sex: 'male' as const,
      age: 28,
      weight: 185,
      height: 71, // 5'11"
      experienceLevel: 'intermediate' as const,
      trainingGoal: 'Build muscle mass, especially upper body. Currently stuck at bench 185 for reps.',
      daysAvailable: 5,
      timePerSession: 75,
      environment: {
        primary: 'gym' as const,
      },
      equipment: {
        type: 'full-gym' as const,
        available: ['full rack', 'barbells', 'dumbbells', 'cables', 'machines'],
      },
      style: { primary: 'strength' as const, secondary: 'hybrid' as const },
      injuries: ['Right shoulder impingement - no behind neck press'],
      preferences: ['Like supersets for time efficiency', 'Hate cardio machines'],
      additionalInfo: 'Been training 2 years, want to break through plateaus.',
    },
  },
  {
    id: 'advanced-athlete',
    name: 'Advanced Competitive Athlete',
    profile: {
      sex: 'male' as const,
      age: 35,
      weight: 200,
      height: 73, // 6'1"
      experienceLevel: 'advanced' as const,
      trainingGoal: 'Preparing for powerlifting meet in 12 weeks. Current maxes: S 405, B 285, D 455',
      daysAvailable: 4,
      timePerSession: 90,
      environment: {
        primary: 'gym' as const,
      },
      equipment: {
        type: 'full-gym' as const,
        available: ['competition rack', 'calibrated plates', 'deadlift platform', 'specialty bars', 'bands', 'chains'],
      },
      style: { primary: 'strength' as const },
      injuries: [],
      preferences: ['RPE-based training', 'Need accessory work for weak points (lockout, off the floor)'],
      additionalInfo: '83kg weight class. Need to peak properly for meet.',
    },
  },
  {
    id: 'senior-wellness',
    name: 'Active Senior',
    profile: {
      sex: 'female' as const,
      age: 67,
      weight: 155,
      height: 62, // 5'2"
      experienceLevel: 'beginner' as const,
      trainingGoal: 'Maintain bone density, improve balance, stay independent',
      daysAvailable: 4,
      timePerSession: 45,
      environment: {
        primary: 'gym' as const,
        secondary: 'home' as const,
      },
      equipment: {
        type: 'specific' as const,
        available: ['machines', 'light dumbbells', 'resistance bands', 'stability ball', 'TRX'],
      },
      style: { primary: 'strength' as const, secondary: 'flexibility' as const },
      injuries: ['Mild arthritis in knees', 'Previous hip replacement (left) - 3 years ago'],
      preferences: ['No floor exercises - hard to get up', 'Like swimming for cardio'],
      additionalInfo: 'Doctor cleared me for exercise. Want to stay active for grandkids.',
    },
  },
  {
    id: 'hybrid-busy-professional',
    name: 'Busy Professional Hybrid',
    profile: {
      sex: 'other' as const,
      age: 40,
      weight: 165,
      height: 68, // 5'8"
      experienceLevel: 'intermediate' as const,
      trainingGoal: 'Improve endurance for hiking and maintain strength. Training for Mt. Rainier climb.',
      daysAvailable: 4,
      timePerSession: 60,
      environment: {
        primary: 'gym' as const,
        secondary: 'outdoors' as const,
      },
      equipment: {
        type: 'full-gym' as const,
        available: ['full gym', 'stair climber', 'rowing machine', 'trail access', 'weighted vest'],
      },
      style: { primary: 'hybrid' as const, secondary: 'cardio' as const },
      injuries: [],
      preferences: ['Mix of strength and cardio', 'Weekend outdoor sessions'],
      additionalInfo: 'Travel frequently for work. Need exercises I can do in hotel gyms too.',
    },
  },
  {
    id: 'postpartum-recovery',
    name: 'Postpartum Recovery',
    profile: {
      sex: 'female' as const,
      age: 34,
      weight: 170,
      height: 66, // 5'6"
      experienceLevel: 'intermediate' as const,
      trainingGoal: 'Rebuild core strength, regain pre-pregnancy fitness. 6 months postpartum.',
      daysAvailable: 3,
      timePerSession: 40,
      environment: {
        primary: 'home' as const,
      },
      equipment: {
        type: 'minimal' as const,
        available: ['dumbbells (5-30 lbs)', 'resistance bands', 'yoga mat', 'pull-up bar'],
      },
      style: { primary: 'strength' as const },
      injuries: ['Diastasis recti (2 finger gap) - cleared by PT for exercise'],
      preferences: ['Need quiet exercises - baby naps', 'Short focused sessions'],
      additionalInfo: 'Used to lift regularly before pregnancy. Cleared by doctor. Want to progress safely.',
    },
  },
];

const SYSTEM_PROMPT = `You are a world-class fitness coach and exercise physiologist with 20+ years of experience creating personalized training programs.

Your role:
- Create comprehensive, science-based fitness programs
- Consider individual goals, limitations, and preferences
- Design programs that are safe, effective, and sustainable
- Provide clear exercise instructions and progression protocols

Rules:
- Only use exercises appropriate for the user's equipment and environment
- Never include exercises that conflict with stated injuries or limitations
- Always provide exercise alternatives for equipment flexibility
- Order exercises correctly: compound/primary movements first, isolation last
- Keep programs realistic and achievable for the user's experience level

Response format:
- Always respond with valid JSON matching the requested schema
- Do not include any text outside the JSON object
- Do not use markdown code blocks
- Ensure all required fields are present`;

function buildPrompt(profile: typeof TEST_PERSONAS[0]['profile']): string {
  const daysPerWeek = profile.daysAvailable || 3;
  const sessionDuration = profile.timePerSession || 60;
  const experienceLevel = profile.experienceLevel || 'beginner';

  const phaseCount = experienceLevel === 'beginner' ? 1 : experienceLevel === 'intermediate' ? 2 : 3;
  const weeksPerPhase = 4;
  const totalWeeks = phaseCount * weeksPerPhase;

  return `Create a complete ${totalWeeks}-week fitness program for this client:

CLIENT PROFILE:
- Sex: ${profile.sex}
- Age: ${profile.age || 'Not specified'}
- Weight: ${profile.weight} lbs
- Height: ${profile.height ? `${Math.floor(profile.height / 12)}'${profile.height % 12}"` : 'Not specified'}
- Experience level: ${experienceLevel}
- Primary goal: ${profile.trainingGoal}
- Days available: ${daysPerWeek} days/week
- Time per session: ${sessionDuration} minutes

ENVIRONMENT & EQUIPMENT:
- Primary environment: ${profile.environment.primary}
${profile.environment.secondary ? `- Secondary environment: ${profile.environment.secondary}` : ''}
- Equipment access: ${profile.equipment.type}
- Available equipment: ${profile.equipment.available.length > 0 ? profile.equipment.available.join(', ') : 'None specified'}
${profile.environment.limitations?.length ? `- Environment limitations: ${profile.environment.limitations.join(', ')}` : ''}

TRAINING STYLE:
- Primary style: ${profile.style?.primary || 'strength'}
${profile.style?.secondary ? `- Secondary style: ${profile.style.secondary}` : ''}

${profile.injuries?.length ? `INJURIES/LIMITATIONS:\n${profile.injuries.map((i) => `- ${i}`).join('\n')}` : ''}

${profile.preferences?.length ? `PREFERENCES:\n${profile.preferences.map((p) => `- ${p}`).join('\n')}` : ''}

${profile.additionalInfo ? `ADDITIONAL INFO:\n${profile.additionalInfo}` : ''}

PROGRAM REQUIREMENTS:
1. Create ${phaseCount} phase(s), each ${weeksPerPhase} weeks long
2. Each phase should have ${daysPerWeek} workouts per week
3. Sessions should fit within ${sessionDuration} minutes including warmup/cooldown
4. Exercises must use only the available equipment
5. Progress difficulty appropriately across phases
6. Include nutrition recommendations for each phase
7. Include 2-3 form instructions per exercise

EXERCISE ORDERING RULES (CRITICAL - MUST FOLLOW):
Exercises MUST be ordered by category:
1. PRIMARY first (squats, deadlifts, bench press, barbell rows, overhead press)
2. SECONDARY next (lunges, RDLs, incline press, pull-ups, dips)
3. ISOLATION last (bicep curls, tricep extensions, lateral raises, face pulls, ab work)

Valid category values: "primary" | "secondary" | "isolation" | "cardio" | "flexibility"

Return a JSON object with this exact structure:
{
  "name": "Program name that reflects the goal",
  "description": "2-3 sentence program overview",
  "totalWeeks": ${totalWeeks},
  "phases": [
    {
      "phaseNumber": 1,
      "name": "Phase name",
      "durationWeeks": ${weeksPerPhase},
      "focus": "Brief focus description",
      "explanation": "What this phase accomplishes and why",
      "expectations": "What the client should expect during this phase",
      "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
      "splitType": "Full Body | Upper/Lower | Push/Pull/Legs | etc.",
      "workouts": [
        {
          "dayNumber": 1,
          "name": "Workout A",
          "focus": "Primary focus of this workout",
          "warmup": { "duration": 5, "activities": ["Activity 1", "Activity 2"] },
          "cooldown": { "duration": 5, "activities": ["Activity 1", "Activity 2"] },
          "exercises": [
            {
              "name": "Exercise Name",
              "sets": 4,
              "measure": { "type": "reps", "value": 6 },
              "restPeriod": 180,
              "equipment": ["barbell", "rack"],
              "alternatives": ["Alt 1", "Alt 2"],
              "category": "primary",
              "intensity": "RPE 8",
              "notes": "Main compound lift",
              "instructions": ["Cue 1", "Cue 2", "Cue 3"]
            }
          ]
        }
      ],
      "nutrition": {
        "dailyCalories": 2500,
        "macros": { "protein": 180, "carbs": 250, "fats": 80 },
        "mealTiming": ["Pre-workout: 1-2 hours before"],
        "notes": "Nutrition guidance for this phase"
      },
      "progressionProtocol": ["Week 1-2: Focus on form", "Week 3-4: Increase weight"]
    }
  ]
}

Generate the complete program now. Response must be valid JSON only, no additional text.`;
}

async function generateProgram(
  persona: typeof TEST_PERSONAS[0],
  model: string
): Promise<{ program: unknown; timing: number; inputTokens: number; outputTokens: number }> {
  const prompt = buildPrompt(persona.profile);

  console.log(`  Generating with ${model}...`);
  const startTime = Date.now();

  const response = await client.messages.create({
    model,
    max_tokens: 16384,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const timing = Date.now() - startTime;
  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  let program: unknown;
  try {
    program = JSON.parse(text);
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

async function main() {
  const outputDir = path.join(__dirname, '../model-comparison-results');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const models = {
    sonnet: 'claude-sonnet-4-20250514',
    opus: 'claude-opus-4-5-20251101',
  };

  const results: Record<string, Record<string, unknown>> = {};

  console.log('='.repeat(60));
  console.log('MODEL COMPARISON: Sonnet 4.5 vs Opus 4.5');
  console.log('='.repeat(60));
  console.log(`Testing ${TEST_PERSONAS.length} personas\n`);

  for (const persona of TEST_PERSONAS) {
    console.log(`\n[${persona.id}] ${persona.name}`);
    console.log('-'.repeat(40));

    results[persona.id] = {
      name: persona.name,
      profile: persona.profile,
      generations: {},
    };

    for (const [modelKey, modelId] of Object.entries(models)) {
      try {
        const result = await generateProgram(persona, modelId);

        console.log(`  ${modelKey}: ${(result.timing / 1000).toFixed(1)}s | ${result.inputTokens}→${result.outputTokens} tokens`);

        (results[persona.id].generations as Record<string, unknown>)[modelKey] = {
          model: modelId,
          timing: result.timing,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          program: result.program,
        };

        // Save individual result immediately
        const filename = `${persona.id}-${modelKey}.json`;
        fs.writeFileSync(
          path.join(outputDir, filename),
          JSON.stringify(result.program, null, 2)
        );
      } catch (error) {
        console.error(`  ${modelKey}: ERROR - ${error}`);
        (results[persona.id].generations as Record<string, unknown>)[modelKey] = { error: String(error) };
      }
    }
  }

  // Save combined results
  const summaryPath = path.join(outputDir, `comparison-${timestamp}.json`);
  fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));

  let sonnetTotal = 0, opusTotal = 0;
  let sonnetTokens = 0, opusTokens = 0;

  for (const [id, data] of Object.entries(results)) {
    const gens = data.generations as Record<string, { timing?: number; outputTokens?: number }>;
    if (gens.sonnet?.timing) sonnetTotal += gens.sonnet.timing;
    if (gens.opus?.timing) opusTotal += gens.opus.timing;
    if (gens.sonnet?.outputTokens) sonnetTokens += gens.sonnet.outputTokens;
    if (gens.opus?.outputTokens) opusTokens += gens.opus.outputTokens;
  }

  console.log(`\nSonnet 4.5: ${(sonnetTotal / 1000).toFixed(1)}s total | avg ${(sonnetTotal / TEST_PERSONAS.length / 1000).toFixed(1)}s | ${sonnetTokens} tokens`);
  console.log(`Opus 4.5:   ${(opusTotal / 1000).toFixed(1)}s total | avg ${(opusTotal / TEST_PERSONAS.length / 1000).toFixed(1)}s | ${opusTokens} tokens`);
  console.log(`\nSpeed advantage: Sonnet is ${(opusTotal / sonnetTotal).toFixed(1)}x faster`);
  console.log(`\nResults saved to: ${outputDir}`);
}

main().catch(console.error);
