'use client';

import { CheckCircle } from 'lucide-react';

export interface SetLog {
  setNumber: number;
  weight: number;
  reps: number;
  isCompleted: boolean;
}

interface SetProgressGridProps {
  logs: SetLog[];
  activeIndex: number;
  selectedIndex: number | null;
  onSelect: (index: number | null) => void;
}

function getCardStyles(isCompleted: boolean, isSelected: boolean, isActive: boolean): string {
  if (isCompleted) {
    if (isSelected) {
      return 'bg-green-200 border-2 border-green-500 ring-2 ring-green-500 ring-offset-2';
    }
    return 'bg-green-100 border-2 border-green-300 hover:border-green-400 cursor-pointer';
  }

  if (isSelected) {
    return 'bg-[#FF6B6B] text-white ring-2 ring-[#FF6B6B] ring-offset-2';
  }

  if (isActive) {
    return 'bg-[#FFE5E5] border-2 border-[#FF6B6B]/50';
  }

  return 'bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#FF6B6B]/30';
}

function getLabelColor(isCompleted: boolean, isSelected: boolean): string {
  if (isCompleted) return 'text-green-600';
  if (isSelected) return 'text-white/80';
  return 'text-[#94A3B8]';
}

export function SetProgressGrid({
  logs,
  activeIndex,
  selectedIndex,
  onSelect,
}: SetProgressGridProps) {
  const currentIndex = selectedIndex ?? activeIndex;
  const manyCards = logs.length > 5;

  const containerClass = manyCards
    ? 'flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300'
    : 'flex gap-2';

  return (
    <div className={containerClass}>
      {logs.map((log, idx) => {
        const isActive = idx === activeIndex;
        const isSelected = idx === currentIndex;
        const cardSizeClass = manyCards ? 'min-w-[80px] flex-shrink-0 snap-start' : 'flex-1';

        return (
          <button
            key={log.setNumber}
            onClick={() => onSelect(idx === selectedIndex ? null : idx)}
            className={`relative rounded-xl p-2.5 text-center transition-all ${cardSizeClass} ${getCardStyles(log.isCompleted, isSelected, isActive)}`}
          >
            <p className={`text-[10px] font-semibold uppercase ${getLabelColor(log.isCompleted, isSelected)}`}>
              Set {idx + 1}
            </p>
            {log.isCompleted ? (
              <p className="text-sm font-bold text-green-700">
                {log.weight}×{log.reps}
              </p>
            ) : isSelected ? (
              <p className="text-sm font-bold">Active</p>
            ) : (
              <p className="text-sm font-bold text-[#94A3B8]">--</p>
            )}
            {log.isCompleted && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
