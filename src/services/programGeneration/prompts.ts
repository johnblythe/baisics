import type { UserProfile, GenerationContext } from './types';

/**
 * Unified Program Generation Prompts
 *
 * Single comprehensive prompt that generates a complete fitness program
 * in one AI call, rather than 6-10 sequential calls.
 */

export const SYSTEM_PROMPT = `You are a world-class fitness coach and exercise physiologist with 20+ years of experience creating personalized training programs.

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

export function buildGenerationPrompt(
  profile: UserProfile,
  context?: GenerationContext
): string {
  const daysPerWeek = profile.daysAvailable || 3;
  const sessionDuration = profile.timePerSession || 60;
  const experienceLevel = profile.experienceLevel || 'beginner';

  // Build context section for returning users
  let contextSection = '';
  if (context?.previousPrograms?.length) {
    const avgCompletion =
      context.previousPrograms.reduce((sum, p) => sum + p.completionRate, 0) /
      context.previousPrograms.length;

    contextSection = `
RETURNING USER CONTEXT:
- Previous programs completed: ${context.previousPrograms.length}
- Average completion rate: ${(avgCompletion * 100).toFixed(0)}%
- Most recent program goal: ${context.previousPrograms[0]?.goal || 'N/A'}
- Generation type: ${context.generationType}
${context.modifications ? `- Specific requests: ${context.modifications}` : ''}`;
  }

  if (context?.recentCheckIn) {
    contextSection += `
RECENT CHECK-IN DATA:
- Weight: ${context.recentCheckIn.weight || 'N/A'} lbs
- Body fat: ${context.recentCheckIn.bodyFat || 'N/A'}%
- Date: ${context.recentCheckIn.date}
${context.recentCheckIn.notes ? `- Notes: ${context.recentCheckIn.notes}` : ''}`;
  }

  // Calculate program duration based on experience
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
${contextSection}

PROGRAM REQUIREMENTS:
1. Create ${phaseCount} phase(s), each ${weeksPerPhase} weeks long
2. Each phase should have ${daysPerWeek} workouts per week
3. Sessions should fit within ${sessionDuration} minutes including warmup/cooldown
4. Exercises must use only the available equipment
5. Progress difficulty appropriately across phases
6. Include nutrition recommendations for each phase

EXERCISE ORDERING RULES (CRITICAL - MUST FOLLOW):
This is the most important rule. Exercises MUST be ordered by category:
1. PRIMARY first (squats, deadlifts, bench press, barbell rows, overhead press) - Heavy compound movements
2. SECONDARY next (lunges, RDLs, incline press, pull-ups, dips) - Supporting compound movements
3. ISOLATION last (bicep curls, tricep extensions, lateral raises, face pulls, ab work, core)

Valid category values: "primary" | "secondary" | "isolation" | "cardio" | "flexibility"

WRONG ORDER: Russian Twists → Face Pulls → Close-Grip Bench → Bulgarian Split Squats → Front Squat
CORRECT ORDER: Front Squat → Bulgarian Split Squats → Close-Grip Bench → Face Pulls → Russian Twists

The heaviest, most demanding exercises come FIRST when the user is fresh. Core and isolation work comes LAST.

ENVIRONMENT GROUPING RULES:
- Pool, yoga, and climbing exercises must be in separate workouts from gym exercises
- Cardio equipment can be mixed with strength training
- Minimize environment transitions within a single workout

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
          "warmup": {
            "duration": 5,
            "activities": ["Activity 1", "Activity 2"]
          },
          "cooldown": {
            "duration": 5,
            "activities": ["Activity 1", "Activity 2"]
          },
          "exercises": [
            {
              "name": "Back Squat",
              "sets": 4,
              "measure": { "type": "reps", "value": 6 },
              "restPeriod": 180,
              "equipment": ["barbell", "rack"],
              "alternatives": ["Goblet Squat", "Leg Press"],
              "category": "primary",
              "intensity": "RPE 8",
              "notes": "Main compound lift - do this FIRST"
            },
            {
              "name": "Romanian Deadlift",
              "sets": 3,
              "measure": { "type": "reps", "value": 10 },
              "restPeriod": 120,
              "equipment": ["barbell"],
              "alternatives": ["Dumbbell RDL"],
              "category": "secondary",
              "intensity": "RPE 7",
              "notes": "Secondary compound - after primary lifts"
            },
            {
              "name": "Leg Curl",
              "sets": 3,
              "measure": { "type": "reps", "value": 12 },
              "restPeriod": 60,
              "equipment": ["machine"],
              "alternatives": ["Nordic Curl"],
              "category": "isolation",
              "intensity": "RPE 7",
              "notes": "Isolation work - do LAST"
            }
          ]
        }
      ],
      "nutrition": {
        "dailyCalories": 2500,
        "macros": {
          "protein": 180,
          "carbs": 250,
          "fats": 80
        },
        "mealTiming": ["Pre-workout: 1-2 hours before", "Post-workout: within 1 hour"],
        "notes": "Nutrition guidance for this phase"
      },
      "progressionProtocol": [
        "Week 1-2: Focus on form, moderate weight",
        "Week 3-4: Increase weight by 5-10% if form is solid"
      ]
    }
  ]
}

Generate the complete program now. Response must be valid JSON only, no additional text.`;
}

/**
 * Prompt for generating just the remaining phases if initial response was truncated
 */
export function buildContinuationPrompt(
  profile: UserProfile,
  existingPhases: unknown[],
  remainingPhaseCount: number
): string {
  return `Continue generating the fitness program. You already generated ${existingPhases.length} phase(s).

Generate the remaining ${remainingPhaseCount} phase(s) following the same structure and building on the previous phases.

CLIENT PROFILE (reminder):
- Goal: ${profile.trainingGoal}
- Experience: ${profile.experienceLevel || 'beginner'}
- Days available: ${profile.daysAvailable || 3}
- Equipment: ${profile.equipment.type}

PREVIOUS PHASES SUMMARY:
${JSON.stringify(existingPhases, null, 2)}

Generate ONLY the remaining phases in this JSON format:
{
  "phases": [
    // Phase ${existingPhases.length + 1} onwards...
  ]
}

Response must be valid JSON only.`;
}
