'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import { Star, Share2, X, Check, ArrowRight } from 'lucide-react';
import { formatVolume } from '@/lib/milestones';
import { MilestoneBadge } from '@/components/milestones/MilestoneBadge';
import { isTripodModeEnabled, getSnarkyVolumeComment } from '@/lib/tripod-mode';

interface FirstWorkoutCelebrationProps {
  setsCompleted: number;
  totalVolume: number;
  workoutName: string;
  userName?: string;
  onClose: () => void;
  onShare?: () => void;
}

export function FirstWorkoutCelebration({
  setsCompleted,
  totalVolume,
  workoutName,
  userName = 'Athlete',
  onClose,
  onShare,
}: FirstWorkoutCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [copied, setCopied] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [animatedSets, setAnimatedSets] = useState(0);
  const [animatedVolume, setAnimatedVolume] = useState(0);
  const [tripodMode, setTripodMode] = useState(false);
  const [snarkyComment, setSnarkyComment] = useState<string | null>(null);

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    // Check tripod mode and set snarky comment
    if (isTripodModeEnabled()) {
      setTripodMode(true);
      setSnarkyComment(getSnarkyVolumeComment(totalVolume));
    }

    // Stop confetti after 3 seconds (tasteful, not overwhelming)
    const confettiTimer = setTimeout(() => setShowConfetti(false), 3000);

    return () => {
      clearTimeout(confettiTimer);
    };
  }, [totalVolume]);

  // Animate stats counting up
  useEffect(() => {
    const duration = 1000; // 1 second animation
    const startTime = Date.now();
    const targetSets = setsCompleted;
    const targetVolume = totalVolume;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedSets(Math.round(targetSets * easeOut));
      setAnimatedVolume(Math.round(targetVolume * easeOut));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    // Start animation after initial delay (when stats section fades in)
    const startDelay = setTimeout(() => {
      requestAnimationFrame(animate);
    }, 1200);

    return () => clearTimeout(startDelay);
  }, [setsCompleted, totalVolume]);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/achievements?milestone=WORKOUT_1`
    : '';

  const shareText = `I just completed my first workout on BAISICS! \n\n${animatedSets} sets \u2022 ${formatVolume(animatedVolume)} volume\n\nEveryone starts somewhere. I just started.`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'First Workout Complete! - BAISICS',
          text: shareText,
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
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(
      `I just completed my first workout on @baisicsapp! \n\n${animatedSets} sets \u2022 ${formatVolume(animatedVolume)} volume\n\nEveryone starts somewhere. I just started.\n\n${shareUrl}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleContinue = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        {/* Confetti - tasteful, 2-3 seconds max */}
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
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          onClick={handleContinue}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleContinue}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Header with celebration announcement */}
          <div className="bg-gradient-to-br from-[#FF6B6B] to-[#EF5350] p-6 sm:p-8 text-center text-white relative overflow-hidden">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', damping: 15 }}
              className="mb-3"
            >
              <Star className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="white" strokeWidth={0} />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider mb-1 opacity-80">
                First Workout Complete!
              </h2>
              <h3 className="text-2xl sm:text-3xl font-bold mb-1">You Did It!</h3>
              <p className="text-white/90 text-sm sm:text-base">
                You&apos;re officially a <span className="font-bold">baisics athlete</span>.
              </p>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
            {/* Badge Earned Section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center"
            >
              <h4 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                Badge Earned
              </h4>
              <div className="flex flex-col items-center gap-2">
                <MilestoneBadge
                  type="WORKOUT_1"
                  earned={true}
                  size="lg"
                  showLabel={true}
                />
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 italic max-w-xs">
                  You just took the hardest step: the first one.
                </p>
              </div>
            </motion.div>

            {/* Workout Stats */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 sm:p-4"
            >
              <h4 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                What you accomplished:
              </h4>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FF6B6B] flex-shrink-0" />
                  <span className="text-sm text-gray-900 dark:text-white font-medium">
                    {animatedSets} sets completed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FF6B6B] flex-shrink-0" />
                  <div>
                    <span className="text-sm text-gray-900 dark:text-white font-medium">
                      ~{formatVolume(animatedVolume)} total volume
                    </span>
                    {tripodMode && snarkyComment && (
                      <p className="text-xs text-[#FF6B6B] italic mt-0.5">
                        {snarkyComment}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FF6B6B] flex-shrink-0" />
                  <span className="text-sm text-gray-900 dark:text-white font-medium">
                    First step of your journey
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Share Actions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="space-y-2"
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
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Post on X
                </button>
                <button
                  onClick={handleCopy}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-colors text-sm font-medium ${
                    copied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#0F172A] hover:bg-[#1E293B] text-white'
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
                      Copy Link
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={handleContinue}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
              >
                <span>Continue to Home</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default FirstWorkoutCelebration;
