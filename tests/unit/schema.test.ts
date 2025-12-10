import { describe, it, expect } from 'vitest';
import {
  exerciseSchema,
  workoutSchema,
  nutritionSchema,
  phaseSchema,
  generatedProgramSchema,
  userProfileSchema,
  validateProgram,
  validatePhase,
} from '@/services/programGeneration/schema';

// ============================================
// TEST DATA FACTORIES
// ============================================

const validExercise = () => ({
  name: 'Barbell Squat',
  sets: 4,
  measure: { type: 'reps' as const, value: 8 },
  restPeriod: 120,
  equipment: ['barbell', 'squat rack'],
  alternatives: ['goblet squat', 'leg press'],
  category: 'primary' as const,
  intensity: '70-80% 1RM',
  notes: 'Focus on depth',
});

const validWorkout = () => ({
  dayNumber: 1,
  name: 'Lower Body Power',
  focus: 'Compound leg strength',
  warmup: { duration: 10, activities: ['light cardio', 'dynamic stretching'] },
  cooldown: { duration: 5, activities: ['static stretching'] },
  exercises: [validExercise()],
});

const validNutrition = () => ({
  dailyCalories: 2500,
  macros: { protein: 180, carbs: 250, fats: 80 },
  mealTiming: ['breakfast', 'lunch', 'dinner', 'snack'],
  notes: 'Prioritize protein around workouts',
});

const validPhase = () => ({
  phaseNumber: 1,
  name: 'Foundation Phase',
  durationWeeks: 4,
  focus: 'Building base strength',
  explanation: 'This phase focuses on foundational movement patterns.',
  expectations: 'Expect improved form and initial strength gains.',
  keyPoints: ['Focus on form', 'Progressive overload', 'Recovery'],
  splitType: 'Upper/Lower',
  workouts: [validWorkout()],
  nutrition: validNutrition(),
  progressionProtocol: ['Add 5lbs weekly', 'Track all lifts'],
});

const validProgram = () => ({
  name: 'Strength Foundation Program',
  description: 'An 8-week program designed to build foundational strength.',
  totalWeeks: 8,
  phases: [validPhase(), { ...validPhase(), phaseNumber: 2, name: 'Building Phase' }],
});

// ============================================
// EXERCISE SCHEMA TESTS
// ============================================

