import { IntakeFormData, AnalysisRequirements, ProgramStructure, WorkoutPlan } from '@/types';

const formatClientData = (intakeData: IntakeFormData) => `
- Sex: ${intakeData.sex || 'unspecified'}
- Training Goal: ${intakeData.trainingGoal}
- Days Available: ${intakeData.daysAvailable} per week
- Time available per day: ${intakeData.dailyBudget} minutes
- Age: ${intakeData.age || 'unspecified'}
- Weight: ${intakeData.weight || 'unspecified'}
- Height: ${intakeData.height || 'unspecified'}
- Training Preferences: ${intakeData.trainingPreferences?.join(', ') || 'none specified'}
${intakeData.additionalInfo ? `\nAdditional Context:\n${intakeData.additionalInfo}` : ''}`;

export const workoutProgramSchema = {
  programName: "string",
  programDescription: "string",
  phases: [{
    phase: "number",
    durationWeeks: "number",
    bodyComposition: {
      bodyFatPercentage: "number",
      muscleMassDistribution: "string"
    },
    trainingPlan: {
      daysPerWeek: "number",
      workouts: [{
        day: "number",
        exercises: [{
          name: "string",
          sets: "number",
          reps: "number",
          restPeriod: "string",
          category: "string",
          difficulty: "string"
        }]
      }]
    },
    nutrition: {
      dailyCalories: "number",
      macros: {
        protein: "number",
        carbs: "number",
        fats: "number"
      },
      mealTiming: ["string"]
    },
    progressionProtocol: ["string"]
  }]
};

export const generateInitialProgramPrompt = (intakeData: IntakeFormData) => {
  return `
  <client data>
${formatClientData(intakeData)}
  </client data>

  As a fitness expert, create a comprehensive training program following these strict requirements:
  1. The program MUST have exactly ${defaultAnalysisRequirements.phaseRequirements.minPhases} to ${defaultAnalysisRequirements.phaseRequirements.maxPhases} phases
  2. Each phase MUST be ${defaultAnalysisRequirements.phaseRequirements.minWeeksPerPhase}-${defaultAnalysisRequirements.phaseRequirements.maxWeeksPerPhase} weeks long
  3. Workouts MUST match client's available days (${intakeData.daysAvailable} per week)
  4. Each workout MUST fit within ${intakeData.dailyBudget} minutes

  Return a single JSON object matching this exact structure:
${JSON.stringify(workoutProgramSchema, null, 2)}`;
};

