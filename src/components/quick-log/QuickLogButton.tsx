'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickLogButtonProps {
  workoutId: string;
  workoutName: string;
  variant?: 'button' | 'link';
  showDatePicker?: boolean;
  onSuccess?: (data: QuickLogResponse) => void;
  onError?: (error: string) => void;
}

interface QuickLogResponse {
  success: boolean;
  workoutLog: {
    id: string;
    workoutId: string;
    workoutName: string;
    completedAt: string;
    quickLog: boolean;
    quickLogExpiry: string;
  };
  streak: {
    current: number;
    longest: number;
    extended: boolean;
  };
  milestone: {
    unlocked: boolean;
    type: string;
    totalWorkouts: number;
    totalVolume: number;
  } | null;
  message: string;
}

type ButtonState = 'idle' | 'confirming' | 'loading' | 'success' | 'error';

function toLocalDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function QuickLogButton({ workoutId, workoutName, variant = 'button', showDatePicker = false, onSuccess, onError }: QuickLogButtonProps) {
  const [state, setState] = useState<ButtonState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(toLocalDateString(new Date()));

  const isLink = variant === 'link';

  const handleClick = () => {
    if (state === 'idle') {
      setState('confirming');
    }
  };

  const handleConfirm = async () => {
    setState('loading');
    setError(null);

    try {
      const body: Record<string, string> = { workoutId };
      if (showDatePicker && selectedDate !== toLocalDateString(new Date())) {
        body.date = new Date(selectedDate + 'T12:00:00').toISOString();
      }

      const response = await fetch('/api/workout-logs/quick-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to log workout');
      }

      setState('success');
      onSuccess?.(data);

      setTimeout(() => {
        setState('idle');
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to log workout';
      setError(errorMessage);
      setState('error');
      onError?.(errorMessage);

      setTimeout(() => {
        setState('idle');
        setError(null);
      }, 3000);
    }
  };

  const handleCancel = () => {
    setState('idle');
    setSelectedDate(toLocalDateString(new Date()));
  };

  if (isLink) {
    return (
      <span className="inline">
        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.button
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={handleClick}
              className="text-[#FF6B6B] hover:underline"
              aria-label={`Quick log ${workoutName}`}
            >
              mark complete without tracking
            </motion.button>
          )}

          {state === 'confirming' && (
            <motion.span
              key="confirming"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="inline-flex flex-wrap items-center gap-2"
            >
              {showDatePicker && (
                <input
                  type="date"
                  value={selectedDate}
                  max={toLocalDateString(new Date())}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-sm border border-[#E2E8F0] rounded-lg px-2 py-1 text-[#0F172A] focus:outline-none focus:border-[#FF6B6B]"
                />
              )}
              <button
                onClick={handleConfirm}
                className="text-sm font-semibold text-[#10B981] hover:underline"
              >
                confirm
              </button>
              <button
                onClick={handleCancel}
                className="text-sm text-[#94A3B8] hover:underline"
              >
                cancel
              </button>
            </motion.span>
          )}

          {state === 'loading' && (
            <motion.span
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="inline-flex items-center gap-1.5 text-[#94A3B8] text-sm"
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block w-3.5 h-3.5 border-2 border-[#94A3B8] border-t-transparent rounded-full"
              />
              logging...
            </motion.span>
          )}

          {state === 'success' && (
            <motion.span
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
              className="text-sm font-semibold text-[#10B981]"
            >
              logged!
            </motion.span>
          )}

          {state === 'error' && (
            <motion.span
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-sm text-[#EF4444]"
            >
              {error || 'failed'}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    );
  }

  // Button variant (original)
  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.button
            key="idle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onClick={handleClick}
            className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white text-[#0F172A] font-semibold rounded-xl border-2 border-[#E2E8F0] hover:border-[#10B981] hover:text-[#10B981] transition-all duration-200"
            aria-label={`Quick log ${workoutName}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            I Did It
          </motion.button>
        )}

        {state === 'confirming' && (
          <motion.div
            key="confirming"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-2"
          >
            {showDatePicker && (
              <input
                type="date"
                value={selectedDate}
                max={toLocalDateString(new Date())}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-sm border-2 border-[#E2E8F0] rounded-xl px-3 py-2 text-[#0F172A] focus:outline-none focus:border-[#10B981]"
              />
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={handleConfirm}
                className="inline-flex items-center justify-center gap-2 px-5 py-4 bg-[#10B981] text-white font-semibold rounded-xl hover:bg-[#059669] transition-all duration-200 shadow-lg shadow-[#10B981]/25"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Confirm
              </button>
              <button
                onClick={handleCancel}
                className="inline-flex items-center justify-center px-4 py-4 bg-white text-[#64748B] font-medium rounded-xl border-2 border-[#E2E8F0] hover:border-[#94A3B8] transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {state === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#F1F5F9] text-[#64748B] font-semibold rounded-xl"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-[#64748B] border-t-transparent rounded-full"
            />
            Logging...
          </motion.div>
        )}

        {state === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#10B981] text-white font-semibold rounded-xl shadow-lg shadow-[#10B981]/25"
          >
            <motion.svg
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </motion.svg>
            Logged!
          </motion.div>
        )}

        {state === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#EF4444] text-white font-semibold rounded-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {error || 'Error'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
