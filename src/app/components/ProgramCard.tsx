'use client';

import React from 'react';
import Link from 'next/link';

export interface ProgramCardProps {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  durationWeeks: number | null;
  daysPerWeek: number | null;
  equipment: string[];
  goals: string[];
  author: string | null;
  cloneCount?: number;
  popularityScore?: number;
  source: 'static' | 'database' | 'user';
  onClaim?: (id: string, source: 'static' | 'database') => void;
  isLoading?: boolean;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const CATEGORY_COLORS: Record<string, string> = {
  strength: 'from-blue-600 to-blue-800',
  hypertrophy: 'from-purple-600 to-purple-800',
  powerlifting: 'from-red-600 to-red-800',
  athletic: 'from-green-600 to-green-800',
  general: 'from-indigo-600 to-indigo-800',
};

export default function ProgramCard({
  id,
  name,
  slug,
  description,
  category,
  difficulty,
  durationWeeks,
  daysPerWeek,
  equipment,
  goals,
  author,
  cloneCount = 0,
  popularityScore = 0,
  source,
  onClaim,
  isLoading = false,
}: ProgramCardProps) {
  const gradientClass = CATEGORY_COLORS[category || 'general'] || CATEGORY_COLORS.general;
  const difficultyClass = DIFFICULTY_COLORS[difficulty || 'beginner'] || DIFFICULTY_COLORS.beginner;

  const handleClaim = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClaim && source !== 'user') {
      onClaim(id, source as 'static' | 'database');
    }
  };

  const CardContent = () => (
    <>
      {/* Header */}
      <div className={`bg-gradient-to-br ${gradientClass} p-5 text-white`}>
        <div className="flex items-start justify-between mb-3">
          {difficulty && (
            <span className={`text-xs px-2 py-1 rounded-full ${difficultyClass}`}>
              {difficulty}
            </span>
          )}
          {category && (
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full capitalize">
              {category}
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold mb-1 line-clamp-1">{name}</h3>
        {description && (
          <p className="text-sm text-white/70 line-clamp-2">{description}</p>
        )}
      </div>

      {/* Stats */}
      <div className="p-5">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {daysPerWeek && (
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {daysPerWeek}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Days/Week</div>
            </div>
          )}
          {durationWeeks && (
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {durationWeeks}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Weeks</div>
            </div>
          )}
          {cloneCount > 0 && (
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {cloneCount}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Users</div>
            </div>
          )}
        </div>

        {/* Goals */}
        {goals.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {goals.slice(0, 2).map((goal) => (
              <span
                key={goal}
                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded"
              >
                {goal}
              </span>
            ))}
            {goals.length > 2 && (
              <span className="text-xs text-gray-400 px-1">
                +{goals.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Equipment preview */}
        {equipment.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {equipment.slice(0, 3).map((eq) => (
              <span
                key={eq}
                className="text-xs bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-500 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700"
              >
                {eq}
              </span>
            ))}
            {equipment.length > 3 && (
              <span className="text-xs text-gray-400 px-1">
                +{equipment.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Author & CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          {author && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              by {author}
            </span>
          )}
          {source === 'user' ? (
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              Your Program →
            </span>
          ) : (
            <button
              onClick={handleClaim}
              disabled={isLoading}
              className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Claiming...' : 'Claim Program'}
            </button>
          )}
        </div>
      </div>
    </>
  );

  if (source === 'user') {
    return (
      <Link
        href={`/dashboard/${id}`}
        className="block bg-white dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all border-2 border-indigo-200 dark:border-indigo-800"
      >
        <CardContent />
      </Link>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all">
      <Link href={`/templates/${slug}`}>
        <div className={`bg-gradient-to-br ${gradientClass} p-5 text-white`}>
          <div className="flex items-start justify-between mb-3">
            {difficulty && (
              <span className={`text-xs px-2 py-1 rounded-full ${difficultyClass}`}>
                {difficulty}
              </span>
            )}
            {category && (
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full capitalize">
                {category}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold mb-1 line-clamp-1">{name}</h3>
          {description && (
            <p className="text-sm text-white/70 line-clamp-2">{description}</p>
          )}
        </div>
      </Link>

      {/* Stats */}
      <div className="p-5">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {daysPerWeek && (
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {daysPerWeek}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Days/Week</div>
            </div>
          )}
          {durationWeeks && (
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {durationWeeks}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Weeks</div>
            </div>
          )}
          {cloneCount > 0 && (
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {cloneCount}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Users</div>
            </div>
          )}
        </div>

        {/* Goals */}
        {goals.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {goals.slice(0, 2).map((goal) => (
              <span
                key={goal}
                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded"
              >
                {goal}
              </span>
            ))}
            {goals.length > 2 && (
              <span className="text-xs text-gray-400 px-1">
                +{goals.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Equipment preview */}
        {equipment.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {equipment.slice(0, 3).map((eq) => (
              <span
                key={eq}
                className="text-xs bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-500 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700"
              >
                {eq}
              </span>
            ))}
            {equipment.length > 3 && (
              <span className="text-xs text-gray-400 px-1">
                +{equipment.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Author & CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          {author ? (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              by {author}
            </span>
          ) : (
            <span />
          )}
          <button
            onClick={handleClaim}
            disabled={isLoading}
            className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Claiming...' : 'Claim Program'}
          </button>
        </div>
      </div>
    </div>
  );
}
