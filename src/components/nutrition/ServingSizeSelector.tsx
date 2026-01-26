'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { UnifiedFoodResult } from '@/lib/food-search/types';

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

/** Calculated macros for a specific serving size */
export interface CalculatedMacros {
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  food: UnifiedFoodResult;
}

export interface ServingSizeSelectorProps {
  food: UnifiedFoodResult;
  onConfirm: (macros: CalculatedMacros) => void;
  onCancel?: () => void;
  className?: string;
}

const QUICK_AMOUNTS = [50, 100, 150, 200];

export function ServingSizeSelector({
  food,
  onConfirm,
  onCancel,
  className = '',
}: ServingSizeSelectorProps) {
  const [grams, setGrams] = useState(100);

  // Calculate macros based on selected grams (food is per 100g)
  const calculatedMacros = useMemo((): CalculatedMacros => {
    const multiplier = grams / 100;
    return {
      grams,
      calories: Math.round(food.calories * multiplier),
      protein: Math.round(food.protein * multiplier * 10) / 10,
      carbs: Math.round(food.carbs * multiplier * 10) / 10,
      fat: Math.round(food.fat * multiplier * 10) / 10,
      food,
    };
  }, [grams, food]);

  const handleGramsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setGrams(value);
    } else if (e.target.value === '') {
      setGrams(0);
    }
  }, []);

  const handleQuickAmount = useCallback((amount: number) => {
    setGrams(amount);
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm(calculatedMacros);
  }, [onConfirm, calculatedMacros]);

  return (
    <div
      className={`rounded-xl border-2 p-4 ${className}`}
      style={{
        backgroundColor: COLORS.white,
        borderColor: COLORS.gray100,
      }}
    >
      {/* Food name header */}
      <div className="mb-4">
        <h3 className="font-semibold text-lg" style={{ color: COLORS.navy }}>
          {food.name}
        </h3>
        {food.brand && (
          <span
            className="text-xs px-2 py-0.5 rounded-full inline-block mt-1"
            style={{
              backgroundColor: COLORS.gray100,
              color: COLORS.gray600,
            }}
          >
            {food.brand}
          </span>
        )}
      </div>

      {/* Serving size input */}
      <div className="mb-4">
        <label
          htmlFor="grams-input"
          className="block text-sm font-medium mb-2"
          style={{ color: COLORS.gray600 }}
        >
          Serving size (grams)
        </label>
        <input
          id="grams-input"
          type="number"
          min={0}
          value={grams}
          onChange={handleGramsChange}
          className="w-full px-4 py-3 rounded-xl border-2 text-sm transition-colors outline-none"
          style={{
            borderColor: COLORS.gray100,
            backgroundColor: COLORS.white,
            color: COLORS.navy,
          }}
        />
      </div>

      {/* Quick amount buttons */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {QUICK_AMOUNTS.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => handleQuickAmount(amount)}
            className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={{
              backgroundColor: grams === amount ? COLORS.coral : COLORS.gray100,
              color: grams === amount ? COLORS.white : COLORS.gray600,
            }}
          >
            {amount}g
          </button>
        ))}
      </div>

      {/* Calculated macros display */}
      <div
        className="rounded-xl p-4 mb-4"
        style={{ backgroundColor: COLORS.coralLight }}
      >
        <div className="text-sm font-medium mb-2" style={{ color: COLORS.navy }}>
          Nutrition for {grams}g
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-2xl font-bold" style={{ color: COLORS.coral }}>
              {calculatedMacros.calories}
            </div>
            <div className="text-xs" style={{ color: COLORS.gray600 }}>
              cal
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: COLORS.coral }}>
              {calculatedMacros.protein}
            </div>
            <div className="text-xs" style={{ color: COLORS.gray600 }}>
              protein
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: COLORS.coral }}>
              {calculatedMacros.carbs}
            </div>
            <div className="text-xs" style={{ color: COLORS.gray600 }}>
              carbs
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: COLORS.coral }}>
              {calculatedMacros.fat}
            </div>
            <div className="text-xs" style={{ color: COLORS.gray600 }}>
              fat
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
            style={{
              backgroundColor: COLORS.gray100,
              color: COLORS.gray600,
            }}
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleConfirm}
          className="flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
          style={{
            backgroundColor: COLORS.coral,
            color: COLORS.white,
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}

export default ServingSizeSelector;
