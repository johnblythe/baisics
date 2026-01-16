'use client';

import { motion } from 'framer-motion';

export type DayStatus = 'completed' | 'today' | 'rest' | 'scheduled' | 'missed';

export interface DayInfo {
  dayName: string; // Mon, Tue, etc.
  status: DayStatus;
  isToday: boolean;
}

interface WeeklyDayIndicatorsProps {
  days: DayInfo[];
  className?: string;
}

function DayIndicator({ day, index }: { day: DayInfo; index: number }) {
  const getIndicatorContent = () => {
    switch (day.status) {
      case 'completed':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'today':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        );
      case 'rest':
        return <span className="font-bold text-sm">R</span>;
      case 'missed':
        return <span className="text-[#CBD5E1] text-lg">·</span>;
      case 'scheduled':
      default:
        return <span className="text-[#CBD5E1] text-lg">·</span>;
    }
  };

  const getIndicatorStyles = () => {
    const base = 'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all';

    switch (day.status) {
      case 'completed':
        return `${base} bg-[#FF6B6B] text-white`;
      case 'today':
        return `${base} bg-[#FFE5E5] text-[#FF6B6B] border-2 border-[#FF6B6B]`;
      case 'rest':
        return `${base} bg-[#F1F5F9] text-[#64748B] ${day.isToday ? 'border-2 border-[#64748B]' : 'border border-[#E2E8F0]'}`;
      case 'missed':
        return `${base} bg-[#FEF2F2] text-[#FCA5A5] border border-[#FECACA]`;
      case 'scheduled':
      default:
        return `${base} bg-[#F8FAFC] text-[#94A3B8] border border-[#E2E8F0]`;
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <span
        className={`text-xs ${day.isToday ? 'text-[#FF6B6B] font-bold' : 'text-[#64748B]'}`}
      >
        {day.dayName}
      </span>
      <div
        className={getIndicatorStyles()}
        aria-label={`${day.dayName}: ${day.status}${day.isToday ? ' (today)' : ''}`}
        role="status"
      >
        {getIndicatorContent()}
      </div>
    </motion.div>
  );
}

export function WeeklyDayIndicators({ days, className = '' }: WeeklyDayIndicatorsProps) {
  return (
    <div
      className={`flex justify-between items-center ${className}`}
      role="group"
      aria-label="Weekly workout schedule"
    >
      {days.map((day, index) => (
        <DayIndicator key={day.dayName} day={day} index={index} />
      ))}
    </div>
  );
}

// Legend component for the indicators
export function WeeklyDayLegend({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs ${className}`}>
      <div className="flex items-center gap-1.5">
        <div className="w-4 h-4 rounded bg-[#FF6B6B] flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-[#64748B]">Completed</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-4 h-4 rounded bg-[#FFE5E5] border border-[#FF6B6B] flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-[#FF6B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
        <span className="text-[#64748B]">Today</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-4 h-4 rounded bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center">
          <span className="text-[#64748B] text-[10px] font-bold">R</span>
        </div>
        <span className="text-[#64748B]">Rest</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-4 h-4 rounded bg-[#F8FAFC] border border-[#E2E8F0]" />
        <span className="text-[#64748B]">Scheduled</span>
      </div>
    </div>
  );
}
