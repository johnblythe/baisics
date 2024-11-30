export type ProgramData = {
  programName: string;
  programDescription: string;
  phases: PhasesData[];
};

// export type WorkoutPlanData = {
export type PhasesData = {
  phase: number;
  bodyComposition: {
    bodyFatPercentage: number;
    muscleMassDistribution: string;
  };
  duration?: number;
  trainingPlan: {
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
    // @TODO: future improvements
    // suggestedMeals?: string[];
    // suggestedSupplements?: string[];
  };
  progressionProtocol: string[];
};

export type WorkoutPlanDisplayProps = {
  plan: WorkoutPlan;
  userEmail?: string;
};

export type Exercise = {
  name: string;
  sets: number;
  reps: number;
  restPeriod: string;
  category?: string;
  difficulty?: string;
};

export type Workout = {
  day: number;
  exercises: Exercise[];
};

export type WorkoutPlan = {
  id: string;
  phase: number;
  bodyFatPercentage: number;
  muscleMassDistribution: string;
  dailyCalories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  mealTiming: string[];
  progressionProtocol: string[];
  daysPerWeek: number;
  workouts: Workout[];
  contextRequest?: Array<{
    key: string;
    reason?: string;
    importance?: string;
  }>;
};