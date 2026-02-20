'use client';

import React, { useState, useCallback, useId, useRef, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronUp, Plus, Trash2, Loader2, GripVertical, X, Check, Coffee, Sun, Moon, Apple } from 'lucide-react';
import { formatDateForAPI } from '@/lib/date-utils';

// Type for recipe ingredient in edit mode
interface EditableIngredient {
  id: string; // for dnd-kit
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface RecipeCardProps {
  recipe: {
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
  };
  /** Callback when recipe data is updated (edit/save) */
  onUpdate?: () => void;
  /** Callback when recipe is deleted */
  onDelete?: () => void;
  /** Selected date for logging (defaults to today) */
  selectedDate?: Date;
}

// Common emoji options for quick selection
const EMOJI_OPTIONS = ['🍲', '🥗', '🍝', '🌮', '🍱', '🥪', '🍳', '🥘', '🍜', '🍛', '🥣', '🍽️'];

// Common unit options
const UNIT_OPTIONS = ['g', 'oz', 'cup', 'tbsp', 'tsp', 'ml', 'piece', 'serving'];

// Sortable ingredient row component
interface SortableIngredientProps {
  ingredient: EditableIngredient;
  onUpdate: (id: string, field: keyof EditableIngredient, value: string | number) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

function SortableIngredient({ ingredient, onUpdate, onRemove, canRemove }: SortableIngredientProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ingredient.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 bg-[#F8FAFC] rounded-xl space-y-2 ${isDragging ? 'shadow-lg z-10' : ''}`}
    >
      {/* Ingredient name row with drag handle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-[#CBD5E1] hover:text-[#94A3B8] flex-shrink-0"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <input
          type="text"
          value={ingredient.name}
          onChange={(e) => onUpdate(ingredient.id, 'name', e.target.value)}
          placeholder="Ingredient name"
          className="flex-1 px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#FF6B6B] focus:border-transparent"
        />
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(ingredient.id)}
            className="p-2 text-[#94A3B8] hover:text-red-500 transition-colors flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Amount and unit */}
      <div className="flex gap-2 pl-7">
        <input
          type="number"
          value={ingredient.servingSize || ''}
          onChange={(e) => onUpdate(ingredient.id, 'servingSize', parseFloat(e.target.value) || 0)}
          placeholder="Amount"
          min={0}
          step={0.1}
          className="w-20 px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#FF6B6B] focus:border-transparent"
        />
        <select
          value={ingredient.servingUnit}
          onChange={(e) => onUpdate(ingredient.id, 'servingUnit', e.target.value)}
          className="w-20 px-2 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#FF6B6B] focus:border-transparent"
        >
          {UNIT_OPTIONS.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>

      {/* Macros row */}
      <div className="flex gap-2 pl-7">
        <div className="flex-1">
          <label className="block text-xs text-[#94A3B8] mb-0.5">Cal</label>
          <input
            type="number"
            value={ingredient.calories || ''}
            onChange={(e) => onUpdate(ingredient.id, 'calories', parseInt(e.target.value) || 0)}
            placeholder="0"
            min={0}
            className="w-full px-2 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#FF6B6B] focus:border-transparent"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-green-600 mb-0.5">P (g)</label>
          <input
            type="number"
            value={ingredient.protein || ''}
            onChange={(e) => onUpdate(ingredient.id, 'protein', parseFloat(e.target.value) || 0)}
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
            value={ingredient.carbs || ''}
            onChange={(e) => onUpdate(ingredient.id, 'carbs', parseFloat(e.target.value) || 0)}
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
            value={ingredient.fat || ''}
            onChange={(e) => onUpdate(ingredient.id, 'fat', parseFloat(e.target.value) || 0)}
            placeholder="0"
            min={0}
            step={0.1}
            className="w-full px-2 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#FF6B6B] focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}

// Meal type options for the dropdown
const MEAL_OPTIONS = [
  { value: 'BREAKFAST', label: 'Breakfast', icon: Coffee },
  { value: 'LUNCH', label: 'Lunch', icon: Sun },
  { value: 'DINNER', label: 'Dinner', icon: Moon },
  { value: 'SNACK', label: 'Snack', icon: Apple },
] as const;

export function RecipeCard({ recipe, onUpdate, onDelete, selectedDate }: RecipeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Log It dropdown state
  const [showMealSelector, setShowMealSelector] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const mealSelectorRef = useRef<HTMLDivElement>(null);

  // Edit mode state
  const [editName, setEditName] = useState(recipe.name);
  const [editEmoji, setEditEmoji] = useState(recipe.emoji || '🍽️');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editIngredients, setEditIngredients] = useState<EditableIngredient[]>([]);

  // Unique ID prefix for dnd-kit
  const idPrefix = useId();

  // Close meal selector when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mealSelectorRef.current && !mealSelectorRef.current.contains(event.target as Node)) {
        setShowMealSelector(false);
      }
    }
    if (showMealSelector) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMealSelector]);

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Calculate totals from ingredients
  const calculateTotals = useCallback((ingredients: EditableIngredient[]) => {
    return ingredients.reduce(
      (acc, ing) => ({
        calories: acc.calories + (ing.calories || 0),
        protein: acc.protein + (ing.protein || 0),
        carbs: acc.carbs + (ing.carbs || 0),
        fat: acc.fat + (ing.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, []);

  // Enter edit mode
  const handleStartEdit = useCallback(() => {
    setEditName(recipe.name);
    setEditEmoji(recipe.emoji || '🍽️');
    setEditIngredients(
      recipe.ingredients.map((ing, idx) => ({
        ...ing,
        id: `${idPrefix}-${idx}`,
      }))
    );
    setIsEditing(true);
    setError(null);
  }, [recipe, idPrefix]);

  // Cancel edit mode
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setShowEmojiPicker(false);
    setError(null);
  }, []);

  // Save changes
  const handleSave = useCallback(async () => {
    if (!editName.trim()) {
      setError('Recipe name is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const validIngredients = editIngredients.filter((ing) => ing.name.trim());
      const totals = calculateTotals(validIngredients);

      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          emoji: editEmoji,
          calories: Math.round(totals.calories),
          protein: Math.round(totals.protein * 10) / 10,
          carbs: Math.round(totals.carbs * 10) / 10,
          fat: Math.round(totals.fat * 10) / 10,
          ingredients: validIngredients.map(({ id: _id, ...rest }) => rest),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update recipe');
      }

      setIsEditing(false);
      onUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recipe');
    } finally {
      setIsSaving(false);
    }
  }, [editName, editEmoji, editIngredients, recipe.id, calculateTotals, onUpdate]);

  // Delete recipe
  const handleDelete = useCallback(async () => {
    if (!confirm(`Delete "${recipe.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete recipe');
      }

      onDelete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recipe');
    }
  }, [recipe.id, recipe.name, onDelete]);

  // Update a single ingredient field
  const updateIngredient = useCallback((id: string, field: keyof EditableIngredient, value: string | number) => {
    setEditIngredients((prev) =>
      prev.map((ing) => {
        if (ing.id !== id) return ing;
        return { ...ing, [field]: value };
      })
    );
  }, []);

  // Remove ingredient
  const removeIngredient = useCallback((id: string) => {
    setEditIngredients((prev) => prev.filter((ing) => ing.id !== id));
  }, []);

  // Add new ingredient
  const addIngredient = useCallback(() => {
    setEditIngredients((prev) => [
      ...prev,
      {
        id: `${idPrefix}-new-${Date.now()}`,
        name: '',
        servingSize: 0,
        servingUnit: 'g',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      },
    ]);
  }, [idPrefix]);

  // Handle drag end for reordering
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setEditIngredients((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  // Log recipe handler - logs to selected meal
  const handleLogRecipe = useCallback(async (mealType: string) => {
    setIsLogging(true);
    setError(null);
    setShowMealSelector(false);

    try {
      // Use selectedDate or default to today
      const logDate = selectedDate || new Date();
      const dateStr = formatDateForAPI(logDate);

      const response = await fetch(`/api/recipes/${recipe.id}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meal: mealType,
          date: dateStr,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to log recipe');
      }

      // Trigger update to refresh usageCount
      onUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log recipe');
    } finally {
      setIsLogging(false);
    }
  }, [recipe.id, selectedDate, onUpdate]);

  // Calculate edit mode totals
  const editTotals = isEditing ? calculateTotals(editIngredients) : null;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl hover:border-[#94A3B8] transition-colors">
      {/* Collapsed state - always visible */}
      {!isEditing ? (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#F8FAFC] transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl flex-shrink-0">
              {recipe.emoji || '🍽️'}
            </span>
            <div className="min-w-0">
              <div className="font-medium text-[#0F172A] truncate">
                {recipe.name}
              </div>
              <div className="text-sm text-[#64748B]">
                {recipe.calories} cal · {Math.round(recipe.protein)}g P · {Math.round(recipe.carbs)}g C · {Math.round(recipe.fat)}g F
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {recipe.usageCount > 0 && (
              <span className="text-xs text-[#94A3B8] bg-[#F1F5F9] px-2 py-1 rounded-full">
                {recipe.usageCount}x
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-[#94A3B8]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#94A3B8]" />
            )}
          </div>
        </button>
      ) : (
        /* Edit mode header */
        <div className="p-4 space-y-3">
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
                {editEmoji}
              </button>
              {showEmojiPicker && (
                <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-xl border border-[#E2E8F0] shadow-lg z-20 grid grid-cols-6 gap-1">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => {
                        setEditEmoji(e);
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
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Recipe name"
              className="flex-1 px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Expanded state - shows ingredients and actions */}
      {(isExpanded || isEditing) && (
        <div className="border-t border-[#E2E8F0] p-4 space-y-4">
          {/* Ingredients list */}
          {isEditing ? (
            /* Edit mode - editable ingredients with drag */
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                  Ingredients
                </div>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="flex items-center gap-1 text-xs text-[#FF6B6B] hover:text-[#EF5350] transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add Ingredient
                </button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={editIngredients.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {editIngredients.map((ing) => (
                      <SortableIngredient
                        key={ing.id}
                        ingredient={ing}
                        onUpdate={updateIngredient}
                        onRemove={removeIngredient}
                        canRemove={editIngredients.length > 1}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Total macros display */}
              {editTotals && (
                <div className="mt-4 p-4 bg-[#F8FAFC] rounded-xl">
                  <div className="text-xs text-[#64748B] mb-2">Total per serving</div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-bold text-[#0F172A]">{Math.round(editTotals.calories)} cal</span>
                    <span className="text-green-600">{Math.round(editTotals.protein * 10) / 10}g P</span>
                    <span className="text-amber-600">{Math.round(editTotals.carbs * 10) / 10}g C</span>
                    <span className="text-blue-600">{Math.round(editTotals.fat * 10) / 10}g F</span>
                  </div>
                </div>
              )}

              {/* Edit mode action buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 px-3 py-2 bg-[#FF6B6B] text-white text-sm font-medium rounded-lg hover:bg-[#EF5350] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {isSaving ? 'Updating...' : 'Update'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="px-3 py-2 border border-[#E2E8F0] text-[#64748B] text-sm font-medium rounded-lg hover:bg-[#F8FAFC] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* View mode - read-only ingredients */
            <>
              {/* Error message (for logging errors) */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 mb-4">
                  {error}
                </div>
              )}

              {recipe.ingredients && recipe.ingredients.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">
                    Ingredients
                  </div>
                  <div className="space-y-1">
                    {recipe.ingredients.map((ing, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm py-1"
                      >
                        <span className="text-[#475569]">
                          {ing.name}
                          {ing.brand && (
                            <span className="text-[#94A3B8] ml-1">({ing.brand})</span>
                          )}
                        </span>
                        <span className="text-[#94A3B8]">
                          {ing.servingSize}{ing.servingUnit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                {/* Log It button with meal selector dropdown */}
                <div className="relative flex-1" ref={mealSelectorRef}>
                  <button
                    className="w-full px-3 py-2 bg-[#FF6B6B] text-white text-sm font-medium rounded-lg hover:bg-[#EF5350] transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMealSelector(!showMealSelector);
                    }}
                    disabled={isLogging}
                  >
                    {isLogging ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Log It
                        <ChevronDown className="w-3 h-3" />
                      </>
                    )}
                  </button>

                  {/* Meal selector dropdown */}
                  {showMealSelector && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-[#E2E8F0] shadow-lg z-30 overflow-hidden">
                      {MEAL_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLogRecipe(option.value);
                            }}
                            className="w-full px-3 py-2.5 flex items-center gap-2 text-sm text-[#0F172A] hover:bg-[#F8FAFC] transition-colors text-left"
                          >
                            <Icon className="w-4 h-4 text-[#64748B]" />
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <button
                  className="px-3 py-2 border border-[#E2E8F0] text-[#64748B] text-sm font-medium rounded-lg hover:bg-[#F8FAFC] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartEdit();
                  }}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-2 border border-[#E2E8F0] text-[#64748B] text-sm font-medium rounded-lg hover:bg-[#F8FAFC] hover:text-red-500 hover:border-red-200 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default RecipeCard;
