'use client';

import { useState } from 'react';

interface SetLog {
  completed: boolean;
  weight?: number;
  reps?: number;
}

interface Movement {
  name: string;
  targetSets: number;
  targetReps: number;
  sets: SetLog[];
  skipped?: boolean;
}

const initialWorkout: Movement[] = [
  { name: "Bench Press", targetSets: 3, targetReps: 5, sets: [{ completed: true, weight: 185, reps: 5 }, { completed: true, weight: 185, reps: 5 }, { completed: true, weight: 185, reps: 5 }] },
  { name: "Incline DB Press", targetSets: 4, targetReps: 8, sets: [{ completed: false }, { completed: false }, { completed: false }, { completed: false }] },
  { name: "Cable Flyes", targetSets: 3, targetReps: 10, sets: [{ completed: false }, { completed: false }, { completed: false }] },
  { name: "Tricep Pushdowns", targetSets: 2, targetReps: 12, sets: [{ completed: false }, { completed: false }] },
];

export default function WorkoutSkipPrototype() {
  const [movements, setMovements] = useState<Movement[]>(initialWorkout);
  const [currentMovementIndex, setCurrentMovementIndex] = useState(1); // Start at movement 2 (some already done)
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [weight, setWeight] = useState(40);
  const [reps, setReps] = useState(8);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  const currentMovement = movements[currentMovementIndex];
  const completedSets = currentMovement?.sets.filter(s => s.completed).length || 0;
  const remainingSets = (currentMovement?.targetSets || 0) - completedSets;

  const logSet = () => {
    const updated = [...movements];
    updated[currentMovementIndex].sets[currentSetIndex] = { completed: true, weight, reps };
    setMovements(updated);

    if (currentSetIndex < currentMovement.targetSets - 1) {
      setCurrentSetIndex(currentSetIndex + 1);
    }
  };

  const skipRemainingSets = () => {
    const updated = [...movements];
    // Mark remaining sets as skipped (not completed)
    for (let i = currentSetIndex; i < updated[currentMovementIndex].sets.length; i++) {
      if (!updated[currentMovementIndex].sets[i].completed) {
        updated[currentMovementIndex].sets[i] = { completed: false };
      }
    }
    updated[currentMovementIndex].skipped = true;
    setMovements(updated);

    // Move to next movement
    if (currentMovementIndex < movements.length - 1) {
      setCurrentMovementIndex(currentMovementIndex + 1);
      setCurrentSetIndex(0);
    }
    setShowSkipConfirm(false);
  };

  const skipEntireMovement = (index: number) => {
    const updated = [...movements];
    updated[index].skipped = true;
    setMovements(updated);

    if (index === currentMovementIndex && currentMovementIndex < movements.length - 1) {
      setCurrentMovementIndex(currentMovementIndex + 1);
      setCurrentSetIndex(0);
    }
  };

  const goToNextMovement = () => {
    if (currentMovementIndex < movements.length - 1) {
      setCurrentMovementIndex(currentMovementIndex + 1);
      setCurrentSetIndex(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="bg-[#0F172A] text-white p-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-sm text-white/60 uppercase tracking-wider mb-1">#356 - Skip Sets Prototype</h1>
          <h2 className="text-lg font-bold">Upper Push Day</h2>
          <div className="flex gap-2 mt-2">
            {movements.map((m, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  i < currentMovementIndex ? 'bg-[#FF6B6B]' :
                  i === currentMovementIndex ? 'bg-white' :
                  m.skipped ? 'bg-[#64748B]' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Movement overview - shows all movements with status */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="p-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <h3 className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold">Workout Progress</h3>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {movements.map((movement, i) => {
              const done = movement.sets.filter(s => s.completed).length;
              const total = movement.targetSets;
              const isActive = i === currentMovementIndex;
              const isPast = i < currentMovementIndex;

              return (
                <div
                  key={i}
                  className={`p-3 flex items-center gap-3 ${isActive ? 'bg-[#FFF5F5]' : ''}`}
                >
                  {/* Status indicator */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    movement.skipped ? 'bg-[#F1F5F9]' :
                    done === total ? 'bg-[#10B981]' :
                    isActive ? 'bg-[#FF6B6B]' :
                    'bg-[#E2E8F0]'
                  }`}>
                    {movement.skipped ? (
                      <svg className="w-4 h-4 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    ) : done === total ? (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-[#94A3B8]'}`}>{i + 1}</span>
                    )}
                  </div>

                  {/* Movement name & progress */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${movement.skipped ? 'text-[#94A3B8] line-through' : 'text-[#0F172A]'}`}>
                      {movement.name}
                    </p>
                    <p className="text-xs text-[#94A3B8]">
                      {movement.skipped ? 'Skipped' : `${done}/${total} sets • ${movement.targetReps} reps`}
                    </p>
                  </div>

                  {/* Skip button for future movements */}
                  {!isPast && !isActive && !movement.skipped && (
                    <button
                      onClick={() => skipEntireMovement(i)}
                      className="text-xs text-[#94A3B8] hover:text-[#FF6B6B] px-2 py-1"
                    >
                      Skip
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Current set logging */}
        {currentMovement && !currentMovement.skipped && completedSets < currentMovement.targetSets && (
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            {/* Movement header */}
            <div className="p-4 border-b border-[#F1F5F9]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-[#0F172A]">{currentMovement.name}</h3>
                <span className="px-3 py-1 rounded-full bg-[#FF6B6B] text-white text-sm font-bold">
                  Set {completedSets + 1} of {currentMovement.targetSets}
                </span>
              </div>
              <p className="text-sm text-[#64748B]">Target: {currentMovement.targetReps} reps</p>
            </div>

            {/* Set history */}
            <div className="p-4 bg-[#F8FAFC] border-b border-[#F1F5F9]">
              <div className="flex gap-2">
                {currentMovement.sets.map((set, i) => (
                  <div
                    key={i}
                    className={`flex-1 p-2 rounded-lg text-center text-xs ${
                      set.completed
                        ? 'bg-[#10B981] text-white'
                        : i === currentSetIndex
                          ? 'bg-white border-2 border-[#FF6B6B] text-[#FF6B6B]'
                          : 'bg-white border border-[#E2E8F0] text-[#94A3B8]'
                    }`}
                  >
                    {set.completed ? (
                      <span className="font-medium">{set.weight}×{set.reps}</span>
                    ) : (
                      <span>Set {i + 1}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Input fields */}
            <div className="p-4">
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="text-xs text-[#94A3B8] uppercase tracking-wider block mb-1">Weight</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setWeight(w => Math.max(0, w - 5))}
                      className="w-10 h-10 rounded-lg bg-[#F1F5F9] text-[#64748B] font-bold hover:bg-[#E2E8F0]"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="flex-1 h-10 text-center text-lg font-bold border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#FF6B6B]"
                    />
                    <button
                      onClick={() => setWeight(w => w + 5)}
                      className="w-10 h-10 rounded-lg bg-[#F1F5F9] text-[#64748B] font-bold hover:bg-[#E2E8F0]"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-[#94A3B8] uppercase tracking-wider block mb-1">Reps</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setReps(r => Math.max(0, r - 1))}
                      className="w-10 h-10 rounded-lg bg-[#F1F5F9] text-[#64748B] font-bold hover:bg-[#E2E8F0]"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={reps}
                      onChange={(e) => setReps(Number(e.target.value))}
                      className="flex-1 h-10 text-center text-lg font-bold border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#FF6B6B]"
                    />
                    <button
                      onClick={() => setReps(r => r + 1)}
                      className="w-10 h-10 rounded-lg bg-[#F1F5F9] text-[#64748B] font-bold hover:bg-[#E2E8F0]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Primary action - Log Set */}
              <button
                onClick={logSet}
                className="w-full px-6 py-4 bg-[#FF6B6B] text-white font-bold rounded-xl hover:bg-[#EF5350] transition-all shadow-lg shadow-[#FF6B6B]/25 mb-3"
              >
                Log Set {completedSets + 1}
              </button>

              {/* ═══════════════════════════════════════════════════════════════
                  SKIP OPTIONS - The key UX we're designing
                  ═══════════════════════════════════════════════════════════════ */}
              <div className="flex items-center justify-center gap-4 text-sm">
                {completedSets > 0 && (
                  <button
                    onClick={() => setShowSkipConfirm(true)}
                    className="text-[#94A3B8] hover:text-[#FF6B6B] transition-colors"
                  >
                    Skip remaining {remainingSets} set{remainingSets > 1 ? 's' : ''} →
                  </button>
                )}
                {completedSets === 0 && (
                  <button
                    onClick={() => skipEntireMovement(currentMovementIndex)}
                    className="text-[#94A3B8] hover:text-[#FF6B6B] transition-colors"
                  >
                    Skip this movement →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* All movements complete or skipped */}
        {(currentMovementIndex >= movements.length ||
          (currentMovement?.skipped) ||
          (currentMovement && currentMovement.sets.filter(s => s.completed).length === currentMovement.targetSets)) && (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 text-center">
            {currentMovementIndex < movements.length - 1 ? (
              <>
                <p className="text-[#64748B] mb-4">Movement complete!</p>
                <button
                  onClick={goToNextMovement}
                  className="px-6 py-3 bg-[#FF6B6B] text-white font-bold rounded-xl"
                >
                  Next: {movements[currentMovementIndex + 1]?.name}
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-[#10B981] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-2">Workout Complete!</h3>
                <p className="text-sm text-[#64748B]">
                  {movements.filter(m => m.sets.some(s => s.completed)).length} of {movements.length} movements logged
                </p>
              </>
            )}
          </div>
        )}

        {/* Skip confirmation modal */}
        {showSkipConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden">
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-[#FEF3C7] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-[#D97706]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#0F172A] mb-2">Skip remaining sets?</h3>
                <p className="text-sm text-[#64748B] mb-6">
                  You&apos;ve logged {completedSets} of {currentMovement?.targetSets} sets.
                  The remaining {remainingSets} will be marked as skipped.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={skipRemainingSets}
                    className="w-full px-6 py-3 bg-[#FF6B6B] text-white font-bold rounded-xl"
                  >
                    Yes, move to next movement
                  </button>
                  <button
                    onClick={() => setShowSkipConfirm(false)}
                    className="w-full px-6 py-3 text-[#64748B] font-medium"
                  >
                    Keep logging
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reset for testing */}
        <button
          onClick={() => {
            setMovements(initialWorkout);
            setCurrentMovementIndex(1);
            setCurrentSetIndex(0);
          }}
          className="w-full text-sm text-[#94A3B8] hover:text-[#64748B] py-2"
        >
          ↺ Reset prototype
        </button>
      </div>
    </div>
  );
}
