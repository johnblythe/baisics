import { describe, it, expect } from 'vitest';

/**
 * Tests for Import Preview Logic
 * Issue #207 - Program Import Tool
 *
 * Business Rules:
 * - Exercises can be edited (name, sets, reps, rest)
 * - Exercises can be added to any workout
 * - Exercises can be deleted from any workout
 * - Exercises can be reordered within a workout
 */

interface ParsedExercise {
  name: string;
  sets: number;
  reps?: number;
  restPeriod?: number;
  notes?: string;
  measure?: {
    type: string;
    value: number;
    unit?: string;
  };
}

interface ParsedWorkout {
  name: string;
  dayNumber: number;
  focus?: string;
  exercises: ParsedExercise[];
}

interface ParsedProgram {
  program?: {
    name: string;
    description?: string;
  };
  workouts?: ParsedWorkout[];
}

// Mirror the updateExercise logic from import/page.tsx
function updateExercise(
  parsedProgram: ParsedProgram,
  wIdx: number,
  eIdx: number,
  updates: Partial<ParsedExercise>
): ParsedProgram {
  if (!parsedProgram?.workouts) return parsedProgram;

  const newWorkouts = [...parsedProgram.workouts];
  newWorkouts[wIdx] = {
    ...newWorkouts[wIdx],
    exercises: newWorkouts[wIdx].exercises.map((ex, i) =>
      i === eIdx ? { ...ex, ...updates } : ex
    )
  };
  return { ...parsedProgram, workouts: newWorkouts };
}

// Mirror the deleteExercise logic from import/page.tsx
function deleteExercise(
  parsedProgram: ParsedProgram,
  wIdx: number,
  eIdx: number
): ParsedProgram {
  if (!parsedProgram?.workouts) return parsedProgram;

  const newWorkouts = [...parsedProgram.workouts];
  newWorkouts[wIdx] = {
    ...newWorkouts[wIdx],
    exercises: newWorkouts[wIdx].exercises.filter((_, i) => i !== eIdx)
  };
  return { ...parsedProgram, workouts: newWorkouts };
}

// Mirror the addExercise logic from import/page.tsx
function addExercise(
  parsedProgram: ParsedProgram,
  wIdx: number
): ParsedProgram {
  if (!parsedProgram?.workouts) return parsedProgram;

  const newWorkouts = [...parsedProgram.workouts];
  newWorkouts[wIdx] = {
    ...newWorkouts[wIdx],
    exercises: [
      ...newWorkouts[wIdx].exercises,
      { name: 'New Exercise', sets: 3, reps: 10 }
    ]
  };
  return { ...parsedProgram, workouts: newWorkouts };
}

// Mirror the moveExercise logic from import/page.tsx
function moveExercise(
  parsedProgram: ParsedProgram,
  wIdx: number,
  eIdx: number,
  direction: 'up' | 'down'
): ParsedProgram {
  if (!parsedProgram?.workouts) return parsedProgram;

  const exercises = [...parsedProgram.workouts[wIdx].exercises];
  const newIdx = direction === 'up' ? eIdx - 1 : eIdx + 1;
  if (newIdx < 0 || newIdx >= exercises.length) return parsedProgram;

  [exercises[eIdx], exercises[newIdx]] = [exercises[newIdx], exercises[eIdx]];

  const newWorkouts = [...parsedProgram.workouts];
  newWorkouts[wIdx] = { ...newWorkouts[wIdx], exercises };
  return { ...parsedProgram, workouts: newWorkouts };
}

// Test fixtures
function createTestProgram(): ParsedProgram {
  return {
    program: { name: 'Test Program', description: 'A test program' },
    workouts: [
      {
        name: 'Push Day',
        dayNumber: 1,
        focus: 'Chest & Shoulders',
        exercises: [
          { name: 'Bench Press', sets: 4, reps: 8, restPeriod: 90 },
          { name: 'Overhead Press', sets: 3, reps: 10, restPeriod: 60 },
          { name: 'Tricep Dips', sets: 3, reps: 12 }
        ]
      },
      {
        name: 'Pull Day',
        dayNumber: 2,
        focus: 'Back & Biceps',
        exercises: [
          { name: 'Pull Ups', sets: 4, reps: 8 },
          { name: 'Barbell Rows', sets: 3, reps: 10 }
        ]
      }
    ]
  };
}

