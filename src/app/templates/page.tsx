'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/app/components/layouts/MainLayout';
import { PROGRAM_TEMPLATES, ProgramTemplate } from '@/data/templates';

const CATEGORY_LABELS: Record<ProgramTemplate['category'], string> = {
  strength: 'Strength',
  hypertrophy: 'Hypertrophy',
  powerlifting: 'Powerlifting',
  athletic: 'Athletic',
  general: 'General Fitness',
};

const DIFFICULTY_COLORS: Record<ProgramTemplate['difficulty'], string> = {
  beginner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function TemplatesPage() {
  const [filter, setFilter] = useState<ProgramTemplate['category'] | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<
    ProgramTemplate['difficulty'] | 'all'
  >('all');

  const filteredTemplates = PROGRAM_TEMPLATES.filter((t) => {
    if (filter !== 'all' && t.category !== filter) return false;
    if (difficultyFilter !== 'all' && t.difficulty !== difficultyFilter) return false;
    return true;
  }).sort((a, b) => b.popularityScore - a.popularityScore);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Program Templates
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Proven training programs used by millions. Choose a template and customize it
              for your goals.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                All
              </button>
              {(Object.keys(CATEGORY_LABELS) as ProgramTemplate['category'][]).map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === cat
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                )
              )}
            </div>

            <div className="flex gap-2 ml-auto">
              {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficultyFilter(level)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    difficultyFilter === level
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Link
                key={template.id}
                href={`/templates/${template.slug}`}
                className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all"
              >
                {/* Header */}
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 text-white">
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${DIFFICULTY_COLORS[template.difficulty]}`}
                    >
                      {template.difficulty}
                    </span>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      {CATEGORY_LABELS[template.category]}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold mb-2 group-hover:text-white/90">
                    {template.name}
                  </h2>
                  <p className="text-sm text-white/70 line-clamp-2">
                    {template.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {template.daysPerWeek}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Days/Week
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {template.durationWeeks}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Weeks
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {template.structure.phases}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Phases
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {template.features.slice(0, 2).map((feature, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                      >
                        <svg
                          className="w-4 h-4 text-emerald-500 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Equipment */}
                  <div className="flex flex-wrap gap-1">
                    {template.equipment.slice(0, 3).map((eq) => (
                      <span
                        key={eq}
                        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded"
                      >
                        {eq}
                      </span>
                    ))}
                    {template.equipment.length > 3 && (
                      <span className="text-xs text-gray-400 px-2 py-1">
                        +{template.equipment.length - 3} more
                      </span>
                    )}
                  </div>

                  {template.author && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                      by {template.author}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No templates match your filters
              </p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">Can&apos;t find what you need?</h2>
            <p className="text-white/80 mb-6 max-w-xl mx-auto">
              Our AI can create a completely custom program based on your goals, schedule,
              and equipment.
            </p>
            <Link
              href="/hi"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Create Custom Program
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
