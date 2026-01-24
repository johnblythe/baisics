'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { MealType } from '@prisma/client';
import {
  MobileLayout,
  DesktopLayout,
  AIParseResult,
  type QuickFoodItem,
  type WeeklyDayData,
  type FoodLogItemData,
  type MealData,
  type RecipeItem,
  type ParsedFoodItem,
  type MacroTotals,
  type MacroTargets,
  type USDAFoodResult,
} from './index';

// API response types
interface FoodLogEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
  meal: MealType;
  date: string;
  fdcId?: string | null;
  brand?: string | null;
  source: string;
  notes?: string | null;
  createdAt: string;
  recipe?: {
    id: string;
    name: string;
    emoji?: string;
  } | null;
}

interface DailySummaryResponse {
  date: string;
  totals: {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    entryCount: number;
  };
  targets: {
    dailyCalories: number;
    proteinGrams: number;
    carbGrams: number;
    fatGrams: number;
  } | null;
  weeklyCompliance: Array<{
    date: string;
    logged: boolean;
    adherencePercent: number | null;
  }>;
}

interface QuickFoodResponse {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
  emoji?: string | null;
  fdcId?: string | null;
  brand?: string | null;
}

interface ParseTextResponse {
  foods: ParsedFoodItem[];
  originalText: string;
  isPreviousDayReference: boolean;
  message?: string;
}

// Props for the FoodLogPage
export interface FoodLogPageProps {
  /** Initial date to display (defaults to today) */
  initialDate?: Date;
  /** Callback when date changes (for external state sync) */
  onDateChange?: (date: Date) => void;
  /** Optional recipes data (can be fetched externally) */
  recipes?: RecipeItem[];
  /** Callback to open recipe creation modal */
  onCreateRecipe?: () => void;
  /** Callback when a recipe is added (optional, defaults to internal handling) */
  onRecipeAdd?: (recipe: RecipeItem) => void;
  /** User ID for USDA recent foods tracking */
  userId?: string;
}

// Format date for API calls (YYYY-MM-DD)
function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Format date for display (e.g., "Monday, Jan 23")
function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

// Check if date is today
function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

// Convert API entry to FoodLogItemData
function entryToItemData(entry: FoodLogEntry): FoodLogItemData {
  return {
    id: entry.id,
    name: entry.name,
    time: new Date(entry.createdAt).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }),
    calories: entry.calories,
    protein: entry.protein,
    carbs: entry.carbs,
    fat: entry.fat,
  };
}

// Map MealType enum to lowercase string for layout
function mealTypeToString(meal: MealType): string {
  return meal.toLowerCase();
}

