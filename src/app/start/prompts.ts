import { IntakeFormData } from './actions';

export const generateTrainingProgramPrompt = (intakeData: IntakeFormData) => {
  return `
  <client data>
- Images: [Attached if client included images]
- Sex: ${intakeData.sex}
- Training Goal: ${intakeData.trainingGoal}
- Days Available: ${intakeData.daysAvailable} per week
- Time available per day: ${intakeData.dailyBudget}
- Age: ${intakeData.age}
- Weight: ${intakeData.weight}
- Height: ${intakeData.height}
- Training Preferences: ${intakeData.trainingPreferences.join(', ')}
${intakeData.additionalInfo ? `- Additional Context: ${intakeData.additionalInfo}` : ''}
  </client data>
  As a fitness expert, analyze the provided images and client data to create a comprehensive training program. Your response must be a single JSON object matching this exact structure:

Interface Requirements:
{
  programName: string,
  programDescription: string,
  phases: Array<{
    phase: number, // the sequence for phases of the workout plans -- include 3-4 phases
    durationWeeks: number, // how long to do the given phase
    bodyComposition: {
      bodyFatPercentage: number,
      muscleMassDistribution: string
    },
    trainingPlan: {
      daysPerWeek: number,
      workouts: Array<{
        day: number,
        exercises: Array<{
          name: string,
          sets: number,
          reps: number,
          restPeriod: string,
          category: string,
          difficulty: string
        }>
      }> & { length: 3 | 4 } , // ideally 3-5, but based on the days available. if user inputs 3 then 3 is the max, but we should not do only 1
    },
    nutrition: {
      dailyCalories: number,
      macros: {
        protein: number,
        carbs: number,
        fats: number
      },
      mealTiming: string[]
    },
    progressionProtocol: string[]
  }> & { length: 3 | 4 } // 3-4 phases. 4-6 weeks each.
}

Analysis Requirements:
- Design program matching client's available days, equipment, and preferences.
- Design the program in phases. Include 3 or 4 distinct, sequential phases. Less than 3 phases is a bad response. More than 4 phases is a bad response. Designate their sequence in the 'phase' field. Use the interface prescribed above. Each should last 4-6 weeks.
- Include detailed macronutrient recommendations.
- Include progression protocols.
- Structure all workouts with clear sets, reps, and rest periods. Use the "daily budget" information to determine how many exercises to include per workout.
- Account for any stated injuries or limitations.

Your response will be rejected if:
- It contains fewer than 3 phases or more than 4 phases
- Any phase is shorter than 3 weeks or longer than 6 weeks
- Phases are not properly sequenced (1, 2, 3, [4])

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