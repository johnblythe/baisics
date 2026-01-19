import { test, expect, Page, BrowserContext } from '@playwright/test';
import path from 'path';

const SCREENSHOTS_DIR = path.join(__dirname, 'captures');

// Test user for authenticated screenshots (Marcus: cruising journey, meticulous logging)
const TEST_USER_EMAIL = 'marcus@test.baisics.app';

/**
 * Feature Screenshot Automation
 * Captures feature screens for marketing content
 *
 * Usage: npm run screenshots
 */

async function loginAsTestUser(page: Page, _context: BrowserContext): Promise<boolean> {
  try {
    await page.goto('/auth/signin');
    await page.waitForLoadState('networkidle');

    await page.fill('input[name="email"]', TEST_USER_EMAIL);
    await page.click('button[type="submit"]');

    await page.waitForURL('**/auth/verify-request**', { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    const magicLinkButton = page.locator('a:has-text("Click here to sign in")');
    if (!(await magicLinkButton.isVisible({ timeout: 5000 }))) {
      console.log('No magic link on verify-request page');
      return false;
    }

    await magicLinkButton.click();
    await page.waitForLoadState('networkidle');

    await page.waitForURL(url => {
      const path = url.pathname;
      return path.includes('/hi') || path.includes('/dashboard');
    }, { timeout: 15000 });

    return true;
  } catch (error) {
    console.log('Login failed:', error);
    return false;
  }
}

async function dismissModals(page: Page) {
  const closeButton = page.locator('button:has-text("Close"), button:has-text("Got it"), button:has-text("Let\'s go"), [aria-label="Close"]').first();
  if (await closeButton.isVisible({ timeout: 2000 })) {
    await closeButton.click({ force: true });
    await page.waitForTimeout(500);
  }
}

// ===========================================
// PUBLIC PAGES
// ===========================================
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

  test('templates library', async ({ page }) => {
    await page.goto('/templates');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/templates-library.png`,
      fullPage: false,
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

// ===========================================
// AUTHENTICATED - CORE FEATURES
// ===========================================
test.describe('Authenticated - Core Features', () => {
  test('AI conversation flow', async ({ page, context }) => {
    const loggedIn = await loginAsTestUser(page, context);
    if (!loggedIn) {
      test.skip(true, 'Could not log in test user');
      return;
    }

    // Go to /hi for the conversational intake
    await page.goto('/hi');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click a quick prompt button to start the conversation
    const quickPrompt = page.locator('button:has-text("Build Muscle"), button:has-text("Lose Weight"), button:has-text("Get Stronger")').first();
    if (await quickPrompt.isVisible({ timeout: 3000 })) {
      await quickPrompt.click();
      await page.waitForTimeout(3000); // Wait for AI response

      // Type a follow-up message to show back-and-forth
      const textarea = page.locator('textarea').first();
      if (await textarea.isVisible({ timeout: 3000 })) {
        await textarea.fill("I've been lifting for about 2 years. I can train 4-5 days a week and have access to a full gym.");
        await page.waitForTimeout(500);
      }
    }

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/ai-conversation.png`,
      fullPage: false,
    });
  });

  test('import/create program page', async ({ page, context }) => {
    const loggedIn = await loginAsTestUser(page, context);
    if (!loggedIn) {
      test.skip(true, 'Could not log in test user');
      return;
    }

    await page.goto('/create');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Fill with sample program text
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible({ timeout: 3000 })) {
      const sampleProgram = `Monday - Push Day
Bench Press: 4x8 @ 185lbs
Overhead Press: 3x10 @ 95lbs
Incline Dumbbell Press: 3x12
Tricep Pushdowns: 3x15
Lateral Raises: 3x15

Wednesday - Pull Day
Deadlifts: 4x5 @ 315lbs
Barbell Rows: 4x8 @ 155lbs
Lat Pulldowns: 3x12
Face Pulls: 3x15
Bicep Curls: 3x12

Friday - Legs
Squats: 4x8 @ 225lbs
Romanian Deadlifts: 3x10 @ 185lbs
Leg Press: 3x12
Leg Curls: 3x12
Calf Raises: 4x15`;
      await textarea.fill(sampleProgram);
      await page.waitForTimeout(500);
    }

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/import-program.png`,
      fullPage: true,
    });
  });

  test('program dashboard', async ({ page, context }) => {
    const loggedIn = await loginAsTestUser(page, context);
    if (!loggedIn) {
      test.skip(true, 'Could not log in test user');
      return;
    }

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await dismissModals(page);
    await page.waitForTimeout(500);

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/program-dashboard.png`,
      fullPage: false,
    });
  });

  test('workout view with chat', async ({ page, context }) => {
    const loggedIn = await loginAsTestUser(page, context);
    if (!loggedIn) {
      test.skip(true, 'Could not log in test user');
      return;
    }

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await dismissModals(page);

    // Find and click a workout link
    const workoutLink = page.locator('a[href*="/workout/"]').first();
    if (await workoutLink.isVisible({ timeout: 5000 })) {
      await workoutLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('.animate-spin', { state: 'hidden', timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(2000);

      // Open the chat panel by clicking the Ask button
      const askButton = page.locator('button:has-text("Ask"), button[title*="trainer"]').first();
      if (await askButton.isVisible({ timeout: 3000 })) {
        await askButton.click();
        await page.waitForTimeout(1000);

        // Type a sample question
        const chatInput = page.locator('textarea[placeholder*="Ask"], input[placeholder*="Ask"]').first();
        if (await chatInput.isVisible({ timeout: 2000 })) {
          await chatInput.fill("What's the proper form for this exercise?");
          await page.waitForTimeout(500);
        }
      }

      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/workout-with-chat.png`,
        fullPage: false,
      });
    }
  });

  test('workout view - standard', async ({ page, context }) => {
    const loggedIn = await loginAsTestUser(page, context);
    if (!loggedIn) {
      test.skip(true, 'Could not log in test user');
      return;
    }

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await dismissModals(page);

    const workoutLink = page.locator('a[href*="/workout/"]').first();
    if (await workoutLink.isVisible({ timeout: 5000 })) {
      await workoutLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('.animate-spin', { state: 'hidden', timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/workout-view.png`,
        fullPage: false,
      });
    }
  });
});

