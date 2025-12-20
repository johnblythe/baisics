'use client';

import { useState } from 'react';
import { validateEmail } from '@/utils/forms/validation';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: 'program_limit' | 'switch_program' | 'general';
  currentProgramName?: string;
}

const contextMessages = {
  program_limit: {
    title: 'Ready for More?',
    subtitle: 'Free accounts are limited to one active program at a time.',
    cta: 'Complete your current program or upgrade to Pro for unlimited access.',
  },
  switch_program: {
    title: 'Unlock Program Switching',
    subtitle: 'Free accounts can only access their most recent program.',
    cta: 'Upgrade to Pro to switch between programs freely.',
  },
  general: {
    title: 'Upgrade to Pro',
    subtitle: 'Get the most out of your fitness journey.',
    cta: 'Unlock all premium features today.',
  },
};

export function UpgradeModal({ isOpen, onClose, context, currentProgramName }: UpgradeModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const messages = contextMessages[context];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: `upgrade_modal_${context}`,
          status: 'active',
        }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Error joining waitlist:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{messages.title}</h2>
              <p className="text-white/80 mt-1">{messages.subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentProgramName && context === 'program_limit' && (
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 mb-6">
              <p className="text-sm text-[#64748B]">Current program:</p>
              <p className="font-semibold text-[#0F172A]">{currentProgramName}</p>
            </div>
          )}

          <p className="text-[#475569] mb-6">{messages.cta}</p>

          {/* Pro Features */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FFE5E5] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[#FF6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-[#0F172A]">Unlimited active programs</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FFE5E5] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[#FF6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-[#0F172A]">Switch between programs freely</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FFE5E5] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[#FF6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-[#0F172A]">Full program history access</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FFE5E5] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[#FF6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-[#0F172A]">Advanced meal planning</span>
            </div>
          </div>

          {/* Waitlist Form */}
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <div className="bg-[#0F172A] rounded-xl p-4">
                <p className="text-white text-sm mb-3">
                  Pro launching soon! Get early access pricing:
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="your@email.com"
                    className="flex-1 px-4 py-2 rounded-lg bg-white text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-[#FF6B6B] text-white font-semibold rounded-lg hover:bg-[#EF5350] transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? '...' : 'Notify Me'}
                  </button>
                </div>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
              </div>
            </form>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-green-800 font-medium">You&apos;re on the list!</p>
              <p className="text-green-600 text-sm mt-1">We&apos;ll notify you when Pro launches.</p>
            </div>
          )}

          {/* Alternative Actions */}
          <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
            <button
              onClick={onClose}
              className="w-full py-3 text-[#64748B] hover:text-[#0F172A] transition-colors text-sm"
            >
              Continue with Free for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
