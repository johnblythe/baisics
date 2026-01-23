'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Crown, Share2, X } from 'lucide-react';

type StreakTier = 'week' | 'month' | 'quarter';

interface StreakCelebrationProps {
  streakDays: number;
  streakTier: StreakTier;
  userName?: string;
  onClose: () => void;
  onShare?: () => void;
}

const TIER_CONFIG: Record<StreakTier, {
  icon: typeof Flame;
  gradient: string;
  bgAccent: string;
  label: string;
  message: string;
}> = {
  week: {
    icon: Flame,
    gradient: 'from-orange-400 to-amber-500',
    bgAccent: 'bg-orange-50 dark:bg-orange-950/30',
    label: '7-Day Streak',
    message: 'A week of showing up. That takes discipline.',
  },
  month: {
    icon: Flame,
    gradient: 'from-orange-500 to-red-500',
    bgAccent: 'bg-red-50 dark:bg-red-950/30',
    label: '30-Day Streak',
    message: 'A full month of consistency. This is becoming a habit.',
  },
  quarter: {
    icon: Crown,
    gradient: 'from-amber-400 to-yellow-500',
    bgAccent: 'bg-amber-50 dark:bg-amber-950/30',
    label: '90-Day Streak',
    message: 'Three months strong. You\'ve built something real.',
  },
};

export function StreakCelebration({
  streakDays,
  streakTier,
  userName = 'Athlete',
  onClose,
  onShare,
}: StreakCelebrationProps) {
  const config = TIER_CONFIG[streakTier];
  const Icon = config.icon;

  const handleShare = async () => {
    const shareText = `${streakDays}-day workout streak on BAISICS. Showing up matters.`;
    const shareUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/achievements`
      : '';

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${streakDays}-Day Streak - BAISICS`,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    }
    onShare?.();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Header */}
          <div className={`bg-gradient-to-br ${config.gradient} p-6 sm:p-8 text-center text-white`}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 15 }}
              className="mb-3"
            >
              <Icon
                className="w-12 h-12 sm:w-16 sm:h-16 mx-auto"
                strokeWidth={1.5}
                fill={streakTier === 'quarter' ? 'currentColor' : 'none'}
              />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider mb-1 opacity-80">
                {config.label}
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold mb-1">
                {streakDays} Days
              </h2>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`${config.bgAccent} rounded-xl p-4 text-center`}
            >
              <p className="text-gray-700 dark:text-gray-200 text-sm sm:text-base">
                {config.message}
              </p>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-2"
            >
              {onShare && (
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-[#FF6B6B] hover:bg-[#EF5350] text-white rounded-xl font-medium transition-colors text-sm sm:text-base"
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  Share Streak
                </button>
              )}

              <button
                onClick={onClose}
                className="w-full px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors text-sm"
              >
                Keep Going
              </button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default StreakCelebration;