describe('exerciseSchema', () => {
  describe('valid exercises', () => {
    it('accepts a fully populated exercise', () => {
      const result = exerciseSchema.safeParse(validExercise());
      expect(result.success).toBe(true);
    });

    it('accepts exercise with minimal required fields', () => {
      const minimal = {
        name: 'Push-ups',
        sets: 3,
        measure: { type: 'reps', value: 10 },
        restPeriod: 60,
        category: 'primary',
      };
      const result = exerciseSchema.safeParse(minimal);
      expect(result.success).toBe(true);
    });

    it('defaults equipment and alternatives to empty arrays', () => {
      const minimal = {
        name: 'Push-ups',
        sets: 3,
        measure: { type: 'reps', value: 10 },
        restPeriod: 60,
        category: 'primary',
      };
      const result = exerciseSchema.safeParse(minimal);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.equipment).toEqual([]);
        expect(result.data.alternatives).toEqual([]);
      }
    });
  });

  describe('required field validation', () => {
    it('rejects missing name', () => {
      const { name, ...noName } = validExercise();
      const result = exerciseSchema.safeParse(noName);
      expect(result.success).toBe(false);
    });

    it('rejects empty name', () => {
      const result = exerciseSchema.safeParse({ ...validExercise(), name: '' });
      expect(result.success).toBe(false);
    });

    it('rejects missing sets', () => {
      const { sets, ...noSets } = validExercise();
      const result = exerciseSchema.safeParse(noSets);
      expect(result.success).toBe(false);
    });

    it('rejects missing measure', () => {
      const { measure, ...noMeasure } = validExercise();
      const result = exerciseSchema.safeParse(noMeasure);
      expect(result.success).toBe(false);
    });

    it('rejects missing category', () => {
      const { category, ...noCategory } = validExercise();
      const result = exerciseSchema.safeParse(noCategory);
      expect(result.success).toBe(false);
    });
  });

  describe('enum validation', () => {
    it('rejects invalid category', () => {
      const result = exerciseSchema.safeParse({ ...validExercise(), category: 'invalid' });
      expect(result.success).toBe(false);
    });

    it('accepts all valid categories', () => {
      const categories = ['primary', 'secondary', 'isolation', 'cardio', 'flexibility'] as const;
      for (const category of categories) {
        const result = exerciseSchema.safeParse({ ...validExercise(), category });
        expect(result.success).toBe(true);
      }
    });

    it('rejects invalid measure type', () => {
      const result = exerciseSchema.safeParse({
        ...validExercise(),
        measure: { type: 'invalid', value: 10 },
      });
      expect(result.success).toBe(false);
    });

    it('accepts all valid measure types', () => {
      const types = ['reps', 'time', 'distance'] as const;
      for (const type of types) {
        const result = exerciseSchema.safeParse({
          ...validExercise(),
          measure: { type, value: 10 },
        });
        expect(result.success).toBe(true);
      }
    });

    it('accepts valid measure units', () => {
      const units = ['seconds', 'minutes', 'meters', 'km', 'miles'] as const;
      for (const unit of units) {
        const result = exerciseSchema.safeParse({
          ...validExercise(),
          measure: { type: 'time', value: 30, unit },
        });
        expect(result.success).toBe(true);
      }
    });
  });

  describe('boundary value validation', () => {
    it('rejects sets below minimum (0)', () => {
      const result = exerciseSchema.safeParse({ ...validExercise(), sets: 0 });
      expect(result.success).toBe(false);
    });

    it('accepts sets at minimum (1)', () => {
      const result = exerciseSchema.safeParse({ ...validExercise(), sets: 1 });
      expect(result.success).toBe(true);
    });

    it('accepts sets at maximum (10)', () => {
      const result = exerciseSchema.safeParse({ ...validExercise(), sets: 10 });
      expect(result.success).toBe(true);
    });

    it('rejects sets above maximum (11)', () => {
      const result = exerciseSchema.safeParse({ ...validExercise(), sets: 11 });
      expect(result.success).toBe(false);
    });

    it('rejects non-integer sets', () => {
      const result = exerciseSchema.safeParse({ ...validExercise(), sets: 3.5 });
      expect(result.success).toBe(false);
    });

    it('rejects rest period below minimum (-1)', () => {
      const result = exerciseSchema.safeParse({ ...validExercise(), restPeriod: -1 });
      expect(result.success).toBe(false);
    });

    it('accepts rest period at minimum (0)', () => {
      const result = exerciseSchema.safeParse({ ...validExercise(), restPeriod: 0 });
      expect(result.success).toBe(true);
    });

    it('accepts rest period at maximum (600)', () => {
      const result = exerciseSchema.safeParse({ ...validExercise(), restPeriod: 600 });
      expect(result.success).toBe(true);
    });

    it('rejects rest period above maximum (601)', () => {
      const result = exerciseSchema.safeParse({ ...validExercise(), restPeriod: 601 });
      expect(result.success).toBe(false);
    });

    it('rejects non-positive measure value', () => {
      const result = exerciseSchema.safeParse({
        ...validExercise(),
        measure: { type: 'reps', value: 0 },
      });
      expect(result.success).toBe(false);
    });
  });
});

// ============================================
// WORKOUT SCHEMA TESTS
// ============================================

