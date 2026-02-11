'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UnifiedFoodResult, FoodSearchSource } from '@/lib/food-search/types';
import { getRecentFoods, addRecentFood } from '@/lib/foods/recentFoods';
import { AIEstimateModal } from './AIEstimateModal';

/** Log selection to analytics endpoint */
async function logSearchSelection(
  searchId: string,
  food: UnifiedFoodResult,
  searchDurationMs: number
): Promise<void> {
  try {
    await fetch('/api/foods/search/log-selection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        searchId,
        selectedFdcId: food.id,
        selectedName: food.name,
        source: food.source,
        searchDurationMs,
      }),
    });
  } catch (error) {
    // Non-critical, don't block user
    console.error('Failed to log search selection:', error);
  }
}

/** Log abandon to analytics endpoint */
async function logSearchAbandon(
  searchId: string,
  searchDurationMs: number
): Promise<void> {
  try {
    await fetch('/api/foods/search/log-abandon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        searchId,
        searchDurationMs,
      }),
    });
  } catch (error) {
    // Non-critical, don't block user
    console.error('Failed to log search abandon:', error);
  }
}

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

/** Source badge configuration */
const SOURCE_BADGES: Record<FoodSearchSource, { label: string; color: string; bgColor: string }> = {
  QUICK_FOOD: { label: 'Your Foods', color: '#059669', bgColor: '#D1FAE5' },
  USDA: { label: 'USDA', color: '#1D4ED8', bgColor: '#DBEAFE' },
  OPEN_FOOD_FACTS: { label: 'Community', color: '#7C3AED', bgColor: '#EDE9FE' },
  AI_ESTIMATED: { label: '≈ Estimate', color: '#DC2626', bgColor: '#FEE2E2' },
};

export interface FoodSearchAutocompleteProps {
  onSelect: (food: UnifiedFoodResult) => void;
  placeholder?: string;
  className?: string;
  /** User ID for scoping recent foods. Falls back to 'anonymous' if not provided */
  userId?: string;
}

