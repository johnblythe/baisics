'use client';

import React, { useState } from 'react';
import { MealPlan, DayPlan, Meal } from '../page';

interface MealPlanDisplayProps {
  plan: MealPlan;
  isPro: boolean;
  onSave: () => void;
  targetMacros: {
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
  };
}

interface MealCardProps {
  meal: Meal;
  isPro: boolean;
  onRegenerate?: () => void;
}

function MealCard({ meal, isPro, onRegenerate }: MealCardProps) {
  const [expanded, setExpanded] = useState(false);

  const mealTypeLabels: Record<string, string> = {
    breakfast: 'BREAKFAST',
    lunch: 'LUNCH',
    dinner: 'DINNER',
    snack: 'SNACK',
  };

  return (
    <div className={`border-l-2 ${expanded ? 'border-[#FF6B6B]' : 'border-transparent hover:border-[#E2E8F0]'} transition-colors`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full py-2 px-3 text-left hover:bg-[#F8FAFC] transition-colors flex items-center gap-3"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-[#94A3B8] tracking-wider">
              {mealTypeLabels[meal.type] || meal.type.toUpperCase()}
            </span>
            {meal.prepTime && (
              <span className="text-[10px] text-[#CBD5E1]">{meal.prepTime}</span>
            )}
          </div>
          <div className="font-medium text-sm text-[#0F172A] truncate">{meal.name}</div>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#64748B] whitespace-nowrap">
          <span>{meal.macros.protein}P</span>
          <span>{meal.macros.carbs}C</span>
          <span>{meal.macros.fat}F</span>
          <span className="font-semibold text-[#0F172A]">{meal.macros.calories}</span>
        </div>
        <svg
          className={`w-4 h-4 text-[#94A3B8] transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-3 pb-3 bg-[#F8FAFC] border-t border-[#E2E8F0]">
          <div className="py-2">
            <div className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider mb-1.5">
              Ingredients
            </div>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5">
              {meal.ingredients.map((ing, idx) => (
                <li key={idx} className="text-xs text-[#475569] truncate">
                  {ing.amount} {ing.name}
                </li>
              ))}
            </ul>
          </div>

          {meal.instructions && (
            <div className="py-2 border-t border-[#E2E8F0]">
              <div className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider mb-1">
                Instructions
              </div>
              <p className="text-xs text-[#475569]">{meal.instructions}</p>
            </div>
          )}

          {isPro && onRegenerate && (
            <div className="pt-2 border-t border-[#E2E8F0]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRegenerate();
                }}
                className="text-xs text-[#FF6B6B] hover:text-[#EF5350] font-medium flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Swap meal
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DayCard({ day, isPro, targetMacros }: { day: DayPlan; isPro: boolean; targetMacros: MealPlanDisplayProps['targetMacros'] }) {
  const caloriesDiff = day.totalMacros.calories - targetMacros.calories;
  const proteinDiff = day.totalMacros.protein - targetMacros.protein;

  const isOnTarget = Math.abs(caloriesDiff) <= 100 && Math.abs(proteinDiff) <= 10;

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      {/* Day header with totals inline */}
      <div className="px-3 py-2 border-b border-[#E2E8F0] flex items-center justify-between bg-[#FAFBFC]">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-[#0F172A]">{day.dayName}</h3>
          {isOnTarget && (
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              On target
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`font-medium ${Math.abs(caloriesDiff) <= 100 ? 'text-emerald-600' : 'text-[#64748B]'}`}>
            {day.totalMacros.calories} cal
          </span>
          <span className="text-[#CBD5E1]">|</span>
          <span className="text-[#64748B]">
            {day.totalMacros.protein}P {day.totalMacros.carbs}C {day.totalMacros.fat}F
          </span>
        </div>
      </div>

      {/* Meals - compact list */}
      <div className="divide-y divide-[#F1F5F9]">
        {day.meals.map((meal, idx) => (
          <MealCard key={idx} meal={meal} isPro={isPro} />
        ))}
      </div>
    </div>
  );
}

export function MealPlanDisplay({ plan, isPro, onSave, targetMacros }: MealPlanDisplayProps) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider" style={{ fontFamily: "'Space Mono', monospace" }}>
          Your Meal Plan
        </h2>
        {isPro ? (
          <button
            onClick={handleSave}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              saved
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-[#0F172A] text-white hover:bg-[#1E293B]'
            }`}
          >
            {saved ? (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Saved
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save
              </>
            )}
          </button>
        ) : (
          <button
            disabled
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#F8FAFC] text-[#CBD5E1] cursor-not-allowed flex items-center gap-1.5"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Save (Pro)
          </button>
        )}
      </div>

      <div className="space-y-4">
        {plan.days.map((day) => (
          <DayCard key={day.day} day={day} isPro={isPro} targetMacros={targetMacros} />
        ))}
      </div>
    </div>
  );
}
