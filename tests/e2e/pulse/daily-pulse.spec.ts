/**
 * Daily Pulse E2E Tests
 *
 * Tests the /pulse page — a lightweight daily check-in with weight,
 * optional photo, and optional notes. Two tabs: Log (default) and History.
 *
 * Uses alex persona (fresh user) for most tests to start with clean state.
 * Uses marcus persona (cruising user with data) where existing data is needed.
 */

import { test, expect } from "@playwright/test";
import { loginAsUser } from "../../fixtures/auth";
import { getPersona } from "../../fixtures/personas";

test.describe("Daily Pulse", () => {

  // --------------------------------------------------------------------------
  // Route Protection
  // --------------------------------------------------------------------------

  test.describe("Route Protection", () => {
    test("should redirect unauthenticated users to signin", async ({ page }) => {
      await page.goto("/pulse");
      await page.waitForURL("**/auth/signin**", { timeout: 10000 });
      expect(page.url()).toContain("/auth/signin");
    });
  });

  // --------------------------------------------------------------------------
  // Log View
  // --------------------------------------------------------------------------

  test.describe("Log View", () => {
    test("should load /pulse and show the Log tab by default", async ({ page }) => {
      const persona = getPersona("alex");
      await loginAsUser(page, persona.email);
      await page.goto("/pulse");
      await page.waitForSelector("main", { timeout: 10000 });

      // Should see the "Daily Pulse" heading
      await expect(page.getByText("Daily Pulse")).toBeVisible({ timeout: 5000 });

      // Should see the Save Pulse button
      await expect(page.getByRole("button", { name: /Save Pulse/i })).toBeVisible({ timeout: 5000 });

      // Log tab should have active styling (dark bg + white text)
      const logTab = page.locator("button", { hasText: "Log" }).first();
      await expect(logTab).toBeVisible();
      await expect(logTab).toHaveClass(/bg-\[#0F172A\]/);
    });

    test("should display weight input with decimal keyboard hint", async ({ page }) => {
      const persona = getPersona("alex");
      await loginAsUser(page, persona.email);
      await page.goto("/pulse");
      await page.waitForSelector("main", { timeout: 10000 });

      // Weight input should exist with correct attributes
      const weightInput = page.getByLabel("Weight");
      await expect(weightInput).toBeVisible({ timeout: 5000 });
      await expect(weightInput).toHaveAttribute("inputmode", "decimal");
      await expect(weightInput).toHaveAttribute("type", "number");
      await expect(weightInput).toHaveAttribute("step", "0.1");

      // "lbs" label should be visible
      await expect(page.getByText("lbs")).toBeVisible();
    });

    test("should show photo upload button", async ({ page }) => {
      const persona = getPersona("alex");
      await loginAsUser(page, persona.email);
      await page.goto("/pulse");
      await page.waitForSelector("main", { timeout: 10000 });

      // "Add Photo" button should be visible
      await expect(page.getByText("Add Photo")).toBeVisible({ timeout: 5000 });

      // Hidden file input should exist with correct accept attribute
      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toHaveAttribute("accept", "image/*");
      await expect(fileInput).toHaveAttribute("capture", "environment");
    });

    test("should show notes textarea", async ({ page }) => {
      const persona = getPersona("alex");
      await loginAsUser(page, persona.email);
      await page.goto("/pulse");
      await page.waitForSelector("main", { timeout: 10000 });

      // Notes textarea should exist with placeholder
      const notesInput = page.getByLabel("Notes");
      await expect(notesInput).toBeVisible({ timeout: 5000 });
      await expect(notesInput).toHaveAttribute("placeholder", "How are you feeling?");
    });

    test("should save a weight entry", async ({ page }) => {
      const persona = getPersona("alex");
      await loginAsUser(page, persona.email);
      await page.goto("/pulse");
      await page.waitForSelector("main", { timeout: 10000 });

      // Wait for loading to finish — Save Pulse button becomes visible
      const saveButton = page.getByRole("button", { name: /Save Pulse/i });
      await expect(saveButton).toBeVisible({ timeout: 5000 });

      // Enter a weight
      const weightInput = page.getByLabel("Weight");
      await weightInput.fill("175.5");

      // Click Save
      await saveButton.click();

      // Wait for success feedback — button text changes to "Saved!"
      await expect(page.getByRole("button", { name: /Saved!/i })).toBeVisible({ timeout: 5000 });

      // Reload the page — weight should be pre-populated
      await page.reload();
      await page.waitForSelector("main", { timeout: 10000 });
      await expect(page.getByLabel("Weight")).toHaveValue("175.5", { timeout: 5000 });
    });

    test("should pre-populate form when pulse exists for today", async ({ page }) => {
      const persona = getPersona("alex");
      await loginAsUser(page, persona.email);

      // Create a pulse via API
      const today = new Date().toISOString().split("T")[0];
      const response = await page.request.post("/api/pulse", {
        data: { date: today, weight: 180.5, notes: "Feeling good" },
      });
      expect(response.ok()).toBeTruthy();

      // Navigate to /pulse
      await page.goto("/pulse");
      await page.waitForSelector("main", { timeout: 10000 });

      // Weight should be pre-populated
      await expect(page.getByLabel("Weight")).toHaveValue("180.5", { timeout: 5000 });

      // Notes should be pre-populated
      await expect(page.getByLabel("Notes")).toHaveValue("Feeling good", { timeout: 5000 });
    });

    test("should show date display with change link", async ({ page }) => {
      const persona = getPersona("alex");
      await loginAsUser(page, persona.email);
      await page.goto("/pulse");
      await page.waitForSelector("main", { timeout: 10000 });

      // "change" link should be visible
      await expect(page.getByText("change")).toBeVisible({ timeout: 5000 });

      // A hidden date input should exist
      const dateInput = page.locator('input[type="date"]');
      await expect(dateInput).toBeAttached();
    });
  });

  // --------------------------------------------------------------------------
  // Tab Navigation
  // --------------------------------------------------------------------------

  test.describe("Tab Navigation", () => {
    test("should switch to History tab when clicked", async ({ page }) => {
      const persona = getPersona("alex");
      await loginAsUser(page, persona.email);
      await page.goto("/pulse");
      await page.waitForSelector("main", { timeout: 10000 });

      // Click History tab
      const historyTab = page.locator("button", { hasText: "History" });
      await historyTab.click();

      // History tab should become active
      await expect(historyTab).toHaveClass(/bg-\[#0F172A\]/, { timeout: 3000 });

      // Log tab should no longer have active styling
      const logTab = page.locator("button", { hasText: "Log" }).first();
      await expect(logTab).not.toHaveClass(/bg-\[#0F172A\]/);

      // History content should appear — for a fresh user, the empty state
      await expect(
        page.getByText(/Start your Daily Pulse|Current Streak/i)
      ).toBeVisible({ timeout: 5000 });
    });

    test("should switch back to Log tab when clicked", async ({ page }) => {
      const persona = getPersona("alex");
      await loginAsUser(page, persona.email);
      await page.goto("/pulse");
      await page.waitForSelector("main", { timeout: 10000 });

      // Switch to History
      await page.locator("button", { hasText: "History" }).click();
      await expect(
        page.locator("button", { hasText: "History" })
      ).toHaveClass(/bg-\[#0F172A\]/, { timeout: 3000 });

      // Switch back to Log
      const logTab = page.locator("button", { hasText: "Log" }).first();
      await logTab.click();

      // Log tab should be active again
      await expect(logTab).toHaveClass(/bg-\[#0F172A\]/, { timeout: 3000 });

      // Weight input should be visible again
      await expect(page.getByLabel("Weight")).toBeVisible({ timeout: 5000 });
    });
  });

  // --------------------------------------------------------------------------
  // History View
  // --------------------------------------------------------------------------

  test.describe("History View", () => {
    test("should show empty state when no pulses exist", async ({ page }) => {
      const persona = getPersona("alex");
      await loginAsUser(page, persona.email);
      await page.goto("/pulse");
      await page.waitForSelector("main", { timeout: 10000 });

      // Switch to History tab
      await page.locator("button", { hasText: "History" }).click();

      // Should show the empty state message
      await expect(page.getByText("Start your Daily Pulse")).toBeVisible({ timeout: 5000 });
      await expect(page.getByText("Track your weight daily to see trends here")).toBeVisible({ timeout: 5000 });
    });

    test("should show streak stats cards when pulses exist", async ({ page }) => {
      const persona = getPersona("alex");
      await loginAsUser(page, persona.email);

      // Create pulse data via API
      const today = new Date().toISOString().split("T")[0];
      await page.request.post("/api/pulse", {
        data: { date: today, weight: 175.0, notes: "Test" },
      });

      await page.goto("/pulse");
      await page.waitForSelector("main", { timeout: 10000 });

      // Switch to History tab
      await page.locator("button", { hasText: "History" }).click();

      // Should see the three stat cards
      await expect(page.getByText("Current Streak")).toBeVisible({ timeout: 5000 });
      await expect(page.getByText("Best Streak")).toBeVisible({ timeout: 5000 });
      await expect(page.getByText("Total Check-ins")).toBeVisible({ timeout: 5000 });
    });

    test("should show recent entries list when pulses exist", async ({ page }) => {
      const persona = getPersona("alex");
      await loginAsUser(page, persona.email);

      // Create pulse data via API
      const today = new Date().toISOString().split("T")[0];
      await page.request.post("/api/pulse", {
        data: { date: today, weight: 172.3 },
      });

      await page.goto("/pulse");
      await page.waitForSelector("main", { timeout: 10000 });

      // Switch to History tab
      await page.locator("button", { hasText: "History" }).click();

      // Should show "Recent Entries" heading
      await expect(page.getByText("Recent Entries")).toBeVisible({ timeout: 5000 });

      // Should show the logged weight in the entries list
      await expect(page.getByText("172.3 lbs")).toBeVisible({ timeout: 5000 });
    });

    test("should show period selector buttons", async ({ page }) => {
      const persona = getPersona("alex");
      await loginAsUser(page, persona.email);

      // Create pulse so history view shows full content (not empty state)
      const today = new Date().toISOString().split("T")[0];
      await page.request.post("/api/pulse", {
        data: { date: today, weight: 170.0 },
      });

      await page.goto("/pulse");
      await page.waitForSelector("main", { timeout: 10000 });

      // Switch to History tab
      await page.locator("button", { hasText: "History" }).click();

      // Should show period selector buttons: 7d, 30d, 90d
      await expect(page.getByRole("button", { name: "7d" })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole("button", { name: "30d" })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole("button", { name: "90d" })).toBeVisible({ timeout: 5000 });
    });
  });

  // --------------------------------------------------------------------------
  // Dashboard Integration
  // --------------------------------------------------------------------------

  test.describe("Dashboard Integration", () => {
    test("should have Log weight CTA linking to /pulse", async ({ page }) => {
      const persona = getPersona("marcus");
      await loginAsUser(page, persona.email);
      await page.waitForURL("**/dashboard/**", { timeout: 15000 });

      // Dismiss "Welcome back" modal if it appears
      const dismissButton = page.getByText("Not today, remind me tomorrow");
      try {
        await dismissButton.waitFor({ state: "visible", timeout: 5000 });
        await dismissButton.click();
        await dismissButton.waitFor({ state: "hidden", timeout: 5000 });
      } catch {
        // Modal might not appear, continue
      }

      // Find the "Log weight" link
      const logWeightLink = page.locator("a[href='/pulse']", { hasText: "Log weight" });
      await expect(logWeightLink).toBeVisible({ timeout: 10000 });

      // Click it and verify navigation to /pulse
      await logWeightLink.click();
      await page.waitForURL("**/pulse", { timeout: 10000 });
      expect(page.url()).toContain("/pulse");
    });
  });

  // --------------------------------------------------------------------------
  // Header Navigation
  // --------------------------------------------------------------------------

  test.describe("Header Navigation", () => {
    test("should show Pulse link in header for authenticated users", async ({ page }) => {
      const persona = getPersona("alex");
      await loginAsUser(page, persona.email);
      await page.goto("/pulse");
      await page.waitForSelector("main", { timeout: 10000 });

      // Header should contain a "Pulse" link pointing to /pulse
      const pulseLink = page.locator("header a[href='/pulse']");
      await expect(pulseLink).toBeVisible({ timeout: 5000 });
      await expect(pulseLink).toHaveText(/Pulse/);
    });
  });
});
