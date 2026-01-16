'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatVolume } from '@/lib/milestones';
import { WeeklyDayIndicators, WeeklyDayLegend } from '@/components/weekly-progress';

// Icons for recovery tips
function TipIcon({ type }: { type: string }) {
  switch (type) {
    case 'muscle':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      );
    case 'moon':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      );
    case 'water':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      );
    case 'heart':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      );
    case 'chart':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    default:
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      );
  }
}

export type DayStatus = 'completed' | 'today' | 'rest' | 'scheduled' | 'missed';

export interface DayInfo {
  dayName: string;
  status: DayStatus;
  isToday: boolean;
}

export interface RestDayData {
  isRestDay: boolean;
  weeklyProgress: {
    completed: number;
    target: number;
    percent: number;
    days?: DayInfo[];
  };
  lifetimeStats: {
    totalWorkouts: number;
    totalVolume: number;
    currentStreak: number;
    longestStreak: number;
  };
  nextWorkout: {
    id: string;
    name: string;
    focus: string;
    dayOfWeek: string;
  } | null;
  recoveryTip: {
    title: string;
    tip: string;
    source: string;
    icon: string;
  };
  programName: string;
  programWeek: number;
}

interface RestDayDashboardProps {
  data: RestDayData;
  programId: string;
  onLogActivity?: (type: 'nutrition' | 'stretching' | 'foam_rolling') => void;
  onStartWorkout?: () => void;
}

