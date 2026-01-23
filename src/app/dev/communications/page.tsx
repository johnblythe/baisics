'use client';

import { useState } from 'react';
import { RecoveryScreen } from '@/components/recovery/RecoveryScreen';
import { FirstWorkoutCelebration } from '@/components/first-workout/FirstWorkoutCelebration';
import { FirstWeekCelebration } from '@/components/first-week/FirstWeekCelebration';
import type { FirstWeekData } from '@/components/first-week/FirstWeekCelebration';
import { MilestoneCelebrationModal } from '@/components/milestones/MilestoneCelebrationModal';
import { ProgramCompletionCelebration } from '@/components/program-completion/ProgramCompletionCelebration';
import { Week2CheckInModal } from '@/components/week2-checkin/Week2CheckInModal';
import { RestDayDashboard } from '@/components/rest-day/RestDayDashboard';
import { StreakCelebration } from '@/components/streak/StreakCelebration';
import { PostWorkoutSummary } from '@/components/post-workout/PostWorkoutSummary';
import type { RecoveryData } from '@/app/api/programs/[programId]/recovery/route';
import type { Week2CheckInData } from '@/app/api/programs/[programId]/week2-checkin/route';
import type { ProgramCompletionData } from '@/app/api/programs/[programId]/completion/route';
import type { RestDayData } from '@/components/rest-day/RestDayDashboard';
import { MilestoneType } from '@prisma/client';

// ============================================================================
// MOCK DATA
// ============================================================================

// Recovery screen only triggers for 5+ day absences now
const MOCK_RECOVERY_5DAYS: RecoveryData = {
  daysSinceLastWorkout: 7,
  recoveryTier: {
    type: 'recovery',
    daysMissed: 7,
    headline: "Ready when you are",
    subheadline: "Your progress is still here.",
    encouragement: "Pick up where you left off, or ease back in with a lighter session.",
  },
  lifetimeStats: {
    totalWorkouts: 6,
    totalVolume: 89000,
    currentStreak: 0,
    longestStreak: 3,
  },
  weeklyProgress: {
    completed: 3,
    target: 4,
  },
  programProgress: {
    name: 'Strength Builder Pro',
    week: 3,
    percentComplete: 25,
  },
  needsRecovery: true,
  nextWorkout: {
    id: 'workout-456',
    name: 'Full Body',
    exerciseCount: 8,
    focus: 'Full Body',
  },
  quickComebackWorkout: {
    id: 'quick-123',
    name: 'Quick Comeback',
    description: 'Get back in the groove with a light full-body session',
    exercises: [
      { name: 'Goblet Squat', sets: 3, reps: 10, originalSets: 4 },
      { name: 'Push-ups', sets: 3, reps: 12, originalSets: 4 },
      { name: 'Dumbbell Row', sets: 3, reps: 10, originalSets: 4 },
    ],
    estimatedMinutes: 20,
  },
};

const MOCK_WEEK2_DATA: Week2CheckInData = {
  shouldShow: true,
  alreadyShown: false,
  completedWorkouts: 7,
  programName: 'Strength Builder Pro',
  originalGoals: {
    trainingGoal: 'muscle_gain',
    daysAvailable: 4,
    experienceLevel: 'beginner',
  },
  programStats: {
    daysPerWeek: 4,
    totalWorkoutsInProgram: 32,
    weekNumber: 2,
  },
};

const MOCK_PROGRAM_COMPLETION: ProgramCompletionData = {
  isComplete: true,
  programId: 'program-123',
  programName: 'Strength Builder Pro',
  totalWorkouts: 24,
  totalVolume: 425000,
  totalSets: 312,
  durationWeeks: 8,
  firstWeekVolume: 42000,
  finalWeekVolume: 68000,
  volumeGrowth: 62,
  startDate: '2025-11-01',
  completionDate: '2025-12-27',
};

const MOCK_REST_DAY: RestDayData = {
  isRestDay: true,
  weeklyProgress: {
    completed: 3,
    target: 4,
    percent: 75,
  },
  lifetimeStats: {
    totalWorkouts: 18,
    totalVolume: 234000,
    currentStreak: 3,
    longestStreak: 7,
  },
  nextWorkout: {
    id: 'workout-789',
    name: 'Leg Day',
    focus: 'Quads & Hamstrings',
    dayOfWeek: 'Thursday',
  },
  recoveryTip: {
    title: 'Sleep is Gains',
    tip: 'Muscle protein synthesis peaks during deep sleep. Aim for 7-9 hours to maximize recovery and growth.',
    source: 'Sports Medicine Journal',
    icon: 'moon',
  },
  programName: 'Hypertrophy Phase 1',
  programWeek: 3,
};

