'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface DailyTotals {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  entryCount: number;
}

interface NutritionTargets {
  dailyCalories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
}

interface DailySummary {
  date: string;
  totals: DailyTotals;
  targets: NutritionTargets | null;
  weeklyCompliance: Array<{
    date: string;
    logged: boolean;
    adherencePercent: number | null;
  }>;
}

interface NutritionWidgetProps {
  onLogClick?: () => void;
}

export function NutritionWidget({ onLogClick }: NutritionWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchDailySummary() {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`/api/food-log/daily-summary?date=${today}`);

        if (!response.ok) {
          throw new Error('Failed to fetch nutrition data');
        }

        const data = await response.json();
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load nutrition data');
      } finally {
        setLoading(false);
      }
    }

    fetchDailySummary();
  }, []);

  // Calculate calorie progress percentage
  const caloriePercent = summary?.targets?.dailyCalories
    ? Math.min(100, (summary.totals.totalCalories / summary.targets.dailyCalories) * 100)
    : 0;

  // Calculate protein progress percentage
  const proteinPercent = summary?.targets?.proteinGrams
    ? Math.min(100, (summary.totals.totalProtein / summary.targets.proteinGrams) * 100)
    : 0;

  // Check if today has been logged
  const hasEntries = summary && summary.totals.entryCount > 0;

  // SVG ring config
  const ringSize = 120;
  const viewBox = 100;
  const radius = 42;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (caloriePercent / 100) * circumference;

  if (loading) {
    return (
      <Link href="/nutrition" className="block">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-t-2 border-[#FF6B6B] border-solid rounded-full animate-spin" />
          </div>
        </div>
      </Link>
    );
  }

  if (error) {
    return (
      <Link href="/nutrition" className="block">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
          <p className="text-[#94A3B8] text-sm text-center">{error}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link href="/nutrition" className="block">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <span
              className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Today&apos;s Nutrition
            </span>
            <div className="flex items-center gap-2">
              {!hasEntries && (
                <span className="text-xs px-2 py-1 bg-amber-50 text-amber-600 rounded-full">
                  Not logged today
                </span>
              )}
              <span className="text-xs text-[#94A3B8]">
                View all →
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!hasEntries && !summary?.targets ? (
            // Empty state - no entries and no targets
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#F8FAFC] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-[#475569] font-medium mb-1">Start tracking nutrition</p>
              <p className="text-sm text-[#94A3B8] mb-4">
                Log your meals to see progress
              </p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onLogClick?.();
                }}
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B6B] text-white text-sm font-medium rounded-lg hover:bg-[#EF5350] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Log Today
              </button>
            </div>
          ) : (
            // Has data or targets
            <div className="flex flex-col items-center">
              {/* Calorie Progress Ring */}
              <div className="relative mb-4">
                <svg
                  className="-rotate-90"
                  width={ringSize}
                  height={ringSize}
                  viewBox={`0 0 ${viewBox} ${viewBox}`}
                  role="img"
                  aria-label={`${summary?.totals.totalCalories || 0} of ${summary?.targets?.dailyCalories || '—'} calories`}
                >
                  {/* Background circle */}
                  <circle
                    cx={viewBox / 2}
                    cy={viewBox / 2}
                    r={radius}
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth={strokeWidth}
                  />
                  {/* Progress circle */}
                  {summary?.targets && (
                    <motion.circle
                      cx={viewBox / 2}
                      cy={viewBox / 2}
                      r={radius}
                      fill="none"
                      stroke="#FF6B6B"
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{
                        strokeDashoffset: mounted ? strokeDashoffset : circumference
                      }}
                      transition={{
                        duration: 1,
                        ease: 'easeOut',
                        delay: 0.2,
                      }}
                    />
                  )}
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-[#0F172A]">
                    {summary?.totals.totalCalories || 0}
                  </span>
                  <span className="text-xs text-[#64748B]">
                    {summary?.targets?.dailyCalories ? `/ ${summary.targets.dailyCalories}` : 'cal'}
                  </span>
                </div>
              </div>

              {/* Protein Progress Bar */}
              <div className="w-full">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-[#475569]">Protein</span>
                  <span className="text-xs text-[#64748B]">
                    {Math.round(summary?.totals.totalProtein || 0)}g
                    {summary?.targets?.proteinGrams && ` / ${summary.targets.proteinGrams}g`}
                  </span>
                </div>
                <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                  {summary?.targets?.proteinGrams && (
                    <motion.div
                      className="h-full bg-[#10B981] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: mounted ? `${proteinPercent}%` : 0 }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
                    />
                  )}
                </div>
              </div>

              {/* Weekly dots */}
              {summary?.weeklyCompliance && (
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex gap-1">
                    {summary.weeklyCompliance.map((day, i) => (
                      <div
                        key={day.date}
                        className={`w-2.5 h-2.5 rounded-full ${
                          day.logged ? 'bg-[#FF6B6B]' : 'bg-[#E2E8F0]'
                        } ${i === summary.weeklyCompliance.length - 1 ? 'ring-2 ring-[#FFE5E5]' : ''}`}
                        title={`${day.date}: ${day.logged ? 'Logged' : 'Not logged'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[#64748B]">
                    {summary.weeklyCompliance.filter(d => d.logged).length}/7 days
                  </span>
                </div>
              )}

              {/* Log button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onLogClick?.();
                }}
                type="button"
                className={`mt-4 w-full py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  hasEntries
                    ? 'bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]'
                    : 'bg-[#FF6B6B] text-white hover:bg-[#EF5350]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {hasEntries ? 'Add More' : 'Log Today'}
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default NutritionWidget;
