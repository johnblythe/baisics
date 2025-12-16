'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PROGRAM_TEMPLATES, ProgramTemplate } from '@/data/templates';
import { notFound } from 'next/navigation';

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

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [customDays, setCustomDays] = useState<number | null>(null);

  const template = PROGRAM_TEMPLATES.find((t) => t.slug === params.slug);

  if (!template) {
    return notFound();
  }

  const templateData = template;

  async function handleGenerate() {
    setGenerating(true);

    const templateContext = encodeURIComponent(
      JSON.stringify({
        templateId: templateData.id,
        templateName: templateData.name,
        daysPerWeek: customDays || templateData.daysPerWeek,
        category: templateData.category,
        difficulty: templateData.difficulty,
      })
    );

    router.push(`/hi?template=${templateContext}`);
  }

  const relatedTemplates = PROGRAM_TEMPLATES.filter(
    (t) => t.category === template.category && t.id !== template.id
  ).slice(0, 3);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

        .template-detail {
          font-family: 'Outfit', sans-serif;
        }

        .font-mono {
          font-family: 'Space Mono', monospace;
        }
      `}</style>

      <div className="template-detail min-h-screen" style={{ backgroundColor: COLORS.gray50 }}>
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
                <Link href="/library" className="text-sm font-medium" style={{ color: COLORS.gray600 }}>Library</Link>
                <Link href="/templates" className="text-sm font-medium" style={{ color: COLORS.coral }}>Templates</Link>
              </nav>

              <Link
                href="/hi"
                className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg"
                style={{ backgroundColor: COLORS.navy }}
              >
                Create Program
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Back Link */}
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 mb-6 transition-colors"
            style={{ color: COLORS.gray600 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All Templates
          </Link>

          {/* Header */}
          <div
            className="rounded-2xl p-8 text-white mb-8"
            style={{ background: `linear-gradient(to bottom right, ${COLORS.navy}, ${COLORS.navyLight})` }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${DIFFICULTY_COLORS[template.difficulty]}`}
                  >
                    {template.difficulty}
                  </span>
                  <span
                    className="text-xs px-3 py-1 rounded-full"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                  >
                    {template.structure.splitType}
                  </span>
                </div>
                <h1 className="text-3xl font-bold mb-3">{template.name}</h1>
                <p className="text-white/80 text-lg">{template.description}</p>
                {template.author && (
                  <p className="text-white/60 text-sm mt-2">by {template.author}</p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold">{template.daysPerWeek}</div>
                <div className="text-xs text-white/60">Days/Week</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold">{template.durationWeeks}</div>
                <div className="text-xs text-white/60">Weeks</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold">{template.structure.phases}</div>
                <div className="text-xs text-white/60">Phases</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold">{template.popularityScore}%</div>
                <div className="text-xs text-white/60">Popular</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Goals */}
              <div className="bg-white rounded-xl p-6 border" style={{ borderColor: COLORS.gray100 }}>
                <h2 className="text-lg font-semibold mb-4" style={{ color: COLORS.navy }}>
                  Program Goals
                </h2>
                <div className="flex flex-wrap gap-2">
                  {template.goals.map((goal) => (
                    <span
                      key={goal}
                      className="px-3 py-1.5 rounded-lg text-sm"
                      style={{ backgroundColor: COLORS.coralLight, color: COLORS.coralDark }}
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="bg-white rounded-xl p-6 border" style={{ borderColor: COLORS.gray100 }}>
                <h2 className="text-lg font-semibold mb-4" style={{ color: COLORS.navy }}>
                  Key Features
                </h2>
                <div className="space-y-3">
                  {template.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3" style={{ color: COLORS.gray600 }}>
                      <svg
                        className="w-5 h-5 flex-shrink-0 mt-0.5"
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
              </div>

              {/* Workout Preview */}
              <div className="bg-white rounded-xl p-6 border" style={{ borderColor: COLORS.gray100 }}>
                <h2 className="text-lg font-semibold mb-4" style={{ color: COLORS.navy }}>
                  Workout Preview
                </h2>
                <div className="space-y-4">
                  {template.workoutPreview.map((workout) => (
                    <div
                      key={workout.day}
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: COLORS.gray50 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium" style={{ color: COLORS.navy }}>
                          {workout.name}
                        </h3>
                        <span
                          className="text-xs px-2 py-1 rounded"
                          style={{ backgroundColor: COLORS.coralLight, color: COLORS.coralDark }}
                        >
                          {workout.focus}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {workout.exercises.map((ex) => (
                          <span
                            key={ex}
                            className="text-xs px-2 py-1 rounded bg-white"
                            style={{ color: COLORS.gray600 }}
                          >
                            {ex}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Generate CTA */}
              <div className="bg-white rounded-xl p-6 sticky top-24 border" style={{ borderColor: COLORS.gray100 }}>
                <h3 className="font-semibold mb-4" style={{ color: COLORS.navy }}>
                  Start This Program
                </h3>

                <div className="mb-4">
                  <label className="block text-sm mb-2" style={{ color: COLORS.gray600 }}>
                    Days per week (optional)
                  </label>
                  <div className="flex gap-2">
                    {[3, 4, 5, 6].map((days) => (
                      <button
                        key={days}
                        onClick={() =>
                          setCustomDays(
                            days === template.daysPerWeek
                              ? null
                              : days === customDays
                              ? null
                              : days
                          )
                        }
                        className="flex-1 px-3 py-2 rounded-lg text-sm transition-colors"
                        style={{
                          backgroundColor:
                            (customDays === days) ||
                            (customDays === null && days === template.daysPerWeek)
                              ? COLORS.navy
                              : COLORS.gray100,
                          color:
                            (customDays === days) ||
                            (customDays === null && days === template.daysPerWeek)
                              ? 'white'
                              : COLORS.gray600,
                        }}
                      >
                        {days}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full px-4 py-3 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
                  style={{ backgroundColor: COLORS.coral }}
                >
                  {generating ? 'Preparing...' : 'Generate My Program'}
                </button>

                <p className="text-xs text-center mt-4" style={{ color: COLORS.gray400 }}>
                  Our AI will customize this template based on your profile
                </p>
              </div>

              {/* Equipment */}
              <div className="bg-white rounded-xl p-6 border" style={{ borderColor: COLORS.gray100 }}>
                <h3 className="font-semibold mb-4" style={{ color: COLORS.navy }}>
                  Equipment Needed
                </h3>
                <div className="flex flex-wrap gap-2">
                  {template.equipment.map((eq) => (
                    <span
                      key={eq}
                      className="px-3 py-1.5 rounded-lg text-sm"
                      style={{ backgroundColor: COLORS.gray100, color: COLORS.gray600 }}
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              </div>

              {/* Program Structure */}
              <div className="bg-white rounded-xl p-6 border" style={{ borderColor: COLORS.gray100 }}>
                <h3 className="font-semibold mb-4" style={{ color: COLORS.navy }}>
                  Structure
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: COLORS.gray600 }}>Split Type</span>
                    <span style={{ color: COLORS.navy }}>{template.structure.splitType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: COLORS.gray600 }}>Phases</span>
                    <span style={{ color: COLORS.navy }}>{template.structure.phases}</span>
                  </div>
                  {template.structure.periodization && (
                    <div className="flex justify-between">
                      <span style={{ color: COLORS.gray600 }}>Periodization</span>
                      <span style={{ color: COLORS.navy }}>{template.structure.periodization}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Related Templates */}
          {relatedTemplates.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-6" style={{ color: COLORS.navy }}>
                Similar Programs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedTemplates.map((t) => (
                  <Link
                    key={t.id}
                    href={`/templates/${t.slug}`}
                    className="bg-white rounded-xl p-4 hover:shadow-lg transition-shadow border"
                    style={{ borderColor: COLORS.gray100 }}
                  >
                    <h3 className="font-medium mb-1" style={{ color: COLORS.navy }}>
                      {t.name}
                    </h3>
                    <p className="text-sm line-clamp-2" style={{ color: COLORS.gray600 }}>
                      {t.description}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <span className="text-xs" style={{ color: COLORS.gray400 }}>{t.daysPerWeek} days/week</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[t.difficulty]}`}
                      >
                        {t.difficulty}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="py-12 px-6 lg:px-8 border-t" style={{ borderColor: COLORS.gray100 }}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md" style={{ backgroundColor: COLORS.coral }}></div>
              <span className="font-bold" style={{ color: COLORS.navy }}>baisics</span>
            </div>
            <p className="text-sm" style={{ color: COLORS.gray400 }}>&copy; {new Date().getFullYear()} baisics. Made in Indianapolis.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
