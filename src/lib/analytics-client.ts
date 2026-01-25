/**
 * Client-safe analytics utilities
 * Use this file for client components - it doesn't import Prisma
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
  | "option_selected";

export interface TrackEventParams {
  category: AnalyticsCategory;
  event: AnalyticsEvent;
  userId?: string;
  metadata?: Record<string, unknown>;
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
