'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/app/components/layouts/MainLayout';
import { ExerciseAddModal } from '@/components/ExerciseAddModal';
import { SaveAsTemplateModal } from './components/SaveAsTemplateModal';
import { useSession } from 'next-auth/react';
import { ChevronDown, ChevronRight, Play, GripVertical, Trash2, Plus, X, BookmarkPlus } from 'lucide-react';
import { AssignDropdown } from '@/components/AssignDropdown';
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

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number | null;
  restPeriod: number;
  notes: string | null;
  measureType: string | null;
  measureUnit: string | null;
  measureValue: number | null;
  sortOrder?: number;
}

interface Workout {
  id: string;
  name: string;
  dayNumber: number;
  focus: string;
  exercises: Exercise[];
}

interface WorkoutPlan {
  id: string;
  workouts: Workout[];
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  dailyCalories: number;
}

interface Program {
  id: string;
  name: string;
  description: string | null;
  workoutPlans: WorkoutPlan[];
  isTemplate?: boolean;
  createdBy?: string;
}

// Editable state types
interface EditableExercise extends Exercise {
  _deleted?: boolean;
  _modified?: boolean;
}

interface EditableWorkout extends Omit<Workout, 'exercises'> {
  exercises: EditableExercise[];
  _nameModified?: boolean;
  _focusModified?: boolean;
}

function formatRestPeriod(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) {
    return '–';
  }
  if (seconds >= 60) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }
  return `${seconds}s`;
}

function formatMeasure(exercise: Exercise): string {
  if (exercise.measureType === 'TIME' && exercise.measureValue) {
    return `${exercise.measureValue}s`;
  }
  if (exercise.measureType === 'DISTANCE' && exercise.measureValue) {
    return `${exercise.measureValue}${exercise.measureUnit || 'm'}`;
  }
  if (exercise.reps) {
    return `${exercise.reps} reps`;
  }
  return '';
}

// Sortable Exercise Row Component
interface SortableExerciseRowProps {
  exercise: EditableExercise;
  workout: EditableWorkout;
  index: number;
  isEditMode: boolean;
  onExerciseChange: (workoutId: string, exerciseId: string, field: keyof Exercise, value: any) => void;
  onRemoveExercise: (workoutId: string, exerciseId: string) => void;
}

