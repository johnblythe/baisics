'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';

interface RestPeriodIndicatorProps {
  restPeriod: number;
  isCompleted?: boolean;
  isActive?: boolean;
  className?: string;
  onTimerComplete?: () => void;
}

export default function RestPeriodIndicator({
  restPeriod,
  isCompleted = false,
  isActive = false,
  className = '',
  onTimerComplete,
}: RestPeriodIndicatorProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const isCountingDown = timeRemaining !== null && timeRemaining > 0;
  const timerComplete = timeRemaining === 0;

  // Countdown effect
  useEffect(() => {
    if (!isRunning || timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          setIsRunning(false);
          onTimerComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeRemaining, onTimerComplete]);

  const startTimer = useCallback(() => {
    setTimeRemaining(restPeriod);
    setIsRunning(true);
  }, [restPeriod]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resumeTimer = useCallback(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      setIsRunning(true);
    }
  }, [timeRemaining]);

  const resetTimer = useCallback(() => {
    setTimeRemaining(null);
    setIsRunning(false);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  const progressPercent = timeRemaining !== null ? ((restPeriod - timeRemaining) / restPeriod) * 100 : 0;

  return (
    <div className={`
      relative overflow-hidden transition-all duration-300
      ${isCountingDown || timerComplete
        ? 'py-4 my-2 bg-gradient-to-r from-indigo-50/80 via-transparent to-indigo-50/80 dark:from-indigo-900/30 dark:to-indigo-900/30'
        : isActive
          ? 'py-3 my-2 bg-gradient-to-r from-indigo-50/50 via-transparent to-indigo-50/50 dark:from-indigo-900/20 dark:to-indigo-900/20'
          : isCompleted
            ? 'py-2 my-1 bg-gradient-to-r from-green-50/30 via-transparent to-green-50/30 dark:from-green-900/10 dark:to-green-900/10'
            : 'py-2 my-1 bg-gradient-to-r from-gray-50/30 via-transparent to-gray-50/30 dark:from-gray-800/30 dark:to-gray-800/30'
      }
      ${className}
    `}>
      {/* Progress bar for active timer */}
      {isCountingDown && (
        <div
          className="absolute inset-0 bg-indigo-100 dark:bg-indigo-800/30 transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      )}

      <div className="relative z-10 flex items-center justify-center gap-3">
        {/* Timer display */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-gray-800/90 border shadow-sm ${
          timerComplete
            ? 'border-green-300 dark:border-green-700'
            : isCountingDown
              ? 'border-indigo-300 dark:border-indigo-600'
              : 'border-gray-200/50 dark:border-gray-700/50'
        }`}>
          <Clock className={`w-4 h-4 ${
            timerComplete
              ? 'text-green-500 dark:text-green-400'
              : isCountingDown
                ? 'text-indigo-500 dark:text-indigo-400 animate-pulse'
                : isActive
                  ? 'text-indigo-500 dark:text-indigo-400'
                  : isCompleted
                    ? 'text-green-500 dark:text-green-400'
                    : 'text-gray-400 dark:text-gray-500'
          }`} />
          <div className={`text-sm font-medium ${
            timerComplete
              ? 'text-green-600 dark:text-green-400'
              : isCountingDown
                ? 'text-indigo-700 dark:text-indigo-300 tabular-nums'
                : isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : isCompleted
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-400'
          }`}>
            {timerComplete
              ? 'Rest complete!'
              : isCountingDown
                ? formatTime(timeRemaining!)
                : `Rest: ${formatTime(restPeriod)}`}
          </div>
        </div>

        {/* Timer controls */}
        {(isActive || isCountingDown || timerComplete) && (
          <div className="flex items-center gap-1">
            {!isCountingDown && !timerComplete && (
              <button
                onClick={startTimer}
                className="p-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors"
                aria-label="Start rest timer"
              >
                <Play className="w-4 h-4" />
              </button>
            )}
            {isCountingDown && isRunning && (
              <button
                onClick={pauseTimer}
                className="p-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors"
                aria-label="Pause timer"
              >
                <Pause className="w-4 h-4" />
              </button>
            )}
            {isCountingDown && !isRunning && (
              <button
                onClick={resumeTimer}
                className="p-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors"
                aria-label="Resume timer"
              >
                <Play className="w-4 h-4" />
              </button>
            )}
            {(isCountingDown || timerComplete) && (
              <button
                onClick={resetTimer}
                className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
