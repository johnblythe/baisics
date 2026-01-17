/**
 * Debug System for Condition-Based Testing
 *
 * This system works at the API level - components receive modified data
 * and don't need to know about debug mode.
 *
 * Usage:
 * - URL: ?debug_state=rest_day (sets cookie, redirects without param)
 * - Console: window.baisicsDebug.setState('missed_3_days')
 * - API routes call: applyDebugOverrides(data, request)
 *
 * Only works in development mode.
 */

export type DebugState =
  | 'normal'
  | 'first_workout'           // User has 0 workouts, about to do first
  | 'first_workout_complete'  // Just completed first workout
  | 'rest_day'                // Force rest day view
  | 'missed_1_day'            // Missed 1 workout day
  | 'missed_3_days'           // Missed 3+ days (longer absence)
  | 'missed_7_days'           // Missed a week+
  | 'week_2_checkin'          // Trigger week 2 check-in
  | 'milestone_10'            // Next workout = 10th (will trigger milestone)
  | 'milestone_25'            // Next workout = 25th
  | 'milestone_50'            // Next workout = 50th
  | 'program_complete'        // Program is complete
  | 'program_almost_done';    // 95% through program

export const DEBUG_COOKIE_NAME = 'baisics_debug_state';

export const DEBUG_STATES: { value: DebugState; label: string; description: string }[] = [
  { value: 'normal', label: 'Normal', description: 'Default behavior - no overrides' },
  { value: 'first_workout', label: 'First Workout', description: 'User has 0 workouts completed' },
  { value: 'first_workout_complete', label: 'First Complete', description: 'Just completed first workout' },
  { value: 'rest_day', label: 'Rest Day', description: 'Force rest day dashboard view' },
  { value: 'missed_1_day', label: 'Missed 1 Day', description: 'Show 1-day recovery screen' },
  { value: 'missed_3_days', label: 'Missed 3+ Days', description: 'Show longer absence recovery' },
  { value: 'missed_7_days', label: 'Missed 7+ Days', description: 'Show extended absence recovery' },
  { value: 'week_2_checkin', label: 'Week 2 Check-in', description: 'Trigger week 2 modal' },
  { value: 'milestone_10', label: 'Milestone: 10', description: 'Next workout triggers 10th milestone' },
  { value: 'milestone_25', label: 'Milestone: 25', description: 'Next workout triggers 25th milestone' },
  { value: 'milestone_50', label: 'Milestone: 50', description: 'Next workout triggers 50th milestone' },
  { value: 'program_complete', label: 'Program Complete', description: 'Show completion celebration' },
  { value: 'program_almost_done', label: 'Almost Done', description: '95% through program' },
];

/**
 * Client-side debug manager for the debug panel UI
 * Sets cookies that API routes will read
 */
class DebugManagerClient {
  private listeners: Set<() => void> = new Set();
  private currentState: DebugState = 'normal';
  private enabled: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    if (process.env.NODE_ENV !== 'development') return;

    // Check URL params for debug state
    const params = new URLSearchParams(window.location.search);
    const stateParam = params.get('debug_state') as DebugState | null;

    if (stateParam && DEBUG_STATES.find(s => s.value === stateParam)) {
      this.setState(stateParam);
      // Remove param from URL (state is now in cookie)
      params.delete('debug_state');
      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    } else {
      // Load from cookie
      this.loadFromCookie();
    }

    // Expose to window
    (window as any).baisicsDebug = {
      setState: (state: DebugState) => this.setState(state),
      getState: () => this.getState(),
      reset: () => this.reset(),
      help: () => this.showHelp(),
      states: () => DEBUG_STATES.map(s => `${s.value}: ${s.description}`).join('\n'),
    };

    console.log(
      '%c🔧 Baisics Debug Mode Available',
      'color: #FF6B6B; font-weight: bold; font-size: 14px;'
    );
    console.log('Use window.baisicsDebug.help() for commands');
  }

  private loadFromCookie() {
    try {
      const cookie = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${DEBUG_COOKIE_NAME}=`));

      if (cookie) {
        const value = cookie.split('=')[1] as DebugState;
        if (DEBUG_STATES.find(s => s.value === value)) {
          this.currentState = value;
          this.enabled = value !== 'normal';
        }
      }
    } catch {
      // Ignore cookie errors
    }
  }

  private setCookie(state: DebugState) {
    if (typeof document === 'undefined') return;

    if (state === 'normal') {
      // Delete cookie
      document.cookie = `${DEBUG_COOKIE_NAME}=; path=/; max-age=0`;
    } else {
      // Set cookie (expires in 24 hours)
      document.cookie = `${DEBUG_COOKIE_NAME}=${state}; path=/; max-age=86400`;
    }
  }

  setState(state: DebugState) {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('Debug mode only works in development');
      return;
    }

    this.currentState = state;
    this.enabled = state !== 'normal';
    this.setCookie(state);
    this.notifyListeners();

    console.log(`Debug state set to: ${state}`);
    console.log('Reload the page to see changes (API will return modified data)');
  }

  getState(): DebugState {
    return this.currentState;
  }

  isEnabled(): boolean {
    return this.enabled && process.env.NODE_ENV === 'development';
  }

  reset() {
    this.setState('normal');
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(l => l());
  }

  private showHelp() {
    const states = DEBUG_STATES.map(s => `  ${s.value.padEnd(22)} - ${s.description}`).join('\n');
    console.log(`
%c🔧 Baisics Debug Commands

%cSet State (modifies API responses):
  window.baisicsDebug.setState('rest_day')
  window.baisicsDebug.setState('missed_3_days')
  window.baisicsDebug.setState('week_2_checkin')

%cOther:
  window.baisicsDebug.getState()   // See current state
  window.baisicsDebug.reset()      // Reset to normal
  window.baisicsDebug.states()     // List all states

%cURL Shortcut:
  ?debug_state=missed_3_days       // Sets state and reloads

%cAvailable States:
${states}

%cNote: After setting state, reload the page. The API will return
modified data and the app will behave as if you're in that state.
    `,
      'color: #FF6B6B; font-weight: bold; font-size: 16px;',
      'color: #0F172A; font-weight: bold;',
      'color: #0F172A; font-weight: bold;',
      'color: #0F172A; font-weight: bold;',
      'color: #94A3B8;',
      'color: #666; font-style: italic;'
    );
  }
}

export const debugManager = new DebugManagerClient();