function SortableExerciseRow({
  exercise,
  workout,
  index,
  isEditMode,
  onExerciseChange,
  onRemoveExercise,
}: SortableExerciseRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`px-4 py-3 ${
        index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
      } ${isEditMode ? 'hover:bg-[#FFF5F5]' : ''} ${isDragging ? 'z-10 shadow-lg' : ''}`}
    >
      {/* Mobile Edit Layout */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isEditMode && (
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1"
              >
                <GripVertical className="w-4 h-4 text-[#CBD5E1]" />
              </button>
            )}
            <span className="font-medium text-[#0F172A]">{exercise.name}</span>
          </div>
          {isEditMode && (
            <button
              onClick={() => onRemoveExercise(workout.id, exercise.id)}
              className="p-1 text-[#94A3B8] hover:text-[#EF5350] transition-colors"
              title="Remove exercise"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        {isEditMode ? (
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#64748B]">Sets:</span>
              <input
                type="number"
                value={exercise.sets}
                onChange={(e) => onExerciseChange(workout.id, exercise.id, 'sets', parseInt(e.target.value) || 0)}
                className="w-12 text-center border border-[#E2E8F0] rounded px-2 py-1 text-sm focus:border-[#FF6B6B] focus:outline-none"
                min="1"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#64748B]">Reps:</span>
              <input
                type="number"
                value={exercise.reps || ''}
                onChange={(e) => onExerciseChange(workout.id, exercise.id, 'reps', parseInt(e.target.value) || null)}
                className="w-12 text-center border border-[#E2E8F0] rounded px-2 py-1 text-sm focus:border-[#FF6B6B] focus:outline-none"
                min="1"
                placeholder="-"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#64748B]">Rest:</span>
              <input
                type="number"
                value={exercise.restPeriod}
                onChange={(e) => onExerciseChange(workout.id, exercise.id, 'restPeriod', parseInt(e.target.value) || 0)}
                className="w-14 text-center border border-[#E2E8F0] rounded px-2 py-1 text-sm focus:border-[#FF6B6B] focus:outline-none"
                min="0"
                step="15"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-4 text-sm text-[#475569]">
              <span>{exercise.sets} sets</span>
              <span>{formatMeasure(exercise)}</span>
              <span>{formatRestPeriod(exercise.restPeriod)} rest</span>
            </div>
            {exercise.notes && (
              <p className="text-xs text-[#94A3B8] mt-2">{exercise.notes}</p>
            )}
          </>
        )}
      </div>
      {/* Desktop Layout */}
      <div className="hidden md:grid grid-cols-12 gap-2 items-center">
        {isEditMode && (
          <div className="col-span-1 flex justify-center">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1"
            >
              <GripVertical className="w-4 h-4 text-[#CBD5E1]" />
            </button>
          </div>
        )}
        <div className={isEditMode ? "col-span-4" : "col-span-5"}>
          <span className="font-medium text-[#0F172A]">{exercise.name}</span>
          {exercise.notes && !isEditMode && (
            <p className="text-xs text-[#94A3B8] mt-0.5">{exercise.notes}</p>
          )}
        </div>
        <div className="col-span-2 text-center">
          {isEditMode ? (
            <input
              type="number"
              value={exercise.sets}
              onChange={(e) => onExerciseChange(workout.id, exercise.id, 'sets', parseInt(e.target.value) || 0)}
              className="w-12 text-center border border-[#E2E8F0] rounded px-2 py-1 focus:border-[#FF6B6B] focus:outline-none"
              min="1"
            />
          ) : (
            <span className="text-[#475569]">{exercise.sets}</span>
          )}
        </div>
        <div className="col-span-2 text-center">
          {isEditMode ? (
            <input
              type="number"
              value={exercise.reps || ''}
              onChange={(e) => onExerciseChange(workout.id, exercise.id, 'reps', parseInt(e.target.value) || null)}
              className="w-12 text-center border border-[#E2E8F0] rounded px-2 py-1 focus:border-[#FF6B6B] focus:outline-none"
              min="1"
              placeholder="-"
            />
          ) : (
            <span className="text-[#475569]">{formatMeasure(exercise)}</span>
          )}
        </div>
        <div className="col-span-2 text-center">
          {isEditMode ? (
            <input
              type="number"
              value={exercise.restPeriod}
              onChange={(e) => onExerciseChange(workout.id, exercise.id, 'restPeriod', parseInt(e.target.value) || 0)}
              className="w-16 text-center border border-[#E2E8F0] rounded px-2 py-1 focus:border-[#FF6B6B] focus:outline-none"
              min="0"
              step="15"
            />
          ) : (
            <span className="text-[#475569]">{formatRestPeriod(exercise.restPeriod)}</span>
          )}
        </div>
        {isEditMode && (
          <div className="col-span-1 flex justify-center">
            <button
              onClick={() => onRemoveExercise(workout.id, exercise.id)}
              className="p-1 text-[#94A3B8] hover:text-[#EF5350] transition-colors"
              title="Remove exercise"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProgramPage() {
  const router = useRouter();
  const params = useParams();
  const programId = params.programId as string;
  const { data: session } = useSession();

  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableWorkouts, setEditableWorkouts] = useState<EditableWorkout[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [addExerciseWorkoutId, setAddExerciseWorkoutId] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    async function fetchProgram() {
      try {
        const response = await fetch(`/api/programs/${programId}/overview`);
        if (!response.ok) {
          if (response.status === 404) {
            router.replace('/program');
            return;
          }
          throw new Error('Failed to fetch program');
        }
        const data = await response.json();
        setProgram(data);
        // Expand first workout by default
        if (data.workoutPlans?.[0]?.workouts?.[0]?.id) {
          setExpandedWorkouts(new Set([data.workoutPlans[0].workouts[0].id]));
        }
      } catch (error) {
        console.error('Failed to fetch program:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (programId) {
      fetchProgram();
    }
  }, [programId, router]);

  // Initialize editable state when entering edit mode
  useEffect(() => {
    if (isEditMode && program) {
      const workouts = program.workoutPlans.flatMap(plan =>
        plan.workouts.map(w => ({
          ...w,
          exercises: w.exercises.map(e => ({ ...e }))
        }))
      );
      setEditableWorkouts(workouts);
      setHasChanges(false);
    }
  }, [isEditMode, program]);

  const toggleWorkout = (workoutId: string) => {
    setExpandedWorkouts(prev => {
      const next = new Set(prev);
      if (next.has(workoutId)) {
        next.delete(workoutId);
      } else {
        next.add(workoutId);
      }
      return next;
    });
  };

  const handleExerciseChange = (workoutId: string, exerciseId: string, field: keyof Exercise, value: any) => {
    setEditableWorkouts(prev => prev.map(w => {
      if (w.id !== workoutId) return w;
      return {
        ...w,
        exercises: w.exercises.map(e => {
          if (e.id !== exerciseId) return e;
          return { ...e, [field]: value, _modified: true };
        })
      };
    }));
    setHasChanges(true);
  };

  const handleWorkoutChange = (workoutId: string, field: 'name' | 'focus', value: string) => {
    setEditableWorkouts(prev => prev.map(w => {
      if (w.id !== workoutId) return w;
      return {
        ...w,
        [field]: value,
        [`_${field}Modified`]: true
      };
    }));
    setHasChanges(true);
  };

  const handleRemoveExercise = (workoutId: string, exerciseId: string) => {
    setEditableWorkouts(prev => prev.map(w => {
      if (w.id !== workoutId) return w;
      return {
        ...w,
        exercises: w.exercises.map(e => {
          if (e.id !== exerciseId) return e;
          return { ...e, _deleted: true };
        })
      };
    }));
    setHasChanges(true);
  };

  const handleDragEnd = async (event: DragEndEvent, workoutId: string) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const workout = editableWorkouts.find(w => w.id === workoutId);
    if (!workout) return;

    const visibleExercises = workout.exercises.filter(e => !e._deleted);
    const oldIndex = visibleExercises.findIndex(e => e.id === active.id);
    const newIndex = visibleExercises.findIndex(e => e.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedExercises = arrayMove(visibleExercises, oldIndex, newIndex);

    // Update local state
    setEditableWorkouts(prev => prev.map(w => {
      if (w.id !== workoutId) return w;
      // Preserve deleted exercises, replace visible ones with reordered
      const deletedExercises = w.exercises.filter(e => e._deleted);
      return {
        ...w,
        exercises: [...reorderedExercises, ...deletedExercises]
      };
    }));
    setHasChanges(true);

    // Call API to persist order
    try {
      await fetch(`/api/workouts/${workoutId}/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseIds: reorderedExercises.map(e => e.id)
        })
      });
    } catch (error) {
      console.error('Failed to save exercise order:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditableWorkouts([]);
    setHasChanges(false);
  };

  const handleAddExercise = (newExercise: any) => {
    if (!addExerciseWorkoutId) return;

    // Add to editable workouts
    setEditableWorkouts(prev => prev.map(w => {
      if (w.id !== addExerciseWorkoutId) return w;
      return {
        ...w,
        exercises: [...w.exercises, {
          id: newExercise.id,
          name: newExercise.name,
          sets: newExercise.sets,
          reps: newExercise.reps,
          restPeriod: newExercise.restPeriod,
          notes: newExercise.notes,
          measureType: newExercise.measureType,
          measureUnit: newExercise.measureUnit,
          measureValue: newExercise.measureValue,
          sortOrder: newExercise.sortOrder,
        }]
      };
    }));

    // Also update the program state for immediate display
    setProgram(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        workoutPlans: prev.workoutPlans.map(plan => ({
          ...plan,
          workouts: plan.workouts.map(w => {
            if (w.id !== addExerciseWorkoutId) return w;
            return {
              ...w,
              exercises: [...w.exercises, {
                id: newExercise.id,
                name: newExercise.name,
                sets: newExercise.sets,
                reps: newExercise.reps,
                restPeriod: newExercise.restPeriod,
                notes: newExercise.notes,
                measureType: newExercise.measureType,
                measureUnit: newExercise.measureUnit,
                measureValue: newExercise.measureValue,
              }]
            };
          })
        }))
      };
    });

    setAddExerciseWorkoutId(null);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Collect all changes
      const exerciseUpdates: Promise<Response>[] = [];
      const exerciseDeletes: Promise<Response>[] = [];
      const workoutUpdates: Promise<Response>[] = [];

      for (const workout of editableWorkouts) {
        // Workout metadata changes
        if (workout._nameModified || workout._focusModified) {
          workoutUpdates.push(
            fetch(`/api/workouts/${workout.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: workout.name,
                focus: workout.focus
              })
            })
          );
        }

        for (const exercise of workout.exercises) {
          if (exercise._deleted) {
            exerciseDeletes.push(
              fetch(`/api/exercises/${exercise.id}`, { method: 'DELETE' })
            );
          } else if (exercise._modified) {
            exerciseUpdates.push(
              fetch(`/api/exercises/${exercise.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sets: exercise.sets,
                  reps: exercise.reps,
                  restPeriod: exercise.restPeriod,
                  notes: exercise.notes
                })
              })
            );
          }
        }
      }

      // Execute all updates
      await Promise.all([...exerciseUpdates, ...exerciseDeletes, ...workoutUpdates]);

      // Refetch program data
      const response = await fetch(`/api/programs/${programId}/overview`);
      if (response.ok) {
        const data = await response.json();
        setProgram(data);
      }

      setIsEditMode(false);
      setEditableWorkouts([]);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save changes:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-6 h-6 border-2 border-[#F1F5F9] border-t-[#FF6B6B] rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  if (!program) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-[#475569]">Program not found</p>
          <Link
            href="/hi"
            className="px-6 py-3 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350] transition-colors"
          >
            Create a Program
          </Link>
        </div>
      </MainLayout>
    );
  }

  const workouts = isEditMode
    ? editableWorkouts
    : program.workoutPlans.flatMap(plan => plan.workouts);

  return (
    <MainLayout>
      <div className="bg-[#F8FAFC] min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]">{program.name}</h1>
              {program.description && (
                <p className="text-[#64748B] mt-1">{program.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {isEditMode ? (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-[#475569] hover:text-[#0F172A] transition-colors"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={!hasChanges || isSaving}
                    className="px-6 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      'Update'
                    )}
                  </button>
                </>
              ) : (
                <>
                  {!program.isTemplate && (
                    <button
                      onClick={() => setShowTemplateModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm text-[#64748B] hover:text-[#FF6B6B] transition-colors"
                      title="Save as template"
                    >
                      <BookmarkPlus className="w-4 h-4" />
                      <span className="hidden sm:inline">Template</span>
                    </button>
                  )}
                  {program.isTemplate && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#FF6B6B] bg-[#FFE5E5] rounded-full">
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      Template
                    </span>
                  )}
                  {session && (
                    <AssignDropdown
                      programId={program.id}
                      programName={program.name}
                    />
                  )}
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-[#64748B] hover:text-[#FF6B6B] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Workouts List */}
          <div className="space-y-4">
            {workouts.map((workout) => {
              const isExpanded = expandedWorkouts.has(workout.id);
              const visibleExercises = isEditMode
                ? (workout as EditableWorkout).exercises.filter(e => !e._deleted)
                : workout.exercises;

              return (
                <div
                  key={workout.id}
                  className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden"
                >
                  {/* Workout Header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#F8FAFC] transition-colors"
                    onClick={() => toggleWorkout(workout.id)}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-[#94A3B8]" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-[#94A3B8]" />
                      )}
                      <div>
                        {isEditMode ? (
                          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <span className="text-[#64748B] text-sm">Day {workout.dayNumber} -</span>
                            <input
                              type="text"
                              value={workout.name}
                              onChange={(e) => handleWorkoutChange(workout.id, 'name', e.target.value)}
                              className="font-semibold text-[#0F172A] bg-transparent border-b border-dashed border-[#E2E8F0] focus:border-[#FF6B6B] focus:outline-none px-1"
                            />
                          </div>
                        ) : (
                          <h3 className="font-semibold text-[#0F172A]">
                            Day {workout.dayNumber} - {workout.name}
                          </h3>
                        )}
                        {isEditMode ? (
                          <div onClick={e => e.stopPropagation()}>
                            <input
                              type="text"
                              value={workout.focus}
                              onChange={(e) => handleWorkoutChange(workout.id, 'focus', e.target.value)}
                              className="text-sm text-[#64748B] bg-transparent border-b border-dashed border-[#E2E8F0] focus:border-[#FF6B6B] focus:outline-none px-1 mt-1"
                            />
                          </div>
                        ) : (
                          <p className="text-sm text-[#64748B]">
                            {workout.focus} • {visibleExercises.length} exercises
                          </p>
                        )}
                      </div>
                    </div>
                    {!isEditMode && (
                      <Link
                        href={`/workout/${workout.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 px-4 py-2 bg-[#FF6B6B] text-white text-sm font-medium rounded-lg hover:bg-[#EF5350] transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Start
                      </Link>
                    )}
                  </div>

                  {/* Exercises */}
                  {isExpanded && (
                    <div className="border-t border-[#E2E8F0]">
                      {/* Header Row */}
                      <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 bg-[#F8FAFC] text-xs font-medium text-[#64748B] uppercase tracking-wider">
                        {isEditMode && <div className="col-span-1"></div>}
                        <div className={isEditMode ? "col-span-4" : "col-span-5"}>Exercise</div>
                        <div className="col-span-2 text-center">Sets</div>
                        <div className="col-span-2 text-center">Reps</div>
                        <div className="col-span-2 text-center">Rest</div>
                        {isEditMode && <div className="col-span-1"></div>}
                      </div>

                      {/* Exercise Rows */}
                      {isEditMode ? (
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(event) => handleDragEnd(event, workout.id)}
                        >
                          <SortableContext
                            items={visibleExercises.map(e => e.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {visibleExercises.map((exercise, index) => (
                              <SortableExerciseRow
                                key={exercise.id}
                                exercise={exercise as EditableExercise}
                                workout={workout as EditableWorkout}
                                index={index}
                                isEditMode={isEditMode}
                                onExerciseChange={handleExerciseChange}
                                onRemoveExercise={handleRemoveExercise}
                              />
                            ))}
                          </SortableContext>
                        </DndContext>
                      ) : (
                        visibleExercises.map((exercise, index) => (
                          <div
                            key={exercise.id}
                            className={`px-4 py-3 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                            }`}
                          >
                            {/* Mobile Layout */}
                            <div className="md:hidden">
                              <div className="font-medium text-[#0F172A] mb-1">{exercise.name}</div>
                              <div className="flex gap-4 text-sm text-[#475569]">
                                <span>{exercise.sets} sets</span>
                                <span>{formatMeasure(exercise)}</span>
                                <span>{formatRestPeriod(exercise.restPeriod)} rest</span>
                              </div>
                              {exercise.notes && (
                                <p className="text-xs text-[#94A3B8] mt-2">{exercise.notes}</p>
                              )}
                            </div>
                            {/* Desktop Layout */}
                            <div className="hidden md:grid grid-cols-12 gap-2 items-center">
                              <div className="col-span-5">
                                <span className="font-medium text-[#0F172A]">{exercise.name}</span>
                                {exercise.notes && (
                                  <p className="text-xs text-[#94A3B8] mt-0.5">{exercise.notes}</p>
                                )}
                              </div>
                              <div className="col-span-2 text-center">
                                <span className="text-[#475569]">{exercise.sets}</span>
                              </div>
                              <div className="col-span-2 text-center">
                                <span className="text-[#475569]">{formatMeasure(exercise)}</span>
                              </div>
                              <div className="col-span-2 text-center">
                                <span className="text-[#475569]">{formatRestPeriod(exercise.restPeriod)}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}

                      {/* Add Exercise Button (Edit Mode) */}
                      {isEditMode && (
                        <div className="px-4 py-3 border-t border-[#E2E8F0]">
                          <button
                            className="flex items-center gap-2 text-sm text-[#FF6B6B] hover:text-[#EF5350] transition-colors"
                            onClick={() => setAddExerciseWorkoutId(workout.id)}
                          >
                            <Plus className="w-4 h-4" />
                            Add Exercise
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Edit Mode Footer */}
          {isEditMode && hasChanges && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] shadow-lg p-4">
              <div className="max-w-4xl mx-auto flex items-center justify-between">
                <p className="text-sm text-[#64748B]">You have unsaved changes</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-[#475569] hover:text-[#0F172A] transition-colors"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="px-6 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350] transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      'Update'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Exercise Modal */}
      <ExerciseAddModal
        isOpen={!!addExerciseWorkoutId}
        onClose={() => setAddExerciseWorkoutId(null)}
        workoutId={addExerciseWorkoutId || ''}
        onAdd={handleAddExercise}
      />

      <SaveAsTemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        programId={program.id}
        programName={program.name}
        onSuccess={() => {
          // Refetch program to update isTemplate flag
          fetch(`/api/programs/${programId}/overview`)
            .then(res => res.json())
            .then(data => setProgram(data))
            .catch(console.error);
        }}
      />
    </MainLayout>
  );
}
