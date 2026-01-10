'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, PlayCircle, ChevronLeft, ChevronRight, Dumbbell, MessageCircle, Calendar } from 'lucide-react';
import MainLayout from '@/app/components/layouts/MainLayout';
import { formatExerciseMeasure } from '@/utils/formatters';
import ExerciseSwapModal from '@/components/ExerciseSwapModal';
import WorkoutChatPanel from '@/components/WorkoutChatPanel';
import { clearWelcomeData } from '@/components/ClaimWelcomeBanner';
import { SetProgressGrid } from '@/components/workout/SetProgressGrid';
import { BigSetInputCard } from '@/components/workout/BigSetInputCard';
import { RestTimerControl } from '@/components/workout/RestTimerControl';
import { WorkoutProgressBar } from '@/components/workout/WorkoutProgressBar';

// Helper to format date for display
function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

// Helper to format date for input value (YYYY-MM-DD)
function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Check if two dates are the same day
function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

// Helper to format rest duration in "M:SS" format
function formatRestDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restPeriod: number;
  measureType?: string;
  measure?: {
    unit: string;
    type: string;
  };
  videoUrl?: string;
  instructions?: string[];
}

interface SetLog {
  setNumber: number;
  weight?: number;
  reps: number;
  notes?: string;
  isCompleted?: boolean;
}

interface ExerciseWithLogs extends Exercise {
  logs: SetLog[];
  notes?: string;
  exerciseLogId?: string;
}

