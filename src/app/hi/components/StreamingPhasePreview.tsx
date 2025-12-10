'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ValidatedPhase, ValidatedWorkout, ValidatedExercise } from '@/services/programGeneration/schema';

interface StreamingPhasePreviewProps {
  phases: ValidatedPhase[];
  programMeta?: {
    name: string;
    description: string;
    totalWeeks: number;
  } | null;
  isGenerating: boolean;
}

// Format exercise measure for display
function formatMeasure(exercise: ValidatedExercise): string {
  const { measure } = exercise;
  if (measure.type === 'reps') {
    return `${measure.value}`;
  } else if (measure.type === 'time') {
    const unit = measure.unit || 'seconds';
    return `${measure.value}${unit === 'seconds' ? 's' : unit === 'minutes' ? 'm' : unit}`;
  } else if (measure.type === 'distance') {
    return `${measure.value}${measure.unit || 'm'}`;
  }
  return `${measure.value}`;
}

// Category styling - using v2a color palette (coral, navy, clean)
const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  primary: { bg: 'bg-[#FFE5E5]', text: 'text-[#EF5350]', label: 'PRI' },
  secondary: { bg: 'bg-[#E0F2FE]', text: 'text-[#0284C7]', label: 'SEC' },
  isolation: { bg: 'bg-[#F3E8FF]', text: 'text-[#9333EA]', label: 'ISO' },
  cardio: { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]', label: 'CAR' },
  flexibility: { bg: 'bg-[#D1FAE5]', text: 'text-[#059669]', label: 'FLX' },
};

function ExerciseRow({ exercise, index }: { exercise: ValidatedExercise; index: number }) {
  const style = CATEGORY_STYLES[exercise.category] || CATEGORY_STYLES.isolation;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      className="flex items-center gap-3 py-2.5 border-b border-[#F1F5F9] last:border-0"
    >
      {/* Category badge */}
      <div className={`w-10 h-6 rounded-md ${style.bg} flex items-center justify-center flex-shrink-0`}>
        <span className={`text-[10px] font-bold ${style.text} tracking-wider`} style={{ fontFamily: "'Space Mono', monospace" }}>
          {style.label}
        </span>
      </div>

      {/* Exercise name */}
      <span className="flex-1 text-sm text-[#0F172A] truncate font-medium">{exercise.name}</span>

      {/* Sets x Reps */}
      <div className="flex items-center gap-1 text-xs text-[#475569] tabular-nums flex-shrink-0" style={{ fontFamily: "'Space Mono', monospace" }}>
        <span className="text-[#0F172A] font-semibold">{exercise.sets}</span>
        <span className="text-[#94A3B8]">×</span>
        <span className="text-[#0F172A] font-semibold">{formatMeasure(exercise)}</span>
      </div>
    </motion.div>
  );
}

