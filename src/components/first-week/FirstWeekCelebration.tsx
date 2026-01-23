'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatVolume } from '@/lib/milestones';

export interface FirstWeekData {
  workoutsCompleted: number;
  targetWorkouts: number;
  totalVolume: number;
  totalSets: number;
  averageWorkoutMinutes: number;
  strongestDay: string; // e.g., "Tuesday - Upper Body"
  programName: string;
}

interface FirstWeekCelebrationProps {
  data: FirstWeekData;
  userName?: string;
  onClose: () => void;
  onContinue: () => void;
}

export function FirstWeekCelebration({
  data,
  userName,
  onClose,
  onContinue,
}: FirstWeekCelebrationProps) {
  const firstName = userName?.split(' ')[0] || 'there';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Celebratory but not over-the-top */}
          <div className="relative px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6 text-center bg-gradient-to-br from-emerald-50 to-teal-50">
            {/* Icon */}
            <div className="mb-3 sm:mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-1 sm:mb-2">
              Week 1 Complete
            </h2>
            <p className="text-sm sm:text-base text-[#475569]">
              {firstName}, you showed up {data.workoutsCompleted} times this week.
              <br />
              <span className="font-medium text-emerald-600">That&apos;s how momentum builds.</span>
            </p>
          </div>

          {/* Week 1 Stats */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 bg-[#F8FAFC] border-y border-[#E2E8F0]">
            <p
              className="text-[10px] sm:text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2 sm:mb-3"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Your First Week
            </p>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-[#0F172A]">
                  {data.workoutsCompleted}/{data.targetWorkouts}
                </p>
                <p className="text-[10px] sm:text-xs text-[#64748B]">Workouts</p>
              </div>
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-[#0F172A]">
                  {formatVolume(data.totalVolume)}
                </p>
                <p className="text-[10px] sm:text-xs text-[#64748B]">Volume</p>
              </div>
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-[#0F172A]">
                  {data.totalSets}
                </p>
                <p className="text-[10px] sm:text-xs text-[#64748B]">Sets</p>
              </div>
            </div>
          </div>

          {/* Encouragement */}
          <div className="px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-emerald-800">Week 1 is the hardest</p>
                <p className="text-xs sm:text-sm text-emerald-700 mt-0.5 sm:mt-1">
                  Most people don&apos;t make it this far. You did. Week 2 gets easier.
                </p>
              </div>
            </div>
          </div>

          {/* What's Next Preview */}
          <div className="px-4 sm:px-6 pb-3 sm:pb-4">
            <p
              className="text-[10px] sm:text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-1.5 sm:mb-2"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Week 2 Preview
            </p>
            <p className="text-xs sm:text-sm text-[#475569]">
              Same structure, slightly more challenge. Your body is adapting.
            </p>
          </div>

          {/* Actions */}
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-2 sm:space-y-3">
            <button
              onClick={onContinue}
              className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-[#FF6B6B] text-white font-semibold rounded-xl hover:bg-[#EF5350] transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-[#FF6B6B]/25 text-sm sm:text-base"
            >
              On to Week 2
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 sm:px-6 py-2.5 sm:py-3 text-[#64748B] font-medium hover:text-[#0F172A] transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default FirstWeekCelebration;
