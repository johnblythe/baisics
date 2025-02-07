import { User, UserImages, UserStats, UserIntake, WorkoutLog, Program as PrismaProgram } from "@prisma/client";

export interface Program {
  id: string;
  name: string;
  description?: string | null;
  workoutPlans: WorkoutPlan[];
  user: Partial<User>;
  userImages?: UserImages[];
  createdAt?: Date;
  startDate?: Date;
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
  measureType?: string;
  measureUnit?: string;
  measureValue?: number;
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

export interface ProgramGenerationRequest {
  // Current Stats (based on UserStats model)
  currentStats: Partial<Pick<UserStats, 
    | 'weight' 
    | 'bodyFatLow'
    | 'bodyFatHigh'
    | 'muscleMassDistribution'
    | 'chest'
    | 'waist'
    | 'hips'
    | 'bicepLeft'
    | 'bicepRight'
    | 'thighLeft'
    | 'thighRight'
    | 'calfLeft'
    | 'calfRight'
  >>;

  // Training Preferences (based on UserIntake model)
  trainingPreferences: Pick<UserIntake, 
    | 'trainingGoal'
    | 'daysAvailable'
    | 'experienceLevel'
    | 'trainingPreferences'
  > & {
    environment: 'gym' | 'home' | 'travel' | 'outdoors';
    equipmentAccess: {
      type: 'full-gym' | 'minimal' | 'bodyweight' | 'specific';
      available: string[];
    };
    style: {
      primary: 'strength' | 'yoga' | 'cardio' | 'hybrid';
      secondary?: 'strength' | 'yoga' | 'cardio' | 'hybrid';
    };
    limitations?: string[];
  };

  // Historical Performance
  historicalData?: {
    previousPrograms: Array<{
      programId: string;
      completionRate: number;
      startDate: Date;
      endDate?: Date;
    }>;
    exerciseProgress?: Array<{
      exerciseName: string;
      maxWeight?: number;
      maxReps?: number;
      lastPerformed?: Date;
    }>;
    adherenceMetrics?: {
      averageWorkoutsPerWeek: number;
      consistentDays: string[];
      averageWorkoutDuration: number;
    };
  };

  // Context for Program Generation
  context?: {
    lastCheckInDate?: Date;
    recentInjuries?: string[];
    equipmentChanges?: string[];
    scheduleChanges?: string[];
    specificRequests?: string;
  };
}

// API Types
export interface GenerationDataResponse {
  currentStats: ProgramGenerationRequest['currentStats'];
  trainingPreferences: ProgramGenerationRequest['trainingPreferences'];
  historicalData: ProgramGenerationRequest['historicalData'];
  context: ProgramGenerationRequest['context'];
}

export interface GenerateProgramRequest {
  generationData: ProgramGenerationRequest;
  modifications?: {
    updateGoal?: string;
    updateDays?: number;
    updateEquipment?: string[];
    specificRequests?: string;
  };
}

export interface PreviewProgramRequest {
  generationData: ProgramGenerationRequest;
}

export interface SaveProgramRequest {
  program: ProgramData;
  startDate?: Date;
}

// User Stats Types (moved from user endpoints)
export interface UserProgramStats {
  totalWorkouts: number;
  favoriteExercises: string[];
  bestPerformingExercises: Array<{
    name: string;
    progressionRate: number;
  }>;
  consistencyMetrics: {
    averageWorkoutsPerWeek: number;
    mostConsistentDays: string[];
    averageCompletionRate: number;
  };
  programId?: string; // Optional: to filter stats for a specific program
}

export interface UserProgramHistory {
  programs: Array<{
    id: string;
    name: string;
    startDate: Date;
    endDate?: Date;
    completionRate: number;
    performance: {
      workoutsCompleted: number;
      averageIntensity: number;
      progressPhotos: number;
    };
  }>;
  programId?: string; // Optional: to filter history for a specific program
} 