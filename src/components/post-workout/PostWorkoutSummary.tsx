'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Dumbbell, BarChart3, Trophy, X, ChevronRight } from 'lucide-react';

interface PR {
  exerciseName: string;
  type: 'weight' | 'reps' | 'volume';
  value: number;
  unit?: string;
}

interface PostWorkoutSummaryProps {
  workoutName: string;
  duration: number; // minutes
  setsCompleted: number;
  totalVolume: number; // lbs or kg
  exerciseCount: number;
  prs?: PR[];
  onClose: () => void;
  onViewDetails?: () => void;
}

function formatVolume(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k`;
  }
  return volume.toLocaleString();
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function getPRLabel(pr: PR): string {
  switch (pr.type) {
    case 'weight':
      return `${pr.value} ${pr.unit || 'lbs'}`;
    case 'reps':
      return `${pr.value} reps`;
    case 'volume':
      return `${formatVolume(pr.value)} ${pr.unit || 'lbs'}`;
    default:
      return `${pr.value}`;
  }
}

export function PostWorkoutSummary({
  workoutName,
  duration,
  setsCompleted,
  totalVolume,
  exerciseCount,
  prs = [],
  onClose,
  onViewDetails,
}: PostWorkoutSummaryProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Summary Card - slides up from bottom on mobile, fades in centered on desktop */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative bg-white dark:bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - clean, not celebratory */}
          <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                  Workout Complete
                </p>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mt-0.5">
                  {workoutName}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Duration */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide font-medium">Duration</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {formatDuration(duration)}
                </p>
              </div>

              {/* Sets */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <Dumbbell className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide font-medium">Sets</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {setsCompleted}
                </p>
              </div>

              {/* Volume */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide font-medium">Volume</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {formatVolume(totalVolume)}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">lbs</span>
                </p>
              </div>

              {/* Exercises */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <span className="text-xs uppercase tracking-wide font-medium">Exercises</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {exerciseCount}
                </p>
              </div>
            </div>

            {/* PRs Section - only if any */}
            {prs.length > 0 && (
              <div className="mt-4 sm:mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Personal Records
                  </span>
                </div>
                <div className="space-y-2">
                  {prs.map((pr, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg px-3 py-2"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                        {pr.exerciseName}
                      </span>
                      <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                        {getPRLabel(pr)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-2">
            {onViewDetails && (
              <button
                onClick={onViewDetails}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl font-medium transition-colors text-sm sm:text-base"
              >
                View Details
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default PostWorkoutSummary;
