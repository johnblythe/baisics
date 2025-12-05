'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, Pencil, Circle, PlayCircle } from 'lucide-react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TawkChat from "@/components/TawkChat";
import { formatExerciseMeasure, formatExerciseUnit } from '@/utils/formatters';
// import { ExerciseMeasureType } from '@prisma/client';
import RestPeriodIndicator from '@/app/components/RestPeriodIndicator';

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
  
  // Update local state when log prop changes
  useEffect(() => {
    setLocalWeight(log.weight?.toString() || previousSetWeight?.toString() || '');
    setLocalReps(log.reps?.toString() || '');
    setLocalNotes(log.notes || '');
  }, [log, previousSetWeight]);
  
  const canComplete = localWeight && localReps;

  return (
    <div className="space-y-2">
      <div 
        className={`relative p-4 rounded-2xl transition-all duration-300 group
          ${log.isCompleted 
            ? 'bg-green-50/50 dark:bg-green-900/20 border-2 border-green-200/50 dark:border-green-800/50' 
            : isActive
              ? 'bg-white dark:bg-gray-800 border-2 border-indigo-200/50 dark:border-indigo-800/50 shadow-lg shadow-indigo-500/10'
              : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
          }
        `}
      >
        <div className={`absolute -inset-px rounded-2xl transition-opacity duration-500 bg-gradient-to-r
          ${log.isCompleted
            ? 'from-green-100/10 via-green-50/5 to-green-100/10 dark:from-green-900/10 dark:via-green-800/5 dark:to-green-900/10'
            : isActive
              ? 'from-indigo-100/20 via-violet-50/10 to-indigo-100/20 dark:from-indigo-900/20 dark:via-violet-800/10 dark:to-indigo-900/20 opacity-100'
              : 'from-gray-50/10 to-gray-100/10 dark:from-gray-800/10 dark:to-gray-700/10 opacity-0 group-hover:opacity-100'
          }`} 
        />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-4">
            <div className="w-6">
              {log.isCompleted ? (
                <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
              ) : (
                <Circle className={`w-3 h-3 ${isActive ? 'text-indigo-400 dark:text-indigo-300 fill-indigo-400/20 dark:fill-indigo-300/20' : 'text-gray-300 dark:text-gray-600 fill-gray-300/20 dark:fill-gray-600/20'}`} />
              )}
            </div>
            
            <span className={`font-medium ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>
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
                className={`w-full sm:w-24 px-3 py-2 rounded-xl text-sm transition-all duration-200
                  ${log.isCompleted
                    ? 'bg-green-50/50 dark:bg-green-900/20 border border-green-200/50 dark:border-green-800/50 text-green-700 dark:text-green-300'
                    : isActive
                      ? 'bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20'
                      : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
                  }
                  disabled:opacity-60 disabled:cursor-not-allowed
                `}
              />
              <div className="absolute -top-2 left-2 px-1 text-xs font-medium text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800">
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
                className={`w-full sm:w-24 px-3 py-2 rounded-xl text-sm transition-all duration-200
                  ${log.isCompleted
                    ? 'bg-green-50/50 dark:bg-green-900/20 border border-green-200/50 dark:border-green-800/50 text-green-700 dark:text-green-300'
                    : isActive
                      ? 'bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20'
                      : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
                  }
                  disabled:opacity-60 disabled:cursor-not-allowed
                `}
              />
              <div className="absolute -top-2 left-2 px-1 text-xs font-medium text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800">
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
                className={`w-full px-3 py-2 rounded-xl text-sm transition-all duration-200
                  ${log.isCompleted
                    ? 'bg-green-50/50 dark:bg-green-900/20 border border-green-200/50 dark:border-green-800/50 text-green-700 dark:text-green-300'
                    : isActive
                      ? 'bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20'
                      : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
                  }
                  disabled:opacity-60 disabled:cursor-not-allowed
                `}
              />
              <div className="absolute -top-2 left-2 px-1 text-xs font-medium text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800">
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
              className="opacity-0 group-hover:opacity-100 text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all duration-200"
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
                className="px-4 py-2 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
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

const FloatingEmojis = () => {
  const emojis = ['😅', '💦', '🥵', '💪', '🔥', '😮‍💨', '🫡', '🏋️‍♂️', '🦾', '🧘‍♂️', '🏃‍♂️', '⚡️'];
  // Only show 3-4 emojis at a time
  const activeEmojis = 4;
  
  return (
    <div className="absolute inset-0 w-full h-full">
      {Array.from({ length: activeEmojis }).map((_, i) => {
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        const duration = 10 + Math.random() * 4; // 10-14 seconds
        const delay = i * 3 + Math.random() * 2; // 3-5 second stagger between each emoji
        
        return (
          <div
            key={i}
            className="absolute animate-float-continuous opacity-0"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              fontSize: `${3 + Math.random() * 3}rem`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          >
            {emoji}
          </div>
        );
      })}
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

  // Function to find first incomplete exercise/set
  const findFirstIncompletePosition = (exercises: ExerciseWithLogs[]) => {
    for (let i = 0; i < exercises.length; i++) {
      const exercise = exercises[i];
      const hasIncompleteSets = exercise.logs.some(log => !log.isCompleted);
      if (hasIncompleteSets) {
        return i;
      }
    }
    return exercises.length - 1; // Default to last exercise if all complete
  };

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const response = await fetch(`/api/workouts/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch workout');
        }
        const data = await response.json();
        
        // If workout isn't started, start it automatically first
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
          
          // Transform exercises with the new workout log data
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
          // Use existing workout log data
          setWorkoutStarted(true);
          setWorkoutLog(data.workoutLogs[0]);
          
          // Transform exercises to include logs array
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
    console.log('Updating set for exercise:', {
      exerciseIndex,
      setIndex,
      exerciseId: exercise.id,
      exerciseLogId: exercise.exerciseLogId,
      logData
    });

    if (!exercise.exerciseLogId) {
      console.error('No exercise log ID found for exercise:', exercise);
      return;
    }

    // Optimistically update the UI
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
      console.log('Making API call to:', `/api/exercise-logs/${exercise.exerciseLogId}/sets/${setIndex + 1}`);
      const response = await fetch(`/api/exercise-logs/${exercise.exerciseLogId}/sets/${setIndex + 1}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      });

      const responseText = await response.text();
      console.log('Server response:', responseText);

      if (!response.ok) {
        throw new Error(responseText || 'Failed to update set');
      }

      // Check if all sets are completed after this update
      const allSetsCompleted = exercises[exerciseIndex].logs.every((log, i) => 
        i === setIndex ? logData.isCompleted : log.isCompleted
      );

      if (allSetsCompleted && currentExerciseIndex < exercises.length - 1) {
        // setCurrentExerciseIndex(prev => prev + 1);
        console.log('All sets completed, moving to next exercise -- ', currentExerciseIndex + 1);
      }

      // Only parse JSON if we have content
      const data = responseText ? JSON.parse(responseText) : null;
      console.log('Successfully updated set:', data);
    } catch (error) {
      console.error('Failed to update set:', error);
      // Revert the optimistic update on error
      setExercises(prev => {
        const newExercises = [...prev];
        const exercise = newExercises[exerciseIndex];
        exercise.logs[setIndex] = {
          ...exercise.logs[setIndex],
          ...logData, // Keep the old data
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
      // Optionally handle error UI feedback
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-6 h-6 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (showCompletion) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4 p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg max-w-md mx-auto">
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-500 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Workout Complete! 🎉</h2>
            <p className="text-gray-600 dark:text-gray-400">Great job! You&apos;ve completed your workout. Redirecting to dashboard...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const currentExercise = exercises[currentExerciseIndex];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-white dark:bg-gray-900 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-8">
            <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              {/* Exercise Header Section */}
              <div className="relative">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/80 dark:from-indigo-950/50 dark:via-gray-800 dark:to-indigo-950/50" />
                
                <div className="relative px-6 py-6 border-b border-gray-200 dark:border-gray-700/80">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Exercise {currentExerciseIndex + 1} of {exercises.length}
                    </span>
                    {currentExercise && (
                      <a
                        href={`https://www.youtube.com/results?search_query=${currentExercise.name} how to`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Form Videos</span>
                      </a>
                    )}
                  </div>

                  {currentExercise ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 dark:from-indigo-400 dark:via-indigo-300 dark:to-indigo-400">
                          {currentExercise.name}
                        </h3>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-800">
                          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                            {currentExercise.sets} sets of {formatExerciseMeasure(currentExercise)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Select an exercise
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Choose an exercise from the list to begin
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative p-6 space-y-6">
                {/* Sets */}
                <div className="space-y-1">
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
                        {/* Show rest period indicator after each set except the last one */}
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
                <div className="flex justify-between pt-6">
                  <button
                    onClick={() => setCurrentExerciseIndex(prev => prev - 1)}
                    disabled={currentExerciseIndex === 0}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      currentExerciseIndex === 0
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    Previous Exercise
                  </button>
                  
                  {currentExerciseIndex < exercises.length - 1 ? (
                    <button
                      onClick={() => {
                        setCurrentExerciseIndex(prev => prev + 1);
                      }}
                      className="px-6 py-3 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
                    >
                      Next Exercise
                    </button>
                  ) : (
                    <button
                      onClick={completeWorkout}
                      className="px-6 py-3 rounded-xl bg-green-600 dark:bg-green-500 text-white font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
                    >
                      Complete Workout
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <TawkChat />
      <Footer />
    </div>
  );
} 