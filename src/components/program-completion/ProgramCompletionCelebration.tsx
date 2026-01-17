'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import { Trophy, Share2, X, Check, ArrowRight, TrendingUp, Calendar, Dumbbell } from 'lucide-react';
import { formatVolume } from '@/lib/milestones';
import type { ProgramCompletionData } from '@/app/api/programs/[programId]/completion/route';

interface ProgramCompletionCelebrationProps {
  data: ProgramCompletionData;
  onClose: () => void;
  onNextProgram?: () => void;
}

export function ProgramCompletionCelebration({
  data,
  onClose,
  onNextProgram,
}: ProgramCompletionCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [copied, setCopied] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [animatedWorkouts, setAnimatedWorkouts] = useState(0);
  const [animatedVolume, setAnimatedVolume] = useState(0);
  const [animatedSets, setAnimatedSets] = useState(0);

  // Auto-advance timer (10 seconds - longer for program completion)
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(10);
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    // Stop confetti after 4 seconds (slightly longer for big milestone)
    const confettiTimer = setTimeout(() => setShowConfetti(false), 4000);

    return () => {
      clearTimeout(confettiTimer);
    };
  }, []);

  // Animate stats counting up
  useEffect(() => {
    const duration = 1500; // 1.5 second animation
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedWorkouts(Math.round(data.totalWorkouts * easeOut));
      setAnimatedVolume(Math.round(data.totalVolume * easeOut));
      setAnimatedSets(Math.round(data.totalSets * easeOut));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    // Start animation after initial delay
    const startDelay = setTimeout(() => {
      requestAnimationFrame(animate);
    }, 1000);

    return () => clearTimeout(startDelay);
  }, [data.totalWorkouts, data.totalVolume, data.totalSets]);

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
    ? `${window.location.origin}/share/program-completion?programId=${data.programId}`
    : '';

  const shareText = `I just completed "${data.programName}" on BAISICS!\n\n${data.totalWorkouts} workouts \u2022 ${formatVolume(data.totalVolume)} volume \u2022 ${data.durationWeeks} weeks\n\n${data.volumeGrowth > 0 ? `+${data.volumeGrowth}% volume growth!` : 'Program crushed!'}`;

  const handleShare = async () => {
    handleInteraction();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Program Complete! - ${data.programName}`,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopy();
    }
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
      `I just completed "${data.programName}" on @baisicsapp!\n\n${data.totalWorkouts} workouts \u2022 ${formatVolume(data.totalVolume)} volume\n\n${shareUrl}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleContinue = () => {
    handleInteraction();
    onClose();
  };

  const handleNextProgram = () => {
    handleInteraction();
    onNextProgram?.();
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleInteraction}
      >
        {/* Confetti - more celebratory for program completion */}
        {showConfetti && (
          <ReactConfetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={300}
            gravity={0.15}
            colors={['#FF6B6B', '#0F172A', '#FFD700', '#4ADE80', '#60A5FA', '#A78BFA']}
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
          className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto"
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
          <div className="bg-gradient-to-br from-[#FF6B6B] to-[#0F172A] p-8 text-center text-white relative overflow-hidden">
            {/* Animated trophy icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', damping: 15 }}
              className="relative inline-block mb-4"
            >
              <div className="w-20 h-20 mx-auto rounded-2xl bg-white/20 flex items-center justify-center">
                <Trophy className="w-10 h-10" strokeWidth={1.5} />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-2 opacity-80">
                Program Complete!
              </h2>
              <h3 className="text-2xl font-bold mb-2">{data.programName}</h3>
              <p className="text-white/90">
                You did it! <span className="font-bold">{data.durationWeeks} weeks</span> of hard work paid off.
              </p>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Stats Grid */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-3"
            >
              <div className="bg-[#FFE5E5] rounded-xl p-4 text-center">
                <Dumbbell className="w-6 h-6 mx-auto text-[#FF6B6B] mb-2" />
                <div className="text-2xl font-bold text-[#0F172A]">{animatedWorkouts}</div>
                <div className="text-xs text-[#64748B] font-medium">Workouts</div>
              </div>
              <div className="bg-[#F8FAFC] rounded-xl p-4 text-center">
                <TrendingUp className="w-6 h-6 mx-auto text-[#0F172A] mb-2" />
                <div className="text-2xl font-bold text-[#0F172A]">{formatVolume(animatedVolume)}</div>
                <div className="text-xs text-[#64748B] font-medium">Total Volume</div>
              </div>
              <div className="bg-[#F0FDF4] rounded-xl p-4 text-center">
                <Calendar className="w-6 h-6 mx-auto text-emerald-600 mb-2" />
                <div className="text-2xl font-bold text-[#0F172A]">{animatedSets}</div>
                <div className="text-xs text-[#64748B] font-medium">Sets Logged</div>
              </div>
            </motion.div>

            {/* Progress Comparison */}
            {data.volumeGrowth !== 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-gradient-to-r from-[#F8FAFC] to-white rounded-xl p-4 border border-[#E2E8F0]"
              >
                <h4 className="text-sm font-semibold text-[#64748B] mb-3">
                  Week 1 vs Final Week
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#94A3B8]">First Week</p>
                    <p className="text-lg font-bold text-[#0F172A]">{formatVolume(data.firstWeekVolume)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 text-[#94A3B8]" />
                    <div className={`px-3 py-1 rounded-full font-bold text-sm ${
                      data.volumeGrowth > 0
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {data.volumeGrowth > 0 ? '+' : ''}{data.volumeGrowth}%
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[#94A3B8]">Final Week</p>
                    <p className="text-lg font-bold text-[#FF6B6B]">{formatVolume(data.finalWeekVolume)}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Share Actions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.0 }}
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

              {/* Next Program CTA */}
              {onNextProgram && (
                <button
                  onClick={handleNextProgram}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl font-medium transition-colors"
                >
                  Start Your Next Program
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleContinue}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {!userInteracted && (
                  <span className="text-sm text-gray-400">
                    ({autoAdvanceTimer}s)
                  </span>
                )}
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ProgramCompletionCelebration;