const MOCK_FIRST_WEEK: FirstWeekData = {
  workoutsCompleted: 4,
  targetWorkouts: 4,
  totalVolume: 52000,
  totalSets: 72,
  averageWorkoutMinutes: 45,
  strongestDay: 'Wednesday - Upper Body',
  programName: 'Strength Builder Pro',
};

// Streak celebration mock data for each tier
const MOCK_STREAK_7 = {
  streakDays: 7,
  streakTier: 'week' as const,
};

const MOCK_STREAK_30 = {
  streakDays: 30,
  streakTier: 'month' as const,
};

const MOCK_STREAK_90 = {
  streakDays: 90,
  streakTier: 'quarter' as const,
};

// Post-workout summary mock data
const MOCK_POST_WORKOUT = {
  workoutName: 'Upper Body Push',
  duration: 47,
  setsCompleted: 18,
  totalVolume: 12450,
  exerciseCount: 5,
  prs: [
    { exerciseName: 'Bench Press', type: 'weight' as const, value: 185, unit: 'lbs' },
    { exerciseName: 'Overhead Press', type: 'reps' as const, value: 10 },
  ],
};

// ============================================================================
// COMPONENT CARDS WITH CONTEXT
// ============================================================================

interface ComponentCardProps {
  title: string;
  trigger: string;
  location: string;
  issues?: string[];
  children: React.ReactNode;
  onShow: () => void;
}

