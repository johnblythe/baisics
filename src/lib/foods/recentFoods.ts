import { SimplifiedFood } from '@/lib/usda/types';

const STORAGE_KEY_PREFIX = 'baisics_recent_foods_';
const MAX_RECENT_FOODS = 10;

/**
 * Get the storage key for a user's recent foods
 * @param userId - User ID (or session ID for anonymous users)
 */
function getStorageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

/**
 * Get recent foods from localStorage
 * @param userId - User ID to scope the recent foods
 * @returns Array of recent SimplifiedFood items (most recent first)
 */
export function getRecentFoods(userId: string): SimplifiedFood[] {
  if (typeof window === 'undefined') return [];

  try {
    const key = getStorageKey(userId);
    const stored = localStorage.getItem(key);
    if (!stored) return [];

    const foods = JSON.parse(stored) as SimplifiedFood[];
    return Array.isArray(foods) ? foods.slice(0, MAX_RECENT_FOODS) : [];
  } catch (error) {
    console.warn('[recentFoods] getRecentFoods failed:', { userId, error: error instanceof Error ? error.message : String(error) });
    return [];
  }
}

/**
 * Add a food to recent foods (deduped by fdcId, most recent first)
 * @param userId - User ID to scope the recent foods
 * @param food - Food to add to recent
 */
export function addRecentFood(userId: string, food: SimplifiedFood): void {
  if (typeof window === 'undefined') return;

  try {
    const key = getStorageKey(userId);
    const existing = getRecentFoods(userId);

    // Remove duplicate if exists (will re-add at front)
    const filtered = existing.filter((f) => f.fdcId !== food.fdcId);

    // Add to front, limit to max
    const updated = [food, ...filtered].slice(0, MAX_RECENT_FOODS);

    localStorage.setItem(key, JSON.stringify(updated));
  } catch (error) {
    console.warn('[recentFoods] addRecentFood failed:', { userId, error: error instanceof Error ? error.message : String(error) });
  }
}

/**
 * Clear recent foods for a user
 * @param userId - User ID to clear recent foods for
 */
export function clearRecentFoods(userId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const key = getStorageKey(userId);
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('[recentFoods] clearRecentFoods failed:', { userId, error: error instanceof Error ? error.message : String(error) });
  }
}