function WorkoutCard({ workout, index, defaultOpen = false }: { workout: ValidatedWorkout; index: number; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full group"
      >
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-all border border-transparent hover:border-[#E2E8F0]">
          {/* Day number */}
          <div className="w-12 h-12 rounded-xl bg-white border-2 border-[#F1F5F9] flex flex-col items-center justify-center flex-shrink-0">
            <span className="text-[9px] uppercase tracking-widest text-[#94A3B8]" style={{ fontFamily: "'Space Mono', monospace" }}>Day</span>
            <span className="text-lg font-extrabold text-[#0F172A] -mt-0.5">{workout.dayNumber}</span>
          </div>

          {/* Workout info */}
          <div className="flex-1 text-left min-w-0">
            <h4 className="text-sm font-bold text-[#0F172A] truncate group-hover:text-[#FF6B6B] transition-colors">
              {workout.name}
            </h4>
            <p className="text-xs text-[#94A3B8] truncate">{workout.focus}</p>
          </div>

          {/* Exercise count + chevron */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-[#94A3B8] tabular-nums" style={{ fontFamily: "'Space Mono', monospace" }}>
              {workout.exercises.length} ex
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-6 h-6 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center"
            >
              <svg className="w-3.5 h-3.5 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </div>
        </div>
      </button>

      {/* Exercise list */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-1 ml-4 p-4 rounded-xl bg-white border border-[#F1F5F9]">
              {workout.exercises.map((exercise, i) => (
                <ExerciseRow key={i} exercise={exercise} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function StreamingPhasePreview({
  phases,
  programMeta,
  isGenerating,
}: StreamingPhasePreviewProps) {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(1);

  // Auto-expand newest phase when it arrives
  useEffect(() => {
    if (phases.length > 0) {
      setExpandedPhase(phases[phases.length - 1].phaseNumber);
    }
  }, [phases.length]);

  if (phases.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <AnimatePresence mode="popLayout">
        {phases.map((phase, index) => {
          const isExpanded = expandedPhase === phase.phaseNumber;
          const totalExercises = phase.workouts.reduce((sum, w) => sum + w.exercises.length, 0);

          return (
            <motion.div
              key={phase.phaseNumber}
              initial={{ opacity: 0, scale: 0.98, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: index * 0.1,
                duration: 0.4,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              layout
              className="relative"
            >
              {/* Main card */}
              <div className="bg-white rounded-2xl border-2 border-[#F1F5F9] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Phase header */}
                <button
                  onClick={() => setExpandedPhase(isExpanded ? null : phase.phaseNumber)}
                  className="w-full text-left p-5 hover:bg-[#FAFAFA] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Phase badge */}
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FF6B6B] to-[#EF5350] flex flex-col items-center justify-center shadow-lg shadow-[#FF6B6B]/20">
                        <span className="text-[9px] uppercase tracking-wider text-white/80" style={{ fontFamily: "'Space Mono', monospace" }}>Phase</span>
                        <span className="text-xl font-extrabold text-white">{phase.phaseNumber}</span>
                      </div>
                      {/* Duration badge */}
                      <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-[#0F172A] text-[10px] font-bold text-white">
                        {phase.durationWeeks}wk
                      </div>
                    </div>

                    {/* Phase info */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h3 className="text-lg font-bold text-[#0F172A] leading-tight mb-1">
                        {phase.name}
                      </h3>
                      <p className="text-sm text-[#475569] line-clamp-1">{phase.focus}</p>

                      {/* Quick stats */}
                      <div className="flex flex-wrap items-center gap-4 mt-3" style={{ fontFamily: "'Space Mono', monospace" }}>
                        <span className="text-xs text-[#94A3B8]">
                          <span className="font-semibold text-[#0F172A]">{phase.workouts.length}</span> days/wk
                        </span>
                        <span className="text-xs text-[#94A3B8]">
                          <span className="font-semibold text-[#0F172A]">{totalExercises}</span> exercises
                        </span>
                        <span className="text-xs text-[#94A3B8]">
                          <span className="font-semibold text-[#FF6B6B]">{phase.nutrition.dailyCalories}</span> kcal
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
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-5 border-t border-[#F1F5F9]">
                        {/* Key points */}
                        {phase.keyPoints.length > 0 && (
                          <div className="pt-5">
                            <h4 className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold mb-3" style={{ fontFamily: "'Space Mono', monospace" }}>
                              Key Focus Areas
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {phase.keyPoints.slice(0, 4).map((point, i) => (
                                <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-[#F8FAFC]">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] mt-1.5 flex-shrink-0" />
                                  <span className="text-sm text-[#475569] leading-tight">{point}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Workouts */}
                        <div>
                          <h4 className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold mb-3" style={{ fontFamily: "'Space Mono', monospace" }}>
                            Weekly Schedule
                          </h4>
                          <div className="space-y-2">
                            {phase.workouts.map((workout, i) => (
                              <WorkoutCard
                                key={workout.dayNumber}
                                workout={workout}
                                index={i}
                                defaultOpen={i === 0}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Nutrition summary */}
                        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold mb-1" style={{ fontFamily: "'Space Mono', monospace" }}>
                                Daily Nutrition
                              </h4>
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-extrabold text-[#0F172A]">{phase.nutrition.dailyCalories}</span>
                                <span className="text-sm text-[#94A3B8]">kcal</span>
                              </div>
                            </div>

                            {/* Macro pills */}
                            <div className="flex items-center gap-2">
                              <div className="px-3 py-1.5 rounded-lg bg-[#FFE5E5]">
                                <span className="text-xs font-bold text-[#EF5350]" style={{ fontFamily: "'Space Mono', monospace" }}>
                                  {phase.nutrition.macros.protein}g P
                                </span>
                              </div>
                              <div className="px-3 py-1.5 rounded-lg bg-[#FEF3C7]">
                                <span className="text-xs font-bold text-[#D97706]" style={{ fontFamily: "'Space Mono', monospace" }}>
                                  {phase.nutrition.macros.carbs}g C
                                </span>
                              </div>
                              <div className="px-3 py-1.5 rounded-lg bg-[#D1FAE5]">
                                <span className="text-xs font-bold text-[#059669]" style={{ fontFamily: "'Space Mono', monospace" }}>
                                  {phase.nutrition.macros.fats}g F
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Generating more indicator */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 py-6"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFE5E5]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-[#FFB8B8] border-t-[#FF6B6B] rounded-full"
            />
            <span className="text-sm font-medium text-[#EF5350]">Generating next phase...</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
