'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Coffee, Sun, Moon, Apple, Plus, Loader2 } from 'lucide-react';

export interface MergedQuickItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  emoji?: string;
  tag: 'staple' | 'recipe' | 'recent';
  isRecipe?: boolean;
  recipeId?: string;
}

interface MergedQuickAddProps {
  items: MergedQuickItem[];
  onAdd: (item: MergedQuickItem) => void;
  onRecipeLog?: (item: MergedQuickItem, meal: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK') => Promise<void>;
  onViewPantry: () => void;
  maxItems?: number;
}

type FilterChip = 'all' | 'staple' | 'recipe' | 'recent';

const FILTER_CHIPS: { value: FilterChip; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'staple', label: 'Staples' },
  { value: 'recipe', label: 'Recipes' },
  { value: 'recent', label: 'Recents' },
];

const TAG_STYLES: Record<MergedQuickItem['tag'], { bg: string; text: string }> = {
  staple: { bg: 'bg-[#FFE5E5]', text: 'text-[#FF6B6B]' },
  recipe: { bg: 'bg-[#EDE9FE]', text: 'text-[#7C3AED]' },
  recent: { bg: 'bg-[#F1F5F9]', text: 'text-[#64748B]' },
};

const MEAL_OPTIONS: { value: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'; label: string; icon: React.ReactNode }[] = [
  { value: 'BREAKFAST', label: 'Breakfast', icon: <Coffee className="w-4 h-4" /> },
  { value: 'LUNCH', label: 'Lunch', icon: <Sun className="w-4 h-4" /> },
  { value: 'DINNER', label: 'Dinner', icon: <Moon className="w-4 h-4" /> },
  { value: 'SNACK', label: 'Snack', icon: <Apple className="w-4 h-4" /> },
];

function MergedItem({
  item,
  onAdd,
  onRecipeLog,
}: {
  item: MergedQuickItem;
  onAdd: (item: MergedQuickItem) => void;
  onRecipeLog?: (item: MergedQuickItem, meal: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK') => Promise<void>;
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
      await onRecipeLog(item, meal);
      setShowMealSelector(false);
    } catch (err) {
      console.error('Failed to log recipe to meal:', err);
    } finally {
      setIsLogging(false);
    }
  };

  const handleClick = () => {
    if (item.isRecipe) {
      setShowMealSelector(!showMealSelector);
    } else {
      onAdd(item);
    }
  };

  const { bg: tagBg, text: tagText } = TAG_STYLES[item.tag];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isLogging}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#F8FAFC] transition-colors group text-left"
      >
        <span>{item.emoji || (item.tag === 'recipe' ? '\uD83C\uDF73' : '\uD83C\uDF7D\uFE0F')}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-[#0F172A] truncate">{item.name}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${tagBg} ${tagText}`}>{item.tag}</span>
          </div>
          <span className="text-xs text-[#94A3B8]">{item.calories} cal &middot; {item.protein}g P</span>
        </div>
        {isLogging ? (
          <Loader2 className="w-4 h-4 text-[#FF6B6B] animate-spin flex-shrink-0" />
        ) : (
          <span className="text-[#FF6B6B] opacity-0 group-hover:opacity-100 transition-opacity">
            <Plus className="w-4 h-4" />
          </span>
        )}
      </button>

      {/* Meal selector dropdown for recipes */}
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

export function MergedQuickAdd({
  items,
  onAdd,
  onRecipeLog,
  onViewPantry,
  maxItems = 6,
}: MergedQuickAddProps) {
  const [activeFilter, setActiveFilter] = useState<FilterChip>('all');

  const filteredItems = activeFilter === 'all'
    ? items
    : items.filter((item) => item.tag === activeFilter);

  const displayItems = filteredItems.slice(0, maxItems);

  return (
    <div>
      {/* Header: title + filter chips */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-semibold text-[#0F172A]">Quick Add</span>
        <div className="flex gap-1 ml-auto">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip.value}
              type="button"
              onClick={() => setActiveFilter(chip.value)}
              className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                activeFilter === chip.value
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-[#F1F5F9] text-[#94A3B8] hover:bg-[#E2E8F0]'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Item list */}
      <div className="flex flex-col">
        {displayItems.length === 0 ? (
          <div className="py-4 text-center text-sm text-[#94A3B8]">
            No items found
          </div>
        ) : (
          displayItems.map((item) => (
            <MergedItem
              key={item.id}
              item={item}
              onAdd={onAdd}
              onRecipeLog={onRecipeLog}
            />
          ))
        )}
      </div>

      {/* Pantry link */}
      <button
        type="button"
        onClick={onViewPantry}
        className="w-full text-center text-xs text-[#FF6B6B] hover:text-[#EF5350] py-2 transition-colors"
      >
        See all in Pantry &rarr;
      </button>
    </div>
  );
}
