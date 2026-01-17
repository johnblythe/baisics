'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import { Star, Share2, X, Check, ArrowRight } from 'lucide-react';
import { formatVolume } from '@/lib/milestones';
import { MilestoneBadge } from '@/components/milestones/MilestoneBadge';

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

  // Auto-advance timer (5 seconds)
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(5);
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    // Stop confetti after 3 seconds (tasteful, not overwhelming)
    const confettiTimer = setTimeout(() => setShowConfetti(false), 3000);

    return () => {
      clearTimeout(confettiTimer);
    };
  }, []);

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

  // Auto-advance countdown
  useEffect(() => {
    if (userInteracted) return;

    const timer = setInterval(() => {
      setAutoAdvanceTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [userInteracted, onClose]);

  const handleInteraction = useCallback(() => {
    setUserInteracted(true);
  }, []);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/achievements?milestone=WORKOUT_1`
    : '';

  const shareText = `I just completed my first workout on BAISICS! \n\n${animatedSets} sets \u2022 ${formatVolume(animatedVolume)} volume\n\n"The first rep is the hardest one to take."`;

  const handleShare = async () => {
    handleInteraction();
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
    handleInteraction();
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTwitterShare = () => {
    handleInteraction();
    const text = encodeURIComponent(
      `I just completed my first workout on @baisicsapp! \n\n${animatedSets} sets \u2022 ${formatVolume(animatedVolume)} volume\n\n"The first rep is the hardest one to take."\n\n${shareUrl}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleContinue = () => {
    handleInteraction();
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        onClick={handleInteraction}
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
          className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
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
          <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-8 text-center text-white relative overflow-hidden">
            {/* Star burst decoration */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', damping: 15 }}
              className="relative inline-block"
            >
              <div className="absolute inset-0">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.5, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="absolute w-1 h-8 bg-white/30 rounded-full"
                    style={{
                      transform: `rotate(${i * 45}deg)`,
                      transformOrigin: 'center 40px',
                      left: '50%',
                      marginLeft: '-2px',
                      top: '-30px',
                    }}
                  />
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', damping: 15 }}
              className="mb-4"
            >
              <Star className="w-16 h-16 mx-auto" strokeWidth={1.5} />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-2 opacity-80">
                First Workout Complete!
              </h2>
              <h3 className="text-3xl font-bold mb-2">You Did It!</h3>
              <p className="text-white/90">
                You&apos;re officially a <span className="font-bold">baisics athlete</span>.
              </p>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Badge Earned Section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center"
            >
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">
                Badge Earned
              </h4>
              <div className="flex flex-col items-center gap-3">
                <MilestoneBadge
                  type="WORKOUT_1"
                  earned={true}
                  size="lg"
                  showLabel={true}
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 italic max-w-xs">
                  &ldquo;The first rep is the hardest one to take.&rdquo;
                </p>
              </div>
            </motion.div>

            {/* Workout Stats */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4"
            >
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                What you accomplished:
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FF6B6B]/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-[#FF6B6B]" />
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {animatedSets} sets completed
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FF6B6B]/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-[#FF6B6B]" />
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium">
                    ~{formatVolume(animatedVolume)} total volume
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FF6B6B]/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-[#FF6B6B]" />
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium">
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
              className="space-y-3"
            >
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FF6B6B] hover:bg-[#EF5350] text-white rounded-xl font-medium transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Share Achievement
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleTwitterShare}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Post on X
                </button>
                <button
                  onClick={handleCopy}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-colors ${
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
                      Copy Link
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={handleContinue}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {!userInteracted && (
                  <span className="text-sm text-gray-400">
                    ({autoAdvanceTimer}s)
                  </span>
                )}
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
