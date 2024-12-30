'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Program {
  id: string;
  name: string;
  description?: string;
  workoutPlans: any[];
  workoutLogs: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/programs/current');
        const data = await response.json();
        
        if (!data) {
          router.push('/hi');
          return;
        }

        setProgram(data);
      } catch (error) {
        console.error('Failed to fetch program:', error);
        router.push('/hi');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!program) {
    return null;
  }

  // Find the next workout to do (basic logic - can be enhanced)
  const completedWorkoutIds = new Set(program.workoutLogs.map(log => log.workoutId));
  const nextWorkout = program.workoutPlans[0]?.workouts.find(workout => 
    !completedWorkoutIds.has(workout.id)
  );

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Welcome to Your Dashboard</h1>
          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{program.name}</h2>
            <p className="text-gray-600">{program.description}</p>
          </div>
        </div>

        {nextWorkout ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Next Workout</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">Day {nextWorkout.dayNumber}</h3>
                <p className="text-gray-600">Focus: {nextWorkout.focus}</p>
                <p className="text-gray-600">{nextWorkout.exercises.length} exercises</p>
              </div>
              
              <Link 
                href={`/workout/${nextWorkout.id}`}
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Begin Workout
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Program Complete!</h2>
            <p className="text-gray-600">
              You've completed all workouts in this program. Would you like to:
            </p>
            <div className="mt-4 space-x-4">
              <Link 
                href="/hi"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Start a New Program
              </Link>
              <button 
                className="inline-block bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
                onClick={() => {/* TODO: Implement restart program */}}
              >
                Restart Current Program
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
          {program.workoutLogs.length > 0 ? (
            <div className="space-y-4">
              {program.workoutLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div>
                    <p className="font-medium text-gray-700">
                      Workout Day {program.workoutPlans[0]?.workouts.find(w => w.id === log.workoutId)?.dayNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                      Completed {new Date(log.completedAt!).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    href={`/workout-log/${log.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No workouts completed yet. Start your first workout above!</p>
          )}
        </div>
      </div>
    </main>
  );
} 