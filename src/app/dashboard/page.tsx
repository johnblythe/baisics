'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Program {
  id: string;
  name: string;
  description?: string;
  workoutPlans: WorkoutPlan[];
  workoutLogs: WorkoutLog[];
}

interface WorkoutPlan {
  workouts: Workout[];
}

interface Workout {
  id: string;
  dayNumber: number;
  focus: string;
  exercises: any[];
}

interface WorkoutLog {
  id: string;
  workoutId: string;
  completedAt: string;
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

  if (!program) {
    return null;
  }

  // Find the next workout to do (basic logic - can be enhanced)
  const completedWorkoutIds = new Set(program.workoutLogs.map(log => log.workoutId));
  const nextWorkout = program.workoutPlans[0]?.workouts.find(workout => 
    !completedWorkoutIds.has(workout.id)
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-white pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="space-y-8">
            {/* Welcome Card */}
            <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm">
              {/* Background Texture */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03),transparent_70%)]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(99,102,241,0.01)_25%,transparent_25%,transparent_75%,rgba(99,102,241,0.01)_75%,rgba(99,102,241,0.01))]" style={{ backgroundSize: '60px 60px' }}></div>
              </div>

              <div className="relative p-6 lg:p-8 space-y-6">
                <div className="space-y-2">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Welcome to Your Dashboard</h1>
                  <p className="text-lg text-gray-600">{program.name}</p>
                  {program.description && (
                    <p className="text-gray-600 max-w-3xl">{program.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Next Workout Card */}
            {nextWorkout ? (
              <div className="group relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-lg opacity-0 blur-xl transition duration-500 group-hover:opacity-30"></div>
                <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm transition duration-300 hover:scale-[1.01] hover:shadow-lg">
                  <div className="p-6 lg:p-8 space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-gray-900">Next Workout</h2>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-lg font-semibold text-gray-900">Day {nextWorkout.dayNumber}</p>
                          <p className="text-gray-600">Focus: {nextWorkout.focus}</p>
                          <p className="text-gray-600">{nextWorkout.exercises.length} exercises</p>
                        </div>
                        
                        <Link 
                          href={`/workout/${nextWorkout.id}`}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
                        >
                          Begin Workout
                          <span className="text-indigo-200">→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="group relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-lg opacity-0 blur-xl transition duration-500 group-hover:opacity-30"></div>
                <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <div className="p-6 lg:p-8 space-y-6">
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-gray-900">Program Complete! 🎉</h2>
                      <p className="text-lg text-gray-600">
                        You&apos;ve completed all workouts in this program. What&apos;s next?
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <Link 
                          href="/hi"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
                        >
                          Start a New Program
                          <span className="text-indigo-200">→</span>
                        </Link>
                        <button 
                          className="px-6 py-3 rounded-lg bg-gray-100 text-gray-900 font-medium hover:bg-gray-200 transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
                          onClick={() => {/* TODO: Implement restart program */}}
                        >
                          Restart Current Program
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Activity Card */}
            <div className="group relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-lg opacity-0 blur-xl transition duration-500 group-hover:opacity-30"></div>
              <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="p-6 lg:p-8 space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                  {program.workoutLogs.length > 0 ? (
                    <div className="space-y-4">
                      {program.workoutLogs.slice(0, 5).map((log) => (
                        <div 
                          key={log.id} 
                          className="group/item flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-200"
                        >
                          <div className="space-y-1">
                            <p className="font-medium text-gray-900">
                              Workout Day {program.workoutPlans[0]?.workouts.find((w: Workout) => w.id === log.workoutId)?.dayNumber}
                            </p>
                            <p className="text-sm text-gray-500">
                              Completed {new Date(log.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Link
                            href={`/workout-log/${log.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-all duration-200"
                          >
                            View Details
                            <span className="opacity-0 group-hover/item:opacity-100 transition-opacity">→</span>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                      <p className="text-gray-600">No workouts completed yet.</p>
                      <p className="text-gray-600">Start your first workout above to begin tracking your progress!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 