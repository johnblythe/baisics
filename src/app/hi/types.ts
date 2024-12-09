export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ExtractedData {
  sex?: string;
  trainingGoal?: string;
  daysAvailable?: number;
  dailyBudget?: number;
  age?: number;
  weight?: number;
  height?: number;
  trainingPreferences?: string[];
  additionalInfo?: string;
  confidence: {
    [key: string]: number; // 0-1 confidence score for each field
  };
}

export interface ChatResponse {
  success: boolean;
  message: string;
  extractedData?: ExtractedData;
}

export interface IntakeFormData {
  trainingGoal: string;
  experienceLevel: string;
  daysAvailable: number;
  dailyBudget?: number;
  age?: number;
  weight?: number;
  height?: number;
  sex?: 'male' | 'female' | 'other';
  trainingPreferences?: string[];
  additionalInfo?: string;
} 

export interface WorkoutProgram {
  programName: string;
  programDescription: string;
  phases: Phase[];
  // analysisRequirements: AnalysisRequirements;
}

export interface Phase {
  phase: number;
  durationWeeks: number;
  bodyComposition: BodyComposition;
  trainingPlan: TrainingPlan;
  nutrition: Nutrition;
  progressionProtocol: string[];
}

export interface BodyComposition {
  bodyFatPercentage: number;
  muscleMassDistribution: string;
}

export interface TrainingPlan {
  daysPerWeek: number;
  workouts: Workout[];
}

export interface Workout {
  day: number;
  exercises: Exercise[];
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  restPeriod: string;
  category: string;
  difficulty: string;
}

export interface Nutrition {
  dailyCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  mealTiming: string[];
}

// Type guard to ensure proper phase count
export type ValidPhaseCount<T extends Phase[]> = T extends { length: 3 | 4 } ? T : never;

// Type guard to ensure proper workout count
export type ValidWorkoutCount<T extends Workout[]> = T extends { length: 3 | 4 } ? T : never;

export interface AnalysisRequirements {
  matchClientPreferences: boolean;  // Match days, equipment, preferences
  phaseRequirements: {
    minPhases: number;  // 3
    maxPhases: number;  // 4
    minWeeksPerPhase: number;  // 4
    maxWeeksPerPhase: number;  // 6
  };
  requireMacroRecommendations: boolean;
  requireProgressionProtocols: boolean;
  requireStructuredWorkouts: boolean;  // Sets, reps, rest periods
  considerInjuryLimitations: boolean;
}