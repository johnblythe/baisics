/**
 * API-level debug utilities
 *
 * These functions are used by API routes to check debug state
 * and transform responses accordingly. Components never need
 * to know about debug mode - they just receive different data.
 */

import { cookies } from 'next/headers';
import { DEBUG_COOKIE_NAME, type DebugState, DEBUG_STATES } from './index';

/**
 * Get the current debug state from the request cookie
 * Returns 'normal' if not in debug mode or in production
 */
export async function getDebugState(): Promise<DebugState> {
  if (process.env.NODE_ENV !== 'development') {
    return 'normal';
  }

  try {
    const cookieStore = await cookies();
    const debugCookie = cookieStore.get(DEBUG_COOKIE_NAME);

    if (debugCookie?.value) {
      const state = debugCookie.value as DebugState;
      if (DEBUG_STATES.find(s => s.value === state)) {
        return state;
      }
    }
  } catch {
    // Ignore cookie errors
  }

  return 'normal';
}

/**
 * Check if a specific debug state is active
 */
export async function isDebugState(...states: DebugState[]): Promise<boolean> {
  const current = await getDebugState();
  return states.includes(current);
}

// ============================================
// Route-specific override functions
// ============================================

/**
 * Override rest-day API response
 */
export function overrideRestDayData<T extends { isRestDay: boolean }>(
  data: T,
  debugState: DebugState
): T {
  if (debugState === 'rest_day') {
    return {
      ...data,
      isRestDay: true,
    };
  }
  return data;
}

/**
 * Override recovery API response
 */
export function overrideRecoveryData<T extends {
  needsRecovery: boolean;
  daysSinceLastWorkout: number;
  absenceType?: 'short' | 'medium' | 'long';
}>(
  data: T,
  debugState: DebugState
): T {
  switch (debugState) {
    case 'missed_1_day':
      return {
        ...data,
        needsRecovery: true,
        daysSinceLastWorkout: 2,
        absenceType: 'short',
      };
    case 'missed_3_days':
      return {
        ...data,
        needsRecovery: true,
        daysSinceLastWorkout: 4,
        absenceType: 'medium',
      };
    case 'missed_7_days':
      return {
        ...data,
        needsRecovery: true,
        daysSinceLastWorkout: 8,
        absenceType: 'long',
      };
    default:
      return data;
  }
}

/**
 * Override week 2 check-in API response
 */
export function overrideWeek2CheckInData<T extends {
  shouldShow?: boolean;
  alreadyShown?: boolean;
}>(
  data: T,
  debugState: DebugState
): T {
  if (debugState === 'week_2_checkin') {
    return {
      ...data,
      shouldShow: true,
      alreadyShown: false,
    };
  }
  return data;
}

/**
 * Override milestone data (for /api/milestones and workout completion)
 * Handles both flat { totalWorkouts } and nested { stats: { totalWorkouts } }
 */
export function overrideMilestoneData<T>(
  data: T,
  debugState: DebugState
): T {
  const overrideMap: Record<string, number> = {
    first_workout: 0,
    first_workout_complete: 1,
    milestone_10: 9,
    milestone_25: 24,
    milestone_50: 49,
  };

  const override = overrideMap[debugState];
  if (override === undefined) return data;

  // Handle nested stats structure (from /api/milestones)
  if (typeof data === 'object' && data !== null && 'stats' in data) {
    const d = data as any;
    return {
      ...d,
      stats: {
        ...d.stats,
        totalWorkouts: override,
      },
    };
  }

  // Handle flat structure
  if (typeof data === 'object' && data !== null && 'totalWorkouts' in data) {
    return { ...data, totalWorkouts: override };
  }

  return data;
}

/**
 * Override program completion data
 */
export function overrideProgramCompletionData<T extends {
  isComplete?: boolean;
  progressPercent?: number;
}>(
  data: T,
  debugState: DebugState
): T {
  switch (debugState) {
    case 'program_complete':
      return {
        ...data,
        isComplete: true,
        progressPercent: 100,
      };
    case 'program_almost_done':
      return {
        ...data,
        isComplete: false,
        progressPercent: 95,
      };
    default:
      return data;
  }
}

/**
 * Generic helper to apply debug overrides based on route type
 * Use this when you want automatic detection of which overrides to apply
 */
export type DebugRouteType =
  | 'rest-day'
  | 'recovery'
  | 'week2-checkin'
  | 'milestones'
  | 'program-completion';

export async function withDebugOverrides<T>(
  data: T,
  routeType: DebugRouteType
): Promise<T> {
  const debugState = await getDebugState();

  if (debugState === 'normal') {
    return data;
  }

  switch (routeType) {
    case 'rest-day':
      return overrideRestDayData(data as any, debugState) as T;
    case 'recovery':
      return overrideRecoveryData(data as any, debugState) as T;
    case 'week2-checkin':
      return overrideWeek2CheckInData(data as any, debugState) as T;
    case 'milestones':
      return overrideMilestoneData(data as any, debugState) as T;
    case 'program-completion':
      return overrideProgramCompletionData(data as any, debugState) as T;
    default:
      return data;
  }
}

/**
 * Log debug state for debugging the debug system itself
 */
export async function logDebugState(routeName: string): Promise<void> {
  if (process.env.NODE_ENV !== 'development') return;

  const state = await getDebugState();
  if (state !== 'normal') {
    console.log(`[DEBUG] ${routeName} - Active state: ${state}`);
  }
}
