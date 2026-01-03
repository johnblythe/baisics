'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

// Sortable Exercise Component
interface SortableExerciseProps {
  exercise: ExerciseFormData;
  exerciseId: string;  // Unique ID for dnd-kit
  onUpdate: (data: Partial<ExerciseFormData>) => void;
  onRemove: () => void;
}

function SortableExercise({ exercise, exerciseId, onUpdate, onRemove }: SortableExerciseProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exerciseId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#F1F5F9] ${isDragging ? 'shadow-lg z-10' : ''}`}
    >
      {/* Drag Handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-[#CBD5E1] hover:text-[#94A3B8]"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-[#0F172A] truncate">{exercise.name}</p>
        <div className="flex items-center gap-4 mt-1">
          {/* Sets */}
          <div className="flex items-center gap-1">
            <label className="text-xs text-[#94A3B8]">Sets</label>
            <input
              type="number"
              value={exercise.sets}
              onChange={(e) => onUpdate({ sets: Number(e.target.value) })}
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
                onUpdate({
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
              onChange={(e) => onUpdate({ measureValue: Number(e.target.value) })}
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
              onChange={(e) => onUpdate({ restPeriod: Number(e.target.value) })}
              min={0}
              max={600}
              step={15}
              className="w-14 px-1.5 py-0.5 text-sm text-center rounded border border-[#E2E8F0] text-[#0F172A]"
            />
            <span className="text-xs text-[#94A3B8]">s</span>
          </div>
        </div>
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className="p-1 text-[#94A3B8] hover:text-red-500"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

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
  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Handle drag end for exercise reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Extract index from the ID (format: "exercise-{index}")
    const oldIndex = parseInt(String(active.id).split('-')[1]);
    const newIndex = parseInt(String(over.id).split('-')[1]);

    if (!isNaN(oldIndex) && !isNaN(newIndex) && oldIndex !== newIndex) {
      const updated = arrayMove(workout.exercises, oldIndex, newIndex);
      // Update sort orders
      updated.forEach((e, i) => {
        e.sortOrder = i;
      });
      onUpdate({ exercises: updated });
    }
  };

  // Generate exercise IDs for dnd-kit
  const exerciseIds = workout.exercises.map((_, i) => `exercise-${i}`);

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

      {/* Exercises with drag-drop */}
      <div className="p-4 space-y-3">
        {workout.exercises.length === 0 ? (
          <p className="text-center text-[#94A3B8] py-4">No exercises yet</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={exerciseIds} strategy={verticalListSortingStrategy}>
              {workout.exercises.map((exercise, i) => (
                <SortableExercise
                  key={`exercise-${i}`}
                  exercise={exercise}
                  exerciseId={`exercise-${i}`}
                  onUpdate={(data) => updateExercise(i, data)}
                  onRemove={() => removeExercise(i)}
                />
              ))}
            </SortableContext>
          </DndContext>
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
