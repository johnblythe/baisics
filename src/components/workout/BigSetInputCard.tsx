'use client';

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
            value={weight || ''}
            onChange={(e) => onWeightChange(Number(e.target.value))}
            className="w-full px-4 py-3.5 rounded-xl bg-white/20 border border-white/30 text-white text-xl font-bold placeholder-white/50 focus:bg-white/30 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor={`reps-input-${setNumber}`} className="block text-white/70 text-xs font-medium mb-1.5">Reps</label>
          <input
            id={`reps-input-${setNumber}`}
            type="number"
            placeholder="10"
            value={reps || ''}
            onChange={(e) => onRepsChange(Number(e.target.value))}
            className="w-full px-4 py-3.5 rounded-xl bg-white/20 border border-white/30 text-white text-xl font-bold placeholder-white/50 focus:bg-white/30 focus:outline-none"
          />
        </div>
      </div>

      <button
        onClick={onComplete}
        className="w-full py-4 rounded-xl bg-white text-[#FF6B6B] font-bold text-lg shadow-lg active:scale-[0.98] transition-transform"
      >
        Complete Set {setNumber}
      </button>
    </div>
  );
}
