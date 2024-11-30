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
      }>,
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
  }>,
  contextRequest: Array<{
    key: string,
    reason?: string,
    importance?: string
  }> & { length: 3 | 4 } // 3-4 phases. 4-6 weeks each.
}

Analysis Requirements:
1. Assess body composition from images providing numerical body fat estimate and muscle mass distribution
2. Design program matching client's available days, equipment, and preferences.
3. Design the program in phases. Include 3 or 4 distinct, sequential phases. Less than 3 phases is a bad response. More than 4 phases is a bad response. Designate their sequence in the 'phase' field. Use the interface prescribed above. Each should last 4-6 weeks.
4. Include detailed macronutrient recommendations.
5. Include progression protocols.
6. Structure all workouts with clear sets, reps, and rest periods. Use the "daily budget" information to determine how many exercises to include per workout.
7. Account for any stated injuries or limitations.

Your response will be rejected if:
- It contains fewer than 3 phases
- It contains more than 4 phases
- Any phase is shorter than 4 weeks
- Any phase is longer than 6 weeks
- Phases are not properly sequenced (1, 2, 3, [4])

The contextRequest section is for you to give the user feedback on what information could help make a better plan for them. Use the client data above to decide what is most important. Do not ask for information outside of those items.

Return a single JSON object following the interface exactly, with no additional text or explanation outside the structured response.`;

};