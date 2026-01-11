'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ShareWorkoutContent() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');

  // Parse and validate the date
  let formattedDate: string | null = null;
  let isValidDate = false;

  if (dateParam) {
    try {
      const date = new Date(dateParam);
      if (!isNaN(date.getTime())) {
        isValidDate = true;
        formattedDate = date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
    } catch {
      // Invalid date format
    }
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');

        .share-workout {
          --color-white: #FFFFFF;
          --color-gray-50: #F8FAFC;
          --color-gray-100: #F1F5F9;
          --color-gray-400: #94A3B8;
          --color-gray-500: #64748B;
          --color-gray-600: #475569;
          --color-navy: #0F172A;
          --color-navy-light: #1E293B;
          --color-coral: #FF6B6B;
          --color-coral-dark: #EF5350;
          --color-coral-light: #FFE5E5;

          font-family: 'Outfit', sans-serif;
          background-color: var(--color-white);
          color: var(--color-navy);
        }

        .font-mono {
          font-family: 'Space Mono', monospace;
        }
      `}</style>

      <div className="share-workout min-h-screen flex flex-col">
        {/* Header with gradient */}
        <header className="bg-gradient-to-r from-[var(--color-coral)] to-[var(--color-coral-dark)] py-8 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-[var(--color-coral)] font-bold text-lg">B</span>
              </div>
              <span className="font-bold text-2xl text-white">baisics</span>
            </Link>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-md w-full text-center">
            {isValidDate && formattedDate ? (
              <>
                {/* Success state - workout completed */}
                <div className="mb-8">
                  <div className="w-20 h-20 bg-[var(--color-coral-light)] rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-[var(--color-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-navy)] mb-4">
                    Workout Completed!
                  </h1>
                  <p className="text-lg text-[var(--color-gray-500)]">
                    Someone crushed their workout on
                  </p>
                  <p className="text-xl font-semibold text-[var(--color-navy)] mt-2 font-mono">
                    {formattedDate}
                  </p>
                </div>

                {/* Motivational message */}
                <div className="bg-[var(--color-gray-50)] rounded-2xl p-6 mb-8 border border-[var(--color-gray-100)]">
                  <p className="text-[var(--color-gray-600)] italic">
                    &quot;Every workout is progress. Every rep counts.&quot;
                  </p>
                </div>

                {/* CTA */}
                <div className="space-y-4">
                  <p className="text-[var(--color-gray-500)]">
                    Want to track your own workouts?
                  </p>
                  <Link
                    href="/hi"
                    className="inline-block px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-[var(--color-coral)] to-[var(--color-coral-dark)] rounded-xl hover:shadow-lg hover:shadow-[var(--color-coral)]/25 transition-all"
                  >
                    Get Your Custom Program
                  </Link>
                  <p className="text-sm text-[var(--color-gray-400)]">
                    Free to start. No credit card required.
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Error state - invalid or missing date */}
                <div className="mb-8">
                  <div className="w-20 h-20 bg-[var(--color-gray-100)] rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-[var(--color-gray-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-navy)] mb-4">
                    Oops! Link Not Found
                  </h1>
                  <p className="text-lg text-[var(--color-gray-500)]">
                    This workout share link appears to be invalid or has expired.
                  </p>
                </div>

                {/* CTA for error state */}
                <div className="space-y-4">
                  <p className="text-[var(--color-gray-500)]">
                    Want to start tracking your own workouts?
                  </p>
                  <Link
                    href="/hi"
                    className="inline-block px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-[var(--color-coral)] to-[var(--color-coral-dark)] rounded-xl hover:shadow-lg hover:shadow-[var(--color-coral)]/25 transition-all"
                  >
                    Create Your Program
                  </Link>
                </div>
              </>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-[var(--color-gray-100)]">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-6 h-6 bg-[var(--color-coral)] rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">B</span>
              </div>
              <span className="font-semibold text-[var(--color-navy)]">baisics</span>
            </div>
            <p className="text-sm text-[var(--color-gray-400)]">
              Workout programs that actually work.
            </p>
            <div className="mt-4 flex items-center justify-center gap-6">
              <Link href="/privacy" className="text-xs text-[var(--color-gray-400)] hover:text-[var(--color-navy)] transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-xs text-[var(--color-gray-400)] hover:text-[var(--color-navy)] transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default function ShareWorkoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#F1F5F9] border-t-[#FF6B6B] rounded-full animate-spin"></div>
        </div>
      }
    >
      <ShareWorkoutContent />
    </Suspense>
  );
}
