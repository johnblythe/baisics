'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, X } from 'lucide-react';

interface LibraryExercise {
  id: string;
  name: string;
  category: string;
  equipment: string[];
  description: string | null;
  difficulty: string;
  movementPattern: string;
  targetMuscles: string[];
  isCompound: boolean;
}

interface ExerciseAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutId: string;
  onAdd: (exercise: any) => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: 'bg-green-100 text-green-700',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-700',
  ADVANCED: 'bg-red-100 text-red-700',
  EXPERT: 'bg-purple-100 text-purple-700',
  OTHER: 'bg-gray-100 text-gray-700',
};

export function ExerciseAddModal({
  isOpen,
  onClose,
  workoutId,
  onAdd,
}: ExerciseAddModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [exercises, setExercises] = useState<LibraryExercise[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customExercise, setCustomExercise] = useState({
    name: '',
    sets: 3,
    reps: 10,
    restPeriod: 60,
  });

  const searchExercises = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (selectedCategory) params.set('category', selectedCategory);

      const response = await fetch(`/api/exercise-library/search?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search exercises');
      }

      setExercises(data.exercises || []);
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    if (!isOpen) return;
    searchExercises();
  }, [isOpen, searchExercises]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      searchExercises();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, isOpen, searchExercises]);

  const handleAddLibraryExercise = async (exercise: LibraryExercise) => {
    setAdding(exercise.id);
    setError(null);

    try {
      const response = await fetch(`/api/workouts/${workoutId}/exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseLibraryId: exercise.id,
          name: exercise.name,
          sets: 3,
          reps: 10,
          restPeriod: 60,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add exercise');
      }

      onAdd(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add exercise');
    } finally {
      setAdding(null);
    }
  };

  const handleAddCustomExercise = async () => {
    if (!customExercise.name.trim()) {
      setError('Please enter an exercise name');
      return;
    }

    setAdding('custom');
    setError(null);

    try {
      const response = await fetch(`/api/workouts/${workoutId}/exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customExercise.name,
          sets: customExercise.sets,
          reps: customExercise.reps,
          restPeriod: customExercise.restPeriod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add exercise');
      }

      onAdd(data);
      onClose();
      setCustomExercise({ name: '', sets: 3, reps: 10, restPeriod: 60 });
      setShowCustomForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add exercise');
    } finally {
      setAdding(null);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setShowCustomForm(false);
    setCustomExercise({ name: '', sets: 3, reps: 10, restPeriod: 60 });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">
                Add Exercise
              </h2>
              <p className="text-sm text-[#64748B] mt-1">
                Search the library or create a custom exercise
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-[#94A3B8] hover:text-[#475569] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#E2E8F0]">
            <button
              onClick={() => setShowCustomForm(false)}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                !showCustomForm
                  ? 'text-[#FF6B6B] border-b-2 border-[#FF6B6B]'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Search Library
            </button>
            <button
              onClick={() => setShowCustomForm(true)}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                showCustomForm
                  ? 'text-[#FF6B6B] border-b-2 border-[#FF6B6B]'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Custom Exercise
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            {showCustomForm ? (
              // Custom Exercise Form
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-1">
                    Exercise Name
                  </label>
                  <input
                    type="text"
                    value={customExercise.name}
                    onChange={(e) => setCustomExercise(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Bulgarian Split Squat"
                    className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:border-[#FF6B6B] focus:outline-none focus:ring-1 focus:ring-[#FF6B6B]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#475569] mb-1">
                      Sets
                    </label>
                    <input
                      type="number"
                      value={customExercise.sets}
                      onChange={(e) => setCustomExercise(prev => ({ ...prev, sets: parseInt(e.target.value) || 1 }))}
                      min="1"
                      className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:border-[#FF6B6B] focus:outline-none focus:ring-1 focus:ring-[#FF6B6B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#475569] mb-1">
                      Reps
                    </label>
                    <input
                      type="number"
                      value={customExercise.reps}
                      onChange={(e) => setCustomExercise(prev => ({ ...prev, reps: parseInt(e.target.value) || 1 }))}
                      min="1"
                      className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:border-[#FF6B6B] focus:outline-none focus:ring-1 focus:ring-[#FF6B6B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#475569] mb-1">
                      Rest (sec)
                    </label>
                    <input
                      type="number"
                      value={customExercise.restPeriod}
                      onChange={(e) => setCustomExercise(prev => ({ ...prev, restPeriod: parseInt(e.target.value) || 0 }))}
                      min="0"
                      step="15"
                      className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:border-[#FF6B6B] focus:outline-none focus:ring-1 focus:ring-[#FF6B6B]"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddCustomExercise}
                  disabled={adding === 'custom' || !customExercise.name.trim()}
                  className="w-full px-6 py-3 bg-[#FF6B6B] text-white font-medium rounded-lg hover:bg-[#EF5350] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {adding === 'custom' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Custom Exercise
                    </>
                  )}
                </button>
              </div>
            ) : (
              // Library Search
              <>
                {/* Search Input */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search exercises..."
                      className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-lg focus:border-[#FF6B6B] focus:outline-none focus:ring-1 focus:ring-[#FF6B6B]"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                {categories.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        !selectedCategory
                          ? 'bg-[#FF6B6B] text-white'
                          : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
                      }`}
                    >
                      All
                    </button>
                    {categories.slice(0, 8).map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          selectedCategory === category
                            ? 'bg-[#FF6B6B] text-white'
                            : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}

                {/* Results */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-[#F1F5F9] border-t-[#FF6B6B] rounded-full animate-spin" />
                  </div>
                ) : exercises.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[#64748B]">
                      {searchQuery ? 'No exercises found' : 'Start typing to search exercises'}
                    </p>
                    <button
                      onClick={() => setShowCustomForm(true)}
                      className="mt-4 text-[#FF6B6B] hover:text-[#EF5350] text-sm"
                    >
                      Or create a custom exercise
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {exercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="group relative p-4 rounded-xl border border-[#E2E8F0] hover:border-[#FF6B6B]/50 hover:bg-[#FFF5F5] transition-all cursor-pointer"
                        onClick={() => handleAddLibraryExercise(exercise)}
                      >
                        {adding === exercise.id && (
                          <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center z-10">
                            <div className="w-6 h-6 border-2 border-[#F1F5F9] border-t-[#FF6B6B] rounded-full animate-spin" />
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-[#0F172A] group-hover:text-[#FF6B6B]">
                                {exercise.name}
                              </h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[exercise.difficulty] || DIFFICULTY_COLORS.OTHER}`}>
                                {exercise.difficulty.toLowerCase()}
                              </span>
                            </div>

                            {exercise.description && (
                              <p className="text-sm text-[#64748B] mb-2 line-clamp-1">
                                {exercise.description}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-1.5 text-xs">
                              <span className="px-2 py-0.5 bg-[#F1F5F9] text-[#475569] rounded">
                                {exercise.category}
                              </span>
                              {exercise.targetMuscles.slice(0, 2).map((muscle) => (
                                <span
                                  key={muscle}
                                  className="px-2 py-0.5 bg-[#FFE5E5] text-[#FF6B6B] rounded"
                                >
                                  {muscle.replace(/_/g, ' ').toLowerCase()}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            <Plus className="w-5 h-5 text-[#94A3B8] group-hover:text-[#FF6B6B]" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExerciseAddModal;
