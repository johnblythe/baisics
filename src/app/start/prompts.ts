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

export const generatePhaseDetailsPrompt = (
  intakeData: IntakeFormData,
  programStructure: ProgramStructure,
  phaseNumber: number,
  currentPhase?: WorkoutPlan,
  modificationRequest?: string
) => {
  const phase = programStructure.phaseStructure[phaseNumber - 1];
  
  let prompt = `
  Create detailed workout and nutrition plans for Phase ${phaseNumber}:
  Focus: ${phase.focus}
  Duration: ${phase.durationWeeks} weeks
  Target Intensity: ${phase.targetIntensity}

  Client Profile:
  - Sex: ${intakeData.sex || 'unspecified'}
  - Age: ${intakeData.age || 'unspecified'}
  - Weight: ${intakeData.weight || 'unspecified'} 
  - Height: ${intakeData.height || 'unspecified'}
  - Training Goal: ${intakeData.trainingGoal}
  - Days Training: ${intakeData.daysAvailable} per week
  - Daily Training Time: ${intakeData.dailyBudget} minutes

  For this phase, provide:
  1. A clear explanation of why this phase is important for the client's goals
  2. What the client should expect during this phase (intensity, challenges, adaptations)
  3. 3-5 key points for success in this phase
  4. Detailed workout and nutrition plans

  Return a JSON object for this phase matching this structure:
  {
    "phase": ${phaseNumber},
    "durationWeeks": ${phase.durationWeeks},
    "phaseExplanation": "string explaining why this phase is important and how it fits into the overall program",
    "phaseExpectations": "string describing what the client should expect during this phase",
    "phaseKeyPoints": ["array of 3-5 key points for success"],
    "bodyComposition": {
      "bodyFatPercentage": number,
      "muscleMassDistribution": string
    },
    "trainingPlan": {
      "daysPerWeek": ${intakeData.daysAvailable},
      "workouts": [{
        "day": number,
        "exercises": [{
          "name": string,
          "sets": number,
          "reps": number,
          "restPeriod": string,
          "category": string,
          "difficulty": string
        }]
      }]
    },
    "nutrition": {
      "dailyCalories": number,
      "macros": {
        "protein": number,
        "carbs": number,
        "fats": number
      }
    },
    "progressionProtocol": ["${phase.progressionStrategy}"]
  }`;

  if (currentPhase && modificationRequest) {
    prompt += `\n
  MODIFICATION REQUEST: "${modificationRequest}"
  
  CURRENT PHASE DETAILS:
  - Current Body Fat Target: ${currentPhase.bodyFatPercentage}%
  - Current Focus: ${currentPhase.muscleMassDistribution}
  - Current Training Days: ${currentPhase.daysPerWeek}
  - Current Nutrition:
    * Daily Calories: ${currentPhase.dailyCalories}
    * Protein: ${currentPhase.proteinGrams}g
    * Carbs: ${currentPhase.carbGrams}g
    * Fats: ${currentPhase.fatGrams}g
  - Current Progression: ${Array.isArray(currentPhase.progressionProtocol) 
      ? currentPhase.progressionProtocol.join(', ') 
      : currentPhase.progressionProtocol || 'not specified'}
  
  Maintain the core structure while incorporating the requested changes.
  If no explicit request to change nutrition then DO NOT change the current nutrition values.`;
  }
  
  return prompt;
};