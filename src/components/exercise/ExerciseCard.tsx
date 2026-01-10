'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, ArrowLeftRight, ChevronDown } from 'lucide-react';

export interface Exercise {
  id?: string;
  name: string;
  sets: number;
  reps: string | number;
  rest?: string | number;
  category?: string;
  notes?: string | null;
  instructions?: string[];
}

export const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string; icon: string }> = {
  primary: { bg: 'bg-[#FFE5E5]', text: 'text-[#EF5350]', label: 'PRI', icon: '🔥' },
  secondary: { bg: 'bg-[#E0F2FE]', text: 'text-[#0284C7]', label: 'SEC', icon: '💪' },
  isolation: { bg: 'bg-[#F3E8FF]', text: 'text-[#9333EA]', label: 'ISO', icon: '🎯' },
  cardio: { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]', label: 'CAR', icon: '❤️' },
  compound: { bg: 'bg-[#FFE5E5]', text: 'text-[#EF5350]', label: 'COM', icon: '🏋️' },
};

interface ExerciseCardProps {
  exercise: Exercise;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onSwap?: () => void;
}

export function ExerciseCard({
  exercise,
  isExpanded: controlledIsExpanded,
  onToggleExpand,
  onSwap
}: ExerciseCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);

  // Support both controlled and uncontrolled mode
  const isExpanded = controlledIsExpanded !== undefined ? controlledIsExpanded : internalExpanded;
  const toggleExpand = onToggleExpand || (() => setInternalExpanded(!internalExpanded));

  const style = CATEGORY_STYLES[exercise.category || 'secondary'] || CATEGORY_STYLES.secondary;
  const hasDetails = exercise.notes || (exercise.instructions && exercise.instructions.length > 0);

  // Format rest duration for display
  const formatRest = (rest: string | number | undefined): string => {
    if (!rest) return '';
    if (typeof rest === 'number') {
      return `${rest}s`;
    }
    return rest;
  };

  // Generate YouTube search URL for exercise
  const getVideoUrl = (exerciseName: string): string => {
    const query = encodeURIComponent(`${exerciseName} exercise form tutorial`);
    return `https://www.youtube.com/results?search_query=${query}`;
  };

  return (
    <motion.div
      className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden hover:shadow-md transition-shadow"
      layout
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Category Icon - 56x56px */}
          <div className={`w-14 h-14 rounded-xl ${style.bg} flex flex-col items-center justify-center flex-shrink-0`}>
            <span className="text-lg">{style.icon}</span>
            <span className={`text-[9px] font-bold ${style.text} uppercase`}>{style.label}</span>
          </div>

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-[#0F172A] mb-1">{exercise.name}</h4>
            <div className="flex items-center gap-1 text-sm text-[#475569]">
              <span><span className="font-bold text-[#0F172A]">{exercise.sets}</span> sets</span>
              <span className="text-[#94A3B8]">•</span>
              <span><span className="font-bold text-[#0F172A]">{exercise.reps}</span> reps</span>
              {exercise.rest && (
                <>
                  <span className="text-[#94A3B8]">•</span>
                  <span className="text-[#94A3B8]">{formatRest(exercise.rest)} rest</span>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons - 40x40px */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Video Button */}
            <a
              href={getVideoUrl(exercise.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center hover:bg-[#FFE5E5] hover:border-[#FF6B6B]/30 transition-colors group"
              onClick={(e) => e.stopPropagation()}
            >
              <PlayCircle className="w-5 h-5 text-[#94A3B8] group-hover:text-[#FF6B6B]" />
            </a>

            {/* Swap Button */}
            <button
              className="w-10 h-10 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center hover:bg-[#E0F2FE] hover:border-[#0284C7]/30 transition-colors group"
              onClick={(e) => {
                e.stopPropagation();
                onSwap?.();
              }}
            >
              <ArrowLeftRight className="w-5 h-5 text-[#94A3B8] group-hover:text-[#0284C7]" />
            </button>

            {/* Expand Button - only shows if has details */}
            {hasDetails && (
              <button
                className={`w-10 h-10 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand();
                }}
              >
                <ChevronDown className="w-5 h-5 text-[#94A3B8]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Details Section */}
      <AnimatePresence>
        {isExpanded && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 space-y-3 border-t border-[#F1F5F9]">
              {/* Instructions - numbered list */}
              {exercise.instructions && exercise.instructions.length > 0 && (
                <div className="pt-3">
                  <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Instructions</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-[#475569]">
                    {exercise.instructions.map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Notes - amber-tinted box with lightbulb */}
              {exercise.notes && (
                <div className="p-3 rounded-lg bg-[#FEF3C7]/50 border border-[#FEF3C7]">
                  <p className="text-sm text-[#92400E]">💡 {exercise.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
