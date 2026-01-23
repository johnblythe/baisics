'use client';

import { motion } from 'framer-motion';
import { Trophy, TrendingUp } from 'lucide-react';

type PRType = 'weight' | 'reps' | 'volume';

interface PRCalloutProps {
  exerciseName: string;
  prType: PRType;
  previousBest: number;
  newBest: number;
  unit?: string;
}

const PR_CONFIG: Record<PRType, { label: string; defaultUnit: string; icon: 'trophy' | 'trending' }> = {
  weight: { label: 'Weight PR', defaultUnit: 'lbs', icon: 'trophy' },
  reps: { label: 'Rep PR', defaultUnit: 'reps', icon: 'trending' },
  volume: { label: 'Volume PR', defaultUnit: 'lbs', icon: 'trophy' },
};

export function PRCallout({
  exerciseName,
  prType,
  previousBest,
  newBest,
  unit,
}: PRCalloutProps) {
  const config = PR_CONFIG[prType];
  const displayUnit = unit ?? config.defaultUnit;
  const improvement = newBest - previousBest;
  const improvementText = improvement > 0 ? `+${improvement}` : `${improvement}`;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 rounded-full shadow-sm"
    >
      {/* PR Icon */}
      <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
        {config.icon === 'trophy' ? (
          <Trophy className="w-3 h-3 text-white" />
        ) : (
          <TrendingUp className="w-3 h-3 text-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex items-center gap-1.5 text-sm">
        <span className="font-medium text-amber-900 truncate max-w-[120px]">
          {exerciseName}
        </span>
        <span className="text-amber-600">•</span>
        <span className="font-bold text-amber-700">
          {improvementText} {displayUnit}
        </span>
      </div>

      {/* PR Badge */}
      <span className="px-1.5 py-0.5 text-xs font-bold bg-amber-400 text-white rounded uppercase tracking-wide">
        PR
      </span>
    </motion.div>
  );
}

export default PRCallout;
