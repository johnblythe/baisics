import { describe, it, expect, beforeAll } from 'vitest';
import { generateProgram, convertIntakeToProfile } from '@/services/programGeneration';
import type { UserProfile, GeneratedProgram } from '@/services/programGeneration/types';
import type { ValidatedExercise } from '@/services/programGeneration/schema';

/**
 * Integration test for exercise ordering in generated programs.
 *
 * This test calls the actual Claude API to generate programs and validates
 * that exercises are ordered correctly:
 * 1. PRIMARY first (squats, deadlifts, bench, rows, overhead press)
 * 2. SECONDARY next (lunges, RDLs, incline press, pull-ups, dips)
 * 3. ISOLATION last (curls, extensions, lateral raises, face pulls, core/ab work)
 *
 * Run with: npx vitest tests/integration/exercise-ordering.test.ts
 */

// Category priority map - lower number = should come first
const CATEGORY_PRIORITY: Record<string, number> = {
  primary: 1,
  secondary: 2,
  isolation: 3,
  cardio: 4,
  flexibility: 5,
};

interface OrderingViolation {
  workout: string;
  exerciseIndex: number;
  exerciseName: string;
  category: string;
  previousExercise: string;
  previousCategory: string;
  message: string;
}

/**
 * Checks if exercises in a workout are properly ordered by category
 */
function checkExerciseOrdering(
  exercises: ValidatedExercise[],
  workoutName: string
): OrderingViolation[] {
  const violations: OrderingViolation[] = [];

  for (let i = 1; i < exercises.length; i++) {
    const current = exercises[i];
    const previous = exercises[i - 1];

    const currentPriority = CATEGORY_PRIORITY[current.category] || 99;
    const previousPriority = CATEGORY_PRIORITY[previous.category] || 99;

    // Violation: current exercise has LOWER priority number (should come earlier)
    // than the previous exercise
    if (currentPriority < previousPriority) {
      violations.push({
        workout: workoutName,
        exerciseIndex: i,
        exerciseName: current.name,
        category: current.category,
        previousExercise: previous.name,
        previousCategory: previous.category,
        message: `${current.name} (${current.category}) should come BEFORE ${previous.name} (${previous.category})`,
      });
    }
  }

  return violations;
}

/**
 * Validates ordering across all workouts in a program
 */
function validateProgramOrdering(program: GeneratedProgram): {
  valid: boolean;
  violations: OrderingViolation[];
  summary: string;
} {
  const allViolations: OrderingViolation[] = [];

  for (const phase of program.phases) {
    for (const workout of phase.workouts) {
      const violations = checkExerciseOrdering(workout.exercises, workout.name);
      allViolations.push(...violations);
    }
  }

  const summary = allViolations.length === 0
    ? 'All exercises properly ordered'
    : `Found ${allViolations.length} ordering violations:\n${allViolations.map(v => `  - ${v.message}`).join('\n')}`;

  return {
    valid: allViolations.length === 0,
    violations: allViolations,
    summary,
  };
}

// Test profiles representing different user scenarios
const TEST_PROFILES: { name: string; profile: UserProfile }[] = [
  {
    name: 'Beginner gym user - general fitness',
    profile: {
      sex: 'male',
      trainingGoal: 'general fitness and strength',
      weight: 180,
      age: 30,
      height: 70,
      experienceLevel: 'beginner',
      daysAvailable: 3,
      timePerSession: 60,
      environment: { primary: 'gym' },
      equipment: { type: 'full-gym', available: ['barbell', 'dumbbells', 'machines', 'cables'] },
      style: { primary: 'strength' },
    },
  },
  {
    name: 'Intermediate powerbuilder - muscle gain',
    profile: {
      sex: 'male',
      trainingGoal: 'powerbuilding - build muscle and strength',
      weight: 190,
      age: 28,
      height: 72,
      experienceLevel: 'intermediate',
      daysAvailable: 5,
      timePerSession: 90,
      environment: { primary: 'gym' },
      equipment: { type: 'full-gym', available: ['barbell', 'dumbbells', 'machines', 'cables', 'rack'] },
      style: { primary: 'strength' },
    },
  },
  {
    name: 'Home workout beginner',
    profile: {
      sex: 'female',
      trainingGoal: 'tone up and build strength',
      weight: 140,
      age: 35,
      height: 64,
      experienceLevel: 'beginner',
      daysAvailable: 4,
      timePerSession: 45,
      environment: { primary: 'home' },
      equipment: { type: 'minimal', available: ['dumbbells', 'resistance bands', 'yoga mat'] },
      style: { primary: 'strength' },
    },
  },
];

