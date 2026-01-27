'use client';

import React, { useState, useMemo } from 'react';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { FoodLogItemData } from './FoodLogItem';

// Common emojis for recipes
const RECIPE_EMOJIS = [
  '🍳', '🥗', '🍲', '🥤', '🥣', '🥪', '🍜', '🍝',
  '🥘', '🍛', '🍱', '🥙', '🌯', '🥡', '🍽️', '🍴',
];

export interface SaveMealAsRecipeModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Items from the meal to save as recipe */
  items: FoodLogItemData[];
  /** Meal name for display (e.g., "Breakfast") */
  mealName: string;
  /** Callback when recipe is saved - receives the created recipe */
  onSave?: (recipe: {
    id: string;
    name: string;
    emoji: string | null;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => void;
}

export function SaveMealAsRecipeModal({
  isOpen,
  onClose,
  items,
  mealName,
  onSave,
}: SaveMealAsRecipeModalProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState<string | null>('🍽️');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate totals from items
  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        carbs: acc.carbs + (item.carbs ?? 0),
        fat: acc.fat + (item.fat ?? 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [items]);

  // Reset form state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setName('');
      setEmoji('🍽️');
      setShowEmojiPicker(false);
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a recipe name');
      return;
    }

    setIsSaving(true);
    try {
      // Build ingredients from meal items
      const ingredients = items.map((item) => ({
        name: item.name,
        servingSize: 1,
        servingUnit: 'serving',
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs ?? 0,
        fat: item.fat ?? 0,
      }));

      const recipeData = {
        name: name.trim(),
        emoji,
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fat: Math.round(totals.fat * 10) / 10,
        servingSize: 1,
        servingUnit: 'recipe',
        isPublic: false,
        ingredients,
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

      // Call onSave callback with the saved recipe
      onSave?.({
        id: savedRecipe.id,
        name: savedRecipe.name,
        emoji: savedRecipe.emoji,
        calories: savedRecipe.calories,
        protein: savedRecipe.protein,
        carbs: savedRecipe.carbs,
        fat: savedRecipe.fat,
      });

      onClose();
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save recipe');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-[#0F172A]">Save {mealName} as Recipe</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - scrollable */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
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
              autoFocus
            />
          </div>

          {/* Items preview */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              Items ({items.length})
            </div>
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-[#0F172A] truncate">
                      {item.name}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-medium">{item.calories} cal</div>
                    <div className="text-xs text-green-600">{item.protein}g P</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total macros */}
          <div className="bg-gray-50 rounded-lg p-3">
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
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="flex-1 px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
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

export default SaveMealAsRecipeModal;
