'use client';

import React, { useEffect, useState } from 'react';
import { ChefHat, Plus, Loader2 } from 'lucide-react';

export interface RecipeData {
  id: string;
  userId: string | null;
  name: string;
  emoji: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
  isPublic: boolean;
  usageCount: number;
}

export interface RecipePanelProps {
  /** Callback when user clicks add on a recipe */
  onAdd: (recipe: RecipeData) => void;
  /** Callback when user clicks "Create Recipe" button */
  onCreateRecipe?: () => void;
  /** Optional search filter */
  searchQuery?: string;
  /** Optional: pass recipes externally to skip fetching */
  recipes?: RecipeData[];
  /** Optional: disable auto-fetch (use with recipes prop) */
  disableFetch?: boolean;
  /** Optional: show loading state externally */
  isLoading?: boolean;
  /** Optional: custom class name */
  className?: string;
  /** Maximum number of recipes to display */
  maxDisplay?: number;
}

export function RecipePanel({
  onAdd,
  onCreateRecipe,
  searchQuery,
  recipes: externalRecipes,
  disableFetch = false,
  isLoading: externalLoading,
  className = '',
  maxDisplay,
}: RecipePanelProps) {
  const [recipes, setRecipes] = useState<RecipeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoading = externalLoading ?? loading;
  const displayRecipes = externalRecipes ?? recipes;

  useEffect(() => {
    if (disableFetch || externalRecipes) return;

    const fetchRecipes = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (searchQuery) {
          params.set('search', searchQuery);
        }
        const url = `/api/recipes${params.toString() ? `?${params}` : ''}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        }

        const data = await response.json();
        setRecipes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recipes');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [disableFetch, externalRecipes, searchQuery]);

  // Separate user's recipes from public recipes
  // User recipes: userId is not null
  // Public recipes: userId is null (system/public recipes)
  const userRecipes = displayRecipes.filter((r) => r.userId !== null);
  const publicRecipes = displayRecipes.filter((r) => r.userId === null && r.isPublic);

  // Apply max display limit
  const limitedUserRecipes = maxDisplay ? userRecipes.slice(0, maxDisplay) : userRecipes;
  const remainingSlots = maxDisplay ? Math.max(0, maxDisplay - limitedUserRecipes.length) : undefined;
  const limitedPublicRecipes = remainingSlots !== undefined
    ? publicRecipes.slice(0, remainingSlots)
    : publicRecipes;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-[#0F172A] flex items-center gap-2">
          <ChefHat className="w-4 h-4 text-[#FF6B6B]" />
          My Recipes
        </h3>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 text-[#94A3B8] animate-spin" />
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="text-sm text-red-500 py-2">{error}</div>
      )}

      {/* Recipes list */}
      {!isLoading && !error && (
        <>
          {/* User's recipes */}
          {limitedUserRecipes.map((recipe) => (
            <RecipeRow key={recipe.id} recipe={recipe} onAdd={onAdd} />
          ))}

          {/* Public/popular recipes section */}
          {limitedPublicRecipes.length > 0 && (
            <>
              {limitedUserRecipes.length > 0 && (
                <div className="text-xs text-[#94A3B8] pt-2 pb-1">Popular</div>
              )}
              {limitedPublicRecipes.map((recipe) => (
                <RecipeRow key={recipe.id} recipe={recipe} onAdd={onAdd} isPublic />
              ))}
            </>
          )}

          {/* Empty state */}
          {displayRecipes.length === 0 && (
            <div className="text-sm text-[#94A3B8] py-4 text-center">
              No recipes yet
            </div>
          )}
        </>
      )}

      {/* Create Recipe button */}
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

interface RecipeRowProps {
  recipe: RecipeData;
  onAdd: (recipe: RecipeData) => void;
  isPublic?: boolean;
}

function RecipeRow({ recipe, onAdd, isPublic }: RecipeRowProps) {
  return (
    <button
      type="button"
      onClick={() => onAdd(recipe)}
      className="w-full flex items-center gap-3 p-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-xl transition-colors text-left group"
    >
      <span className="text-xl">{recipe.emoji || '🍽️'}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[#0F172A] truncate">
          {recipe.name}
          {isPublic && (
            <span className="ml-1 text-xs text-[#94A3B8]">⭐</span>
          )}
        </div>
        <div className="text-xs text-[#94A3B8]">
          {recipe.calories} cal · {Math.round(recipe.protein)}g P
        </div>
      </div>
      <Plus className="w-4 h-4 text-[#94A3B8] group-hover:text-[#FF6B6B] transition-colors flex-shrink-0" />
    </button>
  );
}
