'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Utensils, Plus, ChevronRight, Loader2 } from 'lucide-react';

export interface Recipe {
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
}

export interface MyRecipesSidebarProps {
  /** Callback when a recipe is clicked to add */
  onRecipeAdd?: (recipe: Recipe) => void;
  /** Callback to open recipe creation modal */
  onCreateRecipe?: () => void;
  /** Maximum number of recipes to show (default: 5) */
  maxItems?: number;
  /** Optional callback to view all recipes */
  onViewAll?: () => void;
}

export function MyRecipesSidebar({
  onRecipeAdd,
  onCreateRecipe,
  maxItems = 5,
  onViewAll,
}: MyRecipesSidebarProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/recipes');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch recipes');
      }
      const data: Recipe[] = await response.json();
      setRecipes(data);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recipes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handleRecipeClick = (recipe: Recipe) => {
    onRecipeAdd?.(recipe);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-[#0F172A] flex items-center gap-2">
            <Utensils className="w-4 h-4 text-[#FF6B6B]" />
            My Recipes
          </h3>
        </div>
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 text-[#94A3B8] animate-spin" />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-[#0F172A] flex items-center gap-2">
            <Utensils className="w-4 h-4 text-[#FF6B6B]" />
            My Recipes
          </h3>
        </div>
        <p className="text-sm text-[#94A3B8] text-center py-4">
          Could not load recipes
        </p>
      </div>
    );
  }

  // Show empty state with create option
  if (recipes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-[#0F172A] flex items-center gap-2">
            <Utensils className="w-4 h-4 text-[#FF6B6B]" />
            My Recipes
          </h3>
          {onCreateRecipe && (
            <button
              onClick={onCreateRecipe}
              className="w-6 h-6 bg-[#FF6B6B] text-white rounded-full flex items-center justify-center hover:bg-[#EF5350] transition-colors"
              title="Create Recipe"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="border-2 border-dashed border-[#E2E8F0] rounded-lg p-4 text-center">
          <p className="text-sm text-[#94A3B8] mb-2">No recipes yet</p>
          {onCreateRecipe && (
            <button
              onClick={onCreateRecipe}
              className="text-sm text-[#FF6B6B] hover:text-[#EF5350] font-medium"
            >
              Create your first recipe
            </button>
          )}
        </div>
      </div>
    );
  }

  const displayedRecipes = recipes.slice(0, maxItems);
  const hasMore = recipes.length > maxItems;

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-[#0F172A] flex items-center gap-2">
          <Utensils className="w-4 h-4 text-[#FF6B6B]" />
          My Recipes
        </h3>
        {onCreateRecipe && (
          <button
            onClick={onCreateRecipe}
            className="w-6 h-6 bg-[#FF6B6B] text-white rounded-full flex items-center justify-center hover:bg-[#EF5350] transition-colors"
            title="Create Recipe"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-1">
        {displayedRecipes.map((recipe) => (
          <div
            key={recipe.id}
            className="flex items-center justify-between p-2 hover:bg-[#F8FAFC] rounded-lg cursor-pointer group transition-colors"
            onClick={() => handleRecipeClick(recipe)}
          >
            <div className="flex items-center gap-2 min-w-0">
              {recipe.emoji ? (
                <span className="text-lg flex-shrink-0">{recipe.emoji}</span>
              ) : (
                <span className="text-lg flex-shrink-0">🍽️</span>
              )}
              <div className="min-w-0">
                <div className="text-sm font-medium text-[#0F172A] truncate">
                  {recipe.name}
                </div>
                <div className="text-xs text-[#94A3B8]">
                  {recipe.calories} cal · {Math.round(recipe.protein)}g P
                </div>
              </div>
            </div>
            <button
              className="opacity-0 group-hover:opacity-100 text-xs bg-[#FF6B6B] text-white px-2 py-1 rounded hover:bg-[#EF5350] transition-all flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                handleRecipeClick(recipe);
              }}
            >
              + Add
            </button>
          </div>
        ))}
      </div>

      {(hasMore || onViewAll) && (
        <button
          onClick={onViewAll}
          className="w-full text-sm text-[#FF6B6B] hover:text-[#EF5350] mt-3 py-2 hover:bg-[#FFE5E5]/50 rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          View All Recipes
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default MyRecipesSidebar;