describe('Exercise Ordering Integration Tests', () => {
  // These tests call the real API and can be slow/expensive
  // Run with: npx vitest tests/integration --run

  describe.each(TEST_PROFILES)('Profile: $name', ({ name, profile }) => {
    let program: GeneratedProgram | null = null;
    let generationError: string | null = null;

    beforeAll(async () => {
      console.log(`\n🏋️ Generating program for: ${name}`);
      const result = await generateProgram({
        userId: 'test-user-ordering',
        profile,
        context: { generationType: 'new' },
      });

      if (result.success && result.program) {
        program = result.program;
        console.log(`✅ Generated "${program.name}" with ${program.phases.length} phase(s)`);
      } else {
        generationError = result.error || 'Unknown generation error';
        console.error(`❌ Generation failed: ${generationError}`);
      }
    }, 120000); // 2 minute timeout for generation

    it('should generate a valid program', () => {
      expect(generationError).toBeNull();
      expect(program).not.toBeNull();
      expect(program?.phases.length).toBeGreaterThan(0);
    });

    it('should have exercises ordered by category (primary → secondary → isolation)', () => {
      if (!program) {
        throw new Error('Program not generated');
      }

      const result = validateProgramOrdering(program);

      // Log details for debugging
      console.log(`\n📋 Ordering validation for "${program.name}":`);
      console.log(result.summary);

      if (!result.valid) {
        // Log the actual exercise order for each workout with violations
        const workoutsWithViolations = new Set(result.violations.map(v => v.workout));
        for (const phase of program.phases) {
          for (const workout of phase.workouts) {
            if (workoutsWithViolations.has(workout.name)) {
              console.log(`\n⚠️ ${workout.name} exercise order:`);
              workout.exercises.forEach((ex, i) => {
                console.log(`  ${i + 1}. ${ex.name} [${ex.category}]`);
              });
            }
          }
        }
      }

      expect(result.valid, result.summary).toBe(true);
    });

    it('should have primary exercises at the start of workouts', () => {
      if (!program) {
        throw new Error('Program not generated');
      }

      for (const phase of program.phases) {
        for (const workout of phase.workouts) {
          const exercises = workout.exercises;

          // Find first non-cardio/flexibility exercise
          const firstStrengthExercise = exercises.find(
            e => !['cardio', 'flexibility'].includes(e.category)
          );

          // If the workout has primary exercises, the first strength exercise should be primary
          const hasPrimary = exercises.some(e => e.category === 'primary');
          if (hasPrimary && firstStrengthExercise) {
            expect(
              firstStrengthExercise.category,
              `${workout.name}: First exercise "${firstStrengthExercise.name}" should be primary, not ${firstStrengthExercise.category}`
            ).toBe('primary');
          }
        }
      }
    });

    it('should not have isolation exercises before compound movements', () => {
      if (!program) {
        throw new Error('Program not generated');
      }

      for (const phase of program.phases) {
        for (const workout of phase.workouts) {
          const exercises = workout.exercises;

          // Find first isolation exercise
          const firstIsolationIndex = exercises.findIndex(e => e.category === 'isolation');

          if (firstIsolationIndex > -1) {
            // All exercises after isolation should also be isolation/cardio/flexibility
            const exercisesAfterFirstIsolation = exercises.slice(firstIsolationIndex);
            const compoundAfterIsolation = exercisesAfterFirstIsolation.find(
              e => e.category === 'primary' || e.category === 'secondary'
            );

            expect(
              compoundAfterIsolation,
              `${workout.name}: Compound exercise "${compoundAfterIsolation?.name}" found after isolation work`
            ).toBeUndefined();
          }
        }
      }
    });
  });
});

// Utility to run a quick single test
describe('Quick Order Check', () => {
  it.skip('single profile test - unskip to run manually', async () => {
    const profile: UserProfile = {
      sex: 'male',
      trainingGoal: 'powerbuilding',
      weight: 180,
      experienceLevel: 'intermediate',
      daysAvailable: 4,
      timePerSession: 75,
      environment: { primary: 'gym' },
      equipment: { type: 'full-gym', available: ['barbell', 'dumbbells', 'machines'] },
    };

    console.log('🔧 Running quick ordering test...');
    const result = await generateProgram({
      userId: 'test-quick',
      profile,
      context: { generationType: 'new' },
    });

    expect(result.success).toBe(true);
    expect(result.program).toBeDefined();

    const validation = validateProgramOrdering(result.program!);
    console.log(validation.summary);

    // Log all workouts
    for (const phase of result.program!.phases) {
      console.log(`\nPhase ${phase.phaseNumber}: ${phase.name}`);
      for (const workout of phase.workouts) {
        console.log(`\n  ${workout.name}:`);
        workout.exercises.forEach((ex, i) => {
          console.log(`    ${i + 1}. ${ex.name} [${ex.category}]`);
        });
      }
    }

    expect(validation.valid, validation.summary).toBe(true);
  }, 120000);
});
