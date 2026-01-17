'use client';

import { CompletionRing } from './CompletionRing';
import { WeeklyDayIndicators, WeeklyDayLegend, DayInfo } from './WeeklyDayIndicators';

export interface WeeklyProgressData {
  completed: number;
  target: number;
  percent: number;
  days: DayInfo[];
  programWeek?: number;
}

interface WeeklyProgressCardProps {
  data: WeeklyProgressData;
  compact?: boolean;
  className?: string;
}

export function WeeklyProgressCard({
  data,
  compact = false,
  className = '',
}: WeeklyProgressCardProps) {
  const { completed, target, days, programWeek } = data;

  if (compact) {
    // Compact version for sidebar/mobile - just ring + progress
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <CompletionRing
          completed={completed}
          target={target}
          size="sm"
          showLabel={true}
        />
        <div className="mt-4 w-full">
          <WeeklyDayIndicators days={days} />
        </div>
      </div>
    );
  }

  // Full card version with more details
  return (
    <div
      className={`bg-white rounded-2xl border border-[#E2E8F0] shadow-md overflow-hidden ${className}`}
    >
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Weekly Progress
            </h2>
            {programWeek && (
              <p className="text-[#64748B] text-sm mt-1">
                Week {programWeek} of your program
              </p>
            )}
          </div>
        </div>

        {/* Ring + Day Indicators */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
          {/* Ring */}
          <div className="flex-shrink-0">
            <CompletionRing
              completed={completed}
              target={target}
              size="lg"
              showLabel={true}
            />
          </div>

          {/* Day Indicators - vertical on mobile, horizontal on desktop */}
          <div className="flex-1 w-full">
            <p className="text-xs text-[#64748B] uppercase tracking-wider font-medium mb-4 text-center lg:text-left">
              This Week
            </p>
            <WeeklyDayIndicators days={days} />

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-[#E2E8F0]">
              <WeeklyDayLegend />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
