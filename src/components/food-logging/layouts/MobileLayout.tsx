'use client';

import React, { ReactNode } from 'react';
import { Settings, Target } from 'lucide-react';
import { MealType as PrismaMealType } from '@prisma/client';
import {
  QuickInput,
  WeeklyStrip,
  type MacroTotals,
  type MacroTargets,
  type QuickFoodItem,
  type WeeklyDayData,
  type FoodLogItemData,
  type USDAFoodResult,
  type MealSectionFoodResult,
  type Recipe,
  type RecipeWithIngredients,
} from '../index';
import { DualRing } from '../DualRing';
import { SuggestionBanner } from '../SuggestionBanner';
import { MergedQuickAdd, type MergedQuickItem } from '../MergedQuickAdd';
import { PantryTab } from '../PantryTab';
import type { FoodStaple } from '@/hooks/useStaples';
import { MealSectionList, TabBar, type RecipeItem, type MealData } from './shared';

export type { RecipeItem, MealData };

export interface MobileLayoutProps {
  // Header
  title?: string;
  subtitle?: string;
  headerBadge?: string;

  // Macro progress
  macroTotals: MacroTotals;
  macroTargets: MacroTargets;

  // Quick input
  onAISubmit: (text: string) => void;
  onInputFocus?: () => void;
  aiInputPlaceholder?: string;
  isAILoading?: boolean;

