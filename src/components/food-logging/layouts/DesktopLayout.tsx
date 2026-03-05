'use client';

import React, { useState, ReactNode } from 'react';
import { MealType as PrismaMealType } from '@prisma/client';
import { Settings, Target } from 'lucide-react';
import { DualRing } from '../DualRing';
import { SuggestionBanner } from '../SuggestionBanner';
import { MergedQuickAdd, type MergedQuickItem } from '../MergedQuickAdd';
import { PantryTab } from '../PantryTab';
import {
  MacroProgressBar,
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
import type { FoodStaple } from '@/hooks/useStaples';
import { MealSectionList, TabBar, type RecipeItem, type MealData } from './shared';

export type { RecipeItem, MealData };

export interface DesktopLayoutProps {
  // Header
  title?: string;
  subtitle?: string;
  headerBadge?: string;

  // Macro progress
  macroTotals: MacroTotals;
  macroTargets: MacroTargets;

  // Quick input
  onAISubmit: (text: string) => void;
  aiInputPlaceholder?: string;
  isAILoading?: boolean;

  // Quick pills
  quickFoods: QuickFoodItem[];
  onQuickAdd: (item: QuickFoodItem) => void;
  /** Callback for logging recipes from QuickPills (with meal selection) */
  onQuickRecipeLog?: (item: QuickFoodItem, meal: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK') => Promise<void>;

  // Weekly strip
  weekData: WeeklyDayData[];
  defaultWeeklyExpanded?: boolean;
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

  // Recipes (legacy - for passing recipes from parent)
  recipes?: RecipeItem[];
  onRecipeAdd?: (item: RecipeItem) => void;
  onCreateRecipe?: () => void;
  /** Enable self-fetching recipe sidebar (shows My Recipes section) */
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
  leftSidebarExtra?: ReactNode;
  rightContentExtra?: ReactNode;

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

  // Tab system
  activeTab?: 'log' | 'pantry';
  onTabChange?: (tab: 'log' | 'pantry') => void;
  mergedQuickItems?: MergedQuickItem[];

  // Targets
  isDefaultTargets?: boolean;
  onEditTargets?: () => void;

  // Carb cycling
  hasRestDayTargets?: boolean;
}

export function DesktopLayout({
  title = 'Food Log',
  subtitle,
  headerBadge,
  macroTotals,
  macroTargets,
  onAISubmit,
  aiInputPlaceholder,
  isAILoading,
  quickFoods,
  onQuickAdd,
  onQuickRecipeLog,
  weekData,
  defaultWeeklyExpanded = true,
  weeklySummaryMessage,
  onDayClick,
  meals,
  onAddToMeal,
  onEditItem,
  onDeleteItem,
  enableInlineSearch = true,
  onInlineFoodAdd,
  recipes = [],
  onRecipeAdd,
  onCreateRecipe,
  enableRecipeSidebar = true,
  onSidebarRecipeAdd,
  onInlineRecipeAdd,
  userId,
  onUSDAFoodAdd,
  selectedDate,
  onCopyFromYesterday,
  onOpenCopyMealModal,
  onSaveAsRecipe,
  suggestion,
  onSuggestionClick,
  customHeader,
  leftSidebarExtra,
  rightContentExtra,
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
  activeTab: activeTabProp,
  onTabChange: onTabChangeProp,
  mergedQuickItems = [],
  isDefaultTargets,
  onEditTargets,
  hasRestDayTargets,
}: DesktopLayoutProps) {
  // Internal tab state as fallback when props not provided
  const [internalTab, setInternalTab] = useState<'log' | 'pantry'>('log');
  const activeTab = activeTabProp ?? internalTab;
  const onTabChange = onTabChangeProp ?? setInternalTab;

  const [weekExpanded, setWeekExpanded] = useState(defaultWeeklyExpanded);

  // Calculate remaining macros
  const remainingCalories = Math.round(Math.max(0, (macroTargets.calories ?? 0) - (macroTotals.calories ?? 0)));
  const remainingProtein = Math.round(Math.max(0, (macroTargets.protein ?? 0) - (macroTotals.protein ?? 0)));

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      {customHeader ?? (
        <div className="bg-white border-b border-[#E2E8F0]">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-[#0F172A]">{title}</h1>
                {subtitle && <p className="text-sm text-[#64748B]">{subtitle}</p>}
              </div>
              {headerBadge && (
                <span className="text-xs text-[#94A3B8] bg-[#F1F5F9] px-2 py-1 rounded">
                  {headerBadge}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Bar */}
      <TabBar
        activeTab={activeTab}
        onTabChange={onTabChange}
        className="[&>div]:max-w-6xl [&>div]:mx-auto [&>div]:px-6"
      />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {activeTab === 'log' ? (
          <div className="grid grid-cols-3 gap-6">
            {/* Main Column (2/3) */}
            <div className="col-span-2 space-y-4">
              {/* Weekly Overview */}
              <WeeklyStrip
                weekData={weekData}
                expanded={weekExpanded}
                onToggle={() => setWeekExpanded(!weekExpanded)}
                summaryMessage={weeklySummaryMessage}
                onDayClick={onDayClick}
                hasRestDayTargets={hasRestDayTargets}
              />

              {/* Suggestion Banner */}
              <SuggestionBanner
                remainingCalories={remainingCalories}
                remainingProtein={remainingProtein}
                suggestion={suggestion}
                onSuggestMeal={onSuggestionClick}
              />

              {/* Meals Log */}
              <div className="space-y-4">
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

              {/* Optional extra content */}
              {rightContentExtra}
            </div>

            {/* Sidebar (1/3, sticky) */}
            <div className="col-span-1">
              <div className="sticky top-6 space-y-4">
                {/* Card 1: DualRing + MacroProgressBar (or Set Goals CTA) */}
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
                  {isDefaultTargets ? (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-[#FFE5E5] rounded-full flex items-center justify-center mx-auto mb-3">
                        <Target className="w-6 h-6 text-[#FF6B6B]" />
                      </div>
                      <h3 className="text-sm font-bold text-[#0F172A] mb-1">Set your nutrition goals</h3>
                      <p className="text-xs text-[#94A3B8] mb-4">Personalize calories and macros to track your progress</p>
                      <button
                        type="button"
                        onClick={onEditTargets}
                        className="px-4 py-2 bg-[#FF6B6B] text-white text-sm font-semibold rounded-xl hover:bg-[#EF5350] transition-colors"
                      >
                        Set Goals
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4 mb-4">
                        <DualRing totals={macroTotals} targets={macroTargets} size="md" />
                        <div className="flex-1">
                          <div className="text-lg font-bold text-[#0F172A]">{remainingCalories}</div>
                          <div className="text-xs text-[#94A3B8]">cal remaining</div>
                          <div className="text-sm font-medium text-green-600 mt-0.5">{remainingProtein}g P to go</div>
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
                      </div>
                      <MacroProgressBar layout="vertical" totals={macroTotals} targets={macroTargets} />
                    </>
                  )}
                </div>

                {/* Card 2: MergedQuickAdd */}
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
                  <MergedQuickAdd
                    items={mergedQuickItems}
                    onAdd={(item) => onQuickAdd({ ...item })}
                    onRecipeLog={onQuickRecipeLog ? async (item, meal) => {
                      await onQuickRecipeLog({ ...item, isRecipe: true }, meal);
                    } : undefined}
                    onViewPantry={() => onTabChange('pantry')}
                    maxItems={6}
                  />
                </div>

                {/* Optional extra content */}
                {leftSidebarExtra}
              </div>
            </div>
          </div>
        ) : (
          /* Pantry Tab -- full width */
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
        )}
      </div>
    </div>
  );
}
