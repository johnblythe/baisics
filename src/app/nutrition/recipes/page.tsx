'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Plus, Loader2, BookOpen, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import MainLayout from '@/app/components/layouts/MainLayout';
import { CreateRecipeModal, RecipeIngredient } from '@/components/food-logging/CreateRecipeModal';
import { RecipeTextInput } from '@/components/food-logging/RecipeTextInput';
import { RecipeCard } from '@/components/nutrition/RecipeCard';
import type { ParseRecipeResponse } from '@/app/api/recipes/parse-text/route';

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
  isPublic: boolean;
  ingredients: {
    name: string;
    brand?: string;
    servingSize: number;
    servingUnit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<RecipeWithIngredients[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [parsedIngredients, setParsedIngredients] = useState<RecipeIngredient[] | undefined>();
  const [parsedName, setParsedName] = useState<string | undefined>();
  const [parsedServings, setParsedServings] = useState<number | undefined>();

  const fetchRecipes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/recipes');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch recipes');
      }
      const data: RecipeWithIngredients[] = await response.json();
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

  // Client-side search filtering
  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return recipes;
    const query = searchQuery.toLowerCase();
    return recipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(query)
    );
  }, [recipes, searchQuery]);

  const handleCreateRecipe = () => {
    // Clear any parsed data when opening manual mode
    setParsedIngredients(undefined);
    setParsedName(undefined);
    setParsedServings(undefined);
    setIsCreateModalOpen(true);
  };

  const handleParsedRecipe = (response: ParseRecipeResponse) => {
    // Convert parsed ingredients to RecipeIngredient format
    const ingredients: RecipeIngredient[] = response.ingredients.map((ing, i) => ({
      id: `parsed-${i}-${Date.now()}`,
      name: ing.name,
      servingSize: ing.quantity,
      servingUnit: ing.unit,
      calories: ing.calories,
      protein: ing.protein,
      carbs: ing.carbs,
      fat: ing.fat,
      source: ing.source,
    }));

    setParsedIngredients(ingredients);
    setParsedName(response.suggestedName || undefined);
    setParsedServings(response.detectedServings || undefined);
    setIsCreateModalOpen(true);
  };

  const handleRecipeSaved = () => {
    // Client-side prepend: refetch to get the new recipe at the top
    fetchRecipes();
    // Clear parsed data
    setParsedIngredients(undefined);
    setParsedName(undefined);
    setParsedServings(undefined);
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setParsedIngredients(undefined);
    setParsedName(undefined);
    setParsedServings(undefined);
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Back link */}
        <Link
          href="/nutrition"
          className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Food Log
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">My Recipes</h1>
            <p className="text-[#64748B]">Save and reuse your favorite meals</p>
          </div>
          <button
            onClick={handleCreateRecipe}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B6B] text-white font-medium rounded-lg hover:bg-[#EF5350] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create New
          </button>
        </div>

        {/* AI Recipe Input */}
        <RecipeTextInput onParsed={handleParsedRecipe} />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search recipes..."
            autoComplete="off"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] text-[#0F172A] bg-white"
          />
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#FF6B6B] animate-spin" />
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchRecipes}
              className="mt-4 text-sm text-[#FF6B6B] hover:text-[#EF5350] font-medium"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && recipes.length === 0 && (
          <div className="bg-white border-2 border-dashed border-[#E2E8F0] rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-[#FFE5E5] rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-[#FF6B6B]" />
            </div>
            <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
              No recipes yet
            </h3>
            <p className="text-[#64748B] mb-6 max-w-md mx-auto">
              Create recipes from your favorite meals or save any combination of foods for quick logging later.
            </p>
            <button
              onClick={handleCreateRecipe}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B6B] text-white font-medium rounded-lg hover:bg-[#EF5350] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Recipe
            </button>
          </div>
        )}

        {/* No search results */}
        {!isLoading && !error && recipes.length > 0 && filteredRecipes.length === 0 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 text-center">
            <p className="text-[#64748B]">
              No recipes match &quot;{searchQuery}&quot;
            </p>
          </div>
        )}

        {/* Recipe grid */}
        {!isLoading && !error && filteredRecipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onUpdate={fetchRecipes}
                onDelete={fetchRecipes}
              />
            ))}
          </div>
        )}
      </div>

      <CreateRecipeModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        onSave={handleRecipeSaved}
        initialIngredients={parsedIngredients}
        initialName={parsedName}
        initialServings={parsedServings}
      />
    </MainLayout>
  );
}
