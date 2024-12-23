import { User } from "@prisma/client";

export interface Program {
  id: string;
  name: string;
  description?: string;
  workoutPlans: newWorkoutPlan[];
  user: User;
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
  day: number;
  dayNumber?: number;
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
  reps: number;
  restPeriod: string;
  exerciseLibraryId?: string;
  category?: string;
  difficulty?: string;
  formCues?: string[];
  modifications?: {
    easier: string;
    harder: string;
  };
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

export interface newWorkoutPlan {
  id: string;
  nutrition: Nutrition;
  workouts: Workout[];
  // todo: user composition / profile / stats / etc
}

// export interface _WorkoutPlan {
//   id: string;
//   phase: number;
//   bodyFatPercentage?: number;
//   muscleMassDistribution?: string;
//   dailyCalories?: number;
//   proteinGrams?: number;
//   carbGrams?: number;
//   fatGrams?: number;
//   mealTiming?: string[];
//   progressionProtocol?: string[];
//   daysPerWeek: number;
//   workouts: Workout[];
//   durationWeeks: number;
//   phaseExplanation?: string;
//   phaseExpectations?: string;
//   phaseKeyPoints?: string[];
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// Type guards
export type ValidPhaseCount<T extends Phase[]> = T extends { length: 3 | 4 } ? T : never;
export type ValidWorkoutCount<T extends Workout[]> = T extends { length: 3 | 4 } ? T : never; 