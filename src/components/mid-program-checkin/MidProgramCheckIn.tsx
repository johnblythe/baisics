'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type CheckInOption = 'going_great' | 'need_adjustment' | 'taking_break';

interface MidProgramCheckInProps {
  weekNumber: number;
  totalWeeks: number;
  programName: string;
  completedWorkouts: number;
  volumeGrowth: number;
  onResponse: (option: CheckInOption) => void;
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
    emoji: '🔥',
    label: 'Going great!',
    description: "I'm crushing it and want to keep going",
  },
  {
    id: 'need_adjustment',
    emoji: '🔧',
    label: 'Need adjustment',
    description: "Something's not quite right - let's tweak it",
  },
  {
    id: 'taking_break',
    emoji: '⏸️',
    label: 'Taking a break',
    description: 'Need to pause for now, life is busy',
  },
];

export function MidProgramCheckIn({
  weekNumber,
  totalWeeks,
  programName,
  completedWorkouts,
  volumeGrowth,
  onResponse,
  onDismiss,
}: MidProgramCheckInProps) {
  const [selectedOption, setSelectedOption] = useState<CheckInOption | null>(null);

  const progressPercent = Math.round((weekNumber / totalWeeks) * 100);
  const isHalfway = weekNumber >= Math.floor(totalWeeks / 2);
  const volumeFormatted = volumeGrowth >= 0 ? `+${volumeGrowth}%` : `${volumeGrowth}%`;

  const handleSubmit = () => {
    if (!selectedOption) return;
    onResponse(selectedOption);
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
          className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-8 bg-gradient-to-br from-[#FFE5E5] to-white text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FFE5E5] flex items-center justify-center">
              <span className="text-3xl">{isHalfway ? '🎯' : '📊'}</span>
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A] mb-2">
              Week {weekNumber} Check-in
            </h2>
            <p className="text-[#475569]">
              {isHalfway ? "You're past the halfway mark!" : "Great progress so far!"} How are you feeling?
            </p>
          </div>

          {/* Progress Stats */}
          <div className="px-6 py-4 bg-[#F8FAFC] border-y border-[#E2E8F0]">
            <p
              className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-3"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Your progress in {programName}
            </p>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#64748B]">Week {weekNumber} of {totalWeeks}</span>
                <span className="font-medium text-[#0F172A]">{progressPercent}%</span>
              </div>
              <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-full"
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 border border-[#E2E8F0]">
                <p className="text-2xl font-bold text-[#0F172A]">{completedWorkouts}</p>
                <p className="text-xs text-[#64748B]">Workouts completed</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-[#E2E8F0]">
                <p className={`text-2xl font-bold ${volumeGrowth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {volumeFormatted}
                </p>
                <p className="text-xs text-[#64748B]">Volume since start</p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="px-6 py-6">
            <div className="space-y-3">
              {OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className={`
                    w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-start gap-3
                    ${
                      selectedOption === option.id
                        ? 'border-[#FF6B6B] bg-[#FFE5E5]/50 shadow-md'
                        : 'border-[#E2E8F0] hover:border-[#FF6B6B]/50 hover:bg-[#F8FAFC]'
                    }
                  `}
                >
                  <span className="text-2xl flex-shrink-0">{option.emoji}</span>
                  <div>
                    <div className="font-semibold text-[#0F172A]">{option.label}</div>
                    <div className="text-sm text-[#64748B]">{option.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 pb-6 space-y-3">
            <button
              onClick={handleSubmit}
              disabled={!selectedOption}
              className={`
                w-full px-6 py-4 font-semibold rounded-xl transition-all duration-200
                ${
                  selectedOption
                    ? 'bg-[#FF6B6B] text-white hover:bg-[#EF5350] shadow-lg shadow-[#FF6B6B]/25'
                    : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                }
              `}
            >
              Continue
            </button>

            <button
              onClick={onDismiss}
              className="w-full px-6 py-3 text-[#64748B] font-medium hover:text-[#0F172A] transition-colors text-center"
            >
              Ask me later
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default MidProgramCheckIn;
