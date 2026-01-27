'use client';

import { Program } from '@/types';
import { UpsellModal } from './UpsellModal';
import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { User } from '@prisma/client';
import { getUser } from '@/lib/actions/user';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { motion, AnimatePresence } from 'framer-motion';
import { generateWorkoutPDF } from '@/utils/pdf';
import { getMacros } from '@/utils/formatting';
import { WorkoutPlan } from '@/types/program';
import { MacroDisplay } from '@/components/MacroDisplay';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import { ExerciseSwapModal } from '@/components/ExerciseSwapModal';

interface ProgramDisplayProps {
  program: Program;
  userEmail?: string | null;
  onRequestUpsell: () => void;
  isUpsellOpen?: boolean;
  onCloseUpsell?: () => void;
}

export interface ProgramDisplayRef {
  generateWorkoutPDF: (programId: string) => Promise<void>;
}

function getCategoryFromExercise(exercise: any): string {
  if (exercise.category) return exercise.category;
  // Infer from name if no category
  const name = exercise.name?.toLowerCase() || '';
  if (name.includes('squat') || name.includes('deadlift') || name.includes('bench') || name.includes('press') || name.includes('row')) {
    return 'primary';
  }
  if (name.includes('curl') || name.includes('extension') || name.includes('raise') || name.includes('fly')) {
    return 'isolation';
  }
  if (name.includes('run') || name.includes('cardio') || name.includes('bike') || name.includes('jump')) {
    return 'cardio';
  }
  if (name.includes('stretch') || name.includes('yoga') || name.includes('mobility')) {
    return 'flexibility';
  }
  return 'secondary';
}