// ===========================================
// AUTHENTICATED - NUTRITION
// ===========================================
test.describe('Authenticated - Nutrition', () => {
  test('nutrition tracking page', async ({ page, context }) => {
    const loggedIn = await loginAsTestUser(page, context);
    if (!loggedIn) {
      test.skip(true, 'Could not log in test user');
      return;
    }

    await page.goto('/nutrition');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click "Log Today" to open the nutrition modal
    const logTodayBtn = page.locator('button:has-text("Log Today")');
    if (await logTodayBtn.isVisible({ timeout: 3000 })) {
      await logTodayBtn.click();
      await page.waitForTimeout(1000);

      // Fill in some sample nutrition data if modal inputs are visible
      const proteinInput = page.locator('input[name="protein"], input[placeholder*="protein" i]').first();
      const carbsInput = page.locator('input[name="carbs"], input[placeholder*="carbs" i]').first();
      const fatsInput = page.locator('input[name="fats"], input[name="fat"], input[placeholder*="fat" i]').first();
      const caloriesInput = page.locator('input[name="calories"], input[placeholder*="calories" i]').first();

      if (await proteinInput.isVisible({ timeout: 2000 })) {
        await proteinInput.fill('145');
      }
      if (await carbsInput.isVisible({ timeout: 1000 })) {
        await carbsInput.fill('220');
      }
      if (await fatsInput.isVisible({ timeout: 1000 })) {
        await fatsInput.fill('65');
      }
      if (await caloriesInput.isVisible({ timeout: 1000 })) {
        await caloriesInput.fill('2050');
      }
      await page.waitForTimeout(500);
    }

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/nutrition-tracking.png`,
      fullPage: false,
    });
  });

  test('meal prep page', async ({ page, context }) => {
    const loggedIn = await loginAsTestUser(page, context);
    if (!loggedIn) {
      test.skip(true, 'Could not log in test user');
      return;
    }

    await page.goto('/meal-prep');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Configure meal plan options to show the form in use
    // Select preferences if visible
    const highProteinPref = page.locator('button:has-text("high-protein"), label:has-text("high-protein")').first();
    const quickMealsPref = page.locator('button:has-text("quick-meals"), label:has-text("quick-meals")').first();

    if (await highProteinPref.isVisible({ timeout: 2000 })) {
      await highProteinPref.click();
      await page.waitForTimeout(300);
    }
    if (await quickMealsPref.isVisible({ timeout: 1000 })) {
      await quickMealsPref.click();
      await page.waitForTimeout(300);
    }

    // Use the food search to search for a food item
    const foodSearch = page.locator('input[placeholder*="Search" i], input[placeholder*="food" i]').first();
    if (await foodSearch.isVisible({ timeout: 2000 })) {
      await foodSearch.fill('chicken breast');
      await page.waitForTimeout(1500); // Wait for search results
    }

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/meal-prep.png`,
      fullPage: false,
    });
  });
});

