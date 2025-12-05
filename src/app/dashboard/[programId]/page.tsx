'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ReactConfetti from "react-confetti";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TawkChat from "@/components/TawkChat";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import MainLayout from '@/app/components/layouts/MainLayout';
import { generateWorkoutPDF } from '@/utils/pdf';
import { getSession } from 'next-auth/react';
import { WorkoutPlan as WorkoutPlanHiType } from '@/types/program';
import { ProgramWithRelations, TransformedProgram } from '../../api/programs/current/route';
import Image from 'next/image';
import { WorkoutUploadModal } from '@/components/WorkoutUploadModal';
import { ProgramSelector } from '@/components/ProgramSelector';
import { PhotoComparison } from '@/components/PhotoComparison';

// Types for our API responses
interface ProgramOverview {
  id: string;
  name: string;
  description: string | null;
  startDate: Date;
  workoutPlans: {
    id: string;
    proteinGrams: number;
    carbGrams: number;
    fatGrams: number;
    dailyCalories: number;
    workouts: {
      id: string;
      name: string;
      dayNumber: number;
      focus: string;
      exercises: {
        id: string;
        name: string;
        sets: number;
        reps: number | null;
        notes: string | null;
        measureType: string | null;
        measureUnit: string | null;
        measureValue: number | null;
      }[];
    }[];
  }[];
  createdAt?: Date;
}

interface ProgramStats {
  completedWorkouts: number;
  checkIn: {
    nextDate: string;
    isCheckInDay: boolean;
    isOverdue: boolean;
    daysUntilNext: number;
  };
}

interface WeightData {
  currentWeight: number;
  startWeight: number;
  weightHistory: {
    date: string;
    displayDate: string;
    weight: number;
  }[];
}

interface ProgressPhoto {
  id: string;
  base64Data: string;
  type: 'FRONT' | 'BACK' | 'SIDE_LEFT' | 'SIDE_RIGHT' | 'CUSTOM' | null;
  userStats: {
    bodyFatLow: number | null;
    bodyFatHigh: number | null;
    muscleMassDistribution: string | null;
  } | null;
  createdAt: string;
}

// interface Activity {
//   date: string;
//   type: 'workout' | 'check-in' | 'visit';
// }

interface RecentActivity {
  id: string;
  workoutId: string;
  workoutName: string;
  dayNumber: number;
  focus: string;
  completedAt: string;
}

interface CurrentWorkout {
  nextWorkout: {
    id: string;
    name: string;
    dayNumber: number;
    focus: string;
    exerciseCount: number;
  };
  totalWorkouts: number;
  lastCompletedAt: string | null;
}

// Component state types
interface TooltipContent {
  x: number;
  y: number;
  content: React.ReactNode;
}

type CheckInWithPhotos = ProgramWithRelations['checkIns']

