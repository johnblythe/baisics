'use client';

import React from 'react';
import { COLORS } from '@/lib/design/colors';

export interface DayTypePillProps {
  dayType: 'training' | 'rest';
  hasRestDayTargets: boolean;
  isPremium: boolean;
  onToggle: () => void;
  onUpgrade: () => void;
}

export function DayTypePill({
  dayType,
  hasRestDayTargets,
  isPremium,
  onToggle,
  onUpgrade,
}: DayTypePillProps) {
  // Hidden when single-target mode (no rest columns) AND user is not premium
  if (!hasRestDayTargets && !isPremium) return null;

  const isTraining = dayType === 'training';

  const handleClick = () => {
    if (isPremium) {
      onToggle();
    } else {
      onUpgrade();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white transition-colors duration-200"
      style={{
        backgroundColor: isTraining ? COLORS.coral : COLORS.navyLight,
      }}
    >
      {isTraining ? 'Training Day' : 'Rest Day'}
      {!isPremium && (
        <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )}
    </button>
  );
}
