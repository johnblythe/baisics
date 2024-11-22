// Add new types for workout data
export type Exercise = {
  name: string;
  sets: number;
  reps: number;
  restPeriod: string;
};

export type Workout = {
  day: number;
  exercises: Exercise[];
};

export type WorkoutPlanData = {
  bodyComposition: {
    bodyFatPercentage: number;
    muscleMassDistribution: string;
  };
  workoutPlan: {
    daysPerWeek: number;
    workouts: Workout[];
  };
  nutrition: {
    dailyCalories: number;
    macros: {
      protein: number;
      carbs: number;
      fats: number;
    };
    mealTiming: string[];
  };
  progressionProtocol: string[];
};