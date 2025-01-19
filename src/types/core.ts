// Base Types (matching Prisma schema)
import { User } from '@prisma/client';

export interface BaseProgram {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseWorkoutPlan {
  id: string;
  userId: string;
  programId: string;
  daysPerWeek: number;
  dailyCalories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  mealTiming: string[];
  progressionProtocol: string[];
  phase: number;
  phaseExplanation?: string;
  phaseExpectations?: string;
  phaseKeyPoints: string[];
  splitType?: string;
  createdAt: Date;
}

export interface BaseWorkout {
  id: string;
  name: string;
  focus: string;
  warmup?: string; // JSON string in DB
  cooldown?: string; // JSON string in DB
  workoutPlanId: string;
  dayNumber: number;
  createdAt: Date;
}

export interface BaseExercise {
  id: string;
  workoutId: string;
  exerciseLibraryId: string;
  name: string;
  sets: number;
  reps?: number;
  restPeriod: number;
  intensity?: number;
  measureType: 'REPS' | 'TIME' | 'DISTANCE' | 'WEIGHT' | 'BODY_WEIGHT';
  measureValue?: number;
  measureUnit?: 'KG' | 'LB' | 'PERCENT' | 'SECONDS' | 'METERS' | 'KILOMETERS';
  notes?: string;
}

// Utility Types for parsed/transformed data
export interface ParsedWarmupCooldown {
  duration?: number;
  activities?: string[];
}

export interface NutritionPlan {
  dailyCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  mealTiming?: string[];
}

export interface ProgressPhoto {
  id: string;
  url: string;
  type: 'FRONT' | 'BACK' | 'SIDE_LEFT' | 'SIDE_RIGHT' | 'CUSTOM' | null;
}

// Runtime/Display Types
export interface TransformedProgram extends Omit<BaseProgram, 'createdAt' | 'updatedAt'> {
  workoutPlans: TransformedWorkoutPlan[];
  user: Partial<User>;
  currentWeight?: number;
  startWeight?: number;
  progressPhotos?: ProgressPhoto[];
  checkIns?: Array<{
    id: string;
    date: string;
    type: 'initial' | 'progress' | 'end';
  }>;
  workoutLogs?: Array<{
    id: string;
    workoutId: string;
    completedAt: string;
  }>;
  activities?: Array<{
    id: string;
    timestamp: string;
    type: string;
    metadata?: Record<string, any>;
  }>;
}

export interface TransformedWorkoutPlan extends Omit<BaseWorkoutPlan, 'createdAt'> {
  workouts: TransformedWorkout[];
  nutrition: NutritionPlan;
  bodyFatPercentage?: number;
  muscleMassDistribution?: string;
}

export interface TransformedWorkout extends Omit<BaseWorkout, 'createdAt' | 'warmup' | 'cooldown'> {
  exercises: TransformedExercise[];
  warmup?: ParsedWarmupCooldown;
  cooldown?: ParsedWarmupCooldown;
}

export interface TransformedExercise extends Omit<BaseExercise, 'measureType' | 'measureValue' | 'measureUnit'> {
  measure?: {
    type: 'reps' | 'time' | 'distance';
    value: number;
    unit?: 'seconds' | 'minutes' | 'meters' | 'km' | 'miles';
  };
  equipment?: string[];
  alternatives?: string[];
  category?: string;
}

// Type Guards
export function isTransformedProgram(program: any): program is TransformedProgram {
  return program && 
    typeof program.id === 'string' && 
    typeof program.name === 'string' &&
    Array.isArray(program.workoutPlans);
}

// Helper Types
export type DateToString<T> = {
  [K in keyof T]: T[K] extends Date ? string : T[K];
};

export type APIResponse<T> = DateToString<T>;

// Creation Types (for AI/initial program creation)
export interface ProgramData {
  programName: string;
  programDescription: string;
  phases: Phase[];
}

export interface Phase {
  phase: number;
  durationWeeks: number;
  bodyComposition: {
    bodyFatPercentage: number;
    muscleMassDistribution: string;
  };
  trainingPlan: {
    daysPerWeek: number;
    workouts: Omit<TransformedWorkout, 'id' | 'workoutPlanId' | 'createdAt'>[];
  };
  nutrition: NutritionPlan;
  progressionProtocol: string[];
} 