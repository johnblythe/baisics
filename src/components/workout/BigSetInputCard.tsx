'use client';

import { useState, useEffect } from 'react';

interface BigSetInputCardProps {
  setNumber: number;
  targetReps: string;
  weight: number | string;
  reps: number | string;
  notes?: string;
  isEditing?: boolean;
  onComplete: (weight: number, reps: number, notes?: string) => void;
}

export function BigSetInputCard({
  setNumber,
  targetReps,
  weight,
  reps,
  notes = '',
  isEditing = false,
  onComplete,
}: BigSetInputCardProps) {
  // Local state for immediate UI response - NO auto-saving until complete
  const [localWeight, setLocalWeight] = useState<string>(weight ? String(weight) : '');
  const [localReps, setLocalReps] = useState<string>(reps ? String(reps) : '');
  const [localNotes, setLocalNotes] = useState<string>(notes || '');
  const [showNotes, setShowNotes] = useState<boolean>(!!notes);

  // Sync local state when props change (e.g., switching sets)
  useEffect(() => {
    setLocalWeight(weight ? String(weight) : '');
    setLocalReps(reps ? String(reps) : '');
    setLocalNotes(notes || '');
    setShowNotes(!!notes || isEditing); // Show notes field when editing
  }, [weight, reps, notes, setNumber, isEditing]);

  // Only save when user explicitly completes the set - pass values directly
  const handleComplete = () => {
    const finalWeight = Number(localWeight) || 0;
    const finalReps = Number(localReps) || Number(targetReps) || 0;
    onComplete(finalWeight, finalReps, localNotes || undefined);
  };

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

      <div className="flex gap-3 mb-5">
        <div className="flex-1">
          <label htmlFor={`weight-input-${setNumber}`} className="block text-white/70 text-xs font-medium mb-1.5">Weight (lbs)</label>
          <input
            id={`weight-input-${setNumber}`}
            type="number"
            placeholder="185"
            value={localWeight}
            onChange={(e) => setLocalWeight(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl bg-white/20 border border-white/30 text-white text-xl font-bold placeholder-white/50 focus:bg-white/30 focus:outline-none"
          />
        </div>
        <div className="flex-1">
          <label htmlFor={`reps-input-${setNumber}`} className="block text-white/70 text-xs font-medium mb-1.5">Reps</label>
          <input
            id={`reps-input-${setNumber}`}
            type="number"
            placeholder="10"
            value={localReps}
            onChange={(e) => setLocalReps(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl bg-white/20 border border-white/30 text-white text-xl font-bold placeholder-white/50 focus:bg-white/30 focus:outline-none"
          />
        </div>
        <div className="flex flex-col justify-end">
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className={`p-3.5 rounded-xl border transition-colors ${
              localNotes
                ? 'bg-white/40 border-white/50'
                : 'bg-white/20 border-white/30 hover:bg-white/30'
            }`}
            title={showNotes ? 'Hide notes' : 'Add notes'}
          >
            <span className="text-xl">📝</span>
          </button>
        </div>
      </div>

      {showNotes && (
        <div className="mb-5">
          <label htmlFor={`notes-input-${setNumber}`} className="block text-white/70 text-xs font-medium mb-1.5">Notes</label>
          <textarea
            id={`notes-input-${setNumber}`}
            placeholder="How did this set feel? Any observations..."
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:bg-white/30 focus:outline-none resize-none"
          />
        </div>
      )}

      <button
        onClick={handleComplete}
        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-transform ${
          isEditing
            ? 'bg-green-500 text-white'
            : 'bg-white text-[#FF6B6B]'
        }`}
      >
        {isEditing ? `Update Set ${setNumber}` : `Complete Set ${setNumber}`}
      </button>
    </div>
  );
}
