'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Plus, ArrowUp, Search, ChefHat, Coffee, Sun, Moon, Apple, Loader2 } from 'lucide-react';

export interface QuickFoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
  emoji?: string;
  /** If true, this is a recipe (visually distinct, meal selector on click) */
  isRecipe?: boolean;
  /** Recipe ID for incrementing usageCount */
  recipeId?: string;
}

export interface QuickPillsProps {
  foods: QuickFoodItem[];
  onAdd: (item: QuickFoodItem) => void;
  /** Callback for logging recipes (with meal selection) */
  onRecipeLog?: (item: QuickFoodItem, meal: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK') => Promise<void>;
  layout?: 'horizontal' | 'grid';
  maxItems?: number;
}

// Meal options with icons
const MEAL_OPTIONS: { value: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'; label: string; icon: React.ReactNode }[] = [
  { value: 'BREAKFAST', label: 'Breakfast', icon: <Coffee className="w-4 h-4" /> },
  { value: 'LUNCH', label: 'Lunch', icon: <Sun className="w-4 h-4" /> },
  { value: 'DINNER', label: 'Dinner', icon: <Moon className="w-4 h-4" /> },
  { value: 'SNACK', label: 'Snack', icon: <Apple className="w-4 h-4" /> },
];

// Recipe pill component with meal selector dropdown
function RecipePill({
  food,
  layout,
  onRecipeLog,
}: {
  food: QuickFoodItem;
  layout: 'horizontal' | 'grid';
  onRecipeLog?: (item: QuickFoodItem, meal: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK') => Promise<void>;
}) {
  const [showMealSelector, setShowMealSelector] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showMealSelector) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowMealSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMealSelector]);

  const handleMealSelect = async (meal: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK') => {
    if (!onRecipeLog) return;
    setIsLogging(true);
    try {
      await onRecipeLog(food, meal);
    } finally {
      setIsLogging(false);
      setShowMealSelector(false);
    }
  };

  const isGrid = layout === 'grid';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setShowMealSelector(!showMealSelector)}
        disabled={isLogging}
        className={
          isGrid
            ? 'w-full flex items-center gap-2 p-3 bg-[#FFF5F5] hover:bg-[#FFE5E5] border-2 border-[#FF6B6B]/30 rounded-xl transition-colors group text-left'
            : 'flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-[#FFF5F5] hover:bg-[#FFE5E5] border-2 border-[#FF6B6B]/30 rounded-full transition-colors group'
        }
      >
        {food.emoji ? (
          <span className={isGrid ? 'text-xl' : 'text-lg'}>{food.emoji}</span>
        ) : (
          <ChefHat className={isGrid ? 'w-5 h-5 text-[#FF6B6B]' : 'w-4 h-4 text-[#FF6B6B]'} />
        )}
        {isGrid ? (
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[#0F172A] truncate">{food.name}</div>
            <div className="text-xs text-[#94A3B8]">{food.calories} cal</div>
          </div>
        ) : (
          <span className="text-sm font-medium text-[#0F172A] whitespace-nowrap">{food.name}</span>
        )}
        {isLogging ? (
          <Loader2 className="w-4 h-4 text-[#FF6B6B] animate-spin flex-shrink-0" />
        ) : (
          <Plus className="w-4 h-4 text-[#FF6B6B] group-hover:text-[#EF5350] transition-colors flex-shrink-0" />
        )}
      </button>

      {/* Meal selector dropdown */}
      {showMealSelector && (
        <div className="absolute z-20 top-full left-0 mt-1 bg-white border border-[#E2E8F0] rounded-lg shadow-lg py-1 min-w-[140px]">
          <div className="px-2 py-1 text-xs text-[#64748B] font-medium">Add to...</div>
          {MEAL_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleMealSelect(option.value)}
              className="w-full px-3 py-2 text-left text-sm text-[#0F172A] hover:bg-[#F8FAFC] flex items-center gap-2"
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function QuickPills({ foods, onAdd, onRecipeLog, layout = 'horizontal', maxItems }: QuickPillsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const displayFoods = maxItems ? foods.slice(0, maxItems) : foods;

  // Empty state when no quick foods available
  if (displayFoods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-4 text-center">
        <ArrowUp className="w-5 h-5 text-[#FF6B6B] mb-2 animate-bounce" />
        <div className="flex items-center gap-2 text-sm text-[#64748B]">
          <Search className="w-4 h-4" />
          <span>Search for foods above to start logging</span>
        </div>
      </div>
    );
  }

  if (layout === 'grid') {
    return (
      <div className="grid grid-cols-2 gap-2">
        {displayFoods.map((food) =>
          food.isRecipe ? (
            <RecipePill key={food.id} food={food} layout="grid" onRecipeLog={onRecipeLog} />
          ) : (
            <button
              key={food.id}
              type="button"
              onClick={() => onAdd(food)}
              className="flex items-center gap-2 p-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl transition-colors group text-left"
            >
              {food.emoji && <span className="text-xl">{food.emoji}</span>}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#0F172A] truncate">{food.name}</div>
                <div className="text-xs text-[#94A3B8]">{food.calories} cal</div>
              </div>
              <Plus className="w-4 h-4 text-[#94A3B8] group-hover:text-[#FF6B6B] transition-colors flex-shrink-0" />
            </button>
          )
        )}
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto scrollbar-hide"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {displayFoods.map((food) =>
        food.isRecipe ? (
          <RecipePill key={food.id} food={food} layout="horizontal" onRecipeLog={onRecipeLog} />
        ) : (
          <button
            key={food.id}
            type="button"
            onClick={() => onAdd(food)}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-full transition-colors group"
          >
            {food.emoji && <span className="text-lg">{food.emoji}</span>}
            <span className="text-sm font-medium text-[#0F172A] whitespace-nowrap">{food.name}</span>
            <Plus className="w-4 h-4 text-[#94A3B8] group-hover:text-[#FF6B6B] transition-colors" />
          </button>
        )
      )}
    </div>
  );
}
