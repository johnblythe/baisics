import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

/**
 * Lightweight analytics for tracking user funnel events
 * Uses app_logs table for storage
 */

export type AnalyticsCategory =
  | "auth"
  | "onboarding"
  | "program"
  | "workout"
  | "engagement"
  | "recovery_flow";

export type AnalyticsEvent =
  // Auth events
  | "magic_link_requested"
  | "magic_link_clicked"
  | "signup_completed"
  | "login_completed"
  // Onboarding events
  | "onboarding_started"
  | "onboarding_step_completed"
  | "onboarding_abandoned"
  // Program events
  | "program_generation_started"
  | "program_generation_completed"
  | "program_viewed"
  // Workout events
  | "workout_started"
  | "workout_completed"
  | "first_workout_completed"
  // Engagement
  | "dashboard_viewed"
  | "streak_updated"
  // Recovery (existing)
  | "screen_shown"
  | "option_selected"
  | "workout_completed";

interface TrackEventParams {
  category: AnalyticsCategory;
  event: AnalyticsEvent;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Track an analytics event to app_logs
 * Fire-and-forget - won't throw on failure
 */
export async function trackEvent({
  category,
  event,
  userId,
  metadata
}: TrackEventParams): Promise<void> {
  try {
    await prisma.appLog.create({
      data: {
        level: "INFO",
        category,
        type: event,
        message: `${category}:${event}`,
        metadata: (metadata ?? {}) as Prisma.InputJsonValue,
        userId: userId ?? null,
      },
    });
  } catch (error) {
    // Silent fail - analytics shouldn't break the app
    console.error("Analytics tracking failed:", error);
  }
}

/**
 * Track event from client-side via API
 */
export async function trackEventClient(params: TrackEventParams): Promise<void> {
  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
  } catch {
    // Silent fail
  }
}
