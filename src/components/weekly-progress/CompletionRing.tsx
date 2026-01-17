'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CompletionRingProps {
  completed: number;
  target: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

// Copy variants based on progress state (from design doc)
const PROGRESS_MESSAGES: Record<string, (completed: number, target: number) => string> = {
  '0': () => 'Fresh week. Let\'s go.',
  'partial_low': () => 'Off to a good start.',
  'partial_mid': () => 'Halfway there. Keep it up.',
  'partial_high': (completed, target) => `${target - completed} more to close the ring.`,
  'complete': () => 'Week complete. Nice work.',
};

function getProgressMessage(completed: number, target: number): string {
  if (completed === 0) return PROGRESS_MESSAGES['0'](completed, target);
  if (completed >= target) return PROGRESS_MESSAGES['complete'](completed, target);

  const ratio = completed / target;
  if (ratio < 0.4) return PROGRESS_MESSAGES['partial_low'](completed, target);
  if (ratio < 0.75) return PROGRESS_MESSAGES['partial_mid'](completed, target);
  return PROGRESS_MESSAGES['partial_high'](completed, target);
}

const SIZE_CONFIG = {
  sm: { viewBox: 100, radius: 42, strokeWidth: 6, fontSize: 'text-lg', subFontSize: 'text-xs' },
  md: { viewBox: 100, radius: 42, strokeWidth: 8, fontSize: 'text-2xl', subFontSize: 'text-sm' },
  lg: { viewBox: 100, radius: 45, strokeWidth: 8, fontSize: 'text-3xl', subFontSize: 'text-base' },
};

export function CompletionRing({
  completed,
  target,
  size = 'md',
  showLabel = true,
  className = '',
}: CompletionRingProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const config = SIZE_CONFIG[size];
  const circumference = 2 * Math.PI * config.radius;
  const percent = Math.min(100, (completed / target) * 100);
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  // Accessibility: announce progress to screen readers
  const ariaLabel = `${completed} of ${target} workouts completed this week, ${Math.round(percent)} percent`;

  return (
    <div
      className={`relative ${className}`}
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        className={`-rotate-90 ${size === 'sm' ? 'w-24 h-24' : size === 'md' ? 'w-32 h-32' : 'w-40 h-40'}`}
        viewBox={`0 0 ${config.viewBox} ${config.viewBox}`}
      >
        {/* Background circle - navy stroke */}
        <circle
          cx={config.viewBox / 2}
          cy={config.viewBox / 2}
          r={config.radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={config.strokeWidth}
        />

        {/* Progress circle - coral fill with animation */}
        <motion.circle
          cx={config.viewBox / 2}
          cy={config.viewBox / 2}
          r={config.radius}
          fill="none"
          stroke="#FF6B6B"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: mounted ? strokeDashoffset : circumference
          }}
          transition={{
            duration: 1,
            ease: 'easeOut',
            delay: 0.2,
          }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold text-[#0F172A] ${config.fontSize}`}>
          {completed}/{target}
        </span>
        <span className={`text-[#64748B] ${config.subFontSize}`}>
          this week
        </span>
      </div>

      {/* Progress message below ring */}
      {showLabel && (
        <motion.p
          className="text-center text-[#475569] mt-3 font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 10 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          {getProgressMessage(completed, target)}
        </motion.p>
      )}
    </div>
  );
}
