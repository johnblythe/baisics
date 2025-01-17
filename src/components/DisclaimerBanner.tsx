'use client';

import { useState } from 'react';
import { disclaimer, disclaimerSimple } from '@/utils/disclaimer';
import { Info } from 'lucide-react';

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

  const handleAcknowledge = () => {
    setIsVisible(false);
    if (persistKey) {
      localStorage.setItem(persistKey, 'acknowledged');
    }
    onAcknowledge?.();
  };

  if (!isVisible) return null;

  if (variant === 'banner') {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-800">
        <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between flex-wrap">
            <div className="flex-1 flex items-start">
              <Info className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" aria-hidden="true" />
              <div className="ml-3 text-blue-700 dark:text-blue-300">
                <div className="text-sm">
                  {disclaimer}
                </div>
                <div className="mt-2 text-sm">
                  {disclaimerSimple}
                </div>
              </div>
            </div>
            {showAcknowledgeButton && (
              <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
                <button
                  type="button"
                  onClick={handleAcknowledge}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-blue-50 transition-colors"
                >
                  I Acknowledge
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <Info className="h-6 w-6 text-blue-400 mt-1" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <div className="text-sm text-blue-700 dark:text-blue-300">
            {disclaimer}
          </div>
          <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
            {disclaimerSimple}
          </div>
        </div>
        {showAcknowledgeButton && (
          <div className="ml-3 flex-shrink-0">
            <button
              type="button"
              onClick={handleAcknowledge}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-blue-50 transition-colors"
            >
              I Acknowledge
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 