'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useEscapeKey } from '@/hooks/useEscapeKey';

interface TrialEndedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SESSION_STORAGE_KEY = 'trialEndedModalDismissed';

export function TrialEndedModal({ isOpen, onClose }: TrialEndedModalProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEscapeKey(handleDismiss, isOpen);

  function handleDismiss() {
    sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
    onClose();
  }

  const handleUpgrade = async () => {
    if (!session?.user) {
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
      } else {
        throw new Error('Failed to create checkout. Please try again.');
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Your Jacked Trial Has Ended</h2>
              <p className="text-white/80 mt-1">Here&apos;s what you&apos;ll lose without upgrading.</p>
            </div>
            <button
              onClick={handleDismiss}
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
          <p className="text-[#475569] mb-6">
            You&apos;ve been training with the full Jacked experience. Keep all your premium features for just $5/mo.
          </p>

          {/* Features you'll lose */}
          <div className="space-y-3 mb-6">
            <LostFeature text="Meal plan filters & dietary preferences" />
            <LostFeature text="Carb cycling & advanced nutrition" />
            <LostFeature text="Unlimited AI program generations" />
            <LostFeature text="Swap suggestions for exercises & meals" />
            <LostFeature text="Check-in reminders" />
            <LostFeature text="Live workout AI coach" />
            <LostFeature text="Shopping lists" />
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
                'Go Jacked — $5/mo'
              )}
            </button>
            {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
          </div>

          {/* Continue Free option */}
          <button
            onClick={handleDismiss}
            className="w-full py-3 text-[#64748B] hover:text-[#0F172A] transition-colors text-sm"
          >
            Continue Free
          </button>
        </div>
      </div>
    </div>
  );
}

function LostFeature({ text }: { text: string }) {
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
