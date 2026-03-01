'use client';

import React from 'react';
import { Clock, ChefHat, Pin, Plus } from 'lucide-react';
import Link from 'next/link';
import { MyRecipesSidebar } from './MyRecipesSidebar';
import type { QuickFoodItem } from './QuickPills';
import type { FoodStaple } from '@/hooks/useStaples';
import type { Recipe } from './MyRecipesSidebar';

interface PantryTabProps {
  quickFoods: QuickFoodItem[];
  onQuickAdd: (item: QuickFoodItem) => void;
  onCreateRecipe?: () => void;
  onSidebarRecipeAdd?: (recipe: Recipe) => void;
  recipeSidebarRefreshTrigger?: number;
  staples?: Record<string, FoodStaple[]>;
  onManageStaples?: (mealSlot: string) => void;
  onLogStaple?: (staple: FoodStaple) => void;
}

const MEAL_SLOTS = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const;

const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACK: 'Snack',
};

const cardStyle = 'bg-white rounded-xl border border-[#E2E8F0] p-4';
const itemHover = 'hover:bg-[#F8FAFC] transition-colors';

export function PantryTab({
  quickFoods,
  onQuickAdd,
  onCreateRecipe,
  onSidebarRecipeAdd,
  recipeSidebarRefreshTrigger,
  staples,
  onManageStaples,
  onLogStaple,
}: PantryTabProps) {
  const displayFoods = quickFoods.slice(0, 8);

  const hasStaples = staples && MEAL_SLOTS.some((slot) => staples[slot]?.length > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Column 1: Recent Foods */}
      <div className={cardStyle}>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-[#FF6B6B]" />
          <h3 className="font-medium text-[#0F172A]">Recent Foods</h3>
        </div>

        {displayFoods.length === 0 ? (
          <p className="text-sm text-[#94A3B8] text-center py-4">
            No recent foods yet
          </p>
        ) : (
          <div className="space-y-1">
            {displayFoods.map((food) => (
              <button
                key={food.id}
                type="button"
                onClick={() => onQuickAdd(food)}
                className={`w-full flex items-center gap-2 p-2 rounded-lg group ${itemHover}`}
              >
                {food.emoji && (
                  <span className="text-lg flex-shrink-0">{food.emoji}</span>
                )}
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-sm font-medium text-[#0F172A] truncate">
                    {food.name}
                  </div>
                  <div className="text-xs text-[#94A3B8]">{Math.round(food.calories)} cal</div>
                </div>
                <Plus className="w-4 h-4 text-[#94A3B8] opacity-0 group-hover:opacity-100 group-hover:text-[#FF6B6B] transition-all flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Column 2: My Recipes */}
      <div className={cardStyle}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-[#FF6B6B]" />
            <h3 className="font-medium text-[#0F172A]">My Recipes</h3>
          </div>
          <Link
            href="/nutrition/recipes"
            className="text-xs text-[#FF6B6B] hover:text-[#EF5350] font-medium transition-colors"
          >
            See all &rarr;
          </Link>
        </div>

        <MyRecipesSidebar
          onRecipeAdd={onSidebarRecipeAdd}
          onCreateRecipe={onCreateRecipe}
          maxItems={6}
          refreshTrigger={recipeSidebarRefreshTrigger}
        />

        {onCreateRecipe && (
          <button
            type="button"
            onClick={onCreateRecipe}
            className="w-full mt-3 py-2 border-2 border-dashed border-[#E2E8F0] rounded-lg text-sm text-[#94A3B8] hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition-colors flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Create Recipe
          </button>
        )}
      </div>

      {/* Column 3: My Staples */}
      <div className={cardStyle}>
        <div className="flex items-center gap-2 mb-3">
          <Pin className="w-4 h-4 text-[#FF6B6B]" />
          <h3 className="font-medium text-[#0F172A]">My Staples</h3>
        </div>

        {!hasStaples ? (
          <div className="border-2 border-dashed border-[#E2E8F0] rounded-lg p-6 text-center">
            <Pin className="w-6 h-6 text-[#94A3B8] mx-auto mb-2" />
            <p className="text-sm text-[#94A3B8]">
              Pin foods you eat regularly
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {MEAL_SLOTS.map((slot) => {
              const slotStaples = staples?.[slot];
              if (!slotStaples || slotStaples.length === 0) return null;

              return (
                <div key={slot}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#475569] uppercase tracking-wide">
                      {MEAL_LABELS[slot]}
                    </span>
                    {onManageStaples && (
                      <button
                        type="button"
                        onClick={() => onManageStaples(slot)}
                        className="text-xs text-[#FF6B6B] hover:text-[#EF5350] font-medium transition-colors"
                      >
                        Manage
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {slotStaples.map((staple) => (
                      <button
                        key={staple.id}
                        type="button"
                        onClick={() => onLogStaple?.(staple)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF5F5] hover:bg-[#FFE5E5] border border-[#FF6B6B]/20 rounded-full transition-colors group text-sm"
                      >
                        {staple.emoji && (
                          <span className="text-sm">{staple.emoji}</span>
                        )}
                        <span className="font-medium text-[#0F172A]">
                          {staple.name}
                        </span>
                        <span className="text-[#94A3B8] text-xs">
                          {Math.round(staple.calories)}
                        </span>
                        <Plus className="w-3.5 h-3.5 text-[#FF6B6B] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default PantryTab;
