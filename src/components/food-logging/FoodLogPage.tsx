'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, Target } from 'lucide-react';
import { NutritionTargetsModal } from '@/components/nutrition/NutritionTargetsModal';
import { MealType } from '@prisma/client';
import { toast } from 'sonner';
import { useStaples, type FoodStaple } from '@/hooks/useStaples';
import { StapleManageModal } from './StapleManageModal';
import {
  MobileLayout,
  DesktopLayout,
  AIParseResult,
  FoodEditModal,
  CreateRecipeModal,
  DateMenu,
  CopyDayModal,
  CopyMealModal,
  DatePickerModal,
  type QuickFoodItem,
  type WeeklyDayData,
  type FoodLogItemData,
  type MealData,
  type RecipeItem,
  type ParsedFoodItem,
  type MacroTotals,
  type MacroTargets,
  type USDAFoodResult,
  type FoodEditData,
  type MealSectionFoodResult,
  type Recipe,
  type RecipeWithIngredients,
  type MergedQuickItem,
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
  stapleId?: string | null;
  notes?: string | null;
  createdAt: string;
  isApproximate?: boolean;
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
    protein: number;
    calories: number;
  }>;
  source?: string;
  isDefault?: boolean;
  hasPersonalizedTargets?: boolean;
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
  detectedMeal?: MealType;
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

