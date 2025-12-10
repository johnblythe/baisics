'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, Pencil, Circle, PlayCircle, ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react';
import MainLayout from '@/app/components/layouts/MainLayout';
import { formatExerciseMeasure, formatExerciseUnit } from '@/utils/formatters';
import RestPeriodIndicator from '@/app/components/RestPeriodIndicator';
import ExerciseSwapModal from '@/components/ExerciseSwapModal';

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

const SetInput = ({
  log,
  exercise,
  onComplete,
  onUpdate,
  isActive,
  previousSetWeight,
  isLastSetOfWorkout
}: {
  log: SetLog;
  exercise: Exercise;
  onComplete: (data: Partial<SetLog>) => void;
  onUpdate: (data: Partial<SetLog>) => void;
  isActive?: boolean;
  previousSetWeight?: number;
  isLastSetOfWorkout?: boolean;
}) => {
  const [localWeight, setLocalWeight] = useState(
    log.weight?.toString() || previousSetWeight?.toString() || ''
  );
  const [localReps, setLocalReps] = useState(log.reps?.toString() || '');
  const [localNotes, setLocalNotes] = useState(log.notes || '');

  useEffect(() => {
    setLocalWeight(log.weight?.toString() || previousSetWeight?.toString() || '');
    setLocalReps(log.reps?.toString() || '');
    setLocalNotes(log.notes || '');
  }, [log, previousSetWeight]);

  const canComplete = localWeight && localReps;

  return (
    <div className="space-y-2">
      <div
        className={`relative p-4 rounded-xl transition-all duration-300 group
          ${log.isCompleted
            ? 'bg-green-50 border-2 border-green-200'
            : isActive
              ? 'bg-white border-2 border-[#FF6B6B]/30 shadow-lg shadow-[#FF6B6B]/10'
              : 'bg-white border border-[#F1F5F9]'
          }
        `}
      >
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-4">
            <div className="w-6">
              {log.isCompleted ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Circle className={`w-3 h-3 ${isActive ? 'text-[#FF6B6B] fill-[#FF6B6B]/20' : 'text-[#94A3B8] fill-[#94A3B8]/20'}`} />
              )}
            </div>

            <span className={`font-medium ${isActive ? 'text-[#FF6B6B]' : 'text-[#475569]'}`}>
              Set {log.setNumber}
            </span>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pl-10 sm:pl-0">
            <div className="relative group/input">
              <input
                type="number"
                placeholder="Weight"
                value={localWeight}
                onChange={(e) => setLocalWeight(e.target.value)}
                disabled={log.isCompleted || !isActive}
                className={`w-full sm:w-24 px-3 py-2 rounded-lg text-sm transition-all duration-200
                  ${log.isCompleted
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : isActive
                      ? 'bg-white border border-[#F1F5F9] focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20'
                      : 'bg-[#F8FAFC] border border-[#F1F5F9]'
                  }
                  disabled:opacity-60 disabled:cursor-not-allowed text-[#0F172A]
                `}
              />
              <div className="absolute -top-2 left-2 px-1 text-xs font-medium text-[#94A3B8] bg-white">
                Weight
              </div>
            </div>

            <div className="relative group/input">
              <input
                type="number"
                placeholder={formatExerciseUnit(exercise, 'long', 'mixed')}
                value={Number(localReps) > 0 ? localReps : ''}
                onChange={(e) => setLocalReps(e.target.value)}
                disabled={log.isCompleted || !isActive}
                className={`w-full sm:w-24 px-3 py-2 rounded-lg text-sm transition-all duration-200
                  ${log.isCompleted
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : isActive
                      ? 'bg-white border border-[#F1F5F9] focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20'
                      : 'bg-[#F8FAFC] border border-[#F1F5F9]'
                  }
                  disabled:opacity-60 disabled:cursor-not-allowed text-[#0F172A]
                `}
              />
              <div className="absolute -top-2 left-2 px-1 text-xs font-medium text-[#94A3B8] bg-white">
                {formatExerciseUnit(exercise, 'long', 'mixed')}
              </div>
            </div>

            <div className="relative group/input flex-1">
              <input
                type="text"
                placeholder="Add notes..."
                value={localNotes}
                onChange={(e) => setLocalNotes(e.target.value)}
                disabled={log.isCompleted || !isActive}
                className={`w-full px-3 py-2 rounded-lg text-sm transition-all duration-200
                  ${log.isCompleted
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : isActive
                      ? 'bg-white border border-[#F1F5F9] focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20'
                      : 'bg-[#F8FAFC] border border-[#F1F5F9]'
                  }
                  disabled:opacity-60 disabled:cursor-not-allowed text-[#0F172A] placeholder-[#94A3B8]
                `}
              />
              <div className="absolute -top-2 left-2 px-1 text-xs font-medium text-[#94A3B8] bg-white">
                Notes
              </div>
            </div>
          </div>

          {log.isCompleted ? (
            <button
              onClick={() => onUpdate({
                weight: Number(localWeight),
                reps: Number(localReps),
                notes: localNotes,
                isCompleted: false
              })}
              className="opacity-0 group-hover:opacity-100 text-[#FF6B6B] hover:text-[#EF5350] transition-all duration-200"
            >
              <Pencil className="w-5 h-5" />
            </button>
          ) : (
            isActive && canComplete && (
              <button
                onClick={() => onComplete({
                  weight: Number(localWeight),
                  reps: Number(localReps),
                  notes: localNotes,
                  isCompleted: true
                })}
                className="px-4 py-2 rounded-lg bg-[#FF6B6B] text-white text-sm font-medium hover:bg-[#EF5350] transition-colors shadow-lg shadow-[#FF6B6B]/25"
              >
                Complete Set
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default function WorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exercises, setExercises] = useState<ExerciseWithLogs[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutLog, setWorkoutLog] = useState<any>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [swapModalOpen, setSwapModalOpen] = useState(false);

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
          setWorkoutLog(data.workoutLogs[0]);

          const exercisesWithLogs = data.exercises.map((exercise: Exercise) => {
            const existingLogs = data.workoutLogs[0].exerciseLogs.find(
              (log: any) => log.exerciseId === exercise.id
            );

            return {
              ...exercise,
              exerciseLogId: existingLogs.id,
              logs: Array(exercise.sets).fill(null).map((_, i) => {
                const existingSet = existingLogs.setLogs.find(
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

    setExercises(prev => {
      const newExercises = [...prev];
      const exercise = newExercises[exerciseIndex];
      exercise.logs[setIndex] = {
        ...exercise.logs[setIndex],
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
      setExercises(prev => {
        const newExercises = [...prev];
        const exercise = newExercises[exerciseIndex];
        exercise.logs[setIndex] = {
          ...exercise.logs[setIndex],
          ...logData,
        };
        return newExercises;
      });
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

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
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
            )}
          </div>

          {/* Sets Section */}
          <div className="p-6 space-y-4">
            {currentExercise?.logs.map((log, setIndex) => {
              const previousSet = setIndex > 0 ? currentExercise.logs[setIndex - 1] : null;
              const isLastSetOfWorkout = currentExerciseIndex === exercises.length - 1 &&
                setIndex === currentExercise.logs.length - 1;

              return (
                <React.Fragment key={setIndex}>
                  <SetInput
                    log={log}
                    exercise={currentExercise}
                    previousSetWeight={previousSet?.weight}
                    isLastSetOfWorkout={isLastSetOfWorkout}
                    isActive={!log.isCompleted && setIndex === currentExercise.logs.findIndex(l => !l.isCompleted)}
                    onComplete={(data) => updateSet(currentExerciseIndex, setIndex, data)}
                    onUpdate={(data) => updateSet(currentExerciseIndex, setIndex, data)}
                  />
                  {setIndex < currentExercise.logs.length - 1 && (
                    <RestPeriodIndicator
                      restPeriod={currentExercise.restPeriod}
                      isCompleted={log.isCompleted}
                      isActive={log.isCompleted && !currentExercise.logs[setIndex + 1].isCompleted}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center px-6 py-4 border-t border-[#F1F5F9] bg-[#F8FAFC]">
            <button
              onClick={() => setCurrentExerciseIndex(prev => prev - 1)}
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
                onClick={() => setCurrentExerciseIndex(prev => prev + 1)}
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
                onClick={() => setCurrentExerciseIndex(idx)}
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
