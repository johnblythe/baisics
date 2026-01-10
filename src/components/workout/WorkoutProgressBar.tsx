'use client';

interface WorkoutProgressBarProps {
  completedCount: number;
  totalCount: number;
}

export function WorkoutProgressBar({ completedCount, totalCount }: WorkoutProgressBarProps) {
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="flex items-center gap-3 px-1">
      <div className="flex-1 h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#EF5350] rounded-full transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-[#475569]">
        {completedCount}/{totalCount}
      </span>
    </div>
  );
}