// Format date for API calls (YYYY-MM-DD) using local timezone
function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
    calories: entry.calories,
    protein: entry.protein,
    carbs: entry.carbs,
    fat: entry.fat,
    isApproximate: entry.isApproximate,
    stapleId: entry.stapleId,
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
  // Tab state + URL sync
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'log' | 'pantry'>(() =>
    searchParams.get('tab') === 'pantry' ? 'pantry' : 'log'
  );

  const handleTabChange = useCallback((tab: 'log' | 'pantry') => {
    setActiveTab(tab);
    if (tab === 'pantry') {
      router.replace('/nutrition?tab=pantry', { scroll: false });
    } else {
      router.replace('/nutrition', { scroll: false });
    }
  }, [router]);

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
  const [topRecipes, setTopRecipes] = useState<Array<{
    id: string;
    name: string;
    emoji: string | null;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize: number;
    servingUnit: string;
    usageCount: number;
  }>>([]);

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

  // Edit modal state
  const [editingItem, setEditingItem] = useState<FoodEditData | null>(null);

  // Create recipe modal state
  const [showCreateRecipeModal, setShowCreateRecipeModal] = useState(false);

  // Copy day modal state
  const [showCopyDayModal, setShowCopyDayModal] = useState(false);
  const [copyFromDate, setCopyFromDate] = useState<Date | null>(null);

  // Date picker modal state (for "Pick a date..." option)
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);

  // Nutrition targets modal state
  const [showTargetsModal, setShowTargetsModal] = useState(false);

  // Copy meal modal state
  const [showCopyMealModal, setShowCopyMealModal] = useState(false);
  const [copyMealType, setCopyMealType] = useState<MealType>(MealType.SNACK);

  // Recipe sidebar refresh trigger
  const [recipeSidebarRefreshTrigger, setRecipeSidebarRefreshTrigger] = useState(0);

  // Staples
  const {
    staples: staplesBySlot,
    dismissedSlots,
    logStaple,
    undoLogStaple,
    dismissSlot,
    undismissSlot,
    deleteStaple,
    createStaple,
    fetchStaples,
    toggleAutoLog,
  } = useStaples();

  // Manage modal state
  const [managingSlot, setManagingSlot] = useState<MealType | null>(null);

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
      setError(err instanceof Error ? err.message : 'Failed to load daily summary');
    } finally {
      setIsLoadingSummary(false);
    }
  }, [selectedDate]);

  // Fetch quick foods (only once on mount)
  const fetchQuickFoods = useCallback(async () => {
    setIsLoadingQuickFoods(true);
    try {
      const response = await fetch('/api/quick-foods');
      const data = await response.json();
      if (!response.ok) {
        // Non-critical - just log and continue with empty quick foods
        console.warn('Quick foods fetch failed:', data.error || response.status);
        setQuickFoods([]);
        return;
      }
      setQuickFoods(data);
    } catch (err) {
      // Network error or JSON parse error - continue with empty quick foods
      console.warn('Quick foods fetch error:', err);
      setQuickFoods([]);
    } finally {
      setIsLoadingQuickFoods(false);
    }
  }, []);

  // Fetch top recipes by usageCount (for QuickPills)
  const fetchTopRecipes = useCallback(async () => {
    try {
      const response = await fetch('/api/recipes?limit=3');
      const data = await response.json();
      if (!response.ok) {
        console.warn('Top recipes fetch failed:', data.error || response.status);
        setTopRecipes([]);
        return;
      }
      // Filter to only recipes with usageCount > 0 (actually used recipes)
      const usedRecipes = data.filter((r: { usageCount: number }) => r.usageCount > 0);
      setTopRecipes(usedRecipes.slice(0, 3));
    } catch (err) {
      console.warn('Top recipes fetch error:', err);
      setTopRecipes([]);
    }
  }, []);

  // Fetch data on mount and date change
  // Entries first (triggers auto-log for today), then summary (needs those entries)
  useEffect(() => {
    fetchEntries()
      .then(() => fetchSummary())
      .catch((err) => console.error('Food log fetch sequence failed:', err));
  }, [fetchEntries, fetchSummary]);

  useEffect(() => {
    fetchQuickFoods();
    fetchTopRecipes();
  }, [fetchQuickFoods, fetchTopRecipes]);

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

  const goToToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setSelectedDate(today);
    onDateChange?.(today);
  };

  const handleDayClick = (dateStr: string) => {
    const newDate = new Date(dateStr + 'T00:00:00');
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
        // Use detected meal from AI if available
        if (data.detectedMeal) {
          setParseTargetMeal(data.detectedMeal);
        }
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

    // Show toast confirmation
    toast.success(`Added: ${item.name}`);

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

  // Handle recipe add (legacy RecipeItem)
  const handleRecipeAdd = async (recipe: RecipeItem) => {
    if (onRecipeAdd) {
      onRecipeAdd(recipe);
    } else {
      await addFoodEntry({
        name: recipe.name,
        calories: recipe.calories,
        protein: recipe.protein,
        carbs: 0,
        fat: 0,
        meal: MealType.SNACK,
        source: 'RECIPE',
        recipeId: recipe.id,
      });
      toast.success(`Added: ${recipe.name}`);
    }
  };

  // Handle sidebar recipe add (self-fetching Recipe type)
  const handleSidebarRecipeAdd = async (recipe: Recipe) => {
    await addFoodEntry({
      name: recipe.name,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      servingSize: recipe.servingSize,
      servingUnit: recipe.servingUnit,
      meal: MealType.SNACK,
      source: 'RECIPE',
      recipeId: recipe.id,
    });

    toast.success(`Added: ${recipe.name}`);

    // Increment usage count for the recipe (non-blocking)
    try {
      const res = await fetch(`/api/recipes/${recipe.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usageCount: recipe.usageCount + 1 }),
      });
      if (!res.ok) console.warn('Failed to update recipe usage count:', res.status);
    } catch (err) {
      console.error('Failed to update recipe usage:', err);
    }
  };

  // Handle recipe log from QuickPills (uses /api/recipes/[id]/log endpoint)
  const handleQuickRecipeLog = async (
    item: QuickFoodItem,
    meal: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
  ) => {
    if (!item.recipeId) return;

    try {
      const response = await fetch(`/api/recipes/${item.recipeId}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meal,
          date: formatDateForAPI(selectedDate),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to log recipe');
      }

      toast.success(`Added: ${item.name}`);

      // Refresh entries and summary to show the new log
      await Promise.all([fetchEntries(), fetchSummary()]);

      // Refresh top recipes (usageCount changed)
      await fetchTopRecipes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log recipe');
    }
  };

  // Handle inline recipe add (from meal section search panel - with multiplier and meal context)
  const handleInlineRecipeAdd = async (recipe: RecipeWithIngredients, multiplier: number, mealStr: string) => {
    // Convert meal string to MealType enum
    const meal = mealStr.toUpperCase() as MealType;
    const servingLabel = multiplier === 1 ? '' : ` (${multiplier}x)`;

    await addFoodEntry({
      name: recipe.name + servingLabel,
      calories: Math.round(recipe.calories * multiplier),
      protein: recipe.protein * multiplier,
      carbs: recipe.carbs * multiplier,
      fat: recipe.fat * multiplier,
      servingSize: recipe.servingSize * multiplier,
      servingUnit: recipe.servingUnit,
      meal,
      source: 'RECIPE',
      recipeId: recipe.id,
    });

    toast.success(`Added: ${recipe.name}${servingLabel}`);

    // Increment usage count for the recipe (non-blocking)
    try {
      const res = await fetch(`/api/recipes/${recipe.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usageCount: recipe.usageCount + 1 }),
      });
      if (!res.ok) console.warn('Failed to update recipe usage count:', res.status);
    } catch (err) {
      console.error('Failed to update recipe usage:', err);
    }
  };

  // Handle USDA food add - also upserts to Quick Add
  const handleUSDAFoodAdd = async (food: USDAFoodResult) => {
    // Determine source - use food.source if provided, otherwise default to USDA_SEARCH
    const source = food.source || 'USDA_SEARCH';

    // Add food entry to the log - use meal from USDAFoodResult (selected by user)
    await addFoodEntry({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      meal: food.meal,
      source,
      fdcId: food.fdcId,
    });

    // Upsert to QuickFood for quick re-logging (skip for AI estimated foods)
    if (source !== 'AI_ESTIMATED') {
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
    }
  };

  // Handle edit item
  const handleEditItem = (item: FoodLogItemData) => {
    // Find the full entry to get all fields
    const allEntries = [
      ...entries.BREAKFAST,
      ...entries.LUNCH,
      ...entries.DINNER,
      ...entries.SNACK,
    ];
    const fullEntry = allEntries.find((e) => e.id === item.id);

    if (fullEntry) {
      setEditingItem({
        id: fullEntry.id,
        name: fullEntry.name,
        calories: fullEntry.calories,
        protein: fullEntry.protein,
        carbs: fullEntry.carbs,
        fat: fullEntry.fat,
        servingSize: fullEntry.servingSize,
        servingUnit: fullEntry.servingUnit,
        meal: fullEntry.meal,
      });
    } else {
      toast.error('Item not found. Refreshing...');
      fetchEntries();
    }
  };

  // Handle save edit
  const handleSaveEdit = async (id: string, updates: Partial<FoodEditData>) => {
    await editFoodEntry(id, updates);
    setEditingItem(null);
    toast.success('Food updated');
  };

  // Handle delete item
  const handleDeleteItem = async (item: FoodLogItemData) => {
    if (confirm(`Delete "${item.name}"?`)) {
      await deleteFoodEntry(item.id);
      toast.success(`Deleted: ${item.name}`);
    }
  };

  // Handle add to specific meal (legacy - opens bottom sheet)
  const handleAddToMeal = (meal: string) => {
    // Convert lowercase meal string to MealType enum
    const mealType = meal.toUpperCase() as MealType;
    if (Object.values(MealType).includes(mealType)) {
      setParseTargetMeal(mealType);
    }
    setShowQuickAdd(true);
  };

  // Handle create recipe - use external callback if provided, otherwise show internal modal
  const handleCreateRecipe = useCallback(() => {
    if (onCreateRecipe) {
      onCreateRecipe();
    } else {
      setShowCreateRecipeModal(true);
    }
  }, [onCreateRecipe]);

  // Handle copy from yesterday - refresh entries and summary
  const handleCopyFromYesterday = useCallback(async () => {
    await Promise.all([fetchEntries(), fetchSummary()]);
  }, [fetchEntries, fetchSummary]);

  // Handle save meal as recipe - refresh sidebar
  const handleSaveAsRecipe = useCallback(() => {
    // Increment trigger to refresh MyRecipesSidebar
    setRecipeSidebarRefreshTrigger((prev) => prev + 1);
  }, []);

  // Handle suggestion card click - open quick add
  const handleSuggestionClick = useCallback(() => {
    setShowQuickAdd(true);
  }, []);

  // Handle copy from yesterday (for DateMenu) - opens copy day modal
  const handleDateMenuCopyFromYesterday = useCallback(() => {
    const yesterday = new Date(selectedDate);
    yesterday.setDate(yesterday.getDate() - 1);
    setCopyFromDate(yesterday);
    setShowCopyDayModal(true);
  }, [selectedDate]);

  // Handle pick date (for DateMenu) - opens date picker modal
  const handlePickDate = useCallback(() => {
    setShowDatePickerModal(true);
  }, []);

  // Handle date selection from date picker - opens copy day modal with selected date
  const handleDatePickerSelect = useCallback((date: Date) => {
    setCopyFromDate(date);
    setShowDatePickerModal(false);
    setShowCopyDayModal(true);
  }, []);

  // Handle clear day's food log
  const handleClearDay = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/food-log?date=${formatDateForAPI(selectedDate)}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to clear food log');
      }
      const data = await response.json();
      toast.success(`Cleared ${data.deletedCount} entries`);
      // Refresh data
      await Promise.all([fetchEntries(), fetchSummary()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear food log');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedDate, fetchEntries, fetchSummary]);

  // Handle open copy meal modal
  const handleOpenCopyMealModal = useCallback((mealType: MealType) => {
    setCopyMealType(mealType);
    setShowCopyMealModal(true);
  }, []);

  // Handle inline food add from MealSection
  const handleInlineFoodAdd = async (food: MealSectionFoodResult) => {
    // Map FoodSearchSource values to Prisma FoodSource enum values
    const sourceMap: Record<string, string> = {
      'USDA': 'USDA_SEARCH',
      'QUICK_FOOD': 'QUICK_ADD',
      'OPEN_FOOD_FACTS': 'OPEN_FOOD_FACTS',
      'AI_ESTIMATED': 'AI_ESTIMATED',
    };
    const source = sourceMap[food.source || ''] || food.source || 'USDA_SEARCH';

    // Add food entry to the log - meal is pre-selected from the MealSection
    await addFoodEntry({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      meal: food.meal,
      source,
      fdcId: food.fdcId,
    });

    // Upsert to QuickFood for quick re-logging (skip for AI estimated foods)
    if (source !== 'AI_ESTIMATED') {
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
      }
    }

    toast.success(`Added: ${food.name}`);
  };

  // Staple handlers
  const handleLogStaple = useCallback(async (staple: FoodStaple) => {
    // Optimistic: add entry to local state immediately
    const optimisticEntry = {
      id: `optimistic-${Date.now()}`,
      name: staple.name,
      calories: staple.calories,
      protein: staple.protein,
      carbs: staple.carbs,
      fat: staple.fat,
      servingSize: 1,
      servingUnit: 'serving',
      meal: staple.mealSlot,
      date: formatDateForAPI(selectedDate),
      source: 'STAPLE',
      stapleId: staple.id,
      createdAt: new Date().toISOString(),
    } as FoodLogEntry;

    setEntries(prev => ({
      ...prev,
      [staple.mealSlot]: [...prev[staple.mealSlot], optimisticEntry],
    }));

    // Fire POST and get real entry ID
    const entryId = await logStaple(staple, selectedDate);

    if (!entryId) {
      // Roll back optimistic entry
      setEntries(prev => ({
        ...prev,
        [staple.mealSlot]: prev[staple.mealSlot].filter(e => e.id !== optimisticEntry.id),
      }));
      return;
    }

    // Refresh to get real entry (filteredStaplesBySlot hides logged staples from carousel)
    await Promise.all([fetchEntries(), fetchSummary()]);

    // Show undo toast
    if (entryId) {
      toast(`Logged: ${staple.name}`, {
        action: {
          label: 'Undo',
          onClick: async () => {
            await undoLogStaple(entryId, staple.mealSlot);
            // Remove entry and refresh
            setEntries(prev => ({
              ...prev,
              [staple.mealSlot]: prev[staple.mealSlot].filter(e => e.id !== entryId),
            }));
            await Promise.all([fetchEntries(), fetchSummary()]);
          },
        },
        duration: 5000,
      });
    }
  }, [selectedDate, logStaple, undoLogStaple, fetchEntries, fetchSummary]);

  const handlePinAsStaple = useCallback(async (item: FoodLogItemData, meal: string) => {
    const mealSlot = meal.toUpperCase() as MealType;
    await createStaple({
      mealSlot,
      name: item.name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs ?? 0,
      fat: item.fat ?? 0,
    });
    // Auto-dismiss carousel — item is already logged, no need to show "log this" prompt
    dismissSlot(mealSlot);
  }, [createStaple, dismissSlot]);

  const handleUnpinStaple = useCallback(async (item: FoodLogItemData, meal: string) => {
    const mealSlot = meal.toUpperCase() as MealType;
    try {
      const res = await fetch('/api/food-staples');
      if (!res.ok) {
        toast.error('Could not unpin staple. Please try again.');
        return;
      }
      const data = await res.json();
      const allStaples: Array<{ id: string; name: string; mealSlot: string }> = data.staples;
      const match = allStaples.find(
        s => s.mealSlot === mealSlot && s.name.toLowerCase() === item.name.toLowerCase()
      );
      if (match) {
        await deleteStaple(match.id);
        toast('Unpinned staple');
      } else {
        toast.error('Staple not found. It may have been removed already.');
      }
    } catch (err) {
      console.error('Error unpinning staple:', err);
      toast.error('Failed to unpin staple');
    }
  }, [deleteStaple]);

  const handleDismissSlot = useCallback((mealSlot: string) => {
    dismissSlot(mealSlot as MealType);
  }, [dismissSlot]);

  const handleReorderStaples = useCallback(async (stapleIds: string[]) => {
    if (!managingSlot) return;
    try {
      const res = await fetch('/api/food-staples/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealSlot: managingSlot, stapleIds }),
      });
      if (!res.ok) {
        toast.error('Failed to reorder staples');
      }
      await fetchStaples();
    } catch (err) {
      console.error('Failed to reorder staples:', err);
      toast.error('Failed to reorder staples');
    }
  }, [managingSlot, fetchStaples]);

  const isTodaySelected = selectedDate.toDateString() === new Date().toDateString();

  // Build macro totals and targets
  const macroTotals: MacroTotals = {
    calories: Math.round(summary?.totals.totalCalories ?? 0),
    protein: Math.round(summary?.totals.totalProtein ?? 0),
    carbs: Math.round(summary?.totals.totalCarbs ?? 0),
    fat: Math.round(summary?.totals.totalFat ?? 0),
  };

  const macroTargets: MacroTargets = {
    calories: summary?.targets?.dailyCalories ?? 2000,
    protein: summary?.targets?.proteinGrams ?? 150,
    carbs: summary?.targets?.carbGrams ?? 250,
    fat: summary?.targets?.fatGrams ?? 65,
  };

  // Build weekly data - map API response to WeeklyDayData interface
  const weekData: WeeklyDayData[] = (summary?.weeklyCompliance ?? []).map((day) => {
    // Parse date as local time by adding time component (avoids UTC midnight → previous day in local)
    const dayDate = new Date(day.date + 'T00:00:00');
    const dayOfWeek = dayDate.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const isCurrentDay = dayDate.toDateString() === todayDate.toDateString();

    return {
      day: dayOfWeek,
      date: dayDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      fullDate: day.date, // YYYY-MM-DD from API
      calories: day.calories,
      target: macroTargets.calories,
      protein: day.protein,
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

  // Filter out staples already logged today (auto-logged or manually)
  const filteredStaplesBySlot = useMemo(() => {
    const loggedIds = new Set<string>();
    for (const meal of Object.values(entries)) {
      for (const entry of meal) {
        if (entry.stapleId) loggedIds.add(entry.stapleId);
      }
    }

    const result = {} as Record<MealType, FoodStaple[]>;
    for (const [slot, staples] of Object.entries(staplesBySlot)) {
      result[slot as MealType] = staples.filter(s => !loggedIds.has(s.id));
    }
    return result;
  }, [entries, staplesBySlot]);

  // Build quick foods for pills (recipes first, then regular quick foods)
  const recipeItems: QuickFoodItem[] = topRecipes.map((r) => ({
    id: `recipe-${r.id}`,
    name: r.name,
    calories: r.calories,
    protein: r.protein,
    carbs: r.carbs,
    fat: r.fat,
    emoji: r.emoji ?? undefined,
    isRecipe: true,
    recipeId: r.id,
  }));

  const regularQuickFoods: QuickFoodItem[] = quickFoods.map((qf) => ({
    id: qf.id,
    name: qf.name,
    calories: qf.calories,
    protein: qf.protein,
    carbs: qf.carbs,
    fat: qf.fat,
    emoji: qf.emoji ?? undefined,
  }));

  // Recipes appear first (visually distinct), then regular quick foods
  const quickFoodItems: QuickFoodItem[] = [...recipeItems, ...regularQuickFoods];

  // Build merged quick items for the new MergedQuickAdd component
  const mergedQuickItems: MergedQuickItem[] = useMemo(() => {
    const stapleItems: MergedQuickItem[] = Object.values(filteredStaplesBySlot)
      .flat()
      .map((s) => ({
        id: `staple-${s.id}`,
        name: s.name,
        calories: s.calories,
        protein: s.protein,
        emoji: s.emoji ?? undefined,
        tag: 'staple' as const,
      }));

    const recipeQuickItems: MergedQuickItem[] = topRecipes.map((r) => ({
      id: `recipe-${r.id}`,
      name: r.name,
      calories: r.calories,
      protein: r.protein,
      emoji: r.emoji ?? undefined,
      tag: 'recipe' as const,
      isRecipe: true,
      recipeId: r.id,
    }));

    const recentItems: MergedQuickItem[] = quickFoods.map((qf) => ({
      id: qf.id,
      name: qf.name,
      calories: qf.calories,
      protein: qf.protein,
      emoji: qf.emoji ?? undefined,
      tag: 'recent' as const,
    }));

    const seenNames = new Set<string>();
    return [...stapleItems, ...recipeQuickItems, ...recentItems].filter((item) => {
      const key = item.name.toLowerCase();
      if (seenNames.has(key)) return false;
      seenNames.add(key);
      return true;
    });
  }, [filteredStaplesBySlot, topRecipes, quickFoods]);

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
          data-testid="prev-day"
          className="p-2 hover:bg-white/10 lg:hover:bg-[#F1F5F9] rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 lg:text-[#64748B]" />
        </button>
        <div className="text-center flex-1">
          <h1 className="text-lg font-bold lg:text-[#0F172A]">
            {isToday(selectedDate) ? 'Today' : formatDateForDisplay(selectedDate)}
          </h1>
          {!isToday(selectedDate) && (
            <button
              type="button"
              onClick={goToToday}
              className="text-sm text-white/90 hover:text-white lg:text-[#FF6B6B] lg:hover:text-[#EF5350] underline mt-0.5 transition-colors"
            >
              Jump to Today
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Date menu - mobile variant */}
          <div className="lg:hidden">
            <DateMenu
              selectedDate={selectedDate}
              isToday={isToday(selectedDate)}
              variant="mobile"
              onCopyFromYesterday={handleDateMenuCopyFromYesterday}
              onPickDate={handlePickDate}
              onClearDay={handleClearDay}
            />
          </div>
          {/* Date menu - desktop variant */}
          <div className="hidden lg:block">
            <DateMenu
              selectedDate={selectedDate}
              isToday={isToday(selectedDate)}
              variant="desktop"
              onCopyFromYesterday={handleDateMenuCopyFromYesterday}
              onPickDate={handlePickDate}
              onClearDay={handleClearDay}
            />
          </div>
          <button
            type="button"
            onClick={goToNextDay}
            data-testid="next-day"
            className="p-2 hover:bg-white/10 lg:hover:bg-[#F1F5F9] rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 lg:text-[#64748B]" />
          </button>
        </div>
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

  // Targets banner - shows when using default targets
  const targetsBanner = summary?.isDefault ? (
    <div className="max-w-6xl mx-auto px-4">
      <div className="mt-4 p-3 bg-[#FFE5E5] border border-[#FF6B6B]/20 rounded-xl flex items-center gap-3">
        <div className="w-8 h-8 bg-[#FF6B6B] rounded-full flex items-center justify-center flex-shrink-0">
          <Target className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#0F172A]">Set your nutrition targets</p>
          <p className="text-xs text-[#64748B]">Personalize your calorie and macro goals</p>
        </div>
        <button
          type="button"
          onClick={() => setShowTargetsModal(true)}
          className="px-3 py-1.5 bg-[#FF6B6B] text-white text-sm font-medium rounded-lg hover:bg-[#EF5350] transition-colors flex-shrink-0"
        >
          Set Goals
        </button>
      </div>
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
    suggestion = `${Math.round(remainingCalories)} cal remaining`;
  }


  return (
    <>
      {/* Targets banner - above both layouts */}
      {targetsBanner}

      {/* Mobile Layout */}
      <div className="lg:hidden" data-testid="mobile-layout">
        <MobileLayout
          customHeader={customHeader}
          macroTotals={macroTotals}
          macroTargets={macroTargets}
          onAISubmit={parseText}
          isAILoading={isAIParsing}
          quickFoods={quickFoodItems}
          onQuickAdd={handleQuickAdd}
          onQuickRecipeLog={handleQuickRecipeLog}
          weekData={weekData}
          onDayClick={handleDayClick}
          meals={mealsData}
          onAddToMeal={handleAddToMeal}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
          enableInlineSearch={true}
          onInlineFoodAdd={handleInlineFoodAdd}
          showQuickAdd={showQuickAdd}
          setShowQuickAdd={setShowQuickAdd}
          recipes={recipes}
          onRecipeAdd={handleRecipeAdd}
          onCreateRecipe={handleCreateRecipe}
          enableRecipeSidebar={true}
          onSidebarRecipeAdd={handleSidebarRecipeAdd}
          onInlineRecipeAdd={handleInlineRecipeAdd}
          userId={userId}
          onUSDAFoodAdd={handleUSDAFoodAdd}
          selectedDate={selectedDate}
          onCopyFromYesterday={handleCopyFromYesterday}
          onOpenCopyMealModal={handleOpenCopyMealModal}
          onSaveAsRecipe={handleSaveAsRecipe}
          recipeSidebarRefreshTrigger={recipeSidebarRefreshTrigger}
          suggestion={suggestion}
          onSuggestionClick={handleSuggestionClick}
          staples={filteredStaplesBySlot}
          dailyTargets={macroTargets}
          dismissedSlots={dismissedSlots}
          isToday={isTodaySelected}
          onLogStaple={handleLogStaple}
          onDismissSlot={handleDismissSlot}
          onDeleteStaple={deleteStaple}
          onManageStaples={(slot: string) => setManagingSlot(slot as MealType)}
          onPinAsStaple={handlePinAsStaple}
          onUnpinStaple={handleUnpinStaple}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          mergedQuickItems={mergedQuickItems}
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
      <div className="hidden lg:block" data-testid="desktop-layout">
        <DesktopLayout
          customHeader={customHeader}
          macroTotals={macroTotals}
          macroTargets={macroTargets}
          onAISubmit={parseText}
          isAILoading={isAIParsing}
          quickFoods={quickFoodItems}
          onQuickAdd={handleQuickAdd}
          onQuickRecipeLog={handleQuickRecipeLog}
          weekData={weekData}
          onDayClick={handleDayClick}
          meals={mealsData}
          onAddToMeal={handleAddToMeal}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
          enableInlineSearch={true}
          onInlineFoodAdd={handleInlineFoodAdd}
          recipes={recipes}
          onRecipeAdd={handleRecipeAdd}
          onCreateRecipe={handleCreateRecipe}
          enableRecipeSidebar={true}
          onSidebarRecipeAdd={handleSidebarRecipeAdd}
          onInlineRecipeAdd={handleInlineRecipeAdd}
          userId={userId}
          onUSDAFoodAdd={handleUSDAFoodAdd}
          selectedDate={selectedDate}
          onCopyFromYesterday={handleCopyFromYesterday}
          onOpenCopyMealModal={handleOpenCopyMealModal}
          onSaveAsRecipe={handleSaveAsRecipe}
          recipeSidebarRefreshTrigger={recipeSidebarRefreshTrigger}
          suggestion={suggestion}
          onSuggestionClick={handleSuggestionClick}
          rightContentExtra={errorBanner}
          staples={filteredStaplesBySlot}
          dailyTargets={macroTargets}
          dismissedSlots={dismissedSlots}
          isToday={isTodaySelected}
          onLogStaple={handleLogStaple}
          onDismissSlot={handleDismissSlot}
          onDeleteStaple={deleteStaple}
          onManageStaples={(slot: string) => setManagingSlot(slot as MealType)}
          onPinAsStaple={handlePinAsStaple}
          onUnpinStaple={handleUnpinStaple}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          mergedQuickItems={mergedQuickItems}
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

      {/* Food Edit Modal */}
      <AnimatePresence>
        {editingItem && (
          <FoodEditModal
            food={editingItem}
            onSave={handleSaveEdit}
            onCancel={() => setEditingItem(null)}
            isSaving={isSubmitting}
          />
        )}
      </AnimatePresence>

      {/* Create Recipe Modal */}
      <CreateRecipeModal
        isOpen={showCreateRecipeModal}
        onClose={() => setShowCreateRecipeModal(false)}
        onSave={() => {
          // Trigger sidebar refresh after recipe is saved
          setRecipeSidebarRefreshTrigger(prev => prev + 1);
        }}
        userId={userId}
      />

      {/* Copy Day Modal */}
      {copyFromDate && (
        <CopyDayModal
          isOpen={showCopyDayModal}
          onClose={() => {
            setShowCopyDayModal(false);
            setCopyFromDate(null);
          }}
          sourceDate={copyFromDate}
          targetDate={selectedDate}
          onCopySuccess={async () => {
            await Promise.all([fetchEntries(), fetchSummary()]);
            toast.success('Meals copied successfully');
          }}
        />
      )}

      {/* Date Picker Modal (for "Pick a date..." option) */}
      <DatePickerModal
        isOpen={showDatePickerModal}
        onClose={() => setShowDatePickerModal(false)}
        onSelectDate={handleDatePickerSelect}
        targetDate={selectedDate}
        title="Pick a date to copy from"
      />

      {/* Copy Meal Modal (for copying a specific meal from previous days) */}
      <CopyMealModal
        isOpen={showCopyMealModal}
        onClose={() => setShowCopyMealModal(false)}
        mealType={copyMealType}
        targetDate={selectedDate}
        onCopySuccess={async () => {
          await Promise.all([fetchEntries(), fetchSummary()]);
        }}
      />

      {/* Staple Manage Modal */}
      <AnimatePresence>
        {managingSlot && (
          <StapleManageModal
            mealSlot={managingSlot}
            staples={staplesBySlot[managingSlot] || []}
            onClose={() => {
              setManagingSlot(null);
              fetchStaples();
            }}
            onDelete={deleteStaple}
            onReorder={handleReorderStaples}
            onToggleAutoLog={toggleAutoLog}
          />
        )}
      </AnimatePresence>

      {/* Nutrition Targets Modal */}
      <NutritionTargetsModal
        isOpen={showTargetsModal}
        onClose={() => setShowTargetsModal(false)}
        onSaved={() => {
          // Refresh summary to get updated targets
          fetchSummary();
        }}
        initialValues={summary?.targets ? {
          dailyCalories: summary.targets.dailyCalories,
          proteinGrams: summary.targets.proteinGrams,
          carbGrams: summary.targets.carbGrams,
          fatGrams: summary.targets.fatGrams,
        } : undefined}
      />

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
