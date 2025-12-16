'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const WELCOME_STORAGE_KEY = 'claim-welcome-data';

export interface WelcomeData {
  reason: string;
  source: string;
  programId: string;
  programName?: string;
}

// Store welcome data for persistence
export function storeWelcomeData(data: WelcomeData) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(WELCOME_STORAGE_KEY, JSON.stringify(data));
  }
}

// Get stored welcome data
export function getWelcomeData(): WelcomeData | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(WELCOME_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

// Clear welcome data (call on workout start or new program creation)
export function clearWelcomeData() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(WELCOME_STORAGE_KEY);
  }
}

interface ClaimWelcomeBannerProps {
  reason: string;
  source: string;
  programName?: string;
  programId: string;
}

export function ClaimWelcomeBanner({ reason, source, programName, programId }: ClaimWelcomeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if this banner should show (matches current program)
  useEffect(() => {
    const stored = getWelcomeData();
    if (!stored || stored.programId !== programId) {
      setIsDismissed(true);
    }
  }, [programId]);

  if (isDismissed) {
    return null;
  }

  // Format source for display
  const sourceLabel = source === 'macro-calculator'
    ? 'macro calculator'
    : source === 'body-fat-estimator'
      ? 'body fat estimator'
      : 'tool';

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#FFE5E5] to-white rounded-2xl border border-[#FF6B6B]/20 shadow-md mb-8">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B6B]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FF6B6B]/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-[#FF6B6B] flex items-center justify-center shadow-lg shadow-[#FF6B6B]/25">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-sm font-medium text-[#FF6B6B] uppercase tracking-wider mb-1" style={{ fontFamily: "'Space Mono', monospace" }}>
                Welcome! Your program is ready
              </p>
              <h2 className="text-2xl font-bold text-[#0F172A]">
                {programName || 'Your personalized program'}
              </h2>
            </div>

            <p className="text-[#475569] max-w-2xl">
              {reason}
            </p>

            <p className="text-sm text-[#94A3B8]">
              Based on your {sourceLabel} results
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
            <Link
              href="/hi"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#0F172A] font-semibold rounded-xl border-2 border-[#E2E8F0] hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Make Your Own
            </Link>
            <p className="text-xs text-center text-[#94A3B8]">
              Takes ~1 minute
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
