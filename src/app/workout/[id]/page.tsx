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
  onUpdate 
}: { 
  log: SetLog; 
  onComplete: (data: Partial<SetLog>) => void;
  onUpdate: (data: Partial<SetLog>) => void;
}) => {
  const [localWeight, setLocalWeight] = useState(log.weight?.toString() || '');
  const [localReps, setLocalReps] = useState(log.reps?.toString() || '');
  const [localNotes, setLocalNotes] = useState(log.notes || '');
  
  const canComplete = localWeight && localReps; // Both fields must have values

  return (
    <div 
      className={`flex items-center space-x-4 p-4 rounded-md group ${
        log.isCompleted 
          ? 'bg-green-50' 
          : 'bg-gray-50 border-2 border-dashed border-gray-300'
      }`}
    >
      {/* Status indicator */}
      <div className="w-6">
        {log.isCompleted ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <Circle className="w-3 h-3 text-gray-300 fill-gray-300" />
        )}
      </div>
      
      <span className="font-medium">Set {log.setNumber}</span>
      
      <input
        type="number"
        placeholder="Weight"
        value={localWeight}
        onChange={(e) => setLocalWeight(e.target.value)}
        disabled={log.isCompleted}
        className="w-20 px-2 py-1 border rounded"
      />
      <input
        type="number"
        placeholder="Reps"
        value={localReps}
        onChange={(e) => setLocalReps(e.target.value)}
        disabled={log.isCompleted}
        className="w-20 px-2 py-1 border rounded"
      />
      <input
        type="text"
        placeholder="Notes"
        value={localNotes}
        onChange={(e) => setLocalNotes(e.target.value)}
        disabled={log.isCompleted}
        className="flex-1 px-2 py-1 border rounded"
      />
      
      {log.isCompleted ? (
        <button
          onClick={() => onUpdate({
            weight: Number(localWeight),
            reps: Number(localReps),
            notes: localNotes,
            isCompleted: false
          })}
          className="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-800 transition-opacity"
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
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            {log.isCompleted ? 'Update Set' : 'Complete Set'}
          </button>
        )
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
                } : {
                  setNumber: i + 1,
                  reps: exercise.reps,
                  weight: undefined,
                  notes: '',
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
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
          <>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Exercise {currentExerciseIndex + 1} of {exercises.length}
                </h2>
                {restTimer !== null && (
                  <div className="text-lg font-medium">
                    Rest: {restTimer}s
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">{currentExercise.name}</h3>
                  <p className="text-gray-600">
                    {currentExercise.sets} sets × {currentExercise.reps} reps
                  </p>
                </div>

                <div className="space-y-4">
                  {currentExercise.logs.map((log, setIndex) => (
                    <SetInput
                      key={setIndex}
                      log={log}
                      onComplete={(data) => updateSet(currentExerciseIndex, setIndex, data)}
                      onUpdate={(data) => updateSet(currentExerciseIndex, setIndex, data)}
                    />
                  ))}
                </div>

                <div className="flex justify-between pt-4">
                  {currentExerciseIndex > 0 && (
                    <button
                      onClick={() => setCurrentExerciseIndex(prev => prev - 1)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Previous Exercise
                    </button>
                  )}
                  
                  {currentExerciseIndex < exercises.length - 1 ? (
                    <button
                      onClick={() => {
                        setCurrentExerciseIndex(prev => prev + 1);
                        if (currentExercise.restPeriod) {
                          startRestTimer(currentExercise.restPeriod);
                        }
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Next Exercise
                    </button>
                  ) : (
                    <button
                      onClick={completeWorkout}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Complete Workout
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
      </div>
    </main>
  );
} 