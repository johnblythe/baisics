import { IntakeFormData, AnalysisRequirements, ProgramStructure, ModificationAnalysis, WorkoutPlan } from '@/types';

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
    minPhases: 1,
    maxPhases: 1,
    minWeeksPerPhase: 4,
    maxWeeksPerPhase: 6
  },
  requireMacroRecommendations: true,
  requireProgressionProtocols: true,
  requireStructuredWorkouts: true,
  considerInjuryLimitations: true
};

export const generateProgramStructurePrompt = (intakeData: IntakeFormData) => {
  return `
  Based on this client profile:
  ${formatClientData(intakeData)}

  Design a program structure that:
  1. Has ${defaultAnalysisRequirements.phaseRequirements.minPhases}-${defaultAnalysisRequirements.phaseRequirements.maxPhases} phases
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
  modificationRequest?: string,
  analysis?: ModificationAnalysis
) => {
  const phase = programStructure.phaseStructure[phaseNumber - 1];
  
  let prompt = `
  Create detailed workout and nutrition plans for Phase ${phaseNumber}:
  Focus: ${phase.focus}
  Duration: ${phase.durationWeeks} weeks
  Target Intensity: ${phase.targetIntensity}

  Client Profile for Nutrition Calculations:
  - Sex: ${intakeData.sex || 'unspecified'}
  - Age: ${intakeData.age || 'unspecified'}
  - Weight: ${intakeData.weight || 'unspecified'} 
  - Height: ${intakeData.height || 'unspecified'}
  - Training Goal: ${intakeData.trainingGoal}
  - Days Training: ${intakeData.daysAvailable} per week
  - Daily Training Time: ${intakeData.dailyBudget} minutes

  Client Constraints:
  - ${intakeData.daysAvailable} days per week
  - ${intakeData.dailyBudget} minutes per session`;

  if (currentPhase && modificationRequest) {
    const mealTimingDisplay = Array.isArray(currentPhase.mealTiming) 
      ? currentPhase.mealTiming.join(', ')
      : currentPhase.mealTiming || 'not specified';

    prompt += `\n
  MODIFICATION REQUEST: "${modificationRequest}"
  
  MODIFICATION ANALYSIS:
  - Type: ${analysis?.type}
  - Affects All Phases: ${analysis?.affectsAllPhases}
  ${analysis?.type === 'exercises' ? `
  - Exercise Changes:
    * Remove: ${analysis.details.exerciseChanges?.exercisesToRemove?.join(', ') || 'none'}
    * Add: ${analysis.details.exerciseChanges?.exercisesToAdd?.join(', ') || 'none'}
    * Modify: ${Object.entries(analysis.details.exerciseChanges?.exerciseModifications || {})
      .map(([exercise, mods]) => 
        `${exercise} (${Object.entries(mods)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')})`
      ).join(', ') || 'none'}`
    : ''}
  ${analysis?.type === 'nutrition' ? `
  - Nutrition Changes:
    * Calories: ${analysis.details.nutritionChanges?.calories ? 'yes' : 'no'}
    * Macros: ${analysis.details.nutritionChanges?.macros ? 'yes' : 'no'}
    * Meal Timing: ${analysis.details.nutritionChanges?.mealTiming ? 'yes' : 'no'}`
    : ''}
  ${analysis?.type === 'capacity' ? `
  - Capacity Changes:
    * Days per Week: ${analysis.details.capacityChanges?.daysPerWeek || 'unchanged'}
    * Time per Session: ${analysis.details.capacityChanges?.timePerSession || 'unchanged'}`
    : ''}
  
  CURRENT PHASE DETAILS:
  - Current Body Fat Target: ${currentPhase.bodyFatPercentage}%
  - Current Focus: ${currentPhase.muscleMassDistribution}
  - Current Training Days: ${currentPhase.daysPerWeek}
  - Current Nutrition:
    * Daily Calories: ${currentPhase.dailyCalories}
    * Protein: ${currentPhase.proteinGrams}g
    * Carbs: ${currentPhase.carbGrams}g
    * Fats: ${currentPhase.fatGrams}g
    * Meal Timing: ${mealTimingDisplay}
  - Current Progression: ${Array.isArray(currentPhase.progressionProtocol) 
      ? currentPhase.progressionProtocol.join(', ') 
      : currentPhase.progressionProtocol || 'not specified'}
  
  Maintain the core structure while incorporating the requested changes.
  If no nutrition changes are requested, keep the current nutrition values.
  If no exercise changes are requested, keep the current exercises.
  If no capacity changes are requested, keep the current schedule.`;
  }

  prompt += `\n
  Return a JSON object for this phase matching this structure:
  {
    "phase": ${phaseNumber},
    "durationWeeks": ${phase.durationWeeks},
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
      },
      "mealTiming": ["string"]
    },
    "progressionProtocol": ["${phase.progressionStrategy}"]
  }`;

  return prompt;
};