// Workout Day Card Component
function WorkoutDayCard({ workout, index, defaultOpen = false, onSwapExercise }: { workout: any; index: number; defaultOpen?: boolean; onSwapExercise?: (exerciseId: string, exerciseName: string) => void }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      id={`workout-${workout.id || workout.dayNumber}`}
      className="scroll-mt-32"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full group"
      >
        <div className="flex items-center gap-4 p-4 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-all border border-transparent hover:border-[#E2E8F0]">
          {/* Day number badge */}
          <div className="w-14 h-14 rounded-xl bg-white border-2 border-[#F1F5F9] flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-[9px] uppercase tracking-widest text-[#94A3B8]" style={{ fontFamily: "'Space Mono', monospace" }}>Day</span>
            <span className="text-xl font-extrabold text-[#0F172A] -mt-0.5">{workout.dayNumber}</span>
          </div>

          {/* Workout info */}
          <div className="flex-1 text-left min-w-0">
            <h4 className="text-base font-bold text-[#0F172A] truncate group-hover:text-[#FF6B6B] transition-colors">
              {workout.name || 'Workout'}
            </h4>
            <p className="text-sm text-[#94A3B8] truncate">{workout.focus}</p>
          </div>

          {/* Exercise count + chevron */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs text-[#94A3B8] tabular-nums" style={{ fontFamily: "'Space Mono', monospace" }}>
              {workout.exercises?.length || 0} exercises
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-8 h-8 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center shadow-sm"
            >
              <svg className="w-4 h-4 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </div>
        </div>
      </button>

      {/* Expanded workout content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-2 ml-4 rounded-xl bg-white border border-[#F1F5F9] overflow-hidden">
              {/* Warmup */}
              {workout.warmup && (() => {
                const warmupData = typeof workout.warmup === 'string' ? JSON.parse(workout.warmup) : workout.warmup;
                return (
                  <div className="p-4 bg-[#FFFBEB] border-b border-[#FEF3C7]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-md bg-[#FEF3C7] flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-[#D97706]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-[#D97706] uppercase tracking-wider" style={{ fontFamily: "'Space Mono', monospace" }}>
                        Warmup {warmupData.duration ? `• ${warmupData.duration} min` : ''}
                      </span>
                    </div>
                    <ul className="text-sm text-[#92400E] space-y-1 ml-8">
                      {warmupData.activities?.map((activity: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-[#D97706]" />
                          {activity}
                        </li>
                      )) || <li>General warmup</li>}
                    </ul>
                  </div>
                );
              })()}

              {/* Exercises */}
              <div className="p-3 space-y-3">
                {workout.exercises?.map((exercise: any, i: number) => (
                  <ExerciseCard
                    key={exercise.id || i}
                    exercise={{
                      id: exercise.id,
                      name: exercise.name,
                      sets: exercise.sets,
                      reps: exercise.reps || exercise.measure || '10',
                      rest: exercise.restPeriod,
                      category: getCategoryFromExercise(exercise),
                      notes: exercise.notes,
                      instructions: exercise.instructions,
                    }}
                    onSwap={() => onSwapExercise?.(exercise.id || `exercise-${i}`, exercise.name)}
                  />
                ))}
              </div>

              {/* Cooldown */}
              {workout.cooldown && (() => {
                const cooldownData = typeof workout.cooldown === 'string' ? JSON.parse(workout.cooldown) : workout.cooldown;
                return (
                  <div className="p-4 bg-[#F0FDF4] border-t border-[#D1FAE5]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-md bg-[#D1FAE5] flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-[#059669] uppercase tracking-wider" style={{ fontFamily: "'Space Mono', monospace" }}>
                        Cooldown {cooldownData.duration ? `• ${cooldownData.duration} min` : ''}
                      </span>
                    </div>
                    <ul className="text-sm text-[#065F46] space-y-1 ml-8">
                      {cooldownData.activities?.map((activity: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-[#059669]" />
                          {activity}
                        </li>
                      )) || <li>General cooldown</li>}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Phase Card Component
function PhaseCard({
  plan,
  phaseNumber,
  totalPhases,
  isActive,
  onSelect,
  isLocked,
  onRequestUpsell,
  onSwapExercise
}: {
  plan: any;
  phaseNumber: number;
  totalPhases: number;
  isActive: boolean;
  onSelect: () => void;
  isLocked: boolean;
  onRequestUpsell: () => void;
  onSwapExercise?: (exerciseId: string, exerciseName: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(isActive);
  const totalExercises = plan.workouts?.reduce((sum: number, w: any) => sum + (w.exercises?.length || 0), 0) || 0;
  const nutrition = getMacros(plan as WorkoutPlan);

  useEffect(() => {
    setIsExpanded(isActive);
  }, [isActive]);

  return (
    <motion.div
      layout
      className="relative"
      data-phase-card
    >
      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 backdrop-blur-sm bg-white/60 rounded-2xl z-10 flex items-center justify-center">
          <div className="text-center p-6 max-w-sm">
            <div className="w-12 h-12 rounded-full bg-[#FFE5E5] flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[#FF6B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] mb-2">Unlock Phase {phaseNumber}</h3>
            <p className="text-sm text-[#475569] mb-4">Sign up to access all training phases</p>
            <button
              onClick={onRequestUpsell}
              className="px-6 py-2.5 bg-[#FF6B6B] text-white font-semibold rounded-xl hover:bg-[#EF5350] transition-all shadow-lg shadow-[#FF6B6B]/25"
            >
              Unlock Full Program
            </button>
          </div>
        </div>
      )}

      {/* Main card */}
      <div className={`bg-white rounded-2xl border-2 ${isActive ? 'border-[#FF6B6B]' : 'border-[#F1F5F9]'} overflow-hidden shadow-sm hover:shadow-md transition-all`}>
        {/* Phase header */}
        <button
          onClick={() => {
            onSelect();
            setIsExpanded(!isExpanded);
          }}
          className="w-full text-left p-5 hover:bg-[#FAFAFA] transition-colors"
        >
          <div className="flex items-start gap-4">
            {/* Phase badge */}
            <div className="relative flex-shrink-0">
              <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shadow-lg ${isActive ? 'bg-gradient-to-br from-[#FF6B6B] to-[#EF5350] shadow-[#FF6B6B]/20' : 'bg-gradient-to-br from-[#94A3B8] to-[#64748B] shadow-[#94A3B8]/20'}`}>
                <span className="text-[9px] uppercase tracking-wider text-white/80" style={{ fontFamily: "'Space Mono', monospace" }}>Phase</span>
                <span className="text-xl font-extrabold text-white">{phaseNumber}</span>
              </div>
              {/* Duration badge */}
              <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-[#0F172A] text-[10px] font-bold text-white">
                4wk
              </div>
            </div>

            {/* Phase info */}
            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="text-lg font-bold text-[#0F172A] leading-tight mb-1">
                {plan.name || `Phase ${phaseNumber}`}
              </h3>
              <p className="text-sm text-[#475569] line-clamp-1">{plan.phaseExplanation || 'Training phase'}</p>

              {/* Quick stats */}
              <div className="flex flex-wrap items-center gap-4 mt-3" style={{ fontFamily: "'Space Mono', monospace" }}>
                <span className="text-xs text-[#94A3B8]">
                  <span className="font-semibold text-[#0F172A]">{plan.workouts?.length || 0}</span> days/wk
                </span>
                <span className="text-xs text-[#94A3B8]">
                  <span className="font-semibold text-[#0F172A]">{totalExercises}</span> exercises
                </span>
                <span className="text-xs text-[#94A3B8]">
                  <span className="font-semibold text-[#FF6B6B]">{nutrition?.calories || 0}</span> kcal
                </span>
              </div>
            </div>

            {/* Expand/collapse */}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center"
            >
              <svg className="w-4 h-4 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </div>
        </button>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && !isLocked && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 space-y-5 border-t border-[#F1F5F9]">
                {/* Key points */}
                {plan.phaseKeyPoints && plan.phaseKeyPoints.length > 0 && (
                  <div className="pt-5">
                    <h4 className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold mb-3" style={{ fontFamily: "'Space Mono', monospace" }}>
                      Key Focus Areas
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {plan.phaseKeyPoints.slice(0, 4).map((point: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-[#F8FAFC]">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] mt-1.5 flex-shrink-0" />
                          <span className="text-sm text-[#475569] leading-tight">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* What to expect */}
                {plan.phaseExpectations && (
                  <div>
                    <h4 className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold mb-2" style={{ fontFamily: "'Space Mono', monospace" }}>
                      What to Expect
                    </h4>
                    <p className="text-sm text-[#475569]">{plan.phaseExpectations}</p>
                  </div>
                )}

                {/* Workouts */}
                <div>
                  <h4 className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold mb-3" style={{ fontFamily: "'Space Mono', monospace" }}>
                    Weekly Schedule
                  </h4>
                  <div className="space-y-2">
                    {plan.workouts?.sort((a: any, b: any) => (a.dayNumber || 0) - (b.dayNumber || 0)).map((workout: any, i: number) => (
                      <WorkoutDayCard
                        key={workout.id || i}
                        workout={workout}
                        index={i}
                        defaultOpen={i === 0}
                        onSwapExercise={onSwapExercise}
                      />
                    ))}
                  </div>
                </div>

                {/* Nutrition summary - visual donut */}
                <MacroDisplay
                  protein={nutrition?.protein || 0}
                  carbs={nutrition?.carbs || 0}
                  fats={nutrition?.fats || 0}
                  calories={nutrition?.calories || 0}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export const ProgramDisplay = forwardRef<ProgramDisplayRef, ProgramDisplayProps>(({
  program: initialProgram,
  userEmail: initialUserEmail = null,
  onRequestUpsell,
  isUpsellOpen = false,
  onCloseUpsell,
}, ref) => {
  const [program, setProgram] = useState(initialProgram);
  const [activePlanIndex, setActivePlanIndex] = useState(0);
  const [userEmail, setUserEmail] = useState(initialUserEmail);
  const [user, setUser] = useState<User | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  // Exercise swap modal state
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [swapExercise, setSwapExercise] = useState<{ id: string; name: string } | null>(null);

  const handleOpenSwapModal = (exerciseId: string, exerciseName: string) => {
    setSwapExercise({ id: exerciseId, name: exerciseName });
    setSwapModalOpen(true);
  };

  const handleSwapComplete = (newExercise: { id: string; name: string }) => {
    if (!swapExercise) return;

    // Update the program state with the new exercise name
    setProgram(prev => ({
      ...prev,
      workoutPlans: prev.workoutPlans.map(plan => ({
        ...plan,
        workouts: plan.workouts?.map(workout => ({
          ...workout,
          exercises: workout.exercises?.map((ex: any) =>
            ex.id === swapExercise.id || ex.name === swapExercise.name
              ? { ...ex, name: newExercise.name, exerciseLibraryId: newExercise.id }
              : ex
          )
        }))
      }))
    }));

    setSwapModalOpen(false);
    setSwapExercise(null);
  };

  useImperativeHandle(ref, () => ({
    generateWorkoutPDF: async (programId: string) => {
      try {
        await generateWorkoutPDF(programId);
      } catch (error) {
        console.error('Error generating PDF:', error);
      }
    }
  }));

  const handleEmailSubmit = async (email: string) => {
    setUserEmail(email);
    const userId = new URLSearchParams(window.location.search).get('userId');
    if (userId) {
      const result = await getUser(userId);
      if (result.success && result.user) {
        setUser(result.user);
      }
    }
    onCloseUpsell?.();
  };

  useEffect(() => {
    const fetchUser = async () => {
      const userId = new URLSearchParams(window.location.search).get('userId');
      if (userId) {
        const result = await getUser(userId);
        if (result.success && result.user) {
          setUser(result.user);
          setUserEmail(result.user.email);
        }
      }
    };
    fetchUser();
  }, []);

  // Sticky header observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!program) {
    return (
      <div className="flex items-center justify-center h-64 bg-[#F8FAFC] rounded-2xl border-2 border-dashed border-[#E2E8F0]">
        <p className="text-[#94A3B8]">No program data available</p>
      </div>
    );
  }

  if (!program.workoutPlans || program.workoutPlans.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-[#F8FAFC] rounded-2xl border-2 border-dashed border-[#E2E8F0]">
        <p className="text-[#94A3B8]">No workout plans available</p>
      </div>
    );
  }

  const isPhaseUnlocked = (index: number) => {
    return userEmail || index === 0;
  };

  const totalPhases = program.workoutPlans.length;

  return (
    <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Physician Disclaimer - Top of page */}
      <DisclaimerBanner
        variant="inline"
        showAcknowledgeButton={false}
      />

      {/* Program Header - Hero Style */}
      <div ref={headerRef} className="relative overflow-hidden rounded-2xl shadow-xl">
        {/* Gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
          }}
        />
        {/* Subtle dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative z-10 p-6 sm:p-8 lg:p-10">
          {/* Top section with title */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
              {program.name || 'Your Program'}
            </h1>
            {program.description && (
              <p className="text-base sm:text-lg text-white/70 max-w-2xl leading-relaxed">{program.description}</p>
            )}
          </div>

          {/* Stats Badges Row */}
          <div className="flex flex-wrap gap-3 mb-6 lg:mb-8">
            {/* Duration badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF6B6B] text-white shadow-lg shadow-[#FF6B6B]/30">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>{totalPhases * 4} weeks</span>
            </div>

            {/* Days per week badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF6B6B] text-white shadow-lg shadow-[#FF6B6B]/30">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-sm font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>{program.workoutPlans?.[0]?.workouts?.length || 0} days/week</span>
            </div>

            {/* Phases badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF6B6B] text-white shadow-lg shadow-[#FF6B6B]/30">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>{totalPhases} phase{totalPhases !== 1 ? 's' : ''}</span>
            </div>

            {/* Difficulty badge - default to intermediate */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF6B6B] text-white shadow-lg shadow-[#FF6B6B]/30">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>All Levels</span>
            </div>
          </div>

          {/* Primary CTA - Start Training */}
          <div className="space-y-4">
            <button
              onClick={() => {
                // Scroll to first phase or open it
                document.querySelector('[data-phase-card]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-[#FF6B6B] text-white font-bold text-lg rounded-2xl hover:scale-[1.03] hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[#FF6B6B]/30 active:scale-[0.98] transition-all shadow-xl shadow-[#FF6B6B]/25"
            >
              <svg className="w-6 h-6 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Training
            </button>

            {/* Secondary actions row */}
            <div className="flex flex-wrap items-center gap-2">
              {userEmail ? (
                <>
                  <button
                    onClick={() => generateWorkoutPDF(program.id)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-transparent text-white/80 text-sm font-medium hover:bg-white/10 border border-white/20 hover:border-white/40 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    PDF
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: program.name || 'My Workout Program',
                          url: window.location.href,
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-transparent text-white/80 text-sm font-medium hover:bg-white/10 border border-white/20 hover:border-white/40 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </button>
                  <button
                    onClick={() => {
                      const subject = encodeURIComponent(program.name || 'My Workout Program');
                      const body = encodeURIComponent(`Check out my workout program: ${window.location.href}`);
                      window.location.href = `mailto:?subject=${subject}&body=${body}`;
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-transparent text-white/80 text-sm font-medium hover:bg-white/10 border border-white/20 hover:border-white/40 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email
                  </button>
                </>
              ) : (
                <button
                  onClick={onRequestUpsell}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-transparent text-white/80 text-sm font-medium hover:bg-white/10 border border-white/20 hover:border-white/40 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Save & Share
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Phase Navigation */}
      <div className={`sticky top-0 z-20 transition-all duration-300 ${isSticky ? 'py-3 -mx-4 px-4 bg-[#F8FAFC]/95 backdrop-blur-sm border-b border-[#E2E8F0] shadow-sm' : ''}`}>
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {program.workoutPlans.map((_, index) => (
            <button
              key={index}
              onClick={() => setActivePlanIndex(index)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all flex-shrink-0 ${
                activePlanIndex === index
                  ? 'bg-[#FF6B6B] text-white shadow-lg shadow-[#FF6B6B]/25'
                  : isPhaseUnlocked(index)
                    ? 'bg-white text-[#475569] border border-[#E2E8F0] hover:border-[#FF6B6B]/50 hover:text-[#FF6B6B]'
                    : 'bg-[#F1F5F9] text-[#94A3B8] border border-[#E2E8F0] cursor-not-allowed'
              }`}
              disabled={!isPhaseUnlocked(index)}
            >
              {!isPhaseUnlocked(index) && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
              <span style={{ fontFamily: "'Space Mono', monospace" }}>Phase {index + 1}</span>
              {activePlanIndex === index && (
                <span className="text-xs text-white/80">of {totalPhases}</span>
              )}
            </button>
          ))}

          {/* Progress indicator */}
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] flex-shrink-0">
            <div className="flex gap-1">
              {program.workoutPlans.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activePlanIndex
                      ? 'bg-[#FF6B6B] scale-125'
                      : index < activePlanIndex
                        ? 'bg-[#0F172A]'
                        : 'bg-[#E2E8F0]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Phase Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePlanIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <PhaseCard
            plan={program.workoutPlans[activePlanIndex]}
            phaseNumber={activePlanIndex + 1}
            totalPhases={totalPhases}
            isActive={true}
            onSelect={() => {}}
            isLocked={!isPhaseUnlocked(activePlanIndex)}
            onRequestUpsell={onRequestUpsell}
            onSwapExercise={handleOpenSwapModal}
          />
        </motion.div>
      </AnimatePresence>

      {/* Quick Jump Links */}
      {program.workoutPlans[activePlanIndex]?.workouts && program.workoutPlans[activePlanIndex].workouts.length > 3 && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
          <h4 className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold mb-3" style={{ fontFamily: "'Space Mono', monospace" }}>
            Jump to Workout
          </h4>
          <div className="flex flex-wrap gap-2">
            {program.workoutPlans[activePlanIndex].workouts
              .sort((a: any, b: any) => (a.dayNumber || 0) - (b.dayNumber || 0))
              .map((workout: any) => (
                <a
                  key={workout.id || workout.dayNumber}
                  href={`#workout-${workout.id || workout.dayNumber}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F8FAFC] text-sm text-[#475569] hover:bg-[#F1F5F9] hover:text-[#FF6B6B] border border-[#F1F5F9] hover:border-[#FFE5E5] transition-all"
                >
                  <span className="font-bold text-[#0F172A]" style={{ fontFamily: "'Space Mono', monospace" }}>D{workout.dayNumber}</span>
                  <span className="truncate max-w-[120px]">{workout.name}</span>
                </a>
              ))}
          </div>
        </div>
      )}

      {/* Exercise Swap Modal */}
      {swapExercise && (
        <ExerciseSwapModal
          isOpen={swapModalOpen}
          onClose={() => {
            setSwapModalOpen(false);
            setSwapExercise(null);
          }}
          exerciseId={swapExercise.id}
          exerciseName={swapExercise.name}
          onSwap={handleSwapComplete}
          userId={program.createdByUser?.id}
        />
      )}

      {/* Upsell Modal */}
      <UpsellModal
        isOpen={isUpsellOpen}
        onClose={() => onCloseUpsell?.()}
        onEmailSubmit={handleEmailSubmit}
        onPurchase={() => onCloseUpsell?.()}
        userEmail={userEmail}
        user={user}
      />
    </div>
  );
});

ProgramDisplay.displayName = 'ProgramDisplay';
