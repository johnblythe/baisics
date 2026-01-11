'use client';

import React, { useEffect, useState, useCallback, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ReactConfetti from "react-confetti";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import MainLayout from '@/app/components/layouts/MainLayout';
import { generateWorkoutPDF } from '@/utils/pdf';
import { getSession } from 'next-auth/react';
import { WorkoutPlan as WorkoutPlanHiType } from '@/types/program';
import { ProgramWithRelations, TransformedProgram } from '../../api/programs/current/route';
import Image from 'next/image';
import { ProgramSelector } from '@/components/ProgramSelector';
import { PhotoComparison } from '@/components/PhotoComparison';
import { UpgradeModal } from '@/components/UpgradeModal';
import { ProgramCard } from '@/components/share/ProgramCard';
import { MacroDisplay } from '@/components/MacroDisplay';
import { NutritionLogModal } from '@/components/NutritionLogModal';
import { NutritionWidget } from '@/components/NutritionWidget';
import { ClaimWelcomeBanner, storeWelcomeData, getWelcomeData } from '@/components/ClaimWelcomeBanner';
import { StreakBadge } from '@/components/StreakBadge';
import { ProgressShareCard, ProgressShareData } from '@/components/share/ProgressShareCard';

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

interface RecentActivity {
  id: string;
  workoutId: string;
  workoutName: string;
  dayNumber: number;
  focus: string;
  completedAt: string;
  exerciseCount: number;
  totalVolume: number;
  duration: number | null;
}

interface WorkoutOption {
  id: string;
  dayNumber: number;
  name: string;
  focus: string;
  exerciseCount: number;
  lastCompletedAt: string | null;
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
  allWorkouts: WorkoutOption[];
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
  const [workoutStreak, setWorkoutStreak] = useState(0);
  const [copiedWorkoutId, setCopiedWorkoutId] = useState<string | null>(null);
  const [currentWorkout, setCurrentWorkout] = useState<CurrentWorkout | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [session, setSession] = useState<any | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isProgressShareModalOpen, setIsProgressShareModalOpen] = useState(false);
  const [isNutritionModalOpen, setIsNutritionModalOpen] = useState(false);

  // Modal URL state helpers
  const openModal = useCallback((modalName: 'upload' | 'compare' | 'share' | 'nutrition' | 'progress-share') => {
    // Upload redirects to dedicated import page
    if (modalName === 'upload') {
      router.push('/import');
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('modal', modalName);
    router.replace(`?${params.toString()}`, { scroll: false });

    switch (modalName) {
      case 'compare': setIsCompareModalOpen(true); break;
      case 'share': setIsShareModalOpen(true); break;
      case 'progress-share': setIsProgressShareModalOpen(true); break;
      case 'nutrition': setIsNutritionModalOpen(true); break;
    }
  }, [router, searchParams]);

  const closeModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('modal');
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });

    setIsCompareModalOpen(false);
    setIsShareModalOpen(false);
    setIsProgressShareModalOpen(false);
    setIsNutritionModalOpen(false);
  }, [router, searchParams]);

  // Read modal param on mount and open corresponding modal
  useEffect(() => {
    const modalParam = searchParams.get('modal');
    if (modalParam) {
      switch (modalParam) {
        case 'upload':
          router.push('/import');
          break;
        case 'compare': setIsCompareModalOpen(true); break;
        case 'share': setIsShareModalOpen(true); break;
        case 'progress-share': setIsProgressShareModalOpen(true); break;
        case 'nutrition': setIsNutritionModalOpen(true); break;
      }
    }
  }, []); // Run once on mount
  const [shareData, setShareData] = useState<any>(null);
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [welcomeData, setWelcomeData] = useState<{
    show: boolean;
    reason: string;
    source: string;
  } | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [coach, setCoach] = useState<{
    id: string;
    name: string;
    brandColor: string;
    brandLogo: string | null;
  } | null>(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [isWorkoutSelectorOpen, setIsWorkoutSelectorOpen] = useState(false);
  const workoutSelectorRef = useRef<HTMLDivElement>(null);

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
    const programId = window.location.pathname.split('/').pop();

    // Check if user came from claim flow (URL params)
    if (searchParams.get('welcome') === 'claim' && programId) {
      const reason = searchParams.get('reason');
      const source = searchParams.get('source');
      const data = {
        show: true,
        reason: reason ? decodeURIComponent(reason) : 'We selected this program based on your results.',
        source: source || 'tool',
      };
      setWelcomeData(data);
      // Store for persistence
      storeWelcomeData({
        reason: data.reason,
        source: data.source,
        programId,
        programName: program?.name,
      });
      // Clear the URL params without reload
      window.history.replaceState({}, '', window.location.pathname);
    } else if (programId) {
      // Check localStorage for persisted welcome data
      const stored = getWelcomeData();
      if (stored && stored.programId === programId) {
        setWelcomeData({
          show: true,
          reason: stored.reason,
          source: stored.source,
        });
      }
    }
  }, [searchParams, program?.name]);

  useEffect(() => {
    async function fetchData() {
      try {
        const programId = window.location.pathname.split('/').pop();
        const programAccess = await fetch(`/api/programs/${programId}`);
        if (!programId) return;

        const [overview, stats, weightDataResponse, progressPhotos, activityResponse, currentWorkout, activities] = await Promise.all([
          fetch(`/api/programs/${programId}/overview`).then(r => r.json()) as Promise<ProgramOverview>,
          fetch(`/api/programs/${programId}/stats`).then(r => r.json()) as Promise<ProgramStats>,
          fetch(`/api/programs/${programId}/weight-tracking`).then(r => r.json()) as Promise<WeightData>,
          fetch(`/api/programs/${programId}/progress-photos`).then(r => r.json()) as Promise<ProgressPhoto[]>,
          fetch(`/api/programs/${programId}/recent-activity`).then(r => r.json()) as Promise<{ workouts: RecentActivity[]; streak: number }>,
          fetch(`/api/programs/${programId}/current-workout`).then(r => r.json()) as Promise<CurrentWorkout>,
          fetch(`/api/programs/${programId}/activity`).then(r => r.json()) as Promise<Activity[]>
        ]);

        setProgram(overview);
        setProgramStats(stats);
        setWeightData(weightDataResponse);
        setProgressPhotos(progressPhotos || []);
        setRecentActivity(activityResponse.workouts || []);
        setWorkoutStreak(activityResponse.streak || 0);
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

  // Fetch user's premium status, streak, and coach info
  useEffect(() => {
    async function fetchUserStatus() {
      try {
        const response = await fetch('/api/user');
        const data = await response.json();
        setIsPremium(data.isPremium || false);
        setStreak({
          current: data.streakCurrent || 0,
          longest: data.streakLongest || 0
        });
        // Set coach info if user has one
        if (data.coach) {
          setCoach(data.coach);
        }
      } catch (error) {
        console.error('Failed to fetch user status:', error);
      }
    }
    fetchUserStatus();
  }, []);

  // Handle upgrade_prompt from URL (when free user tries to claim 2nd program)
  useEffect(() => {
    if (searchParams.get('upgrade_prompt') === 'program_limit') {
      setShowUpgradeModal(true);
      // Clear the URL param
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchAllPrograms() {
      try {
        const response = await fetch('/api/programs');
        if (!response.ok) {
          console.error('Failed to fetch programs:', response.status, response.statusText);
          return;
        }
        const programs = await response.json();
        if (Array.isArray(programs)) {
          setAllPrograms(programs);
        }
      } catch (error) {
        console.error('Failed to fetch all programs:', error);
      }
    }

    fetchAllPrograms();
  }, []);

  // Initialize selectedWorkoutId when currentWorkout loads
  useEffect(() => {
    if (currentWorkout?.nextWorkout?.id && !selectedWorkoutId) {
      setSelectedWorkoutId(currentWorkout.nextWorkout.id);
    }
  }, [currentWorkout, selectedWorkoutId]);

  // Handle click outside for workout selector dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (workoutSelectorRef.current && !workoutSelectorRef.current.contains(event.target as Node)) {
        setIsWorkoutSelectorOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Derive the selected workout from currentWorkout.allWorkouts
  const selectedWorkout = currentWorkout?.allWorkouts?.find(w => w.id === selectedWorkoutId) || currentWorkout?.nextWorkout;

  const handleAskForHelp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // @ts-expect-error Tawk_API is not defined
    void Tawk_API.toggle();
  };

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-[#F1F5F9] border-t-[#FF6B6B] rounded-full animate-spin"></div>
      </div>
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
    <div className="bg-[#F8FAFC] min-h-screen">
      {showConfetti && <ReactConfetti recycle={false} />}
      {showDisclaimer && (
        <DisclaimerBanner
          variant="banner"
          showAcknowledgeButton={true}
          persistKey="disclaimer-acknowledged"
          onAcknowledge={() => setShowDisclaimer(false)}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Welcome banner for claim flow users */}
        {welcomeData?.show && program?.id && (
          <ClaimWelcomeBanner
            reason={welcomeData.reason}
            source={welcomeData.source}
            programName={program?.name}
            programId={program.id}
          />
        )}
          <div className="space-y-8">
            {/* Coach Branding Card - shows if client is connected to a coach */}
            {coach && (
              <div
                className="relative overflow-hidden rounded-2xl border shadow-md"
                style={{
                  borderColor: coach.brandColor,
                  borderLeftWidth: '4px',
                  backgroundColor: 'white',
                }}
              >
                <div
                  className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-10"
                  style={{ backgroundColor: coach.brandColor }}
                />
                <div className="relative p-5 flex items-center gap-4">
                  {/* Coach Avatar */}
                  {coach.brandLogo ? (
                    <img
                      src={coach.brandLogo}
                      alt={coach.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                      style={{ backgroundColor: coach.brandColor }}
                    >
                      {coach.name
                        .trim()
                        .split(/\s+/)
                        .filter((n) => n.length > 0)
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider" style={{ fontFamily: "'Space Mono', monospace" }}>
                      Your Coach
                    </p>
                    <h3 className="text-lg font-semibold text-[#0F172A] truncate">
                      {coach.name}
                    </h3>
                  </div>
                  <div
                    className="px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{ backgroundColor: `${coach.brandColor}15`, color: coach.brandColor }}
                  >
                    Connected
                  </div>
                </div>
              </div>
            )}
            {/* Quick Workout Start Card - v2a coral accent theme */}
            {currentWorkout?.nextWorkout && selectedWorkout && (
              <div className="relative bg-white rounded-2xl border-l-4 border-l-[#FF6B6B] border border-[#E2E8F0] shadow-md p-6 lg:p-8">
                {/* Decorative coral accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B6B]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none overflow-hidden"></div>

                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-[#64748B] text-sm font-medium uppercase tracking-wider" style={{ fontFamily: "'Space Mono', monospace" }}>Ready to train?</p>

                    {/* Workout Selector Dropdown */}
                    <div className="relative" ref={workoutSelectorRef}>
                      <button
                        onClick={() => setIsWorkoutSelectorOpen(!isWorkoutSelectorOpen)}
                        className="inline-flex items-center gap-2 group text-2xl font-bold text-[#0F172A] hover:text-[#FF6B6B] transition-colors"
                        aria-expanded={isWorkoutSelectorOpen}
                        aria-haspopup="listbox"
                        aria-label="Select workout"
                      >
                        Day {selectedWorkout.dayNumber}: {selectedWorkout.name}
                        <svg
                          className={`w-5 h-5 text-[#94A3B8] group-hover:text-[#FF6B6B] transition-transform duration-200 ${
                            isWorkoutSelectorOpen ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {isWorkoutSelectorOpen && currentWorkout.allWorkouts && (
                        <div
                          className="absolute z-[60] w-full min-w-[320px] max-w-[450px] mt-2 bg-white rounded-xl shadow-lg border border-[#E2E8F0] py-1 overflow-hidden"
                          role="listbox"
                          tabIndex={-1}
                        >
                          {currentWorkout.allWorkouts.map((workout) => {
                            const isSelected = workout.id === selectedWorkoutId;
                            const isNextWorkout = workout.id === currentWorkout.nextWorkout.id;

                            return (
                              <button
                                key={workout.id}
                                onClick={() => {
                                  setSelectedWorkoutId(workout.id);
                                  setIsWorkoutSelectorOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 transition-colors flex items-center justify-between gap-2 ${
                                  isSelected ? 'bg-[#F8FAFC]' : ''
                                } text-[#0F172A] hover:bg-[#F8FAFC]`}
                                role="option"
                                aria-selected={isSelected}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="block font-medium truncate">
                                      Day {workout.dayNumber}: {workout.name}
                                    </span>
                                    {isNextWorkout && (
                                      <span className="text-xs bg-[#FFE5E5] text-[#FF6B6B] px-2 py-0.5 rounded-full font-medium">
                                        Next
                                      </span>
                                    )}
                                  </div>
                                  <span className="block text-sm text-[#64748B] mt-0.5">
                                    {workout.focus} • {workout.exerciseCount} exercises
                                    {workout.lastCompletedAt
                                      ? ` • Last: ${new Date(workout.lastCompletedAt).toLocaleDateString()}`
                                      : ' • Not yet completed'
                                    }
                                  </span>
                                </div>

                                {isSelected && (
                                  <svg className="w-5 h-5 text-[#FF6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <p className="text-[#64748B]">
                      {selectedWorkout.focus} • {selectedWorkout.exerciseCount} exercises
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href={`/workout/${selectedWorkoutId}`}
                      className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#FF6B6B] text-white font-semibold rounded-xl hover:bg-[#EF5350] transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-[#FF6B6B]/25"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Start Workout
                    </Link>
                    <button
                      onClick={() => openModal('nutrition')}
                      className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-white text-[#0F172A] font-semibold rounded-xl border-2 border-[#E2E8F0] hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Log Nutrition
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Welcome & Program Info Card - v2a styling */}
            <div className="relative overflow-visible bg-white rounded-2xl border-l-4 border-l-[#FF6B6B] border border-[#E2E8F0] shadow-md">
              <div className="relative p-6 lg:p-8">
                {/* Welcome Text */}
                <p className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider mb-4" style={{ fontFamily: "'Space Mono', monospace" }}>Welcome to your dashboard</p>

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
                          isPremium={isPremium}
                        />
                      ) : (
                        <h1 className="text-3xl font-bold text-[#0F172A]">{program.name}</h1>
                      )}
                      {program.description && (
                        <p className="text-lg text-[#475569] max-w-2xl">{program.description}</p>
                      )}

                      {/* Helper Links */}
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-6 lg:pt-12">
                        <button
                          onClick={handleDownloadPDF}
                          className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#FF6B6B] transition-colors"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 18H17V16H7V18Z" fill="currentColor"/>
                            <path d="M17 14H7V12H17V14Z" fill="currentColor"/>
                            <path d="M7 10H11V8H7V10Z" fill="currentColor"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" fill="currentColor"/>
                          </svg>
                          Download PDF
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch('/api/programs/share', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ programId: program.id })
                              });
                              const data = await res.json();

                              if (!res.ok) {
                                alert(data.error || 'Failed to generate share link');
                                return;
                              }

                              if (data.shareUrl) {
                                await navigator.clipboard.writeText(data.shareUrl);
                                alert('Share link copied to clipboard!');
                              } else {
                                alert('Could not generate share link. Please try again.');
                              }
                            } catch (err) {
                              console.error('Failed to generate share link:', err);
                              alert('Network error - please check your connection and try again.');
                            }
                          }}
                          className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#FF6B6B] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          Copy Share Link
                        </button>
                        <Link
                          href="/hi"
                          className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#FF6B6B] transition-colors"
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
                            openModal('upload');
                          }}
                          className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#FF6B6B] transition-colors"
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
                          className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#FF6B6B] transition-colors"
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

                  {/* Stats - v2a styling */}
                  <div className="flex-shrink-0 w-full sm:w-72 bg-white rounded-xl p-4 space-y-4 border-2 border-[#E2E8F0] shadow-sm">
                    <div className="space-y-3">
                      {/* Week Number */}
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">Week</span>
                        <span className="font-semibold text-[#0F172A]">Week {programStats?.completedWorkouts || 0}</span>
                      </div>

                      {/* Completed Workouts */}
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">Workouts Completed</span>
                        <span className="font-semibold text-[#0F172A]">{programStats?.completedWorkouts || 0}</span>
                      </div>

                      {/* Streak */}
                      {streak.current > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-[#64748B]">Streak</span>
                          <StreakBadge
                            current={streak.current}
                            longest={streak.longest}
                            showLongest
                            size="sm"
                          />
                        </div>
                      )}

                      {/* Share Progress Button */}
                      {(programStats?.completedWorkouts ?? 0) > 0 && (
                        <div className="pt-2 border-t border-[#E2E8F0]">
                          <button
                            onClick={() => openModal('progress-share')}
                            className="w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white hover:shadow-lg hover:shadow-[#FF6B6B]/25 hover:scale-[1.02]"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            Share Progress
                          </button>
                        </div>
                      )}

                      {/* Next Check-in */}
                      <div className="pt-2 border-t border-[#E2E8F0]">
                        {programStats?.checkIn ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[#64748B]">Weekly Check-in</span>
                              <span className={`text-sm font-medium ${programStats.checkIn.isOverdue ? 'text-[#EF5350]' : 'text-[#FF6B6B]'}`}>
                                {programStats.checkIn.isOverdue ? 'Overdue' : 'Due Today'}
                              </span>
                            </div>
                            <Link
                              href="/check-in"
                              className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                                programStats.checkIn.isOverdue
                                  ? 'bg-[#FFE5E5] text-[#EF5350] hover:bg-[#FFD5D5] border border-[#FF6B6B]/30'
                                  : 'bg-[#FFE5E5] text-[#FF6B6B] hover:bg-[#FFD5D5] border border-[#FF6B6B]/30'
                              }`}
                            >
                              Start Weekly Check-in
                              <span className="text-xl">→</span>
                            </Link>
                            {programStats.checkIn.isOverdue && (
                              <p className="text-sm text-[#EF5350]">
                                Your check-in was due on Monday
                              </p>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[#64748B]">Next Check-in</span>
                              <span className="text-sm text-[#FF6B6B] font-medium">{programStats?.checkIn ? (
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
                                    <span className="ml-2 text-sm text-[#EF5350]">(Overdue)</span>
                                  )}
                                </>
                              ) : 'Not scheduled'}</span>
                            </div>
                            <p className="text-sm text-[#94A3B8]">
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

            {/* Progress and Next Workout Card - v2a styling */}
            <div className="relative overflow-hidden bg-white rounded-2xl border-l-4 border-l-[#0F172A] border border-[#E2E8F0] shadow-md">
              <div className="p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                  {/* Progress Section - 3/4 width on desktop */}
                  <div className="w-full lg:w-3/4">
                    <h2 className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider" style={{ fontFamily: "'Space Mono', monospace" }}>Progress</h2>
                    <div className="mt-4 space-y-6">
                      {/* Weight and Activity Grid Row */}
                      <div className="flex flex-col md:flex-row gap-6">

                        {/* Weight Section */}
                        <div className="w-full md:w-1/2 space-y-4">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[#475569]">Current Weight</span>
                              <span className="text-2xl font-semibold text-[#0F172A]">
                                {weightData.currentWeight ? `${weightData.currentWeight} lbs` : '–'}
                              </span>
                            </div>
                            {weightData.startWeight > 0 && (
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-sm text-[#94A3B8]">Starting Weight</span>
                                <span className="text-sm text-[#94A3B8]">
                                  {weightData.startWeight} lbs
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Weight Chart - coral line */}
                          <div className="h-48 relative">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={weightData.weightHistory.length > 0 ? weightData.weightHistory : mockEmptyStateData}
                                margin={{ top: 5, right: 5, bottom: 5, left: 35 }}
                              >
                                <XAxis
                                  dataKey="displayDate"
                                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                                  tickLine={false}
                                  axisLine={false}
                                />
                                <YAxis
                                  domain={['dataMin - 1', 'dataMax + 1']}
                                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                                  tickLine={false}
                                  axisLine={false}
                                  width={30}
                                  tickFormatter={(value: number) => Math.round(value).toString()}
                                />
                                <Tooltip
                                  wrapperStyle={{ outline: 'none' }}
                                  contentStyle={{
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #F1F5F9',
                                    borderRadius: '0.5rem',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    padding: '0.5rem',
                                    color: '#0F172A'
                                  }}
                                  formatter={(value: number) => [`${Math.round(value)} lbs`, 'Weight']}
                                  labelFormatter={(label) => label}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="weight"
                                  stroke="#FF6B6B"
                                  strokeWidth={2}
                                  dot={{ fill: '#FF6B6B', strokeWidth: 2 }}
                                  activeDot={{ r: 6, fill: '#FF6B6B' }}
                                />
                              </LineChart>
                            </ResponsiveContainer>

                            {weightData.weightHistory.length === 0 && (
                              <div className="absolute inset-0 backdrop-blur-[2px] bg-white/50 flex items-center justify-center">
                                <div className="bg-white/95 px-4 py-2 rounded-lg shadow-sm border border-[#F1F5F9]">
                                  <p className="text-md font-semibold text-[#475569] text-center">
                                    No weight data available yet.<br />
                                    Complete your first check-in to start.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {weightData.weightHistory.length <= 3 && weightData.weightHistory.length > 0 && (
                            <p className="text-sm text-[#94A3B8]">
                              Weight tracking becomes more meaningful after a few check-ins
                            </p>
                          )}
                        </div>

                        {/* Activity Grid - v2a colors */}
                        <div className="w-full md:w-1/2 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[#475569]">Activity</span>
                            <span className="text-sm text-[#94A3B8]">Last 12 weeks</span>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-[#E2E8F0]">
                            <div className="grid grid-cols-12 gap-2">
                              {tooltipContent && (
                                <div
                                  className="fixed px-2 py-1 bg-[#475569] text-white text-xs rounded whitespace-pre pointer-events-none min-w-[150px] z-[60]"
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
                                    ? 'bg-emerald-400'
                                    : dayActivities.some(a => a.type === 'workout')
                                      ? 'bg-[#FF6B6B]'
                                      : 'bg-[#CBD5E1]'
                                  : 'bg-[#F1F5F9]';

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
                                <div className="w-3 h-3 rounded-sm bg-[#F1F5F9]" />
                                <span className="text-[#64748B]">None</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-sm bg-[#CBD5E1]" />
                                <span className="text-[#64748B]">Visit</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-sm bg-[#FF6B6B]" />
                                <span className="text-[#64748B]">Workout</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-sm bg-emerald-400" />
                                <span className="text-[#64748B]">Check-in</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Photos Section - v2a styling */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h2 className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider" style={{ fontFamily: "'Space Mono', monospace" }}>Photos</h2>
                          <div className="flex items-center gap-4">
                            {progressPhotos.length >= 2 && (
                              <button
                                onClick={() => openModal('compare')}
                                className="text-sm text-[#FF6B6B] hover:text-[#EF5350] inline-flex items-center gap-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Compare Progress
                              </button>
                            )}
                            <Link
                              href="/check-in"
                              className="text-sm text-[#FF6B6B] hover:text-[#EF5350]"
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
                                className="relative aspect-square rounded-xl overflow-hidden border border-[#F1F5F9] hover:border-[#FF6B6B] transition-colors"
                              >
                                <Image
                                  src={photo.base64Data}
                                  alt="Progress photo"
                                  width={300}
                                  height={300}
                                  className="object-cover"
                                />
                                {(photo.userStats?.bodyFatHigh || photo.userStats?.bodyFatLow) && (
                                  <div className="absolute inset-0 bg-[#0F172A]/80 opacity-0 hover:opacity-100 transition-opacity p-4">
                                    <div className="text-white space-y-2">
                                      <p className="font-medium">
                                        Body Fat: {photo.userStats.bodyFatLow}-{photo.userStats.bodyFatHigh}%
                                      </p>
                                      {photo.userStats.muscleMassDistribution && (
                                        <p className="text-sm text-[#94A3B8]">
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
                            className="border-2 border-dashed border-[#F1F5F9] rounded-lg p-6 text-center transition-colors duration-200 hover:border-[#FF6B6B]/50 hover:bg-[#FFE5E5]/30 cursor-pointer"
                            onClick={() => router.push('/check-in')}
                          >
                            <div className="space-y-3">
                              <div className="flex justify-center">
                                <svg className="w-12 h-12 text-[#94A3B8]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" fill="currentColor"/>
                                  <path d="M9 2L7.17 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4H16.83L15 2H9ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17Z" fill="currentColor"/>
                                </svg>
                              </div>
                              <Link
                                href="/check-in"
                                className="text-lg text-[#FF6B6B] hover:text-[#EF5350] font-medium inline-flex items-center gap-1"
                              >
                                Add Your First Photo →
                              </Link>
                              <p className="text-[#475569]">
                                Drop photos here or click to start a check-in
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Next Workout and Macros - 1/4 width on desktop - v2a styling */}
                  <div className="w-full lg:w-1/4 space-y-6 lg:space-y-8">
                    {currentWorkout?.nextWorkout ? (
                      <div className="space-y-4">
                        <h2 className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider" style={{ fontFamily: "'Space Mono', monospace" }}>Next Workout</h2>
                        <div className="space-y-2">
                          <p className="text-lg font-semibold text-[#0F172A]">
                            Day {currentWorkout.nextWorkout.dayNumber} - {currentWorkout.nextWorkout.name}
                          </p>
                          <p className="text-[#475569]">
                            Focus: {currentWorkout.nextWorkout.focus}
                          </p>
                          <p className="text-[#475569]">
                            {currentWorkout.nextWorkout.exerciseCount} exercises
                          </p>
                        </div>

                        <Link
                          href={`/workout/${currentWorkout.nextWorkout.id}`}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#FF6B6B] text-white font-medium hover:bg-[#EF5350] transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 shadow-lg shadow-[#FF6B6B]/25"
                        >
                          Begin Workout
                          <span className="text-white/70">→</span>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-bold text-[#0F172A] flex items-center gap-2">
                            Program Complete!
                            <span className="text-3xl">🎉</span>
                          </h2>
                          <p className="text-[#475569] mt-2">
                            Great work finishing <span className="font-medium">{program.name}</span>! Choose your next step:
                          </p>
                        </div>

                        {/* Smart Continuation Options - v2a styling */}
                        <div className="grid gap-3">
                          {/* Similar Program */}
                          <Link
                            href="/dashboard/new-program?type=similar"
                            className="group flex items-center gap-4 p-4 rounded-xl border border-[#F1F5F9] hover:border-[#FF6B6B]/50 hover:bg-[#FFE5E5]/30 transition-all"
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#FFE5E5] flex items-center justify-center">
                              <svg className="w-5 h-5 text-[#FF6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-[#0F172A] group-hover:text-[#FF6B6B]">
                                Continue with Similar Program
                              </h3>
                              <p className="text-sm text-[#94A3B8]">
                                Keep the momentum - same style, increased intensity
                              </p>
                            </div>
                            <svg className="w-5 h-5 text-[#94A3B8] group-hover:text-[#FF6B6B] transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>

                          {/* New Focus */}
                          <Link
                            href="/dashboard/new-program?type=new_focus"
                            className="group flex items-center gap-4 p-4 rounded-xl border border-[#F1F5F9] hover:border-[#0F172A]/30 hover:bg-[#F8FAFC] transition-all"
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#F8FAFC] border border-[#F1F5F9] flex items-center justify-center">
                              <svg className="w-5 h-5 text-[#0F172A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-[#0F172A]">
                                Try a New Focus
                              </h3>
                              <p className="text-sm text-[#94A3B8]">
                                Shift goals - strength, cardio, mobility, or hypertrophy
                              </p>
                            </div>
                            <svg className="w-5 h-5 text-[#94A3B8] group-hover:text-[#0F172A] transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>

                          {/* Fresh Start */}
                          <Link
                            href="/hi"
                            className="group flex items-center gap-4 p-4 rounded-xl border border-[#F1F5F9] hover:border-green-300 hover:bg-green-50/50 transition-all"
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-[#0F172A] group-hover:text-green-600">
                                Fresh Start with Full Intake
                              </h3>
                              <p className="text-sm text-[#94A3B8]">
                                Update your profile and get a completely new program
                              </p>
                            </div>
                            <svg className="w-5 h-5 text-[#94A3B8] group-hover:text-green-600 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Daily Macros - visual donut + bars */}
                    {program?.workoutPlans?.[0] && (
                      <MacroDisplay
                        protein={getMacros(program.workoutPlans[0]).protein}
                        carbs={getMacros(program.workoutPlans[0]).carbs}
                        fats={getMacros(program.workoutPlans[0]).fats}
                        calories={getMacros(program.workoutPlans[0]).calories}
                        compact
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Card - v2a styling */}
            <div className="relative overflow-hidden bg-white rounded-2xl border-l-4 border-l-[#94A3B8] border border-[#E2E8F0] shadow-md">
              <div className="p-6 lg:p-8 space-y-6">
                {/* Header with streak */}
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider" style={{ fontFamily: "'Space Mono', monospace" }}>Recent Activity</h2>
                  {workoutStreak > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold">
                      <span>🔥</span>
                      <span>{workoutStreak} day streak</span>
                    </div>
                  )}
                </div>

                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={activity.id}
                        className="group/item p-4 rounded-xl bg-gradient-to-r from-[#F8FAFC] to-white border border-[#E2E8F0] hover:border-[#FF6B6B]/50 hover:shadow-lg transition-all duration-200"
                      >
                        {/* Top row: title + share */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#FF6B6B] text-white text-xs font-bold">
                                {activity.dayNumber}
                              </span>
                              <h3 className="font-semibold text-[#0F172A] truncate">{activity.workoutName}</h3>
                            </div>
                            <p className="text-sm text-[#64748B]">
                              {new Date(activity.completedAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              const shareUrl = `${window.location.origin}/share/workout/${activity.id}`;
                              navigator.clipboard.writeText(shareUrl);
                              setCopiedWorkoutId(activity.id);
                              setTimeout(() => setCopiedWorkoutId(null), 2000);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              copiedWorkoutId === activity.id
                                ? 'bg-green-100 text-green-700'
                                : 'bg-[#FFE5E5] text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white'
                            }`}
                          >
                            {copiedWorkoutId === activity.id ? (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Copied!
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                Share
                              </>
                            )}
                          </button>
                        </div>

                        {/* Stats row */}
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E2E8F0]">
                            <span className="text-[#FF6B6B]">💪</span>
                            <span className="text-sm font-medium text-[#475569]">{activity.exerciseCount} exercises</span>
                          </div>
                          {activity.duration && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E2E8F0]">
                              <span className="text-amber-500">⏱️</span>
                              <span className="text-sm font-medium text-[#475569]">{activity.duration} min</span>
                            </div>
                          )}
                          {activity.totalVolume > 0 && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E2E8F0]">
                              <span className="text-blue-500">🏋️</span>
                              <span className="text-sm font-medium text-[#475569]">{activity.totalVolume.toLocaleString()} lbs</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center">
                      <span className="text-3xl">🏃</span>
                    </div>
                    <div>
                      <p className="text-[#475569] font-medium">No workouts completed yet</p>
                      <p className="text-sm text-[#94A3B8]">Start your first workout above to begin tracking!</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Nutrition Tracking Widget */}
            <NutritionWidget onLogClick={() => openModal('nutrition')} />

            
            <PhotoComparison
              programId={program.id}
              isOpen={isCompareModalOpen}
              onClose={closeModal}
            />

            <NutritionLogModal
              isOpen={isNutritionModalOpen}
              onClose={closeModal}
            />

            {isShareModalOpen && shareData && (
              <ProgramCard
                data={shareData}
                onClose={() => {
                  closeModal();
                  setShareData(null);
                }}
              />
            )}

            {/* Progress Share Modal */}
            {isProgressShareModalOpen && program && (
              <ProgressShareCard
                data={{
                  programId: program.id,
                  weeksCompleted: Math.ceil((programStats?.completedWorkouts || 0) / (program?.workoutPlans?.[0]?.workouts?.length || 1)),
                  totalWorkouts: programStats?.completedWorkouts || 0,
                  weightChange: weightData.startWeight && weightData.currentWeight
                    ? weightData.currentWeight - weightData.startWeight
                    : undefined,
                  startWeight: weightData.startWeight || undefined,
                  currentWeight: weightData.currentWeight || undefined,
                  beforePhotoUrl: progressPhotos.length > 0 ? progressPhotos[progressPhotos.length - 1]?.base64Data : undefined,  // oldest
                  afterPhotoUrl: progressPhotos.length > 1 ? progressPhotos[0]?.base64Data : undefined,  // newest
                  startDate: program?.startDate ? new Date(program.startDate) : new Date(),
                  userName: session?.user?.name || undefined,
                }}
                onClose={closeModal}
              />
            )}

            {/* Upgrade Modal for free tier limitations */}
            <UpgradeModal
              isOpen={showUpgradeModal}
              onClose={() => setShowUpgradeModal(false)}
              context="program_limit"
              currentProgramName={program?.name}
            />
          </div>
        </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <MainLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-6 h-6 border-2 border-[#F1F5F9] border-t-[#FF6B6B] rounded-full animate-spin"></div>
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </MainLayout>
  );
}
