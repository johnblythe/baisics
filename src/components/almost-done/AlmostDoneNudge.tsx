'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, ArrowRight } from 'lucide-react';

interface AlmostDoneNudgeProps {
  workoutsRemaining: number;
  totalWorkouts: number;
  programName: string;
  onClose: () => void;
  onStartWorkout?: () => void;
  variant?: 'modal' | 'banner';
}

export function AlmostDoneNudge({
  workoutsRemaining,
  totalWorkouts,
  programName,
  onClose,
  onStartWorkout,
  variant = 'modal',
}: AlmostDoneNudgeProps) {
  const completedWorkouts = totalWorkouts - workoutsRemaining;
  const percentComplete = Math.round((completedWorkouts / totalWorkouts) * 100);

  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="w-full max-w-sm sm:max-w-md bg-gradient-to-r from-[#FF6B6B] to-[#EF5350] rounded-xl p-4 shadow-lg relative"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-lg">
              {workoutsRemaining} workout{workoutsRemaining !== 1 ? 's' : ''} left!
            </p>
            <p className="text-white/80 text-sm">
              You&apos;re {percentComplete}% through {programName}
            </p>
          </div>
        </div>

        {onStartWorkout && (
          <button
            onClick={onStartWorkout}
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-[#FF6B6B] font-semibold rounded-lg hover:bg-white/90 transition-colors"
          >
            Let&apos;s finish strong
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    );
  }

  // Modal variant
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
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-[#FF6B6B] to-[#EF5350] p-6 text-center text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 15 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center"
            >
              <Zap className="w-8 h-8 text-white" fill="white" />
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-3xl font-bold mb-1">
                {workoutsRemaining} workout{workoutsRemaining !== 1 ? 's' : ''} left!
              </h2>
              <p className="text-white/90">
                You&apos;re so close to completing {programName}
              </p>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#64748B]">Program progress</span>
                <span className="font-semibold text-[#0F172A]">{percentComplete}%</span>
              </div>
              <div className="h-3 bg-[#F1F5F9] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentComplete}%` }}
                  transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#EF5350] rounded-full"
                />
              </div>
              <p className="text-xs text-[#94A3B8] mt-2 text-center">
                {completedWorkouts} of {totalWorkouts} workouts completed
              </p>
            </div>

            {/* Motivational message */}
            <div className="bg-[#F8FAFC] rounded-xl p-4 mb-6 text-center">
              <p className="text-[#0F172A] font-medium">
                You&apos;ve put in the work. Now it&apos;s time to finish what you started.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {onStartWorkout && (
                <button
                  onClick={onStartWorkout}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#FF6B6B] text-white font-semibold rounded-xl hover:bg-[#EF5350] transition-colors shadow-lg shadow-[#FF6B6B]/25"
                >
                  Let&apos;s finish strong
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={onClose}
                className="w-full px-6 py-3 text-[#64748B] font-medium hover:text-[#0F172A] transition-colors text-center"
              >
                I&apos;ll come back later
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default AlmostDoneNudge;
