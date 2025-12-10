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
      relative overflow-hidden transition-all duration-300 rounded-lg
      ${isCountingDown || timerComplete
        ? 'py-4 my-2 bg-[#FFE5E5]'
        : isActive
          ? 'py-3 my-2 bg-[#F8FAFC]'
          : isCompleted
            ? 'py-2 my-1 bg-green-50'
            : 'py-2 my-1 bg-[#F8FAFC]'
      }
      ${className}
    `}>
      {/* Progress bar for active timer */}
      {isCountingDown && (
        <div
          className="absolute inset-0 bg-[#FF6B6B]/20 transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      )}

      <div className="relative z-10 flex items-center justify-center gap-3">
        {/* Timer display */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border shadow-sm ${
          timerComplete
            ? 'border-green-300'
            : isCountingDown
              ? 'border-[#FF6B6B]'
              : 'border-[#F1F5F9]'
        }`}>
          <Clock className={`w-4 h-4 ${
            timerComplete
              ? 'text-green-500'
              : isCountingDown
                ? 'text-[#FF6B6B] animate-pulse'
                : isActive
                  ? 'text-[#FF6B6B]'
                  : isCompleted
                    ? 'text-green-500'
                    : 'text-[#94A3B8]'
          }`} />
          <div className={`text-sm font-medium ${
            timerComplete
              ? 'text-green-600'
              : isCountingDown
                ? 'text-[#0F172A] tabular-nums'
                : isActive
                  ? 'text-[#0F172A]'
                  : isCompleted
                    ? 'text-green-600'
                    : 'text-[#475569]'
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
                className="p-2 rounded-full bg-[#FF6B6B] text-white hover:bg-[#EF5350] transition-colors shadow-sm"
                aria-label="Start rest timer"
              >
                <Play className="w-4 h-4" />
              </button>
            )}
            {isCountingDown && isRunning && (
              <button
                onClick={pauseTimer}
                className="p-2 rounded-full bg-[#0F172A] text-white hover:bg-[#1E293B] transition-colors shadow-sm"
                aria-label="Pause timer"
              >
                <Pause className="w-4 h-4" />
              </button>
            )}
            {isCountingDown && !isRunning && (
              <button
                onClick={resumeTimer}
                className="p-2 rounded-full bg-[#FF6B6B] text-white hover:bg-[#EF5350] transition-colors shadow-sm"
                aria-label="Resume timer"
              >
                <Play className="w-4 h-4" />
              </button>
            )}
            {(isCountingDown || timerComplete) && (
              <button
                onClick={resetTimer}
                className="p-2 rounded-full bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] transition-colors"
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
