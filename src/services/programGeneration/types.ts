/**
 * Unified Program Generation Types
 *
 * These types define the contract between:
 * - User intake (what we collect)
 * - AI generation (what we ask for)
 * - Database storage (what we save)
 */

// ============================================
// INPUT TYPES - What we collect from users
// ============================================

export interface UserProfile {
  // Required fields
  sex: 'male' | 'female' | 'other';
  trainingGoal: string;
  weight: number; // in lbs

  // Environment & equipment
  environment: {
    primary: 'gym' | 'home' | 'travel' | 'outdoors';
    secondary?: 'gym' | 'home' | 'travel' | 'outdoors';
    limitations?: string[];
  };
  equipment: {
    type: 'full-gym' | 'minimal' | 'bodyweight' | 'specific';
    available: string[];
  };

  // Optional fields
  age?: number;
  height?: number; // in inches
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  daysAvailable?: number; // 1-7
  timePerSession?: number; // in minutes

  // Style preferences
  style?: {
    primary: 'strength' | 'yoga' | 'cardio' | 'hybrid';
    secondary?: 'strength' | 'yoga' | 'cardio' | 'hybrid';
  };

  // Additional context
  injuries?: string[];
  preferences?: string[];
  additionalInfo?: string;
}

export interface GenerationContext {
  // For returning users - historical data
  previousPrograms?: {
    id: string;
    name: string;
    completionRate: number;
    goal: string;
  }[];

  // Recent check-in data
  recentCheckIn?: {
    weight?: number;
    bodyFat?: number;
    notes?: string;
    date: Date;
  };

  // User's specific requests
  modifications?: string;

  // Type of generation
  generationType: 'new' | 'similar' | 'new_focus' | 'fresh_start';
}

export interface GenerationRequest {
  userId: string;
  profile: UserProfile;
  context?: GenerationContext;
}

// ============================================
// OUTPUT TYPES - What the AI generates
// ============================================

export interface GeneratedExercise {
  name: string;
  sets: number;
  measure: {
    type: 'reps' | 'time' | 'distance';
    value: number;
    unit?: 'seconds' | 'minutes' | 'meters' | 'km' | 'miles';
  };
  restPeriod: number; // in seconds
  equipment: string[];
  alternatives: string[];
  category: 'primary' | 'secondary' | 'isolation' | 'cardio' | 'flexibility';
  intensity?: string;
  notes?: string;
  instructions?: string[]; // 2-3 form cues tailored to user's experience level
}

export interface GeneratedWorkout {
  dayNumber: number;
  name: string;
  focus: string;
  warmup: {
    duration: number;
    activities: string[];
  };
  cooldown: {
    duration: number;
    activities: string[];
  };
  exercises: GeneratedExercise[];
}

export interface GeneratedNutrition {
  dailyCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  mealTiming?: string[];
  notes?: string;
}

export interface GeneratedPhase {
  phaseNumber: number;
  name: string;
  durationWeeks: number;
  focus: string;
  explanation: string;
  expectations: string;
  keyPoints: string[];
  splitType: string;
  workouts: GeneratedWorkout[];
  nutrition: GeneratedNutrition;
  progressionProtocol: string[];
}

export interface GeneratedProgram {
  name: string;
  description: string;
  totalWeeks: number;
  phases: GeneratedPhase[];
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface GenerationResult {
  success: boolean;
  program?: GeneratedProgram;
  error?: string;
  metadata?: {
    generationTimeMs: number;
    tokensUsed?: number;
    model: string;
  };
}

// ============================================
// HELPER TYPES
// ============================================

export type WorkoutSplit =
  | 'Full Body'
  | 'Upper/Lower'
  | 'Push/Pull/Legs'
  | 'Bro Split'
  | 'Custom';

export type ExerciseCategory =
  | 'primary'
  | 'secondary'
  | 'isolation'
  | 'cardio'
  | 'flexibility';

export type MeasureType = 'reps' | 'time' | 'distance';

export type MeasureUnit = 'seconds' | 'minutes' | 'meters' | 'km' | 'miles';
