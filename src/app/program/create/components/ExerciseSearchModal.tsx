'use client';

import { useState, useEffect, useRef } from 'react';
import { searchExercises, getExerciseFilterOptions, type ExerciseFilters } from '../actions';

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string[];
  targetMuscles: string[];
}

interface FilterOptions {
  categories: string[];
  equipment: string[];
  muscles: string[];
}

interface ExerciseSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
}

export function ExerciseSearchModal({ isOpen, onClose, onSelect }: ExerciseSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Exercise[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Filter state
  const [filters, setFilters] = useState<ExerciseFilters>({});
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    equipment: [],
    muscles: [],
  });
  const [showFilters, setShowFilters] = useState(false);

  // Load filter options on mount
  useEffect(() => {
    if (isOpen && filterOptions.categories.length === 0) {
      getExerciseFilterOptions()
        .then(setFilterOptions)
        .catch(console.error);
    }
  }, [isOpen, filterOptions.categories.length]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setSearchError(null);
      setFilters({});
      setShowFilters(false);
    }
  }, [isOpen]);

  // Check if search should trigger
  const hasFilters = !!(filters.category || filters.equipment || filters.muscle);
  const shouldSearch = query.length >= 2 || hasFilters;

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!shouldSearch) {
      setResults([]);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    debounceRef.current = setTimeout(async () => {
      try {
        const exercises = await searchExercises(query, filters);
        setResults(exercises);
        setSearchError(null);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
        setSearchError('Search temporarily unavailable. Please try again.');
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, filters, shouldSearch]);

  const clearFilters = () => {
    setFilters({});
  };

  const activeFilterCount = [filters.category, filters.equipment, filters.muscle].filter(Boolean).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0]">
          <h3 className="text-lg font-semibold text-[#0F172A]">Add Exercise</h3>
          <button
            onClick={onClose}
            className="p-1 text-[#94A3B8] hover:text-[#0F172A] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-[#E2E8F0]">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search exercises..."
              className="w-full pl-10 pr-20 py-3 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent text-[#0F172A]"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {isSearching && (
                <div className="w-4 h-4 border-2 border-[#E2E8F0] border-t-[#FF6B6B] rounded-full animate-spin" />
              )}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`p-1.5 rounded transition-colors ${
                  showFilters || activeFilterCount > 0
                    ? 'text-[#FF6B6B] bg-[#FFE5E5]'
                    : 'text-[#94A3B8] hover:text-[#0F172A]'
                }`}
                title="Toggle filters"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] bg-[#FF6B6B] text-white rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Filter Dropdowns */}
          {showFilters && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Filters</span>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs text-[#FF6B6B] hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={filters.category || ''}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
                  className="text-sm px-2 py-1.5 rounded border border-[#E2E8F0] text-[#0F172A] bg-white"
                >
                  <option value="">Category</option>
                  {filterOptions.categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  value={filters.equipment || ''}
                  onChange={(e) => setFilters({ ...filters, equipment: e.target.value || undefined })}
                  className="text-sm px-2 py-1.5 rounded border border-[#E2E8F0] text-[#0F172A] bg-white"
                >
                  <option value="">Equipment</option>
                  {filterOptions.equipment.map((eq) => (
                    <option key={eq} value={eq}>{eq}</option>
                  ))}
                </select>
                <select
                  value={filters.muscle || ''}
                  onChange={(e) => setFilters({ ...filters, muscle: e.target.value || undefined })}
                  className="text-sm px-2 py-1.5 rounded border border-[#E2E8F0] text-[#0F172A] bg-white"
                >
                  <option value="">Muscle</option>
                  {filterOptions.muscles.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-2">
          {searchError ? (
            <p className="text-center text-red-500 py-8">{searchError}</p>
          ) : !shouldSearch ? (
            <p className="text-center text-[#94A3B8] py-8">Type to search or use filters...</p>
          ) : results.length === 0 && !isSearching ? (
            <p className="text-center text-[#94A3B8] py-8">No exercises found</p>
          ) : (
            <div className="space-y-1">
              {results.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => onSelect(exercise)}
                  className="w-full text-left p-3 rounded-lg hover:bg-[#F8FAFC] transition-colors"
                >
                  <p className="font-medium text-[#0F172A]">{exercise.name}</p>
                  <p className="text-sm text-[#64748B]">
                    {exercise.category}
                    {exercise.equipment.length > 0 && ` • ${exercise.equipment.slice(0, 2).join(', ')}`}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
