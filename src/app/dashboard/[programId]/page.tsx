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
import type { RestDayData } from '@/components/rest-day';
import { CompletionRing, WeeklyDayIndicators, WeeklyDayLegend } from '@/components/weekly-progress';
import type { DayInfo } from '@/components/weekly-progress';
import { RecoveryScreen } from '@/components/recovery';
import type { RecoveryData } from '@/app/api/programs/[programId]/recovery/route';
import { Week2CheckInModal } from '@/components/week2-checkin';
import type { Week2CheckInData } from '@/app/api/programs/[programId]/week2-checkin/route';
import { FirstWorkoutCelebration } from '@/components/first-workout';

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
  const [restDayData, setRestDayData] = useState<RestDayData | null>(null);
  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null);
  const [showRecoveryScreen, setShowRecoveryScreen] = useState(false);
  const [week2CheckInData, setWeek2CheckInData] = useState<Week2CheckInData | null>(null);
  const [showWeek2CheckIn, setShowWeek2CheckIn] = useState(false);
  // First workout celebration (redirected from workout completion)
  const [showFirstWorkoutCelebration, setShowFirstWorkoutCelebration] = useState(false);
  const [firstWorkoutStats, setFirstWorkoutStats] = useState<{
    setsCompleted: number;
    totalVolume: number;
    workoutName: string;
  } | null>(null);

  useEffect(() => {
    const disclaimerAcknowledged = localStorage.getItem('disclaimer-acknowledged');
    setShowDisclaimer(!disclaimerAcknowledged);
  }, []);

  // Check for first workout celebration data from workout completion redirect
  // Also check for debug state to allow testing without completing a workout
  useEffect(() => {
    const celebrationData = localStorage.getItem('baisics_first_workout_celebration');
    if (celebrationData) {
      try {
        const data = JSON.parse(celebrationData);
        // Validate required fields
        if (typeof data.setsCompleted !== 'number' || typeof data.totalVolume !== 'number') {
          throw new Error('Invalid celebration data structure');
        }
        setFirstWorkoutStats(data);
        setShowFirstWorkoutCelebration(true);
      } catch (e) {
        console.error('Failed to parse first workout celebration data:', e);
        localStorage.removeItem('baisics_first_workout_celebration');
        // Still show celebration with fallback - user deserves recognition
        setFirstWorkoutStats({ setsCompleted: 0, totalVolume: 0, workoutName: 'Your First Workout' });
        setShowFirstWorkoutCelebration(true);
      }
    } else if (process.env.NODE_ENV === 'development') {
      // Check for debug state - allows testing celebration without completing workout
      const debugCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('baisics_debug_state='));
      if (debugCookie?.split('=')[1] === 'first_workout_complete') {
        setFirstWorkoutStats({
          setsCompleted: 12,
          totalVolume: 8500,
          workoutName: 'Debug Test Workout',
        });
        setShowFirstWorkoutCelebration(true);
      }
    }
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
      const programId = window.location.pathname.split('/').pop();
      if (!programId) return;

      // Use Promise.allSettled so one failing endpoint doesn't break the whole dashboard
      const results = await Promise.allSettled([
        fetch(`/api/programs/${programId}/overview`).then(r => r.json()) as Promise<ProgramOverview>,
        fetch(`/api/programs/${programId}/stats`).then(r => r.json()) as Promise<ProgramStats>,
        fetch(`/api/programs/${programId}/weight-tracking`).then(r => r.json()) as Promise<WeightData>,
        fetch(`/api/programs/${programId}/progress-photos`).then(r => r.json()) as Promise<ProgressPhoto[]>,
        fetch(`/api/programs/${programId}/recent-activity`).then(r => r.json()) as Promise<{ workouts: RecentActivity[]; streak: number }>,
        fetch(`/api/programs/${programId}/current-workout`).then(r => r.json()) as Promise<CurrentWorkout>,
        fetch(`/api/programs/${programId}/activity`).then(r => r.json()) as Promise<Activity[]>,
        fetch(`/api/programs/${programId}/rest-day`).then(r => r.json()) as Promise<RestDayData>,
        fetch(`/api/programs/${programId}/recovery`).then(r => r.json()) as Promise<RecoveryData>,
        fetch(`/api/programs/${programId}/week2-checkin`).then(r => r.json()) as Promise<Week2CheckInData>
      ]);

      const [overviewResult, statsResult, weightResult, photosResult, activityResult, workoutResult, activitiesResult, restDayResult, recoveryResult, week2Result] = results;

      // Overview is critical - if it fails, we can't show the dashboard
      if (overviewResult.status === 'rejected') {
        console.error('Critical: Failed to load program overview', overviewResult.reason);
        setIsLoading(false);
        return;
      }
      setProgram(overviewResult.value);

      // Non-critical data - use defaults if failed
      if (statsResult.status === 'fulfilled') {
        setProgramStats(statsResult.value);
      } else {
        console.warn('Failed to load stats:', statsResult.reason);
      }

      if (weightResult.status === 'fulfilled') {
        setWeightData(weightResult.value);
      } else {
        console.warn('Failed to load weight data:', weightResult.reason);
      }

      if (photosResult.status === 'fulfilled') {
        setProgressPhotos(photosResult.value || []);
      } else {
        console.warn('Failed to load progress photos:', photosResult.reason);
      }

      if (activityResult.status === 'fulfilled') {
        setRecentActivity(activityResult.value.workouts || []);
        setWorkoutStreak(activityResult.value.streak || 0);
      } else {
        console.warn('Failed to load recent activity:', activityResult.reason);
      }

      if (workoutResult.status === 'fulfilled') {
        setCurrentWorkout(workoutResult.value);
      } else {
        console.warn('Failed to load current workout:', workoutResult.reason);
      }

      if (activitiesResult.status === 'fulfilled') {
        setActivities(activitiesResult.value);
      } else {
        console.warn('Failed to load activities:', activitiesResult.reason);
      }

      const restDay = restDayResult.status === 'fulfilled' ? restDayResult.value : null;
      const recovery = recoveryResult.status === 'fulfilled' ? recoveryResult.value : null;
      const week2CheckIn = week2Result.status === 'fulfilled' ? week2Result.value : null;

      setRestDayData(restDay);
      setRecoveryData(recovery);
      setWeek2CheckInData(week2CheckIn);

      // Show recovery screen if needed and not already dismissed this session
      if (recovery?.needsRecovery) {
        const recoveryDismissedKey = `recovery-dismissed-${programId}`;
        const lastDismissed = sessionStorage.getItem(recoveryDismissedKey);
        if (!lastDismissed) {
          setShowRecoveryScreen(true);
        }
      }

      // Show Week 2 check-in if needed and not showing recovery screen
      if (week2CheckIn?.shouldShow && !recovery?.needsRecovery) {
        const week2DismissedKey = `week2-checkin-dismissed-${programId}`;
        const lastDismissed = sessionStorage.getItem(week2DismissedKey);
        if (!lastDismissed) {
          setShowWeek2CheckIn(true);
        }
      }

      setIsLoading(false);
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

  // Handle recovery screen dismiss
  const handleRecoveryDismiss = useCallback(() => {
    if (program?.id) {
      sessionStorage.setItem(`recovery-dismissed-${program.id}`, 'true');
    }
    setShowRecoveryScreen(false);
  }, [program?.id]);

  // Handle recovery option selection (for analytics)
  const handleRecoveryOptionSelect = useCallback(async (option: 'full' | 'quick' | 'not_today') => {
    // Track the recovery option selection
    if (program?.id) {
      try {
        await fetch('/api/analytics/recovery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            programId: program.id,
            action: 'option_selected',
            option,
            daysMissed: recoveryData?.daysSinceLastWorkout || 0,
          }),
        });
      } catch (error) {
        // Log error but continue - analytics shouldn't block user flow
        console.error('Failed to track recovery option:', error);
      }
    }
    handleRecoveryDismiss();
  }, [program?.id, recoveryData?.daysSinceLastWorkout, handleRecoveryDismiss]);

  // Handle Week 2 check-in dismiss (ask me later)
  const handleWeek2CheckInDismiss = useCallback(() => {
    if (program?.id) {
      sessionStorage.setItem(`week2-checkin-dismissed-${program.id}`, 'true');
    }
    setShowWeek2CheckIn(false);
  }, [program?.id]);

  // Handle Week 2 check-in complete
  const handleWeek2CheckInComplete = useCallback((option: string) => {
    setShowWeek2CheckIn(false);
    // No need to set session storage here since the API already marked it as shown
  }, []);

  // Handle first workout celebration close
  const handleFirstWorkoutCelebrationClose = useCallback(() => {
    localStorage.removeItem('baisics_first_workout_celebration');
    setShowFirstWorkoutCelebration(false);
    setFirstWorkoutStats(null);
  }, []);

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

  // Calculate weekly progress percentage
  const weeklyCompleted = restDayData?.weeklyProgress?.completed || 0;
  const weeklyTarget = restDayData?.weeklyProgress?.target || 3;
  const weeklyPercent = Math.round((weeklyCompleted / weeklyTarget) * 100);

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

      {/* Recovery Screen - shown when user returns after missing workouts */}
      {showRecoveryScreen && recoveryData?.needsRecovery && program?.id && (
        <RecoveryScreen
          data={recoveryData}
          programId={program.id}
          onDismiss={handleRecoveryDismiss}
          onSelectOption={handleRecoveryOptionSelect}
        />
      )}

      {/* Week 2 Check-in Modal - shown once per program around workouts 5-8 */}
      {showWeek2CheckIn && week2CheckInData?.shouldShow && program?.id && (
        <Week2CheckInModal
          data={week2CheckInData}
          programId={program.id}
          onComplete={handleWeek2CheckInComplete}
          onDismiss={handleWeek2CheckInDismiss}
        />
      )}

      {/* First Workout Celebration - shown after completing first workout */}
      {showFirstWorkoutCelebration && firstWorkoutStats && (
        <FirstWorkoutCelebration
          setsCompleted={firstWorkoutStats.setsCompleted}
          totalVolume={firstWorkoutStats.totalVolume}
          workoutName={firstWorkoutStats.workoutName}
          onClose={handleFirstWorkoutCelebrationClose}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome banner for claim flow users */}
        {welcomeData?.show && program?.id && (
          <ClaimWelcomeBanner
            reason={welcomeData.reason}
            source={welcomeData.source}
            programName={program?.name}
            programId={program.id}
          />
        )}

        {/* Coach Branding - Compact version */}
        {coach && (
          <div className="mb-4 flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-[#E2E8F0]" style={{ borderLeftColor: coach.brandColor, borderLeftWidth: '3px' }}>
            {coach.brandLogo ? (
              <img src={coach.brandLogo} alt={coach.name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: coach.brandColor }}>
                {coach.name.trim().split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
              </div>
            )}
            <span className="text-sm text-[#475569]">Coach: <span className="font-medium text-[#0F172A]">{coach.name}</span></span>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            COMMAND CENTER HEADER
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          {/* Program Name */}
          <div>
            {program && allPrograms.length > 0 ? (
              <ProgramSelector
                currentProgram={{ id: program.id, name: program.name, createdAt: program.startDate }}
                programs={allPrograms.map(p => ({ id: p.id, name: p.name, createdAt: p.createdAt! }))}
                isPremium={isPremium}
              />
            ) : (
              <h1 className="text-2xl font-bold text-[#0F172A]">{program.name}</h1>
            )}
            {program.description && (
              <p className="text-sm text-[#64748B] mt-1 max-w-xl">{program.description}</p>
            )}
          </div>

          {/* Week Days + Week Number */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {restDayData?.weeklyProgress?.days?.map((d, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all
                    ${d.status === 'completed' ? 'bg-[#FF6B6B] border-[#FF6B6B] text-white' :
                      d.isToday ? 'border-[#FF6B6B] text-[#FF6B6B] bg-white' :
                      'border-gray-200 bg-white text-gray-400'}`}
                >
                  {d.status === 'completed' ? '✓' : d.dayName?.charAt(0) || ['S','M','T','W','T','F','S'][i]}
                </div>
              )) || ['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 border-gray-200 bg-white text-gray-400">{d}</div>
              ))}
            </div>
            <span className="text-sm text-[#64748B]">Week {Math.ceil((programStats?.completedWorkouts || 0) / 3) + 1}</span>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            COMMAND CENTER - 3 COLUMN GRID (always shown, with rest day variation)
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-12 gap-4 mb-4">
            {/* ─────────────────────────────────────────────────────────────────
                LEFT COLUMN: Today's Workout (or Rest Day)
            ───────────────────────────────────────────────────────────────── */}
            <div className={`col-span-12 lg:col-span-4 bg-white rounded-2xl border p-6 ${restDayData?.isRestDay ? 'border-emerald-200 bg-gradient-to-b from-emerald-50/50 to-white' : 'border-[#E2E8F0]'}`}>
              <div className={`text-xs font-medium uppercase tracking-wider mb-3 ${restDayData?.isRestDay ? 'text-emerald-600' : 'text-[#FF6B6B]'}`} style={{ fontFamily: "'Space Mono', monospace" }}>
                {restDayData?.isRestDay ? 'Rest Day' : "Today's Workout"}
              </div>

              {restDayData?.isRestDay ? (
                /* ─── REST DAY VARIATION ─── */
                <>
                  <div className="text-xl font-bold text-[#0F172A] mb-1">
                    Time to recover 💪
                  </div>
                  <p className="text-[#64748B] text-sm mb-4">
                    {weeklyCompleted >= weeklyTarget
                      ? "You've hit your weekly target! Your muscles grow during rest."
                      : "You worked out today. Recovery is when gains happen."}
                  </p>

                  {/* Recovery Tip */}
                  {restDayData.recoveryTip && (
                    <div className="bg-emerald-50 rounded-xl p-4 mb-4">
                      <div className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-1" style={{ fontFamily: "'Space Mono', monospace" }}>
                        Recovery Tip
                      </div>
                      <div className="font-medium text-[#0F172A] text-sm mb-1">{restDayData.recoveryTip.title}</div>
                      <p className="text-[#64748B] text-xs">{restDayData.recoveryTip.tip}</p>
                    </div>
                  )}

                  {/* Train Anyway Option */}
                  {selectedWorkout && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-[#64748B] mb-2">Feeling energized?</p>
                      <Link
                        href={`/workout/${selectedWorkoutId}`}
                        className="w-full border border-[#E2E8F0] hover:border-[#FF6B6B] text-[#0F172A] hover:text-[#FF6B6B] font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        Train anyway: {selectedWorkout.name}
                      </Link>
                    </div>
                  )}
                </>
              ) : currentWorkout?.nextWorkout && selectedWorkout ? (
                /* ─── REGULAR WORKOUT DAY ─── */
                <>
                  {/* Workout Selector */}
                  <div className="relative" ref={workoutSelectorRef}>
                    <button
                      onClick={() => setIsWorkoutSelectorOpen(!isWorkoutSelectorOpen)}
                      className="inline-flex items-center gap-2 group text-xl font-bold text-[#0F172A] hover:text-[#FF6B6B] transition-colors"
                    >
                      Day {selectedWorkout.dayNumber}: {selectedWorkout.name}
                      <svg className={`w-4 h-4 text-[#94A3B8] group-hover:text-[#FF6B6B] transition-transform ${isWorkoutSelectorOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isWorkoutSelectorOpen && currentWorkout.allWorkouts && (
                      <div className="absolute z-[60] w-full min-w-[280px] mt-2 bg-white rounded-xl shadow-lg border border-[#E2E8F0] py-1 overflow-hidden">
                        {currentWorkout.allWorkouts.map((workout) => (
                          <button
                            key={workout.id}
                            onClick={() => { setSelectedWorkoutId(workout.id); setIsWorkoutSelectorOpen(false); }}
                            className={`w-full text-left px-4 py-3 transition-colors ${workout.id === selectedWorkoutId ? 'bg-[#F8FAFC]' : ''} hover:bg-[#F8FAFC]`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-[#0F172A]">Day {workout.dayNumber}: {workout.name}</span>
                              {workout.id === currentWorkout.nextWorkout.id && (
                                <span className="text-xs bg-[#FFE5E5] text-[#FF6B6B] px-2 py-0.5 rounded-full">Next</span>
                              )}
                            </div>
                            <span className="text-sm text-[#64748B]">{workout.focus} • {workout.exerciseCount} exercises</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="text-[#64748B] text-sm mt-1 mb-4">{selectedWorkout.focus}</p>

                  {/* Stats */}
                  <div className="flex gap-3 mb-6">
                    <div className="bg-gray-50 rounded-lg px-4 py-2 text-center">
                      <div className="text-lg font-bold text-[#0F172A]">{selectedWorkout.exerciseCount}</div>
                      <div className="text-xs text-gray-500">exercises</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-4 py-2 text-center">
                      <div className="text-lg font-bold text-[#0F172A]">~45 min</div>
                      <div className="text-xs text-gray-500">estimated</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <Link
                    href={`/workout/${selectedWorkoutId}`}
                    className="w-full bg-[#FF6B6B] hover:bg-[#EF5350] text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Start Workout
                  </Link>
                  <p className="text-center text-sm text-[#94A3B8] mt-2">
                    or{' '}
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/workout-logs/quick-log', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ workoutId: selectedWorkoutId }),
                          });
                          if (!response.ok) {
                            throw new Error(`HTTP ${response.status}`);
                          }
                          router.refresh();
                        } catch (err) {
                          console.error('Quick log failed:', err);
                          alert('Failed to mark workout complete. Please try again.');
                        }
                      }}
                      className="text-[#FF6B6B] hover:underline"
                    >
                      mark complete without tracking
                    </button>
                    {' →'}
                  </p>
                </>
              ) : (
                /* ─── PROGRAM COMPLETE ─── */
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="font-semibold text-[#0F172A]">Program Complete!</p>
                  <Link href="/hi" className="text-[#FF6B6B] text-sm hover:underline mt-2 inline-block">Start a new program →</Link>
                </div>
              )}
            </div>

            {/* ─────────────────────────────────────────────────────────────────
                MIDDLE COLUMN: Weekly Progress (Tightened)
            ───────────────────────────────────────────────────────────────── */}
            <div className="col-span-12 lg:col-span-5 bg-white rounded-2xl border border-[#E2E8F0] p-5">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2" style={{ fontFamily: "'Space Mono', monospace" }}>
                Weekly Progress
              </div>

              <div className="flex items-center gap-4">
                {/* Progress Ring - Smaller */}
                <div className="flex-shrink-0">
                  <CompletionRing
                    completed={weeklyCompleted}
                    target={weeklyTarget}
                    size="md"
                    showLabel={false}
                  />
                </div>

                {/* Breakdown - Compact */}
                <div className="flex-1">
                  {/* Weekly % Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#64748B]">This week</span>
                      <span className="font-semibold text-[#0F172A]">{weeklyPercent}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FF6B6B] rounded-full transition-all" style={{ width: `${Math.min(weeklyPercent, 100)}%` }} />
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex gap-2">
                    <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-base font-bold text-[#0F172A]">{weeklyCompleted}/{weeklyTarget}</div>
                      <div className="text-[10px] text-gray-500">workouts</div>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-base font-bold text-[#0F172A] flex items-center justify-center gap-0.5">
                        {streak.current} <span className="text-orange-500 text-sm">🔥</span>
                      </div>
                      <div className="text-[10px] text-gray-500">day streak</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────────
                RIGHT COLUMN: Quick Log
            ───────────────────────────────────────────────────────────────── */}
            <div className="col-span-12 lg:col-span-3 bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3" style={{ fontFamily: "'Space Mono', monospace" }}>
                Quick Log
              </div>

              <div className="space-y-2">
                {selectedWorkoutId && (
                  <Link
                    href={`/workout/${selectedWorkoutId}`}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-[#FF6B6B] transition-colors text-left group"
                  >
                    <span className="text-lg">🏋️</span>
                    <div>
                      <div className="font-medium text-sm text-[#0F172A] group-hover:text-white">Start workout</div>
                      <div className="text-xs text-gray-500 group-hover:text-white/80">{selectedWorkout?.name || 'Begin tracking'}</div>
                    </div>
                  </Link>
                )}
                <button
                  onClick={() => openModal('nutrition')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-[#FF6B6B] transition-colors text-left group"
                >
                  <span className="text-lg">🍎</span>
                  <div>
                    <div className="font-medium text-sm text-[#0F172A] group-hover:text-white">Log food</div>
                    <div className="text-xs text-gray-500 group-hover:text-white/80">Track nutrition</div>
                  </div>
                </button>
                <Link
                  href="/check-in"
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-[#FF6B6B] transition-colors text-left group"
                >
                  <span className="text-lg">⚖️</span>
                  <div>
                    <div className="font-medium text-sm text-[#0F172A] group-hover:text-white">Log weight</div>
                    <div className="text-xs text-gray-500 group-hover:text-white/80">{weightData.currentWeight ? `${weightData.currentWeight} lbs` : 'Not logged'}</div>
                  </div>
                </Link>
                <Link
                  href="/check-in"
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-[#FF6B6B] transition-colors text-left group"
                >
                  <span className="text-lg">📷</span>
                  <div>
                    <div className="font-medium text-sm text-[#0F172A] group-hover:text-white">Add photo</div>
                    <div className="text-xs text-gray-500 group-hover:text-white/80">Track progress</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

        {/* ═══════════════════════════════════════════════════════════════════
            COMMAND CENTER - HELPER LINKS ROW (between top and bottom)
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-3 mb-4">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <button onClick={handleDownloadPDF} className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#FF6B6B] transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M7 18H17V16H7V18Z" fill="currentColor"/><path d="M17 14H7V12H17V14Z" fill="currentColor"/><path d="M7 10H11V8H7V10Z" fill="currentColor"/><path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" fill="currentColor"/></svg>
              Download PDF
            </button>
            <button onClick={() => openModal('progress-share')} className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#FF6B6B] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              Share Progress
            </button>
            <Link href="/hi" className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#FF6B6B] transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 6V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              New Program
            </Link>
            <Link href="#" onClick={(e) => { e.preventDefault(); openModal('upload'); }} className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#FF6B6B] transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 16V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M7 9L12 4L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 16V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Upload
            </Link>
            <button onClick={handleAskForHelp} className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#FF6B6B] transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/><path d="M9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9C15 10.6569 13.6569 12 12 12V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg>
              Help
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            COMMAND CENTER - BOTTOM ROW (Activity Grid + Recent Activity)
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          {/* ─────────────────────────────────────────────────────────────────
              LEFT: Activity Grid (4 weeks) + Stats
          ───────────────────────────────────────────────────────────────── */}
          <div className="col-span-12 lg:col-span-6 bg-white rounded-2xl border border-[#E2E8F0] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: "'Space Mono', monospace" }}>
                Last 4 Weeks
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#94A3B8]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#FF6B6B]" />Workout</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-400" />Check-in</span>
              </div>
            </div>

            {/* Grid + Stats side by side */}
            <div className="flex gap-3">
              {/* Activity Grid - 4 weeks, 7 columns, larger squares */}
              <div className="grid grid-cols-7 gap-1.5 flex-1">
                {/* Day labels */}
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-[10px] text-center text-[#94A3B8]">{day}</div>
                ))}
                {/* Tooltip */}
                {tooltipContent && (
                  <div
                    className="fixed px-2 py-1 bg-[#475569] text-white text-xs rounded whitespace-pre pointer-events-none min-w-[120px] z-[60]"
                    style={{ left: tooltipContent.x, top: tooltipContent.y - 10, transform: 'translateX(-50%)' }}
                  >
                    {tooltipContent.content}
                  </div>
                )}
                {/* Grid squares - 28 days (4 weeks) */}
                {Array.from({ length: 28 }).map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (27 - i));
                  const dateStr = date.toISOString().split('T')[0];
                  const dayActivities = activities?.filter(a => a.date.startsWith(dateStr)) || [];
                  const isToday = i === 27;
                  const classes = dayActivities.length > 0
                    ? dayActivities.some(a => a.type === 'check-in') ? 'bg-emerald-400'
                    : dayActivities.some(a => a.type === 'workout') ? 'bg-[#FF6B6B]'
                    : 'bg-[#CBD5E1]'
                    : 'bg-gray-100';

                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-md ${classes} ${isToday ? 'ring-2 ring-[#FF6B6B] ring-offset-1' : ''} hover:scale-105 cursor-help transition-transform`}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltipContent({
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                          content: (
                            <>
                              {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              {isToday && ' (Today)'}
                              {dayActivities.length > 0 ? (
                                dayActivities.map((activity, idx) => (
                                  <div key={idx} className="mt-1 text-gray-200">
                                    {activity.type === 'check-in' && '✓ Check-in'}
                                    {activity.type === 'workout' && '💪 Workout'}
                                    {activity.type === 'visit' && 'Visit'}
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

              {/* Stats - compact right column */}
              <div className="flex-shrink-0 w-20 flex flex-col justify-center items-center text-center border-l border-gray-100 pl-3">
                <div className="text-xl font-bold text-[#0F172A] flex items-center gap-0.5">
                  {streak.current > 0 ? streak.current : '0'}
                  <span className="text-base">🔥</span>
                </div>
                <div className="text-[10px] text-[#64748B] mb-2">streak</div>
                <div className="text-sm font-bold text-[#0F172A]">{restDayData?.lifetimeStats?.totalWorkouts || programStats?.completedWorkouts || 0}</div>
                <div className="text-[10px] text-[#94A3B8]">workouts</div>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────────
              RIGHT: Recent Activity
          ───────────────────────────────────────────────────────────────── */}
          <div className="col-span-12 lg:col-span-6 bg-white rounded-2xl border border-[#E2E8F0] p-4 self-start">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2" style={{ fontFamily: "'Space Mono', monospace" }}>
              Recent Activity
            </div>

            {recentActivity.length > 0 ? (
              <div className="space-y-1.5">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-[#FFE5E5]/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-[#FF6B6B]/10 text-[#FF6B6B] flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {activity.dayNumber}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-xs text-[#0F172A] truncate">{activity.workoutName}</div>
                        <div className="text-[10px] text-[#64748B]">
                          {new Date(activity.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <span className="text-2xl mb-2">🏃</span>
                <p className="text-xs text-[#94A3B8]">No workouts yet</p>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            MODALS
        ═══════════════════════════════════════════════════════════════════ */}
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
              beforePhotoUrl: progressPhotos.length > 0 ? progressPhotos[progressPhotos.length - 1]?.base64Data : undefined,
              afterPhotoUrl: progressPhotos.length > 1 ? progressPhotos[0]?.base64Data : undefined,
              startDate: program?.startDate ? new Date(program.startDate) : new Date(),
              userName: session?.user?.name || undefined,
            }}
            onClose={closeModal}
          />
        )}

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          context="program_limit"
          currentProgramName={program?.name}
        />
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
