'use client';

import React, { useState, useEffect, useCallback } from 'react';

// Colors matching v2a design system
const COLORS = {
  white: '#FFFFFF',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray400: '#94A3B8',
  gray600: '#475569',
  navy: '#0F172A',
  navyLight: '#1E293B',
  coral: '#FF6B6B',
  coralDark: '#EF5350',
  coralLight: '#FFE5E5',
};

export interface Ingredient {
  name: string;
  amount: string;
  category?: string;
}

export interface MacroDelta {
  protein?: number;
  carbs?: number;
  fat?: number;
  calories?: number;
}

export interface SwapSuggestion {
  ingredient: Ingredient;
  macroDelta: MacroDelta;
  reason?: string;
}

export interface IngredientSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentIngredient: Ingredient;
  mealName?: string;
  mealType?: string;
  onSwap: (newIngredient: Ingredient | null) => void;
  /** User goals for context in swap suggestions */
  userGoals?: string[];
  /** Program ID for fetching suggestions */
  programId?: string;
}

export function IngredientSwapModal({
  isOpen,
  onClose,
  currentIngredient,
  mealName,
  mealType,
  onSwap,
  userGoals = [],
  programId,
}: IngredientSwapModalProps) {
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<SwapSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<SwapSuggestion | null>(null);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/nutrition/swap-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredient: currentIngredient,
          mealContext: {
            name: mealName,
            type: mealType,
          },
          userGoals,
          programId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [currentIngredient, mealName, mealType, userGoals, programId]);

  useEffect(() => {
    if (isOpen) {
      fetchSuggestions();
      setSelectedSuggestion(null);
    }
  }, [isOpen, fetchSuggestions]);

  const formatMacroDelta = (delta: MacroDelta): string => {
    const parts: string[] = [];

    if (delta.protein !== undefined && delta.protein !== 0) {
      parts.push(`${delta.protein > 0 ? '+' : ''}${delta.protein}g P`);
    }
    if (delta.carbs !== undefined && delta.carbs !== 0) {
      parts.push(`${delta.carbs > 0 ? '+' : ''}${delta.carbs}g C`);
    }
    if (delta.fat !== undefined && delta.fat !== 0) {
      parts.push(`${delta.fat > 0 ? '+' : ''}${delta.fat}g F`);
    }
    if (delta.calories !== undefined && delta.calories !== 0) {
      parts.push(`${delta.calories > 0 ? '+' : ''}${delta.calories} cal`);
    }

    return parts.length > 0 ? parts.join(' | ') : 'No change';
  };

  const getMacroDeltaColor = (delta: MacroDelta): string => {
    // Show green if protein up, red if calories up significantly
    if ((delta.protein ?? 0) > 0) return '#16A34A'; // emerald
    if ((delta.calories ?? 0) > 50) return '#DC2626'; // red
    if ((delta.carbs ?? 0) < 0 || (delta.fat ?? 0) < 0) return '#0284C7'; // blue
    return COLORS.gray600;
  };

  const handleConfirmSwap = () => {
    if (selectedSuggestion) {
      onSwap(selectedSuggestion.ingredient);
    }
    onClose();
  };

  const handleRemove = () => {
    onSwap(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-6 py-4"
            style={{ backgroundColor: COLORS.coral }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Swap Ingredient</h2>
                <p className="text-sm text-white/80">
                  {mealName && `in ${mealName}`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Current Ingredient */}
          <div
            className="px-6 py-4 border-b"
            style={{ borderColor: COLORS.gray100 }}
          >
            <div className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: COLORS.gray400 }}>
              Current Ingredient
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium" style={{ color: COLORS.navy }}>
                {currentIngredient.amount} {currentIngredient.name}
              </span>
            </div>
          </div>

          {/* Suggestions */}
          <div className="px-6 py-4 max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div
                  className="w-8 h-8 border-3 rounded-full animate-spin mb-3"
                  style={{
                    borderColor: COLORS.gray100,
                    borderTopColor: COLORS.coral,
                  }}
                />
                <p className="text-sm" style={{ color: COLORS.gray400 }}>
                  Finding swap options...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.coralLight }}>
                  <svg className="w-6 h-6" style={{ color: COLORS.coral }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-sm font-medium" style={{ color: COLORS.navy }}>{error}</p>
                <button
                  onClick={fetchSuggestions}
                  className="mt-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                  style={{ backgroundColor: COLORS.gray100, color: COLORS.gray600 }}
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: COLORS.gray400 }}>
                  Swap Options
                </div>

                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSuggestion(suggestion)}
                    className="w-full p-3 rounded-xl border-2 text-left transition-all"
                    style={{
                      borderColor: selectedSuggestion === suggestion ? COLORS.coral : COLORS.gray100,
                      backgroundColor: selectedSuggestion === suggestion ? COLORS.coralLight : COLORS.white,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium" style={{ color: COLORS.navy }}>
                        {suggestion.ingredient.amount} {suggestion.ingredient.name}
                      </span>
                      {selectedSuggestion === suggestion && (
                        <svg className="w-5 h-5" style={{ color: COLORS.coral }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div
                      className="text-xs font-medium"
                      style={{ color: getMacroDeltaColor(suggestion.macroDelta) }}
                    >
                      {formatMacroDelta(suggestion.macroDelta)}
                    </div>
                    {suggestion.reason && (
                      <p className="text-xs mt-1" style={{ color: COLORS.gray400 }}>
                        {suggestion.reason}
                      </p>
                    )}
                  </button>
                ))}

                {suggestions.length === 0 && (
                  <p className="text-sm text-center py-4" style={{ color: COLORS.gray400 }}>
                    No swap suggestions available.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div
            className="px-6 py-4 border-t flex gap-3"
            style={{ borderColor: COLORS.gray100, backgroundColor: COLORS.gray50 }}
          >
            <button
              onClick={handleRemove}
              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors border"
              style={{
                borderColor: COLORS.gray100,
                color: COLORS.gray600,
                backgroundColor: COLORS.white,
              }}
            >
              Remove Entirely
            </button>
            <button
              onClick={handleConfirmSwap}
              disabled={!selectedSuggestion}
              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(to right, ${COLORS.coral}, #FF8E8E)`,
                color: COLORS.white,
              }}
            >
              Swap Ingredient
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IngredientSwapModal;
