import { User } from "@prisma/client";

export interface Program {
  id: string;
  name: string;
  description?: string;
  workoutPlans: WorkoutPlan[]; // phases
  user: User;
}

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
  day: number;
  dayNumber?: number;
  workoutPlanId?: string;
  exercises: Exercise[];
}

export interface Exercise {
  id?: string;
  workoutId?: string;
  name: string;
  sets: number;
  reps: number;
  restPeriod: string;
  category?: string;
  difficulty?: string;
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
  phase: number;
  bodyFatPercentage?: number;
  muscleMassDistribution?: string;
  dailyCalories?: number;
  proteinGrams?: number;
  carbGrams?: number;
  fatGrams?: number;
  mealTiming?: string[];
  progressionProtocol?: string[];
  daysPerWeek: number;
  workouts: Workout[];
  durationWeeks: number;
  contextRequest?: Array<{
    key: string;
    reason?: string;
    importance?: string;
  }>;
}

// Type guards
export type ValidPhaseCount<T extends Phase[]> = T extends { length: 3 | 4 } ? T : never;
export type ValidWorkoutCount<T extends Workout[]> = T extends { length: 3 | 4 } ? T : never; 