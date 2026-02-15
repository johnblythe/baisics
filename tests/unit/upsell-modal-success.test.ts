import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Tests for Phase 4: Post-Signup Success Modal (UpsellModal.tsx)
 *
 * Since @testing-library/react is NOT available in this project,
 * these tests use file-content assertions to verify the SuccessView
 * implementation matches the spec. This catches regressions in:
 * - Required UI text/content
 * - Navigation targets
 * - Feature list completeness
 * - Removed dependencies (ReactConfetti)
 */

const UPSELL_MODAL_PATH = path.resolve(__dirname, '../../src/app/components/UpsellModal.tsx');
const source = fs.readFileSync(UPSELL_MODAL_PATH, 'utf-8');

describe('UpsellModal - Post-Signup Success View (Phase 4)', () => {

  describe('showSuccess state management', () => {
    it('should declare showSuccess state with initial value false', () => {
      expect(source).toContain('useState(false)');
      expect(source).toContain('showSuccess');
      expect(source).toContain('setShowSuccess');
    });

    it('should set showSuccess to true on successful email submit', () => {
      expect(source).toContain('setShowSuccess(true)');
    });

    it('should reset showSuccess to false when modal opens', () => {
      expect(source).toContain('setShowSuccess(false)');
    });

    it('should conditionally render SuccessView when showSuccess is true', () => {
      expect(source).toContain('showSuccess ?');
      expect(source).toContain('<SuccessView');
    });
  });

  describe('SuccessView component structure', () => {
    it('should define SuccessView as an internal component', () => {
      expect(source).toMatch(/function SuccessView/);
    });

    it('should accept email and onClose props', () => {
      expect(source).toMatch(/SuccessView\(\{[^}]*email[^}]*onClose/);
    });

    it('should render "You\'re In!" header text', () => {
      // The component uses &apos; for apostrophe in JSX
      expect(source).toContain("You&apos;re In!");
    });

    it('should render "Your full program is now unlocked" subheader', () => {
      expect(source).toContain('Your full program is now unlocked');
    });

    it('should have coral gradient background on header', () => {
      expect(source).toContain('from-[#FF6B6B] to-[#EF5350]');
    });
  });

  describe('Unlocked features list', () => {
    const expectedFeatures = [
      'All program phases unlocked',
      'Personalized nutrition plan',
      'Progress tracking dashboard',
      'PDF export',
      'Food logging & meal planning',
    ];

    it('should define exactly 5 unlocked features', () => {
      const featureArrayMatch = source.match(/unlockedFeatures\s*=\s*\[([\s\S]*?)\]/);
      expect(featureArrayMatch).not.toBeNull();

      const featureBlock = featureArrayMatch![1];
      const featureStrings = featureBlock.match(/"[^"]+"/g);
      expect(featureStrings).toHaveLength(5);
    });

    for (const feature of expectedFeatures) {
      it(`should include "${feature}" in the feature list`, () => {
        expect(source).toContain(feature);
      });
    }

    it('should render features with staggered animation delays', () => {
      expect(source).toContain('animationDelay');
      expect(source).toMatch(/\$\{0\.4\s*\+\s*i\s*\*\s*0\.1\}s/);
    });
  });

  describe('CTAs and navigation', () => {
    it('should have "Go to My Dashboard" link pointing to /dashboard', () => {
      expect(source).toContain('href="/dashboard"');
      expect(source).toContain('Go to My Dashboard');
    });

    it('should use Next.js Link for dashboard navigation', () => {
      expect(source).toContain("import Link from \"next/link\"");
      // Verify the dashboard link is a <Link> not an <a>
      expect(source).toMatch(/Link\s*\n?\s*href="\/dashboard"/);
    });

    it('should have "Continue viewing program" secondary action', () => {
      expect(source).toContain('Continue viewing program');
    });

    it('should call onClose and window.location.reload on continue viewing', () => {
      expect(source).toContain('handleContinueViewing');
      expect(source).toContain('onClose()');
      expect(source).toContain('window.location.reload()');
    });
  });

  describe('Email confirmation note', () => {
    it('should display email confirmation text', () => {
      expect(source).toContain('Check your email for a welcome message');
    });

    it('should conditionally show the submitted email address', () => {
      // The component conditionally renders the email
      expect(source).toContain('{email}');
      expect(source).toMatch(/email\s*&&/);
    });
  });

  describe('CSS animations (no external dependencies)', () => {
    it('should NOT import ReactConfetti or react-confetti', () => {
      expect(source).not.toContain('react-confetti');
      expect(source).not.toContain('ReactConfetti');
      expect(source).not.toContain('Confetti from');
    });

    it('should define CSS keyframes for successFadeIn animation', () => {
      expect(source).toContain('@keyframes successFadeIn');
    });

    it('should define CSS keyframes for successPop animation', () => {
      expect(source).toContain('@keyframes successPop');
    });

    it('should define CSS keyframes for successSlideUp animation', () => {
      expect(source).toContain('@keyframes successSlideUp');
    });

    it('should define CSS keyframes for confettiFloat animation', () => {
      expect(source).toContain('@keyframes confettiFloat');
    });

    it('should use CSS-only confetti dots (not canvas-based)', () => {
      // Verify floating confetti dots are plain divs with animations
      expect(source).toContain('confettiFloat');
      expect(source).not.toContain('<canvas');
    });
  });

  describe('Success state does NOT auto-close', () => {
    it('should not have setTimeout auto-close behavior', () => {
      // Previous implementation had auto-close after 1.5s.
      // Success view should persist until user clicks a CTA.
      // Verify no auto-close timer in SuccessView.
      const successViewBlock = source.slice(
        source.indexOf('function SuccessView'),
        source.indexOf('// =============================================================================', source.indexOf('function SuccessView') + 1) || source.indexOf('export function UpsellModal')
      );
      expect(successViewBlock).not.toContain('setTimeout');
      expect(successViewBlock).not.toContain('autoClose');
    });
  });
});
