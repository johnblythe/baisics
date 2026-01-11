'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface BigSetInputCardProps {
  setNumber: number;
  targetReps: string;
  weight: number | string;
  reps: number | string;
  onWeightChange: (value: number) => void;
  onRepsChange: (value: number) => void;
  onComplete: () => void;
}

export function BigSetInputCard({
  setNumber,
  targetReps,
  weight,
  reps,
  onWeightChange,
  onRepsChange,
  onComplete,
}: BigSetInputCardProps) {
  // Local state for immediate UI response
  const [localWeight, setLocalWeight] = useState<string>(weight ? String(weight) : '');
  const [localReps, setLocalReps] = useState<string>(reps ? String(reps) : '');

  // Debounce timers
  const weightTimerRef = useRef<NodeJS.Timeout | null>(null);
  const repsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track if we're the source of the change to avoid loops
  const isLocalChangeRef = useRef(false);

  // Sync local state when props change (e.g., switching sets)
  useEffect(() => {
    if (!isLocalChangeRef.current) {
      setLocalWeight(weight ? String(weight) : '');
      setLocalReps(reps ? String(reps) : '');
    }
    isLocalChangeRef.current = false;
  }, [weight, reps, setNumber]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (weightTimerRef.current) clearTimeout(weightTimerRef.current);
      if (repsTimerRef.current) clearTimeout(repsTimerRef.current);
    };
  }, []);

  const handleWeightChange = useCallback((value: string) => {
    isLocalChangeRef.current = true;
    setLocalWeight(value);

    // Clear existing timer
    if (weightTimerRef.current) clearTimeout(weightTimerRef.current);

    // Debounce API call (800ms)
    weightTimerRef.current = setTimeout(() => {
      const numValue = Number(value);
      if (!isNaN(numValue) && value !== '') {
        onWeightChange(numValue);
      }
    }, 800);
  }, [onWeightChange]);

  const handleRepsChange = useCallback((value: string) => {
    isLocalChangeRef.current = true;
    setLocalReps(value);

    // Clear existing timer
    if (repsTimerRef.current) clearTimeout(repsTimerRef.current);

    // Debounce API call (800ms)
    repsTimerRef.current = setTimeout(() => {
      const numValue = Number(value);
      if (!isNaN(numValue) && value !== '') {
        onRepsChange(numValue);
      }
    }, 800);
  }, [onRepsChange]);

  const handleComplete = useCallback(() => {
    // Clear any pending debounce timers
    if (weightTimerRef.current) clearTimeout(weightTimerRef.current);
    if (repsTimerRef.current) clearTimeout(repsTimerRef.current);

    // Sync final values before completing
    const finalWeight = Number(localWeight);
    const finalReps = Number(localReps);

    if (!isNaN(finalWeight) && localWeight !== '') {
      onWeightChange(finalWeight);
    }
    if (!isNaN(finalReps) && localReps !== '') {
      onRepsChange(finalReps);
    }

    // Small delay to ensure state updates propagate before completion
    setTimeout(() => {
      onComplete();
    }, 50);
  }, [localWeight, localReps, onWeightChange, onRepsChange, onComplete]);

  return (
    <div className="bg-gradient-to-br from-[#FF6B6B] to-[#EF5350] rounded-2xl p-5 text-white shadow-xl shadow-[#FF6B6B]/30">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-white/70 text-xs font-medium uppercase">Logging Set</p>
          <p className="text-3xl font-bold">{setNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-white/70 text-xs font-medium uppercase">Target</p>
          <p className="text-xl font-bold">{targetReps} reps</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label htmlFor={`weight-input-${setNumber}`} className="block text-white/70 text-xs font-medium mb-1.5">Weight (lbs)</label>
          <input
            id={`weight-input-${setNumber}`}
            type="number"
            placeholder="185"
            value={localWeight}
            onChange={(e) => handleWeightChange(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl bg-white/20 border border-white/30 text-white text-xl font-bold placeholder-white/50 focus:bg-white/30 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor={`reps-input-${setNumber}`} className="block text-white/70 text-xs font-medium mb-1.5">Reps</label>
          <input
            id={`reps-input-${setNumber}`}
            type="number"
            placeholder="10"
            value={localReps}
            onChange={(e) => handleRepsChange(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl bg-white/20 border border-white/30 text-white text-xl font-bold placeholder-white/50 focus:bg-white/30 focus:outline-none"
          />
        </div>
      </div>

      <button
        onClick={handleComplete}
        className="w-full py-4 rounded-xl bg-white text-[#FF6B6B] font-bold text-lg shadow-lg active:scale-[0.98] transition-transform"
      >
        Complete Set {setNumber}
      </button>
    </div>
  );
}
