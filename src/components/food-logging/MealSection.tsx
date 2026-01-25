'use client';

import React from 'react';
import { Coffee, Sun, Moon, Apple, Plus } from 'lucide-react';
import { FoodLogItem, type FoodLogItemData } from './FoodLogItem';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'snacks';

export interface MealSectionProps {
  meal: MealType | string;
  items: FoodLogItemData[];
  onAdd: () => void;
  onEditItem?: (item: FoodLogItemData) => void;
  onDeleteItem?: (item: FoodLogItemData) => void;
  showItemActions?: boolean;
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
}: MealSectionProps) {
  const totals = items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
    }),
    { calories: 0, protein: 0 }
  );

  const displayName = getMealDisplayName(meal);

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
          onClick={onAdd}
          className="text-xs text-[#FF6B6B] hover:text-[#EF5350] font-medium flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Add
        </button>
      </div>

      {items.length > 0 ? (
        <div className="space-y-1">
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
      ) : (
        <button
          type="button"
          onClick={onAdd}
          className="w-full p-4 border-2 border-dashed border-[#E2E8F0] rounded-xl text-sm text-[#94A3B8] hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition-colors"
        >
          + Add {displayName.toLowerCase()}
        </button>
      )}
    </div>
  );
}