export const generateModificationPrompt = (
  currentProgram: any, 
  modificationRequest: string,
  intakeData: IntakeFormData
) => {
  // Helper to format exercises for prompt with null checks
  const formatExercises = (exercises: any[] = []) => {
    if (!Array.isArray(exercises)) return '';
    
    return exercises.map(e => {
      if (!e) return '';
      const { name = 'unknown', sets = '?', reps = '?', restPeriod = '?' } = e;
      return `        - ${name}: ${sets}x${reps}, rest ${restPeriod}`;
    }).filter(Boolean).join('\n');
  };

  // Create detailed phase breakdown with null checks
  const phaseDetails = currentProgram.workoutPlans.map((phase: any, i: number) => {
    if (!phase) return '';
    
    const {
      durationWeeks = '?',
      bodyFatPercentage = '?',
      muscleMassDistribution = '?',
      dailyCalories = '?',
      proteinGrams = '?',
      carbGrams = '?',
      fatGrams = '?',
      daysPerWeek = '?',
      progressionProtocol = [],
      mealTiming = [],
      workouts = []
    } = phase;

    return `
    Phase ${i + 1} (${durationWeeks} weeks):
    - Body Composition Target: ${bodyFatPercentage}% BF, ${muscleMassDistribution}
    - Nutrition: ${dailyCalories} calories (P:${proteinGrams}g, C:${carbGrams}g, F:${fatGrams}g)
    - Meal Timing: ${Array.isArray(mealTiming) ? mealTiming.join(', ') : ''}
    - Training Days: ${daysPerWeek} per week
    - Progression Protocol: ${Array.isArray(progressionProtocol) ? progressionProtocol.join(', ') : ''}
    
    Workouts:
    ${workouts.map((workout: any) => {
      if (!workout) return '';
      return `
      Day ${workout.dayNumber || '?'}:
${formatExercises(workout.exercises)}`;
    }).filter(Boolean).join('\n')}
  `}).filter(Boolean).join('\n');

  return `
  You are modifying an existing workout program. The client has requested: "${modificationRequest}"

  CURRENT PROGRAM DETAILS:
  ${phaseDetails}

  MODIFICATION REQUIREMENTS:
  1. Maintain exactly ${currentProgram.workoutPlans.length} phases
  2. Keep the same phase durations
  3. Preserve the overall progression logic between phases
  4. Stay within ${intakeData.dailyBudget} minutes per workout
  5. Maintain the core compound lifts in each phase
  6. Only modify elements specifically related to the client's request
  7. IMPORTANT: For each phase, you MUST include complete nutrition data:
     - Daily calorie targets
     - Macronutrient breakdown (protein, carbs, fats)
     - Meal timing recommendations
  8. If the modification request doesn't mention nutrition changes, keep the existing nutrition and meal timing data exactly as is

  Client Parameters:
  ${JSON.stringify(intakeData, null, 2)}

  Return a complete program JSON that matches the exact structure of the current program.
  Focus modifications ONLY on aspects mentioned in the client's request.
  
  Response must be valid JSON matching this structure:
  {
    "programName": "string",
    "programDescription": "string",
    "phases": [{
      "phase": number,
      "durationWeeks": number,
      "bodyComposition": { "bodyFatPercentage": number, "muscleMassDistribution": string },
      "trainingPlan": { "daysPerWeek": number, "workouts": [/* workouts */] },
      "nutrition": {
        "dailyCalories": number,
        "macros": { "protein": number, "carbs": number, "fats": number },
        "mealTiming": ["string"]
      },
      "progressionProtocol": ["string"]
    }]
  }`;
};

export const defaultAnalysisRequirements: AnalysisRequirements = {
  matchClientPreferences: true,
  phaseRequirements: {
    minPhases: 1, // TODO: change to 2
    maxPhases: 1, // TODO: change to 4
    minWeeksPerPhase: 4,
    maxWeeksPerPhase: 6
  },
  requireMacroRecommendations: true,
  requireProgressionProtocols: true,
  requireStructuredWorkouts: true,
  considerInjuryLimitations: true
};

//  ${defaultAnalysisRequirements.phaseRequirements.minPhases}-${defaultAnalysisRequirements.phaseRequirements.maxPhases} phases


