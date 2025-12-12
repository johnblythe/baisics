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
    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left hover:bg-[#F8FAFC] transition-colors"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-xs font-medium text-[#94A3B8] tracking-wider mb-1">
              {mealTypeLabels[meal.type] || meal.type.toUpperCase()}
            </div>
            <div className="font-medium text-[#0F172A]">{meal.name}</div>
            {meal.prepTime && (
              <div className="text-xs text-[#64748B] mt-1">{meal.prepTime}</div>
            )}
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-[#0F172A]">
              {meal.macros.calories}
            </div>
            <div className="text-xs text-[#94A3B8]">cal</div>
          </div>
        </div>
        <div className="flex gap-3 mt-2 text-xs text-[#64748B]">
          <span>{meal.macros.protein}g P</span>
          <span>{meal.macros.carbs}g C</span>
          <span>{meal.macros.fat}g F</span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="py-3">
            <div className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">
              Ingredients
            </div>
            <ul className="space-y-1">
              {meal.ingredients.map((ing, idx) => (
                <li key={idx} className="text-sm text-[#475569] flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#94A3B8]" />
                  {ing.amount} {ing.name}
                </li>
              ))}
            </ul>
          </div>

          {meal.instructions && (
            <div className="py-3 border-t border-[#E2E8F0]">
              <div className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">
                Instructions
              </div>
              <p className="text-sm text-[#475569]">{meal.instructions}</p>
            </div>
          )}

          {isPro && onRegenerate && (
            <div className="pt-3 border-t border-[#E2E8F0]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRegenerate();
                }}
                className="text-sm text-[#FF6B6B] hover:text-[#EF5350] font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerate this meal
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
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
        <h3 className="font-semibold text-[#0F172A]">{day.dayName}</h3>
        {isOnTarget && (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            On target
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        {day.meals.map((meal, idx) => (
          <MealCard key={idx} meal={meal} isPro={isPro} />
        ))}
      </div>

      {/* Daily totals */}
      <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0]">
        <div className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">
          Daily Total
        </div>
        <div className="grid grid-cols-4 gap-2 text-sm">
          <div>
            <span className={`font-semibold ${Math.abs(caloriesDiff) <= 100 ? 'text-emerald-600' : 'text-[#0F172A]'}`}>
              {day.totalMacros.calories}
            </span>
            <span className="text-[#94A3B8] text-xs ml-1">cal</span>
          </div>
          <div>
            <span className={`font-semibold ${Math.abs(proteinDiff) <= 10 ? 'text-emerald-600' : 'text-[#0F172A]'}`}>
              {day.totalMacros.protein}g
            </span>
            <span className="text-[#94A3B8] text-xs ml-1">P</span>
          </div>
          <div>
            <span className="font-semibold text-[#0F172A]">{day.totalMacros.carbs}g</span>
            <span className="text-[#94A3B8] text-xs ml-1">C</span>
          </div>
          <div>
            <span className="font-semibold text-[#0F172A]">{day.totalMacros.fat}g</span>
            <span className="text-[#94A3B8] text-xs ml-1">F</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-[#94A3B8]">
          Target: {targetMacros.calories} cal • {targetMacros.protein}g P • {targetMacros.carbs}g C • {targetMacros.fat}g F
        </div>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#0F172A]">Your Meal Plan</h2>
        {isPro ? (
          <button
            onClick={handleSave}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
              saved
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-[#0F172A] text-white hover:bg-[#1E293B]'
            }`}
          >
            {saved ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Saved!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Plan
              </>
            )}
          </button>
        ) : (
          <button
            disabled
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Save Plan (Pro)
          </button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {plan.days.map((day) => (
          <DayCard key={day.day} day={day} isPro={isPro} targetMacros={targetMacros} />
        ))}
      </div>
    </div>
  );
}
