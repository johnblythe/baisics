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

export function SetProgressGrid({
  logs,
  activeIndex,
  selectedIndex,
  onSelect,
}: SetProgressGridProps) {
  const currentIndex = selectedIndex !== null ? selectedIndex : activeIndex;

  return (
    <div className="grid grid-cols-4 gap-2">
      {logs.map((log, idx) => {
        const isActive = idx === activeIndex;
        const isSelected = idx === currentIndex;

        return (
          <button
            key={log.setNumber}
            onClick={() => {
              if (!log.isCompleted) {
                onSelect(idx === selectedIndex ? null : idx);
              }
            }}
            disabled={log.isCompleted}
            className={`relative rounded-xl p-2.5 text-center transition-all ${
              log.isCompleted
                ? 'bg-green-100 border-2 border-green-300 cursor-default'
                : isSelected
                  ? 'bg-[#FF6B6B] text-white ring-2 ring-[#FF6B6B] ring-offset-2'
                  : isActive
                    ? 'bg-[#FFE5E5] border-2 border-[#FF6B6B]/50'
                    : 'bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#FF6B6B]/30'
            }`}
          >
            <p
              className={`text-[10px] font-semibold uppercase ${
                log.isCompleted
                  ? 'text-green-600'
                  : isSelected
                    ? 'text-white/80'
                    : 'text-[#94A3B8]'
              }`}
            >
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
