'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Coffee, Sun, Moon, Apple, Plus, X, Search, Loader2 } from 'lucide-react';
import { MealType as PrismaMealType } from '@prisma/client';
import { FoodLogItem, type FoodLogItemData } from './FoodLogItem';
import { FoodSearchAutocomplete } from '@/components/nutrition/FoodSearchAutocomplete';
import { ServingSizeSelector, type CalculatedMacros } from '@/components/nutrition/ServingSizeSelector';
import type { UnifiedFoodResult } from '@/lib/food-search/types';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'snacks';

// Recipe type matching API response (includes ingredients for item count)
export interface RecipeWithIngredients {
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
  ingredients: unknown[];
}

// Convert string meal type to Prisma MealType enum
function stringToPrismaMealType(meal: string): PrismaMealType {
  switch (meal.toLowerCase()) {
    case 'breakfast':
      return PrismaMealType.BREAKFAST;
    case 'lunch':
      return PrismaMealType.LUNCH;
    case 'dinner':
      return PrismaMealType.DINNER;
    case 'snack':
    case 'snacks':
    default:
      return PrismaMealType.SNACK;
  }
}

export interface MealSectionFoodResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
  fdcId: string;
  brand?: string;
  meal: PrismaMealType;
  source?: string;
}

export interface MealSectionProps {
  meal: MealType | string;
  items: FoodLogItemData[];
  /** Legacy callback - opens external modal */
  onAdd: () => void;
  onEditItem?: (item: FoodLogItemData) => void;
  onDeleteItem?: (item: FoodLogItemData) => void;
  showItemActions?: boolean;
  /** Enable inline search panel (if true, overrides onAdd behavior) */
  enableInlineSearch?: boolean;
  /** Callback when food is added via inline search */
  onFoodAdd?: (food: MealSectionFoodResult) => void;
  /** User ID for food search tracking */
  userId?: string;
  /** Callback when recipe is added (multiplier: 1 for full, 0.5 for half) */
  onRecipeAdd?: (recipe: RecipeWithIngredients, multiplier: number) => void;
  /** Callback to open create recipe modal */
  onCreateRecipe?: () => void;
}

function getMealIcon(meal: string) {
  switch (meal.toLowerCase()) {
    case 'breakfast':
      return <Coffee className="w-4 h-4" />;
    case 'lunch':
      return <Sun className="w-4 h-4" />;
    case 'dinner':
      return <Moon className="w-4 h-4" />;
    case 'snack':
    case 'snacks':
    default:
      return <Apple className="w-4 h-4" />;
  }
}

function getMealDisplayName(meal: string): string {
  // Handle both singular and plural forms
  if (meal.toLowerCase() === 'snacks') {
    return 'Snacks';
  }
  return meal.charAt(0).toUpperCase() + meal.slice(1).toLowerCase();
}