  // Quick pills
  quickFoods: QuickFoodItem[];
  onQuickAdd: (item: QuickFoodItem) => void;
  /** Callback for logging recipes from QuickPills (with meal selection) */
  onQuickRecipeLog?: (item: QuickFoodItem, meal: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK') => Promise<void>;

  // Weekly strip
  weekData: WeeklyDayData[];
  weeklyExpanded?: boolean;
  onWeeklyToggle?: () => void;
  weeklySummaryMessage?: string;
  onDayClick?: (dateStr: string) => void;

  // Meals
  meals: MealData[];
  onAddToMeal: (meal: string) => void;
  onEditItem?: (item: FoodLogItemData) => void;
  onDeleteItem?: (item: FoodLogItemData) => void;
  /** Enable inline search in meal sections (instead of modal) */
  enableInlineSearch?: boolean;
  /** Callback when food is added via inline meal section search */
  onInlineFoodAdd?: (food: MealSectionFoodResult) => void;

  // Bottom sheet / quick add
  showQuickAdd: boolean;
  setShowQuickAdd: (show: boolean) => void;

  // Recipes (for bottom sheet)
  recipes?: RecipeItem[];
  onRecipeAdd?: (item: RecipeItem) => void;
  onCreateRecipe?: () => void;
  /** Enable self-fetching recipe sidebar in bottom sheet */
  enableRecipeSidebar?: boolean;
  /** Callback when a recipe is added via the self-fetching sidebar */
  onSidebarRecipeAdd?: (recipe: Recipe) => void;
  /** Callback when a recipe is added via the inline meal section search (with meal context) */
  onInlineRecipeAdd?: (recipe: RecipeWithIngredients, multiplier: number, meal: string) => void;

  // USDA Search
  userId?: string;
  onUSDAFoodAdd?: (food: USDAFoodResult) => void;

  // Copy from yesterday
  selectedDate?: Date;
  onCopyFromYesterday?: () => void;

  // Copy meal modal
  /** Callback to open copy meal modal for a specific meal type */
  onOpenCopyMealModal?: (mealType: PrismaMealType) => void;

  // Save meal as recipe
  onSaveAsRecipe?: (recipe: {
    id: string;
    name: string;
    emoji: string | null;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => void;

  // Suggestion
  suggestion?: string;
  onSuggestionClick?: () => void;

  // Custom content slots
  customHeader?: ReactNode;
  customFooter?: ReactNode;

  // Recipe sidebar refresh trigger
  recipeSidebarRefreshTrigger?: number;

  // Staples
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

  // Tab support
  activeTab?: 'log' | 'pantry';
  onTabChange?: (tab: 'log' | 'pantry') => void;
  mergedQuickItems?: MergedQuickItem[];

  // Targets
  isDefaultTargets?: boolean;
  onEditTargets?: () => void;
}

export function MobileLayout({
  macroTotals,
  macroTargets,
  onAISubmit,
  aiInputPlaceholder,
  isAILoading,
  quickFoods,
  onQuickAdd,
  weekData,
  weeklyExpanded,
  onWeeklyToggle,
  weeklySummaryMessage,
  onDayClick,
  meals,
  onAddToMeal,
  onEditItem,
  onDeleteItem,
  enableInlineSearch = true,
  onInlineFoodAdd,
  showQuickAdd,
  setShowQuickAdd,
  onCreateRecipe,
  onSidebarRecipeAdd,
  onInlineRecipeAdd,
  userId,
  selectedDate,
  onCopyFromYesterday,
  onOpenCopyMealModal,
  onSaveAsRecipe,
  suggestion,
  onSuggestionClick,
  customHeader,
  customFooter,
  recipeSidebarRefreshTrigger,
  staples,
  dailyTargets,
  dismissedSlots,
  isToday: isTodayProp,
  onLogStaple,
  onDismissSlot,
  onDeleteStaple,
  onManageStaples,
  onPinAsStaple,
  onUnpinStaple,
  activeTab = 'log',
  onTabChange,
  mergedQuickItems,
  isDefaultTargets,
  onEditTargets,
}: MobileLayoutProps) {
  const remainingCalories = Math.round(Math.max(0, macroTargets.calories - macroTotals.calories));
  const remainingProtein = Math.round(Math.max(0, macroTargets.protein - macroTotals.protein));

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Compact Header */}
      {customHeader}

      {/* Macro summary row */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-2 flex items-center gap-3">
        {isDefaultTargets ? (
          <button
            type="button"
            onClick={onEditTargets}
            className="flex items-center gap-3 w-full py-1"
          >
            <div className="w-8 h-8 bg-[#FFE5E5] rounded-full flex items-center justify-center flex-shrink-0">
              <Target className="w-4 h-4 text-[#FF6B6B]" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-bold text-[#0F172A]">Set your goals</div>
              <div className="text-xs text-[#94A3B8]">Personalize calories &amp; macros</div>
            </div>
            <span className="text-xs font-medium text-[#FF6B6B]">Set up →</span>
          </button>
        ) : (
          <>
            <DualRing totals={macroTotals} targets={macroTargets} size="sm" />
            <div className="flex-1">
              <div className="text-sm font-bold text-[#0F172A]">
                {remainingCalories} cal left
              </div>
              <div className="text-xs text-[#94A3B8]">
                {remainingProtein}g P to go
              </div>
            </div>
            {onEditTargets && (
              <button
                type="button"
                onClick={onEditTargets}
                className="p-1.5 text-[#94A3B8] hover:text-[#64748B] hover:bg-[#F1F5F9] rounded-lg transition-colors"
                title="Edit nutrition goals"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Tab Bar */}
      <TabBar
        activeTab={activeTab}
        onTabChange={(tab) => onTabChange?.(tab)}
        className="[&>div]:px-4"
      />

      {/* Log Tab Content */}
      {activeTab === 'log' && (
        <>
          {/* Weekly Strip */}
          <div className="px-4 py-3 bg-white border-b border-[#E2E8F0]">
            <WeeklyStrip
              weekData={weekData}
              expanded={weeklyExpanded}
              onToggle={onWeeklyToggle}
              summaryMessage={weeklySummaryMessage}
              onDayClick={onDayClick}
            />
          </div>

          {/* Suggestion Banner */}
          <div className="px-4 py-3">
            <SuggestionBanner
              remainingProtein={remainingProtein}
              remainingCalories={remainingCalories}
              suggestion={suggestion}
              onSuggestMeal={onSuggestionClick}
            />
          </div>

          {/* Meal Sections */}
          <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-4">
            <MealSectionList
              meals={meals}
              onAddToMeal={onAddToMeal}
              onEditItem={onEditItem}
              onDeleteItem={onDeleteItem}
              enableInlineSearch={enableInlineSearch}
              onInlineFoodAdd={onInlineFoodAdd}
              onInlineRecipeAdd={onInlineRecipeAdd}
              onCreateRecipe={onCreateRecipe}
              userId={userId}
              selectedDate={selectedDate}
              onCopyFromYesterday={onCopyFromYesterday}
              onOpenCopyMealModal={onOpenCopyMealModal}
              onSaveAsRecipe={onSaveAsRecipe}
              staples={staples}
              dailyTargets={dailyTargets}
              dismissedSlots={dismissedSlots}
              isToday={isTodayProp}
              onLogStaple={onLogStaple}
              onDismissSlot={onDismissSlot}
              onDeleteStaple={onDeleteStaple}
              onManageStaples={onManageStaples}
              onPinAsStaple={onPinAsStaple}
              onUnpinStaple={onUnpinStaple}
            />
          </div>

          {/* Sticky Bottom Bar */}
          <div className="sticky bottom-0 bg-white border-t border-[#E2E8F0] px-4 py-2 flex items-center gap-3 z-30">
            {/* Horizontal scroll of recent quick foods */}
            <div className="flex-1 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {quickFoods.slice(0, 8).map((food) => (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => onQuickAdd(food)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full text-sm"
                >
                  {food.emoji && <span>{food.emoji}</span>}
                  <span className="text-[#0F172A] whitespace-nowrap">{food.name}</span>
                </button>
              ))}
            </div>
            {/* AI FAB */}
            <button
              type="button"
              onClick={() => setShowQuickAdd(true)}
              className="w-12 h-12 bg-[#FF6B6B] text-white rounded-full shadow-lg flex items-center justify-center flex-shrink-0 hover:bg-[#EF5350] transition-colors"
            >
              <span className="text-lg">&#10024;</span>
            </button>
          </div>

          {/* Quick Add Overlay */}
          {showQuickAdd && (
            <div className="fixed inset-0 z-40">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowQuickAdd(false)} />
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[60vh] overflow-auto p-4 z-50">
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-1 bg-[#E2E8F0] rounded-full" />
                </div>
                <QuickInput
                  onSubmit={(text) => { onAISubmit(text); setShowQuickAdd(false); }}
                  placeholder={aiInputPlaceholder ?? 'Type what you ate...'}
                  isLoading={isAILoading}
                />
                <div className="mt-4">
                  <MergedQuickAdd
                    items={mergedQuickItems ?? []}
                    onAdd={(item) => { onQuickAdd({ ...item }); setShowQuickAdd(false); }}
                    onViewPantry={() => { setShowQuickAdd(false); onTabChange?.('pantry'); }}
                    maxItems={6}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Pantry Tab Content */}
      {activeTab === 'pantry' && (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <PantryTab
            quickFoods={quickFoods}
            onQuickAdd={onQuickAdd}
            onCreateRecipe={onCreateRecipe}
            onSidebarRecipeAdd={onSidebarRecipeAdd}
            recipeSidebarRefreshTrigger={recipeSidebarRefreshTrigger}
            staples={staples}
            onManageStaples={onManageStaples}
            onLogStaple={onLogStaple}
          />
        </div>
      )}

      {/* Custom Footer (e.g., error banner) */}
      {customFooter}
    </div>
  );
}
