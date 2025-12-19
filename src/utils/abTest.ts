/**
 * Simple A/B Testing Utility
 *
 * Usage:
 *   const variant = getABVariant('upsell_modal', ['A', 'B', 'C']);
 *   trackABEvent('upsell_modal', variant, 'view');
 *   trackABEvent('upsell_modal', variant, 'convert');
 */

type ABVariant = string;

const STORAGE_PREFIX = 'ab_test_';

/**
 * Get or assign a variant for a test
 * Persists in localStorage so users see consistent experience
 */
export function getABVariant(testName: string, variants: ABVariant[]): ABVariant {
  if (typeof window === 'undefined') {
    // SSR fallback - return first variant
    return variants[0];
  }

  const storageKey = `${STORAGE_PREFIX}${testName}`;

  // Check if user already has an assigned variant
  const existing = localStorage.getItem(storageKey);
  if (existing && variants.includes(existing)) {
    return existing;
  }

  // Assign random variant
  const randomIndex = Math.floor(Math.random() * variants.length);
  const assigned = variants[randomIndex];

  localStorage.setItem(storageKey, assigned);
  return assigned;
}

/**
 * Track an A/B test event via GTM
 */
export function trackABEvent(
  testName: string,
  variant: ABVariant,
  action: 'view' | 'convert' | 'dismiss'
) {
  if (typeof window === 'undefined') return;

  // GTM dataLayer push
  const dataLayer = (window as any).dataLayer || [];
  dataLayer.push({
    event: 'ab_test',
    ab_test_name: testName,
    ab_variant: variant,
    ab_action: action,
  });

  // Also log for debugging (remove in prod if noisy)
  console.log(`[A/B] ${testName}: ${variant} - ${action}`);
}

/**
 * React hook for A/B testing
 */
import { useState, useEffect } from 'react';

export function useABTest(testName: string, variants: ABVariant[]) {
  const [variant, setVariant] = useState<ABVariant | null>(null);

  useEffect(() => {
    const assigned = getABVariant(testName, variants);
    setVariant(assigned);
    trackABEvent(testName, assigned, 'view');
  }, [testName, variants]);

  const trackConversion = () => {
    if (variant) {
      trackABEvent(testName, variant, 'convert');
    }
  };

  const trackDismiss = () => {
    if (variant) {
      trackABEvent(testName, variant, 'dismiss');
    }
  };

  return { variant, trackConversion, trackDismiss };
}

/**
 * Force a specific variant (for testing/debugging)
 */
export function forceABVariant(testName: string, variant: ABVariant) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${STORAGE_PREFIX}${testName}`, variant);
}

/**
 * Clear variant assignment (user will get new random on next visit)
 */
export function clearABVariant(testName: string) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${STORAGE_PREFIX}${testName}`);
}
