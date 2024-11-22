import { IntakeFormData } from './actions';

export const generateTrainingProgramPrompt = (intakeData: IntakeFormData) => {
  return `
  <primary data>
  Client Data:
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
  </primary data>
  As a fitness expert, analyze the provided images and client data to create a comprehensive training program. Your response must be a single JSON object matching this exact structure:

Interface Requirements:
{
  program: {
    bodyComposition: {
      bodyFatPercentage: number,
      muscleMassDistribution: string
    },
    workoutPlan: {
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
  },
  contextRequest: [{
    key: string,
    reason?: string,
    importance?: string
  }]
}

Analysis Requirements:
1. Assess body composition from images providing numerical body fat estimate and muscle mass distribution
2. Design program matching client's available days, equipment, and preferences.
3. Design the program in 3 distinct phases. Each should last 4-6 weeks. Note this.
4. Include detailed macronutrient recommendations.
5. Include progression protocols.
6. Structure all workouts with clear sets, reps, and rest periods. Use the "daily budget" information to determine how many exercises to include per workout.
7. Account for any stated injuries or limitations.

The contextRequest section is for you to give the user feedback on what information could help make a better plan for them. Use the <primary data> items to decide what is most important. Do not ask for information outside of those items.

Return a single JSON object following the interface exactly, with no additional text or explanation outside the structured response.`;

};