function ComponentCard({ title, trigger, location, issues, children, onShow }: ComponentCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h3 className="font-bold text-lg text-gray-900">{title}</h3>
        <div className="mt-2 space-y-1 text-sm">
          <p className="text-gray-600">
            <span className="font-medium text-gray-700">Trigger:</span> {trigger}
          </p>
          <p className="text-gray-600">
            <span className="font-medium text-gray-700">Location:</span> {location}
          </p>
          {issues && issues.length > 0 && (
            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-xs">
              <span className="font-medium">Issues:</span> {issues.join(', ')}
            </div>
          )}
        </div>
      </div>
      <div className="p-4">
        {children}
        <button
          onClick={onShow}
          className="mt-4 w-full px-4 py-2 bg-[#FF6B6B] text-white font-medium rounded-lg hover:bg-[#EF5350] transition-colors"
        >
          Preview Component
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

type ActiveModal =
  | 'recovery-5day'
  | 'first-workout'
  | 'first-week'
  | 'milestone-1'
  | 'milestone-10'
  | 'milestone-25'
  | 'program-completion'
  | 'week2-checkin'
  | 'streak-7'
  | 'streak-30'
  | 'streak-90'
  | 'post-workout'
  | null;

export default function CommunicationsDemo() {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const closeModal = () => setActiveModal(null);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Communications Demo</h1>
          <p className="text-gray-600 mt-2">
            Review all modals, notifications, and email templates. Related to issues #295 and #296.
          </p>
        </div>

        {/* Modals Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-[#FF6B6B] text-white rounded-lg flex items-center justify-center text-sm">1</span>
            Modals &amp; Celebrations
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Recovery - 5+ Days */}
            <ComponentCard
              title="Recovery Screen (5+ Days)"
              trigger="User returns after 5+ days of inactivity"
              location="Dashboard page load"
              onShow={() => setActiveModal('recovery-5day')}
            >
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Tone:</strong> Supportive, no judgment</p>
                <p><strong>Actions:</strong> Full workout, Quick comeback (20 min), Not today</p>
                <p><strong>Extra:</strong> Program adjustment link</p>
                <p className="text-xs text-emerald-600 mt-2">✓ Fixed: No more 1-4 day check-ins</p>
              </div>
            </ComponentCard>

            {/* First Workout */}
            <ComponentCard
              title="First Workout Celebration"
              trigger="User completes their very first workout"
              location="After workout completion redirect"
              onShow={() => setActiveModal('first-workout')}
            >
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Features:</strong> Confetti, badge earned, share options</p>
                <p><strong>Stats:</strong> Sets completed, total volume</p>
                <p><strong>Badge:</strong> WORKOUT_1 milestone</p>
              </div>
            </ComponentCard>

            {/* First Week Complete */}
            <ComponentCard
              title="First Week Complete"
              trigger="User completes all workouts in week 1"
              location="After final week-1 workout completion"
              onShow={() => setActiveModal('first-week')}
            >
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Features:</strong> Week 1 stats, momentum message</p>
                <p><strong>Tone:</strong> Encouraging but grounded - &quot;Week 1 is the hardest&quot;</p>
                <p><strong>CTA:</strong> On to Week 2</p>
                <p className="text-xs text-emerald-600 mt-2">✓ New component - needs approval</p>
              </div>
            </ComponentCard>

            {/* Milestone - 1 (Day One) */}
            <ComponentCard
              title="Milestone: First Workout"
              trigger="User completes 1st workout"
              location="After workout completion"
              onShow={() => setActiveModal('milestone-1')}
            >
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Badge:</strong> WORKOUT_1 - Day One</p>
                <p><strong>Features:</strong> Journey badges, next milestone progress</p>
              </div>
            </ComponentCard>

            {/* Milestone - 10 */}
            <ComponentCard
              title="Milestone: 10 Workouts"
              trigger="User completes 10th workout"
              location="After workout completion"
              onShow={() => setActiveModal('milestone-10')}
            >
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Badge:</strong> WORKOUT_10 - Double Digits</p>
                <p><strong>Features:</strong> Journey badges, share options</p>
              </div>
            </ComponentCard>

            {/* Milestone - 25 */}
            <ComponentCard
              title="Milestone: 25 Workouts"
              trigger="User completes 25th workout"
              location="After workout completion"
              onShow={() => setActiveModal('milestone-25')}
            >
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Badge:</strong> WORKOUT_25 - Quarter Century</p>
                <p><strong>Features:</strong> Journey badges, share options</p>
              </div>
            </ComponentCard>

            {/* Program Completion */}
            <ComponentCard
              title="Program Completion"
              trigger="User completes all workouts in program"
              location="After final workout completion"
              onShow={() => setActiveModal('program-completion')}
            >
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Features:</strong> More confetti, trophy icon, auto-advance timer</p>
                <p><strong>Stats:</strong> Workouts, volume, sets, week 1 vs final week comparison</p>
                <p><strong>CTA:</strong> Start next program</p>
              </div>
            </ComponentCard>

            {/* Week 2 Check-in */}
            <ComponentCard
              title="Week 2 Check-in"
              trigger="User reaches week 2 of program (7+ workouts)"
              location="Dashboard page load"
              onShow={() => setActiveModal('week2-checkin')}
            >
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Options:</strong> Going great, Too hard, Too easy, Life happened</p>
                <p><strong>Shows:</strong> Original goal, workouts completed</p>
                <p><strong>Follow-up:</strong> Adjust difficulty link if too hard</p>
              </div>
            </ComponentCard>

            {/* Streak - 7 Days */}
            <ComponentCard
              title="Streak: 7 Days"
              trigger="User maintains 7-day workout streak"
              location="After workout completion"
              onShow={() => setActiveModal('streak-7')}
            >
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Icon:</strong> Flame (orange/amber gradient)</p>
                <p><strong>Tone:</strong> Acknowledging consistency, not over-the-top</p>
                <p><strong>Actions:</strong> Share, Keep Going</p>
              </div>
            </ComponentCard>

            {/* Streak - 30 Days */}
            <ComponentCard
              title="Streak: 30 Days"
              trigger="User maintains 30-day workout streak"
              location="After workout completion"
              onShow={() => setActiveModal('streak-30')}
            >
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Icon:</strong> Flame (orange/red gradient)</p>
                <p><strong>Tone:</strong> Recognizing habit formation</p>
                <p><strong>Actions:</strong> Share, Keep Going</p>
              </div>
            </ComponentCard>

            {/* Streak - 90 Days */}
            <ComponentCard
              title="Streak: 90 Days"
              trigger="User maintains 90-day workout streak"
              location="After workout completion"
              onShow={() => setActiveModal('streak-90')}
            >
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Icon:</strong> Crown (gold/amber gradient)</p>
                <p><strong>Tone:</strong> Premium achievement, real discipline</p>
                <p><strong>Actions:</strong> Share, Keep Going</p>
              </div>
            </ComponentCard>

            {/* Post-Workout Summary */}
            <ComponentCard
              title="Post-Workout Summary"
              trigger="After every workout completion"
              location="After workout logging redirect"
              onShow={() => setActiveModal('post-workout')}
            >
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Purpose:</strong> Informative recap, not a celebration</p>
                <p><strong>Stats:</strong> Duration, sets, volume, exercises</p>
                <p><strong>PRs:</strong> Shown if any achieved (amber badge per exercise)</p>
                <p><strong>Actions:</strong> View Details, Close</p>
              </div>
            </ComponentCard>
          </div>
        </section>

        {/* Dashboard Components Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-[#0F172A] text-white rounded-lg flex items-center justify-center text-sm">2</span>
            Dashboard Components (Non-Modal)
          </h2>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="mb-4">
              <h3 className="font-bold text-lg text-gray-900">Rest Day Dashboard</h3>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Trigger:</span> User visits dashboard on a scheduled rest day
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Location:</span> Replaces normal dashboard content
              </p>
            </div>

            <div className="max-w-2xl">
              <RestDayDashboard
                data={MOCK_REST_DAY}
                programId="program-123"
                onStartWorkout={() => console.log('Start workout clicked')}
              />
            </div>
          </div>
        </section>

        {/* Planned Components Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center text-sm">+</span>
            Planned Components (To Build)
          </h2>
          <p className="text-gray-600 mb-4">New celebrations and check-ins to implement</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Streak Celebrations */}
            <div className="bg-white rounded-xl border-2 border-dashed border-emerald-300 p-4">
              <h3 className="font-bold text-gray-900">🔥 Streak Celebrations</h3>
              <p className="text-sm text-gray-600 mt-1"><strong>Trigger:</strong> 7 / 30 / 90 day streaks</p>
              <p className="text-sm text-gray-600"><strong>Priority:</strong> HIGH</p>
              <p className="text-sm text-gray-500 mt-2">Acknowledge consistency without being over-the-top</p>
              <span className="inline-block mt-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">New</span>
            </div>

            {/* Post-Workout Summary */}
            <div className="bg-white rounded-xl border-2 border-dashed border-emerald-300 p-4">
              <h3 className="font-bold text-gray-900">📊 Post-Workout Summary</h3>
              <p className="text-sm text-gray-600 mt-1"><strong>Trigger:</strong> After every workout</p>
              <p className="text-sm text-gray-600"><strong>Priority:</strong> HIGH</p>
              <p className="text-sm text-gray-500 mt-2">Light stats recap - not a celebration, just info. Sets, volume, duration.</p>
              <span className="inline-block mt-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">New</span>
            </div>

            {/* Almost Done Nudge */}
            <div className="bg-white rounded-xl border-2 border-dashed border-emerald-300 p-4">
              <h3 className="font-bold text-gray-900">🏁 Almost Done Nudge</h3>
              <p className="text-sm text-gray-600 mt-1"><strong>Trigger:</strong> 85-90% through program</p>
              <p className="text-sm text-gray-600"><strong>Priority:</strong> HIGH</p>
              <p className="text-sm text-gray-500 mt-2">Motivate finish line push - &quot;3 workouts left!&quot;</p>
              <span className="inline-block mt-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">New</span>
            </div>

            {/* PR Callouts */}
            <div className="bg-white rounded-xl border-2 border-dashed border-emerald-300 p-4">
              <h3 className="font-bold text-gray-900">💪 PR / Personal Best</h3>
              <p className="text-sm text-gray-600 mt-1"><strong>Trigger:</strong> User sets new weight/rep PR</p>
              <p className="text-sm text-gray-600"><strong>Priority:</strong> MEDIUM</p>
              <p className="text-sm text-gray-500 mt-2">Inline callout during workout, summary in post-workout</p>
              <span className="inline-block mt-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">New</span>
            </div>

            {/* Week 4/6 Check-in */}
            <div className="bg-white rounded-xl border-2 border-dashed border-emerald-300 p-4">
              <h3 className="font-bold text-gray-900">📋 Week 4/6 Check-in</h3>
              <p className="text-sm text-gray-600 mt-1"><strong>Trigger:</strong> Week 4 (8wk prog) or Week 6 (12wk)</p>
              <p className="text-sm text-gray-600"><strong>Priority:</strong> MEDIUM</p>
              <p className="text-sm text-gray-500 mt-2">Mid-program vibe check like week 2, adjust if needed</p>
              <span className="inline-block mt-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">New</span>
            </div>

            {/* Weekly Email Digest */}
            <div className="bg-white rounded-xl border-2 border-dashed border-emerald-300 p-4">
              <h3 className="font-bold text-gray-900">📧 Weekly Digest Email</h3>
              <p className="text-sm text-gray-600 mt-1"><strong>Trigger:</strong> Monday morning</p>
              <p className="text-sm text-gray-600"><strong>Priority:</strong> MEDIUM</p>
              <p className="text-sm text-gray-500 mt-2">Last week highlights, this week preview, streak status</p>
              <span className="inline-block mt-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">New</span>
            </div>
          </div>
        </section>

        {/* Emails Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-[#8B5CF6] text-white rounded-lg flex items-center justify-center text-sm">3</span>
            Email Templates
          </h2>
          <p className="text-gray-600 mb-4">
            Email templates are in <code className="bg-gray-100 px-1 rounded">/src/lib/email/templates/</code>.
            Full preview available at <a href="/admin/email-templates" className="text-[#FF6B6B] hover:underline">/admin/email-templates</a>
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900">Weekly Summary Email</h3>
              <p className="text-sm text-gray-600 mt-1"><strong>Trigger:</strong> Cron job, weekly on Monday</p>
              <p className="text-sm text-gray-600"><strong>File:</strong> weekly-summary.ts</p>
              <p className="text-sm text-gray-500 mt-2">Shows: Week stats, completion rate, streak, next workout</p>
              <p className="text-xs text-amber-600 mt-2 p-2 bg-amber-50 rounded">Issue #296: Review design and messaging</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900">Workout Reminder Email</h3>
              <p className="text-sm text-gray-600 mt-1"><strong>Trigger:</strong> Cron job, daily for users with pending workouts</p>
              <p className="text-sm text-gray-600"><strong>File:</strong> workout-reminder.ts</p>
              <p className="text-sm text-gray-500 mt-2">Shows: Workout name, streak badge, motivational message</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900">Program Completion Email</h3>
              <p className="text-sm text-gray-600 mt-1"><strong>Trigger:</strong> When user finishes all program workouts</p>
              <p className="text-sm text-gray-600"><strong>File:</strong> program-completion.ts</p>
              <p className="text-sm text-gray-500 mt-2">Shows: Program stats, volume growth, celebration</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900">Welcome Emails</h3>
              <p className="text-sm text-gray-600 mt-1"><strong>Trigger:</strong> After signup (free or premium)</p>
              <p className="text-sm text-gray-600"><strong>File:</strong> welcome.ts</p>
              <p className="text-sm text-gray-500 mt-2">Two variants: Free tier, Premium tier</p>
            </div>
          </div>
        </section>

        {/* Issues Summary */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center text-sm">!</span>
            Known Issues
          </h2>

          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="font-bold text-gray-900">#295: Recovery Modal Issues</h3>
              <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
                <li className="line-through text-gray-400">1-day recovery screen removed - too aggressive</li>
                <li className="line-through text-gray-400">Threshold bumped from 3 days to 5 days</li>
                <li className="line-through text-gray-400">Quote marks removed from encouragement</li>
                <li className="line-through text-gray-400">Cheesy quotes replaced with supportive messaging</li>
                <li>Wrong stats: Shows 6 workouts when user has done 4 (needs API fix)</li>
                <li>Wrong program %: Shows 50% when user is at ~15% (needs API fix)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-900">#296: Email Issues</h3>
              <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>Weird trigger logic</li>
                <li>Weird statement (says completed incorrectly)</li>
                <li>Questionable stats</li>
                <li>Design needs polish</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* ========== MODAL RENDERS ========== */}

      {activeModal === 'recovery-5day' && (
        <RecoveryScreen
          data={MOCK_RECOVERY_5DAYS}
          programId="program-123"
          onDismiss={closeModal}
          onSelectOption={(option) => {
            console.log('Selected:', option);
            closeModal();
          }}
        />
      )}

      {activeModal === 'first-workout' && (
        <FirstWorkoutCelebration
          setsCompleted={18}
          totalVolume={12500}
          workoutName="Full Body A"
          userName="Demo User"
          onClose={closeModal}
          onShare={() => console.log('Share clicked')}
        />
      )}

      {activeModal === 'first-week' && (
        <FirstWeekCelebration
          data={MOCK_FIRST_WEEK}
          userName="Demo User"
          onClose={closeModal}
          onContinue={() => {
            console.log('Continue to Week 2');
            closeModal();
          }}
        />
      )}

      {activeModal === 'milestone-1' && (
        <MilestoneCelebrationModal
          type={MilestoneType.WORKOUT_1}
          totalWorkouts={1}
          totalVolume={8500}
          earnedMilestones={[
            { type: MilestoneType.WORKOUT_1, earnedAt: new Date() },
          ]}
          userName="Demo User"
          onClose={closeModal}
          onShare={() => console.log('Share clicked')}
        />
      )}

      {activeModal === 'milestone-10' && (
        <MilestoneCelebrationModal
          type={MilestoneType.WORKOUT_10}
          totalWorkouts={10}
          totalVolume={95000}
          earnedMilestones={[
            { type: MilestoneType.WORKOUT_1, earnedAt: new Date() },
            { type: MilestoneType.WORKOUT_10, earnedAt: new Date() },
          ]}
          userName="Demo User"
          onClose={closeModal}
          onShare={() => console.log('Share clicked')}
        />
      )}

      {activeModal === 'milestone-25' && (
        <MilestoneCelebrationModal
          type={MilestoneType.WORKOUT_25}
          totalWorkouts={25}
          totalVolume={245000}
          earnedMilestones={[
            { type: MilestoneType.WORKOUT_1, earnedAt: new Date() },
            { type: MilestoneType.WORKOUT_10, earnedAt: new Date() },
            { type: MilestoneType.WORKOUT_25, earnedAt: new Date() },
          ]}
          userName="Demo User"
          onClose={closeModal}
          onShare={() => console.log('Share clicked')}
        />
      )}

      {activeModal === 'program-completion' && (
        <ProgramCompletionCelebration
          data={MOCK_PROGRAM_COMPLETION}
          onClose={closeModal}
          onNextProgram={() => {
            console.log('Next program clicked');
            closeModal();
          }}
        />
      )}

      {activeModal === 'week2-checkin' && (
        <Week2CheckInModal
          data={MOCK_WEEK2_DATA}
          programId="program-123"
          onComplete={(option) => {
            console.log('Check-in complete:', option);
            closeModal();
          }}
          onDismiss={closeModal}
        />
      )}

      {activeModal === 'streak-7' && (
        <StreakCelebration
          streakDays={MOCK_STREAK_7.streakDays}
          streakTier={MOCK_STREAK_7.streakTier}
          userName="Demo User"
          onClose={closeModal}
          onShare={() => console.log('Share 7-day streak clicked')}
        />
      )}

      {activeModal === 'streak-30' && (
        <StreakCelebration
          streakDays={MOCK_STREAK_30.streakDays}
          streakTier={MOCK_STREAK_30.streakTier}
          userName="Demo User"
          onClose={closeModal}
          onShare={() => console.log('Share 30-day streak clicked')}
        />
      )}

      {activeModal === 'streak-90' && (
        <StreakCelebration
          streakDays={MOCK_STREAK_90.streakDays}
          streakTier={MOCK_STREAK_90.streakTier}
          userName="Demo User"
          onClose={closeModal}
          onShare={() => console.log('Share 90-day streak clicked')}
        />
      )}

      {activeModal === 'post-workout' && (
        <PostWorkoutSummary
          workoutName={MOCK_POST_WORKOUT.workoutName}
          duration={MOCK_POST_WORKOUT.duration}
          setsCompleted={MOCK_POST_WORKOUT.setsCompleted}
          totalVolume={MOCK_POST_WORKOUT.totalVolume}
          exerciseCount={MOCK_POST_WORKOUT.exerciseCount}
          prs={MOCK_POST_WORKOUT.prs}
          onClose={closeModal}
          onViewDetails={() => console.log('View details clicked')}
        />
      )}
    </div>
  );
}
