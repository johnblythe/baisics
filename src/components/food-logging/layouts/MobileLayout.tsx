'use client';

import React, { ReactNode, useState } from 'react';
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

  // Carb cycling
  hasRestDayTargets?: boolean;
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
  hasRestDayTargets,
}: MobileLayoutProps) {
  const remainingCalories = Math.round(Math.max(0, macroTargets.calories - macroTotals.calories));
  const remainingProtein = Math.round(Math.max(0, macroTargets.protein - macroTotals.protein));
  const remainingCarbs = Math.round(Math.max(0, macroTargets.carbs - macroTotals.carbs));
  const remainingFat = Math.round(Math.max(0, macroTargets.fat - macroTotals.fat));
  const [macroCountUp, setMacroCountUp] = useState(false);

  return (
    <div className="min-h-dvh bg-[#F8FAFC] flex flex-col">
      {/* Sticky header group: date header + macro summary */}
      <div className="sticky top-16 z-20">
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
          <div
            role="button"
            tabIndex={0}
            onClick={() => setMacroCountUp(prev => !prev)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setMacroCountUp(prev => !prev); }}
            className="flex items-start gap-3 w-full cursor-pointer select-none"
          >
            <DualRing totals={macroTotals} targets={macroTargets} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#0F172A] tabular-nums truncate">
                  {macroCountUp
                    ? `${Math.round(macroTotals.calories)} / ${Math.round(macroTargets.calories)} cal`
                    : `${remainingCalories} cal left`}
                </span>
                {onEditTargets && (
                  <button
                    type="button"
                    aria-label="Edit nutrition goals"
                    onClick={(e) => { e.stopPropagation(); onEditTargets(); }}
                    className="p-1 text-[#94A3B8] hover:text-[#64748B] rounded-lg"
                  >
                    <Settings className="size-4" />
                  </button>
                )}
              </div>
              <div className="mt-1 space-y-1">
                {[
                  { label: 'P', current: macroTotals.protein, target: macroTargets.protein, remaining: remainingProtein, color: 'bg-green-500' },
                  { label: 'C', current: macroTotals.carbs, target: macroTargets.carbs, remaining: remainingCarbs, color: 'bg-amber-500' },
                  { label: 'F', current: macroTotals.fat, target: macroTargets.fat, remaining: remainingFat, color: 'bg-blue-500' },
                ].map((m) => {
                  const pct = m.target > 0 ? Math.min((m.current / m.target) * 100, 100) : 0;
                  return (
                    <div key={m.label} className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#64748B] w-3">{m.label}</span>
                      <div className="flex-1 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${m.color} rounded-full`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-[#0F172A] tabular-nums text-right w-16">
                        {macroCountUp
                          ? `${Math.round(m.current)}/${Math.round(m.target)}g`
                          : `${m.remaining}g`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

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
              hasRestDayTargets={hasRestDayTargets}
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
          <div className="flex-1 px-4 pb-24 space-y-4">
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
        <div className="flex-1 px-4 py-4">
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
