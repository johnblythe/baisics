'use client';

import React, { useRef } from 'react';
import { Plus, ArrowUp, Search } from 'lucide-react';

export interface QuickFoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
  emoji?: string;
}

export interface QuickPillsProps {
  foods: QuickFoodItem[];
  onAdd: (item: QuickFoodItem) => void;
  layout?: 'horizontal' | 'grid';
  maxItems?: number;
}

export function QuickPills({ foods, onAdd, layout = 'horizontal', maxItems }: QuickPillsProps) {
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
        {displayFoods.map((food) => (
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
        ))}
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto scrollbar-hide"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {displayFoods.map((food) => (
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
      ))}
    </div>
  );
}
