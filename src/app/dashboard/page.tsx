'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { useDropzone } from 'react-dropzone';

// Mock weight data - we'll replace this with real data later
const mockWeightData = [
  { date: '2024-01-01', weight: 165 },
  { date: '2024-01-08', weight: 164.2 },
  // { date: '2024-01-15', weight: 163.5 },
  // { date: '2024-01-22', weight: 163.8 },
  // { date: '2024-01-29', weight: 162.9 },
  // { date: '2024-02-05', weight: 162.3 },
].map(entry => ({
  ...entry,
  displayDate: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}));

interface Program {
  id: string;
  name: string;
  description?: string;
  workoutPlans: WorkoutPlan[];
  workoutLogs: WorkoutLog[];
  currentWeight?: number;
  startWeight?: number;
  progressPhotos: {
    id: string;
    url: string;
    type: 'FRONT' | 'BACK' | 'SIDE_LEFT' | 'SIDE_RIGHT' | 'CUSTOM' | null;
  }[];
  checkIns?: {
    id: string;
    createdAt: string;
    type: 'initial' | 'progress' | 'end';
  }[];
  activities?: {
    id: string;
    timestamp: string;
    type: string;
    metadata?: {
      path?: string;
      userAgent?: string;
    };
  }[];
}

interface WorkoutPlan {
  workouts: Workout[];
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  dailyCalories: number;
}

interface Workout {
  id: string;
  name: string;
  dayNumber: number;
  focus: string;
  exercises: any[];
}

interface WorkoutLog {
  id: string;
  workoutId: string;
  completedAt: string;
}