export function FoodSearchAutocomplete({
  onSelect,
  placeholder = 'Search foods...',
  className = '',
  userId = 'anonymous',
}: FoodSearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [foods, setFoods] = useState<UnifiedFoodResult[]>([]);
  const [recentFoods, setRecentFoods] = useState<UnifiedFoodResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [showingRecent, setShowingRecent] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [searchComplete, setSearchComplete] = useState(false);

  // Search analytics tracking
  const [searchId, setSearchId] = useState<string | null>(null);
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null);
  const abandonTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load recent foods on mount and when userId changes
  useEffect(() => {
    setRecentFoods(getRecentFoods(userId));
  }, [userId]);

  // Cleanup abandon timeout on component unmount
  useEffect(() => {
    return () => {
      if (abandonTimeoutRef.current) {
        clearTimeout(abandonTimeoutRef.current);
      }
    };
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setFoods([]);
      setShowingRecent(false);
      setSearchComplete(false);
      // Reset search tracking when query is cleared
      setSearchId(null);
      setSearchStartTime(null);
      // Don't close dropdown here - let onFocus handle showing recents
      return;
    }

    // Track search start time from first keystroke that triggers search
    if (searchStartTime === null) {
      setSearchStartTime(Date.now());
    }

    setShowingRecent(false);
    setSearchComplete(false);
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/foods/search?q=${encodeURIComponent(query)}&limit=10`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Search failed');
        }
        const data = await res.json();
        setFoods(data.foods || []);
        setIsOpen(true);
        setHighlightedIndex(-1);
        setSearchComplete(true);
        // Capture searchId for analytics tracking
        if (data.searchId) {
          setSearchId(data.searchId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setFoods([]);
        setSearchComplete(true);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query, searchStartTime]);

  // Close dropdown when clicking outside
  // Using 'click' instead of 'mousedown' to avoid closing during scroll gestures
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Log abandon when search is closed without selection (debounced)
  useEffect(() => {
    // Only log abandon when dropdown closes and we have a valid search session
    if (!isOpen && searchId && searchStartTime && !showingRecent) {
      // Clear any existing timeout
      if (abandonTimeoutRef.current) {
        clearTimeout(abandonTimeoutRef.current);
      }

      // Debounce the abandon log - wait 1 second to see if user is just refining
      abandonTimeoutRef.current = setTimeout(() => {
        const duration = Date.now() - searchStartTime;
        logSearchAbandon(searchId, duration);
        // Reset search tracking after logging abandon
        setSearchId(null);
        setSearchStartTime(null);
      }, 1000);
    }

    // Cleanup timeout on unmount or when deps change
    return () => {
      if (abandonTimeoutRef.current) {
        clearTimeout(abandonTimeoutRef.current);
      }
    };
  }, [isOpen, searchId, searchStartTime, showingRecent]);

  // Handle food selection
  const handleSelect = useCallback(
    (food: UnifiedFoodResult) => {
      // Cancel any pending abandon timeout
      if (abandonTimeoutRef.current) {
        clearTimeout(abandonTimeoutRef.current);
        abandonTimeoutRef.current = null;
      }

      // Log selection to analytics (non-blocking)
      if (searchId && searchStartTime) {
        const duration = Date.now() - searchStartTime;
        logSearchSelection(searchId, food, duration);
      }

      // Add to recent foods cache
      addRecentFood(userId, food);
      // Update local recent foods state
      setRecentFoods(getRecentFoods(userId));

      onSelect(food);
      setQuery('');
      setFoods([]);
      setIsOpen(false);
      setHighlightedIndex(-1);
      setShowingRecent(false);
      setSearchComplete(false);
      // Reset search tracking
      setSearchId(null);
      setSearchStartTime(null);
    },
    [onSelect, userId, searchId, searchStartTime]
  );

  // Handle AI estimated food selection
  const handleAIFoodSelect = useCallback(
    (food: UnifiedFoodResult) => {
      // Close the modal first
      setShowAIModal(false);
      // Then handle like a normal selection
      handleSelect(food);
    },
    [handleSelect]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;

      const list = showingRecent ? recentFoods : foods;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < list.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < list.length) {
            handleSelect(list[highlightedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setShowingRecent(false);
          inputRef.current?.blur();
          break;
      }
    },
    [isOpen, foods, recentFoods, showingRecent, highlightedIndex, handleSelect]
  );

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      // Offset by 1 when showing recent foods due to header element
      const offset = showingRecent && recentFoods.length > 0 ? 1 : 0;
      const item = listRef.current.children[highlightedIndex + offset] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, showingRecent, recentFoods.length]);

  const formatMacros = (food: UnifiedFoodResult) => {
    return `${food.calories} cal | ${food.protein}g P | ${food.carbs}g C | ${food.fat}g F`;
  };

  // Render source badge with optional star icon for user's foods
  const renderSourceBadge = (source: FoodSearchSource) => {
    const badge = SOURCE_BADGES[source];
    const isUserFood = source === 'QUICK_FOOD';

    return (
      <span
        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
        style={{ backgroundColor: badge.bgColor, color: badge.color }}
      >
        {isUserFood && (
          <svg
            className="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
        {badge.label}
      </span>
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input with search icon */}
      <div className="relative">
        <input
          ref={inputRef}
          id="food-search"
          type="text"
          role="combobox"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.length >= 2 && foods.length > 0) {
              setIsOpen(true);
            } else if (query.length < 2 && recentFoods.length > 0) {
              // Show recent foods when input is empty/short
              setShowingRecent(true);
              setIsOpen(true);
              setHighlightedIndex(-1);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-3 pl-10 rounded-xl border-2 text-sm transition-colors outline-none"
          style={{
            borderColor: isOpen ? COLORS.coral : COLORS.gray100,
            backgroundColor: COLORS.white,
            color: COLORS.navy,
          }}
          aria-label="Search foods"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="food-search-results"
          aria-haspopup="listbox"
        />
        {/* Search icon */}
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
          style={{ color: COLORS.gray400 }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {/* Loading spinner */}
        {loading && (
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 border-2 rounded-full animate-spin"
            style={{
              borderColor: COLORS.gray100,
              borderTopColor: COLORS.coral,
            }}
          />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <ul
          ref={listRef}
          id="food-search-results"
          role="listbox"
          className="absolute z-50 w-full mt-2 max-h-72 overflow-y-auto rounded-xl border shadow-lg"
          style={{
            backgroundColor: COLORS.white,
            borderColor: COLORS.gray100,
          }}
        >
          {/* Recent foods header */}
          {showingRecent && recentFoods.length > 0 && (
            <li
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wide border-b"
              style={{
                backgroundColor: COLORS.gray50,
                color: COLORS.gray600,
                borderColor: COLORS.gray100,
              }}
            >
              Recent
            </li>
          )}
          {error ? (
            <li className="px-4 py-3 text-sm" style={{ color: COLORS.coral }}>
              <div>{error}</div>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  // Re-trigger search by updating query with same value
                  // This works because the useEffect depends on query
                  const currentQuery = query;
                  setQuery('');
                  // Use setTimeout to ensure state update completes before re-setting
                  setTimeout(() => setQuery(currentQuery), 0);
                }}
                className="mt-2 text-xs underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-1 rounded"
                style={{ color: COLORS.coral }}
              >
                Try again
              </button>
            </li>
          ) : showingRecent ? (
            recentFoods.length === 0 ? (
              <li className="px-4 py-3 text-sm" style={{ color: COLORS.gray400 }}>
                No recent foods
              </li>
            ) : (
              recentFoods.map((food, index) => (
                <li
                  key={food.id}
                  role="option"
                  aria-selected={highlightedIndex === index}
                  className="px-4 py-3 cursor-pointer transition-colors border-b last:border-b-0"
                  style={{
                    backgroundColor:
                      highlightedIndex === index ? COLORS.coralLight : COLORS.white,
                    borderColor: COLORS.gray100,
                  }}
                  onClick={() => handleSelect(food)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="font-medium text-sm"
                        style={{ color: COLORS.navy }}
                      >
                        {food.name}
                      </span>
                      {food.brand && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: COLORS.gray100,
                            color: COLORS.gray600,
                          }}
                        >
                          {food.brand}
                        </span>
                      )}
                      {food.source && renderSourceBadge(food.source)}
                    </div>
                    <span className="text-xs" style={{ color: COLORS.gray400 }}>
                      per 100g: {formatMacros(food)}
                    </span>
                  </div>
                </li>
              ))
            )
          ) : foods.length === 0 && searchComplete ? (
            <li className="px-4 py-3 text-sm" style={{ color: COLORS.gray400 }}>
              No foods found for &quot;{query}&quot;
            </li>
          ) : foods.length === 0 && loading ? (
            <li className="px-4 py-3 text-sm" style={{ color: COLORS.gray400 }}>
              Searching food databases...
            </li>
          ) : (
            foods.map((food, index) => (
              <li
                key={food.id}
                role="option"
                aria-selected={highlightedIndex === index}
                className="px-4 py-3 cursor-pointer transition-colors border-b last:border-b-0"
                style={{
                  backgroundColor:
                    highlightedIndex === index ? COLORS.coralLight : COLORS.white,
                  borderColor: COLORS.gray100,
                }}
                onClick={() => handleSelect(food)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="font-medium text-sm"
                      style={{ color: COLORS.navy }}
                    >
                      {food.name}
                    </span>
                    {food.brand && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: COLORS.gray100,
                          color: COLORS.gray600,
                        }}
                      >
                        {food.brand}
                      </span>
                    )}
                    {food.source && renderSourceBadge(food.source)}
                  </div>
                  <span className="text-xs" style={{ color: COLORS.gray400 }}>
                    per 100g: {formatMacros(food)}
                  </span>
                </div>
              </li>
            ))
          )}

          {/* AI Estimate button - shows after search completes or when <3 results */}
          {!showingRecent && searchComplete && (foods.length < 3 || foods.length === 0) && (
            <li
              className="px-4 py-3 border-t cursor-pointer transition-colors hover:bg-gray-50"
              style={{ borderColor: COLORS.gray100, backgroundColor: COLORS.gray50 }}
              onClick={() => {
                setShowAIModal(true);
                setIsOpen(false);
              }}
            >
              <div className="flex items-center gap-2 text-sm" style={{ color: COLORS.coral }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="font-medium">Can&apos;t find it? Estimate with AI</span>
              </div>
              <p className="text-xs mt-1" style={{ color: COLORS.gray400 }}>
                Describe your food naturally and get macro estimates
              </p>
            </li>
          )}
        </ul>
      )}

      {/* AI Estimate Modal */}
      <AIEstimateModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onAddFood={handleAIFoodSelect}
        initialDescription={query}
      />
    </div>
  );
}

export default FoodSearchAutocomplete;
