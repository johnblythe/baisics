'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';

// Type for a recipe ingredient
export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Type for recipe data when editing
export interface RecipeEditData {
  id?: string;
  name: string;
  emoji: string;
  servingSize: number;
  servingUnit: string;
  ingredients: RecipeIngredient[];
}

// Props for the RecipeEditor component
export interface RecipeEditorProps {
  /** Recipe to edit (if editing), undefined for new recipe */
  recipe?: RecipeEditData;
  /** Called when save is successful */
  onSave: (recipe: RecipeEditData) => void;
  /** Called when user cancels */
  onCancel: () => void;
  /** Whether the modal is visible */
  isVisible?: boolean;
}

// Common emoji options for quick selection
const EMOJI_OPTIONS = ['🍲', '🥗', '🍝', '🌮', '🍱', '🥪', '🍳', '🥘', '🍜', '🍛', '🥣', '🍽️'];

// Common unit options
const UNIT_OPTIONS = ['g', 'oz', 'cup', 'tbsp', 'tsp', 'ml', 'piece', 'serving'];

// Empty ingredient template
const emptyIngredient: RecipeIngredient = {
  name: '',
  amount: 0,
  unit: 'g',
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};

export function RecipeEditor({
  recipe,
  onSave,
  onCancel,
}: RecipeEditorProps) {
  const isEditing = !!recipe?.id;

  // Form state
  const [name, setName] = useState(recipe?.name || '');
  const [emoji, setEmoji] = useState(recipe?.emoji || '🍽️');
  const [servingSize, setServingSize] = useState(recipe?.servingSize || 1);
  const [servingUnit, setServingUnit] = useState(recipe?.servingUnit || 'serving');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
    recipe?.ingredients?.length ? recipe.ingredients : [{ ...emptyIngredient }]
  );
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate total macros from ingredients
  const totals = ingredients.reduce(
    (acc, ing) => ({
      calories: acc.calories + (ing.calories || 0),
      protein: acc.protein + (ing.protein || 0),
      carbs: acc.carbs + (ing.carbs || 0),
      fat: acc.fat + (ing.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Add new ingredient row
  const addIngredient = useCallback(() => {
    setIngredients((prev) => [...prev, { ...emptyIngredient }]);
  }, []);

  // Remove ingredient row
  const removeIngredient = useCallback((index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Update a single ingredient field
  const updateIngredient = useCallback((index: number, field: keyof RecipeIngredient, value: string | number) => {
    setIngredients((prev) =>
      prev.map((ing, i) => {
        if (i !== index) return ing;
        return { ...ing, [field]: value };
      })
    );
  }, []);

  // Handle save
  const handleSave = async () => {
    setError(null);

    // Validate
    if (!name.trim()) {
      setError('Recipe name is required');
      return;
    }

    // Filter out empty ingredients
    const validIngredients = ingredients.filter((ing) => ing.name.trim());

    setIsSaving(true);

    try {
      const body = {
        name: name.trim(),
        emoji,
        servingSize,
        servingUnit,
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fat: Math.round(totals.fat * 10) / 10,
        ingredients: validIngredients,
      };

      const url = isEditing ? `/api/recipes/${recipe.id}` : '/api/recipes';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save recipe');
      }

      const savedRecipe = await response.json();

      onSave({
        id: savedRecipe.id,
        name: savedRecipe.name,
        emoji: savedRecipe.emoji || '🍽️',
        servingSize: savedRecipe.servingSize,
        servingUnit: savedRecipe.servingUnit,
        ingredients: savedRecipe.ingredients || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recipe');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form when recipe prop changes
  useEffect(() => {
    if (recipe) {
      setName(recipe.name || '');
      setEmoji(recipe.emoji || '🍽️');
      setServingSize(recipe.servingSize || 1);
      setServingUnit(recipe.servingUnit || 'serving');
      setIngredients(recipe.ingredients?.length ? recipe.ingredients : [{ ...emptyIngredient }]);
    }
  }, [recipe]);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onCancel}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl max-h-[90vh] overflow-y-auto lg:bottom-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:max-w-lg lg:w-full lg:rounded-2xl lg:max-h-[80vh]"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-semibold text-[#0F172A]">
            {isEditing ? 'Edit Recipe' : 'Create Recipe'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-[#94A3B8] hover:text-[#64748B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form content */}
        <div className="p-4 space-y-4">
          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Name and emoji row */}
          <div className="flex gap-3">
            {/* Emoji picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-14 h-14 flex items-center justify-center text-2xl bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-xl border border-[#E2E8F0] transition-colors"
              >
                {emoji}
              </button>
              {showEmojiPicker && (
                <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-xl border border-[#E2E8F0] shadow-lg z-20 grid grid-cols-6 gap-1">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => {
                        setEmoji(e);
                        setShowEmojiPicker(false);
                      }}
                      className="w-8 h-8 flex items-center justify-center text-lg hover:bg-[#F1F5F9] rounded-lg transition-colors"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Recipe name */}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Recipe name"
              className="flex-1 px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
            />
          </div>

          {/* Serving size row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-[#64748B] mb-1">Serving Size</label>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={servingSize}
                onChange={(e) => setServingSize(parseFloat(e.target.value) || 1)}
                min={0.1}
                step={0.1}
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-[#64748B] mb-1">Unit</label>
              <select
                value={servingUnit}
                onChange={(e) => setServingUnit(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
              >
                <option value="serving">serving</option>
                <option value="cup">cup</option>
                <option value="bowl">bowl</option>
                <option value="plate">plate</option>
                <option value="piece">piece</option>
                <option value="g">g</option>
                <option value="oz">oz</option>
              </select>
            </div>
          </div>

          {/* Ingredients section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#0F172A]">Ingredients</label>
              <button
                type="button"
                onClick={addIngredient}
                className="flex items-center gap-1 text-xs text-[#FF6B6B] hover:text-[#EF5350] transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>

            <div className="space-y-2">
              {ingredients.map((ing, index) => (
                <div key={index} className="p-3 bg-[#F8FAFC] rounded-xl space-y-2">
                  {/* Ingredient name row */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ing.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      placeholder="Ingredient name"
                      className="flex-1 px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#FF6B6B] focus:border-transparent"
                    />
                    {ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="p-2 text-[#94A3B8] hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Amount and unit */}
                  <div className="flex gap-2">
                    <input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={ing.amount || ''}
                      onChange={(e) => updateIngredient(index, 'amount', parseFloat(e.target.value) || 0)}
                      placeholder="Amount"
                      min={0}
                      step={0.1}
                      className="w-20 px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#FF6B6B] focus:border-transparent"
                    />
                    <select
                      value={ing.unit}
                      onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                      className="w-20 px-2 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#FF6B6B] focus:border-transparent"
                    >
                      {UNIT_OPTIONS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  {/* Macros row */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-[#94A3B8] mb-0.5">Cal</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={ing.calories || ''}
                        onChange={(e) => updateIngredient(index, 'calories', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        min={0}
                        className="w-full px-2 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#FF6B6B] focus:border-transparent"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-green-600 mb-0.5">P (g)</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={ing.protein || ''}
                        onChange={(e) => updateIngredient(index, 'protein', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        min={0}
                        step={0.1}
                        className="w-full px-2 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#FF6B6B] focus:border-transparent"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-amber-600 mb-0.5">C (g)</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={ing.carbs || ''}
                        onChange={(e) => updateIngredient(index, 'carbs', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        min={0}
                        step={0.1}
                        className="w-full px-2 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#FF6B6B] focus:border-transparent"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-blue-600 mb-0.5">F (g)</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={ing.fat || ''}
                        onChange={(e) => updateIngredient(index, 'fat', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        min={0}
                        step={0.1}
                        className="w-full px-2 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#FF6B6B] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total macros display */}
          <div className="p-4 bg-[#F8FAFC] rounded-xl">
            <div className="text-xs text-[#64748B] mb-2">Total per serving</div>
            <div className="flex items-center gap-4 text-sm">
              <span className="font-bold text-[#0F172A]">{Math.round(totals.calories)} cal</span>
              <span className="text-green-600">{Math.round(totals.protein * 10) / 10}g P</span>
              <span className="text-amber-600">{Math.round(totals.carbs * 10) / 10}g C</span>
              <span className="text-blue-600">{Math.round(totals.fat * 10) / 10}g F</span>
            </div>
          </div>
        </div>

        {/* Footer with buttons */}
        <div className="sticky bottom-0 bg-white border-t border-[#E2E8F0] p-4 flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-3 bg-[#FF6B6B] text-white font-semibold rounded-xl hover:bg-[#EF5350] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSaving ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update Recipe' : 'Save Recipe')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-3 text-[#64748B] font-medium hover:bg-[#F1F5F9] rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </>
  );
}
