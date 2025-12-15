'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/app/components/layouts/MainLayout';
import ProgramCard, { ProgramCardProps } from '@/app/components/ProgramCard';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'strength', label: 'Strength' },
  { value: 'hypertrophy', label: 'Hypertrophy' },
  { value: 'powerlifting', label: 'Powerlifting' },
  { value: 'athletic', label: 'Athletic' },
  { value: 'general', label: 'General Fitness' },
];

const DIFFICULTIES = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const DAYS_PER_WEEK = [
  { value: 'all', label: 'Any Days' },
  { value: '3', label: '3 Days' },
  { value: '4', label: '4 Days' },
  { value: '5', label: '5 Days' },
  { value: '6', label: '6 Days' },
];

type ProgramType = Omit<ProgramCardProps, 'onClaim' | 'isLoading'>;

export default function LibraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [templates, setTemplates] = useState<ProgramType[]>([]);
  const [userPrograms, setUserPrograms] = useState<ProgramType[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || 'all');
  const [daysPerWeek, setDaysPerWeek] = useState(searchParams.get('days') || 'all');
  const [activeTab, setActiveTab] = useState<'all' | 'templates' | 'my-programs'>('all');

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch programs
  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (difficulty !== 'all') params.set('difficulty', difficulty);
      if (daysPerWeek !== 'all') params.set('daysPerWeek', daysPerWeek);
      if (debouncedSearch) params.set('search', debouncedSearch);

      const res = await fetch(`/api/programs/library?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch programs');

      const data = await res.json();

      setTemplates(
        (data.templates || []).map((t: any) => ({
          ...t,
          equipment: t.equipment || [],
          goals: t.goals || [],
        }))
      );
      setUserPrograms(
        (data.userPrograms || []).map((p: any) => ({
          ...p,
          source: 'user' as const,
          equipment: p.equipment || [],
          goals: p.goals || [],
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load programs');
    } finally {
      setLoading(false);
    }
  }, [category, difficulty, daysPerWeek, debouncedSearch]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  // Handle claim
  const handleClaim = async (id: string, source: 'static' | 'database') => {
    setClaimingId(id);
    setError(null);

    try {
      const res = await fetch('/api/programs/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId: id, sourceType: source }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to claim program');
      }

      // Redirect to dashboard with new program
      router.push(data.redirectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim program');
      setClaimingId(null);
    }
  };

  // Filter programs based on active tab
  const displayedPrograms = (() => {
    if (activeTab === 'templates') return templates;
    if (activeTab === 'my-programs') return userPrograms;
    // 'all' - show user programs first, then templates
    return [...userPrograms, ...templates];
  })();

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Program Library
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Browse proven training programs or start with your own. Claim any template to customize and track.
            </p>
          </div>

          {/* Tabs & Search */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Tabs */}
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All Programs' },
                { key: 'templates', label: 'Templates' },
                { key: 'my-programs', label: 'My Programs' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab.label}
                  {tab.key === 'my-programs' && userPrograms.length > 0 && (
                    <span className="ml-2 bg-white/20 px-1.5 py-0.5 rounded text-xs">
                      {userPrograms.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1 lg:max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search programs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl">
            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Difficulty */}
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
            >
              {DIFFICULTIES.map((diff) => (
                <option key={diff.value} value={diff.value}>
                  {diff.label}
                </option>
              ))}
            </select>

            {/* Days per week */}
            <select
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
            >
              {DAYS_PER_WEEK.map((days) => (
                <option key={days.value} value={days.value}>
                  {days.label}
                </option>
              ))}
            </select>

            {/* Clear filters */}
            {(category !== 'all' || difficulty !== 'all' || daysPerWeek !== 'all' || search) && (
              <button
                onClick={() => {
                  setCategory('all');
                  setDifficulty('all');
                  setDaysPerWeek('all');
                  setSearch('');
                }}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden animate-pulse"
                >
                  <div className="h-32 bg-gray-200 dark:bg-gray-700" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Programs grid */}
          {!loading && (
            <>
              {displayedPrograms.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 dark:text-gray-500 mb-4">
                    <svg
                      className="w-16 h-16 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No programs found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {activeTab === 'my-programs'
                      ? "You haven't claimed any programs yet. Browse templates to get started!"
                      : 'Try adjusting your filters or search terms.'}
                  </p>
                  {activeTab === 'my-programs' && (
                    <button
                      onClick={() => setActiveTab('templates')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Browse Templates
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedPrograms.map((program) => (
                    <ProgramCard
                      key={`${program.source}-${program.id}`}
                      {...program}
                      onClaim={handleClaim}
                      isLoading={claimingId === program.id}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* CTA for custom program */}
          <div className="mt-12 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">Need something custom?</h2>
            <p className="text-white/80 mb-6 max-w-xl mx-auto">
              Our AI can create a completely personalized program based on your goals, schedule,
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
