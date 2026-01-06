'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { COACH_TIER_CONFIG } from '@/lib/coach-tiers';
import type { CoachTier } from '@prisma/client';

interface CoachUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: CoachTier;
  currentClientCount: number;
}

export function CoachUpgradeModal({
  isOpen,
  onClose,
  currentTier,
  currentClientCount,
}: CoachUpgradeModalProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState<'SWOLE' | 'YOKED' | null>(null);
  const [error, setError] = useState('');

  const handleUpgrade = async (tier: 'SWOLE' | 'YOKED') => {
    if (!session?.user) {
      window.location.href = '/auth/signin?callbackUrl=/coach/dashboard';
      return;
    }

    setIsLoading(tier);
    setError('');

    try {
      const res = await fetch('/api/coach/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'Already subscribed') {
          const portalRes = await fetch('/api/coach/billing-portal', {
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
      setIsLoading(null);
    }
  };

  if (!isOpen) return null;

  const currentLimit = COACH_TIER_CONFIG[currentTier].clientLimit;
  const showSwole = currentTier === 'FREE';
  const showYoked = currentTier === 'FREE' || currentTier === 'SWOLE';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Scale Your Coaching</h2>
              <p className="text-white/80 mt-1">
                You&apos;ve reached your {currentLimit === Infinity ? 'client' : `${currentLimit} client`} limit
              </p>
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
          <div className="bg-[#FFF7ED] border border-[#FDBA74] rounded-lg p-4 mb-6">
            <p className="text-sm text-[#9A3412]">
              {currentClientCount} of {currentLimit === Infinity ? '∞' : currentLimit} clients
            </p>
          </div>

          <div className="space-y-4">
            {/* SWOLE Tier */}
            {showSwole && (
              <div className="border border-[#E2E8F0] rounded-xl p-4 hover:border-[#FF6B6B] transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-[#0F172A] text-lg">SWOLE</h3>
                    <p className="text-[#64748B] text-sm">Up to 15 clients</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[#FF6B6B] text-2xl font-bold">$29</span>
                    <span className="text-[#64748B] text-sm">/mo</span>
                  </div>
                </div>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2 text-sm text-[#475569]">
                    <CheckIcon /> 15 active clients
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#475569]">
                    <CheckIcon /> Client activity dashboard
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#475569]">
                    <CheckIcon /> Program templates
                  </li>
                </ul>
                <button
                  onClick={() => handleUpgrade('SWOLE')}
                  disabled={isLoading !== null}
                  className="w-full py-2 bg-[#0F172A] text-white font-medium rounded-lg hover:bg-[#1E293B] transition-colors disabled:opacity-50"
                >
                  {isLoading === 'SWOLE' ? 'Loading...' : 'Get SWOLE'}
                </button>
              </div>
            )}

            {/* YOKED Tier */}
            {showYoked && (
              <div className="border-2 border-[#FF6B6B] rounded-xl p-4 relative">
                <div className="absolute -top-3 left-4 bg-[#FF6B6B] text-white text-xs font-bold px-2 py-1 rounded">
                  BEST VALUE
                </div>
                <div className="flex justify-between items-start mb-3 mt-1">
                  <div>
                    <h3 className="font-bold text-[#0F172A] text-lg">YOKED</h3>
                    <p className="text-[#64748B] text-sm">Unlimited clients</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[#FF6B6B] text-2xl font-bold">$59</span>
                    <span className="text-[#64748B] text-sm">/mo</span>
                  </div>
                </div>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2 text-sm text-[#475569]">
                    <CheckIcon /> Unlimited clients
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#475569]">
                    <CheckIcon /> Priority support
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#475569]">
                    <CheckIcon /> Custom branding
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#475569]">
                    <CheckIcon /> Advanced analytics
                  </li>
                </ul>
                <button
                  onClick={() => handleUpgrade('YOKED')}
                  disabled={isLoading !== null}
                  className="w-full py-2 bg-[#FF6B6B] text-white font-medium rounded-lg hover:bg-[#EF5350] transition-colors disabled:opacity-50"
                >
                  {isLoading === 'YOKED' ? 'Loading...' : 'Get YOKED'}
                </button>
              </div>
            )}
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 text-[#64748B] hover:text-[#0F172A] transition-colors text-sm mt-4"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
