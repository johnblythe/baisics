'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Calendar, Coffee, Sun, Moon, Cookie, ChevronLeft, Square, CheckSquare } from 'lucide-react';
import { MealType } from '@prisma/client';

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

export interface CopyMealModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal closes */
  onClose: () => void;
  /** The meal type to copy */
  mealType: MealType;
  /** The date to copy to (usually today) */
  targetDate: Date;
  /** Callback when copy succeeds - refresh data */
  onCopySuccess: () => void;
}

function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDateForDisplay(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dateNormalized = new Date(date);
  dateNormalized.setHours(0, 0, 0, 0);

  if (dateNormalized.getTime() === today.getTime()) {
    return 'Today';
  }
  if (dateNormalized.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

interface DaySummary {
  date: string;
  hasEntries: boolean;
  calories: number;
  protein: number;
  entryCount: number;
}

interface MealDetail {
  meal: MealType;
  calories: number;
  protein: number;
  entryCount: number;
  hasEntries: boolean;
}

interface DayMealsResponse {
  date: string;
  meals: MealDetail[];
  totalCalories: number;
  totalProtein: number;
  totalEntries: number;
  hasAnyEntries: boolean;
}

export function CopyMealModal({
  isOpen,
  onClose,
  mealType,
  targetDate,
  onCopySuccess,
}: CopyMealModalProps) {
  const [days, setDays] = useState<DaySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [mealDetails, setMealDetails] = useState<DayMealsResponse | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealType | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  // For "Copy Entire Day" mode - track which meals are checked
  const [selectedMeals, setSelectedMeals] = useState<Set<MealType>>(new Set());
  const [isCopyEntireDayMode, setIsCopyEntireDayMode] = useState(false);

  const Icon = MEAL_ICONS[mealType];
  const mealName = MEAL_NAMES[mealType];

  // Generate last 7 days (excluding target date)
  useEffect(() => {
    if (!isOpen) return;

    const fetchDays = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Generate last 7 days (excluding target date)
        const daysToFetch: Date[] = [];
        for (let i = 1; i <= 7; i++) {
          const date = new Date(targetDate);
          date.setDate(date.getDate() - i);
          daysToFetch.push(date);
        }

        // Fetch meal data for each day in parallel
        const responses = await Promise.all(
          daysToFetch.map(async (date) => {
            const dateStr = formatDateForAPI(date);
            const response = await fetch(
              `/api/food-log/day-meals?date=${dateStr}`
            );
            if (!response.ok) {
              return {
                date: dateStr,
                hasEntries: false,
                calories: 0,
                protein: 0,
                entryCount: 0,
              };
            }
            const data = await response.json();
            // Find the specific meal
            const mealData = data.meals?.find((m: { meal: MealType }) => m.meal === mealType);
            return {
              date: dateStr,
              hasEntries: mealData?.hasEntries ?? false,
              calories: mealData?.calories ?? 0,
              protein: mealData?.protein ?? 0,
              entryCount: mealData?.entryCount ?? 0,
            };
          })
        );

        setDays(responses);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load days');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDays();
  }, [isOpen, targetDate, mealType]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setDays([]);
      setError(null);
      setSelectedDay(null);
      setMealDetails(null);
      setSelectedMeal(null);
      setSelectedMeals(new Set());
      setIsCopyEntireDayMode(false);
    }
  }, [isOpen]);

  // Handle day selection - fetch full meal details
  const handleSelectDay = async (dayDate: string) => {
    if (selectedDay === dayDate) {
      // Already selected, do nothing
      return;
    }

    setSelectedDay(dayDate);
    setIsLoadingDetails(true);
    setMealDetails(null);
    setSelectedMeal(null);
    setIsCopyEntireDayMode(false);

    try {
      const response = await fetch(`/api/food-log/day-meals?date=${dayDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch meal details');
      }
      const data: DayMealsResponse = await response.json();
      setMealDetails(data);
      // Initialize selectedMeals with all meals that have entries (for Copy Entire Day)
      const mealsWithEntries = new Set<MealType>(
        data.meals.filter((m) => m.hasEntries).map((m) => m.meal)
      );
      setSelectedMeals(mealsWithEntries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load meal details');
      setSelectedDay(null);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Go back to day selection
  const handleBackToDays = () => {
    setSelectedDay(null);
    setMealDetails(null);
    setSelectedMeal(null);
    setSelectedMeals(new Set());
    setIsCopyEntireDayMode(false);
  };

  // Handle meal selection for copying (single meal mode)
  const handleSelectMeal = (meal: MealType, hasEntries: boolean) => {
    if (!hasEntries) return;
    // Exit "Copy Entire Day" mode when selecting a single meal
    setIsCopyEntireDayMode(false);
    setSelectedMeal(meal === selectedMeal ? null : meal);
  };

  // Toggle meal checkbox for "Copy Entire Day" mode
  const handleToggleMealCheckbox = (meal: MealType, e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger meal selection
    setSelectedMeals((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(meal)) {
        newSet.delete(meal);
      } else {
        newSet.add(meal);
      }
      return newSet;
    });
  };

  // Enter "Copy Entire Day" mode
  const handleEnterCopyEntireDayMode = () => {
    setSelectedMeal(null);
    setIsCopyEntireDayMode(true);
  };

  // Calculate totals for selected meals in Copy Entire Day mode
  const getSelectedMealsTotals = () => {
    if (!mealDetails) return { calories: 0, protein: 0, entries: 0 };
    return mealDetails.meals
      .filter((m) => selectedMeals.has(m.meal))
      .reduce(
        (acc, m) => ({
          calories: acc.calories + m.calories,
          protein: acc.protein + m.protein,
          entries: acc.entries + m.entryCount,
        }),
        { calories: 0, protein: 0, entries: 0 }
      );
  };

  // Handle copy meal
  const handleCopyMeal = async () => {
    if (!selectedDay || !selectedMeal) return;

    setIsCopying(true);
    try {
      const response = await fetch('/api/food-log/copy-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceDate: selectedDay,
          targetDate: formatDateForAPI(targetDate),
          meal: selectedMeal,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to copy meal');
      }

      const data = await response.json();

      // Show success message (using alert for now, could be toast)
      alert(`Copied ${data.copied} item${data.copied !== 1 ? 's' : ''} to ${MEAL_NAMES[selectedMeal]}`);

      onCopySuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to copy meal');
    } finally {
      setIsCopying(false);
    }
  };

  // Handle copy entire day (multiple meals)
  const handleCopyEntireDay = async () => {
    if (!selectedDay || selectedMeals.size === 0) return;

    setIsCopying(true);
    try {
      const response = await fetch('/api/food-log/copy-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceDate: selectedDay,
          targetDate: formatDateForAPI(targetDate),
          meals: Array.from(selectedMeals),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to copy meals');
      }

      const data = await response.json();

      // Show success message (using alert for now, could be toast)
      alert(`Copied ${data.copied} item${data.copied !== 1 ? 's' : ''} from ${selectedMeals.size} meal${selectedMeals.size !== 1 ? 's' : ''}`);

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
          <div className="flex items-center gap-3">
            {selectedDay && (
              <button
                type="button"
                onClick={handleBackToDays}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 -ml-1 mr-1"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="p-2 bg-[#F1F5F9] rounded-lg">
              <Icon className="w-5 h-5 text-[#64748B]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Copy {mealName}
              </h3>
              <p className="text-sm text-gray-500">
                {selectedDay
                  ? `From ${formatDateForDisplay(new Date(selectedDay + 'T00:00:00'))}`
                  : 'Select a day to copy from'
                }
              </p>
            </div>
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
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {isLoading || isLoadingDetails ? (
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
          ) : selectedDay && mealDetails ? (
            // Meal details view - shows all meals for the selected day
            <div className="space-y-3">
              <p className="text-sm text-gray-500 mb-4">
                {isCopyEntireDayMode
                  ? 'Check the meals you want to copy'
                  : 'Select a meal to copy · ' + mealDetails.totalCalories + ' cal total'
                }
              </p>
              {mealDetails.meals.map((meal) => {
                const MealIcon = MEAL_ICONS[meal.meal];
                const mealDisplayName = MEAL_NAMES[meal.meal];
                const isSelected = meal.meal === selectedMeal;
                const isChecked = selectedMeals.has(meal.meal);

                return (
                  <button
                    key={meal.meal}
                    type="button"
                    disabled={!meal.hasEntries}
                    onClick={() => isCopyEntireDayMode
                      ? handleToggleMealCheckbox(meal.meal, { stopPropagation: () => {} } as React.MouseEvent)
                      : handleSelectMeal(meal.meal, meal.hasEntries)
                    }
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      !meal.hasEntries
                        ? 'bg-gray-50 opacity-50 cursor-not-allowed'
                        : isCopyEntireDayMode && isChecked
                          ? 'bg-[#FF6B6B]/10 border-2 border-[#FF6B6B] cursor-pointer'
                          : isSelected
                            ? 'bg-[#FF6B6B]/10 border-2 border-[#FF6B6B] cursor-pointer'
                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isCopyEntireDayMode && meal.hasEntries && (
                        isChecked
                          ? <CheckSquare className="w-4 h-4 text-[#FF6B6B]" />
                          : <Square className="w-4 h-4 text-gray-400" />
                      )}
                      <MealIcon className={`w-4 h-4 ${
                        (isCopyEntireDayMode && isChecked) || isSelected ? 'text-[#FF6B6B]' : 'text-gray-400'
                      }`} />
                      <span className={`font-medium ${
                        (isCopyEntireDayMode && isChecked) || isSelected ? 'text-[#FF6B6B]' : 'text-gray-900'
                      }`}>
                        {mealDisplayName}
                      </span>
                    </div>
                    <span className={`text-sm ${
                      (isCopyEntireDayMode && isChecked) || isSelected ? 'text-[#FF6B6B]' : 'text-gray-500'
                    }`}>
                      {meal.hasEntries
                        ? `${meal.entryCount} item${meal.entryCount !== 1 ? 's' : ''} · ${meal.calories} cal · ${meal.protein}g protein`
                        : 'No entries'
                      }
                    </span>
                  </button>
                );
              })}

              {/* Macros preview for Copy Entire Day mode */}
              {isCopyEntireDayMode && selectedMeals.size > 0 && (
                <div className="mt-4 p-3 bg-[#FF6B6B]/5 rounded-lg border border-[#FF6B6B]/20">
                  <p className="text-sm font-medium text-gray-700">
                    Copying {selectedMeals.size} meal{selectedMeals.size !== 1 ? 's' : ''}:
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {getSelectedMealsTotals().entries} items · {getSelectedMealsTotals().calories} cal · {getSelectedMealsTotals().protein}g protein
                  </p>
                </div>
              )}

              {/* Copy Entire Day button - only show when not in that mode and a single meal isn't selected */}
              {!isCopyEntireDayMode && !selectedMeal && mealDetails.hasAnyEntries && (
                <button
                  type="button"
                  onClick={handleEnterCopyEntireDayMode}
                  className="w-full mt-4 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition-colors"
                >
                  Copy Entire Day...
                </button>
              )}
            </div>
          ) : (
            // Day selection view - shows last 7 days
            <div className="space-y-2">
              {days.map((day) => {
                const dayDate = new Date(day.date + 'T00:00:00');

                return (
                  <button
                    key={day.date}
                    type="button"
                    disabled={!day.hasEntries}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      !day.hasEntries
                        ? 'bg-gray-50 opacity-50 cursor-not-allowed'
                        : 'bg-gray-50 hover:bg-[#FF6B6B]/5 hover:border-[#FF6B6B]/20 border-2 border-transparent cursor-pointer'
                    }`}
                    onClick={() => handleSelectDay(day.date)}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className={`w-4 h-4 ${!day.hasEntries ? 'text-gray-300' : 'text-gray-400'}`} />
                      <span className={`font-medium ${!day.hasEntries ? 'text-gray-400' : 'text-gray-900'}`}>
                        {formatDateForDisplay(dayDate)}
                      </span>
                    </div>
                    <span className={`text-sm ${!day.hasEntries ? 'text-gray-300' : 'text-gray-500'}`}>
                      {day.hasEntries
                        ? `${day.calories} cal · ${day.entryCount} item${day.entryCount !== 1 ? 's' : ''}`
                        : `No ${mealName.toLowerCase()}`
                      }
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={isCopyEntireDayMode ? () => setIsCopyEntireDayMode(false) : onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            {isCopyEntireDayMode ? 'Back' : 'Cancel'}
          </button>
          {selectedDay && selectedMeal && !isCopyEntireDayMode && (
            <button
              type="button"
              onClick={handleCopyMeal}
              disabled={isCopying}
              className="flex-1 px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCopying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Copying...
                </>
              ) : (
                `Copy ${MEAL_NAMES[selectedMeal]}`
              )}
            </button>
          )}
          {isCopyEntireDayMode && selectedMeals.size > 0 && (
            <button
              type="button"
              onClick={handleCopyEntireDay}
              disabled={isCopying}
              className="flex-1 px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCopying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Copying...
                </>
              ) : (
                `Copy ${selectedMeals.size} Meal${selectedMeals.size !== 1 ? 's' : ''}`
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
