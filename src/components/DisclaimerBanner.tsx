'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DisclaimerBannerProps {
  variant?: 'banner' | 'inline';
  onAcknowledge?: () => void;
  showAcknowledgeButton?: boolean;
  persistKey?: string;
}

export function DisclaimerBanner({
  variant = 'banner',
  onAcknowledge,
  showAcknowledgeButton = false,
  persistKey
}: DisclaimerBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAcknowledge = () => {
    setIsVisible(false);
    if (persistKey) {
      localStorage.setItem(persistKey, 'acknowledged');
    }
    onAcknowledge?.();
  };

  if (!isVisible) return null;

  // Inline variant - minimal, collapsible notice
  if (variant === 'inline') {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#FAFAFA] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-[#D97706]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm text-[#475569]">
              <span className="font-medium text-[#0F172A]">Health notice:</span> Consult your physician before starting any exercise program
            </span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-6 h-6 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center flex-shrink-0"
          >
            <svg className="w-3 h-3 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-1 border-t border-[#F1F5F9]">
                <div className="space-y-3 text-sm text-[#475569]">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#D97706] mt-2 flex-shrink-0" />
                    <p>Users must be 18+ (minors need parent/guardian consent and physician approval)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#D97706] mt-2 flex-shrink-0" />
                    <p>Especially important if you have medical conditions, injuries, or take medications</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#D97706] mt-2 flex-shrink-0" />
                    <p>Results vary by individual; exercise carries inherent risks</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#D97706] mt-2 flex-shrink-0" />
                    <p>Not intended to diagnose, treat, cure, or prevent any disease</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-[#94A3B8] italic">
                  TLDR: Talk to your doctor, and have fun with the program!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Banner variant - for dashboard, more prominent but still v2a
  return (
    <div className="bg-[#FFFBEB] border-b border-[#FEF3C7]">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-[#D97706]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-left"
              >
                <p className="text-sm text-[#92400E]">
                  <span className="font-semibold">Health notice:</span> Consult your physician before starting any exercise program.{' '}
                  <span className="text-[#D97706] hover:text-[#B45309] underline underline-offset-2">
                    {isExpanded ? 'Less' : 'More'}
                  </span>
                </p>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <ul className="mt-2 space-y-1 text-sm text-[#92400E]">
                      <li className="flex items-center gap-2">
                        <span className="text-[#D97706]">•</span>
                        Must be 18+ or have parent/guardian consent
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#D97706]">•</span>
                        Important for those with conditions, injuries, or medications
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#D97706]">•</span>
                        Results vary; exercise has inherent risks
                      </li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {showAcknowledgeButton && (
            <button
              type="button"
              onClick={handleAcknowledge}
              className="px-4 py-2 bg-[#D97706] text-white text-sm font-medium rounded-lg hover:bg-[#B45309] transition-colors flex-shrink-0"
            >
              Got it
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
