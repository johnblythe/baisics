'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ReactConfetti from "react-confetti";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TawkChat from "@/components/TawkChat";
import { getLatestCheckIn } from '../check-in/actions';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { CheckIn, ProgressPhoto, UserImages, UserStats } from '@prisma/client';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import MainLayout from '@/app/components/layouts/MainLayout';
import { generateWorkoutPDF } from '@/utils/pdf';
import { getSession } from 'next-auth/react';
import { WorkoutPlan as WorkoutPlanHiType } from '@/types/program';
// import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
// import { useDropzone } from 'react-dropzone';

type CheckInWithPhotos = CheckIn & {
  progressPhoto: (ProgressPhoto & {
    userImage: {
      id: string;
      base64Data: string;
      type: string | null;
    };
    userStats: UserStats | null;
  })[];
  stats: UserStats[];
};

interface WeightDataPoint {
  date: string;
  displayDate: string;
  weight: number;
}

// Mock data for empty state visualization
const mockEmptyStateData: WeightDataPoint[] = [
  { date: '2024-01-01', displayDate: 'Jan 1', weight: 165 },
  { date: '2024-01-08', displayDate: 'Jan 8', weight: 164.2 },
  { date: '2024-01-15', displayDate: 'Jan 15', weight: 163.5 },
  { date: '2024-01-22', displayDate: 'Jan 22', weight: 163.8 },
  { date: '2024-01-29', displayDate: 'Jan 29', weight: 162.9 },
  { date: '2024-02-05', displayDate: 'Feb 5', weight: 162.3 },
];

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
    date: string;
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

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [analyzingPhotoId, setAnalyzingPhotoId] = useState<string | null>(null);
  const [tooltipContent, setTooltipContent] = useState<{ x: number; y: number; content: React.ReactNode } | null>(null);
  const [latestCheckIn, setLatestCheckIn] = useState<CheckInWithPhotos | null>(null);
  const [weightData, setWeightData] = useState<WeightDataPoint[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  useEffect(() => {
    const disclaimerAcknowledged = localStorage.getItem('disclaimer-acknowledged');
    setShowDisclaimer(!disclaimerAcknowledged);
  }, []);

  useEffect(() => {
    // Show confetti if new_user=true in search params
    if (searchParams.get('new_user') === 'true') {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000); // Hide after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/programs/current');
        const data = await response.json();
        
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

  useEffect(() => {
    const fetchData = async () => {
      if (!program?.id) return;
      
      try {
        const checkIn = await getLatestCheckIn(program.id);
        setLatestCheckIn(checkIn);

        // Transform check-in data into weight data points
        if (checkIn?.stats) {
          const weightPoints = checkIn.stats
            .filter(stat => typeof stat.weight === 'number') // Only include entries with non-null weight
            .map(stat => ({
              date: new Date(stat.createdAt).toISOString(),
              displayDate: new Date(stat.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              }),
              weight: stat.weight as number // Safe to cast since we filtered for numbers
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          setWeightData(weightPoints);
        }
      } catch (error) {
        console.error('Error fetching latest check-in:', error);
      }
    };

    fetchData();
  }, [program?.id]);

  const handleAskForHelp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // @ts-expect-error Tawk_API is not defined
    void Tawk_API.toggle();
  }

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
        <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
          <div className="w-6 h-6 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
        <TawkChat />
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
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {showConfetti && <ReactConfetti recycle={false} />}
      {showDisclaimer && (
        <DisclaimerBanner 
          variant="banner"
          showAcknowledgeButton={true}
          persistKey="disclaimer-acknowledged"
          onAcknowledge={() => setShowDisclaimer(false)}
        />
      )}
      <main className="flex-grow bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="space-y-8">
            {/* Welcome & Program Info Card */}
            <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="relative p-6 lg:p-8">
                {/* Welcome Text */}
                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Welcome to your dashboard</h2>

                <div className="flex items-start justify-between gap-8">
                  {/* Program Info */}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{program.name}</h1>
                      {program.description && (
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">{program.description}</p>
                      )}
                      
                      {/* Helper Links */}
                      <div className="flex items-center gap-6 pt-20">
                        <button
                          onClick={async () => {
                            // @todo: fix this hackery, consolidate types
                            const session = await getSession();
                            if (!session?.user?.id) return;
                            const nutrition = {
                              dailyCalories: program.workoutPlans[0].dailyCalories,
                              macros: {
                                protein: program.workoutPlans[0].proteinGrams,
                                carbs: program.workoutPlans[0].carbGrams,
                                fats: program.workoutPlans[0].fatGrams,
                              }
                            }

                            const workoutPlan: WorkoutPlanHiType = {
                              id: '',
                              workouts: program.workoutPlans[0].workouts.map(workout => ({
                                ...workout,
                                day: workout.dayNumber
                              })),
                              nutrition: nutrition,
                              phase: 0,
                              phaseExplanation: '',
                              phaseExpectations: '',
                              phaseKeyPoints: [],
                            }
                            console.log('workoutPlan', workoutPlan);
                            const transformedProgram = {
                              ...program,
                              workoutPlans: [workoutPlan],
                              user: {
                                id: session?.user?.id,
                                email: session?.user?.email
                              }
                            }
                            generateWorkoutPDF(transformedProgram)
                          }}
                          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-white transition-colors"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 18H17V16H7V18Z" fill="currentColor"/>
                            <path d="M17 14H7V12H17V14Z" fill="currentColor"/>
                            <path d="M7 10H11V8H7V10Z" fill="currentColor"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" fill="currentColor"/>
                          </svg>
                          Download PDF
                        </button>
                        <Link
                          href="/hi"
                          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-white transition-colors"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 6V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          Create a new program
                        </Link>
                        <button
                          onClick={handleAskForHelp}
                          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-white transition-colors"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                            <path d="M9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9C15 10.6569 13.6569 12 12 12V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <circle cx="12" cy="17" r="1" fill="currentColor"/>
                          </svg>
                          Need help?
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex-shrink-0 w-72 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-4 space-y-4 border border-gray-100 dark:border-gray-700">
                    <div className="space-y-3">
                      {/* Week Number */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Week</span>
                        <span className="font-semibold text-gray-900 dark:text-white">Week {stats.weekNumber}</span>
                      </div>

                      {/* Completed Workouts */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Workouts Completed</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{stats.completedWorkouts}</span>
                      </div>

                      {/* Next Check-in */}
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        {(stats.isCheckInDay || stats.isOverdue) ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Weekly Check-in</span>
                              <span className={`text-sm font-medium ${stats.isOverdue ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                {stats.isOverdue ? 'Overdue' : 'Due Today'}
                              </span>
                            </div>
                            <Link
                              href="/check-in"
                              className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                                stats.isOverdue
                                  ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800'
                                  : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800'
                              }`}
                            >
                              Start Weekly Check-in
                              <span className="text-xl">→</span>
                            </Link>
                            {stats.isOverdue && (
                              <p className="text-sm text-red-600 dark:text-red-400">
                                Your check-in was due on Monday
                              </p>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-gray-600 dark:text-gray-400">Next Check-in</span>
                              <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{stats.nextCheckInDate}</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
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
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-lg opacity-0 blur-xl transition duration-500 group-hover:opacity-30 dark:group-hover:opacity-20"></div>
              <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="p-6 lg:p-8">
                  <div className="flex gap-8">
                    {/* Progress Section - 3/4 width */}
                    <div className="w-3/4">
                      <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Progress</h2>
                      <div className="mt-4 space-y-6">
                        {/* Weight and Activity Grid Row */}
                        <div className="flex gap-6">
                          {/* Weight Section */}
                          
                          <div className="w-1/2 space-y-4">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Current Weight</span>
                                <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                                  {program.currentWeight ? `${program.currentWeight} lbs` : '–'}
                                </span>
                              </div>
                              {program.startWeight && (
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-sm text-gray-500 dark:text-gray-400">Starting Weight</span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">{program.startWeight} lbs</span>
                                </div>
                              )}
                            </div>

                            {/* Weight Chart */}
                            <div className="h-48 relative">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart 
                                  data={weightData.length > 0 ? weightData : mockEmptyStateData} 
                                  margin={{ top: 5, right: 5, bottom: 5, left: 35 }}
                                >
                                  <XAxis 
                                    dataKey="displayDate" 
                                    tick={{ fontSize: 12, fill: 'var(--foreground)' }}
                                    tickLine={false}
                                    axisLine={false}
                                  />
                                  <YAxis 
                                    domain={['dataMin - 1', 'dataMax + 1']}
                                    tick={{ fontSize: 12, fill: 'var(--foreground)' }}
                                    tickLine={false}
                                    axisLine={false}
                                    width={30}
                                    tickFormatter={(value: number) => Math.round(value).toString()}
                                  />
                                  <Tooltip
                                    wrapperStyle={{ outline: 'none' }}
                                    contentStyle={{ 
                                      backgroundColor: 'var(--background)',
                                      border: 'none',
                                      borderRadius: '0.5rem',
                                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                      padding: '0.5rem',
                                      color: 'var(--foreground)'
                                    }}
                                    formatter={(value: number) => [`${Math.round(value)} lbs`, 'Weight']}
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
                              
                              {weightData.length === 0 && (
                                <div className="absolute inset-0 backdrop-blur-[2px] bg-white/50 dark:bg-gray-900/50 flex items-center justify-center">
                                  <div className="bg-white/95 dark:bg-gray-800/95 px-4 py-2 rounded-lg shadow-sm">
                                    <p className="text-md font-semibold text-gray-600 dark:text-gray-400 text-center">
                                      No weight data available yet.<br />
                                      Complete your first check-in to start.
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {weightData.length <= 3 && weightData.length > 0 && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Weight tracking becomes more meaningful after a few check-ins
                              </p>
                            )}
                          </div>

                          {/* Activity Grid */}
                          <div className="w-1/2 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Activity</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">Last 12 weeks</span>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                              <div className="grid grid-cols-12 gap-1 relative">
                                {tooltipContent && (
                                  <div 
                                    className="fixed px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded whitespace-pre pointer-events-none min-w-[150px] z-[60]"
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

                                  // Check for check-ins on any day
                                  const wasCheckIn = program.checkIns?.some(checkIn => {
                                    const checkInDate = new Date(checkIn.date);
                                    return checkInDate.toDateString() === date.toDateString();
                                  });

                                  // Check if user logged in
                                  const activities = program.activities?.filter(activity => {
                                    const activityDate = new Date(activity.timestamp);
                                    return activityDate.toDateString() === date.toDateString();
                                  }) || [];

                                  // Determine cell color based on activity
                                  let cellColor = 'bg-gray-200 dark:bg-gray-700'; // default: no activity
                                  let intensity = 'opacity-100';

                                  if (wasCheckIn) {
                                    cellColor = 'bg-green-500 dark:bg-green-600'; // check-in
                                  } else if (hadWorkout) {
                                    cellColor = 'bg-indigo-500 dark:bg-indigo-600'; // workout
                                  } else if (activities.length > 0) {
                                    cellColor = 'bg-blue-300 dark:bg-blue-500'; // visit
                                    intensity = activities.length > 1 ? 'opacity-100' : 'opacity-70';
                                  }

                                  // Create activity description for tooltip
                                  const tooltipItems: TooltipItem[] = [];
                                  if (wasCheckIn) {
                                    const checkIn = program.checkIns?.find(c => {
                                      const checkInDate = new Date(c.date);
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
                                <span className="text-gray-600 dark:text-gray-400">No activity</span>
                                <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700" />
                                <div className="w-3 h-3 rounded-sm bg-blue-300 dark:bg-blue-500" />
                                <span className="text-gray-600 dark:text-gray-400">Visit</span>
                                <div className="w-3 h-3 rounded-sm bg-indigo-500 dark:bg-indigo-600" />
                                <span className="text-gray-600 dark:text-gray-400">Workout</span>
                                <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600" />
                                <span className="text-gray-600 dark:text-gray-400">Check-in</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Photos Section */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Photos</h2>
                            {latestCheckIn?.progressPhoto && latestCheckIn.progressPhoto.length > 0 && (
                              <Link 
                                href="/check-in"
                                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                              >
                                Add New Photos →
                              </Link>
                            )}
                          </div>

                          {latestCheckIn?.progressPhoto && latestCheckIn.progressPhoto.length > 0 ? (
                            <div className="grid grid-cols-3 gap-4">
                              {latestCheckIn.progressPhoto.slice(0, 3).map((photo) => (
                                <div key={photo.id} className="aspect-square rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
                                  <img 
                                    src={photo.userImage.base64Data} 
                                    alt={`Progress photo - ${photo.userImage.type?.toLowerCase().replace('_', ' ') || 'custom'}`}
                                    className="object-cover w-full h-full hover:opacity-75 transition-opacity duration-200"
                                  />
                                  
                                  {!photo.userStats?.bodyFatLow && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          setAnalyzingPhotoId(photo.userImage.id);
                                          const response = await fetch('/api/photos/analyze', {
                                            method: 'POST',
                                            headers: {
                                              'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify({
                                              photoIds: [photo.userImage.id],
                                            }),
                                          });

                                          if (!response.ok) {
                                            throw new Error('Failed to analyze photo');
                                          }

                                          // Refresh the page to show updated data
                                          router.refresh();
                                        } catch (error) {
                                          console.error('Error analyzing photo:', error);
                                        } finally {
                                          setAnalyzingPhotoId(null);
                                        }
                                      }}
                                      disabled={analyzingPhotoId === photo.userImage.id}
                                      className="absolute top-2 right-2 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {analyzingPhotoId === photo.userImage.id ? (
                                        <div className="flex items-center gap-2">
                                          <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                                          <span>Analyzing...</span>
                                        </div>
                                      ) : (
                                        'Analyze'
                                      )}
                                    </button>
                                  )}

                                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs py-1 px-2 text-center bg-black/50 rounded">
                                    {photo.userImage.type?.toLowerCase().replace('_', ' ') || 'custom'}
                                  </div>

                                  {/* Stats Overlay */}
                                  {photo.userStats && (
                                    <div className="absolute inset-0 bg-black/80 opacity-0 hover:opacity-100 transition-opacity duration-200 flex flex-col justify-center items-center text-white p-4">
                                      <div className="space-y-3 text-center">
                                        <div>
                                          <div className="text-sm text-gray-300">Body Fat Range</div>
                                          <div className="font-medium">{photo.userStats.bodyFatLow}% - {photo.userStats.bodyFatHigh}%</div>
                                        </div>
                                        <div>
                                          <div className="text-sm text-gray-300">Muscle Mass Distribution</div>
                                          <div className="font-medium text-sm">{photo.userStats.muscleMassDistribution}</div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div 
                              className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center transition-colors duration-200 hover:border-indigo-200 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 cursor-pointer"
                              onClick={() => router.push('/check-in')}
                            >
                              <div className="space-y-3">
                                <div className="flex justify-center">
                                  <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" fill="currentColor"/>
                                    <path d="M9 2L7.17 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4H16.83L15 2H9ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17Z" fill="currentColor"/>
                                  </svg>
                                </div>
                                <Link 
                                  href="/check-in"
                                  className="text-lg text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium inline-flex items-center gap-1"
                                >
                                  Add Your First Photo →
                                </Link>
                                <p className="text-gray-600 dark:text-gray-400">
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
                          <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Next Workout</h2>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <p className="text-lg font-semibold text-gray-900 dark:text-white">Day {nextWorkout.dayNumber} - {nextWorkout.name}</p>
                              <p className="text-gray-600 dark:text-gray-400">Focus: {nextWorkout.focus}</p>
                              <p className="text-gray-600 dark:text-gray-400">{nextWorkout.exercises.length} exercises</p>
                            </div>
                            
                            <Link 
                              href={`/workout/${nextWorkout.id}`}
                              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
                            >
                              Begin Workout
                              <span className="text-indigo-200">→</span>
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Program Complete! 🎉</h2>
                          <p className="text-lg text-gray-600 dark:text-gray-300">
                            You&apos;ve completed all workouts in this program. What&apos;s next?
                          </p>
                          <div className="flex flex-wrap gap-4">
                            <Link 
                              href="/hi"
                              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
                            >
                              Start a New Program
                              <span className="text-indigo-200">→</span>
                            </Link>
                            <button 
                              className="px-6 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
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
                          <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Daily Macros</h2>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400"></div>
                                <span className="text-gray-600 dark:text-gray-400">Protein</span>
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">{program.workoutPlans[0].proteinGrams}g</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400"></div>
                                <span className="text-gray-600 dark:text-gray-400">Carbs</span>
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">{program.workoutPlans[0].carbGrams}g</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400"></div>
                                <span className="text-gray-600 dark:text-gray-400">Fat</span>
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">{program.workoutPlans[0].fatGrams}g</span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                              <span className="text-gray-600 dark:text-gray-400">Daily Calories</span>
                              <span className="font-medium text-gray-900 dark:text-white">{program.workoutPlans[0].dailyCalories}</span>
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
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-lg opacity-0 blur-xl transition duration-500 group-hover:opacity-30 dark:group-hover:opacity-20"></div>
              <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="p-6 lg:p-8 space-y-6">
                  <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Activity</h2>
                  {program.workoutLogs.length > 0 ? (
                    <div className="space-y-4">
                      {program.workoutLogs.slice(0, 5).map((log) => (
                        <div 
                          key={log.id} 
                          className="group/item flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-600 hover:shadow-lg transition-all duration-200"
                        >
                          <div className="space-y-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              Workout Day {program.workoutPlans[0]?.workouts.find((w: Workout) => w.id === log.workoutId)?.dayNumber}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Completed {new Date(log.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                          {/* <Link
                            href={`/workout-log/${log.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200"
                          >
                            View Details
                            <span className="opacity-0 group-hover/item:opacity-100 transition-opacity">→</span>
                          </Link> */}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                      <p className="text-gray-600 dark:text-gray-400">No workouts completed yet.</p>
                      <p className="text-gray-600 dark:text-gray-400">Start your first workout above to begin tracking your progress!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <MainLayout>
      <Suspense fallback={
        <>
          <Header />
          <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
            <div className="w-6 h-6 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
          </div>
          <TawkChat />
          <Footer />
        </>
      }>
        <DashboardContent />
      </Suspense>
    </MainLayout>
  );
} 