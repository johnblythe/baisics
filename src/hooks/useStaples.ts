import { useState, useEffect, useCallback } from 'react';
import { MealType } from '@prisma/client';
import { formatDateForAPI } from '@/lib/date-utils';
import { toast } from 'sonner';

export interface FoodStaple {
  id: string;
  userId: string;
  mealSlot: MealType;
  name: string;
  emoji: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  recipeId: string | null;
  quickFoodId: string | null;
  items: unknown[] | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaplePayload {
  mealSlot: MealType;
  name: string;
  emoji?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  recipeId?: string;
  quickFoodId?: string;
  items?: unknown[];
}

export interface UseStaplesReturn {
  staples: Record<MealType, FoodStaple[]>;
  dismissedSlots: Set<MealType>;
  isLoading: boolean;
  fetchStaples: () => Promise<void>;
  confirmStaple: (staple: FoodStaple, date: Date) => Promise<void>;
  dismissSlot: (mealSlot: MealType) => void;
  deleteStaple: (stapleId: string) => Promise<void>;
  createStaple: (data: CreateStaplePayload) => Promise<FoodStaple | null>;
}

const DISMISS_STORAGE_KEY = 'baisics_staple_dismissals';
const DISMISS_TTL_DAYS = 7;

function getDismissKey(mealSlot: MealType, date: string): string {
  return `${date}:${mealSlot}`;
}

function loadDismissals(): Map<string, number> {
  try {
    const raw = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (!raw) return new Map();
    const parsed: Record<string, number> = JSON.parse(raw);
    return new Map(Object.entries(parsed));
  } catch {
    return new Map();
  }
}

function saveDismissals(dismissals: Map<string, number>) {
  const obj = Object.fromEntries(dismissals);
  localStorage.setItem(DISMISS_STORAGE_KEY, JSON.stringify(obj));
}

function cleanupOldDismissals(dismissals: Map<string, number>): Map<string, number> {
  const cutoff = Date.now() - DISMISS_TTL_DAYS * 24 * 60 * 60 * 1000;
  const cleaned = new Map<string, number>();
  for (const [key, timestamp] of dismissals) {
    if (timestamp > cutoff) {
      cleaned.set(key, timestamp);
    }
  }
  return cleaned;
}

function groupByMealSlot(staples: FoodStaple[]): Record<MealType, FoodStaple[]> {
  const grouped: Record<MealType, FoodStaple[]> = {
    BREAKFAST: [],
    LUNCH: [],
    DINNER: [],
    SNACK: [],
  };
  for (const s of staples) {
    grouped[s.mealSlot].push(s);
  }
  return grouped;
}

export function useStaples(): UseStaplesReturn {
  const [allStaples, setAllStaples] = useState<FoodStaple[]>([]);
  const [dismissedSlots, setDismissedSlots] = useState<Set<MealType>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load dismissals from localStorage on mount + cleanup old entries
  useEffect(() => {
    const dismissals = loadDismissals();
    const cleaned = cleanupOldDismissals(dismissals);
    if (cleaned.size !== dismissals.size) {
      saveDismissals(cleaned);
    }

    const today = formatDateForAPI(new Date());
    const dismissed = new Set<MealType>();
    for (const mealSlot of Object.values(MealType)) {
      const key = getDismissKey(mealSlot as MealType, today);
      if (cleaned.has(key)) {
        dismissed.add(mealSlot as MealType);
      }
    }
    setDismissedSlots(dismissed);
  }, []);

  const fetchStaples = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/food-staples');
      if (!res.ok) throw new Error('Failed to fetch staples');
      const data = await res.json();
      setAllStaples(data.staples);
    } catch (error) {
      console.error('Error fetching staples:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchStaples();
  }, [fetchStaples]);

  const confirmStaple = useCallback(async (staple: FoodStaple, date: Date) => {
    // Fire POST in background — caller handles optimistic UI
    try {
      const res = await fetch('/api/food-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: staple.name,
          calories: staple.calories,
          protein: staple.protein,
          carbs: staple.carbs,
          fat: staple.fat,
          date: formatDateForAPI(date),
          meal: staple.mealSlot,
          source: 'STAPLE',
          stapleId: staple.id,
        }),
      });
      if (!res.ok) {
        throw new Error('Failed to log staple');
      }
      toast.success(`Logged: ${staple.name}`);
    } catch (error) {
      console.error('Error confirming staple:', error);
      toast.error('Failed to log staple');
    }
  }, []);

  const dismissSlot = useCallback((mealSlot: MealType) => {
    const today = formatDateForAPI(new Date());
    const key = getDismissKey(mealSlot, today);
    const dismissals = loadDismissals();
    dismissals.set(key, Date.now());
    saveDismissals(dismissals);
    setDismissedSlots(prev => new Set([...prev, mealSlot]));
  }, []);

  const deleteStaple = useCallback(async (stapleId: string) => {
    // Optimistic remove
    setAllStaples(prev => prev.filter(s => s.id !== stapleId));

    try {
      const res = await fetch(`/api/food-staples/${stapleId}`, { method: 'DELETE' });
      if (!res.ok) {
        // Revert on failure
        await fetchStaples();
        toast.error('Failed to delete staple');
      }
    } catch (error) {
      console.error('Error deleting staple:', error);
      await fetchStaples();
      toast.error('Failed to delete staple');
    }
  }, [fetchStaples]);

  const createStaple = useCallback(async (data: CreateStaplePayload): Promise<FoodStaple | null> => {
    try {
      const res = await fetch('/api/food-staples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to create staple');
        return null;
      }
      const { staple } = await res.json();
      setAllStaples(prev => [...prev, staple]);
      toast.success(`Pinned "${data.name}" as staple`);
      return staple;
    } catch (error) {
      console.error('Error creating staple:', error);
      toast.error('Failed to create staple');
      return null;
    }
  }, []);

  const staples = groupByMealSlot(allStaples);

  return {
    staples,
    dismissedSlots,
    isLoading,
    fetchStaples,
    confirmStaple,
    dismissSlot,
    deleteStaple,
    createStaple,
  };
}