describe('Import Preview - updateExercise', () => {
  it('updates exercise name', () => {
    const program = createTestProgram();
    const updated = updateExercise(program, 0, 0, { name: 'Incline Bench Press' });

    expect(updated.workouts![0].exercises[0].name).toBe('Incline Bench Press');
    expect(updated.workouts![0].exercises[0].sets).toBe(4); // unchanged
  });

  it('updates exercise sets', () => {
    const program = createTestProgram();
    const updated = updateExercise(program, 0, 0, { sets: 5 });

    expect(updated.workouts![0].exercises[0].sets).toBe(5);
    expect(updated.workouts![0].exercises[0].name).toBe('Bench Press'); // unchanged
  });

  it('updates exercise reps', () => {
    const program = createTestProgram();
    const updated = updateExercise(program, 0, 1, { reps: 12 });

    expect(updated.workouts![0].exercises[1].reps).toBe(12);
  });

  it('updates exercise rest period', () => {
    const program = createTestProgram();
    const updated = updateExercise(program, 0, 0, { restPeriod: 120 });

    expect(updated.workouts![0].exercises[0].restPeriod).toBe(120);
  });

  it('updates multiple fields at once', () => {
    const program = createTestProgram();
    const updated = updateExercise(program, 0, 0, { name: 'DB Press', sets: 3, reps: 12 });

    expect(updated.workouts![0].exercises[0].name).toBe('DB Press');
    expect(updated.workouts![0].exercises[0].sets).toBe(3);
    expect(updated.workouts![0].exercises[0].reps).toBe(12);
  });

  it('does not affect other exercises', () => {
    const program = createTestProgram();
    const updated = updateExercise(program, 0, 0, { name: 'Changed' });

    expect(updated.workouts![0].exercises[1].name).toBe('Overhead Press');
    expect(updated.workouts![0].exercises[2].name).toBe('Tricep Dips');
  });

  it('does not affect other workouts', () => {
    const program = createTestProgram();
    const updated = updateExercise(program, 0, 0, { name: 'Changed' });

    expect(updated.workouts![1].exercises[0].name).toBe('Pull Ups');
  });

  it('handles empty program gracefully', () => {
    const emptyProgram: ParsedProgram = {};
    const result = updateExercise(emptyProgram, 0, 0, { name: 'Test' });

    expect(result).toEqual({});
  });
});

describe('Import Preview - deleteExercise', () => {
  it('deletes exercise from workout', () => {
    const program = createTestProgram();
    const updated = deleteExercise(program, 0, 1);

    expect(updated.workouts![0].exercises.length).toBe(2);
    expect(updated.workouts![0].exercises[0].name).toBe('Bench Press');
    expect(updated.workouts![0].exercises[1].name).toBe('Tricep Dips');
  });

  it('deletes first exercise', () => {
    const program = createTestProgram();
    const updated = deleteExercise(program, 0, 0);

    expect(updated.workouts![0].exercises.length).toBe(2);
    expect(updated.workouts![0].exercises[0].name).toBe('Overhead Press');
  });

  it('deletes last exercise', () => {
    const program = createTestProgram();
    const updated = deleteExercise(program, 0, 2);

    expect(updated.workouts![0].exercises.length).toBe(2);
    expect(updated.workouts![0].exercises[1].name).toBe('Overhead Press');
  });

  it('does not affect other workouts', () => {
    const program = createTestProgram();
    const updated = deleteExercise(program, 0, 0);

    expect(updated.workouts![1].exercises.length).toBe(2);
  });

  it('handles empty program gracefully', () => {
    const emptyProgram: ParsedProgram = {};
    const result = deleteExercise(emptyProgram, 0, 0);

    expect(result).toEqual({});
  });
});

