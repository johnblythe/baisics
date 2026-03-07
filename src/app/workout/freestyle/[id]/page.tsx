'use client';

import React, { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, ChevronLeft, ChevronRight, Dumbbell, PlayCircle, Calendar, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import MainLayout from '@/app/components/layouts/MainLayout';
import { SetProgressGrid } from '@/components/workout/SetProgressGrid';
import { BigSetInputCard } from '@/components/workout/BigSetInputCard';
import { RestTimerControl } from '@/components/workout/RestTimerControl';
import { WorkoutProgressBar } from '@/components/workout/WorkoutProgressBar';
import RestPeriodIndicator from '@/app/components/RestPeriodIndicator';
import { ExerciseSearchModal } from '@/components/ExerciseSearchModal';
import { WorkoutShareCard, WorkoutShareData } from '@/components/share/WorkoutShareCard';
import { CalendarPicker } from '@/components/ui/CalendarPicker';

function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

function formatRestDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

interface SetLog {
  setNumber: number;
  weight?: number;
  reps: number;
  notes?: string;
  isCompleted?: boolean;
}

interface FreestyleExercise {
  id: string;
  name: string;
  sets: number;
  restPeriod: number;
  exerciseLibraryId: string;
  sortOrder: number;
  exerciseLogId?: string;
  logs: SetLog[];
}

interface ExerciseHistory {
  pr: { weight: number; reps: number } | null;
  lastSession: { weight: number; reps: number } | null;
}

export default function FreestyleWorkoutPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-[#F1F5F9] border-t-[#FF6B6B] rounded-full animate-spin" />
        </div>
      </MainLayout>
    }>
      <FreestyleWorkoutContent />
    </Suspense>
  );
}

