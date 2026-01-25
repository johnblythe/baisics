'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NutritionTargetsModal } from '@/components/nutrition/NutritionTargetsModal';

// Colors matching v2a design system
const COLORS = {
  white: '#FFFFFF',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray400: '#94A3B8',
  gray600: '#475569',
  navy: '#0F172A',
  navyLight: '#1E293B',
  coral: '#FF6B6B',
  coralDark: '#EF5350',
  coralLight: '#FFE5E5',
};

interface DailySummaryResponse {
  today: {
    date: string;
    logged: {
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
      notes?: string;
    } | null;
    targets: {
      dailyCalories: number;
      proteinGrams: number;
      carbGrams: number;
      fatGrams: number;
    };
    source: 'program' | 'standalone' | 'default';
    isDefault: boolean;
  };
  weekly: Array<{
    date: string;
    logged: {
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    } | null;
    targets: {
      dailyCalories: number;
      proteinGrams: number;
      carbGrams: number;
      fatGrams: number;
    };
  }>;
  hasPersonalizedTargets: boolean;
}

interface FoodLogPageProps {
  onLogClick?: () => void;
}

export function FoodLogPage({ onLogClick }: FoodLogPageProps) {
  const [data, setData] = useState<DailySummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDailySummary = useCallback(async () => {
    try {
      const response = await fetch('/api/food-log/daily-summary');
      if (!response.ok) {
        throw new Error('Failed to fetch daily summary');
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDailySummary();
  }, [fetchDailySummary]);

  const handleSaved = useCallback(() => {
    // Refresh data after saving targets
    fetchDailySummary();
  }, [fetchDailySummary]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div
          className="w-8 h-8 border-3 rounded-full animate-spin"
          style={{
            borderColor: COLORS.gray100,
            borderTopColor: COLORS.coral,
            borderWidth: '3px',
          }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p style={{ color: COLORS.gray400 }}>{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            fetchDailySummary();
          }}
          className="mt-4 px-4 py-2 text-sm font-medium rounded-lg"
          style={{ backgroundColor: COLORS.coral, color: COLORS.white }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { today, hasPersonalizedTargets } = data;
  const { targets, logged, isDefault } = today;

  // Calculate progress percentages
  const caloriesProgress = logged
    ? Math.min(100, Math.round((logged.calories / targets.dailyCalories) * 100))
    : 0;
  const proteinProgress = logged
    ? Math.min(100, Math.round((logged.protein / targets.proteinGrams) * 100))
    : 0;
  const carbsProgress = logged
    ? Math.min(100, Math.round((logged.carbs / targets.carbGrams) * 100))
    : 0;
  const fatsProgress = logged
    ? Math.min(100, Math.round((logged.fats / targets.fatGrams) * 100))
    : 0;

  // SVG donut chart calculations
  const size = 120;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressDash = (caloriesProgress / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Set Goals Banner - Only show when using default targets */}
      {isDefault && (
        <div
          className="rounded-xl p-4 flex items-center justify-between"
          style={{ backgroundColor: COLORS.coralLight }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: COLORS.white }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke={COLORS.coral}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium" style={{ color: COLORS.navy }}>
                Set your nutrition goals
              </p>
              <p className="text-sm" style={{ color: COLORS.gray600 }}>
                Get personalized targets based on your goals
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: COLORS.coral, color: COLORS.white }}
          >
            Set Goals
          </button>
        </div>
      )}

      {/* Macro Progress Section */}
      <div
        className="rounded-2xl border shadow-sm overflow-hidden"
        style={{ backgroundColor: COLORS.white, borderColor: '#E2E8F0' }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: '#E2E8F0' }}
        >
          <h2
            className="text-sm font-medium uppercase tracking-wider"
            style={{ color: COLORS.gray400, fontFamily: "'Space Mono', monospace" }}
          >
            Today&apos;s Progress
          </h2>
          {/* Edit Targets button - Only show when not using defaults */}
          {!isDefault && hasPersonalizedTargets && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-sm font-medium flex items-center gap-1 transition-colors hover:opacity-80"
              style={{ color: COLORS.coral }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Targets
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Calorie Donut */}
            <div className="relative flex-shrink-0 mx-auto lg:mx-0">
              <svg width={size} height={size} className="transform -rotate-90">
                {/* Background ring */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={COLORS.gray100}
                  strokeWidth={strokeWidth}
                />
                {/* Progress ring */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={COLORS.coral}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${progressDash} ${circumference}`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-2xl font-bold leading-none"
                  style={{ color: COLORS.navy }}
                >
                  {logged?.calories || 0}
                </span>
                <span
                  className="text-xs uppercase tracking-wide"
                  style={{ color: COLORS.gray400 }}
                >
                  / {targets.dailyCalories}
                </span>
                <span
                  className="text-[10px] uppercase tracking-wide"
                  style={{ color: COLORS.gray400 }}
                >
                  kcal
                </span>
              </div>
            </div>

            {/* Macro Bars */}
            <div className="flex-1 space-y-4">
              {/* Protein */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS.coral }}
                    />
                    <span className="text-sm font-medium" style={{ color: COLORS.gray600 }}>
                      Protein
                    </span>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{ color: COLORS.navy, fontFamily: "'Space Mono', monospace" }}
                  >
                    {logged?.protein || 0}g / {targets.proteinGrams}g
                  </span>
                </div>
                <div className="h-2 rounded-full" style={{ backgroundColor: COLORS.gray100 }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: COLORS.coral,
                      width: `${proteinProgress}%`,
                    }}
                  />
                </div>
              </div>

              {/* Carbs */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS.navy }}
                    />
                    <span className="text-sm font-medium" style={{ color: COLORS.gray600 }}>
                      Carbs
                    </span>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{ color: COLORS.navy, fontFamily: "'Space Mono', monospace" }}
                  >
                    {logged?.carbs || 0}g / {targets.carbGrams}g
                  </span>
                </div>
                <div className="h-2 rounded-full" style={{ backgroundColor: COLORS.gray100 }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: COLORS.navy,
                      width: `${carbsProgress}%`,
                    }}
                  />
                </div>
              </div>

              {/* Fats */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS.gray400 }}
                    />
                    <span className="text-sm font-medium" style={{ color: COLORS.gray600 }}>
                      Fat
                    </span>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{ color: COLORS.navy, fontFamily: "'Space Mono', monospace" }}
                  >
                    {logged?.fats || 0}g / {targets.fatGrams}g
                  </span>
                </div>
                <div className="h-2 rounded-full" style={{ backgroundColor: COLORS.gray100 }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: COLORS.gray400,
                      width: `${fatsProgress}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Log food button */}
          {onLogClick && (
            <button
              onClick={onLogClick}
              className="mt-6 w-full py-3 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 hover:opacity-90"
              style={{ backgroundColor: COLORS.coral, color: COLORS.white }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              {logged ? 'Update Today' : 'Log Food'}
            </button>
          )}
        </div>
      </div>

      {/* Nutrition Targets Modal */}
      <NutritionTargetsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSaved}
        initialValues={
          !isDefault
            ? {
                dailyCalories: targets.dailyCalories,
                proteinGrams: targets.proteinGrams,
                carbGrams: targets.carbGrams,
                fatGrams: targets.fatGrams,
              }
            : undefined
        }
      />
    </div>
  );
}

export default FoodLogPage;
