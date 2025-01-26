'use client';

import React from 'react';
import { Clock } from 'lucide-react';

interface RestPeriodIndicatorProps {
  restPeriod: number;
  isCompleted?: boolean;
  isActive?: boolean;
  className?: string;
}

export default function RestPeriodIndicator({
  restPeriod,
  isCompleted = false,
  isActive = false,
  className = '',
}: RestPeriodIndicatorProps) {
  return (
    <div className={`
      relative overflow-hidden transition-all duration-300
      ${isActive 
        ? 'py-3 my-2 bg-gradient-to-r from-indigo-50/50 via-transparent to-indigo-50/50 dark:from-indigo-900/20 dark:to-indigo-900/20' 
        : isCompleted
          ? 'py-2 my-1 bg-gradient-to-r from-green-50/30 via-transparent to-green-50/30 dark:from-green-900/10 dark:to-green-900/10'
          : 'py-2 my-1 bg-gradient-to-r from-gray-50/30 via-transparent to-gray-50/30 dark:from-gray-800/30 dark:to-gray-800/30'
      }
      ${className}
    `}>
      <div className="relative z-10 flex items-center justify-center space-x-2">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
          <Clock className={`w-4 h-4 ${
            isActive 
              ? 'text-indigo-500 dark:text-indigo-400' 
              : isCompleted
                ? 'text-green-500 dark:text-green-400'
                : 'text-gray-400 dark:text-gray-500'
          }`} />
          <div className={`text-sm font-medium ${
            isActive 
              ? 'text-indigo-600 dark:text-indigo-400' 
              : isCompleted
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-500 dark:text-gray-400'
          }`}>
            Rest: {restPeriod}s
          </div>
        </div>
      </div>
    </div>
  );
}

/* Future implementation reference:
interface RestPeriodState {
  isCountingDown: boolean;
  timeRemaining: number | null;
}

// Example countdown implementation:
const [state, setState] = useState<RestPeriodState>({
  isCountingDown: false,
  timeRemaining: null,
});

const startCountdown = () => {
  setState({ isCountingDown: true, timeRemaining: restPeriod });
  const timer = setInterval(() => {
    setState(prev => {
      if (prev.timeRemaining <= 1) {
        clearInterval(timer);
        return { isCountingDown: false, timeRemaining: null };
      }
      return { ...prev, timeRemaining: prev.timeRemaining! - 1 };
    });
  }, 1000);
};
*/ 