'use client';

import React, { useState, useEffect } from 'react';
import { X, Coffee, Sun, Moon, Cookie, Loader2 } from 'lucide-react';
import { MealType } from '@prisma/client';
import { formatDateForAPI } from '@/lib/date-utils';

// Meal icon mapping
const MEAL_ICONS: Record<MealType, typeof Coffee> = {
  BREAKFAST: Coffee,
  LUNCH: Sun,
  DINNER: Moon,
  SNACK: Cookie,
};

// Meal display names
const MEAL_NAMES: Record<MealType, string> = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACK: 'Snacks',
};

interface MealSummary {
  meal: MealType;
  calories: number;
  protein: number;
  entryCount: number;
  hasEntries: boolean;
}

interface DayMealsResponse {
  date: string;
  meals: MealSummary[];
  totalCalories: number;
  totalProtein: number;
  totalEntries: number;
  hasAnyEntries: boolean;
}

export interface CopyDayModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal closes */
  onClose: () => void;
  /** The date to copy from */
  sourceDate: Date;
  /** The date to copy to (usually today) */
  targetDate: Date;
  /** Callback when copy succeeds - refresh data */
  onCopySuccess: () => void;
}

function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export function CopyDayModal({
  isOpen,
  onClose,
  sourceDate,
  targetDate,
  onCopySuccess,
}: CopyDayModalProps) {
  const [meals, setMeals] = useState<MealSummary[]>([]);
  const [selectedMeals, setSelectedMeals] = useState<Set<MealType>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isCopying, setIsCopying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch meals from source date when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchMeals = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/food-log/day-meals?date=${formatDateForAPI(sourceDate)}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch meals');
        }
        const data: DayMealsResponse = await response.json();
        setMeals(data.meals);

        // Pre-select meals that have entries
        const mealsWithEntries = data.meals
          .filter((m) => m.hasEntries)
          .map((m) => m.meal);
        setSelectedMeals(new Set(mealsWithEntries));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load meals');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeals();
  }, [isOpen, sourceDate]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMeals([]);
      setSelectedMeals(new Set());
      setError(null);
    }
  }, [isOpen]);

  const toggleMeal = (meal: MealType) => {
    const newSelected = new Set(selectedMeals);
    if (newSelected.has(meal)) {
      newSelected.delete(meal);
    } else {
      newSelected.add(meal);
    }
    setSelectedMeals(newSelected);
  };

  // Calculate total calories for selected meals
  const selectedCalories = meals
    .filter((m) => selectedMeals.has(m.meal))
    .reduce((sum, m) => sum + m.calories, 0);

  const handleCopy = async () => {
    if (selectedMeals.size === 0) return;

    setIsCopying(true);
    setError(null);
    try {
      const response = await fetch('/api/food-log/copy-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceDate: formatDateForAPI(sourceDate),
          targetDate: formatDateForAPI(targetDate),
          meals: Array.from(selectedMeals),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to copy meals');
      }

      onCopySuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to copy meals');
    } finally {
      setIsCopying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="font-semibold text-gray-900">
              Copy from {formatDateForDisplay(sourceDate)}?
            </h3>
            <p className="text-sm text-gray-500">Select meals to copy to today</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-[#FF6B6B] animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {meals.map((meal) => {
                const Icon = MEAL_ICONS[meal.meal];
                const isChecked = selectedMeals.has(meal.meal);
                const isDisabled = !meal.hasEntries;

                return (
                  <label
                    key={meal.meal}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      isDisabled
                        ? 'bg-gray-50 opacity-50 cursor-not-allowed'
                        : isChecked
                        ? 'bg-[#FF6B6B]/5 border-2 border-[#FF6B6B]/20'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => !isDisabled && toggleMeal(meal.meal)}
                        disabled={isDisabled}
                        className="w-4 h-4 text-[#FF6B6B] rounded border-gray-300 focus:ring-[#FF6B6B] disabled:opacity-50"
                      />
                      <Icon className={`w-4 h-4 ${isDisabled ? 'text-gray-300' : 'text-gray-400'}`} />
                      <span className={`font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
                        {MEAL_NAMES[meal.meal]}
                      </span>
                    </div>
                    <span className={`text-sm ${isDisabled ? 'text-gray-300' : 'text-gray-500'}`}>
                      {meal.hasEntries ? `${meal.calories} cal` : 'No food logged'}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && !error && (
          <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={isCopying}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={isCopying || selectedMeals.size === 0}
              className="flex-1 px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCopying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Copying...
                </>
              ) : (
                `Copy (${selectedCalories} cal)`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