export default function WorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exercises, setExercises] = useState<ExerciseWithLogs[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutLog, setWorkoutLog] = useState<any>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  // Store chat messages per exercise for persistence
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  // New UI state for the redesigned workout tracker
  const [selectedSetIndex, setSelectedSetIndex] = useState<number | null>(null);
  const [autoStartTimer, setAutoStartTimer] = useState(true);
  // Date picker state for backdating workouts
  const [workoutDate, setWorkoutDate] = useState<Date>(() => new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const today = new Date();

  const findFirstIncompletePosition = (exercises: ExerciseWithLogs[]) => {
    for (let i = 0; i < exercises.length; i++) {
      const exercise = exercises[i];
      const hasIncompleteSets = exercise.logs.some(log => !log.isCompleted);
      if (hasIncompleteSets) {
        return i;
      }
    }
    return exercises.length - 1;
  };

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const response = await fetch(`/api/workouts/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch workout');
        }
        const data = await response.json();

        if (!data.workoutLogs?.[0]) {
          const startWorkoutResponse = await fetch('/api/workout-logs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              workoutId: params.id,
            }),
          });

          if (!startWorkoutResponse.ok) {
            throw new Error('Failed to start workout');
          }

          const startWorkoutData = await startWorkoutResponse.json();
          setWorkoutLog(startWorkoutData);
          setWorkoutStarted(true);
          clearWelcomeData(); // Clear claim welcome banner on first workout

          const exercisesWithLogs = data.exercises.map((exercise: Exercise) => {
            const exerciseLog = startWorkoutData.exerciseLogs.find(
              (log: any) => log.exerciseId === exercise.id
            );
            return {
              ...exercise,
              exerciseLogId: exerciseLog?.id,
              logs: Array(exercise.sets).fill(null).map((_, i) => ({
                setNumber: i + 1,
                reps: exercise.reps,
                weight: undefined,
                notes: '',
              })),
            };
          });

          setExercises(exercisesWithLogs);
        } else {
          setWorkoutStarted(true);
          clearWelcomeData(); // Clear claim welcome banner on workout resume
          setWorkoutLog(data.workoutLogs[0]);

          const exercisesWithLogs = data.exercises.map((exercise: Exercise) => {
            const existingLogs = data.workoutLogs[0].exerciseLogs.find(
              (log: any) => log.exerciseId === exercise.id
            );

            return {
              ...exercise,
              exerciseLogId: existingLogs?.id,
              logs: Array(exercise.sets).fill(null).map((_, i) => {
                const existingSet = existingLogs?.setLogs?.find(
                  (set: any) => set.setNumber === i + 1
                );
                return existingSet ? {
                  setNumber: existingSet.setNumber,
                  reps: existingSet.reps,
                  weight: existingSet.weight,
                  notes: existingSet.notes || '',
                  isCompleted: !!existingSet.completedAt,
                } : {
                  setNumber: i + 1,
                  reps: exercise.reps,
                  weight: undefined,
                  notes: '',
                  isCompleted: false,
                };
              }),
            };
          });

          setExercises(exercisesWithLogs);
          setCurrentExerciseIndex(findFirstIncompletePosition(exercisesWithLogs));
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch workout:', error);
        setError(error instanceof Error ? error.message : 'Failed to load workout');
        setIsLoading(false);
      }
    };

    fetchWorkout();
  }, [params.id]);

  const updateSet = async (exerciseIndex: number, setIndex: number, logData: Partial<SetLog>) => {
    const exercise = exercises[exerciseIndex];

    if (!exercise.exerciseLogId) {
      console.error('No exercise log ID found for exercise:', exercise);
      return;
    }

    // Capture previous state for rollback
    const previousLog = { ...exercise.logs[setIndex] };

    // Optimistic update
    setExercises(prev => {
      const newExercises = [...prev];
      const ex = newExercises[exerciseIndex];
      ex.logs[setIndex] = {
        ...ex.logs[setIndex],
        ...logData,
      };
      return newExercises;
    });

    try {
      const response = await fetch(`/api/exercise-logs/${exercise.exerciseLogId}/sets/${setIndex + 1}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText || 'Failed to update set');
      }

      const allSetsCompleted = exercises[exerciseIndex].logs.every((log, i) =>
        i === setIndex ? logData.isCompleted : log.isCompleted
      );

      if (allSetsCompleted && currentExerciseIndex < exercises.length - 1) {
        console.log('All sets completed, moving to next exercise');
      }

    } catch (error) {
      console.error('Failed to update set:', error);
      // Rollback to previous state
      setExercises(prev => {
        const newExercises = [...prev];
        const ex = newExercises[exerciseIndex];
        ex.logs[setIndex] = previousLog;
        return newExercises;
      });
      setError('Failed to save set. Please try again.');
    }
  };

  const completeWorkout = async () => {
    try {
      const response = await fetch(`/api/workout-logs/${workoutLog.id}/complete`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to complete workout');
      }

      setShowCompletion(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2500);
    } catch (error) {
      console.error('Failed to complete workout:', error);
      setError('Failed to complete workout. Please try again.');
    }
  };

  // Calculate progress
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

  if (error && !exercises.length) {
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
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 rounded-xl bg-[#FF6B6B] text-white font-medium hover:bg-[#EF5350] transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (showCompletion) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-6 p-8 bg-white rounded-2xl border border-[#F1F5F9] shadow-lg max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Workout Complete!</h2>
              <p className="text-[#475569]">Great job! Redirecting to dashboard...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const currentExercise = exercises[currentExerciseIndex];

  // Helper to get/set messages for current exercise
  const currentMessages = currentExercise ? (chatMessages[currentExercise.id] || []) : [];
  const setCurrentMessages = (messages: ChatMessage[]) => {
    if (currentExercise) {
      setChatMessages(prev => ({ ...prev, [currentExercise.id]: messages }));
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Toast */}
        {error && exercises.length > 0 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 p-1"
              aria-label="Dismiss error"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex gap-6">
          {/* Main Content */}
          <div className={`flex-1 ${chatOpen ? 'lg:max-w-3xl' : 'max-w-4xl mx-auto'}`}>
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF6B6B]/10 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-[#FF6B6B]" />
              </div>
              <div>
                <p className="text-sm text-[#94A3B8] font-medium">Workout in Progress</p>
                <p className="text-lg font-semibold text-[#0F172A]">{completedSets} of {totalSets} sets complete</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-[#FF6B6B]">{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#EF5350] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Date Picker for Backdating */}
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
                <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-[#E2E8F0] p-3">
                  <input
                    type="date"
                    value={formatDateForInput(workoutDate)}
                    max={formatDateForInput(today)}
                    onChange={(e) => {
                      const newDate = new Date(e.target.value + 'T12:00:00');
                      setWorkoutDate(newDate);
                      setShowDatePicker(false);
                    }}
                    className="px-3 py-2 rounded-lg border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/50 focus:border-[#FF6B6B]"
                    style={{ colorScheme: 'light' }}
                  />
                </div>
              )}
            </div>

            {/* "Logging for [date]" indicator when not today */}
            {!isSameDay(workoutDate, today) && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FFE5E5] text-[#FF6B6B]">
                <span className="text-sm font-medium">
                  Logging for {formatDateForDisplay(workoutDate)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Exercise Card */}
        <div className="bg-white rounded-2xl border-l-4 border-l-[#FF6B6B] border border-[#E2E8F0] shadow-md overflow-hidden">
          {/* Exercise Header */}
          <div className="bg-[#F8FAFC] px-6 py-5 border-b border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-3">
              <span className="font-['Space_Mono'] text-xs uppercase tracking-wider text-[#64748B]">
                Exercise {currentExerciseIndex + 1} of {exercises.length}
              </span>
              {currentExercise && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSwapModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white text-[#475569] border border-[#E2E8F0] hover:border-[#FF6B6B]/50 hover:text-[#FF6B6B] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span className="text-sm font-medium">Swap</span>
                  </button>
                  <button
                    onClick={() => setChatOpen(!chatOpen)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                      chatOpen
                        ? 'bg-[#FF6B6B] text-white border-[#FF6B6B]'
                        : 'bg-white text-[#475569] border-[#E2E8F0] hover:border-[#FF6B6B]/50 hover:text-[#FF6B6B]'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Ask</span>
                    {currentMessages.length > 0 && !chatOpen && (
                      <span className="w-4 h-4 bg-[#FF6B6B] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {currentMessages.length}
                      </span>
                    )}
                  </button>
                  <a
                    href={`https://www.youtube.com/results?search_query=${currentExercise.name} how to`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF6B6B] text-white hover:bg-[#EF5350] transition-colors"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Form</span>
                  </a>
                </div>
              )}
            </div>

            {currentExercise && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-[#0F172A]">
                    {currentExercise.name}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F172A] border border-[#0F172A]">
                    <span className="text-sm font-medium text-white">
                      {currentExercise.sets} sets × {formatExerciseMeasure(currentExercise)}
                    </span>
                  </div>
                </div>
                {currentExercise.instructions && currentExercise.instructions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {currentExercise.instructions.map((instruction, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#475569]"
                      >
                        <span className="w-4 h-4 flex items-center justify-center rounded-full bg-[#FF6B6B]/10 text-[#FF6B6B] text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        {instruction}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sets Section - New redesigned UI */}
          {currentExercise && (
            <div className="p-6 space-y-4">
              {/* Set Progress Grid */}
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

              {/* Progress Bar */}
              <WorkoutProgressBar
                completedCount={currentExercise.logs.filter(l => l.isCompleted).length}
                totalCount={currentExercise.logs.length}
              />

              {/* Big Set Input Card */}
              {(() => {
                const activeIndex = currentExercise.logs.findIndex(l => !l.isCompleted);
                const currentSetIndex = selectedSetIndex !== null ? selectedSetIndex : activeIndex;
                const currentLog = currentExercise.logs[currentSetIndex >= 0 ? currentSetIndex : 0];
                const previousLog = currentSetIndex > 0 ? currentExercise.logs[currentSetIndex - 1] : null;

                // If all sets are completed, don't show input card
                if (activeIndex === -1 && selectedSetIndex === null) {
                  return (
                    <div className="bg-green-50 rounded-2xl p-5 border-2 border-green-200 text-center">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-lg font-semibold text-green-700">All sets complete!</p>
                      <p className="text-sm text-green-600">Great work on this exercise.</p>
                    </div>
                  );
                }

                return (
                  <BigSetInputCard
                    setNumber={currentLog.setNumber}
                    targetReps={String(currentExercise.reps)}
                    weight={currentLog.weight ?? previousLog?.weight ?? ''}
                    reps={currentLog.reps > 0 ? currentLog.reps : ''}
                    onWeightChange={(value) => {
                      updateSet(currentExerciseIndex, currentSetIndex, { weight: value });
                    }}
                    onRepsChange={(value) => {
                      updateSet(currentExerciseIndex, currentSetIndex, { reps: value });
                    }}
                    onComplete={() => {
                      const setIndex = currentSetIndex >= 0 ? currentSetIndex : 0;
                      const log = currentExercise.logs[setIndex];
                      updateSet(currentExerciseIndex, setIndex, {
                        weight: log.weight,
                        reps: log.reps,
                        isCompleted: true,
                      });
                      // Clear selection to auto-advance to next incomplete set
                      setSelectedSetIndex(null);
                    }}
                  />
                );
              })()}

              {/* Rest Timer Control */}
              <RestTimerControl
                restDuration={formatRestDuration(currentExercise.restPeriod)}
                autoStart={autoStartTimer}
                onAutoStartChange={setAutoStartTimer}
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center px-6 py-4 border-t border-[#F1F5F9] bg-[#F8FAFC]">
            <button
              onClick={() => {
                setCurrentExerciseIndex(prev => prev - 1);
                setSelectedSetIndex(null);
              }}
              disabled={currentExerciseIndex === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                currentExerciseIndex === 0
                  ? 'bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed'
                  : 'bg-white border border-[#F1F5F9] text-[#475569] hover:border-[#0F172A] hover:text-[#0F172A]'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {currentExerciseIndex < exercises.length - 1 ? (
              <button
                onClick={() => {
                  setCurrentExerciseIndex(prev => prev + 1);
                  setSelectedSetIndex(null);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B6B] text-white font-medium hover:bg-[#EF5350] transition-colors shadow-lg shadow-[#FF6B6B]/25"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={completeWorkout}
                className="px-6 py-2.5 rounded-xl bg-[#FF6B6B] text-white font-medium hover:bg-[#EF5350] transition-colors shadow-lg shadow-[#FF6B6B]/25"
              >
                Complete Workout
              </button>
            )}
          </div>
        </div>

        {/* Exercise Quick Nav */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {exercises.map((ex, idx) => {
            const isComplete = ex.logs.every(l => l.isCompleted);
            const isCurrent = idx === currentExerciseIndex;
            return (
              <button
                key={ex.id}
                onClick={() => {
                  setCurrentExerciseIndex(idx);
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
        </div>
          </div>

          {/* Chat Panel - Desktop right side */}
          {currentExercise && (
            <div className={`hidden lg:block transition-all duration-300 ${chatOpen ? 'w-80' : 'w-0'}`}>
              {chatOpen && (
                <div className="sticky top-24 h-[calc(100vh-8rem)]">
                  <WorkoutChatPanel
                    exerciseName={currentExercise.name}
                    currentSet={currentExercise.logs.findIndex(l => !l.isCompleted) + 1 || currentExercise.sets}
                    totalSets={currentExercise.sets}
                    userEquipment="standard gym equipment"
                    experienceLevel="intermediate"
                    isOpen={chatOpen}
                    onClose={() => setChatOpen(false)}
                    messages={currentMessages}
                    onMessagesChange={setCurrentMessages}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {currentExercise && (
        <ExerciseSwapModal
          isOpen={swapModalOpen}
          onClose={() => setSwapModalOpen(false)}
          exerciseId={currentExercise.id}
          exerciseName={currentExercise.name}
          onSwap={(newExercise) => {
            setExercises(prev => prev.map((ex, idx) =>
              idx === currentExerciseIndex
                ? { ...ex, name: newExercise.name }
                : ex
            ));
          }}
        />
      )}
    </MainLayout>
  );
}