export const newPrompt = (intakeData: IntakeFormData) => {
  return `
  Return a JSON object with this structure:
  {
    "promptInstructions": "Create a beginner-to-intermediate-friendly fitness program that prioritizes proper form, gradual progression, and sustainable habits. Focus on fundamental movement patterns and include clear instruction for exercise execution.",
    
    "requiredProgramStructure": {
      "phase": 1,
      "durationWeeks": "number (recommended 4-8 weeks for beginners)",
      "phaseExplanation": "string explaining why this phase is important for beginners",
      "phaseExpectations": [
        "what to expect physically",
        "common challenges for beginners",
        "realistic timeline for results",
        "importance of consistency over intensity"
      ],
      "phaseKeyPoints": [
        "3-5 fundamental success factors focusing on form, consistency, and basic progression"
      ]
    },

    "workoutRequirements": {
      "daysPerWeek": "number (client specified, validate 2-5 days only)", // ${intakeData.daysAvailable}
      "sessionDuration": "number (client specified, validate 30-60 minutes)", // ${intakeData.dailyBudget}
      "mandatoryWorkoutElements": {
        "warmup": "5-10 minutes dynamic warmup",
        "mainWork": "20-40 minutes primary exercises",
        "cooldown": "5-10 minutes mobility/stretching"
      },
      "exerciseSelectionRules": {
        "maximumExercisesPerWorkout": 10,
        "minimumExercisesPerWorkout": 4,
        "exerciseCategories": [
          "compound movements first",
          "isolation movements second",
          "core/stability work last"
        ],
        "mandatoryPatterns": [
          "push",
          "pull",
          "squat",
          "hinge",
          "core"
        ]
      }
    },

    "workoutStructure": {
      "fullWeekRequired": true,
      "weekConfiguration": {
        "daysAvailable": "number (${intakeData.daysAvailable})",
        "requiredWorkouts": "must match daysAvailable",
        "minimumWorkouts": "number (2 or greater)",
        "maximumWorkouts": "number (must not exceed ${intakeData.daysAvailable})",
        "restDayDistribution": "evenly spaced throughout week"
      },
      "workouts": [
        {
          "_comment": "This array MUST contain exactly the number of workouts specified in daysAvailable",
          "_validation": "Length of this array must be between minimumWorkouts and maximumWorkouts",
          "day": "number (1-7, must be unique)",
          "focus": "string (e.g., 'Push', 'Pull', 'Legs')",
          "warmup": {
            "duration": "number (minutes)",
            "activities": ["array of warmup exercises"]
          },
          "exercises": [
            {
              "name": "string (must be beginner or intermediate friendly)",
              "sets": "number (2-4)",
              "reps": "number (8-15)",
              "restPeriod": "string (60-120 seconds)",
              "category": "string (push/pull/legs/core)",
              "difficulty": "string (beginner/beginner-intermediate only)",
              "formCues": ["array of 2-3 key form points"],
              "modifications": {
                "easier": "string (regression option)",
                "harder": "string (progression option)"
              }
            }
          ],
          "cooldown": {
            "duration": "number (minutes)",
            "activities": ["array of cooldown exercises"]
          }
        }
      ],
      "workoutDistributionRules": {
        "2_days": ["Push/Pull", "Full Body"],
        "3_days": ["Push", "Pull", "Legs"],
        "4_days": ["Upper", "Lower", "Upper", "Lower"],
        "5_days": ["Push", "Pull", "Legs", "Upper", "Lower"]
      }
    },
    "nutritionGuidelines": {
      "dailyCalories": "number (based on goals)",
      "macros": {
        "protein": "0.8-1.2g per pound of bodyweight",
        "carbs": "40-50% of total calories",
        "fats": "20-30% of total calories"
      },
      "focusPoints": [
        "establishing consistent meal timing",
        "proper hydration (min 64oz daily)",
        "protein with each meal",
        "vegetables with main meals",
        "pre/post workout nutrition basics"
      ]
    },

    "progressionRules": [
      "form mastery before weight increase",
      "increase weight 2.5-5lbs when all sets completed with good form",
      "focus on rep quality over weight",
      "minimum 2 weeks at each weight before progression"
    ],

    "validationChecks": {
      "enforceRules": [
        "must include all specified training days",
        "must have minimum exercises per workout",
        "must include all fundamental movement patterns weekly",
        "must provide form cues for each exercise",
        "must include modifications for all exercises",
        "rest periods must be specified"
      ]
    },

    "followUpQuestions": [
      "array of strings (questions to ask the client to clarify the program further)"
    ]
  }
    Using the template above, create a workout program for someone with the following profile:
  ${formatClientData(intakeData)}
    
    Ensure that:
    1. All workouts fill up the required session duration with an appropriate amount of movements
    2. Each workout includes suggested warm-up and cool-down protocols
    3. Exercises focus on compound movements and progress to isolation movements for accessory work
    4. Form cues and modifications are provided for each exercise
    5. Weekly training covers all fundamental movement patterns unless otherwise requested by the client
    6. Generate a program NO MATTER WHAT. If you feel there is a discrepancy then note it in the followUpQuestions field for further user input
    7. The generated program has 3-5 workouts per week depending on the user's daysAvailable
    `
  ;
};

