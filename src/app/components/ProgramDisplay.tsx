'use client';

import { Program } from '@/types';
import { UpsellModal } from './UpsellModal';
import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { User } from '@prisma/client';
import { getUser } from '../start/actions';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { motion, AnimatePresence } from 'framer-motion';
import { generateWorkoutPDF } from '@/utils/pdf';
import { formatExerciseMeasure, formatRestPeriod } from '@/utils/formatters';
import { getMacros } from '@/utils/formatting';
import { WorkoutPlan } from '@/types/program';
import { MacroDisplay } from '@/components/MacroDisplay';

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

// Category styling - matching StreamingPhasePreview
const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  primary: { bg: 'bg-[#FFE5E5]', text: 'text-[#EF5350]', label: 'PRI' },
  secondary: { bg: 'bg-[#E0F2FE]', text: 'text-[#0284C7]', label: 'SEC' },
  isolation: { bg: 'bg-[#F3E8FF]', text: 'text-[#9333EA]', label: 'ISO' },
  cardio: { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]', label: 'CAR' },
  flexibility: { bg: 'bg-[#D1FAE5]', text: 'text-[#059669]', label: 'FLX' },
  compound: { bg: 'bg-[#FFE5E5]', text: 'text-[#EF5350]', label: 'COM' },
  accessory: { bg: 'bg-[#E0F2FE]', text: 'text-[#0284C7]', label: 'ACC' },
};

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

// Exercise Row Component
function ExerciseRow({ exercise, index }: { exercise: any; index: number }) {
  const category = getCategoryFromExercise(exercise);
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.secondary;
  const [showNotes, setShowNotes] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
    >
      <div
        className={`flex items-center gap-3 py-3 px-2 border-b border-[#F1F5F9] last:border-0 hover:bg-[#FAFAFA] transition-colors ${exercise.notes ? 'cursor-pointer' : ''}`}
        onClick={() => exercise.notes && setShowNotes(!showNotes)}
      >
        {/* Category badge */}
        <div className={`w-10 h-6 rounded-md ${style.bg} flex items-center justify-center flex-shrink-0`}>
          <span className={`text-[10px] font-bold ${style.text} tracking-wider`} style={{ fontFamily: "'Space Mono', monospace" }}>
            {style.label}
          </span>
        </div>

        {/* Exercise name */}
        <span className="flex-1 text-sm text-[#0F172A] font-medium">{exercise.name}</span>

        {/* Sets x Reps */}
        <div className="flex items-center gap-1.5 text-xs text-[#475569] tabular-nums flex-shrink-0" style={{ fontFamily: "'Space Mono', monospace" }}>
          <span className="text-[#0F172A] font-semibold">{exercise.sets}</span>
          <span className="text-[#94A3B8]">×</span>
          <span className="text-[#0F172A] font-semibold">
            {(() => {
              const formatted = formatExerciseMeasure(exercise);
              return formatted.replace('reps', '').trim();
            })()}
          </span>
        </div>

        {/* Rest */}
        <div className="w-16 text-xs text-[#94A3B8] text-right flex-shrink-0" style={{ fontFamily: "'Space Mono', monospace" }}>
          {formatRestPeriod(typeof exercise.restPeriod === 'string' ? parseInt(exercise.restPeriod) : exercise.restPeriod)}
        </div>

        {/* Notes indicator */}
        {exercise.notes && (
          <motion.div
            animate={{ rotate: showNotes ? 180 : 0 }}
            className="w-5 h-5 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center flex-shrink-0"
          >
            <svg className="w-3 h-3 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        )}
      </div>

      {/* Expanded notes */}
      <AnimatePresence>
        {showNotes && exercise.notes && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 bg-[#F8FAFC] text-sm text-[#475569] border-b border-[#F1F5F9]">
              {exercise.notes}
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name)} how to`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-2 text-[#FF6B6B] hover:text-[#EF5350] gap-1 text-xs font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                Watch tutorial
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Workout Day Card Component
function WorkoutDayCard({ workout, index, defaultOpen = false }: { workout: any; index: number; defaultOpen?: boolean }) {
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

              {/* Exercise header */}
              <div className="grid grid-cols-12 gap-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider px-4 py-3 bg-[#FAFAFA] border-b border-[#F1F5F9]" style={{ fontFamily: "'Space Mono', monospace" }}>
                <div className="col-span-1">Type</div>
                <div className="col-span-5">Exercise</div>
                <div className="col-span-3 text-right">Sets × Reps</div>
                <div className="col-span-2 text-right">Rest</div>
                <div className="col-span-1"></div>
              </div>

              {/* Exercises */}
              <div>
                {workout.exercises?.map((exercise: any, i: number) => (
                  <ExerciseRow key={exercise.id || i} exercise={exercise} index={i} />
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
  onRequestUpsell
}: {
  plan: any;
  phaseNumber: number;
  totalPhases: number;
  isActive: boolean;
  onSelect: () => void;
  isLocked: boolean;
  onRequestUpsell: () => void;
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
  program,
  userEmail: initialUserEmail = null,
  onRequestUpsell,
  isUpsellOpen = false,
  onCloseUpsell,
}, ref) => {
  const [activePlanIndex, setActivePlanIndex] = useState(0);
  const [userEmail, setUserEmail] = useState(initialUserEmail);
  const [user, setUser] = useState<User | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

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
      {/* Disclaimer */}
      <DisclaimerBanner
        variant="inline"
        showAcknowledgeButton={false}
      />

      {/* Program Header */}
      <div ref={headerRef} className="relative overflow-hidden bg-white rounded-2xl border-l-4 border-l-[#FF6B6B] border border-[#E2E8F0] shadow-md">
        <div className="p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Program info */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-[#0F172A]">
                {program.name || 'Your Program'}
              </h1>
              {program.description && (
                <p className="text-lg text-[#475569] max-w-2xl">{program.description}</p>
              )}

              {/* Program stats */}
              <div className="flex flex-wrap items-center gap-4 pt-2" style={{ fontFamily: "'Space Mono', monospace" }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#FF6B6B]" />
                  <span className="text-sm text-[#94A3B8]">
                    <span className="font-semibold text-[#0F172A]">{totalPhases}</span> phase{totalPhases !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#0F172A]" />
                  <span className="text-sm text-[#94A3B8]">
                    <span className="font-semibold text-[#0F172A]">{totalPhases * 4}</span> weeks total
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {userEmail ? (
                <button
                  onClick={() => generateWorkoutPDF(program.id)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F8FAFC] text-[#475569] font-medium hover:bg-[#F1F5F9] border border-[#E2E8F0] transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </button>
              ) : (
                <button
                  onClick={onRequestUpsell}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B6B] text-white font-semibold rounded-xl hover:bg-[#EF5350] transition-all shadow-lg shadow-[#FF6B6B]/25"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