// Mock data for empty state visualization
const mockEmptyStateData: WeightData['weightHistory'] = [
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
  createdAt?: Date;
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

interface TransformedProgressPhoto {
  id: string;
  base64Data: string;
  type: 'FRONT' | 'BACK' | 'SIDE_LEFT' | 'SIDE_RIGHT' | 'CUSTOM' | null;
  userStats: {
    bodyFatLow: number | null;
    bodyFatHigh: number | null;
    muscleMassDistribution: string | null;
  } | null;
  createdAt: string;
}

type Activity = {
  date: string;
  type: 'workout' | 'check-in' | 'visit';
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [program, setProgram] = useState<ProgramOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [analyzingPhotoId, setAnalyzingPhotoId] = useState<string | null>(null);
  const [tooltipContent, setTooltipContent] = useState<TooltipContent | null>(null);
  const [progressPhotos, setProgressPhotos] = useState<TransformedProgressPhoto[]>([]);
  const [weightData, setWeightData] = useState<WeightData>({ currentWeight: 0, startWeight: 0, weightHistory: [] });
  const [showConfetti, setShowConfetti] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [programStats, setProgramStats] = useState<ProgramStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<CurrentWorkout | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [session, setSession] = useState<any | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);

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
        const programId = window.location.pathname.split('/').pop();
        const programAccess = await fetch(`/api/programs/${programId}`);
        if (!programId) return;

        const [overview, stats, weightDataResponse, progressPhotos, activity, currentWorkout, activities] = await Promise.all([
          fetch(`/api/programs/${programId}/overview`).then(r => r.json()) as Promise<ProgramOverview>,
          fetch(`/api/programs/${programId}/stats`).then(r => r.json()) as Promise<ProgramStats>,
          fetch(`/api/programs/${programId}/weight-tracking`).then(r => r.json()) as Promise<WeightData>,
          fetch(`/api/programs/${programId}/progress-photos`).then(r => r.json()) as Promise<ProgressPhoto[]>,
          fetch(`/api/programs/${programId}/recent-activity`).then(r => r.json()) as Promise<RecentActivity[]>,
          fetch(`/api/programs/${programId}/current-workout`).then(r => r.json()) as Promise<CurrentWorkout>,
          fetch(`/api/programs/${programId}/activity`).then(r => r.json()) as Promise<Activity[]>
        ]);

        setProgram(overview);
        setProgramStats(stats);
        setWeightData(weightDataResponse);
        setProgressPhotos(progressPhotos || []);
        setRecentActivity(activity);
        setCurrentWorkout(currentWorkout);
        setActivities(activities);

      } catch (error) {
        console.error('Failed to fetch program:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [router]);

  useEffect(() => {
    async function fetchSession() {
      const session = await getSession();
      setSession(session);
    }
    fetchSession();
  }, []);

  useEffect(() => {
    async function fetchAllPrograms() {
      try {
        const response = await fetch('/api/programs');
        const programs = await response.json();
        setAllPrograms(programs);
      } catch (error) {
        console.error('Failed to fetch all programs:', error);
      }
    }

    fetchAllPrograms();
  }, []);

  const handleAskForHelp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // @ts-expect-error Tawk_API is not defined
    void Tawk_API.toggle();
  }

  const handleDownloadPDF = async () => {
    if (!program?.id || !session?.user?.id) return;
    try {
      await generateWorkoutPDF(program.id);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
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
  const completedWorkoutIds = new Set(
    program?.workoutPlans?.[0]?.workouts?.map(w => w.id) || []
  );
  const nextWorkout = program?.workoutPlans?.[0]?.workouts?.find(workout => 
    !completedWorkoutIds.has(workout.id)
  );

  // Add transformation helper
  const transformToHiType = (plan: WorkoutPlan): WorkoutPlanHiType => ({
    id: '', // Generated or passed separately
    workouts: plan.workouts.map(w => ({
      ...w,
    })),
    nutrition: {
      dailyCalories: plan.dailyCalories,
      macros: {
        protein: plan.proteinGrams,
        carbs: plan.carbGrams,
        fats: plan.fatGrams
      }
    },
    phase: 0,
    phaseExplanation: '',
    phaseExpectations: '',
    phaseKeyPoints: []
  });

  // Update PDF generation section
  const workoutPlan = transformToHiType(program.workoutPlans[0]);

  // Update macros display section to handle both structures
  const getMacros = (plan: WorkoutPlan | WorkoutPlanHiType) => {
    if ('proteinGrams' in plan) {
      return {
        protein: plan.proteinGrams,
        carbs: plan.carbGrams,
        fats: plan.fatGrams,
        calories: plan.dailyCalories
      };
    }
    return {
      protein: plan.nutrition.macros.protein,
      carbs: plan.nutrition.macros.carbs,
      fats: plan.nutrition.macros.fats,
      calories: plan.nutrition.dailyCalories
    };
  };

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
            {/* Quick Workout Start Card */}
            {currentWorkout?.nextWorkout && (
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-2xl opacity-75 blur group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 lg:p-8 text-white">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-indigo-200 text-sm font-medium">Ready to train?</p>
                      <h2 className="text-2xl font-bold">
                        Day {currentWorkout.nextWorkout.dayNumber}: {currentWorkout.nextWorkout.name}
                      </h2>
                      <p className="text-indigo-100">
                        {currentWorkout.nextWorkout.focus} • {currentWorkout.nextWorkout.exerciseCount} exercises
                      </p>
                    </div>
                    <Link
                      href={`/workout/${currentWorkout.nextWorkout.id}`}
                      className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-all duration-200 hover:scale-[1.02] shadow-lg"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Start Workout
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Welcome & Program Info Card */}
            <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="relative p-6 lg:p-8">
                {/* Welcome Text */}
                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Welcome to your dashboard</h2>

                <div className="flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-8">
                  {/* Program Info */}
                  <div className="flex-1 space-y-4 w-full lg:w-auto">
                    <div className="space-y-2">
                      {program && allPrograms.length > 0 ? (
                        <ProgramSelector 
                          currentProgram={{
                            id: program.id,
                            name: program.name,
                            createdAt: program.startDate
                          }}
                          programs={allPrograms.map(p => ({
                            id: p.id,
                            name: p.name,
                            createdAt: p.createdAt!
                          }))}
                        />
                      ) : (
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{program.name}</h1>
                      )}
                      {program.description && (
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">{program.description}</p>
                      )}
                      
                      {/* Helper Links */}
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-6 lg:pt-12">
                        <button
                          onClick={handleDownloadPDF}
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
                        <Link
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsUploadModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-white transition-colors"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 16V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M7 9L12 4L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M20 16V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          Upload a program
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
                  <div className="flex-shrink-0 w-full sm:w-72 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-4 space-y-4 border border-gray-100 dark:border-gray-700">
                    <div className="space-y-3">
                      {/* Week Number */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Week</span>
                        <span className="font-semibold text-gray-900 dark:text-white">Week {programStats?.completedWorkouts || 0}</span>
                      </div>

                      {/* Completed Workouts */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Workouts Completed</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{programStats?.completedWorkouts || 0}</span>
                      </div>

                      {/* Next Check-in */}
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        {programStats?.checkIn ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Weekly Check-in</span>
                              <span className={`text-sm font-medium ${programStats.checkIn.isOverdue ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                {programStats.checkIn.isOverdue ? 'Overdue' : 'Due Today'}
                              </span>
                            </div>
                            <Link
                              href="/check-in"
                              className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                                programStats.checkIn.isOverdue
                                  ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800'
                                  : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800'
                              }`}
                            >
                              Start Weekly Check-in
                              <span className="text-xl">→</span>
                            </Link>
                            {programStats.checkIn.isOverdue && (
                              <p className="text-sm text-red-600 dark:text-red-400">
                                Your check-in was due on Monday
                              </p>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-gray-600 dark:text-gray-400">Next Check-in</span>
                              <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{programStats?.checkIn ? (
                                <>
                                  {new Date(programStats.checkIn.nextDate).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                  {programStats.checkIn.isCheckInDay && (
                                    <span className="ml-2 text-sm text-green-600">(Today!)</span>
                                  )}
                                  {programStats.checkIn.isOverdue && (
                                    <span className="ml-2 text-sm text-red-600">(Overdue)</span>
                                  )}
                                </>
                              ) : 'Not scheduled'}</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {programStats?.checkIn?.daysUntilNext === 0 
                                ? "Today" 
                                : programStats?.checkIn?.daysUntilNext === 1 
                                  ? "Tomorrow" 
                                  : `in ${programStats?.checkIn?.daysUntilNext} days`}
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
                  <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Progress Section - 3/4 width on desktop */}
                    <div className="w-full lg:w-3/4">
                      <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Progress</h2>
                      <div className="mt-4 space-y-6">
                        {/* Weight and Activity Grid Row */}
                        <div className="flex flex-col md:flex-row gap-6">

                          {/* Weight Section */}
                          <div className="w-full md:w-1/2 space-y-4">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Current Weight</span>
                                <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                                  {weightData.currentWeight ? `${weightData.currentWeight} lbs` : '–'}
                                </span>
                              </div>
                              {weightData.startWeight > 0 && (
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-sm text-gray-500 dark:text-gray-400">Starting Weight</span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {weightData.startWeight} lbs
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Weight Chart */}
                            <div className="h-48 relative">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart 
                                  data={weightData.weightHistory.length > 0 ? weightData.weightHistory : mockEmptyStateData} 
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
                              
                              {weightData.weightHistory.length === 0 && (
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

                            {weightData.weightHistory.length <= 3 && weightData.weightHistory.length > 0 && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Weight tracking becomes more meaningful after a few check-ins
                              </p>
                            )}
                          </div>

                          {/* Activity Grid */}
                          <div className="w-full md:w-1/2 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Activity</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">Last 12 weeks</span>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                              <div className="grid grid-cols-12 gap-2">
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
                                {Array.from({ length: 96 }).map((_, i) => {
                                  const date = new Date();
                                  date.setDate(date.getDate() - (95 - i));
                                  const dateStr = date.toISOString().split('T')[0];
                                  
                                  const dayActivities = activities?.filter(a => 
                                    a.date.startsWith(dateStr)
                                  ) || [];

                                  const classes = dayActivities.length > 0
                                    ? dayActivities.some(a => a.type === 'check-in')
                                      ? 'bg-green-500 dark:bg-green-400'
                                      : dayActivities.some(a => a.type === 'workout')
                                        ? 'bg-indigo-500 dark:bg-indigo-400'
                                        : 'bg-blue-400 dark:bg-blue-300'
                                    : 'bg-gray-100 dark:bg-gray-800';

                                  return (
                                    <div
                                      key={i}
                                      className={`aspect-square rounded-sm ${classes} transition-all duration-200 hover:scale-110 cursor-help`}
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
                                              {dayActivities.length > 0 ? (
                                                dayActivities.map((activity, idx) => (
                                                  <div key={idx} className="mt-1 text-gray-200">
                                                    {activity.type === 'check-in' && 'Check-in completed'}
                                                    {activity.type === 'workout' && 'Workout completed'}
                                                    {activity.type === 'visit' && 'Site visit'}
                                                  </div>
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
                              <div className="mt-2 flex flex-wrap items-center justify-end gap-x-2 gap-y-1 text-xs sm:text-sm">
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700" />
                                  <span className="text-gray-600 dark:text-gray-400">None</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 rounded-sm bg-blue-300 dark:bg-blue-500" />
                                  <span className="text-gray-600 dark:text-gray-400">Visit</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 rounded-sm bg-indigo-500 dark:bg-indigo-600" />
                                  <span className="text-gray-600 dark:text-gray-400">Workout</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600" />
                                  <span className="text-gray-600 dark:text-gray-400">Check-in</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Photos Section */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Photos</h2>
                            <div className="flex items-center gap-4">
                              {progressPhotos.length >= 2 && (
                                <button
                                  onClick={() => setIsCompareModalOpen(true)}
                                  className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 inline-flex items-center gap-1"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                  </svg>
                                  Compare Progress
                                </button>
                              )}
                              <Link
                                href="/check-in"
                                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                              >
                                Add New Photos →
                              </Link>
                            </div>
                          </div>

                          {progressPhotos.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                              {progressPhotos.map((photo) => (
                                <div 
                                  key={photo.id}
                                  className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
                                >
                                  <Image
                                    src={photo.base64Data}
                                    alt="Progress photo"
                                    width={300}
                                    height={300}
                                    className="object-cover"
                                  />
                                  {(photo.userStats?.bodyFatHigh || photo.userStats?.bodyFatLow) && (
                                    <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity p-4">
                                      <div className="text-white space-y-2">
                                        <p className="font-medium">
                                          Body Fat: {photo.userStats.bodyFatLow}-{photo.userStats.bodyFatHigh}%
                                        </p>
                                        {photo.userStats.muscleMassDistribution && (
                                          <p className="text-sm">
                                            {photo.userStats.muscleMassDistribution}
                                          </p>
                                        )}
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

                    {/* Next Workout and Macros - 1/4 width on desktop */}
                    <div className="w-full lg:w-1/4 space-y-6 lg:space-y-8">
                      {currentWorkout?.nextWorkout ? (
                        <div className="space-y-4">
                          <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Next Workout</h2>
                          <div className="space-y-2">
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              Day {currentWorkout.nextWorkout.dayNumber} - {currentWorkout.nextWorkout.name}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              Focus: {currentWorkout.nextWorkout.focus}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              {currentWorkout.nextWorkout.exerciseCount} exercises
                            </p>
                          </div>
                          
                          <Link 
                            href={`/workout/${currentWorkout.nextWorkout.id}`}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
                          >
                            Begin Workout
                            <span className="text-indigo-200">→</span>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              Program Complete!
                              <span className="text-3xl">🎉</span>
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">
                              Great work finishing <span className="font-medium">{program.name}</span>! Choose your next step:
                            </p>
                          </div>

                          {/* Smart Continuation Options */}
                          <div className="grid gap-3">
                            {/* Similar Program */}
                            <Link
                              href="/dashboard/new-program?type=similar"
                              className="group flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all"
                            >
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                  Continue with Similar Program
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Keep the momentum - same style, increased intensity
                                </p>
                              </div>
                              <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>

                            {/* New Focus */}
                            <Link
                              href="/dashboard/new-program?type=new_focus"
                              className="group flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all"
                            >
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                                  Try a New Focus
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Shift goals - strength, cardio, mobility, or hypertrophy
                                </p>
                              </div>
                              <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>

                            {/* Fresh Start */}
                            <Link
                              href="/hi"
                              className="group flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50/50 dark:hover:bg-green-900/20 transition-all"
                            >
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400">
                                  Fresh Start with Full Intake
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Update your profile and get a completely new program
                                </p>
                              </div>
                              <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Daily Macros */}
                      {program?.workoutPlans?.[0] && (
                        <div className="space-y-4">
                          <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Daily Macros</h2>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400"></div>
                                <span className="text-gray-600 dark:text-gray-400">Protein</span>
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {getMacros(program.workoutPlans[0]).protein}g
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400"></div>
                                <span className="text-gray-600 dark:text-gray-400">Carbs</span>
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {getMacros(program.workoutPlans[0]).carbs}g
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400"></div>
                                <span className="text-gray-600 dark:text-gray-400">Fat</span>
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {getMacros(program.workoutPlans[0]).fats}g
                              </span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                              <span className="text-gray-600 dark:text-gray-400">Daily Calories</span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {getMacros(program.workoutPlans[0]).calories}
                              </span>
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
                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div 
                          key={activity.id} 
                          className="group/item flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-600 hover:shadow-lg transition-all duration-200"
                        >
                          <div className="space-y-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              Day {activity.dayNumber} - {activity.workoutName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Completed {new Date(activity.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                          {/* <Link
                            href={`/workout-log/${activity.id}`}
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

            <WorkoutUploadModal
              isOpen={isUploadModalOpen}
              onClose={() => setIsUploadModalOpen(false)}
            />

            <PhotoComparison
              programId={program.id}
              isOpen={isCompareModalOpen}
              onClose={() => setIsCompareModalOpen(false)}
            />
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
          <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
            <div className="w-6 h-6 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
          </div>
        </>
      }>
        <DashboardContent />
      </Suspense>
    </MainLayout>
  );
} 