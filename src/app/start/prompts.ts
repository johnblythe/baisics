import { IntakeFormData } from './actions';

export const generateTrainingProgramPrompt = (intakeData: IntakeFormData) => {
  return `As a fitness expert, analyze the provided images and client data to create a comprehensive training program. Your response must be a single JSON object matching this exact structure:

Interface Requirements:
{
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
}

Analysis Requirements:
1. Assess body composition from images providing numerical body fat estimate and muscle mass distribution
2. Design program matching client's available days, equipment, and preferences
3. Include detailed nutrition and progression protocols
4. Structure all workouts with clear sets, reps, and rest periods
5. Account for any stated injuries or limitations

Client Data:
- Images: [Attached]
- Sex: ${intakeData.sex}
- Training Goal: ${intakeData.trainingGoal}
- Days Available: ${intakeData.daysAvailable} per week
- Time available per day: ${intakeData.dailyBudget}
- Age: ${intakeData.age}
- Weight: ${intakeData.weight}
- Height: ${intakeData.height}
- Training Preferences: ${intakeData.trainingPreferences.join(', ')}
${intakeData.additionalInfo ? `- Additional Context: ${intakeData.additionalInfo}` : ''}

Return a single JSON object following the interface exactly, with no additional text or explanation outside the structured response.`;
};

