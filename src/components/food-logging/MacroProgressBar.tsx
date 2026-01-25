'use client';

import React from 'react';

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MacroProgressBarProps {
  layout?: 'horizontal' | 'vertical';
  totals: MacroTotals;
  targets: MacroTargets;
}

export function MacroProgressBar({ layout = 'horizontal', totals, targets }: MacroProgressBarProps) {
  if (layout === 'vertical') {
    return (
      <div className="space-y-3">
        {[
          { label: 'Calories', current: totals.calories, target: targets.calories, color: 'bg-[#FF6B6B]', textColor: 'text-[#0F172A]' },
          { label: 'Protein', current: totals.protein, target: targets.protein, color: 'bg-green-500', textColor: 'text-green-600', unit: 'g' },
          { label: 'Carbs', current: totals.carbs, target: targets.carbs, color: 'bg-amber-500', textColor: 'text-amber-600', unit: 'g' },
          { label: 'Fat', current: totals.fat, target: targets.fat, color: 'bg-blue-500', textColor: 'text-blue-600', unit: 'g' },
        ].map((macro) => (
          <div key={macro.label}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-[#64748B]">{macro.label}</span>
              <span className={`font-medium ${macro.textColor}`}>
                {macro.current}{macro.unit || ''} / {macro.target}{macro.unit || ''}
              </span>
            </div>
            <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className={`h-full ${macro.color} rounded-full transition-all`}
                style={{ width: `${Math.min((macro.current / macro.target) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
        <div className="pt-2 border-t border-[#E2E8F0]">
          <div className="text-sm text-[#64748B]">Remaining</div>
          <div className="text-lg font-bold text-[#0F172A]">
            {targets.calories - totals.calories} cal · {targets.protein - totals.protein}g P
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-[#64748B]">Calories</span>
          <span className="font-medium text-[#0F172A]">{totals.calories} / {targets.calories}</span>
        </div>
        <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FF6B6B] rounded-full transition-all"
            style={{ width: `${Math.min((totals.calories / targets.calories) * 100, 100)}%` }}
          />
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-[#64748B]">Protein</span>
          <span className="font-medium text-green-600">{totals.protein}g / {targets.protein}g</span>
        </div>
        <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${Math.min((totals.protein / targets.protein) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
