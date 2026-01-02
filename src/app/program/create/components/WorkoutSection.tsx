'use client';

import { type WorkoutFormData, type ExerciseFormData } from '../actions';

const FOCUS_OPTIONS = [
  'Full Body',
  'Upper Body',
  'Lower Body',
  'Push',
  'Pull',
  'Legs',
  'Chest & Triceps',
  'Back & Biceps',
  'Shoulders & Arms',
  'Core',
];

interface WorkoutSectionProps {
  workout: WorkoutFormData;
  index: number;
  totalWorkouts: number;
  onUpdate: (data: Partial<WorkoutFormData>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddExercise: () => void;
}

export function WorkoutSection({
  workout,
  index,
  totalWorkouts,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  onAddExercise,
}: WorkoutSectionProps) {
  const updateExercise = (exerciseIndex: number, data: Partial<ExerciseFormData>) => {
    const updated = [...workout.exercises];
    updated[exerciseIndex] = { ...updated[exerciseIndex], ...data };
    onUpdate({ exercises: updated });
  };

  const removeExercise = (exerciseIndex: number) => {
    const updated = workout.exercises.filter((_, i) => i !== exerciseIndex);
    // Update sort orders
    updated.forEach((e, i) => {
      e.sortOrder = i;
    });
    onUpdate({ exercises: updated });
  };

  const moveExercise = (exerciseIndex: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? exerciseIndex - 1 : exerciseIndex + 1;
    if (newIndex < 0 || newIndex >= workout.exercises.length) return;

    const updated = [...workout.exercises];
    [updated[exerciseIndex], updated[newIndex]] = [updated[newIndex], updated[exerciseIndex]];
    // Update sort orders
    updated.forEach((e, i) => {
      e.sortOrder = i;
    });
    onUpdate({ exercises: updated });
  };

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
      {/* Workout Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[#64748B]">DAY {workout.dayNumber}</span>
          <input
            type="text"
            value={workout.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="px-2 py-1 text-lg font-semibold text-[#0F172A] bg-transparent border-b border-transparent hover:border-[#E2E8F0] focus:border-[#FF6B6B] focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1.5 text-[#94A3B8] hover:text-[#0F172A] disabled:opacity-30 transition-colors"
            title="Move up"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === totalWorkouts - 1}
            className="p-1.5 text-[#94A3B8] hover:text-[#0F172A] disabled:opacity-30 transition-colors"
            title="Move down"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={totalWorkouts <= 1}
            className="p-1.5 text-[#94A3B8] hover:text-red-500 disabled:opacity-30 transition-colors"
            title="Remove workout"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Focus selector */}
      <div className="px-4 py-2 border-b border-[#E2E8F0]">
        <label className="text-xs font-medium text-[#94A3B8] uppercase tracking-wide">Focus</label>
        <select
          value={workout.focus}
          onChange={(e) => onUpdate({ focus: e.target.value })}
          className="w-full mt-1 px-2 py-1.5 text-sm rounded border border-[#E2E8F0] focus:ring-1 focus:ring-[#FF6B6B] focus:border-transparent text-[#0F172A]"
        >
          {FOCUS_OPTIONS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {/* Exercises */}
      <div className="p-4 space-y-3">
        {workout.exercises.length === 0 ? (
          <p className="text-center text-[#94A3B8] py-4">No exercises yet</p>
        ) : (
          workout.exercises.map((exercise, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#F1F5F9]"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#0F172A] truncate">{exercise.name}</p>
                <div className="flex items-center gap-4 mt-1">
                  {/* Sets */}
                  <div className="flex items-center gap-1">
                    <label className="text-xs text-[#94A3B8]">Sets</label>
                    <input
                      type="number"
                      value={exercise.sets}
                      onChange={(e) => updateExercise(i, { sets: Number(e.target.value) })}
                      min={1}
                      max={20}
                      className="w-12 px-1.5 py-0.5 text-sm text-center rounded border border-[#E2E8F0] text-[#0F172A]"
                    />
                  </div>

                  {/* Measure */}
                  <div className="flex items-center gap-1">
                    <select
                      value={exercise.measureType}
                      onChange={(e) =>
                        updateExercise(i, {
                          measureType: e.target.value as 'REPS' | 'TIME' | 'DISTANCE',
                        })
                      }
                      className="text-xs px-1.5 py-0.5 rounded border border-[#E2E8F0] text-[#0F172A]"
                    >
                      <option value="REPS">Reps</option>
                      <option value="TIME">Time</option>
                      <option value="DISTANCE">Distance</option>
                    </select>
                    <input
                      type="number"
                      value={exercise.measureValue}
                      onChange={(e) => updateExercise(i, { measureValue: Number(e.target.value) })}
                      min={1}
                      className="w-12 px-1.5 py-0.5 text-sm text-center rounded border border-[#E2E8F0] text-[#0F172A]"
                    />
                    {exercise.measureType === 'TIME' && (
                      <span className="text-xs text-[#94A3B8]">sec</span>
                    )}
                  </div>

                  {/* Rest */}
                  <div className="flex items-center gap-1">
                    <label className="text-xs text-[#94A3B8]">Rest</label>
                    <input
                      type="number"
                      value={exercise.restPeriod || 60}
                      onChange={(e) => updateExercise(i, { restPeriod: Number(e.target.value) })}
                      min={0}
                      max={600}
                      step={15}
                      className="w-14 px-1.5 py-0.5 text-sm text-center rounded border border-[#E2E8F0] text-[#0F172A]"
                    />
                    <span className="text-xs text-[#94A3B8]">s</span>
                  </div>
                </div>
              </div>

              {/* Exercise controls */}
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => moveExercise(i, 'up')}
                  disabled={i === 0}
                  className="p-1 text-[#94A3B8] hover:text-[#0F172A] disabled:opacity-30"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => moveExercise(i, 'down')}
                  disabled={i === workout.exercises.length - 1}
                  className="p-1 text-[#94A3B8] hover:text-[#0F172A] disabled:opacity-30"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => removeExercise(i)}
                  className="p-1 text-[#94A3B8] hover:text-red-500"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}

        {/* Add Exercise Button */}
        <button
          type="button"
          onClick={onAddExercise}
          className="w-full py-3 border-2 border-dashed border-[#E2E8F0] rounded-lg text-[#94A3B8] hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Exercise
        </button>
      </div>
    </div>
  );
}
