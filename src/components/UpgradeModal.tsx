'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: 'program_limit' | 'switch_program' | 'generation_limit' | 'general';
  currentProgramName?: string;
  generationsUsed?: number;
  generationsLimit?: number;
}

const contextMessages = {
  program_limit: {
    title: 'Ready for More?',
    subtitle: 'Free accounts are limited to one active program at a time.',
    cta: 'Complete your current program or upgrade for unlimited access.',
  },
  switch_program: {
    title: 'Unlock Program Switching',
    subtitle: 'Free accounts can only access their most recent program.',
    cta: 'Upgrade to switch between programs freely.',
  },
  generation_limit: {
    title: 'Generation Limit Reached',
    subtitle: 'You\'ve used all your program generations this month.',
    cta: 'Upgrade for unlimited AI-generated programs.',
  },
  general: {
    title: 'Get Jacked',
    subtitle: 'Unlock everything for just $5/month.',
    cta: 'All premium features, unlimited programs.',
  },
};

export function UpgradeModal({
  isOpen,
  onClose,
  context,
  currentProgramName,
  generationsUsed,
  generationsLimit,
}: UpgradeModalProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const messages = contextMessages[context];

  const handleUpgrade = async () => {
    if (!session?.user) {
      // Redirect to sign in
      window.location.href = '/auth/signin?callbackUrl=/dashboard';
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'Already subscribed') {
          // Redirect to billing portal
          const portalRes = await fetch('/api/billing-portal', {
            method: 'POST',
          });
          const portalData = await portalRes.json();
          if (portalData.url) {
            window.location.href = portalData.url;
            return;
          }
        }
        throw new Error(data.error || 'Failed to start checkout');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Upgrade error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
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

          {context === 'generation_limit' && generationsUsed !== undefined && (
            <div className="bg-[#FFF7ED] border border-[#FDBA74] rounded-lg p-4 mb-6">
              <p className="text-sm text-[#9A3412]">
                {generationsUsed} of {generationsLimit} programs generated this month
              </p>
            </div>
          )}

          <p className="text-[#475569] mb-6">{messages.cta}</p>

          {/* Features */}
          <div className="space-y-3 mb-6">
            <Feature text="Unlimited AI program generations" />
            <Feature text="Unlimited active programs" />
            <Feature text="Check-in reminders" />
            <Feature text="Live workout AI coach" />
            <Feature text="Full meal plan filters" />
            <Feature text="Shopping lists" />
          </div>

          {/* Price and CTA */}
          <div className="bg-[#0F172A] rounded-xl p-4 mb-4">
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-white text-lg font-bold">JACKED</span>
              <div className="text-right">
                <span className="text-[#FF6B6B] text-2xl font-bold">$5</span>
                <span className="text-white/60 text-sm">/month</span>
              </div>
            </div>
            <button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-[#FF6B6B] text-white font-semibold rounded-lg hover:bg-[#EF5350] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Loading...</span>
                </>
              ) : (
                'Upgrade Now'
              )}
            </button>
            {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
          </div>

          {/* Cancel option */}
          <button
            onClick={onClose}
            className="w-full py-3 text-[#64748B] hover:text-[#0F172A] transition-colors text-sm"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 rounded-full bg-[#FFE5E5] flex items-center justify-center flex-shrink-0">
        <svg className="w-3 h-3 text-[#FF6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className="text-[#0F172A] text-sm">{text}</span>
    </div>
  );
}
