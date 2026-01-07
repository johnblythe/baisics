/**
 * Coach Analytics Types
 * Shared between API route and page component
 */

export interface AnalyticsSummary {
  totalClients: number;
  activeThisWeek: number;
  avgWorkoutsPerWeek: number;
  /** Percentage 0-100 */
  programCompletionRate: number;
  totalWorkoutsLogged: number;
  totalCheckIns: number;
}

export interface WeeklyTrendEntry {
  week: string;
  /** ISO date string */
  weekStart: string;
  workouts: number;
  activeClients: number;
}

export interface ClientEngagement {
  clientId: string;
  workoutsLast4Weeks: number;
  avgPerWeek: number;
  active: boolean;
}

export interface CoachAnalyticsResponse {
  summary: AnalyticsSummary;
  /** Last 4 weeks of activity */
  weeklyTrend: WeeklyTrendEntry[];
  /** Top 10 clients by activity */
  clientEngagement: ClientEngagement[];
}
