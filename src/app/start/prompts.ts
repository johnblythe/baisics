import { IntakeFormData } from './actions';
import { AnalysisRequirements } from '@/app/hi/types';

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

export const generateTrainingProgramPrompt = (intakeData: IntakeFormData) => {
  return `
  <client data>
- Images: [Attached if client included images]
- Sex: male
- Training Goal: build muscle
- Days Available: 4 per week
- Time available per day: 60 minutes
- Age: 35
- Weight: 182
- Height: 6'0
- Training Preferences: free weights, machines, bodyweight
${intakeData.additionalInfo ? `
Additional Context:
${intakeData.additionalInfo}` : ''}
  </client data>

  As a fitness expert, analyze the provided client data to create a comprehensive training program. 
  If additional context is provided, ensure the program addresses any specific modifications or requirements mentioned.
  Your response must be a single JSON object matching this exact structure:

  Interface requirements:
${JSON.stringify(workoutProgramSchema, null, 2)}

Analysis Requirements:
- Design program matching client's available days, equipment, and preferences
- Design the program in 3 or 4 distinct, sequential phases
- Include detailed macronutrient recommendations
- Include progression protocols
- Structure all workouts with clear sets, reps, and rest periods
- Account for any stated injuries, limitations, or modification requests

Return a single JSON object following the interface exactly, with no additional text or explanation outside the structured response.`;

};

/**
 * Assess body composition from images providing numerical body fat estimate and muscle mass distribution
 * 
 * contextRequest: Array<{
    key: string,
    reason?: string,
    importance?: string
  }>

  The contextRequest section is for you to give the user feedback on what information could help make a better plan for them. Use the client data above to decide what is most important. Do not ask for information outside of those items.
 */

export const defaultAnalysisRequirements: AnalysisRequirements = {
  matchClientPreferences: true,
  phaseRequirements: {
    minPhases: 3,
    maxPhases: 4,
    minWeeksPerPhase: 4,
    maxWeeksPerPhase: 6
  },
  requireMacroRecommendations: true,
  requireProgressionProtocols: true,
  requireStructuredWorkouts: true,
  considerInjuryLimitations: true
};