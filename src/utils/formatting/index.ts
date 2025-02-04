import { Workout, WorkoutPlan as WorkoutPlanHiType } from '@/types/program';

interface WorkoutPlan {
  workouts: Workout[];
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  dailyCalories: number;
}

// Add this utility function near the top of the file, after the type definitions
export const formatCamelCase = (str: string) => {
  return str
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim();
};

export const formatUnderscoreDelimitedString = (str: string) => {
  return str.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

// Utility function to convert inches to feet and inches
export const convertHeightToFeetAndInches = (heightInInches: number | undefined): string => {
  if (!heightInInches) return 'Not specified';
  const feet = Math.floor(heightInInches / 12);
  const inches = heightInInches % 12;
  return inches === 0 ? `${feet}′` : `${feet}′ ${inches}″`;
}


// Update macros display section to handle both structures
export const getMacros = (plan: WorkoutPlan | WorkoutPlanHiType) => {
  if ('proteinGrams' in plan) {
    return {
      protein: plan.proteinGrams,
      carbs: plan.carbGrams,
      fats: plan.fatGrams,
      calories: plan.dailyCalories
    };
  }
  return {
    protein: plan.nutrition.macros.protein,
    carbs: plan.nutrition.macros.carbs,
    fats: plan.nutrition.macros.fats,
    calories: plan.nutrition.dailyCalories
  };
};