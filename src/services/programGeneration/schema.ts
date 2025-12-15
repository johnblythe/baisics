import { z } from 'zod';

/**
 * Zod Schemas for Program Generation
 *
 * These schemas validate AI-generated program output before saving to database.
 * They ensure structure is correct and values are reasonable.
 */

// ============================================
// EXERCISE SCHEMA
// ============================================

export const exerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name required'),
  sets: z.number().int().min(1).max(10),
  measure: z.object({
    type: z.enum(['reps', 'time', 'distance']),
    value: z.number().positive(),
    unit: z.enum(['seconds', 'minutes', 'meters', 'km', 'miles']).optional(),
  }),
  restPeriod: z.number().int().min(0).max(600), // 0-10 minutes
  equipment: z.array(z.string()).default([]),
  alternatives: z.array(z.string()).default([]),
  category: z.enum(['primary', 'secondary', 'isolation', 'cardio', 'flexibility']),
  intensity: z.string().optional(),
  notes: z.string().optional(),
  instructions: z.array(z.string()).max(5).optional(), // 2-3 form cues
});

// ============================================
// WORKOUT SCHEMA
// ============================================

export const workoutSchema = z.object({
  dayNumber: z.number().int().min(1).max(7),
  name: z.string().min(1),
  focus: z.string().min(1),
  warmup: z.object({
    duration: z.number().int().min(0).max(30), // 0-30 minutes
    activities: z.array(z.string()),
  }),
  cooldown: z.object({
    duration: z.number().int().min(0).max(30),
    activities: z.array(z.string()),
  }),
  exercises: z.array(exerciseSchema).min(1).max(15),
});

// ============================================
// NUTRITION SCHEMA
// ============================================

export const nutritionSchema = z.object({
  dailyCalories: z.number().int().min(1000).max(10000),
  macros: z.object({
    protein: z.number().int().min(0).max(500), // grams
    carbs: z.number().int().min(0).max(1000),
    fats: z.number().int().min(0).max(500),
  }),
  mealTiming: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// ============================================
// PHASE SCHEMA
// ============================================

export const phaseSchema = z.object({
  phaseNumber: z.number().int().min(1).max(6),
  name: z.string().min(1),
  durationWeeks: z.number().int().min(1).max(12),
  focus: z.string().min(1),
  explanation: z.string().min(1),
  expectations: z.string().min(1),
  keyPoints: z.array(z.string()).min(1).max(10),
  splitType: z.string().min(1),
  workouts: z.array(workoutSchema).min(1).max(7),
  nutrition: nutritionSchema,
  progressionProtocol: z.array(z.string()).min(1),
});

// ============================================
// FULL PROGRAM SCHEMA
// ============================================

export const generatedProgramSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  totalWeeks: z.number().int().min(1).max(52),
  phases: z.array(phaseSchema).min(1).max(6),
});

// ============================================
// INPUT VALIDATION SCHEMAS
// ============================================

export const userProfileSchema = z.object({
  sex: z.enum(['male', 'female', 'other']),
  trainingGoal: z.string().min(1),
  weight: z.number().positive().min(50).max(500),

  environment: z.object({
    primary: z.enum(['gym', 'home', 'travel', 'outdoors']),
    secondary: z.enum(['gym', 'home', 'travel', 'outdoors']).optional(),
    limitations: z.array(z.string()).optional(),
  }),

  equipment: z.object({
    type: z.enum(['full-gym', 'minimal', 'bodyweight', 'specific']),
    available: z.array(z.string()),
  }),

  age: z.number().int().min(13).max(100).optional(),
  height: z.number().positive().min(36).max(96).optional(), // 3-8 feet in inches
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  daysAvailable: z.number().int().min(1).max(7).optional(),
  timePerSession: z.number().int().min(15).max(180).optional(),

  style: z
    .object({
      primary: z.enum(['strength', 'yoga', 'cardio', 'hybrid']),
      secondary: z.enum(['strength', 'yoga', 'cardio', 'hybrid']).optional(),
    })
    .optional(),

  injuries: z.array(z.string()).optional(),
  preferences: z.array(z.string()).optional(),
  additionalInfo: z.string().optional(),
});

export const generationContextSchema = z.object({
  previousPrograms: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        completionRate: z.number().min(0).max(1),
        goal: z.string(),
      })
    )
    .optional(),

  recentCheckIn: z
    .object({
      weight: z.number().positive().optional(),
      bodyFat: z.number().min(1).max(60).optional(),
      notes: z.string().optional(),
      date: z.date(),
    })
    .optional(),

  modifications: z.string().optional(),
  generationType: z.enum(['new', 'similar', 'new_focus', 'fresh_start']),
});

export const generationRequestSchema = z.object({
  userId: z.string().min(1),
  profile: userProfileSchema,
  context: generationContextSchema.optional(),
});

// ============================================
// TYPE EXPORTS FROM SCHEMAS
// ============================================

export type ValidatedExercise = z.infer<typeof exerciseSchema>;
export type ValidatedWorkout = z.infer<typeof workoutSchema>;
export type ValidatedNutrition = z.infer<typeof nutritionSchema>;
export type ValidatedPhase = z.infer<typeof phaseSchema>;
export type ValidatedProgram = z.infer<typeof generatedProgramSchema>;
export type ValidatedUserProfile = z.infer<typeof userProfileSchema>;
export type ValidatedGenerationContext = z.infer<typeof generationContextSchema>;
export type ValidatedGenerationRequest = z.infer<typeof generationRequestSchema>;

// ============================================
// VALIDATION HELPERS
// ============================================

export function validateProgram(data: unknown): {
  success: boolean;
  data?: ValidatedProgram;
  errors?: z.ZodError;
} {
  const result = generatedProgramSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export function validateGenerationRequest(data: unknown): {
  success: boolean;
  data?: ValidatedGenerationRequest;
  errors?: z.ZodError;
} {
  const result = generationRequestSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export function validatePhase(data: unknown): {
  success: boolean;
  data?: ValidatedPhase;
  errors?: z.ZodError;
} {
  const result = phaseSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
