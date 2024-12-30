'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

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
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutLog, setWorkoutLog] = useState<any>(null);

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const response = await fetch(`/api/workouts/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch workout');
        }
        const data = await response.json();
        
        // Transform exercises to include logs array
        const exercisesWithLogs = data.exercises.map((exercise: Exercise) => ({
          ...exercise,
          logs: Array(exercise.sets).fill(null).map((_, i) => ({
            setNumber: i + 1,
            reps: exercise.reps, // Default to prescribed reps
            weight: undefined,
            notes: '',
          })),
        }));

        setExercises(exercisesWithLogs);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch workout:', error);
      }
    };

    fetchWorkout();
  }, [params.id, router]);

  const startWorkout = async () => {
    try {
      const response = await fetch('/api/workout-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workoutId: params.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start workout');
      }

      const data = await response.json();
      
      // Update exercises with their exerciseLog IDs
      setExercises(prev => prev.map(exercise => {
        const exerciseLog = data.exerciseLogs.find(
          (log: any) => log.exerciseId === exercise.id
        );
        return {
          ...exercise,
          exerciseLogId: exerciseLog?.id,
        };
      }));
      
      setWorkoutLog(data);
      setWorkoutStarted(true);
    } catch (error) {
      console.error('Failed to start workout:', error);
    }
  };

  const updateSet = async (exerciseIndex: number, setIndex: number, logData: Partial<SetLog>) => {
    const exercise = exercises[exerciseIndex];
    if (!exercise.exerciseLogId) {
      console.error('No exercise log ID found');
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

    console.log(exercise.exerciseLogId);

    try {
      const response = await fetch(`/api/exercise-logs/${exercise.exerciseLogId}/sets/${setIndex + 1}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      });

      if (!response.ok) {
        throw new Error('Failed to update set');
      }
    } catch (error) {
      console.error('Failed to update set:', error);
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
        {!workoutStarted ? (
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Ready to Begin?</h1>
            <button
              onClick={startWorkout}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Start Workout
            </button>
          </div>
        ) : (
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
                    <div key={setIndex} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-md">
                      <span className="font-medium">Set {log.setNumber}</span>
                      <input
                        type="number"
                        placeholder="Weight"
                        value={log.weight || ''}
                        onChange={(e) => updateSet(currentExerciseIndex, setIndex, { weight: Number(e.target.value) })}
                        className="w-20 px-2 py-1 border rounded"
                      />
                      <input
                        type="number"
                        placeholder="Reps"
                        value={log.reps}
                        onChange={(e) => updateSet(currentExerciseIndex, setIndex, { reps: Number(e.target.value) })}
                        className="w-20 px-2 py-1 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="Notes"
                        value={log.notes}
                        onChange={(e) => updateSet(currentExerciseIndex, setIndex, { notes: e.target.value })}
                        className="flex-1 px-2 py-1 border rounded"
                      />
                    </div>
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
        )}
      </div>
    </main>
  );
} 