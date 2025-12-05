'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/app/components/layouts/MainLayout';
import { getTemplateBySlug, PROGRAM_TEMPLATES, ProgramTemplate } from '@/data/templates';
import { notFound } from 'next/navigation';

const DIFFICULTY_COLORS: Record<ProgramTemplate['difficulty'], string> = {
  beginner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
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

  const templateData = template; // TypeScript narrowing

  async function handleGenerate() {
    setGenerating(true);

    // Redirect to /hi with template context
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
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Back Link */}
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All Templates
          </Link>

          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-8 text-white mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${DIFFICULTY_COLORS[template.difficulty]}`}
                  >
                    {template.difficulty}
                  </span>
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
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
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Program Goals
                </h2>
                <div className="flex flex-wrap gap-2">
                  {template.goals.map((goal) => (
                    <span
                      key={goal}
                      className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-sm"
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Key Features
                </h2>
                <div className="space-y-3">
                  {template.features.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 text-gray-600 dark:text-gray-400"
                    >
                      <svg
                        className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
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
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Workout Preview
                </h2>
                <div className="space-y-4">
                  {template.workoutPreview.map((workout) => (
                    <div
                      key={workout.day}
                      className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {workout.name}
                        </h3>
                        <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded">
                          {workout.focus}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {workout.exercises.map((ex) => (
                          <span
                            key={ex}
                            className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded"
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
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sticky top-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Start This Program
                </h3>

                <div className="mb-4">
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
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
                        className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                          (customDays === days) ||
                          (customDays === null && days === template.daysPerWeek)
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {days}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
                >
                  {generating ? 'Preparing...' : 'Generate My Program'}
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                  Our AI will customize this template based on your profile
                </p>
              </div>

              {/* Equipment */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Equipment Needed
                </h3>
                <div className="flex flex-wrap gap-2">
                  {template.equipment.map((eq) => (
                    <span
                      key={eq}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              </div>

              {/* Program Structure */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Structure
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Split Type</span>
                    <span className="text-gray-900 dark:text-white">
                      {template.structure.splitType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Phases</span>
                    <span className="text-gray-900 dark:text-white">
                      {template.structure.phases}
                    </span>
                  </div>
                  {template.structure.periodization && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Periodization</span>
                      <span className="text-gray-900 dark:text-white">
                        {template.structure.periodization}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Related Templates */}
          {relatedTemplates.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Similar Programs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedTemplates.map((t) => (
                  <Link
                    key={t.id}
                    href={`/templates/${t.slug}`}
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 hover:shadow-lg transition-shadow"
                  >
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      {t.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {t.description}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <span className="text-xs text-gray-500">{t.daysPerWeek} days/week</span>
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
      </div>
    </MainLayout>
  );
}
