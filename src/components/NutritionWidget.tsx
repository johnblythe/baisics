'use client';

import React, { useEffect, useState } from 'react';
import { MacroDisplay } from './MacroDisplay';

interface NutritionLog {
  id: string;
  date: string;
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
}

interface NutritionSummary {
  totalDays: number;
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFats: number;
}

interface NutritionWidgetProps {
  onLogClick: () => void;
}

export function NutritionWidget({ onLogClick }: NutritionWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [summary, setSummary] = useState<NutritionSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNutritionData() {
      try {
        // Fetch last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const response = await fetch(
          `/api/nutrition/history?startDate=${sevenDaysAgo.toISOString()}&limit=7`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch nutrition data');
        }

        const data = await response.json();
        setLogs(data.logs || []);
        setSummary(data.summary || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load nutrition data');
      } finally {
        setLoading(false);
      }
    }

    fetchNutritionData();
  }, []);

  // Check if today has been logged
  const today = new Date().toISOString().split('T')[0];
  const todayLogged = logs.some(log => log.date.split('T')[0] === today);

  // Count days logged in last 7
  const daysLogged = logs.length;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-t-2 border-[#FF6B6B] border-solid rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
        <p className="text-[#94A3B8] text-sm text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E2E8F0]">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider" style={{ fontFamily: "'Space Mono', monospace" }}>
            Nutrition This Week
          </h3>
          {!todayLogged && (
            <span className="text-xs px-2 py-1 bg-amber-50 text-amber-600 rounded-full">
              Not logged today
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {daysLogged === 0 ? (
          // Empty state
          <div className="text-center py-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#F8FAFC] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-[#475569] font-medium mb-1">Start tracking nutrition</p>
            <p className="text-sm text-[#94A3B8] mb-4">
              Log your daily macros to see trends
            </p>
            <button
              onClick={onLogClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B6B] text-white text-sm font-medium rounded-lg hover:bg-[#EF5350] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Log Today
            </button>
          </div>
        ) : (
          // Has data
          <div className="space-y-4">
            {/* Days logged indicator */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < daysLogged ? 'bg-[#FF6B6B]' : 'bg-[#E2E8F0]'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-[#475569]">
                {daysLogged} of 7 days logged
              </span>
            </div>

            {/* Average macros display */}
            {summary && summary.avgCalories > 0 && (
              <MacroDisplay
                protein={summary.avgProtein}
                carbs={summary.avgCarbs}
                fats={summary.avgFats}
                calories={summary.avgCalories}
                compact
              />
            )}

            {/* Log button */}
            <button
              onClick={onLogClick}
              className={`w-full py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                todayLogged
                  ? 'bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]'
                  : 'bg-[#FF6B6B] text-white hover:bg-[#EF5350]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {todayLogged ? 'Update Today' : 'Log Today'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default NutritionWidget;
