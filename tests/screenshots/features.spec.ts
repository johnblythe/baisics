import { test, expect } from '@playwright/test';
import path from 'path';

const SCREENSHOTS_DIR = path.join(__dirname, 'captures');

/**
 * Feature Screenshot Automation
 * Captures key feature screens for marketing content
 *
 * Usage: npm run screenshots
 *
 * Note: Some screenshots require authentication or specific app state.
 * For authenticated screens, set TEST_SESSION_TOKEN env var.
 */

// Public pages (no auth required)
test.describe('Public Pages', () => {
  test('landing page - hero', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/landing-hero.png`,
      fullPage: false,
    });
  });

  test('landing page - full', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/landing-full.png`,
      fullPage: true,
    });
  });

  test('coaches page', async ({ page }) => {
    await page.goto('/coaches');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/coaches-page.png`,
      fullPage: true,
    });
  });

  test('pricing page', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/pricing-page.png`,
      fullPage: true,
    });
  });
});

// Auth-required pages (skip if no test session)
test.describe('Authenticated Pages', () => {
  test.skip(!process.env.TEST_SESSION_COOKIE, 'Requires TEST_SESSION_COOKIE env var');

  test.beforeEach(async ({ context }) => {
    // Set auth cookie if provided
    if (process.env.TEST_SESSION_COOKIE) {
      await context.addCookies([{
        name: 'next-auth.session-token',
        value: process.env.TEST_SESSION_COOKIE,
        domain: 'localhost',
        path: '/',
      }]);
    }
  });

  test('dashboard', async ({ page }) => {
    await page.goto('/hi');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/dashboard.png`,
      fullPage: false,
    });
  });

  test('program builder - intake form', async ({ page }) => {
    await page.goto('/intake');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/intake-form.png`,
      fullPage: true,
    });
  });

  test('workout logging screen', async ({ page }) => {
    // This requires an active workout - capturing the workout list instead
    await page.goto('/hi');
    await page.waitForLoadState('networkidle');
    // Click first available workout if exists
    const workoutLink = page.locator('a[href*="/workout/"]').first();
    if (await workoutLink.isVisible()) {
      await workoutLink.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/workout-logging.png`,
        fullPage: false,
      });
    }
  });
});

// Mobile-specific captures
test.describe('Mobile Views', () => {
  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14 Pro

  test('landing page - mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/landing-mobile.png`,
      fullPage: false,
    });
  });

  test('coaches page - mobile', async ({ page }) => {
    await page.goto('/coaches');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/coaches-mobile.png`,
      fullPage: false,
    });
  });
});