export const generateProgramStructurePrompt = (intakeData: IntakeFormData) => {
  return `
  Based on this client profile:
  ${formatClientData(intakeData)}

  Design a program structure that:
  1. Has 1 phase only
  2. Each phase ${defaultAnalysisRequirements.phaseRequirements.minWeeksPerPhase}-${defaultAnalysisRequirements.phaseRequirements.maxWeeksPerPhase} weeks
  3. Follows a logical progression toward the client's goals

  Return a JSON object with this structure:
  {
    "totalPhases": number,
    "phaseStructure": [{
      "phase": number,
      "durationWeeks": number,
      "focus": string,
      "progressionStrategy": string,
      "targetIntensity": string
    }],
    "overallProgression": string[],
    "estimatedTimePerWorkout": number
  }`;
};

// export const generatePhaseDetailsPrompt = (
//   intakeData: IntakeFormData,
//   programStructure: ProgramStructure,
//   phaseNumber: number,
//   currentPhase?: WorkoutPlan,
//   modificationRequest?: string
// ) => {
//   const phase = programStructure.phaseStructure[phaseNumber - 1];
  
//   let prompt = `
//   Create detailed workout and nutrition plans for Phase ${phaseNumber}:
//   Focus: ${phase.focus}
//   Duration: ${phase.durationWeeks} weeks
//   Target Intensity: ${phase.targetIntensity}

//   Client Profile:
//   - Sex: ${intakeData.sex || 'unspecified'}
//   - Age: ${intakeData.age || 'unspecified'}
//   - Weight: ${intakeData.weight || 'unspecified'} 
//   - Height: ${intakeData.height || 'unspecified'}
//   - Training Goal: ${intakeData.trainingGoal}
//   - Days Training: ${intakeData.daysAvailable} per week
//   - Daily Training Time: ${intakeData.dailyBudget} minutes

//   For this phase, provide:
//   1. A clear explanation of why this phase is important for the client's goals
//   2. What the client should expect during this phase (intensity, challenges, adaptations)
//   3. 3-5 key points for success in this phase
//   4. Detailed workout and nutrition plans

//   Return a JSON object for this phase matching this structure:
//   {
//     "phase": ${phaseNumber},
//     "durationWeeks": ${phase.durationWeeks},
//     "phaseExplanation": "string explaining why this phase is important and how it fits into the overall program",
//     "phaseExpectations": "string describing what the client should expect during this phase",
//     "phaseKeyPoints": ["array of 3-5 key points for success"],
//     "bodyComposition": {
//       "bodyFatPercentage": number,
//       "muscleMassDistribution": string
//     },
//     "trainingPlan": {
//       "daysPerWeek": ${intakeData.daysAvailable},
//       "workouts": [{
//         "day": number,
//         "exercises": [{
//           "name": string,
//           "sets": number,
//           "reps": number,
//           "restPeriod": string,
//           "category": string,
//           "difficulty": string
//         }]
//       }]
//     },
//     "nutrition": {
//       "dailyCalories": number,
//       "macros": {
//         "protein": number,
//         "carbs": number,
//         "fats": number
//       }
//     },
//     "progressionProtocol": ["${phase.progressionStrategy}"]
//   }`;

//   if (currentPhase && modificationRequest) {
//     prompt += `\n
//   MODIFICATION REQUEST: "${modificationRequest}"
  
//   CURRENT PHASE DETAILS:
//   - Current Body Fat Target: ${currentPhase.bodyFatPercentage}%
//   - Current Focus: ${currentPhase.muscleMassDistribution}
//   - Current Training Days: ${currentPhase.daysPerWeek}
//   - Current Nutrition:
//     * Daily Calories: ${currentPhase.dailyCalories}
//     * Protein: ${currentPhase.proteinGrams}g
//     * Carbs: ${currentPhase.carbGrams}g
//     * Fats: ${currentPhase.fatGrams}g
//   - Current Progression: ${Array.isArray(currentPhase.progressionProtocol) 
//       ? currentPhase.progressionProtocol.join(', ') 
//       : currentPhase.progressionProtocol || 'not specified'}
  
//   Maintain the core structure while incorporating the requested changes.
//   If no explicit request to change nutrition then DO NOT change the current nutrition values.`;
//   }
  
//   return prompt;
// };