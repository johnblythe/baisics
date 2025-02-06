const AB_TEST_COOKIE = 'baisics_landing_variant';
const TEST_DURATION_DAYS = 30;

export type LandingVariant = 'control' | 'variant';

export function getLandingVariant(): LandingVariant {
  // Only run on client side
  if (typeof window === 'undefined') {
    return 'control';
  }

  // Check URL parameter first
  const urlParams = new URLSearchParams(window.location.search);
  const forcedVariant = urlParams.get('variant');
  if (forcedVariant === 'control' || forcedVariant === 'variant') {
    // Store the forced variant
    localStorage.setItem(AB_TEST_COOKIE, forcedVariant);
    return forcedVariant;
  }

  // Check localStorage next
  const storedVariant = localStorage.getItem(AB_TEST_COOKIE);
  if (storedVariant) {
    return storedVariant as LandingVariant;
  }

  // Randomly assign variant (50/50 split)
  const variant: LandingVariant = Math.random() < 0.5 ? 'control' : 'variant';

  // Store in localStorage
  localStorage.setItem(AB_TEST_COOKIE, variant);

  return variant;
}

// Utility function to force a specific variant (useful for testing)
export function setLandingVariant(variant: LandingVariant): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AB_TEST_COOKIE, variant);
  }
} 