export function MealSection({
  meal,
  items,
  onAdd,
  onEditItem,
  onDeleteItem,
  showItemActions = true,
  enableInlineSearch = false,
  onFoodAdd,
  userId,
  onRecipeAdd,
  onCreateRecipe,
}: MealSectionProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<UnifiedFoodResult | null>(null);
  const [recipes, setRecipes] = useState<RecipeWithIngredients[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(false);

  const totals = items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
    }),
    { calories: 0, protein: 0 }
  );

  const displayName = getMealDisplayName(meal);
  const prismaMealType = stringToPrismaMealType(meal);

  // Fetch recipes when search panel opens
  const fetchRecipes = useCallback(async () => {
    if (!onRecipeAdd) return;
    setRecipesLoading(true);
    try {
      const response = await fetch('/api/recipes');
      if (response.ok) {
        const data: RecipeWithIngredients[] = await response.json();
        setRecipes(data.slice(0, 5)); // Show top 5 recipes
      }
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
    } finally {
      setRecipesLoading(false);
    }
  }, [onRecipeAdd]);

  // Fetch recipes when search opens
  useEffect(() => {
    if (isSearchOpen && onRecipeAdd) {
      fetchRecipes();
    }
  }, [isSearchOpen, onRecipeAdd, fetchRecipes]);

  // Handle add button click
  const handleAddClick = () => {
    if (enableInlineSearch && onFoodAdd) {
      setIsSearchOpen(true);
    } else {
      onAdd();
    }
  };

  // Handle recipe add
  const handleRecipeAdd = (recipe: RecipeWithIngredients, multiplier: number) => {
    onRecipeAdd?.(recipe, multiplier);
    setIsSearchOpen(false);
  };

  // Handle food selection from search
  const handleFoodSelect = (food: UnifiedFoodResult) => {
    setSelectedFood(food);
  };

  // Handle serving size confirmation
  const handleServingConfirm = (macros: CalculatedMacros) => {
    if (!selectedFood || !onFoodAdd) return;

    onFoodAdd({
      name: selectedFood.name,
      calories: macros.calories,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
      servingSize: macros.grams,
      servingUnit: 'g',
      fdcId: selectedFood.id,
      brand: selectedFood.brand,
      meal: prismaMealType,
      source: selectedFood.source,
    });

    // Reset state
    setSelectedFood(null);
    setIsSearchOpen(false);
  };

  // Handle cancel/close
  const handleCancel = () => {
    setSelectedFood(null);
    setIsSearchOpen(false);
  };

  // Handle back to search from serving selector
  const handleBackToSearch = () => {
    setSelectedFood(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#F1F5F9] rounded-lg text-[#64748B]">
            {getMealIcon(meal)}
          </div>
          <span className="font-medium text-[#0F172A]">{displayName}</span>
          {items.length > 0 && (
            <span className="text-xs text-[#94A3B8]">
              {totals.calories} cal · {totals.protein}g P
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleAddClick}
          className="text-xs text-[#FF6B6B] hover:text-[#EF5350] font-medium flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Add
        </button>
      </div>

      {/* Food items list */}
      {items.length > 0 && (
        <div className="space-y-1 mb-2">
          {items.map((item) => (
            <FoodLogItem
              key={item.id}
              item={item}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
              showActions={showItemActions}
            />
          ))}
        </div>
      )}

      {/* Inline search panel */}
      {isSearchOpen && enableInlineSearch ? (
        <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
          {/* Search header */}
          <div className="p-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#64748B] font-medium">
                Adding to {displayName}
              </span>
              <button
                type="button"
                onClick={handleCancel}
                className="text-[#94A3B8] hover:text-[#64748B] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {!selectedFood ? (
              <FoodSearchAutocomplete
                onSelect={handleFoodSelect}
                placeholder={`Search foods for ${displayName.toLowerCase()}...`}
                userId={userId}
              />
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBackToSearch}
                  className="text-sm text-[#FF6B6B] hover:text-[#EF5350]"
                >
                  ← Back
                </button>
                <span className="text-sm font-medium text-[#0F172A] truncate">
                  {selectedFood.name}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-3">
            {selectedFood ? (
              <ServingSizeSelector
                food={selectedFood}
                onConfirm={handleServingConfirm}
                onCancel={handleBackToSearch}
              />
            ) : (
              <div className="space-y-3">
                {/* MY RECIPES section */}
                {onRecipeAdd && (
                  <div>
                    <div className="flex items-center justify-between px-2 py-1">
                      <span className="text-xs font-semibold text-[#64748B] uppercase">
                        My Recipes
                      </span>
                      {onCreateRecipe && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsSearchOpen(false);
                            onCreateRecipe();
                          }}
                          className="text-xs text-[#FF6B6B] hover:text-[#EF5350] font-medium"
                        >
                          + New
                        </button>
                      )}
                    </div>
                    {recipesLoading ? (
                      <div className="flex items-center justify-center py-3">
                        <Loader2 className="w-4 h-4 text-[#94A3B8] animate-spin" />
                      </div>
                    ) : recipes.length === 0 ? (
                      <p className="text-xs text-[#94A3B8] px-2 py-2">
                        No recipes yet
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {recipes.map((recipe) => (
                          <div
                            key={recipe.id}
                            className="hover:bg-[#FF6B6B]/5 rounded-lg p-2 cursor-pointer border-2 border-transparent hover:border-[#FF6B6B]/20 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-lg flex-shrink-0">
                                  {recipe.emoji || '🍽️'}
                                </span>
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-[#0F172A] truncate">
                                    {recipe.name}
                                  </div>
                                  <div className="text-xs text-[#94A3B8]">
                                    {recipe.calories} cal · {Math.round(recipe.protein)}g P
                                    {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 && (
                                      <span> · {recipe.ingredients.length} items</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRecipeAdd(recipe, 0.5);
                                  }}
                                  className="text-xs bg-[#F1F5F9] text-[#64748B] px-2 py-1 rounded hover:bg-[#E2E8F0] transition-colors"
                                  title="Add half serving"
                                >
                                  ½
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRecipeAdd(recipe, 1);
                                  }}
                                  className="text-xs bg-[#FF6B6B] text-white px-2 py-1 rounded hover:bg-[#EF5350] transition-colors"
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Prompt to search */}
                <div className="text-center py-2 border-t border-[#E2E8F0]">
                  <Search className="w-6 h-6 text-[#E2E8F0] mx-auto mb-1" />
                  <p className="text-xs text-[#94A3B8]">
                    Search above to find more foods
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Cancel button */}
          <div className="p-2 border-t border-[#E2E8F0] bg-[#F8FAFC]">
            <button
              type="button"
              onClick={handleCancel}
              className="text-xs text-[#94A3B8] hover:text-[#64748B] w-full text-center py-1"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : items.length === 0 ? (
        /* Empty state - only show when search panel is closed */
        <button
          type="button"
          onClick={handleAddClick}
          className="w-full p-4 border-2 border-dashed border-[#E2E8F0] rounded-xl text-sm text-[#94A3B8] hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition-colors"
        >
          + Add {displayName.toLowerCase()}
        </button>
      ) : null}
    </div>
  );
}