describe('workoutSchema', () => {
  it('accepts valid workout', () => {
    const result = workoutSchema.safeParse(validWorkout());
    expect(result.success).toBe(true);
  });

  describe('required fields', () => {
    it('rejects missing dayNumber', () => {
      const { dayNumber, ...noDay } = validWorkout();
      const result = workoutSchema.safeParse(noDay);
      expect(result.success).toBe(false);
    });

    it('rejects missing name', () => {
      const { name, ...noName } = validWorkout();
      const result = workoutSchema.safeParse(noName);
      expect(result.success).toBe(false);
    });

    it('rejects missing exercises', () => {
      const { exercises, ...noExercises } = validWorkout();
      const result = workoutSchema.safeParse(noExercises);
      expect(result.success).toBe(false);
    });
  });

  describe('boundary validation', () => {
    it('rejects dayNumber below 1', () => {
      const result = workoutSchema.safeParse({ ...validWorkout(), dayNumber: 0 });
      expect(result.success).toBe(false);
    });

    it('rejects dayNumber above 7', () => {
      const result = workoutSchema.safeParse({ ...validWorkout(), dayNumber: 8 });
      expect(result.success).toBe(false);
    });

    it('rejects empty exercises array', () => {
      const result = workoutSchema.safeParse({ ...validWorkout(), exercises: [] });
      expect(result.success).toBe(false);
    });

    it('rejects more than 15 exercises', () => {
      const exercises = Array(16).fill(validExercise());
      const result = workoutSchema.safeParse({ ...validWorkout(), exercises });
      expect(result.success).toBe(false);
    });

    it('accepts maximum 15 exercises', () => {
      const exercises = Array(15).fill(validExercise());
      const result = workoutSchema.safeParse({ ...validWorkout(), exercises });
      expect(result.success).toBe(true);
    });

    it('rejects warmup duration above 30', () => {
      const result = workoutSchema.safeParse({
        ...validWorkout(),
        warmup: { duration: 31, activities: [] },
      });
      expect(result.success).toBe(false);
    });
  });
});

// ============================================
// NUTRITION SCHEMA TESTS
// ============================================

describe('nutritionSchema', () => {
  it('accepts valid nutrition', () => {
    const result = nutritionSchema.safeParse(validNutrition());
    expect(result.success).toBe(true);
  });

  describe('boundary validation', () => {
    it('rejects calories below 1000', () => {
      const result = nutritionSchema.safeParse({ ...validNutrition(), dailyCalories: 999 });
      expect(result.success).toBe(false);
    });

    it('accepts calories at minimum (1000)', () => {
      const result = nutritionSchema.safeParse({ ...validNutrition(), dailyCalories: 1000 });
      expect(result.success).toBe(true);
    });

    it('accepts calories at maximum (10000)', () => {
      const result = nutritionSchema.safeParse({ ...validNutrition(), dailyCalories: 10000 });
      expect(result.success).toBe(true);
    });

    it('rejects calories above 10000', () => {
      const result = nutritionSchema.safeParse({ ...validNutrition(), dailyCalories: 10001 });
      expect(result.success).toBe(false);
    });

    it('rejects protein above 500g', () => {
      const result = nutritionSchema.safeParse({
        ...validNutrition(),
        macros: { protein: 501, carbs: 250, fats: 80 },
      });
      expect(result.success).toBe(false);
    });

    it('rejects carbs above 1000g', () => {
      const result = nutritionSchema.safeParse({
        ...validNutrition(),
        macros: { protein: 180, carbs: 1001, fats: 80 },
      });
      expect(result.success).toBe(false);
    });

    it('rejects fats above 500g', () => {
      const result = nutritionSchema.safeParse({
        ...validNutrition(),
        macros: { protein: 180, carbs: 250, fats: 501 },
      });
      expect(result.success).toBe(false);
    });

    it('rejects negative macro values', () => {
      const result = nutritionSchema.safeParse({
        ...validNutrition(),
        macros: { protein: -1, carbs: 250, fats: 80 },
      });
      expect(result.success).toBe(false);
    });
  });

  describe('nested object validation', () => {
    it('rejects missing macros object', () => {
      const { macros, ...noMacros } = validNutrition();
      const result = nutritionSchema.safeParse(noMacros);
      expect(result.success).toBe(false);
    });

    it('rejects incomplete macros', () => {
      const result = nutritionSchema.safeParse({
        ...validNutrition(),
        macros: { protein: 180 }, // missing carbs and fats
      });
      expect(result.success).toBe(false);
    });
  });
});

