'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
  onUpdate?: () => void;
  onDelete?: () => void;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden hover:border-[#94A3B8] transition-colors">
      {/* Collapsed state - always visible */}
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

      {/* Expanded state - shows ingredients and actions */}
      {isExpanded && (
        <div className="border-t border-[#E2E8F0] p-4 space-y-4">
          {/* Ingredients list */}
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

          {/* Action buttons - to be implemented in US-004 and US-006 */}
          <div className="flex gap-2 pt-2">
            <button
              className="flex-1 px-3 py-2 bg-[#FF6B6B] text-white text-sm font-medium rounded-lg hover:bg-[#EF5350] transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: US-006 - Log recipe functionality
              }}
            >
              Log It
            </button>
            <button
              className="px-3 py-2 border border-[#E2E8F0] text-[#64748B] text-sm font-medium rounded-lg hover:bg-[#F8FAFC] transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: US-004 - Edit functionality
              }}
            >
              Edit
            </button>
            <button
              className="px-3 py-2 border border-[#E2E8F0] text-[#64748B] text-sm font-medium rounded-lg hover:bg-[#F8FAFC] hover:text-red-500 hover:border-red-200 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: US-004 - Delete functionality
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipeCard;