function FreestyleWorkoutContent() {
  const params = useParams();
  const router = useRouter();
  const workoutLogId = params.id as string;

  // Core state
  const [exercises, setExercises] = useState<FreestyleExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workoutLog, setWorkoutLog] = useState<any>(null);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [programId, setProgramId] = useState<string | null>(null);

  // Exercise picker state — shown when current slot has no exercise
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  // Track whether user is picking for a new slot vs replacing
  const [needsExercisePick, setNeedsExercisePick] = useState(true);

  // Set input state
  const [selectedSetIndex, setSelectedSetIndex] = useState<number | null>(null);

  // Rest timer
  const [autoStartTimer, setAutoStartTimer] = useState(true);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restTimerKey, setRestTimerKey] = useState(0);

  // Date picker
  const [workoutDate, setWorkoutDate] = useState<Date>(() => new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const today = new Date();

  // Share modal
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState<WorkoutShareData | null>(null);

  // Exercise history
  const [exerciseHistory, setExerciseHistory] = useState<Record<string, ExerciseHistory>>({});
  const [historyLoadFailed, setHistoryLoadFailed] = useState<Set<string>>(new Set());

  // End-of-workout replace decision
  const [showReplaceDecision, setShowReplaceDecision] = useState(false);
  const [realProgramId, setRealProgramId] = useState<string | null>(null);
  const [nextWorkoutId, setNextWorkoutId] = useState<string | null>(null);
  const [isRestDay, setIsRestDay] = useState(false);
  const [alreadyCompletedToday, setAlreadyCompletedToday] = useState(false);

  // Load the workout log on mount
  useEffect(() => {
    const loadWorkout = async () => {
      try {
        const res = await fetch(`/api/workout-logs/${workoutLogId}`);
        if (!res.ok) throw new Error('Failed to load workout');
        const data = await res.json();

        setWorkoutLog(data);
        setWorkoutId(data.workoutId);
        setProgramId(data.programId);

        // Load any existing exercises (resume case)
        if (data.exerciseLogs?.length > 0) {
          const loadedExercises: FreestyleExercise[] = data.exerciseLogs.map((el: any) => {
            const exercise = el.exercise;
            const setCount = Math.max(exercise.sets || 3, el.setLogs?.length || 0);
            return {
              id: exercise.id,
              name: exercise.name,
              sets: setCount,
              restPeriod: exercise.restPeriod || 60,
              exerciseLibraryId: exercise.exerciseLibraryId,
              sortOrder: exercise.sortOrder || 0,
              exerciseLogId: el.id,
              logs: Array(setCount).fill(null).map((_: any, i: number) => {
                const existingSet = el.setLogs?.find((set: any) => set.setNumber === i + 1);
                return existingSet ? {
                  setNumber: existingSet.setNumber,
                  reps: existingSet.reps,
                  weight: existingSet.weight,
                  notes: existingSet.notes || '',
                  isCompleted: !!existingSet.completedAt,
                } : {
                  setNumber: i + 1,
                  reps: 0,
                  weight: undefined,
                  notes: '',
                  isCompleted: false,
                };
              }),
            };
          });
          setExercises(loadedExercises);
          setNeedsExercisePick(false);
        } else {
          // No exercises yet — show picker immediately
          setNeedsExercisePick(true);
          setShowExercisePicker(true);
        }

        // Load the user's real program info for the replace decision
        try {
          const programsRes = await fetch('/api/programs/current');
          if (programsRes.ok) {
            const programData = await programsRes.json();
            if (programData?.id && programData.id !== data.programId) {
              setRealProgramId(programData.id);
              // Check rest day / already completed
              if (programData.isRestDay) setIsRestDay(true);
              if (programData.completedToday) setAlreadyCompletedToday(true);
              if (programData.nextWorkout?.id) setNextWorkoutId(programData.nextWorkout.id);
            }
          }
        } catch {
          // Non-critical — we just won't show the replace option
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load freestyle workout:', err);
        setError(err instanceof Error ? err.message : 'Failed to load workout');
        setIsLoading(false);
      }
    };

    loadWorkout();
  }, [workoutLogId]);

  // Fetch exercise history when exercises change
  useEffect(() => {
    const fetchHistory = async () => {
      if (exercises.length === 0) return;

      const historyData: Record<string, ExerciseHistory> = {};
      const failed: string[] = [];

      await Promise.all(
        exercises.map(async (exercise) => {
          try {
            const res = await fetch(`/api/exercises/${exercise.id}/history`);
            if (res.ok) {
              historyData[exercise.id] = await res.json();
            } else {
              failed.push(exercise.id);
            }
          } catch {
            failed.push(exercise.id);
          }
        })
      );

      setExerciseHistory(historyData);
      setHistoryLoadFailed(new Set(failed));
    };

    fetchHistory();
  }, [exercises]);

  // Hide rest timer when changing exercises
  useEffect(() => {
    setShowRestTimer(false);
  }, [currentExerciseIndex]);

  const triggerRestTimer = useCallback(() => {
    if (autoStartTimer) {
      setShowRestTimer(true);
      setRestTimerKey(prev => prev + 1);
    }
  }, [autoStartTimer]);

  const handleRestTimerComplete = useCallback(() => {}, []);

  // Add an exercise from the picker
  const handleExerciseSelect = async (selected: { id: string; name: string; category: string; equipment: string[]; targetMuscles: string[] }) => {
    if (!workoutId) return;

    setShowExercisePicker(false);

    try {
      const res = await fetch(`/api/workout/freestyle/${workoutId}/exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseLibraryId: selected.id, sets: 3 }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add exercise');
      }

      const data = await res.json();

      const newExercise: FreestyleExercise = {
        id: data.exercise.id,
        name: data.exercise.name,
        sets: data.exercise.sets,
        restPeriod: data.exercise.restPeriod,
        exerciseLibraryId: data.exercise.exerciseLibraryId,
        sortOrder: data.exercise.sortOrder,
        exerciseLogId: data.exerciseLogId,
        logs: Array(data.exercise.sets).fill(null).map((_, i) => ({
          setNumber: i + 1,
          reps: 0,
          weight: undefined,
          notes: '',
          isCompleted: false,
        })),
      };

      setExercises(prev => [...prev, newExercise]);
      setCurrentExerciseIndex(exercises.length); // Navigate to new exercise
      setNeedsExercisePick(false);
      setSelectedSetIndex(null);
    } catch (err) {
      console.error('Failed to add exercise:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to add exercise');
      // Re-show picker if this was the initial pick
      if (exercises.length === 0) {
        setShowExercisePicker(true);
      }
    }
  };

  // Remove an exercise
  const handleRemoveExercise = async (exerciseIndex: number) => {
    const exercise = exercises[exerciseIndex];
    if (!workoutId) return;

    // Check if any sets are logged
    const hasLoggedSets = exercise.logs.some(l => l.isCompleted);
    if (hasLoggedSets) {
      toast.error('Cannot remove exercise with logged sets');
      return;
    }

    try {
      const res = await fetch(`/api/workout/freestyle/${workoutId}/exercises?exerciseId=${exercise.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to remove exercise');
      }

      setExercises(prev => prev.filter((_, i) => i !== exerciseIndex));
      if (currentExerciseIndex >= exercises.length - 1) {
        setCurrentExerciseIndex(Math.max(0, exercises.length - 2));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove exercise');
    }
  };

  // Add/remove sets for current exercise
  const addSet = () => {
    setExercises(prev => {
      const updated = [...prev];
      const ex = { ...updated[currentExerciseIndex] };
      ex.sets += 1;
      ex.logs = [...ex.logs, {
        setNumber: ex.logs.length + 1,
        reps: 0,
        weight: undefined,
        notes: '',
        isCompleted: false,
      }];
      updated[currentExerciseIndex] = ex;
      return updated;
    });
  };

  const removeSet = () => {
    const exercise = exercises[currentExerciseIndex];
    if (exercise.logs.length <= 1) return;

    const lastLog = exercise.logs[exercise.logs.length - 1];
    if (lastLog.isCompleted) {
      toast.error('Cannot remove a completed set');
      return;
    }

    setExercises(prev => {
      const updated = [...prev];
      const ex = { ...updated[currentExerciseIndex] };
      ex.sets -= 1;
      ex.logs = ex.logs.slice(0, -1);
      updated[currentExerciseIndex] = ex;
      return updated;
    });
  };

  // Log a set (same as existing workout page)
  const updateSet = async (exerciseIndex: number, setIndex: number, logData: Partial<SetLog>) => {
    const exercise = exercises[exerciseIndex];
    if (!exercise.exerciseLogId) return;

    const previousLog = { ...exercise.logs[setIndex] };

    // Optimistic update
    setExercises(prev => {
      const newExercises = [...prev];
      const ex = { ...newExercises[exerciseIndex] };
      ex.logs = [...ex.logs];
      ex.logs[setIndex] = { ...ex.logs[setIndex], ...logData };
      newExercises[exerciseIndex] = ex;
      return newExercises;
    });

    try {
      const response = await fetch(`/api/exercise-logs/${exercise.exerciseLogId}/sets/${setIndex + 1}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      });

      if (!response.ok) {
        throw new Error('Failed to update set');
      }
    } catch (err) {
      console.error('Failed to update set:', err);
      // Rollback
      setExercises(prev => {
        const newExercises = [...prev];
        const ex = { ...newExercises[exerciseIndex] };
        ex.logs = [...ex.logs];
        ex.logs[setIndex] = previousLog;
        newExercises[exerciseIndex] = ex;
        return newExercises;
      });
      setError('Failed to save set. Please try again.');
    }
  };

  // Navigate to next exercise or show picker for new one
  const handleNext = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      // Go to next existing exercise
      setCurrentExerciseIndex(prev => prev + 1);
      setSelectedSetIndex(null);
    } else {
      // At the end — show picker for a new exercise
      setNeedsExercisePick(true);
      setShowExercisePicker(true);
    }
  };

  // Complete the workout
  const completeWorkout = async () => {
    if (exercises.length === 0) return;

    try {
      const response = await fetch(`/api/workout-logs/${workoutLogId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completedAt: workoutDate.toISOString() }),
      });

      if (!response.ok) throw new Error('Failed to complete workout');

      const data = await response.json();

      // Check if we should show the replace decision
      const shouldAskReplace = realProgramId && nextWorkoutId && !isRestDay && !alreadyCompletedToday;

      if (shouldAskReplace) {
        setShowReplaceDecision(true);
        return;
      }

      // Otherwise just show share card
      showCompletionUI(data);
    } catch (err) {
      console.error('Failed to complete workout:', err);
      setError('Failed to complete workout. Please try again.');
    }
  };

  const showCompletionUI = (data: any) => {
    const exercisesCompleted = exercises.filter(ex =>
      ex.logs.every(l => l.isCompleted)
    ).length;

    setShareData({
      workoutLogId: workoutLogId,
      workoutName: generateWorkoutName(),
      exercisesCompleted,
      totalExercises: exercises.length,
      streak: data.streak?.current || 1,
      date: workoutDate,
    });
    setShowShareModal(true);
  };

  // Generate a name from the exercises' muscle groups
  const generateWorkoutName = () => {
    if (exercises.length === 0) return 'F*ck It Workout';
    const names = exercises.map(e => e.name);
    if (names.length <= 2) return `F*ck It — ${names.join(', ')}`;
    return `F*ck It — ${names.slice(0, 2).join(', ')} +${names.length - 2} more`;
  };

  // Handle replace decision
  const handleReplace = async (replaceScheduled: boolean) => {
    setShowReplaceDecision(false);

    if (replaceScheduled && nextWorkoutId) {
      try {
        await fetch('/api/workout-logs/quick-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workoutId: nextWorkoutId,
            date: workoutDate.toISOString(),
          }),
        });
      } catch (err) {
        console.error('Failed to create replacement log:', err);
        // Non-critical — freestyle workout is already completed
      }
    }

    // Re-fetch to get streak/milestone data and show completion
    try {
      const res = await fetch(`/api/workout-logs/${workoutLogId}`);
      if (res.ok) {
        const data = await res.json();
        showCompletionUI(data);
      } else {
        router.push('/dashboard');
      }
    } catch {
      router.push('/dashboard');
    }
  };

  const handleShareClose = () => {
    setShowShareModal(false);
    router.push('/dashboard');
  };

  // Progress calculations
  const totalSets = exercises.reduce((acc, ex) => acc + ex.logs.length, 0);
  const completedSets = exercises.reduce((acc, ex) => acc + ex.logs.filter(l => l.isCompleted).length, 0);
  const progressPercent = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-[#F1F5F9] border-t-[#FF6B6B] rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (error && exercises.length === 0 && !showExercisePicker) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4 p-8 bg-white rounded-2xl border border-red-200 shadow-lg max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0F172A] mb-2">Unable to Load Workout</h2>
              <p className="text-[#475569] mb-4">{error}</p>
              <button onClick={() => window.location.reload()} className="px-6 py-2.5 rounded-xl bg-[#FF6B6B] text-white font-medium hover:bg-[#EF5350] transition-colors">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Replace decision modal
  if (showReplaceDecision) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="max-w-md mx-auto bg-white rounded-2xl border border-[#E2E8F0] shadow-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-[#FFE5E5] rounded-full flex items-center justify-center mb-4">
              <Dumbbell className="w-8 h-8 text-[#FF6B6B]" />
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] mb-2">Nice work!</h2>
            <p className="text-[#475569] mb-6">Did this replace your scheduled workout?</p>
            <div className="space-y-3">
              <button
                onClick={() => handleReplace(true)}
                className="w-full py-3 rounded-xl bg-[#FF6B6B] text-white font-semibold hover:bg-[#EF5350] transition-colors"
              >
                Yes, count it as today&apos;s workout
              </button>
              <button
                onClick={() => handleReplace(false)}
                className="w-full py-3 rounded-xl border border-[#E2E8F0] text-[#475569] font-medium hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition-colors"
              >
                No, this was extra credit
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Share modal
  if (showShareModal && shareData) {
    return <WorkoutShareCard data={shareData} onClose={handleShareClose} />;
  }

  const currentExercise = exercises[currentExerciseIndex];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Error Toast */}
        {error && exercises.length > 0 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF6B6B]/10 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-[#FF6B6B]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-[#94A3B8] font-medium">F*ck It Workout</p>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFE5E5] text-[#FF6B6B] text-xs font-medium">Off-Script</span>
                </div>
                {exercises.length > 0 ? (
                  <p className="text-lg font-semibold text-[#0F172A]">{completedSets} of {totalSets} sets complete</p>
                ) : (
                  <p className="text-lg font-semibold text-[#0F172A]">Pick your first exercise</p>
                )}
              </div>
            </div>
            {exercises.length > 0 && (
              <span className="text-2xl font-bold text-[#FF6B6B]">{Math.round(progressPercent)}%</span>
            )}
          </div>
          {exercises.length > 0 && (
            <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#EF5350] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          {/* Date Picker */}
          <div className="mt-4 flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                  !isSameDay(workoutDate, today)
                    ? 'bg-[#FFE5E5] border-[#FF6B6B] text-[#FF6B6B]'
                    : 'bg-white border-[#E2E8F0] text-[#475569] hover:border-[#FF6B6B]/50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">{formatDateForDisplay(workoutDate)}</span>
              </button>
              {showDatePicker && (
                <CalendarPicker
                  selectedDate={workoutDate}
                  onDateSelect={(date) => setWorkoutDate(date)}
                  maxDate={today}
                  onClose={() => setShowDatePicker(false)}
                />
              )}
            </div>
            {!isSameDay(workoutDate, today) && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FFE5E5] text-[#FF6B6B]">
                <span className="text-sm font-medium">Logging for {formatDateForDisplay(workoutDate)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Exercise Card — shows current exercise or "pick exercise" state */}
        <div className="bg-white rounded-2xl border-l-4 border-l-[#FF6B6B] border border-[#E2E8F0] shadow-md">
          {currentExercise && !needsExercisePick ? (
            <>
              {/* Exercise Header */}
              <div className="bg-[#F8FAFC] px-6 py-5 border-b border-[#E2E8F0] sticky top-0 z-[51]">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-['Space_Mono'] text-xs uppercase tracking-wider text-[#64748B]">
                    Exercise {currentExerciseIndex + 1} of {exercises.length}
                  </span>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Remove exercise (only if no sets logged) */}
                    {!currentExercise.logs.some(l => l.isCompleted) && (
                      <button
                        onClick={() => handleRemoveExercise(currentExerciseIndex)}
                        className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-white text-[#475569] border border-[#E2E8F0] hover:border-red-300 hover:text-red-500 transition-colors"
                        title="Remove exercise"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm font-medium hidden sm:inline">Remove</span>
                      </button>
                    )}
                    <a
                      href={`https://www.youtube.com/results?search_query=${currentExercise.name} how to`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-[#FF6B6B] text-white hover:bg-[#EF5350] transition-colors"
                      title="Watch form video"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span className="text-sm font-medium hidden sm:inline">Form</span>
                    </a>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-[#0F172A]">{currentExercise.name}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F172A] border border-[#0F172A]">
                      <span className="text-sm font-medium text-white">
                        {currentExercise.sets} sets
                      </span>
                    </div>
                    {/* Set count controls */}
                    <button
                      onClick={removeSet}
                      disabled={currentExercise.logs.length <= 1}
                      className="w-7 h-7 rounded-full border border-[#E2E8F0] text-[#475569] hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition-colors flex items-center justify-center disabled:opacity-30"
                      title="Remove set"
                    >
                      <span className="text-sm font-bold">-</span>
                    </button>
                    <button
                      onClick={addSet}
                      className="w-7 h-7 rounded-full border border-[#E2E8F0] text-[#475569] hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition-colors flex items-center justify-center"
                      title="Add set"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sets Section */}
              <div className="p-6 space-y-4">
                <SetProgressGrid
                  logs={currentExercise.logs.map(log => ({
                    setNumber: log.setNumber,
                    weight: log.weight ?? 0,
                    reps: log.reps,
                    isCompleted: log.isCompleted ?? false,
                  }))}
                  activeIndex={currentExercise.logs.findIndex(l => !l.isCompleted)}
                  selectedIndex={selectedSetIndex}
                  onSelect={setSelectedSetIndex}
                />

                <WorkoutProgressBar
                  completedCount={currentExercise.logs.filter(l => l.isCompleted).length}
                  totalCount={currentExercise.logs.length}
                />

                {(() => {
                  const activeIndex = currentExercise.logs.findIndex(l => !l.isCompleted);
                  const currentSetIndex = selectedSetIndex !== null ? selectedSetIndex : activeIndex;
                  const currentLog = currentExercise.logs[currentSetIndex >= 0 ? currentSetIndex : 0];
                  const previousLog = currentSetIndex > 0 ? currentExercise.logs[currentSetIndex - 1] : null;

                  if (activeIndex === -1 && selectedSetIndex === null) {
                    return (
                      <div className="bg-green-50 rounded-2xl p-5 border-2 border-green-200 text-center">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <p className="text-lg font-semibold text-green-700">All sets complete!</p>
                        <p className="text-sm text-green-600">Great work on this exercise.</p>
                      </div>
                    );
                  }

                  const isEditingCompletedSet = currentLog.isCompleted;

                  return (
                    <BigSetInputCard
                      setNumber={currentLog.setNumber}
                      targetReps="0"
                      weight={currentLog.weight ?? previousLog?.weight ?? ''}
                      reps={currentLog.reps > 0 ? currentLog.reps : (previousLog?.reps ?? '')}
                      notes={currentLog.notes}
                      isEditing={isEditingCompletedSet}
                      history={exerciseHistory[currentExercise.id]}
                      historyLoadFailed={historyLoadFailed.has(currentExercise.id)}
                      onComplete={(weight, reps, notes) => {
                        const setIndex = currentSetIndex >= 0 ? currentSetIndex : 0;
                        updateSet(currentExerciseIndex, setIndex, {
                          weight,
                          reps,
                          notes,
                          isCompleted: true,
                        });
                        if (!isEditingCompletedSet) {
                          triggerRestTimer();
                        }
                        setSelectedSetIndex(null);
                      }}
                    />
                  );
                })()}

                {/* Rest Timer */}
                {showRestTimer && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <RestPeriodIndicator
                      key={restTimerKey}
                      restPeriod={currentExercise.restPeriod}
                      isActive={true}
                      autoStart={true}
                      onTimerComplete={handleRestTimerComplete}
                    />
                  </div>
                )}

                <RestTimerControl
                  restDuration={formatRestDuration(currentExercise.restPeriod)}
                  autoStart={autoStartTimer}
                  onAutoStartChange={(checked) => {
                    setAutoStartTimer(checked);
                    if (!checked) setShowRestTimer(false);
                  }}
                />
              </div>
            </>
          ) : (
            /* Exercise Picker State — shown in the same card area */
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-[#FFE5E5] rounded-full flex items-center justify-center mb-4">
                <Dumbbell className="w-8 h-8 text-[#FF6B6B]" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-2">
                {exercises.length === 0 ? 'What are you hitting?' : 'What\'s next?'}
              </h3>
              <p className="text-[#475569] mb-6">
                {exercises.length === 0
                  ? 'Search for your first exercise to get started.'
                  : 'Pick your next exercise, or finish up.'}
              </p>
              <button
                onClick={() => setShowExercisePicker(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF6B6B] text-white font-semibold hover:bg-[#EF5350] transition-colors shadow-lg shadow-[#FF6B6B]/25"
              >
                <Plus className="w-5 h-5" />
                Search Exercises
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center px-6 py-4 border-t border-[#F1F5F9] bg-[#F8FAFC]">
            <button
              onClick={() => {
                if (needsExercisePick && exercises.length > 0) {
                  // Go back to last exercise from picker state
                  setNeedsExercisePick(false);
                  setCurrentExerciseIndex(exercises.length - 1);
                  setSelectedSetIndex(null);
                } else {
                  setCurrentExerciseIndex(prev => prev - 1);
                  setSelectedSetIndex(null);
                }
              }}
              disabled={currentExerciseIndex === 0 && !needsExercisePick}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                currentExerciseIndex === 0 && !needsExercisePick
                  ? 'bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed'
                  : 'bg-white border border-[#F1F5F9] text-[#475569] hover:border-[#0F172A] hover:text-[#0F172A]'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {needsExercisePick ? (
              // When in picker state and exercises exist, show "Finish" option
              exercises.length > 0 ? (
                <button
                  onClick={completeWorkout}
                  className="px-6 py-2.5 rounded-xl bg-[#FF6B6B] text-white font-medium hover:bg-[#EF5350] transition-colors shadow-lg shadow-[#FF6B6B]/25"
                >
                  Complete Workout
                </button>
              ) : null
            ) : currentExercise ? (
              (() => {
                const isLastExercise = currentExerciseIndex === exercises.length - 1;
                const allSetsComplete = currentExercise.logs.every(l => l.isCompleted);

                if (isLastExercise && allSetsComplete) {
                  // Last exercise, all sets done — show Complete + Add More
                  return (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#F1F5F9] text-[#475569] font-medium hover:border-[#0F172A] hover:text-[#0F172A] transition-all duration-200"
                      >
                        <Plus className="w-4 h-4" />
                        New Exercise
                      </button>
                      <button
                        onClick={completeWorkout}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF6B6B] text-white font-medium hover:bg-[#EF5350] transition-colors shadow-lg shadow-[#FF6B6B]/25"
                      >
                        Complete Workout
                      </button>
                    </div>
                  );
                }

                return (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B6B] text-white font-medium hover:bg-[#EF5350] transition-colors shadow-lg shadow-[#FF6B6B]/25"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                );
              })()
            ) : null}
          </div>
        </div>

        {/* Exercise Quick Nav */}
        {exercises.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {exercises.map((ex, idx) => {
              const isComplete = ex.logs.every(l => l.isCompleted);
              const isCurrent = idx === currentExerciseIndex && !needsExercisePick;
              return (
                <button
                  key={ex.id}
                  onClick={() => {
                    setCurrentExerciseIndex(idx);
                    setNeedsExercisePick(false);
                    setSelectedSetIndex(null);
                  }}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                    isComplete
                      ? 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                      : isCurrent
                        ? 'bg-[#FF6B6B] text-white shadow-md shadow-[#FF6B6B]/25'
                        : 'bg-white border border-[#E2E8F0] text-[#475569] hover:border-[#FF6B6B]/50'
                  }`}
                >
                  {isComplete ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                </button>
              );
            })}
            {/* "+" button to add another exercise */}
            <button
              onClick={() => {
                setNeedsExercisePick(true);
                setShowExercisePicker(true);
              }}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium bg-white border border-dashed border-[#E2E8F0] text-[#94A3B8] hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Exercise Search Modal */}
      <ExerciseSearchModal
        isOpen={showExercisePicker}
        onClose={() => {
          setShowExercisePicker(false);
          // If they had no exercises and close the modal, go back
          if (exercises.length === 0) {
            router.back();
          } else {
            // Go back to last exercise
            setNeedsExercisePick(false);
            setCurrentExerciseIndex(exercises.length - 1);
          }
        }}
        onSelect={handleExerciseSelect}
      />
    </MainLayout>
  );
}
