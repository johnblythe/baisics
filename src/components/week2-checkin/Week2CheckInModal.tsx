'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import type { Week2CheckInData } from '@/app/api/programs/[programId]/week2-checkin/route';

type CheckInOption = 'going_great' | 'too_hard' | 'too_easy' | 'life_happened';

interface Week2CheckInModalProps {
  data: Week2CheckInData;
  programId: string;
  onComplete: (option: CheckInOption) => void;
  onDismiss: () => void;
}

const OPTIONS: {
  id: CheckInOption;
  emoji: string;
  label: string;
  description: string;
}[] = [
  {
    id: 'going_great',
    emoji: '💪',
    label: "Going great!",
    description: "I'm enjoying the program and feeling good",
  },
  {
    id: 'too_hard',
    emoji: '😤',
    label: 'Too hard',
    description: "The workouts feel overwhelming or too intense",
  },
  {
    id: 'too_easy',
    emoji: '🚀',
    label: 'Too easy',
    description: "I'd like more of a challenge",
  },
  {
    id: 'life_happened',
    emoji: '🌊',
    label: 'Life got in the way',
    description: "Struggling to find time or stay consistent",
  },
];

export function Week2CheckInModal({
  data,
  programId,
  onComplete,
  onDismiss,
}: Week2CheckInModalProps) {
  const [selectedOption, setSelectedOption] = useState<CheckInOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  const handleSubmit = async () => {
    if (!selectedOption) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/programs/${programId}/week2-checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option: selectedOption }),
      });

      const result = await response.json();
      if (response.ok) {
        setResultMessage(result.message);
        setShowResult(true);

        // Auto-dismiss after showing result
        setTimeout(() => {
          onComplete(selectedOption);
        }, 2500);
      }
    } catch (error) {
      console.error('Failed to submit check-in:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format the training goal for display
  const formatGoal = (goal: string | null): string => {
    if (!goal) return 'general fitness';
    const goalMap: Record<string, string> = {
      muscle_gain: 'building muscle',
      fat_loss: 'losing fat',
      strength: 'getting stronger',
      general_fitness: 'general fitness',
      endurance: 'improving endurance',
      athletic_performance: 'athletic performance',
    };
    return goalMap[goal] || goal.replace(/_/g, ' ');
  };

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
          className="w-full max-w-sm sm:max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <AnimatePresence mode="wait">
            {!showResult ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Header */}
                <div className="px-4 sm:px-6 py-6 sm:py-8 bg-gradient-to-br from-[#FFE5E5] to-white text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-[#FFE5E5] flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl">👋</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-1 sm:mb-2">
                    Week {data.programStats.weekNumber} Check-in
                  </h2>
                  <p className="text-sm sm:text-base text-[#475569]">
                    You&apos;ve completed {data.completedWorkouts} workouts! How&apos;s it going?
                  </p>
                </div>

                {/* Original Goals Reminder */}
                {data.originalGoals.trainingGoal && (
                  <div className="px-4 sm:px-6 py-3 sm:py-4 bg-[#F8FAFC] border-y border-[#E2E8F0]">
                    <p
                      className="text-[10px] sm:text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-1 sm:mb-2"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                      Your original goal
                    </p>
                    <p className="text-sm sm:text-base text-[#0F172A] font-medium">
                      {formatGoal(data.originalGoals.trainingGoal)}
                      {data.originalGoals.daysAvailable && (
                        <span className="text-[#64748B]">
                          {' '}
                          • {data.originalGoals.daysAvailable} days/week
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* Options Grid - stacks on very small screens */}
                <div className="px-4 sm:px-6 py-4 sm:py-6">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedOption(option.id)}
                        className={`
                          p-3 sm:p-4 rounded-xl border-2 text-left transition-all duration-200
                          ${
                            selectedOption === option.id
                              ? 'border-[#FF6B6B] bg-[#FFE5E5]/50 shadow-md'
                              : 'border-[#E2E8F0] hover:border-[#FF6B6B]/50 hover:bg-[#F8FAFC]'
                          }
                        `}
                      >
                        <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{option.emoji}</div>
                        <div className="font-semibold text-sm sm:text-base text-[#0F172A] mb-0.5 sm:mb-1">{option.label}</div>
                        <div className="text-[11px] sm:text-xs text-[#64748B] leading-tight">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-2 sm:space-y-3">
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedOption || isSubmitting}
                    className={`
                      w-full px-4 sm:px-6 py-3 sm:py-4 font-semibold rounded-xl transition-all duration-200 text-sm sm:text-base
                      ${
                        selectedOption && !isSubmitting
                          ? 'bg-[#FF6B6B] text-white hover:bg-[#EF5350] shadow-lg shadow-[#FF6B6B]/25'
                          : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                      }
                    `}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      'Continue'
                    )}
                  </button>

                  <button
                    onClick={onDismiss}
                    className="w-full px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-[#64748B] font-medium hover:text-[#0F172A] transition-colors text-center"
                  >
                    Ask me later
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-6 py-12 text-center"
              >
                {/* Success Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.1 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E] flex items-center justify-center"
                >
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-xl font-bold text-[#0F172A] mb-2">Thanks for the feedback!</h3>
                  <p className="text-[#475569] mb-6">{resultMessage}</p>

                  {/* Show adjustment link if "too_hard" was selected */}
                  {selectedOption === 'too_hard' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Link
                        href={`/dashboard/${programId}/adjust`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#FF6B6B] font-semibold rounded-xl border-2 border-[#FF6B6B] hover:bg-[#FFE5E5] transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                          />
                        </svg>
                        Adjust Program Difficulty
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default Week2CheckInModal;