export function FoodLogPage({
  initialDate,
  onDateChange,
  recipes = [],
  onCreateRecipe,
  onRecipeAdd,
  userId,
}: FoodLogPageProps) {
  // Current selected date
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const date = initialDate ?? new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  });

  // Data state
  const [entries, setEntries] = useState<Record<MealType, FoodLogEntry[]>>({
    BREAKFAST: [],
    LUNCH: [],
    DINNER: [],
    SNACK: [],
  });
  const [summary, setSummary] = useState<DailySummaryResponse | null>(null);
  const [quickFoods, setQuickFoods] = useState<QuickFoodResponse[]>([]);

  // Loading states
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingQuickFoods, setIsLoadingQuickFoods] = useState(true);
  const [isAIParsing, setIsAIParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // AI parse result state
  const [parseResult, setParseResult] = useState<ParseTextResponse | null>(null);
  const [parseTargetMeal, setParseTargetMeal] = useState<MealType>(MealType.SNACK);

  // Mobile quick add sheet
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Fetch entries for selected date
  const fetchEntries = useCallback(async () => {
    setIsLoadingEntries(true);
    setError(null);
    try {
      const response = await fetch(`/api/food-log?date=${formatDateForAPI(selectedDate)}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch entries');
      }
      const data = await response.json();
      setEntries(data.meals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch entries');
    } finally {
      setIsLoadingEntries(false);
    }
  }, [selectedDate]);

  // Fetch daily summary
  const fetchSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    try {
      const response = await fetch(`/api/food-log/daily-summary?date=${formatDateForAPI(selectedDate)}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch summary');
      }
      const data: DailySummaryResponse = await response.json();
      setSummary(data);
    } catch (err) {
      console.error('Error fetching summary:', err);
    } finally {
      setIsLoadingSummary(false);
    }
  }, [selectedDate]);

  // Fetch quick foods (only once on mount)
  const fetchQuickFoods = useCallback(async () => {
    setIsLoadingQuickFoods(true);
    try {
      const response = await fetch('/api/quick-foods');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch quick foods');
      }
      const data: QuickFoodResponse[] = await response.json();
      setQuickFoods(data);
    } catch (err) {
      console.error('Error fetching quick foods:', err);
    } finally {
      setIsLoadingQuickFoods(false);
    }
  }, []);

  // Fetch data on mount and date change
  useEffect(() => {
    fetchEntries();
    fetchSummary();
  }, [fetchEntries, fetchSummary]);

  useEffect(() => {
    fetchQuickFoods();
  }, [fetchQuickFoods]);

  // Date navigation
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
    onDateChange?.(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
    onDateChange?.(newDate);
  };

  // Add food entry
  const addFoodEntry = async (food: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize?: number;
    servingUnit?: string;
    meal: MealType;
    source?: string;
    fdcId?: string;
    recipeId?: string;
  }) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/food-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...food,
          date: formatDateForAPI(selectedDate),
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add food');
      }
      // Refresh data
      await Promise.all([fetchEntries(), fetchSummary()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add food');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit food entry
  const editFoodEntry = async (id: string, updates: Partial<FoodLogEntry>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/food-log/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update food');
      }
      // Refresh data
      await Promise.all([fetchEntries(), fetchSummary()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update food');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete food entry
  const deleteFoodEntry = async (id: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/food-log/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete food');
      }
      // Refresh data
      await Promise.all([fetchEntries(), fetchSummary()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete food');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Parse text with AI
  const parseText = async (text: string) => {
    setIsAIParsing(true);
    setError(null);
    try {
      const response = await fetch('/api/food-log/parse-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to parse text');
      }
      const data: ParseTextResponse = await response.json();
      if (data.foods.length === 0) {
        setError(data.message || 'No foods detected in your input');
      } else {
        setParseResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse text');
    } finally {
      setIsAIParsing(false);
    }
  };

  // Confirm parsed foods
  const confirmParsedFoods = async () => {
    if (!parseResult) return;

    setIsSubmitting(true);
    try {
      // Add all parsed foods
      await Promise.all(
        parseResult.foods.map((food) =>
          addFoodEntry({
            name: food.name,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            servingSize: food.servingSize,
            servingUnit: food.servingUnit,
            meal: parseTargetMeal,
            source: 'AI_PARSED',
          })
        )
      );
      setParseResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add parsed foods');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle quick food add - also increments usage count
  const handleQuickAdd = async (item: QuickFoodItem) => {
    // Add food entry to the log
    await addFoodEntry({
      name: item.name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs ?? 0,
      fat: item.fat ?? 0,
      servingSize: 1,
      servingUnit: 'serving',
      meal: MealType.SNACK,
      source: 'QUICK_ADD',
    });

    // Increment usage count in QuickFood
    try {
      await fetch('/api/quick-foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.name,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs ?? 0,
          fat: item.fat ?? 0,
          incrementUsage: true,
        }),
      });
      // Refresh quick foods list to reflect updated order
      await fetchQuickFoods();
    } catch (err) {
      console.error('Failed to update quick food usage:', err);
      // Non-blocking - food was already logged
    }
  };

  // Handle recipe add
  const handleRecipeAdd = (recipe: RecipeItem) => {
    if (onRecipeAdd) {
      onRecipeAdd(recipe);
    } else {
      addFoodEntry({
        name: recipe.name,
        calories: recipe.calories,
        protein: recipe.protein,
        carbs: 0,
        fat: 0,
        meal: MealType.SNACK,
        source: 'RECIPE',
        recipeId: recipe.id,
      });
    }
  };

  // Handle USDA food add - also upserts to Quick Add
  const handleUSDAFoodAdd = async (food: USDAFoodResult) => {
    // Add food entry to the log
    await addFoodEntry({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      meal: parseTargetMeal,
      source: 'USDA_SEARCH',
      fdcId: food.fdcId,
    });

    // Upsert to QuickFood for quick re-logging
    try {
      await fetch('/api/quick-foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          servingSize: food.servingSize,
          servingUnit: food.servingUnit,
          fdcId: food.fdcId,
          incrementUsage: true,
        }),
      });
      // Refresh quick foods list
      await fetchQuickFoods();
    } catch (err) {
      console.error('Failed to update quick foods:', err);
      // Non-blocking - food was already logged, this is just a convenience feature
    }
  };

  // Handle edit item
  const handleEditItem = (item: FoodLogItemData) => {
    // For now, we'll just log - full edit modal would be a separate component
    console.log('Edit item:', item);
    // TODO: Open edit modal
  };

  // Handle delete item
  const handleDeleteItem = (item: FoodLogItemData) => {
    if (confirm(`Delete "${item.name}"?`)) {
      deleteFoodEntry(item.id);
    }
  };

  // Handle add to specific meal
  const handleAddToMeal = (meal: string) => {
    // Convert lowercase meal string to MealType enum
    const mealType = meal.toUpperCase() as MealType;
    if (Object.values(MealType).includes(mealType)) {
      setParseTargetMeal(mealType);
    }
    setShowQuickAdd(true);
  };

  // Build macro totals and targets
  const macroTotals: MacroTotals = {
    calories: summary?.totals.totalCalories ?? 0,
    protein: summary?.totals.totalProtein ?? 0,
    carbs: summary?.totals.totalCarbs ?? 0,
    fat: summary?.totals.totalFat ?? 0,
  };

  const macroTargets: MacroTargets = {
    calories: summary?.targets?.dailyCalories ?? 2000,
    protein: summary?.targets?.proteinGrams ?? 150,
    carbs: summary?.targets?.carbGrams ?? 250,
    fat: summary?.targets?.fatGrams ?? 65,
  };

  // Build weekly data - map API response to WeeklyDayData interface
  const weekData: WeeklyDayData[] = (summary?.weeklyCompliance ?? []).map((day) => {
    const dayDate = new Date(day.date);
    const dayOfWeek = dayDate.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const isCurrentDay = dayDate.toDateString() === todayDate.toDateString();

    return {
      day: dayOfWeek,
      date: dayDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      calories: 0, // Would need additional API data for per-day calories
      target: macroTargets.calories,
      protein: 0, // Would need additional API data for per-day protein
      proteinTarget: macroTargets.protein,
      logged: day.logged,
      adherence: day.adherencePercent ?? 0,
      isToday: isCurrentDay,
    };
  });

  // Build meals data
  const mealsData: MealData[] = [
    { meal: 'breakfast', items: entries.BREAKFAST.map(entryToItemData) },
    { meal: 'lunch', items: entries.LUNCH.map(entryToItemData) },
    { meal: 'dinner', items: entries.DINNER.map(entryToItemData) },
    { meal: 'snack', items: entries.SNACK.map(entryToItemData) },
  ];

  // Build quick foods for pills
  const quickFoodItems: QuickFoodItem[] = quickFoods.map((qf) => ({
    id: qf.id,
    name: qf.name,
    calories: qf.calories,
    protein: qf.protein,
    carbs: qf.carbs,
    fat: qf.fat,
    emoji: qf.emoji ?? undefined,
  }));

  // Loading state
  const isLoading = isLoadingEntries || isLoadingSummary || isLoadingQuickFoods;

  if (isLoading && !entries.BREAKFAST.length && !summary) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#FF6B6B] animate-spin" />
          <p className="text-[#64748B]">Loading your food log...</p>
        </div>
      </div>
    );
  }

  // Custom header with date navigation
  const customHeader = (
    <div className="bg-[#FF6B6B] text-white px-4 py-3 lg:bg-white lg:border-b lg:border-[#E2E8F0]">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <button
          type="button"
          onClick={goToPreviousDay}
          className="p-2 hover:bg-white/10 lg:hover:bg-[#F1F5F9] rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 lg:text-[#64748B]" />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold lg:text-[#0F172A]">
            {isToday(selectedDate) ? 'Today' : formatDateForDisplay(selectedDate)}
          </h1>
          {!isToday(selectedDate) && (
            <p className="text-sm text-white/80 lg:text-[#64748B]">
              {formatDateForDisplay(selectedDate)}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={goToNextDay}
          className="p-2 hover:bg-white/10 lg:hover:bg-[#F1F5F9] rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 lg:text-[#64748B]" />
        </button>
      </div>
    </div>
  );

  // Error banner
  const errorBanner = error ? (
    <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm">{error}</span>
      <button
        type="button"
        onClick={() => setError(null)}
        className="ml-auto text-red-500 hover:text-red-700"
      >
        ×
      </button>
    </div>
  ) : null;

  // Calculate remaining for suggestion
  const remainingCalories = macroTargets.calories - macroTotals.calories;
  const remainingProtein = macroTargets.protein - macroTotals.protein;

  // Generate suggestion based on remaining macros
  let suggestion: string | undefined;
  if (remainingProtein > 30) {
    suggestion = `Add ${Math.round(remainingProtein)}g protein`;
  } else if (remainingCalories > 300) {
    suggestion = `${remainingCalories} cal remaining`;
  }

  return (
    <>
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <MobileLayout
          customHeader={customHeader}
          macroTotals={macroTotals}
          macroTargets={macroTargets}
          onAISubmit={parseText}
          isAILoading={isAIParsing}
          quickFoods={quickFoodItems}
          onQuickAdd={handleQuickAdd}
          weekData={weekData}
          meals={mealsData}
          onAddToMeal={handleAddToMeal}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
          showQuickAdd={showQuickAdd}
          setShowQuickAdd={setShowQuickAdd}
          recipes={recipes}
          onRecipeAdd={handleRecipeAdd}
          onCreateRecipe={onCreateRecipe}
          userId={userId}
          onUSDAFoodAdd={handleUSDAFoodAdd}
          remainingCalories={remainingCalories}
          remainingProtein={remainingProtein}
          suggestion={suggestion}
          customFooter={errorBanner ? (
            <>
              {errorBanner}
              <div className="px-4 py-3 bg-gradient-to-t from-white to-white/80 border-t border-[#E2E8F0]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-[#64748B]">Remaining</div>
                    <div className="font-bold text-[#0F172A]">
                      {remainingCalories.toLocaleString()} cal · {Math.round(remainingProtein)}g P
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : undefined}
        />
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <DesktopLayout
          customHeader={customHeader}
          macroTotals={macroTotals}
          macroTargets={macroTargets}
          onAISubmit={parseText}
          isAILoading={isAIParsing}
          quickFoods={quickFoodItems}
          onQuickAdd={handleQuickAdd}
          weekData={weekData}
          meals={mealsData}
          onAddToMeal={handleAddToMeal}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
          recipes={recipes}
          onRecipeAdd={handleRecipeAdd}
          onCreateRecipe={onCreateRecipe}
          userId={userId}
          onUSDAFoodAdd={handleUSDAFoodAdd}
          suggestion={suggestion}
          suggestionDetail={suggestion}
          rightContentExtra={errorBanner}
        />
      </div>

      {/* AI Parse Result Modal */}
      <AnimatePresence>
        {parseResult && (
          <AIParseResult
            inputText={parseResult.originalText}
            parsedFoods={parseResult.foods}
            isPreviousDayReference={parseResult.isPreviousDayReference}
            onConfirm={confirmParsedFoods}
            onCancel={() => setParseResult(null)}
          />
        )}
      </AnimatePresence>

      {/* Submitting overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-xl shadow-lg flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-[#FF6B6B] animate-spin" />
            <span className="text-[#0F172A]">Saving...</span>
          </div>
        </div>
      )}
    </>
  );
}
