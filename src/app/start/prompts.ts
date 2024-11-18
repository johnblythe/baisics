import { IntakeFormData } from './actions';

export const generateTrainingProgramPrompt = (intakeData: IntakeFormData) => {
  return `
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
  contextRequest: string
}

Analysis Requirements:
1. Assess body composition from images providing numerical body fat estimate and muscle mass distribution
2. Design program matching client's available days, equipment, and preferences. Make it in multiple phases: at least 2, no more than 4.
3. Include detailed macronutrient recommendations.
4. Include progression protocols.
5. Structure all workouts with clear sets, reps, and rest periods. Use the "daily budget" information to determine how many exercises to include per workout.
6. Account for any stated injuries or limitations.

If any relevant information is missing, generate all of the above to the best of your ability but also note what information could be helpful for you. Wrap this context request in a JSON object with a key called "contextRequest".

Return a single JSON object following the interface exactly, with no additional text or explanation outside the structured response.`;

};

