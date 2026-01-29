/**
 * Playwright Global Setup
 *
 * Seeds the database ONCE before all E2E tests run.
 * This prevents concurrent seedPersonas() calls from causing FK race conditions.
 */

import { seedPersonas } from '../fixtures/seed';

export default async function globalSetup() {
  console.log('🌱 Global setup: seeding database...');
  await seedPersonas();
  console.log('✅ Global setup: seeding complete');
}
