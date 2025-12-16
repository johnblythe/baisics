'use client';

import React, { useState, useEffect } from 'react';

interface SimilarExercise {
  id: string;
  name: string;
  category: string;
  equipment: string[];
  description: string | null;
  difficulty: string;
  movementPattern: string;
  targetMuscles: string[];
  isCompound: boolean;
  videoUrl: string | null;
  score: number;
}

interface ExerciseSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseId: string;
  exerciseName: string;
  onSwap: (newExercise: { id: string; name: string }) => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  ADVANCED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export function ExerciseSwapModal({
  isOpen,
  onClose,
  exerciseId,
  exerciseName,
  onSwap,
}: ExerciseSwapModalProps) {
  const [loading, setLoading] = useState(true);
  const [swapping, setSwapping] = useState<string | null>(null);
  const [exercises, setExercises] = useState<SimilarExercise[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchSimilarExercises() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/exercises/similar?exerciseId=${exerciseId}&exerciseName=${encodeURIComponent(exerciseName)}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch similar exercises');
        }

        setExercises(data.exercises || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchSimilarExercises();
  }, [isOpen, exerciseId, exerciseName]);

  const handleSwap = async (newExercise: SimilarExercise) => {
    setSwapping(newExercise.id);

    try {
      const response = await fetch('/api/exercises/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId,
          newExerciseLibraryId: newExercise.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to swap exercise');
      }

      onSwap({ id: newExercise.id, name: newExercise.name });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to swap');
    } finally {
      setSwapping(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Swap Exercise
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Replace <span className="font-medium">{exerciseName}</span> with a similar exercise
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-t-2 border-[#FF6B6B] border-solid rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 dark:text-red-400">{error}</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Close
                </button>
              </div>
            ) : exercises.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
                  No similar exercises found
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm">
                  We couldn&apos;t find any alternatives in the exercise library
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="group relative p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#FF6B6B]/50 dark:hover:border-[#FF6B6B] hover:bg-[#FFE5E5]/50 dark:hover:bg-[#FF6B6B]/20 transition-all cursor-pointer"
                    onClick={() => handleSwap(exercise)}
                  >
                    {swapping === exercise.id && (
                      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 rounded-xl flex items-center justify-center z-10">
                        <div className="w-6 h-6 border-t-2 border-[#FF6B6B] border-solid rounded-full animate-spin" />
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-[#FF6B6B] dark:group-hover:text-[#FF6B6B]">
                            {exercise.name}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[exercise.difficulty] || DIFFICULTY_COLORS.BEGINNER}`}>
                            {exercise.difficulty.toLowerCase()}
                          </span>
                        </div>

                        {exercise.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {exercise.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                            {exercise.movementPattern.replace('_', ' ').toLowerCase()}
                          </span>
                          {exercise.targetMuscles.slice(0, 3).map((muscle) => (
                            <span
                              key={muscle}
                              className="px-2 py-1 bg-[#FFE5E5] dark:bg-[#FF6B6B]/30 text-[#FF6B6B] dark:text-[#FF6B6B] rounded"
                            >
                              {muscle.replace('_', ' ').toLowerCase()}
                            </span>
                          ))}
                          {exercise.equipment.length > 0 && (
                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded">
                              {exercise.equipment[0]}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-gray-400 group-hover:text-[#FF6B6B] dark:group-hover:text-[#FF6B6B] transition-transform group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExerciseSwapModal;
