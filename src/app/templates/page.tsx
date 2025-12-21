'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PROGRAM_TEMPLATES, ProgramTemplate } from '@/data/templates';
import Footer from '@/components/Footer';

const CATEGORY_LABELS: Record<ProgramTemplate['category'], string> = {
  strength: 'Strength',
  hypertrophy: 'Hypertrophy',
  powerlifting: 'Powerlifting',
  athletic: 'Athletic',
  general: 'General Fitness',
};

const DIFFICULTY_COLORS: Record<ProgramTemplate['difficulty'], string> = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-red-100 text-red-700',
};

// v2a colors
const COLORS = {
  coral: '#FF6B6B',
  coralDark: '#EF5350',
  coralLight: '#FFE5E5',
  navy: '#0F172A',
  navyLight: '#1E293B',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray400: '#94A3B8',
  gray600: '#475569',
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
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

        .templates-page {
          font-family: 'Outfit', sans-serif;
        }

        .font-mono {
          font-family: 'Space Mono', monospace;
        }
      `}</style>

      <div className="templates-page min-h-screen" style={{ backgroundColor: COLORS.gray50 }}>
        {/* Header */}
        <header
          className="sticky top-0 z-50 backdrop-blur-md border-b"
          style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderColor: COLORS.gray100 }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              <Link href="/" className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: COLORS.coral }}
                >
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <span className="font-bold text-xl" style={{ color: COLORS.navy }}>baisics</span>
              </Link>

              <nav className="hidden md:flex items-center gap-8">
                <Link
                  href="/library"
                  className="text-sm font-medium transition-colors"
                  style={{ color: COLORS.gray600 }}
                >
                  Library
                </Link>
                <Link
                  href="/templates"
                  className="text-sm font-medium"
                  style={{ color: COLORS.coral }}
                >
                  Templates
                </Link>
                <Link
                  href="/blog"
                  className="text-sm font-medium transition-colors"
                  style={{ color: COLORS.gray600 }}
                >
                  Blog
                </Link>
              </nav>

              <Link
                href="/hi"
                className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-all"
                style={{ backgroundColor: COLORS.navy }}
              >
                Create Program
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <p
              className="font-mono text-sm uppercase tracking-wider mb-2"
              style={{ color: COLORS.coral }}
            >
              Browse Templates
            </p>
            <h1
              className="text-4xl font-bold mb-4"
              style={{ color: COLORS.navy }}
            >
              Program Templates
            </h1>
            <p
              className="text-xl max-w-2xl mx-auto"
              style={{ color: COLORS.gray600 }}
            >
              Proven training programs used by millions. Choose a template and customize it
              for your goals.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: filter === 'all' ? COLORS.navy : 'white',
                  color: filter === 'all' ? 'white' : COLORS.gray600,
                }}
              >
                All
              </button>
              {(Object.keys(CATEGORY_LABELS) as ProgramTemplate['category'][]).map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: filter === cat ? COLORS.navy : 'white',
                      color: filter === cat ? 'white' : COLORS.gray600,
                    }}
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
                  className="px-3 py-1.5 rounded-lg text-sm transition-colors"
                  style={{
                    backgroundColor: difficultyFilter === level ? COLORS.navy : 'white',
                    color: difficultyFilter === level ? 'white' : COLORS.gray600,
                  }}
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
                className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all border"
                style={{ borderColor: COLORS.gray100 }}
              >
                {/* Header */}
                <div
                  className="p-6 text-white"
                  style={{ background: `linear-gradient(to bottom right, ${COLORS.navy}, ${COLORS.navyLight})` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${DIFFICULTY_COLORS[template.difficulty]}`}
                    >
                      {template.difficulty}
                    </span>
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                    >
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
                      <div className="text-2xl font-bold" style={{ color: COLORS.navy }}>
                        {template.daysPerWeek}
                      </div>
                      <div className="text-xs" style={{ color: COLORS.gray400 }}>
                        Days/Week
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color: COLORS.navy }}>
                        {template.durationWeeks}
                      </div>
                      <div className="text-xs" style={{ color: COLORS.gray400 }}>
                        Weeks
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color: COLORS.navy }}>
                        {template.structure.phases}
                      </div>
                      <div className="text-xs" style={{ color: COLORS.gray400 }}>
                        Phases
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {template.features.slice(0, 2).map((feature, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm"
                        style={{ color: COLORS.gray600 }}
                      >
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: COLORS.coral }}
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
                        className="text-xs px-2 py-1 rounded"
                        style={{ backgroundColor: COLORS.gray100, color: COLORS.gray600 }}
                      >
                        {eq}
                      </span>
                    ))}
                    {template.equipment.length > 3 && (
                      <span className="text-xs px-2 py-1" style={{ color: COLORS.gray400 }}>
                        +{template.equipment.length - 3} more
                      </span>
                    )}
                  </div>

                  {template.author && (
                    <div
                      className="mt-4 pt-4 border-t text-xs"
                      style={{ borderColor: COLORS.gray100, color: COLORS.gray400 }}
                    >
                      by {template.author}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <p style={{ color: COLORS.gray400 }}>
                No templates match your filters
              </p>
            </div>
          )}

          {/* CTA */}
          <div
            className="mt-12 rounded-2xl p-8 text-center text-white"
            style={{ backgroundColor: COLORS.navy }}
          >
            <h2 className="text-2xl font-bold mb-3">Can&apos;t find what you need?</h2>
            <p className="text-white/70 mb-6 max-w-xl mx-auto">
              Our AI can create a completely custom program based on your goals, schedule,
              and equipment.
            </p>
            <Link
              href="/hi"
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg font-bold transition-colors"
              style={{ backgroundColor: COLORS.coral }}
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
        <Footer />
      </div>
    </>
  );
}
