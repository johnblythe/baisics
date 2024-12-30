'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, Pencil, Circle } from 'lucide-react';

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
  showRestIndicator
}: { 
  log: SetLog;
  onComplete: (data: Partial<SetLog>) => void;
  onUpdate: (data: Partial<SetLog>) => void;
  isResting?: boolean;
  restTimeRemaining?: number;
  onSkipRest?: () => void;
  showRestIndicator?: boolean;
}) => {
  const [localWeight, setLocalWeight] = useState(log.weight?.toString() || '');
  const [localReps, setLocalReps] = useState(log.reps?.toString() || '');
  const [localNotes, setLocalNotes] = useState(log.notes || '');
  
  const canComplete = localWeight && localReps;

  return (
    <div className="space-y-2">
      <div 
        className={`relative p-4 rounded-xl transition-all duration-300 group
          ${log.isCompleted 
            ? 'bg-green-50/50 border border-green-200' 
            : 'bg-white border border-gray-200 hover:border-indigo-200 hover:shadow-lg'
          }
          ${isResting ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}
        `}
      >
        <div className="absolute -inset-px bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-indigo-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative flex items-center gap-4">
          <div className="w-6">
            {log.isCompleted ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Circle className="w-3 h-3 text-gray-300 fill-gray-300" />
            )}
          </div>
          
          <span className="font-medium text-gray-900">Set {log.setNumber}</span>
          
          <div className="flex-1 flex items-center gap-4">
            <input
              type="number"
              placeholder="Weight"
              value={localWeight}
              onChange={(e) => setLocalWeight(e.target.value)}
              disabled={log.isCompleted}
              className="w-24 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50"
            />
            <input
              type="number"
              placeholder="Reps"
              value={localReps}
              onChange={(e) => setLocalReps(e.target.value)}
              disabled={log.isCompleted}
              className="w-24 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50"
            />
            <input
              type="text"
              placeholder="Notes"
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              disabled={log.isCompleted}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50"
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
              className="opacity-0 group-hover:opacity-100 text-indigo-600 hover:text-indigo-800 transition-all duration-200"
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
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
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
            ? 'py-8 my-6 bg-gradient-to-r from-indigo-50/30 via-transparent to-indigo-50/30' 
            : 'py-1 my-2 bg-gray-50'
          }
        `}>
          <div className="flex items-center justify-center space-x-2">
            {isResting ? (
              <div className="relative flex flex-col items-center justify-center space-y-4">
                <div className="text-6xl font-bold text-indigo-600">{restTimeRemaining}s</div>
                <div className="text-xl text-gray-600">Rest Period</div>
                <button
                  onClick={onSkipRest}
                  className="mt-2 px-6 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all duration-200 hover:scale-105 transform flex items-center gap-2"
                >
                  LFG <span className="animate-bounce">🚀</span>
                </button>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Rest: {restTimeRemaining ?? '30'}s</div>
            )}
          </div>
        </div>
      )}
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

  // Function to find first incomplete exercise/set
  const findFirstIncompletePosition = (exercises: ExerciseWithLogs[]) => {
    for (let i = 0; i < exercises.length; i++) {
      const exercise = exercises[i];
      for (let j = 0; j < exercise.logs.length; j++) {
        const log = exercise.logs[j];
        // Consider a set incomplete if it has no weight or reps different from prescribed
        if (!log.weight || log.reps !== exercise.reps) {
          return i;
        }
      }
    }
    return 0; // Default to first exercise if all complete
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
                  isCompleted: !!existingSet.completedAt
                } : {
                  setNumber: i + 1,
                  reps: exercise.reps,
                  weight: undefined,
                  notes: '',
                  isCompleted: false
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

        throw new Error(responseText || 'Failed to update set');
      }

      // Only parse JSON if we have content
      const data = responseText ? JSON.parse(responseText) : null;
      console.log('Successfully updated set:', data);
    } catch (error) {
      console.error('Failed to update set:', error);
      // Could add a toast notification here
    }
  };

  const startRestTimer = (duration: number) => {
    setRestTimer(duration);
    const timer = setInterval(() => {
      setRestTimer(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
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

      // router.push('/dashboard');
    } catch (error) {
      console.error('Failed to complete workout:', error);
      // Optionally handle error UI feedback
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const currentExercise = exercises[currentExerciseIndex];

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm">
            {/* Background Texture */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03),transparent_70%)]"></div>
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(99,102,241,0.01)_25%,transparent_25%,transparent_75%,rgba(99,102,241,0.01)_75%,rgba(99,102,241,0.01))]" style={{ backgroundSize: '60px 60px' }}></div>
            </div>

            <div className="relative p-6 space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Exercise {currentExerciseIndex + 1} of {exercises.length}
                </h2>
                {restTimer !== null && (
                  <div className="px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100">
                    <span className="text-lg font-semibold text-indigo-600">
                      Rest: {restTimer}s
                    </span>
                  </div>
                )}
              </div>

              {/* Exercise Info */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">{currentExercise.name}</h3>
                <p className="text-gray-600">
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
                      // Start rest timer after completing any set
                      startRestTimer(currentExercise.restPeriod || 30);
                    }}
                    onUpdate={(data) => updateSet(currentExerciseIndex, setIndex, data)}
                    isResting={restTimer !== null && setIndex === currentExercise.logs.findIndex(l => !l.isCompleted)}
                    restTimeRemaining={restTimer ?? undefined}
                    onSkipRest={() => setRestTimer(null)}
                    showRestIndicator={true} // Show rest indicator after every set
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
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Previous Exercise
                </button>
                
                {currentExerciseIndex < exercises.length - 1 ? (
                  <button
                    onClick={() => {
                      setCurrentExerciseIndex(prev => prev + 1);
                      if (currentExercise.restPeriod) {
                        startRestTimer(currentExercise.restPeriod);
                      }
                    }}
                    className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Next Exercise
                  </button>
                ) : (
                  <button
                    onClick={completeWorkout}
                    className="px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
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
  );
} 