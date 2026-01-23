'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MilestoneConfig, getMilestoneConfig, getNextMilestone, formatVolume, MILESTONES } from '@/lib/milestones';
import { MilestoneType } from '@prisma/client';
import {
  Star,
  Flame,
  Medal,
  Dumbbell,
  Crown,
  Diamond,
  CalendarCheck,
  Trophy,
  Infinity,
  Share2,
  X,
  Check,
} from 'lucide-react';
import ReactConfetti from 'react-confetti';
import { MilestoneBadge } from './MilestoneBadge';

const ICON_MAP: Record<string, React.ElementType> = {
  star: Star,
  flame: Flame,
  medal: Medal,
  dumbbell: Dumbbell,
  crown: Crown,
  diamond: Diamond,
  'calendar-check': CalendarCheck,
  trophy: Trophy,
  infinity: Infinity,
};

interface MilestoneCelebrationModalProps {
  type: MilestoneType;
  totalWorkouts: number;
  totalVolume?: number;
  earnedMilestones: { type: MilestoneType; earnedAt: Date }[];
  userName?: string;
  onClose: () => void;
  onShare?: () => void;
}

export function MilestoneCelebrationModal({
  type,
  totalWorkouts,
  totalVolume,
  earnedMilestones,
  userName = 'Athlete',
  onClose,
  onShare,
}: MilestoneCelebrationModalProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [copied, setCopied] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const config = getMilestoneConfig(type);
  const nextMilestone = getNextMilestone(totalWorkouts);
  const earnedSet = new Set(earnedMilestones.map((m) => m.type));

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    // Stop confetti after 3 seconds
    const timer = setTimeout(() => setShowConfetti(false), 3000);

    // Auto-close after 5 seconds if no interaction (optional)
    // const autoClose = setTimeout(onClose, 5000);

    return () => {
      clearTimeout(timer);
      // clearTimeout(autoClose);
    };
  }, []);

  if (!config) return null;

  const Icon = ICON_MAP[config.icon] || Star;

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/achievements?milestone=${type}`
    : '';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${config.name} - BAISICS Milestone`,
          text: `I just earned the ${config.name} badge on BAISICS! "${config.quote}"`,
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopy();
    }
    onShare?.();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `I just earned the ${config.name} badge on BAISICS!\n\n"${config.quote}"\n\n${shareUrl}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(
      `I just earned the ${config.name} badge on @baisicsapp! 🏆\n\n"${config.quote}"\n\n${totalWorkouts} total workouts and counting!\n\n${shareUrl}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        {/* Confetti */}
        {showConfetti && (
          <ReactConfetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={200}
            gravity={0.2}
            colors={['#FF6B6B', '#0F172A', '#FFD700', '#4ADE80', '#60A5FA']}
          />
        )}

        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Header with milestone announcement */}
          <div className={`bg-gradient-to-br ${config.gradient} p-6 sm:p-8 text-center text-white`}>
            {/* Star burst decoration */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', damping: 15 }}
              className="relative inline-block"
            >
              <div className="absolute inset-0 animate-pulse">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-6 sm:h-8 bg-white/30 rounded-full"
                    style={{
                      transform: `rotate(${i * 45}deg)`,
                      transformOrigin: 'center 32px',
                      left: '50%',
                      marginLeft: '-2px',
                      top: '-24px',
                    }}
                  />
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', damping: 15 }}
              className="text-5xl sm:text-6xl mb-3 sm:mb-4"
            >
              <Icon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" strokeWidth={1.5} />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider mb-1 sm:mb-2 opacity-80">
                Milestone Unlocked
              </h2>
              <h3 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{config.name}</h3>
            </motion.div>
          </div>

          {/* Stats & Journey */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Journey So Far */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <h4 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">
                Your Journey So Far
              </h4>
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {MILESTONES.slice(0, 5).map((milestone) => (
                  <MilestoneBadge
                    key={milestone.type}
                    type={milestone.type}
                    earned={earnedSet.has(milestone.type) || milestone.type === type}
                    size="sm"
                    showLabel={false}
                  />
                ))}
              </div>
              {MILESTONES.length > 5 && (
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 justify-center">
                  {MILESTONES.slice(5).map((milestone) => (
                    <MilestoneBadge
                      key={milestone.type}
                      type={milestone.type}
                      earned={earnedSet.has(milestone.type) || milestone.type === type}
                      size="sm"
                      showLabel={false}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Next Milestone Progress */}
            {nextMilestone && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 sm:p-4"
              >
                <div className="flex justify-between text-xs sm:text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Next milestone</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {nextMilestone.name}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${nextMilestone.gradient}`}
                    style={{ width: `${(totalWorkouts / nextMilestone.threshold) * 100}%` }}
                  />
                </div>
                <div className="mt-1.5 sm:mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                  {nextMilestone.threshold - totalWorkouts} workouts to go
                </div>
              </motion.div>
            )}

            {/* Share Actions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="space-y-2 sm:space-y-3"
            >
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-[#FF6B6B] hover:bg-[#EF5350] text-white rounded-xl font-medium transition-colors text-sm sm:text-base"
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                Share Achievement
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleTwitterShare}
                  className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors text-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="hidden xs:inline">Post on</span> X
                </button>
                <button
                  onClick={handleCopy}
                  className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl transition-colors text-sm ${
                    copied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors text-sm"
              >
                Continue
              </button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default MilestoneCelebrationModal;
