'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { formatVolume } from '@/lib/milestones';
import type { RecoveryData } from '@/app/api/programs/[programId]/recovery/route';

interface RecoveryScreenProps {
  data: RecoveryData;
  programId: string;
  onDismiss: () => void;
  onSelectOption: (option: 'full' | 'quick' | 'not_today') => void;
}

export function RecoveryScreen({
  data,
  programId,
  onDismiss,
  onSelectOption,
}: RecoveryScreenProps) {
  const tier = data.recoveryTier;

  if (!tier) return null;

  const isNoJudgment = tier.type === 'no_judgment';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onDismiss}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`
            w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden
            ${isNoJudgment ? 'border-l-4 border-l-[#94A3B8]' : 'border-l-4 border-l-[#FF6B6B]'}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`
            px-6 py-8 text-center
            ${isNoJudgment ? 'bg-gradient-to-br from-slate-50 to-slate-100' : 'bg-gradient-to-br from-[#FFE5E5] to-white'}
          `}
          >
            {/* Icon */}
            <div className="mb-4">
              {isNoJudgment ? (
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-200 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
              ) : (
                <div className="w-16 h-16 mx-auto rounded-full bg-[#FFE5E5] flex items-center justify-center">
                  <span className="text-3xl">👋</span>
                </div>
              )}
            </div>

            {/* Headline */}
            <h2 className="text-2xl font-bold text-[#0F172A] mb-2">{tier.headline}</h2>
            <p className="text-[#475569]">{tier.subheadline}</p>
          </div>

          {/* Stats - Your Progress is Safe */}
          <div className="px-6 py-5 bg-[#F8FAFC] border-y border-[#E2E8F0]">
            <p
              className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-3"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Your lifetime progress
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#0F172A]">
                  {data.lifetimeStats.totalWorkouts}
                </p>
                <p className="text-xs text-[#64748B]">Workouts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#0F172A]">
                  {formatVolume(data.lifetimeStats.totalVolume)}
                </p>
                <p className="text-xs text-[#64748B]">Volume Lifted</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#0F172A]">
                  {data.programProgress.percentComplete}%
                </p>
                <p className="text-xs text-[#64748B]">Program Done</p>
              </div>
            </div>
          </div>

          {/* Encouragement */}
          <div className="px-6 py-4">
            <p className="text-[#475569] text-center italic">&ldquo;{tier.encouragement}&rdquo;</p>
          </div>

          {/* Action Options */}
          <div className="px-6 pb-6 space-y-3">
            {/* Full Workout Option */}
            {data.nextWorkout && (
              <Link
                href={`/workout/${data.nextWorkout.id}`}
                onClick={() => onSelectOption('full')}
                className="block w-full px-6 py-4 bg-[#FF6B6B] text-white font-semibold rounded-xl hover:bg-[#EF5350] transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-[#FF6B6B]/25 text-center"
              >
                <span className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Today&apos;s Workout
                </span>
                <span className="text-sm text-white/80 block mt-1">
                  {data.nextWorkout.name} • {data.nextWorkout.exerciseCount} exercises
                </span>
              </Link>
            )}

            {/* Quick Comeback Option - Only show if 3+ days missed */}
            {data.quickComebackWorkout && (
              <Link
                href={`/workout/${data.quickComebackWorkout.id}?quick=true`}
                onClick={() => onSelectOption('quick')}
                className="block w-full px-6 py-4 bg-white text-[#0F172A] font-semibold rounded-xl border-2 border-[#E2E8F0] hover:border-[#FF6B6B] hover:bg-[#FFE5E5]/30 transition-all duration-200 text-center"
              >
                <span className="flex items-center justify-center gap-3">
                  <svg
                    className="w-5 h-5 text-[#FF6B6B]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Quick Comeback Session
                </span>
                <span className="text-sm text-[#64748B] block mt-1">
                  {data.quickComebackWorkout.exercises.length} exercises •{' '}
                  {data.quickComebackWorkout.estimatedMinutes} min
                </span>
              </Link>
            )}

            {/* Not Today Option */}
            <button
              onClick={() => onSelectOption('not_today')}
              className="w-full px-6 py-3 text-[#64748B] font-medium hover:text-[#0F172A] transition-colors text-center"
            >
              Not today, remind me tomorrow
            </button>
          </div>

          {/* Program Adjustment Offer - Only for 3+ days */}
          {isNoJudgment && (
            <div className="px-6 pb-6 pt-2 border-t border-[#E2E8F0]">
              <Link
                href={`/dashboard/${programId}/adjust`}
                className="text-sm text-[#64748B] hover:text-[#FF6B6B] flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
                Life changed? Adjust your program to make it easier
              </Link>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default RecoveryScreen;