// ===========================================
// AUTHENTICATED - PROGRESS & CHECK-INS
// ===========================================
test.describe('Authenticated - Progress', () => {
  test('check-in page', async ({ page, context }) => {
    const loggedIn = await loginAsTestUser(page, context);
    if (!loggedIn) {
      test.skip(true, 'Could not log in test user');
      return;
    }

    await page.goto('/check-in');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/check-in.png`,
      fullPage: true,
    });
  });

  test('exercise library', async ({ page, context }) => {
    const loggedIn = await loginAsTestUser(page, context);
    if (!loggedIn) {
      test.skip(true, 'Could not log in test user');
      return;
    }

    await page.goto('/library');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/exercise-library.png`,
      fullPage: false,
    });
  });
});

// ===========================================
// MOBILE VERSIONS
// ===========================================
test.describe('Mobile Views', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('landing page - mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/landing-mobile.png`,
      fullPage: false,
    });
  });

  test('templates - mobile', async ({ page }) => {
    await page.goto('/templates');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/templates-mobile.png`,
      fullPage: false,
    });
  });
});

test.describe('Mobile Authenticated', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('program dashboard - mobile', async ({ page, context }) => {
    const loggedIn = await loginAsTestUser(page, context);
    if (!loggedIn) {
      test.skip(true, 'Could not log in test user');
      return;
    }

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await dismissModals(page);

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/program-dashboard-mobile.png`,
      fullPage: false,
    });
  });

  test('workout view - mobile', async ({ page, context }) => {
    const loggedIn = await loginAsTestUser(page, context);
    if (!loggedIn) {
      test.skip(true, 'Could not log in test user');
      return;
    }

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await dismissModals(page);

    const workoutLink = page.locator('a[href*="/workout/"]').first();
    if (await workoutLink.isVisible({ timeout: 5000 })) {
      await workoutLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('.animate-spin', { state: 'hidden', timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/workout-view-mobile.png`,
        fullPage: false,
      });
    }
  });

  test('AI conversation - mobile', async ({ page, context }) => {
    const loggedIn = await loginAsTestUser(page, context);
    if (!loggedIn) {
      test.skip(true, 'Could not log in test user');
      return;
    }

    await page.goto('/hi');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/ai-conversation-mobile.png`,
      fullPage: false,
    });
  });

  test('nutrition - mobile', async ({ page, context }) => {
    const loggedIn = await loginAsTestUser(page, context);
    if (!loggedIn) {
      test.skip(true, 'Could not log in test user');
      return;
    }

    await page.goto('/nutrition');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/nutrition-mobile.png`,
      fullPage: false,
    });
  });

  test('check-in - mobile', async ({ page, context }) => {
    const loggedIn = await loginAsTestUser(page, context);
    if (!loggedIn) {
      test.skip(true, 'Could not log in test user');
      return;
    }

    await page.goto('/check-in');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/check-in-mobile.png`,
      fullPage: false,
    });
  });
});
