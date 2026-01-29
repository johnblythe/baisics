'use client';

import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChefHat, Plus, Database, Search } from 'lucide-react';
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

  // Remaining / suggestion
  remainingCalories?: number;
  remainingProtein?: number;
  suggestion?: string;
  onSuggestionClick?: () => void;

  // Custom content slots
  customHeader?: ReactNode;
  customFooter?: ReactNode;

  // Recipe sidebar refresh trigger
  recipeSidebarRefreshTrigger?: number;
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

export function MobileLayout({
  title = 'Food Log',
  subtitle,
  headerBadge,
  macroTotals,
  macroTargets,
  onAISubmit,
  onInputFocus,
  aiInputPlaceholder,
  isAILoading,
  quickFoods,
  onQuickAdd,
  onQuickRecipeLog,
  weekData,
  weeklyExpanded,
  onWeeklyToggle,
  weeklySummaryMessage,
  meals,
  onAddToMeal,
  onEditItem,
  onDeleteItem,
  enableInlineSearch = true,
  onInlineFoodAdd,
  showQuickAdd,
  setShowQuickAdd,
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
  remainingCalories,
  remainingProtein,
  suggestion,
  onSuggestionClick,
  customHeader,
  customFooter,
  recipeSidebarRefreshTrigger,
}: MobileLayoutProps) {
  // Calculate remaining if not provided
  const calcRemainingCal = remainingCalories ?? (macroTargets.calories - macroTotals.calories);
  const calcRemainingP = remainingProtein ?? (macroTargets.protein - macroTotals.protein);

  const handleUSDAConfirm = (food: USDAFoodResult) => {
    onUSDAFoodAdd?.(food);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      {customHeader ?? (
        <div className="bg-[#FF6B6B] text-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">{title}</h1>
              {subtitle && <p className="text-sm text-white/80">{subtitle}</p>}
            </div>
            {headerBadge && (
              <span className="text-xs bg-white/20 px-2 py-1 rounded">{headerBadge}</span>
            )}
          </div>
        </div>
      )}

      {/* Macro Progress */}
      <div className="px-4 py-3 bg-white border-b border-[#E2E8F0]">
        <MacroProgressBar layout="horizontal" totals={macroTotals} targets={macroTargets} />
      </div>

      {/* USDA Food Search - Primary Entry Point */}
      {onUSDAFoodAdd && (
        <div className="px-4 py-3 bg-white border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-4 h-4 text-[#FF6B6B]" />
            <span className="text-sm font-medium text-[#0F172A]">Search Foods</span>
          </div>
          <USDAFoodSearch
            userId={userId}
            onConfirm={handleUSDAConfirm}
            placeholder="Search foods... (chicken, rice, banana)"
          />
        </div>
      )}

      {/* Quick Pills */}
      <div className="px-4 py-3 bg-white border-b border-[#E2E8F0]">
        <QuickPills foods={quickFoods} onAdd={onQuickAdd} onRecipeLog={onQuickRecipeLog} layout="horizontal" />
      </div>

      {/* AI Quick Input */}
      <div className="px-4 py-3 bg-white border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-4 h-4 text-[#FF6B6B]" />
          <span className="text-sm font-medium text-[#0F172A]">AI Quick Add</span>
        </div>
        <QuickInput
          onSubmit={onAISubmit}
          onFocus={() => {
            setShowQuickAdd(true);
            onInputFocus?.();
          }}
          placeholder={aiInputPlaceholder}
          isLoading={isAILoading}
        />
      </div>

      {/* Weekly Strip */}
      <div className="px-4 py-3 bg-white border-b border-[#E2E8F0]">
        <WeeklyStrip
          weekData={weekData}
          expanded={weeklyExpanded}
          onToggle={onWeeklyToggle}
          summaryMessage={weeklySummaryMessage}
        />
      </div>

      {/* Today's Log */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
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
            onSaveAsRecipe={onSaveAsRecipe}
          />
        ))}
      </div>

      {/* Remaining (sticky) */}
      {customFooter ?? (
        <div className="px-4 py-3 bg-gradient-to-t from-white to-white/80 border-t border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[#64748B]">Remaining</div>
              <div className="font-bold text-[#0F172A]">
                {calcRemainingCal.toLocaleString()} cal · {Math.round(calcRemainingP)}g P
              </div>
            </div>
            {suggestion && (
              <div className="text-right">
                <div className="text-xs text-[#94A3B8]">Suggestion</div>
                <button
                  type="button"
                  onClick={onSuggestionClick}
                  className="text-sm text-[#FF6B6B] font-medium hover:text-[#EF5350] transition-colors"
                >
                  {suggestion}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Quick Add Sheet */}
      <AnimatePresence>
        {showQuickAdd && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShowQuickAdd(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-h-[70vh] overflow-hidden"
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-[#E2E8F0] rounded-full" />
              </div>
              <div className="px-4 pb-4 space-y-4 overflow-y-auto max-h-[60vh]">
                <div>
                  <h3 className="font-medium text-[#0F172A] mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#FF6B6B]" />
                    Recent
                  </h3>
                  <QuickPills
                    foods={quickFoods}
                    onAdd={(item) => {
                      onQuickAdd(item);
                      setShowQuickAdd(false);
                    }}
                    onRecipeLog={onQuickRecipeLog ? async (item, meal) => {
                      await onQuickRecipeLog(item, meal);
                      setShowQuickAdd(false);
                    } : undefined}
                    layout="grid"
                    maxItems={6}
                  />
                </div>
                {/* My Recipes Sidebar - Self-fetching */}
                {enableRecipeSidebar && (
                  <MyRecipesSidebar
                    onRecipeAdd={(recipe) => {
                      onSidebarRecipeAdd?.(recipe);
                      setShowQuickAdd(false);
                    }}
                    onCreateRecipe={onCreateRecipe}
                    maxItems={5}
                    refreshTrigger={recipeSidebarRefreshTrigger}
                  />
                )}
                {/* Legacy Recipes Panel */}
                {!enableRecipeSidebar && recipes.length > 0 && onRecipeAdd && (
                  <RecipesPanel
                    recipes={recipes}
                    onAdd={(item) => {
                      onRecipeAdd(item);
                      setShowQuickAdd(false);
                    }}
                    onCreateRecipe={onCreateRecipe}
                  />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
