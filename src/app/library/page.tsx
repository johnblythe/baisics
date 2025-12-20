'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProgramCard, { ProgramCardProps } from '@/app/components/ProgramCard';
import { UpgradeModal } from '@/components/UpgradeModal';

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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [currentProgramName, setCurrentProgramName] = useState<string | undefined>(undefined);

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
        // Handle upgrade required error
        if (data.error === 'upgrade_required') {
          setCurrentProgramName(data.currentProgram?.name);
          setShowUpgradeModal(true);
          setClaimingId(null);
          return;
        }
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
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

        .library-page {
          --color-white: #FFFFFF;
          --color-gray-50: #F8FAFC;
          --color-gray-100: #F1F5F9;
          --color-gray-400: #94A3B8;
          --color-gray-600: #475569;
          --color-navy: #0F172A;
          --color-navy-light: #1E293B;
          --color-coral: #FF6B6B;
          --color-coral-dark: #EF5350;
          --color-coral-light: #FFE5E5;

          font-family: 'Outfit', sans-serif;
        }

        .font-mono {
          font-family: 'Space Mono', monospace;
        }
      `}</style>

      <div className="library-page min-h-screen bg-[var(--color-white)]">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[var(--color-white)]/95 backdrop-blur-md border-b border-[var(--color-gray-100)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[var(--color-coral)] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <span className="font-bold text-xl text-[var(--color-navy)]">baisics</span>
              </Link>

              <nav className="hidden md:flex items-center gap-8">
                <Link href="/library" className="text-sm font-medium text-[var(--color-coral)]">Library</Link>
                <Link href="/tools/macros" className="text-sm font-medium text-[var(--color-gray-600)] hover:text-[var(--color-navy)] transition-colors">Macro Calculator</Link>
                <Link href="/blog" className="text-sm font-medium text-[var(--color-gray-600)] hover:text-[var(--color-navy)] transition-colors">Blog</Link>
              </nav>

              <Link
                href="/hi"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[var(--color-navy)] rounded-lg hover:bg-[var(--color-navy-light)] transition-all"
              >
                Create Program
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <p className="font-mono text-sm text-[var(--color-coral)] uppercase tracking-wider mb-2">Browse & Claim</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-[var(--color-navy)] mb-2">
              Program Library
            </h1>
            <p className="text-[var(--color-gray-600)] max-w-2xl">
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
                      ? 'bg-[var(--color-navy)] text-white'
                      : 'bg-[var(--color-gray-50)] text-[var(--color-gray-600)] hover:bg-[var(--color-gray-100)]'
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
                  className="w-full px-4 py-2 pl-10 rounded-lg border border-[var(--color-gray-100)] bg-white text-[var(--color-navy)] focus:ring-2 focus:ring-[var(--color-coral)]/20 focus:border-[var(--color-coral)] outline-none transition-all"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-gray-400)]"
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
          <div className="flex flex-wrap gap-3 mb-8 p-4 bg-[var(--color-gray-50)] rounded-xl">
            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--color-gray-100)] bg-white text-[var(--color-navy)] text-sm focus:ring-2 focus:ring-[var(--color-coral)]/20 focus:border-[var(--color-coral)] outline-none"
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
              className="px-3 py-2 rounded-lg border border-[var(--color-gray-100)] bg-white text-[var(--color-navy)] text-sm focus:ring-2 focus:ring-[var(--color-coral)]/20 focus:border-[var(--color-coral)] outline-none"
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
              className="px-3 py-2 rounded-lg border border-[var(--color-gray-100)] bg-white text-[var(--color-navy)] text-sm focus:ring-2 focus:ring-[var(--color-coral)]/20 focus:border-[var(--color-coral)] outline-none"
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
                className="px-3 py-2 text-sm text-[var(--color-gray-600)] hover:text-[var(--color-navy)]"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-[var(--color-coral-light)] border border-[var(--color-coral)]/30 rounded-lg text-[var(--color-coral-dark)]">
              {error}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl overflow-hidden animate-pulse border border-[var(--color-gray-100)]"
                >
                  <div className="h-32 bg-[var(--color-gray-100)]" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-[var(--color-gray-100)] rounded w-3/4" />
                    <div className="h-4 bg-[var(--color-gray-100)] rounded w-1/2" />
                    <div className="h-8 bg-[var(--color-gray-100)] rounded" />
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
                  <div className="text-[var(--color-gray-400)] mb-4">
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
                  <h3 className="text-lg font-medium text-[var(--color-navy)] mb-2">
                    No programs found
                  </h3>
                  <p className="text-[var(--color-gray-600)] mb-6">
                    {activeTab === 'my-programs'
                      ? "You haven't claimed any programs yet. Browse templates to get started!"
                      : 'Try adjusting your filters or search terms.'}
                  </p>
                  {activeTab === 'my-programs' && (
                    <button
                      onClick={() => setActiveTab('templates')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-coral)] text-white rounded-lg hover:bg-[var(--color-coral-dark)] transition-colors font-medium"
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
          <div className="mt-12 bg-[var(--color-navy)] rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">Need something custom?</h2>
            <p className="text-white/70 mb-6 max-w-xl mx-auto">
              Our AI can create a completely personalized program based on your goals, schedule,
              and equipment.
            </p>
            <Link
              href="/hi"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-coral)] text-white rounded-lg font-bold hover:bg-[var(--color-coral-dark)] transition-colors"
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

        {/* Footer */}
        <footer className="py-12 px-6 lg:px-8 border-t border-[var(--color-gray-100)]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[var(--color-coral)] rounded-md"></div>
              <span className="font-bold text-[var(--color-navy)]">baisics</span>
            </div>
            <p className="text-sm text-[var(--color-gray-400)]">&copy; {new Date().getFullYear()} baisics. Made in Indianapolis.</p>
          </div>
        </footer>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        context="program_limit"
        currentProgramName={currentProgramName}
      />
    </>
  );
}
