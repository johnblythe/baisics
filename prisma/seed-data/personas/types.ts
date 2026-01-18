/**
 * Persona Seed Types
 * Type definitions for test persona seed data
 */

import { SubscriptionStatus, MilestoneType } from '@prisma/client';

// ============ Helper Types ============

/**
 * Relative date specification for seed data
 * Allows expressing dates relative to "now" for consistent seeding
 */
export type RelativeDate = {
  daysAgo: number;
  hour?: number; // Optional hour of day (0-23)
  minute?: number;
};

/**
 * Set data for workout logs
 */
export type SetLogSeed = {
  setNumber: number;
  weight?: number; // Optional for bodyweight
  reps: number;
  notes?: string;
};

/**
 * Exercise log with set data
 */
export type ExerciseLogSeed = {
  exerciseName: string; // Matches ExerciseLibrary.name
  skipped?: boolean; // If true, exercise was skipped
  notes?: string;
  sets?: SetLogSeed[];
};

/**
 * Workout log seed data
 */
export type WorkoutLogSeed = {
  workoutDayNumber: number; // Matches Workout.dayNumber
  startedAt: RelativeDate;
  completedAt?: RelativeDate;
  status: 'in_progress' | 'completed' | 'abandoned';
  notes?: string;
  quickLog?: boolean;
  exerciseLogs?: ExerciseLogSeed[];
};

/**
 * Check-in with stats
 */
export type CheckInSeed = {
  type: 'initial' | 'progress' | 'end';
  date: RelativeDate;
  notes?: string;
  stats?: UserStatsSeed;
};

/**
 * User stats snapshot
 */
export type UserStatsSeed = {
  weight?: number;
  bodyFatLow?: number;
  bodyFatHigh?: number;
  notes?: string;
  // Wellness
  sleepHours?: number;
  sleepQuality?: number;
  energyLevel?: number;
  stressLevel?: number;
  soreness?: number;
  recovery?: number;
  // Measurements
  chest?: number;
  waist?: number;
  hips?: number;
  bicepLeft?: number;
  bicepRight?: number;
};

/**
 * Subscription seed data
 */
export type SubscriptionSeed = {
  status: SubscriptionStatus;
  currentPeriodStartDaysAgo: number;
  currentPeriodEndDaysAhead: number;
  cancelAtPeriodEnd?: boolean;
};

/**
 * Exercise definition for workout plan
 */
export type ExerciseSeed = {
  name: string; // Must match ExerciseLibrary.name
  sets: number;
  reps?: number;
  restPeriod?: number;
  intensity?: number;
  notes?: string;
  sortOrder?: number;
};

/**
 * Workout definition in workout plan
 */
export type WorkoutSeed = {
  name: string;
  focus: string;
  dayNumber: number;
  warmup?: string;
  cooldown?: string;
  exercises: ExerciseSeed[];
};

/**
 * Workout plan seed
 */
export type WorkoutPlanSeed = {
  daysPerWeek: number;
  dailyCalories?: number;
  proteinGrams?: number;
  carbGrams?: number;
  fatGrams?: number;
  phase?: number;
  phaseName?: string;
  phaseDurationWeeks?: number;
  phaseExplanation?: string;
  splitType?: string;
  workouts: WorkoutSeed[];
};

/**
 * Milestone achievement seed
 */
export type MilestoneSeed = {
  type: MilestoneType;
  earnedAtDaysAgo: number;
  totalWorkouts: number;
  totalVolume?: number;
};

/**
 * User intake/profile data
 */
export type UserIntakeSeed = {
  sex: string;
  trainingGoal: string;
  daysAvailable: number;
  dailyBudget?: number;
  experienceLevel?: string;
  age?: number;
  weight?: number;
  height?: number;
  trainingPreferences?: string[];
  additionalInfo?: string;
};

/**
 * User seed data
 */
export type UserSeed = {
  email: string;
  name?: string;
  isPremium: boolean;
  // Streaks
  streakCurrent: number;
  streakLongest: number;
  streakLastActivityAt?: RelativeDate;
};

/**
 * Program seed data
 */
export type ProgramSeed = {
  name: string;
  description?: string;
  active: boolean;
  category?: string;
  difficulty?: string;
  durationWeeks?: number;
  daysPerWeek?: number;
  equipment?: string[];
  goals?: string[];
  tags?: string[];
  // Week 2 check-in state
  week2CheckInShown?: boolean;
  week2CheckInShownAtDaysAgo?: number;
  week2CheckInOption?: 'going_great' | 'too_hard' | 'too_easy' | 'life_happened';
  // Nested data
  workoutPlan: WorkoutPlanSeed;
  workoutLogs?: WorkoutLogSeed[];
  checkIns?: CheckInSeed[];
};

/**
 * Complete persona seed definition
 */
export type PersonaSeed = {
  /** Persona identifier for logging/reference */
  id: string;
  /** User data */
  user: UserSeed;
  /** User intake/profile */
  intake: UserIntakeSeed;
  /** Optional subscription (for paid users) */
  subscription?: SubscriptionSeed;
  /** Programs (most users have 1, some have multiple) */
  programs: ProgramSeed[];
  /** Milestone achievements */
  milestones?: MilestoneSeed[];
};

// ============ Utility Types ============

/**
 * Helper to extract workout log seed type
 */
export type { WorkoutLogSeed as WorkoutLogSeedType };

/**
 * Helper to extract check-in seed type
 */
export type { CheckInSeed as CheckInSeedType };

/**
 * Helper to extract workout seed type
 */
export type { WorkoutSeed as WorkoutSeedType };
