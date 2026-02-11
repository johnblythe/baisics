'use client';

import { useState, useTransition } from 'react';
import { createManualProgram, type ProgramFormData, type WorkoutFormData } from '../actions';
import { WorkoutSection } from './WorkoutSection';
import { ExerciseSearchModal } from './ExerciseSearchModal';
import { Plus, X, Layers } from 'lucide-react';
import { toast } from 'sonner';

export type { ProgramFormData, WorkoutFormData };

interface ProgramBuilderProps {
  onSave?: (data: ProgramFormData) => Promise<{ programId: string }>;
}

const GOALS = [
  { value: 'strength', label: 'Strength' },
  { value: 'hypertrophy', label: 'Muscle Building' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'weight-loss', label: 'Weight Loss' },
  { value: 'general', label: 'General Fitness' },
];

const PHASE_TEMPLATES = [
  { name: 'Hypertrophy', durationWeeks: 4, description: 'Muscle building focus' },
  { name: 'Strength', durationWeeks: 4, description: 'Strength development' },
  { name: 'Deload', durationWeeks: 1, description: 'Recovery week' },
];

interface Phase {
  name: string;
  durationWeeks: number;
  workouts: WorkoutFormData[];
}

export function ProgramBuilder({ onSave }: ProgramBuilderProps = {}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Program metadata
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('strength');
  const [daysPerWeek, setDaysPerWeek] = useState(4);

  // Multi-phase support
  const [usePhases, setUsePhases] = useState(false);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [phases, setPhases] = useState<Phase[]>([
    {
      name: 'Phase 1',
      durationWeeks: 4,
      workouts: [
        {
          name: 'Workout 1',
          focus: 'Full Body',
          dayNumber: 1,
          exercises: [],
        },
      ],
    },
  ]);

  // Get current phase's workouts for display
  const currentPhase = phases[activePhaseIndex];
  const workouts = currentPhase?.workouts || [];

  // Exercise search modal
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [targetWorkoutIndex, setTargetWorkoutIndex] = useState<number>(0);

  // Helper to update workouts in current phase
  const setWorkouts = (newWorkouts: WorkoutFormData[]) => {
    setPhases(prev => prev.map((phase, i) =>
      i === activePhaseIndex ? { ...phase, workouts: newWorkouts } : phase
    ));
  };

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

  // Phase management
  const addPhase = (template?: typeof PHASE_TEMPLATES[0]) => {
    const newPhase: Phase = {
      name: template?.name || `Phase ${phases.length + 1}`,
      durationWeeks: template?.durationWeeks || 4,
      workouts: [
        {
          name: 'Workout 1',
          focus: 'Full Body',
          dayNumber: 1,
          exercises: [],
        },
      ],
    };
    setPhases([...phases, newPhase]);
    setActivePhaseIndex(phases.length);
  };

  const removePhase = (index: number) => {
    if (phases.length <= 1) return;
    const updated = phases.filter((_, i) => i !== index);
    setPhases(updated);
    if (activePhaseIndex >= updated.length) {
      setActivePhaseIndex(updated.length - 1);
    }
  };

  const updatePhase = (index: number, data: Partial<Phase>) => {
    setPhases(prev => prev.map((phase, i) =>
      i === index ? { ...phase, ...data } : phase
    ));
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

    // Validate all phases have workouts with exercises
    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      const emptyWorkouts = phase.workouts.filter((w) => w.exercises.length === 0);
      if (emptyWorkouts.length > 0) {
        setError(`${phase.name}: Each workout must have at least one exercise`);
        setActivePhaseIndex(i);
        return;
      }
    }

    // For now, use first phase workouts (multi-phase save requires action update)
    // TODO: Update action to accept phases array
    const data: ProgramFormData = {
      name,
      description,
      goal,
      daysPerWeek,
      workouts: phases[0].workouts,
    };

    startTransition(async () => {
      try {
        if (onSave) {
          // Use custom save handler (e.g. coach program creation)
          await onSave(data);
          toast.success('Program saved!', {
            description: `Program created successfully.`,
          });
          return;
        }

        const result = await createManualProgram(data);
        if (result?.error) {
          const errorMessage = 'formErrors' in result.error
            ? result.error.formErrors.join(', ')
            : 'Failed to create program';
          setError(errorMessage);
          toast.error('Failed to save program', {
            description: errorMessage,
          });
        }
        // If successful, redirect happens in server action
      } catch (err) {
        // Log for debugging (Issue #192)
        console.error('Program creation failed:', {
          error: err instanceof Error ? err.message : err,
          stack: err instanceof Error ? err.stack : undefined,
        });

        const errorMessage = err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.';
        setError(errorMessage);
        toast.error('Failed to save program', {
          description: errorMessage,
        });
      }
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

        {/* Multi-phase toggle */}
        <label className="flex items-center gap-3 pt-2 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={usePhases}
              onChange={(e) => setUsePhases(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-[#E2E8F0] peer-focus:ring-2 peer-focus:ring-[#FF6B6B] rounded-full peer peer-checked:bg-[#FF6B6B] transition-colors"></div>
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
          </div>
          <div>
            <span className="text-sm font-medium text-[#0F172A]">Multi-phase program</span>
            <p className="text-xs text-[#64748B]">Create periodized training with multiple phases</p>
          </div>
        </label>
      </div>

      {/* Phase Tabs (only shown when multi-phase is enabled) */}
      {usePhases && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-[#64748B]" />
            <span className="text-sm font-medium text-[#64748B]">Training Phases</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {phases.map((phase, index) => (
              <div
                key={index}
                className={`relative group flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors cursor-pointer ${
                  activePhaseIndex === index
                    ? 'bg-[#FFE5E5] border-[#FF6B6B] text-[#FF6B6B]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:border-[#FF6B6B]'
                }`}
                onClick={() => setActivePhaseIndex(index)}
              >
                <span className="font-medium">{phase.name}</span>
                <span className="text-xs opacity-75">{phase.durationWeeks}w</span>
                {phases.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhase(index);
                    }}
                    className="ml-1 p-0.5 text-current opacity-50 hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            {/* Add Phase dropdown */}
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1 px-3 py-2 text-sm text-[#FF6B6B] hover:bg-[#FFE5E5] rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Phase
              </button>
              <div className="hidden group-hover:block absolute top-full left-0 mt-1 bg-white rounded-lg border border-[#E2E8F0] shadow-lg z-10 min-w-[160px]">
                <button
                  type="button"
                  onClick={() => addPhase()}
                  className="w-full px-4 py-2 text-left text-sm text-[#0F172A] hover:bg-[#F8FAFC]"
                >
                  Blank Phase
                </button>
                <div className="border-t border-[#E2E8F0]" />
                {PHASE_TEMPLATES.map((template) => (
                  <button
                    key={template.name}
                    type="button"
                    onClick={() => addPhase(template)}
                    className="w-full px-4 py-2 text-left hover:bg-[#F8FAFC]"
                  >
                    <span className="text-sm text-[#0F172A]">{template.name}</span>
                    <span className="block text-xs text-[#94A3B8]">{template.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Phase settings for active phase */}
          <div className="mt-4 pt-4 border-t border-[#E2E8F0] grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1">Phase Name</label>
              <input
                type="text"
                value={currentPhase?.name || ''}
                onChange={(e) => updatePhase(activePhaseIndex, { name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent text-[#0F172A]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1">Duration (weeks)</label>
              <input
                type="number"
                value={currentPhase?.durationWeeks || 4}
                onChange={(e) => updatePhase(activePhaseIndex, { durationWeeks: parseInt(e.target.value) || 4 })}
                min={1}
                max={12}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent text-[#0F172A]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Workouts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#0F172A]">
            {usePhases ? `${currentPhase?.name || 'Phase'} Workouts` : 'Workouts'}
          </h2>
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
