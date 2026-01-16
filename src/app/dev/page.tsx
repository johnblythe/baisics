'use client';

import Link from 'next/link';

const DEV_PAGES = [
  {
    path: '/dev/exercise-cards',
    title: 'Exercise Cards (#103)',
    description: 'Testing exercise card layouts - larger touch targets, visible video/swap buttons',
    status: 'ready',
  },
  {
    path: '/dev/library-cards',
    title: 'Library Cards (#225)',
    description: 'Testing color/contrast improvements for program library cards',
    status: 'ready',
  },
  {
    path: '/dev/workout-tracker',
    title: 'Workout Tracker + Rest Timer',
    description: 'Exercise logging flow, set inputs, rest timer prominence and integration',
    status: 'ready',
  },
  {
    path: '/dev/rest-day',
    title: 'Rest Day UI (#233)',
    description: 'Exploring rest day UX approaches - zen, celebration, active recovery, coaching, gamification, social proof',
    status: 'ready',
  },
];

export default function DevIndexPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] py-12 px-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-[#FF6B6B] animate-pulse" />
            <span className="text-xs text-[#FF6B6B] font-mono uppercase tracking-wider">Dev Mode</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">UI Exploration Pages</h1>
          <p className="text-[#94A3B8]">
            Dummy pages for testing UI/UX changes before implementing in production.
            Each page has multiple design options to compare.
          </p>
        </div>

        <div className="space-y-4">
          {DEV_PAGES.map((page) => (
            <Link
              key={page.path}
              href={page.path}
              className="block p-6 rounded-xl bg-[#1E293B] border border-[#334155] hover:border-[#FF6B6B]/50 hover:bg-[#1E293B]/80 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white group-hover:text-[#FF6B6B] transition-colors mb-1">
                    {page.title}
                  </h2>
                  <p className="text-sm text-[#94A3B8]">{page.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {page.status === 'ready' && (
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                      Ready
                    </span>
                  )}
                  <svg className="w-5 h-5 text-[#475569] group-hover:text-[#FF6B6B] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-xl bg-[#1E293B]/50 border border-dashed border-[#334155]">
          <h3 className="text-sm font-semibold text-[#94A3B8] mb-2">How to use</h3>
          <ol className="text-sm text-[#64748B] space-y-1 list-decimal list-inside">
            <li>Click a page to view design options</li>
            <li>Toggle between options A, B, C, etc.</li>
            <li>Test on mobile and desktop</li>
            <li>Share screenshots/feedback with team</li>
            <li>Once approved, implement in production</li>
          </ol>
        </div>

        <div className="mt-8 text-center">
          <Link href="/dashboard" className="text-sm text-[#64748B] hover:text-[#FF6B6B] transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
