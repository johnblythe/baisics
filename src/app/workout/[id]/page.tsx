'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, Pencil, Circle } from 'lucide-react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TawkChat from "@/components/TawkChat";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restPeriod: number;
}

interface SetLog {
  setNumber: number;
  weight?: number;
  reps: number;
  notes?: string;
  isCompleted?: boolean;
  restCompleted?: boolean;
}

interface ExerciseWithLogs extends Exercise {
  logs: SetLog[];
  notes?: string;
  exerciseLogId?: string;
}

const SetInput = ({ 
  log, 
  onComplete, 
  onUpdate,
  isResting,
  restTimeRemaining,
  onSkipRest,
  showRestIndicator,
  onRestComplete
}: { 
  log: SetLog;
  onComplete: (data: Partial<SetLog>) => void;
  onUpdate: (data: Partial<SetLog>) => void;
  isResting?: boolean;
  restTimeRemaining?: number;
  onSkipRest?: () => void;
  showRestIndicator?: boolean;
  onRestComplete?: () => void;
}) => {
  const [localWeight, setLocalWeight] = useState(log.weight?.toString() || '');
  const [localReps, setLocalReps] = useState(log.reps?.toString() || '');
  const [localNotes, setLocalNotes] = useState(log.notes || '');
  
  // Update local state when log prop changes
  useEffect(() => {
    setLocalWeight(log.weight?.toString() || '');
    setLocalReps(log.reps?.toString() || '');
    setLocalNotes(log.notes || '');
  }, [log]);
  
  const canComplete = localWeight && localReps;

  return (
    <div className="space-y-2">
      <div 
        className={`relative p-4 rounded-xl transition-all duration-300 group
          ${log.isCompleted 
            ? 'bg-green-50/50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-lg'
          }
          ${isResting ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}
        `}
      >
        <div className="absolute -inset-px bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-indigo-500/5 dark:from-indigo-400/5 dark:via-purple-400/5 dark:to-indigo-400/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative flex items-center gap-4">
          <div className="w-6">
            {log.isCompleted ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500" />
            ) : (
              <Circle className="w-3 h-3 text-gray-300 dark:text-gray-600 fill-gray-300 dark:fill-gray-600" />
            )}
          </div>
          
          <span className="font-medium text-gray-900 dark:text-white">Set {log.setNumber}</span>
          
          <div className="flex-1 flex items-center gap-4">
            <input
              type="number"
              placeholder="Weight"
              value={localWeight}
              onChange={(e) => setLocalWeight(e.target.value)}
              disabled={log.isCompleted}
              className="w-24 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-900 dark:disabled:text-gray-300"
            />
            <input
              type="number"
              placeholder="Reps"
              value={localReps}
              onChange={(e) => setLocalReps(e.target.value)}
              disabled={log.isCompleted}
              className="w-24 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-900 dark:disabled:text-gray-300"
            />
            <input
              type="text"
              placeholder="Notes"
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              disabled={log.isCompleted}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-900 dark:disabled:text-gray-300"
            />
          </div>
          
          {log.isCompleted ? (
            <button
              onClick={() => onUpdate({
                weight: Number(localWeight),
                reps: Number(localReps),
                notes: localNotes,
                isCompleted: false
              })}
              className="opacity-0 group-hover:opacity-100 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-all duration-200"
            >
              <Pencil className="w-5 h-5" />
            </button>
          ) : (
            canComplete && (
              <button
                onClick={() => onComplete({
                  weight: Number(localWeight),
                  reps: Number(localReps),
                  notes: localNotes,
                  isCompleted: true
                })}
                className="px-4 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
              >
                {log.isCompleted ? 'Update Set' : 'Complete Set'}
              </button>
            )
          )}
        </div>
      </div>

      {/* Rest Period Indicator */}
      {showRestIndicator && (
        <div className={`
          relative overflow-hidden transition-all duration-300 rounded-lg
          ${isResting 
            ? 'h-64 my-6 bg-gradient-to-r from-indigo-50/30 dark:from-indigo-900/20 via-transparent to-indigo-50/30 dark:to-indigo-900/20' 
            : log.restCompleted
              ? 'py-2 my-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'py-2 my-2 bg-gray-50 dark:bg-gray-800'
          }
        `}>
          {isResting && (
            <div className="absolute inset-0 w-full h-full">
              <FloatingEmojis />
            </div>
          )}
          <div className="relative z-10 flex items-center justify-center space-x-2">
            {isResting ? (
              <div className="relative flex flex-col items-center justify-center space-y-4 py-8">
                <div className="text-6xl font-bold text-indigo-600 dark:text-indigo-400">{restTimeRemaining}s</div>
                <div className="text-xl text-gray-600 dark:text-gray-300">Rest Period</div>
                <button
                  onClick={() => {
                    onSkipRest?.();
                    onRestComplete?.();
                  }}
                  className="mt-2 px-6 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-200 hover:scale-105 transform flex items-center gap-2"
                >
                  LFG <span className="animate-bounce">🚀</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {log.restCompleted && <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />}
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Rest: {log.restCompleted ? 'Completed' : `${restTimeRemaining ?? '30'}s`}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
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
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutLog, setWorkoutLog] = useState<any>(null);
  const [activeRestSet, setActiveRestSet] = useState<number | null>(null);

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
                  // Only mark rest as completed if this set is completed
                  restCompleted: !!existingSet.completedAt
                } : {
                  setNumber: i + 1,
                  reps: exercise.reps,
                  weight: undefined,
                  notes: '',
                  isCompleted: false,
                  restCompleted: false
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

      if (allSetsCompleted) {
        // Mark the exercise log as completed
        const completeExerciseResponse = await fetch(`/api/exercise-logs/${exercise.exerciseLogId}/complete`, {
          method: 'POST',
        });

        if (!completeExerciseResponse.ok) {
          console.error('Failed to mark exercise as completed');
        }
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

  const startRestTimer = (duration: number, setIndex: number) => {
    setRestTimer(duration);
    setActiveRestSet(setIndex);
    const timer = setInterval(() => {
      setRestTimer(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setActiveRestSet(null);
          // Mark the current set's rest as completed
          setExercises(prevExercises => {
            const newExercises = [...prevExercises];
            const currentExercise = newExercises[currentExerciseIndex];
            if (setIndex >= 0 && setIndex < currentExercise.logs.length) {
              currentExercise.logs[setIndex] = {
                ...currentExercise.logs[setIndex],
                restCompleted: true
              };
            }
            return newExercises;
          });

          // Check if this was the last set and all sets are completed
          const currentExercise = exercises[currentExerciseIndex];
          const isLastSet = setIndex === currentExercise.logs.length - 1;
          const allSetsCompleted = currentExercise.logs.every(log => log.isCompleted);
          
          // If this was the last set's rest period and all sets are done, move to next exercise
          if (isLastSet && allSetsCompleted && currentExerciseIndex < exercises.length - 1) {
            setCurrentExerciseIndex(prev => prev + 1);
          }

          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completeWorkout = async () => {
    try {
      const response = await fetch(`/api/workout-logs/${workoutLog.id}/complete`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to complete workout');
      }

      router.push('/dashboard');
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

  const currentExercise = exercises[currentExerciseIndex];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-white dark:bg-gray-900 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-8">
            <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="relative p-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Exercise {currentExerciseIndex + 1} of {exercises.length}
                  </h2>
                  {restTimer !== null && (
                    <div className="px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800">
                      <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                        Rest: {restTimer}s
                      </span>
                    </div>
                  )}
                </div>

                {/* Exercise Info */}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{currentExercise.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {currentExercise.sets} sets × {currentExercise.reps} reps
                  </p>
                </div>

                {/* Sets */}
                <div className="space-y-1">
                  {currentExercise.logs.map((log, setIndex) => (
                    <SetInput
                      key={setIndex}
                      log={log}
                      onComplete={(data) => {
                        updateSet(currentExerciseIndex, setIndex, data);
                        // Start rest timer for this specific set
                        startRestTimer(currentExercise.restPeriod || 30, setIndex);
                      }}
                      onUpdate={(data) => updateSet(currentExerciseIndex, setIndex, data)}
                      isResting={activeRestSet === setIndex}
                      restTimeRemaining={activeRestSet === setIndex ? restTimer ?? undefined : undefined}
                      onSkipRest={() => {
                        setRestTimer(null);
                        setActiveRestSet(null);
                      }}
                      showRestIndicator={true}
                      onRestComplete={() => {
                        setExercises(prevExercises => {
                          const newExercises = [...prevExercises];
                          const currentExercise = newExercises[currentExerciseIndex];
                          if (setIndex >= 0 && setIndex < currentExercise.logs.length) {
                            currentExercise.logs[setIndex] = {
                              ...currentExercise.logs[setIndex],
                              restCompleted: true
                            };
                          }
                          return newExercises;
                        });
                      }}
                    />
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-6">
                  <button
                    onClick={() => setCurrentExerciseIndex(prev => prev - 1)}
                    disabled={currentExerciseIndex === 0}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
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
                      className="px-6 py-3 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                    >
                      Next Exercise
                    </button>
                  ) : (
                    <button
                      onClick={completeWorkout}
                      className="px-6 py-3 rounded-lg bg-green-600 dark:bg-green-500 text-white font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
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