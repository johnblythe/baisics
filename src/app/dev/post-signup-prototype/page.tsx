'use client';

import { useState } from 'react';

export default function PostSignupPrototype() {
  const [state, setState] = useState<'preview' | 'submitting' | 'success'>('preview');
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    setState('submitting');
    setTimeout(() => setState('success'), 1500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <div className="max-w-md mx-auto pt-8">
        <h1 className="text-sm text-[#94A3B8] uppercase tracking-wider mb-4 text-center">
          #355 - Post-Signup Flow Prototype
        </h1>

        {/* Simulated locked phase section */}
        {state === 'preview' && (
          <div className="bg-white rounded-2xl border-2 border-dashed border-[#E2E8F0] p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#FFE5E5] flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#FF6B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] mb-2">Unlock Phases 2 & 3</h2>
            <p className="text-sm text-[#64748B] mb-6">Get the full program + tracking dashboard</p>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border-2 border-[#E2E8F0] rounded-xl text-center mb-3 focus:outline-none focus:border-[#FF6B6B]"
            />
            <button
              onClick={handleSubmit}
              className="w-full px-6 py-3 bg-[#FF6B6B] text-white font-bold rounded-xl hover:bg-[#EF5350] transition-all"
            >
              Unlock Full Program
            </button>
          </div>
        )}

        {/* Submitting state */}
        {state === 'submitting' && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center">
            <div className="w-16 h-16 rounded-full border-4 border-[#F1F5F9] border-t-[#FF6B6B] animate-spin mx-auto mb-4" />
            <p className="text-[#64748B]">Setting up your account...</p>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            SUCCESS STATE - This is what we're designing
            ═══════════════════════════════════════════════════════════════════ */}
        {state === 'success' && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl overflow-hidden">
            {/* Confetti header */}
            <div className="bg-gradient-to-br from-[#FF6B6B] to-[#EF5350] p-6 text-center relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-2 left-4 w-3 h-3 rounded-full bg-white/20" />
              <div className="absolute top-8 left-12 w-2 h-2 rounded-full bg-white/30" />
              <div className="absolute top-4 right-8 w-4 h-4 rounded-full bg-white/20" />
              <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-white/30" />
              <div className="absolute bottom-6 left-8 w-3 h-3 rounded-full bg-white/20" />

              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-3 shadow-lg">
                <svg className="w-8 h-8 text-[#FF6B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">You're In!</h2>
              <p className="text-white/80 text-sm">Your full program is now unlocked</p>
            </div>

            {/* What's next section */}
            <div className="p-6">
              <h3 className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold mb-4">
                Here's what you can do now
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
                  <div className="w-10 h-10 rounded-lg bg-[#0F172A] flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-[#0F172A]">View all 3 phases</p>
                    <p className="text-sm text-[#64748B]">Your complete 12-week program</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
                  <div className="w-10 h-10 rounded-lg bg-[#0F172A] flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-[#0F172A]">Download PDF</p>
                    <p className="text-sm text-[#64748B]">Take it to the gym offline</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FFE5E5] border border-[#FFD5D5]">
                  <div className="w-10 h-10 rounded-lg bg-[#FF6B6B] flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-[#0F172A]">Track your progress</p>
                    <p className="text-sm text-[#64748B]">Log workouts & see your gains</p>
                  </div>
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-[#FF6B6B] text-white text-xs font-bold">
                    NEW
                  </span>
                </div>
              </div>

              {/* Primary CTA */}
              <button className="w-full px-6 py-4 bg-[#FF6B6B] text-white font-bold rounded-xl hover:bg-[#EF5350] transition-all shadow-lg shadow-[#FF6B6B]/25 mb-3">
                Go to My Dashboard
              </button>

              {/* Secondary option */}
              <button className="w-full px-6 py-3 text-[#64748B] font-medium hover:text-[#0F172A] transition-colors">
                Continue viewing program
              </button>

              {/* Email note */}
              <div className="mt-6 pt-4 border-t border-[#F1F5F9] text-center">
                <p className="text-xs text-[#94A3B8]">
                  We sent a welcome email to <span className="font-medium text-[#475569]">{email || 'you'}</span>
                  <br />with a link to access your program anytime.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Reset button for testing */}
        {state === 'success' && (
          <button
            onClick={() => { setState('preview'); setEmail(''); }}
            className="mt-4 w-full text-sm text-[#94A3B8] hover:text-[#64748B]"
          >
            ↺ Reset prototype
          </button>
        )}
      </div>
    </div>
  );
}
