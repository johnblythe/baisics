'use client';

import React, { useState } from 'react';
import { Coffee, Sun, Moon, Apple, Plus, X, Search } from 'lucide-react';
import { MealType as PrismaMealType } from '@prisma/client';
import { FoodLogItem, type FoodLogItemData } from './FoodLogItem';
import { FoodSearchAutocomplete } from '@/components/nutrition/FoodSearchAutocomplete';
import { ServingSizeSelector, type CalculatedMacros } from '@/components/nutrition/ServingSizeSelector';
import type { UnifiedFoodResult } from '@/lib/food-search/types';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'snacks';

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
}: MealSectionProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<UnifiedFoodResult | null>(null);

  const totals = items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
    }),
    { calories: 0, protein: 0 }
  );

  const displayName = getMealDisplayName(meal);
  const prismaMealType = stringToPrismaMealType(meal);

  // Handle add button click
  const handleAddClick = () => {
    if (enableInlineSearch && onFoodAdd) {
      setIsSearchOpen(true);
    } else {
      onAdd();
    }
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
              <div className="text-center py-4">
                <Search className="w-8 h-8 text-[#E2E8F0] mx-auto mb-2" />
                <p className="text-xs text-[#94A3B8]">
                  Search to add food to {displayName.toLowerCase()}
                </p>
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