interface TooltipItem {
  type: 'check-in' | 'workout' | 'visit';
  text: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tooltipContent, setTooltipContent] = useState<{ x: number; y: number; content: React.ReactNode } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/programs/current');
        const data = await response.json();
        console.log("🚀 ~ fetchData ~ data:", data)
        
        if (!data) {
          // router.push('/hi');
          return;
        }

        setProgram(data);
      } catch (error) {
        console.error('Failed to fetch program:', error);
        // router.push('/hi');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [router]);

  const calculateProgramStats = (program: Program) => {
    const startDate = new Date(program.workoutLogs[0]?.completedAt || new Date());
    const weeksPassed = Math.floor((new Date().getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    // Calculate next check-in (every Monday)
    const today = new Date();
    const lastMonday = new Date(today);
    lastMonday.setDate(lastMonday.getDate() - ((lastMonday.getDay() + 6) % 7)); // Previous Monday
    const nextMonday = new Date(today);
    nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7)); // Next Monday
    
    const isCheckInDay = today.getDay() === 1; // Is it Monday?
    const isOverdue = today > lastMonday && today < nextMonday && !isCheckInDay; // Is it after Monday but before next Monday?
    const daysUntilCheckIn = Math.ceil((nextMonday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      weekNumber: weeksPassed + 1,
      daysUntilCheckIn,
      completedWorkouts: program.workoutLogs.length,
      nextCheckInDate: nextMonday.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      }),
      isCheckInDay,
      isOverdue
    };
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

  if (!program) {
    return null;
  }

  // Find the next workout to do (basic logic - can be enhanced)
  const completedWorkoutIds = new Set(program.workoutLogs.map(log => log.workoutId));
  const nextWorkout = program.workoutPlans[0]?.workouts.find(workout => 
    !completedWorkoutIds.has(workout.id)
  );

  const stats = calculateProgramStats(program);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-white pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="space-y-8">
            {/* Welcome & Program Info Card */}
            <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm">
              {/* Background Texture */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03),transparent_70%)]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(99,102,241,0.01)_25%,transparent_25%,transparent_75%,rgba(99,102,241,0.01)_75%,rgba(99,102,241,0.01))]" style={{ backgroundSize: '60px 60px' }}></div>
              </div>

              <div className="relative p-6 lg:p-8">
                {/* Welcome Text */}
                <h2 className="text-sm font-medium text-gray-600 mb-4">Welcome to your dashboard</h2>

                <div className="flex items-start justify-between gap-8">
                  {/* Program Info */}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <h1 className="text-3xl font-bold text-gray-900">{program.name}</h1>
                      {program.description && (
                        <p className="text-lg text-gray-600 max-w-2xl">{program.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex-shrink-0 w-72 bg-gray-50/50 rounded-xl p-4 space-y-4 border border-gray-100">
                    <div className="space-y-3">
                      {/* Week Number */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Week</span>
                        <span className="font-semibold text-gray-900">Week {stats.weekNumber}</span>
                      </div>

                      {/* Completed Workouts */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Workouts Completed</span>
                        <span className="font-semibold text-gray-900">{stats.completedWorkouts}</span>
                      </div>

                      {/* Next Check-in */}
                      <div className="pt-2 border-t border-gray-200">
                        {(stats.isCheckInDay || stats.isOverdue) ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Weekly Check-in</span>
                              <span className={`text-sm font-medium ${stats.isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
                                {stats.isOverdue ? 'Overdue' : 'Due Today'}
                              </span>
                            </div>
                            <button
                              onClick={() => {/* TODO: Implement check-in flow */}}
                              className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                                stats.isOverdue
                                  ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                              }`}
                            >
                              Start Weekly Check-in
                              <span className="text-xl">→</span>
                            </button>
                            {stats.isOverdue && (
                              <p className="text-sm text-red-600">
                                Your check-in was due on Monday
                              </p>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-gray-600">Next Check-in</span>
                              <span className="text-sm text-indigo-600 font-medium">{stats.nextCheckInDate}</span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {stats.daysUntilCheckIn === 0 
                                ? "Today" 
                                : stats.daysUntilCheckIn === 1 
                                  ? "Tomorrow" 
                                  : `in ${stats.daysUntilCheckIn} days`}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress and Next Workout Card */}
            <div className="group relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-lg opacity-0 blur-xl transition duration-500 group-hover:opacity-30"></div>
              <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="p-6 lg:p-8">
                  <div className="flex gap-8">
                    {/* Progress Section - 3/4 width */}
                    <div className="w-3/4">
                      <h2 className="text-sm font-medium text-gray-600">Progress</h2>
                      <div className="mt-4 space-y-6">
                        {/* Weight and Activity Grid Row */}
                        <div className="flex gap-6">
                          {/* Weight Section */}
                          <div className="w-1/2 space-y-4">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Current Weight</span>
                                <span className="text-2xl font-semibold text-gray-900">
                                  {program.currentWeight ? `${program.currentWeight} lbs` : '–'}
                                </span>
                              </div>
                              {program.startWeight && (
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-sm text-gray-500">Starting Weight</span>
                                  <span className="text-sm text-gray-500">{program.startWeight} lbs</span>
                                </div>
                              )}
                            </div>

                            {/* Weight Chart */}
                            <div className="h-48">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={mockWeightData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                                  <XAxis 
                                    dataKey="displayDate" 
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                    tickLine={false}
                                    axisLine={false}
                                  />
                                  <YAxis 
                                    domain={['dataMin - 1', 'dataMax + 1']}
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                    tickLine={false}
                                    axisLine={false}
                                    width={30}
                                  />
                                  <Tooltip
                                    wrapperStyle={{ outline: 'none' }}
                                    contentStyle={{ 
                                      backgroundColor: 'white',
                                      border: 'none',
                                      borderRadius: '0.5rem',
                                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                      padding: '0.5rem'
                                    }}
                                    formatter={(value: number) => [`${value} lbs`, 'Weight']}
                                    labelFormatter={(label) => label}
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="weight" 
                                    stroke="#4F46E5" 
                                    strokeWidth={2}
                                    dot={{ fill: '#4F46E5', strokeWidth: 2 }}
                                    activeDot={{ r: 6, fill: '#4F46E5' }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>

                            {mockWeightData.length <= 3 && (
                              <p className="text-sm text-gray-500">
                                Weight tracking becomes more meaningful after a few check-ins
                              </p>
                            )}
                          </div>

                          {/* Activity Grid */}
                          <div className="w-1/2 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Activity</span>
                              <span className="text-sm text-gray-500">Last 12 weeks</span>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="grid grid-cols-12 gap-1 relative">
                                {tooltipContent && (
                                  <div 
                                    className="fixed px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-pre pointer-events-none min-w-[150px] z-[60]"
                                    style={{ 
                                      left: tooltipContent.x,
                                      top: tooltipContent.y - 10,
                                      transform: 'translateX(-50%)'
                                    }}
                                  >
                                    {tooltipContent.content}
                                  </div>
                                )}
                                {[...Array(84)].map((_, i) => {
                                  // Calculate the date for this cell (going backwards from today)
                                  const date = new Date();
                                  date.setDate(date.getDate() - (83 - i));
                                  
                                  // Find activities for this date
                                  const hadWorkout = program.workoutLogs.some(log => {
                                    const logDate = new Date(log.completedAt);
                                    return logDate.toDateString() === date.toDateString();
                                  });

                                  // Check if it was a check-in day (Monday)
                                  const wasCheckIn = date.getDay() === 1 && program.checkIns?.some(checkIn => {
                                    const checkInDate = new Date(checkIn.createdAt);
                                    return checkInDate.toDateString() === date.toDateString();
                                  });

                                  // Check if user logged in
                                  const activities = program.activities?.filter(activity => {
                                    const activityDate = new Date(activity.timestamp);
                                    return activityDate.toDateString() === date.toDateString();
                                  }) || [];

                                  // Determine cell color based on activity
                                  let cellColor = 'bg-gray-200'; // default: no activity
                                  let intensity = 'opacity-100';

                                  if (wasCheckIn) {
                                    cellColor = 'bg-green-500'; // check-in
                                  } else if (hadWorkout) {
                                    cellColor = 'bg-indigo-500'; // workout
                                  } else if (activities.length > 0) {
                                    cellColor = 'bg-blue-300'; // visit
                                    intensity = activities.length > 1 ? 'opacity-100' : 'opacity-70';
                                  }

                                  // Create activity description for tooltip
                                  const tooltipItems: TooltipItem[] = [];
                                  if (wasCheckIn) {
                                    const checkIn = program.checkIns?.find(c => {
                                      const checkInDate = new Date(c.createdAt);
                                      return checkInDate.toDateString() === date.toDateString();
                                    });
                                    tooltipItems.push({
                                      type: 'check-in',
                                      text: `Check-in completed${checkIn?.type ? ` (${checkIn.type})` : ''}`
                                    });
                                  }
                                  if (hadWorkout) {
                                    const workout = program.workoutLogs.find(log => {
                                      const logDate = new Date(log.completedAt);
                                      return logDate.toDateString() === date.toDateString();
                                    });
                                    const workoutName = program.workoutPlans[0]?.workouts.find(w => w.id === workout?.workoutId)?.name;
                                    tooltipItems.push({
                                      type: 'workout',
                                      text: `Workout completed: ${workoutName || 'Unknown workout'}`
                                    });
                                  }
                                  if (activities.length > 0) {
                                    tooltipItems.push({
                                      type: 'visit',
                                      text: `${activities.length} visit${activities.length > 1 ? 's' : ''}`
                                    });
                                  }

                                  return (
                                    <div
                                      key={i}
                                      className={`aspect-square rounded-sm ${cellColor} ${intensity} transition-all duration-200 hover:scale-110 cursor-help`}
                                      onMouseEnter={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setTooltipContent({
                                          x: rect.left + rect.width / 2,
                                          y: rect.top,
                                          content: (
                                            <>
                                              {date.toLocaleDateString('en-US', { 
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                              })}
                                              {tooltipItems.length > 0 ? (
                                                tooltipItems.map((item, idx) => (
                                                  <div key={idx} className="mt-1 text-gray-200">{item.text}</div>
                                                ))
                                              ) : (
                                                <div className="mt-1 text-gray-400">No activity</div>
                                              )}
                                            </>
                                          )
                                        });
                                      }}
                                      onMouseLeave={() => setTooltipContent(null)}
                                    />
                                  );
                                })}
                              </div>
                              <div className="mt-2 flex items-center justify-end gap-2 text-sm">
                                <span className="text-gray-600">No activity</span>
                                <div className="w-3 h-3 rounded-sm bg-gray-200" />
                                <div className="w-3 h-3 rounded-sm bg-blue-300" />
                                <span className="text-gray-600">Visit</span>
                                <div className="w-3 h-3 rounded-sm bg-indigo-500" />
                                <span className="text-gray-600">Workout</span>
                                <div className="w-3 h-3 rounded-sm bg-green-500" />
                                <span className="text-gray-600">Check-in</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Photos Section */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h2 className="text-sm font-medium text-gray-600">Photos</h2>
                            {program.progressPhotos && program.progressPhotos.length > 0 && (
                              <Link 
                                href="/progress/photos"
                                className="text-sm text-indigo-600 hover:text-indigo-700"
                              >
                                View All →
                              </Link>
                            )}
                          </div>
                          
                          {program.progressPhotos && program.progressPhotos.length > 0 ? (
                            <div className="grid grid-cols-3 gap-4">
                              {program.progressPhotos.slice(0, 3).map((photo) => (
                                <div key={photo.id} className="aspect-square rounded-lg bg-gray-100 overflow-hidden relative group">
                                  <img 
                                    src={photo.url} 
                                    alt={`Progress photo - ${photo.type || 'Custom'} view`}
                                    className="object-cover w-full h-full"
                                  />
                                  {photo.type && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 px-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      {photo.type.replace('_', ' ').toLowerCase()}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div 
                              className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center transition-colors duration-200 hover:border-indigo-200 hover:bg-indigo-50/50 cursor-pointer"
                              onClick={() => router.push('/check-in')}
                            >
                              <div className="space-y-3">
                                <div className="flex justify-center">
                                  <svg className="w-12 h-12 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" fill="currentColor"/>
                                    <path d="M9 2L7.17 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4H16.83L15 2H9ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17Z" fill="currentColor"/>
                                  </svg>
                                </div>
                                <Link 
                                  href="/check-in"
                                  className="text-lg text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1"
                                >
                                  Add Your First Photo →
                                </Link>
                                <p className="text-gray-600">
                                  Drop photos here or click to start a check-in
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Next Workout and Macros - 1/4 width */}
                    <div className="w-1/4 space-y-8">
                      {nextWorkout ? (
                        <div className="space-y-4">
                          <h2 className="text-sm font-medium text-gray-600">Next Workout</h2>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <p className="text-lg font-semibold text-gray-900">Day {nextWorkout.dayNumber} - {nextWorkout.name}</p>
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
                      ) : (
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
                      )}

                      {/* Daily Macros */}
                      {program.workoutPlans[0] && (
                        <div className="space-y-4">
                          <h2 className="text-sm font-medium text-gray-600">Daily Macros</h2>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                <span className="text-gray-600">Protein</span>
                              </div>
                              <span className="font-medium">{program.workoutPlans[0].proteinGrams}g</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-gray-600">Carbs</span>
                              </div>
                              <span className="font-medium">{program.workoutPlans[0].carbGrams}g</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                <span className="text-gray-600">Fat</span>
                              </div>
                              <span className="font-medium">{program.workoutPlans[0].fatGrams}g</span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                              <span className="text-gray-600">Daily Calories</span>
                              <span className="font-medium">{program.workoutPlans[0].dailyCalories}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="group relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-lg opacity-0 blur-xl transition duration-500 group-hover:opacity-30"></div>
              <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="p-6 lg:p-8 space-y-6">
                  <h2 className="text-sm font-medium text-gray-600">Recent Activity</h2>
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