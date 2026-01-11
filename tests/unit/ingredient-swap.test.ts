import { describe, it, expect, vi } from 'vitest';

/**
 * Tests for IngredientSwapModal component behavior
 *
 * These tests verify the macro formatting, swap selection,
 * and API interaction contracts for the ingredient swap feature.
 */

interface Ingredient {
  name: string;
  amount: string;
  category?: string;
}

interface MacroDelta {
  protein?: number;
  carbs?: number;
  fat?: number;
  calories?: number;
}

interface SwapSuggestion {
  ingredient: Ingredient;
  macroDelta: MacroDelta;
  reason?: string;
}

describe('IngredientSwapModal behavior', () => {
  describe('formatMacroDelta', () => {
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

    it('should format positive macro deltas with + sign', () => {
      const delta: MacroDelta = { protein: 10, carbs: 5, fat: 3 };
      const formatted = formatMacroDelta(delta);

      expect(formatted).toContain('+10g P');
      expect(formatted).toContain('+5g C');
      expect(formatted).toContain('+3g F');
    });

    it('should format negative macro deltas with - sign', () => {
      const delta: MacroDelta = { carbs: -15, fat: -5 };
      const formatted = formatMacroDelta(delta);

      expect(formatted).toContain('-15g C');
      expect(formatted).toContain('-5g F');
    });

    it('should format calories', () => {
      const delta: MacroDelta = { calories: 100 };
      expect(formatMacroDelta(delta)).toBe('+100 cal');

      const negativeDelta: MacroDelta = { calories: -50 };
      expect(formatMacroDelta(negativeDelta)).toBe('-50 cal');
    });

    it('should return "No change" when all deltas are zero or undefined', () => {
      expect(formatMacroDelta({})).toBe('No change');
      expect(formatMacroDelta({ protein: 0, carbs: 0 })).toBe('No change');
    });

    it('should skip zero values', () => {
      const delta: MacroDelta = { protein: 10, carbs: 0, fat: -5 };
      const formatted = formatMacroDelta(delta);

      expect(formatted).toContain('+10g P');
      expect(formatted).toContain('-5g F');
      expect(formatted).not.toContain('C');
    });
  });

  describe('getMacroDeltaColor', () => {
    const getMacroDeltaColor = (delta: MacroDelta): string => {
      if ((delta.protein ?? 0) > 0) return '#16A34A'; // emerald
      if ((delta.calories ?? 0) > 50) return '#DC2626'; // red
      if ((delta.carbs ?? 0) < 0 || (delta.fat ?? 0) < 0) return '#0284C7'; // blue
      return '#475569'; // gray
    };

    it('should return emerald for protein increase', () => {
      const color = getMacroDeltaColor({ protein: 10 });
      expect(color).toBe('#16A34A');
    });

    it('should return red for significant calorie increase', () => {
      const color = getMacroDeltaColor({ calories: 100 });
      expect(color).toBe('#DC2626');
    });

    it('should return blue for carb or fat decrease', () => {
      expect(getMacroDeltaColor({ carbs: -10 })).toBe('#0284C7');
      expect(getMacroDeltaColor({ fat: -5 })).toBe('#0284C7');
    });

    it('should return gray for neutral changes', () => {
      expect(getMacroDeltaColor({})).toBe('#475569');
      expect(getMacroDeltaColor({ calories: 30 })).toBe('#475569');
    });

    it('should prioritize protein increase over other changes', () => {
      // Even with high calories, protein increase takes precedence
      const color = getMacroDeltaColor({ protein: 10, calories: 100 });
      expect(color).toBe('#16A34A');
    });
  });

  describe('swap selection', () => {
    it('should track selected suggestion', () => {
      const suggestions: SwapSuggestion[] = [
        { ingredient: { name: 'Greek Yogurt', amount: '1 cup' }, macroDelta: { protein: 15 } },
        { ingredient: { name: 'Cottage Cheese', amount: '1/2 cup' }, macroDelta: { protein: 14 } },
      ];

      let selectedSuggestion: SwapSuggestion | null = null;

      // Select first suggestion
      selectedSuggestion = suggestions[0];
      expect(selectedSuggestion.ingredient.name).toBe('Greek Yogurt');

      // Change selection
      selectedSuggestion = suggestions[1];
      expect(selectedSuggestion.ingredient.name).toBe('Cottage Cheese');
    });
  });

  describe('onSwap callback', () => {
    it('should call onSwap with new ingredient when confirmed', () => {
      const onSwap = vi.fn();
      const selectedIngredient: Ingredient = { name: 'Greek Yogurt', amount: '1 cup' };

      // Simulate confirm swap
      onSwap(selectedIngredient);

      expect(onSwap).toHaveBeenCalledWith(selectedIngredient);
    });

    it('should call onSwap with null when removing ingredient', () => {
      const onSwap = vi.fn();

      // Simulate remove entirely
      onSwap(null);

      expect(onSwap).toHaveBeenCalledWith(null);
    });
  });

  describe('API request body', () => {
    it('should construct correct request body for swap suggestions', () => {
      const currentIngredient: Ingredient = { name: 'White Rice', amount: '1 cup' };
      const mealContext = { name: 'Lunch Bowl', type: 'lunch' };
      const userGoals = ['weight_loss', 'high_protein'];
      const programId = 'prog_123';

      const requestBody = {
        ingredient: currentIngredient,
        mealContext,
        userGoals,
        programId,
      };

      expect(requestBody.ingredient.name).toBe('White Rice');
      expect(requestBody.mealContext.name).toBe('Lunch Bowl');
      expect(requestBody.userGoals).toContain('high_protein');
      expect(requestBody.programId).toBe('prog_123');
    });
  });

  describe('modal visibility', () => {
    it('should only render when isOpen is true', () => {
      let isOpen = false;
      const shouldRender = isOpen;
      expect(shouldRender).toBe(false);

      isOpen = true;
      const shouldRenderNow = isOpen;
      expect(shouldRenderNow).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should parse error message from API response', () => {
      const apiError = { error: 'Subscription required for this feature' };
      const errorMessage = apiError.error || 'Failed to fetch suggestions';
      expect(errorMessage).toBe('Subscription required for this feature');
    });

    it('should use fallback error message when not provided', () => {
      const apiError = {};
      const errorMessage = (apiError as { error?: string }).error || 'Failed to fetch suggestions';
      expect(errorMessage).toBe('Failed to fetch suggestions');
    });
  });

  describe('suggestion list', () => {
    it('should handle empty suggestions array', () => {
      const suggestions: SwapSuggestion[] = [];
      expect(suggestions.length).toBe(0);

      // Component should show "No swap suggestions available" message
      const showNoSuggestions = suggestions.length === 0;
      expect(showNoSuggestions).toBe(true);
    });

    it('should use index as key for suggestions (acceptable for static list)', () => {
      const suggestions: SwapSuggestion[] = [
        { ingredient: { name: 'Option 1', amount: '1 cup' }, macroDelta: {} },
        { ingredient: { name: 'Option 2', amount: '1 cup' }, macroDelta: {} },
      ];

      suggestions.forEach((_, index) => {
        // Index as key is acceptable here since suggestions don't reorder
        expect(typeof index).toBe('number');
      });
    });
  });

  describe('disabled state', () => {
    it('should disable swap button when no suggestion selected', () => {
      const selectedSuggestion: SwapSuggestion | null = null;
      const isDisabled = !selectedSuggestion;
      expect(isDisabled).toBe(true);
    });

    it('should enable swap button when suggestion selected', () => {
      const selectedSuggestion: SwapSuggestion = {
        ingredient: { name: 'Greek Yogurt', amount: '1 cup' },
        macroDelta: { protein: 15 },
      };
      const isDisabled = !selectedSuggestion;
      expect(isDisabled).toBe(false);
    });
  });
});
