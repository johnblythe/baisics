'use client';

import React, { useState, useCallback } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { FoodSearchAutocomplete } from '../nutrition/FoodSearchAutocomplete';
import { ServingSizeSelector, CalculatedMacros } from '../nutrition/ServingSizeSelector';
import { UnifiedFoodResult } from '@/lib/food-search/types';
import { toast } from 'sonner';

// Common emojis for recipes
const RECIPE_EMOJIS = [
  '🍳', '🥗', '🍲', '🥤', '🥣', '🥪', '🍜', '🍝',
  '🥘', '🍛', '🍱', '🥙', '🌯', '🥡', '🍽️', '🍴',
];

/** Ingredient with serving info */
export interface RecipeIngredient {
  id: string;
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  /** Original per-100g values for recalculation */
  baseCalories: number;
  baseProtein: number;
  baseCarbs: number;
  baseFat: number;
}

export interface CreateRecipeModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when recipe is saved */
  onSave?: (recipe: {
    name: string;
    emoji: string | null;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    ingredients: RecipeIngredient[];
  }) => void;
  /** User ID for search scoping */
  userId?: string;
}

export function CreateRecipeModal({
  isOpen,
  onClose,
  onSave,
  userId,
}: CreateRecipeModalProps) {
  // Form state
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState<string | null>('🍽️');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Search state - for when user is adding an ingredient
  const [selectedFood, setSelectedFood] = useState<UnifiedFoodResult | null>(null);

  // Calculate totals
  const totals = ingredients.reduce(
    (acc, ing) => ({
      calories: acc.calories + ing.calories,
      protein: acc.protein + ing.protein,
      carbs: acc.carbs + ing.carbs,
      fat: acc.fat + ing.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Handle food selection from search
  const handleFoodSelect = useCallback((food: UnifiedFoodResult) => {
    setSelectedFood(food);
  }, []);

  // Handle serving size confirmation - add ingredient to list
  const handleServingConfirm = useCallback(
    (macros: CalculatedMacros) => {
      if (!selectedFood) return;

      const newIngredient: RecipeIngredient = {
        id: `${selectedFood.id}-${Date.now()}`,
        name: selectedFood.name,
        brand: selectedFood.brand,
        servingSize: macros.grams,
        servingUnit: 'g',
        calories: macros.calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
        // Store base values for potential recalculation
        baseCalories: selectedFood.calories,
        baseProtein: selectedFood.protein,
        baseCarbs: selectedFood.carbs,
        baseFat: selectedFood.fat,
      };

      setIngredients((prev) => [...prev, newIngredient]);
      setSelectedFood(null);
    },
    [selectedFood]
  );

  // Cancel serving selection
  const handleServingCancel = useCallback(() => {
    setSelectedFood(null);
  }, []);

  // Remove ingredient
  const handleRemoveIngredient = useCallback((ingredientId: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== ingredientId));
  }, []);

  // Save recipe
  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      toast.error('Please enter a recipe name');
      return;
    }
    if (ingredients.length === 0) {
      toast.error('Please add at least one ingredient');
      return;
    }

    setIsSaving(true);
    try {
      const recipeData = {
        name: name.trim(),
        emoji,
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fat: Math.round(totals.fat * 10) / 10,
        servingSize: 1,
        servingUnit: 'recipe',
        ingredients: ingredients.map((ing) => ({
          name: ing.name,
          brand: ing.brand,
          servingSize: ing.servingSize,
          servingUnit: ing.servingUnit,
          calories: ing.calories,
          protein: ing.protein,
          carbs: ing.carbs,
          fat: ing.fat,
        })),
      };

      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save recipe');
      }

      const savedRecipe = await response.json();
      toast.success('Recipe saved!');

      // Call onSave callback with the saved recipe data
      onSave?.({
        name: savedRecipe.name,
        emoji: savedRecipe.emoji,
        calories: savedRecipe.calories,
        protein: savedRecipe.protein,
        carbs: savedRecipe.carbs,
        fat: savedRecipe.fat,
        ingredients,
      });

      // Reset form and close
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save recipe');
    } finally {
      setIsSaving(false);
    }
  }, [name, emoji, ingredients, totals, onSave, onClose]);

  // Reset form state
  const resetForm = () => {
    setName('');
    setEmoji('🍽️');
    setIngredients([]);
    setSelectedFood(null);
    setShowEmojiPicker(false);
  };

  // Handle close - reset form
  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-sm sm:max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-[#0F172A]">Create Recipe</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Name/emoji and search - fixed section (dropdown needs space) */}
        <div className="p-4 pb-0 space-y-4">
          {/* Name and emoji row */}
          <div className="flex gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-12 h-12 bg-gray-100 rounded-lg text-2xl hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                {emoji || '🍽️'}
              </button>
              {/* Emoji picker dropdown */}
              {showEmojiPicker && (
                <div className="absolute top-full left-0 mt-2 p-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10 grid grid-cols-8 gap-1 w-64">
                  {RECIPE_EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => {
                        setEmoji(e);
                        setShowEmojiPicker(false);
                      }}
                      className="w-7 h-7 text-lg hover:bg-gray-100 rounded flex items-center justify-center"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Recipe name"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] text-[#0F172A]"
            />
          </div>

          {/* Ingredients header and search */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Ingredients</div>

            {/* Search or serving selector */}
            {selectedFood ? (
              <div className="mb-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-sm font-medium text-[#0F172A] mb-2">
                  {selectedFood.name}
                  {selectedFood.brand && (
                    <span className="text-gray-500 font-normal ml-2">({selectedFood.brand})</span>
                  )}
                </div>
                <ServingSizeSelector
                  food={selectedFood}
                  onConfirm={handleServingConfirm}
                  onCancel={handleServingCancel}
                />
              </div>
            ) : (
              <div className="mb-2 relative">
                <FoodSearchAutocomplete
                  onSelect={handleFoodSelect}
                  placeholder="Search to add ingredient..."
                  userId={userId}
                />
              </div>
            )}
          </div>
        </div>

        {/* Ingredients list and totals - scrollable section */}
        <div className="px-4 pb-4 overflow-y-auto flex-1 min-h-0">

          {/* Ingredient list */}
          {ingredients.length > 0 ? (
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
              {ingredients.map((ing) => (
                <div key={ing.id} className="flex items-center justify-between p-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-[#0F172A] truncate">
                      {ing.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {ing.servingSize}
                      {ing.servingUnit}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium">{ing.calories} cal</div>
                      <div className="text-xs text-green-600">{ing.protein}g P</div>
                    </div>
                    <button
                      onClick={() => handleRemoveIngredient(ing.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
              <Plus className="w-6 h-6 mx-auto mb-2 opacity-50" />
              Search above to add ingredients
            </div>
          )}

          {/* Running total */}
          {ingredients.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#0F172A]">Total</span>
                <div className="text-right">
                  <span className="font-bold text-lg">{Math.round(totals.calories)} cal</span>
                  <span className="text-green-600 ml-2">{Math.round(totals.protein)}g P</span>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-1 text-xs text-gray-500">
                <span>{Math.round(totals.carbs)}g C</span>
                <span>{Math.round(totals.fat)}g F</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim() || ingredients.length === 0}
            className="flex-1 px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Recipe'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateRecipeModal;
