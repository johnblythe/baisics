'use client';

import React from 'react';
import { MealType as PrismaMealType } from '@prisma/client';
import {
  MealSection,
  type FoodLogItemData,
  type MealSectionFoodResult,
  type RecipeWithIngredients,
} from '../index';
import type { FoodStaple } from '@/hooks/useStaples';

// ── Shared types ──────────────────────────────────────────────────────

export interface RecipeItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  emoji?: string;
}

export interface MealData {
  meal: string;
  items: FoodLogItemData[];
}

// ── Shared MealSection rendering props ────────────────────────────────

export interface MealSectionListProps {
  meals: MealData[];
  onAddToMeal: (meal: string) => void;
  onEditItem?: (item: FoodLogItemData) => void;
  onDeleteItem?: (item: FoodLogItemData) => void;
  enableInlineSearch?: boolean;
  onInlineFoodAdd?: (food: MealSectionFoodResult) => void;
  onInlineRecipeAdd?: (recipe: RecipeWithIngredients, multiplier: number, meal: string) => void;
  onCreateRecipe?: () => void;
  userId?: string;
  selectedDate?: Date;
  onCopyFromYesterday?: () => void;
  onOpenCopyMealModal?: (mealType: PrismaMealType) => void;
  onSaveAsRecipe?: (recipe: {
    id: string;
    name: string;
    emoji: string | null;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => void;
  staples?: Record<string, FoodStaple[]>;
  dailyTargets?: { calories: number; protein: number; carbs: number; fat: number };
  dismissedSlots?: Set<string>;
  isToday?: boolean;
  onLogStaple?: (staple: FoodStaple) => void;
  onDismissSlot?: (mealSlot: string) => void;
  onDeleteStaple?: (stapleId: string) => void;
  onManageStaples?: (mealSlot: string) => void;
  onPinAsStaple?: (item: FoodLogItemData, meal: string) => void;
  onUnpinStaple?: (item: FoodLogItemData, meal: string) => void;
}

/**
 * Renders a list of MealSection cards. Shared between Desktop and Mobile layouts
 * to avoid duplicating the ~25-prop MealSection wiring.
 */
export function MealSectionList({
  meals,
  onAddToMeal,
  onEditItem,
  onDeleteItem,
  enableInlineSearch = true,
  onInlineFoodAdd,
  onInlineRecipeAdd,
  onCreateRecipe,
  userId,
  selectedDate,
  onCopyFromYesterday,
  onOpenCopyMealModal,
  onSaveAsRecipe,
  staples,
  dailyTargets,
  dismissedSlots,
  isToday,
  onLogStaple,
  onDismissSlot,
  onDeleteStaple,
  onManageStaples,
  onPinAsStaple,
  onUnpinStaple,
}: MealSectionListProps): React.ReactNode {
  return (
    <>
      {meals.map((mealData) => (
        <div key={mealData.meal} className="bg-white rounded-xl border border-[#E2E8F0] p-4">
          <MealSection
            meal={mealData.meal}
            items={mealData.items}
            onAdd={() => onAddToMeal(mealData.meal)}
            onEditItem={onEditItem}
            onDeleteItem={onDeleteItem}
            showItemActions={true}
            enableInlineSearch={enableInlineSearch && !!onInlineFoodAdd}
            onFoodAdd={onInlineFoodAdd}
            userId={userId}
            onRecipeAdd={onInlineRecipeAdd ? (recipe, multiplier) => onInlineRecipeAdd(recipe, multiplier, mealData.meal) : undefined}
            onCreateRecipe={onCreateRecipe}
            selectedDate={selectedDate}
            onCopyFromYesterday={onCopyFromYesterday}
            onOpenCopyMealModal={onOpenCopyMealModal}
            onSaveAsRecipe={onSaveAsRecipe}
            staples={staples?.[mealData.meal.toUpperCase()]}
            dailyTargets={dailyTargets}
            isDismissed={dismissedSlots?.has(mealData.meal.toUpperCase())}
            isToday={isToday}
            onLogStaple={onLogStaple}
            onDismissStaples={onDismissSlot ? () => onDismissSlot(mealData.meal.toUpperCase()) : undefined}
            onDeleteStaple={onDeleteStaple}
            onManageStaples={onManageStaples ? () => onManageStaples(mealData.meal.toUpperCase()) : undefined}
            onPinAsStaple={onPinAsStaple ? (item) => onPinAsStaple(item, mealData.meal) : undefined}
            onUnpinStaple={onUnpinStaple ? (item) => onUnpinStaple(item, mealData.meal) : undefined}
          />
        </div>
      ))}
    </>
  );
}

// ── Shared Tab Bar ────────────────────────────────────────────────────

interface TabBarProps {
  activeTab: 'log' | 'pantry';
  onTabChange: (tab: 'log' | 'pantry') => void;
  /** Optional wrapper className for responsive padding */
  className?: string;
}

const TABS = [
  { key: 'log' as const, label: 'Log' },
  { key: 'pantry' as const, label: 'Pantry' },
] as const;

export function TabBar({ activeTab, onTabChange, className }: TabBarProps): React.ReactNode {
  return (
    <div className={`bg-white border-b border-[#E2E8F0] ${className ?? ''}`}>
      <div className="flex gap-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => onTabChange(t.key)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.key
                ? 'border-[#FF6B6B] text-[#0F172A]'
                : 'border-transparent text-[#94A3B8] hover:text-[#475569]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
