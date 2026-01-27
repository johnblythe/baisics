'use client';

import React, { useState, ReactNode } from 'react';
import { Search, TrendingUp, Clock, ChefHat, Plus, Database } from 'lucide-react';
import { MealType as PrismaMealType } from '@prisma/client';
import {
  MacroProgressBar,
  QuickInput,
  QuickPills,
  WeeklyStrip,
  MealSection,
  USDAFoodSearch,
  MyRecipesSidebar,
  type MacroTotals,
  type MacroTargets,
  type QuickFoodItem,
  type WeeklyDayData,
  type FoodLogItemData,
  type MealType,
  type USDAFoodResult,
  type MealSectionFoodResult,
  type Recipe,
  type RecipeWithIngredients,
} from '../index';

export interface RecipeItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  emoji?: string;
}

export interface MealData {
  meal: MealType | string;
  items: FoodLogItemData[];
}

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

  // Weekly strip
  weekData: WeeklyDayData[];
  defaultWeeklyExpanded?: boolean;
  weeklySummaryMessage?: string;

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

  // Suggestion
  suggestion?: string;
  suggestionDetail?: string;
  onSuggestionClick?: () => void;

  // Custom content slots
  customHeader?: ReactNode;
  leftSidebarExtra?: ReactNode;
  rightContentExtra?: ReactNode;
}

function RecipesPanel({
  recipes,
  onAdd,
  onCreateRecipe,
}: {
  recipes: RecipeItem[];
  onAdd: (item: RecipeItem) => void;
  onCreateRecipe?: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-[#0F172A] flex items-center gap-2">
          <ChefHat className="w-4 h-4 text-[#FF6B6B]" />
          My Recipes
        </h3>
      </div>
      {recipes.map((recipe) => (
        <button
          key={recipe.id}
          type="button"
          onClick={() => onAdd(recipe)}
          className="w-full flex items-center gap-3 p-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-xl transition-colors text-left"
        >
          {recipe.emoji && <span className="text-xl">{recipe.emoji}</span>}
          <div className="flex-1">
            <div className="text-sm font-medium text-[#0F172A]">{recipe.name}</div>
            <div className="text-xs text-[#94A3B8]">{recipe.calories} cal · {recipe.protein}g P</div>
          </div>
          <Plus className="w-4 h-4 text-[#94A3B8]" />
        </button>
      ))}
      {onCreateRecipe && (
        <button
          type="button"
          onClick={onCreateRecipe}
          className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-[#E2E8F0] hover:border-[#FF6B6B] rounded-xl text-sm text-[#94A3B8] hover:text-[#FF6B6B] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Recipe
        </button>
      )}
    </div>
  );
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
  weekData,
  defaultWeeklyExpanded = true,
  weeklySummaryMessage,
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
  suggestion,
  suggestionDetail,
  onSuggestionClick,
  customHeader,
  leftSidebarExtra,
  rightContentExtra,
}: DesktopLayoutProps) {
  const [weekExpanded, setWeekExpanded] = useState(defaultWeeklyExpanded);

  // Check if selected date is today
  const isSelectedDateToday = selectedDate
    ? selectedDate.toDateString() === new Date().toDateString()
    : true;

  // Format date for display
  const mealsTitle = isSelectedDateToday
    ? "Today's Meals"
    : selectedDate?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + "'s Meals";

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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Quick Add (sticky) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-4">
              {/* USDA Food Search - Primary Entry Point */}
              {onUSDAFoodAdd && (
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
                  <h3 className="font-medium text-[#0F172A] mb-3 flex items-center gap-2">
                    <Search className="w-4 h-4 text-[#FF6B6B]" />
                    Search Foods
                  </h3>
                  <USDAFoodSearch
                    userId={userId}
                    onConfirm={onUSDAFoodAdd}
                    placeholder="Search foods... (chicken, rice, banana)"
                  />
                </div>
              )}

              {/* AI Quick Input */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
                <h3 className="font-medium text-[#0F172A] mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#FF6B6B]" />
                  AI Quick Add
                </h3>
                <QuickInput
                  onSubmit={onAISubmit}
                  placeholder={aiInputPlaceholder}
                  isLoading={isAILoading}
                />
              </div>

              {/* Today's Progress */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
                <h3 className="font-medium text-[#0F172A] mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#FF6B6B]" />
                  Today&apos;s Progress
                </h3>
                <MacroProgressBar layout="vertical" totals={macroTotals} targets={macroTargets} />
              </div>

              {/* Quick Add */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
                <h3 className="font-medium text-[#0F172A] mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FF6B6B]" />
                  Quick Add
                </h3>
                <QuickPills foods={quickFoods} onAdd={onQuickAdd} layout="grid" maxItems={6} />
              </div>

              {/* My Recipes Sidebar - Self-fetching */}
              {enableRecipeSidebar && (
                <MyRecipesSidebar
                  onRecipeAdd={onSidebarRecipeAdd}
                  onCreateRecipe={onCreateRecipe}
                  maxItems={5}
                />
              )}

              {/* Legacy Recipes Panel (for passed-in recipes) */}
              {!enableRecipeSidebar && recipes.length > 0 && onRecipeAdd && (
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
                  <RecipesPanel
                    recipes={recipes}
                    onAdd={onRecipeAdd}
                    onCreateRecipe={onCreateRecipe}
                  />
                </div>
              )}

              {/* Optional extra content */}
              {leftSidebarExtra}
            </div>
          </div>

          {/* Right Column: Log + Weekly */}
          <div className="lg:col-span-2 space-y-4">
            {/* Weekly Overview */}
            <WeeklyStrip
              weekData={weekData}
              expanded={weekExpanded}
              onToggle={() => setWeekExpanded(!weekExpanded)}
              summaryMessage={weeklySummaryMessage}
            />

            {/* Meals Log */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
              <h3 className="font-medium text-[#0F172A] mb-4">{mealsTitle}</h3>
              <div className="space-y-4">
                {meals.map((mealData) => (
                  <MealSection
                    key={mealData.meal}
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
                  />
                ))}
              </div>
            </div>

            {/* Smart Suggestion */}
            {suggestion && (
              <div className="bg-gradient-to-r from-[#FF6B6B]/10 to-[#EF5350]/10 rounded-xl border border-[#FF6B6B]/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-[#64748B]">To hit your targets</div>
                    <div className="font-bold text-[#0F172A]">
                      {suggestionDetail || suggestion}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onSuggestionClick}
                    className="px-4 py-2 bg-[#FF6B6B] text-white font-medium rounded-lg hover:bg-[#EF5350] transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Optional extra content */}
            {rightContentExtra}
          </div>
        </div>
      </div>
    </div>
  );
}