export function RestDayDashboard({
  data,
  programId,
  onLogActivity,
  onStartWorkout,
}: RestDayDashboardProps) {
  const [activityLogged, setActivityLogged] = useState<string[]>([]);

  const { weeklyProgress, lifetimeStats, nextWorkout, recoveryTip } = data;

  // Progress ring calculations
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (weeklyProgress.percent / 100) * circumference;

  // Determine message based on weekly progress
  const getProgressMessage = () => {
    const { completed, target } = weeklyProgress;
    if (completed === 0) return 'Fresh week ahead';
    if (completed < target / 2) return 'Great start to the week';
    if (completed < target) return `${target - completed} more to complete the week`;
    return 'Week complete! Time to recover';
  };

  const handleLogActivity = (type: 'nutrition' | 'stretching' | 'foam_rolling') => {
    if (!activityLogged.includes(type)) {
      setActivityLogged([...activityLogged, type]);
      onLogActivity?.(type);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Rest Day Card - Calmer colors */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 50%, #E2E8F0 100%)',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)',
        }}
      >
        {/* Header */}
        <div className="p-6 text-center">
          {/* Rest Day Icon */}
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#94A3B8] to-[#64748B] flex items-center justify-center shadow-lg mb-4">
            <span className="text-2xl">R</span>
          </div>

          <h2
            className="text-2xl font-bold text-[#0F172A] mb-1"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Rest Day
          </h2>
          <p className="text-[#64748B]">Your muscles are growing right now</p>
        </div>

        {/* Progress Section */}
        <div className="px-6 pb-6">
          <div className="bg-white/80 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              {/* Progress Ring */}
              <div className="relative">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#E2E8F0" strokeWidth="8" />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#FF6B6B"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-[#0F172A]">
                    {weeklyProgress.completed}/{weeklyProgress.target}
                  </span>
                  <span className="text-xs text-[#64748B]">this week</span>
                </div>
              </div>

              {/* Stats */}
              <div className="text-center md:text-left space-y-4">
                <div>
                  <p className="text-xs text-[#64748B] uppercase tracking-wider font-medium">
                    Weekly Progress
                  </p>
                  <p className="text-lg font-semibold text-[#0F172A]">{getProgressMessage()}</p>
                </div>

                {/* Lifetime Stats */}
                <div className="flex gap-6">
                  <div>
                    <p className="text-xs text-[#64748B] uppercase tracking-wider">Total Workouts</p>
                    <p className="text-xl font-bold text-[#0F172A]">{lifetimeStats.totalWorkouts}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B] uppercase tracking-wider">Volume Lifted</p>
                    <p className="text-xl font-bold text-[#0F172A]">
                      {formatVolume(lifetimeStats.totalVolume)}
                    </p>
                  </div>
                </div>

                {lifetimeStats.currentStreak > 0 && (
                  <div className="inline-flex items-center gap-2 bg-[#FFE5E5] text-[#FF6B6B] px-3 py-1.5 rounded-full text-sm font-medium">
                    <span>🔥</span>
                    <span>{lifetimeStats.currentStreak} day streak</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Layout for Desktop */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recovery Tip Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.08)',
          }}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] flex items-center justify-center text-white shadow-md">
                <TipIcon type={recoveryTip.icon} />
              </div>
              <div>
                <p className="text-xs text-[#7C3AED] uppercase tracking-wider font-medium">
                  Recovery Tip
                </p>
                <p className="font-semibold text-[#5B21B6]">{recoveryTip.title}</p>
              </div>
            </div>

            <p className="text-[#5B21B6] leading-relaxed mb-3">{recoveryTip.tip}</p>

            <p className="text-xs text-[#8B5CF6]/70 italic">— {recoveryTip.source}</p>
          </div>
        </div>

        {/* Optional Activity Log */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
            boxShadow: '0 4px 20px rgba(34, 197, 94, 0.08)',
          }}
        >
          <div className="p-6">
            <h3 className="font-semibold text-[#166534] mb-1">Optional: Log Recovery Activity</h3>
            <p className="text-sm text-[#15803D]/70 mb-4">
              These are optional — resting is totally fine
            </p>

            <div className="space-y-2">
              {/* Nutrition */}
              <button
                onClick={() => handleLogActivity('nutrition')}
                disabled={activityLogged.includes('nutrition')}
                className={`w-full rounded-xl p-3 flex items-center gap-3 transition-all border ${
                  activityLogged.includes('nutrition')
                    ? 'bg-[#4ADE80]/20 border-[#4ADE80]'
                    : 'bg-white/80 border-[#86EFAC]/50 hover:border-[#4ADE80] hover:shadow-sm'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#D97706]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-[#166534]">
                    {activityLogged.includes('nutrition') ? '✓ Nutrition Logged' : 'Log Nutrition'}
                  </p>
                  <p className="text-xs text-[#15803D]/70">Track today&apos;s meals</p>
                </div>
              </button>

              {/* Stretching */}
              <button
                onClick={() => handleLogActivity('stretching')}
                disabled={activityLogged.includes('stretching')}
                className={`w-full rounded-xl p-3 flex items-center gap-3 transition-all border ${
                  activityLogged.includes('stretching')
                    ? 'bg-[#4ADE80]/20 border-[#4ADE80]'
                    : 'bg-white/80 border-[#86EFAC]/50 hover:border-[#4ADE80] hover:shadow-sm'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#DBEAFE] to-[#BFDBFE] flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-[#166534]">
                    {activityLogged.includes('stretching') ? '✓ Stretching Done' : 'Light Stretching'}
                  </p>
                  <p className="text-xs text-[#15803D]/70">5-10 min active recovery</p>
                </div>
              </button>

              {/* Foam Rolling */}
              <button
                onClick={() => handleLogActivity('foam_rolling')}
                disabled={activityLogged.includes('foam_rolling')}
                className={`w-full rounded-xl p-3 flex items-center gap-3 transition-all border ${
                  activityLogged.includes('foam_rolling')
                    ? 'bg-[#4ADE80]/20 border-[#4ADE80]'
                    : 'bg-white/80 border-[#86EFAC]/50 hover:border-[#4ADE80] hover:shadow-sm'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FCE7F3] to-[#FBCFE8] flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#DB2777]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-[#166534]">
                    {activityLogged.includes('foam_rolling') ? '✓ Foam Rolling Done' : 'Foam Rolling'}
                  </p>
                  <p className="text-xs text-[#15803D]/70">Massage and recovery</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Next Workout & Go HAM Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Next Workout Preview */}
        {nextWorkout && (
          <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
            <p className="text-xs text-[#64748B] uppercase tracking-wider font-medium mb-2">
              Next Workout
            </p>
            <h3 className="text-xl font-semibold text-[#0F172A] mb-1">{nextWorkout.name}</h3>
            <p className="text-[#64748B] mb-4">{nextWorkout.focus} · {nextWorkout.dayOfWeek}</p>

            <Link
              href={`/workout/${nextWorkout.id}?programId=${programId}&preview=true`}
              className="inline-flex items-center gap-2 text-[#FF6B6B] font-medium hover:text-[#EF5350] transition-colors"
            >
              Preview workout
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

        {/* Go HAM - Train Anyway */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
          <p className="text-xs text-[#64748B] uppercase tracking-wider font-medium mb-2">
            Feeling Energized?
          </p>
          <h3 className="text-xl font-semibold text-[#0F172A] mb-1">Go HAM</h3>
          <p className="text-[#64748B] mb-4">
            Want to train anyway? Your body, your choice.
          </p>

          {nextWorkout ? (
            <Link
              href={`/workout/${nextWorkout.id}?programId=${programId}`}
              onClick={() => onStartWorkout?.()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF6B6B] to-[#EF5350] text-white font-medium rounded-lg hover:shadow-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Workout
            </Link>
          ) : (
            <button
              onClick={() => onStartWorkout?.()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF6B6B] to-[#EF5350] text-white font-medium rounded-lg hover:shadow-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Workout
            </button>
          )}
        </div>
      </div>

      {/* Weekly Progress Indicator with day status from API */}
      {weeklyProgress.days && weeklyProgress.days.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
          <p className="text-xs text-[#64748B] uppercase tracking-wider font-medium mb-4">
            This Week&apos;s Schedule
          </p>
          <WeeklyDayIndicators days={weeklyProgress.days} />
          <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
            <WeeklyDayLegend />
          </div>
        </div>
      )}
    </div>
  );
}
