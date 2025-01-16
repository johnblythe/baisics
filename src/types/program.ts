import { User, UserImages } from "@prisma/client";

export interface Program {
  id: string;
  name: string;
  description?: string;
  workoutPlans: WorkoutPlan[];
  user: Partial<User>;
  userImages?: UserImages[];
}

// used in /start
export interface ProgramData {
  programName: string;
  programDescription: string;
  phases: Phase[];
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
  id?: string;
  name?: string;
  day: number;
  dayNumber: number;
  workoutPlanId?: string;
  exercises: Exercise[];
  focus?: string;
  warmup?: {
    duration: number;
    activities: string[];
  };
  cooldown?: {
    duration: number;
    activities: string[];
  };
}

export interface Exercise {
  id?: string;
  workoutId?: string;
  name: string;
  sets: number;
  measure: {
    type: 'reps' | 'time' | 'distance';
    value: number;
    unit?: 'seconds' | 'minutes' | 'meters' | 'km' | 'miles';
  };
  reps?: number;
  restPeriod: number;  // in seconds
  equipment: string[];
  alternatives: string[];
  category?: string;
  exerciseLibraryId?: string;
  intensity?: string;  // e.g. "moderate", "high", "RPE 8", "70% 1RM"
  notes?: string;     // form cues, tempo guidance, or other trainer tips
}

export interface Nutrition {
  dailyCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  mealTiming?: string[];
}

export interface WorkoutPlan {
  id: string;
  workouts: Workout[];
  nutrition: Nutrition;
  phase?: number;
  phaseExplanation: string;
  phaseExpectations: string;
  phaseKeyPoints: string[];
  splitType?: string;
}

// Type guards
export type ValidPhaseCount<T extends Phase[]> = T extends { length: 3 | 4 } ? T : never;
export type ValidWorkoutCount<T extends Workout[]> = T extends { length: 3 | 4 } ? T : never; 