describe('Import Preview - addExercise', () => {
  it('adds exercise to workout', () => {
    const program = createTestProgram();
    const updated = addExercise(program, 0);

    expect(updated.workouts![0].exercises.length).toBe(4);
    expect(updated.workouts![0].exercises[3].name).toBe('New Exercise');
  });

  it('adds exercise with default values', () => {
    const program = createTestProgram();
    const updated = addExercise(program, 0);

    const newExercise = updated.workouts![0].exercises[3];
    expect(newExercise.sets).toBe(3);
    expect(newExercise.reps).toBe(10);
  });

  it('adds to correct workout', () => {
    const program = createTestProgram();
    const updated = addExercise(program, 1);

    expect(updated.workouts![0].exercises.length).toBe(3); // unchanged
    expect(updated.workouts![1].exercises.length).toBe(3); // added
  });

  it('handles empty program gracefully', () => {
    const emptyProgram: ParsedProgram = {};
    const result = addExercise(emptyProgram, 0);

    expect(result).toEqual({});
  });
});

describe('Import Preview - moveExercise', () => {
  it('moves exercise up', () => {
    const program = createTestProgram();
    const updated = moveExercise(program, 0, 1, 'up');

    expect(updated.workouts![0].exercises[0].name).toBe('Overhead Press');
    expect(updated.workouts![0].exercises[1].name).toBe('Bench Press');
    expect(updated.workouts![0].exercises[2].name).toBe('Tricep Dips');
  });

  it('moves exercise down', () => {
    const program = createTestProgram();
    const updated = moveExercise(program, 0, 0, 'down');

    expect(updated.workouts![0].exercises[0].name).toBe('Overhead Press');
    expect(updated.workouts![0].exercises[1].name).toBe('Bench Press');
  });

  it('does not move first exercise up', () => {
    const program = createTestProgram();
    const updated = moveExercise(program, 0, 0, 'up');

    // Should remain unchanged
    expect(updated.workouts![0].exercises[0].name).toBe('Bench Press');
  });

  it('does not move last exercise down', () => {
    const program = createTestProgram();
    const updated = moveExercise(program, 0, 2, 'down');

    // Should remain unchanged
    expect(updated.workouts![0].exercises[2].name).toBe('Tricep Dips');
  });

  it('does not affect other workouts', () => {
    const program = createTestProgram();
    const updated = moveExercise(program, 0, 1, 'up');

    expect(updated.workouts![1].exercises[0].name).toBe('Pull Ups');
    expect(updated.workouts![1].exercises[1].name).toBe('Barbell Rows');
  });

  it('preserves all exercise properties when moving', () => {
    const program = createTestProgram();
    const updated = moveExercise(program, 0, 0, 'down');

    // Bench Press moved to index 1, should keep all properties
    expect(updated.workouts![0].exercises[1]).toEqual({
      name: 'Bench Press',
      sets: 4,
      reps: 8,
      restPeriod: 90
    });
  });

  it('handles empty program gracefully', () => {
    const emptyProgram: ParsedProgram = {};
    const result = moveExercise(emptyProgram, 0, 0, 'up');

    expect(result).toEqual({});
  });
});

describe('Import Preview - Integration', () => {
  it('supports multiple operations in sequence', () => {
    let program = createTestProgram();

    // Add an exercise
    program = addExercise(program, 0);
    expect(program.workouts![0].exercises.length).toBe(4);

    // Edit the new exercise
    program = updateExercise(program, 0, 3, { name: 'Cable Flyes', sets: 4, reps: 15 });
    expect(program.workouts![0].exercises[3].name).toBe('Cable Flyes');

    // Move it up twice
    program = moveExercise(program, 0, 3, 'up');
    program = moveExercise(program, 0, 2, 'up');
    expect(program.workouts![0].exercises[1].name).toBe('Cable Flyes');

    // Delete original second exercise (now at index 2)
    program = deleteExercise(program, 0, 2);
    expect(program.workouts![0].exercises.length).toBe(3);
    expect(program.workouts![0].exercises.map(e => e.name)).toEqual([
      'Bench Press',
      'Cable Flyes',
      'Tricep Dips'
    ]);
  });

  it('maintains program metadata through operations', () => {
    let program = createTestProgram();

    program = addExercise(program, 0);
    program = deleteExercise(program, 0, 0);
    program = updateExercise(program, 0, 0, { name: 'Changed' });

    // Program metadata should be unchanged
    expect(program.program?.name).toBe('Test Program');
    expect(program.program?.description).toBe('A test program');
  });
});
