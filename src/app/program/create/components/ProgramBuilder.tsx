'use client';

import { useState, useTransition } from 'react';
import { createManualProgram, type ProgramFormData, type WorkoutFormData } from '../actions';
import { WorkoutSection } from './WorkoutSection';
import { ExerciseSearchModal } from './ExerciseSearchModal';

const GOALS = [
  { value: 'strength', label: 'Strength' },
  { value: 'hypertrophy', label: 'Muscle Building' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'weight-loss', label: 'Weight Loss' },
  { value: 'general', label: 'General Fitness' },
];

export function ProgramBuilder() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Program metadata
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('strength');
  const [daysPerWeek, setDaysPerWeek] = useState(4);

  // Workouts
  const [workouts, setWorkouts] = useState<WorkoutFormData[]>([
    {
      name: 'Workout 1',
      focus: 'Full Body',
      dayNumber: 1,
      exercises: [],
    },
  ]);

  // Exercise search modal
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [targetWorkoutIndex, setTargetWorkoutIndex] = useState<number>(0);

  const addWorkout = () => {
    setWorkouts([
      ...workouts,
      {
        name: `Workout ${workouts.length + 1}`,
        focus: 'Full Body',
        dayNumber: workouts.length + 1,
        exercises: [],
      },
    ]);
  };

  const removeWorkout = (index: number) => {
    if (workouts.length <= 1) return;
    const updated = workouts.filter((_, i) => i !== index);
    // Update day numbers
    updated.forEach((w, i) => {
      w.dayNumber = i + 1;
    });
    setWorkouts(updated);
  };

  const moveWorkout = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= workouts.length) return;

    const updated = [...workouts];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    // Update day numbers
    updated.forEach((w, i) => {
      w.dayNumber = i + 1;
    });
    setWorkouts(updated);
  };

  const updateWorkout = (index: number, data: Partial<WorkoutFormData>) => {
    const updated = [...workouts];
    updated[index] = { ...updated[index], ...data };
    setWorkouts(updated);
  };

  const openExerciseSearch = (workoutIndex: number) => {
    setTargetWorkoutIndex(workoutIndex);
    setSearchModalOpen(true);
  };

  const handleExerciseSelect = (exercise: {
    id: string;
    name: string;
    category: string;
    equipment: string[];
  }) => {
    const workout = workouts[targetWorkoutIndex];
    const newExercise = {
      exerciseLibraryId: exercise.id,
      name: exercise.name,
      sets: 3,
      measureType: 'REPS' as const,
      measureValue: 10,
      restPeriod: 60,
      sortOrder: workout.exercises.length,
    };

    updateWorkout(targetWorkoutIndex, {
      exercises: [...workout.exercises, newExercise],
    });
    setSearchModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!name.trim()) {
      setError('Program name is required');
      return;
    }

    const emptyWorkouts = workouts.filter((w) => w.exercises.length === 0);
    if (emptyWorkouts.length > 0) {
      setError('Each workout must have at least one exercise');
      return;
    }

    const data: ProgramFormData = {
      name,
      description,
      goal,
      daysPerWeek,
      workouts,
    };

    startTransition(async () => {
      const result = await createManualProgram(data);
      if (result?.error) {
        setError(
          'formErrors' in result.error
            ? result.error.formErrors.join(', ')
            : 'Failed to create program'
        );
      }
      // If successful, redirect happens in server action
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Program Metadata */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#0F172A]">Program Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#475569] mb-1">
              Program Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Push/Pull/Legs"
              className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent text-[#0F172A]"
              required
            />
          </div>

          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-[#475569] mb-1">
              Goal
            </label>
            <select
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent text-[#0F172A]"
            >
              {GOALS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="daysPerWeek" className="block text-sm font-medium text-[#475569] mb-1">
              Days per Week
            </label>
            <select
              id="daysPerWeek"
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent text-[#0F172A]"
            >
              {[2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} days
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[#475569] mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent text-[#0F172A]"
            />
          </div>
        </div>
      </div>

      {/* Workouts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#0F172A]">Workouts</h2>
          <button
            type="button"
            onClick={addWorkout}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#FF6B6B] hover:bg-[#FFE5E5] rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Workout
          </button>
        </div>

        {workouts.map((workout, index) => (
          <WorkoutSection
            key={index}
            workout={workout}
            index={index}
            totalWorkouts={workouts.length}
            onUpdate={(data) => updateWorkout(index, data)}
            onRemove={() => removeWorkout(index)}
            onMoveUp={() => moveWorkout(index, 'up')}
            onMoveDown={() => moveWorkout(index, 'down')}
            onAddExercise={() => openExerciseSearch(index)}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="px-8 py-4 bg-[#FF6B6B] hover:bg-[#EF5350] text-white font-semibold rounded-xl shadow-lg shadow-[#FF6B6B]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isPending ? 'Saving...' : 'Save Program'}
        </button>
      </div>

      {/* Exercise Search Modal */}
      <ExerciseSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelect={handleExerciseSelect}
      />
    </form>
  );
}
