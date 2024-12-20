import { User } from "@prisma/client";

// Base program interface that matches database schema
export interface Program {
  id: string;
  name: string;
  description?: string;
  workoutPlans: WorkoutPlan[]; // Each workout plan represents a phase
  user: User;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for AI response format
export interface ProgramAIResponse {
  programName: string;
  programDescription: string;
  phases: PhaseData[]; // AI returns phases which we transform to workoutPlans
}

// Represents a single phase's data from AI
export interface PhaseData {
  phase: number;
  durationWeeks: number;
  bodyComposition: BodyComposition;
  trainingPlan: TrainingPlan;
  nutrition: Nutrition;
  progressionProtocol: string[];
}

// Database and display model for a workout plan (phase)
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
  createdAt?: Date;
  updatedAt?: Date;
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
  createdAt?: Date;
  updatedAt?: Date;
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
  createdAt?: Date;
  updatedAt?: Date;
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

// Type for program modifications
export type ModificationType = 'exercises' | 'nutrition' | 'capacity' | 'multiple';

export interface ModificationAnalysis {
  type: ModificationType;
  details: {
    exerciseChanges?: {
      exercisesToRemove?: string[];
      exercisesToAdd?: string[];
      exerciseModifications?: {
        [key: string]: {
          sets?: number;
          reps?: number;
          restPeriod?: string;
        };
      };
    };
    nutritionChanges?: {
      calories?: boolean;
      macros?: boolean;
      mealTiming?: boolean;
    };
    capacityChanges?: {
      daysPerWeek?: number;
      timePerSession?: number;
    };
  };
  affectsAllPhases: boolean;
  subRequests?: string[];
  confidence: number;
}