// ============================================
// PHASE SCHEMA TESTS
// ============================================

describe('phaseSchema', () => {
  it('accepts valid phase', () => {
    const result = phaseSchema.safeParse(validPhase());
    expect(result.success).toBe(true);
  });

  describe('boundary validation', () => {
    it('rejects phaseNumber below 1', () => {
      const result = phaseSchema.safeParse({ ...validPhase(), phaseNumber: 0 });
      expect(result.success).toBe(false);
    });

    it('rejects phaseNumber above 6', () => {
      const result = phaseSchema.safeParse({ ...validPhase(), phaseNumber: 7 });
      expect(result.success).toBe(false);
    });

    it('rejects durationWeeks below 1', () => {
      const result = phaseSchema.safeParse({ ...validPhase(), durationWeeks: 0 });
      expect(result.success).toBe(false);
    });

    it('rejects durationWeeks above 12', () => {
      const result = phaseSchema.safeParse({ ...validPhase(), durationWeeks: 13 });
      expect(result.success).toBe(false);
    });

    it('rejects empty keyPoints', () => {
      const result = phaseSchema.safeParse({ ...validPhase(), keyPoints: [] });
      expect(result.success).toBe(false);
    });

    it('rejects more than 10 keyPoints', () => {
      const result = phaseSchema.safeParse({
        ...validPhase(),
        keyPoints: Array(11).fill('point'),
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty workouts', () => {
      const result = phaseSchema.safeParse({ ...validPhase(), workouts: [] });
      expect(result.success).toBe(false);
    });

    it('rejects more than 7 workouts', () => {
      const result = phaseSchema.safeParse({
        ...validPhase(),
        workouts: Array(8).fill(validWorkout()),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('validatePhase helper', () => {
    it('returns success with data for valid phase', () => {
      const result = validatePhase(validPhase());
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('returns errors for invalid phase', () => {
      const result = validatePhase({ ...validPhase(), phaseNumber: 0 });
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });
});

// ============================================
// PROGRAM SCHEMA TESTS
// ============================================

describe('generatedProgramSchema', () => {
  it('accepts valid program', () => {
    const result = generatedProgramSchema.safeParse(validProgram());
    expect(result.success).toBe(true);
  });

  describe('boundary validation', () => {
    it('rejects empty name', () => {
      const result = generatedProgramSchema.safeParse({ ...validProgram(), name: '' });
      expect(result.success).toBe(false);
    });

    it('rejects name over 200 characters', () => {
      const result = generatedProgramSchema.safeParse({
        ...validProgram(),
        name: 'x'.repeat(201),
      });
      expect(result.success).toBe(false);
    });

    it('rejects description over 2000 characters', () => {
      const result = generatedProgramSchema.safeParse({
        ...validProgram(),
        description: 'x'.repeat(2001),
      });
      expect(result.success).toBe(false);
    });

    it('rejects totalWeeks below 1', () => {
      const result = generatedProgramSchema.safeParse({ ...validProgram(), totalWeeks: 0 });
      expect(result.success).toBe(false);
    });

    it('rejects totalWeeks above 52', () => {
      const result = generatedProgramSchema.safeParse({ ...validProgram(), totalWeeks: 53 });
      expect(result.success).toBe(false);
    });

    it('rejects empty phases', () => {
      const result = generatedProgramSchema.safeParse({ ...validProgram(), phases: [] });
      expect(result.success).toBe(false);
    });

    it('rejects more than 6 phases', () => {
      const phases = Array(7)
        .fill(null)
        .map((_, i) => ({ ...validPhase(), phaseNumber: i + 1 }));
      const result = generatedProgramSchema.safeParse({ ...validProgram(), phases });
      expect(result.success).toBe(false);
    });
  });

  describe('validateProgram helper', () => {
    it('returns success with data for valid program', () => {
      const result = validateProgram(validProgram());
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('returns errors for invalid program', () => {
      const result = validateProgram({ ...validProgram(), phases: [] });
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });
});

// ============================================
// USER PROFILE SCHEMA TESTS
// ============================================

describe('userProfileSchema', () => {
  const validProfile = () => ({
    sex: 'male' as const,
    trainingGoal: 'Build muscle and strength',
    weight: 180,
    environment: {
      primary: 'gym' as const,
      limitations: [],
    },
    equipment: {
      type: 'full-gym' as const,
      available: ['barbell', 'dumbbells', 'cable machine'],
    },
  });

  it('accepts valid profile with minimal fields', () => {
    const result = userProfileSchema.safeParse(validProfile());
    expect(result.success).toBe(true);
  });

  it('accepts valid profile with all optional fields', () => {
    const full = {
      ...validProfile(),
      age: 30,
      height: 72,
      experienceLevel: 'intermediate' as const,
      daysAvailable: 4,
      timePerSession: 60,
      style: { primary: 'strength' as const },
      injuries: ['lower back'],
      preferences: ['no machines'],
      additionalInfo: 'Previous powerlifting experience',
    };
    const result = userProfileSchema.safeParse(full);
    expect(result.success).toBe(true);
  });

  describe('enum validation', () => {
    it('rejects invalid sex', () => {
      const result = userProfileSchema.safeParse({ ...validProfile(), sex: 'invalid' });
      expect(result.success).toBe(false);
    });

    it('accepts all valid sex values', () => {
      for (const sex of ['male', 'female', 'other'] as const) {
        const result = userProfileSchema.safeParse({ ...validProfile(), sex });
        expect(result.success).toBe(true);
      }
    });

    it('rejects invalid environment primary', () => {
      const result = userProfileSchema.safeParse({
        ...validProfile(),
        environment: { primary: 'invalid' },
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid equipment type', () => {
      const result = userProfileSchema.safeParse({
        ...validProfile(),
        equipment: { type: 'invalid', available: [] },
      });
      expect(result.success).toBe(false);
    });
  });

  describe('boundary validation', () => {
    it('rejects weight below 50', () => {
      const result = userProfileSchema.safeParse({ ...validProfile(), weight: 49 });
      expect(result.success).toBe(false);
    });

    it('rejects weight above 500', () => {
      const result = userProfileSchema.safeParse({ ...validProfile(), weight: 501 });
      expect(result.success).toBe(false);
    });

    it('rejects age below 13', () => {
      const result = userProfileSchema.safeParse({ ...validProfile(), age: 12 });
      expect(result.success).toBe(false);
    });

    it('rejects age above 100', () => {
      const result = userProfileSchema.safeParse({ ...validProfile(), age: 101 });
      expect(result.success).toBe(false);
    });

    it('rejects height below 36 inches', () => {
      const result = userProfileSchema.safeParse({ ...validProfile(), height: 35 });
      expect(result.success).toBe(false);
    });

    it('rejects height above 96 inches', () => {
      const result = userProfileSchema.safeParse({ ...validProfile(), height: 97 });
      expect(result.success).toBe(false);
    });

    it('rejects daysAvailable below 1', () => {
      const result = userProfileSchema.safeParse({ ...validProfile(), daysAvailable: 0 });
      expect(result.success).toBe(false);
    });

    it('rejects daysAvailable above 7', () => {
      const result = userProfileSchema.safeParse({ ...validProfile(), daysAvailable: 8 });
      expect(result.success).toBe(false);
    });

    it('rejects timePerSession below 15', () => {
      const result = userProfileSchema.safeParse({ ...validProfile(), timePerSession: 14 });
      expect(result.success).toBe(false);
    });

    it('rejects timePerSession above 180', () => {
      const result = userProfileSchema.safeParse({ ...validProfile(), timePerSession: 181 });
      expect(result.success).toBe(false);
    });
  });
});
