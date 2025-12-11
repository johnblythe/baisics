/**
 * Types for check-in feedback that informs program generation
 */

export interface CheckInSummary {
  checkInCount: number;
  dateRange: {
    first: Date | null;
    last: Date | null;
  };

  // Weight progression
  weight: {
    starting: number | null;
    current: number | null;
    change: number | null;
    trend: 'losing' | 'gaining' | 'maintaining' | 'unknown';
  };

  // Wellness averages (1-10 scale)
  wellness: {
    avgSleepHours: number | null;
    avgSleepQuality: number | null;
    avgEnergyLevel: number | null;
    avgStressLevel: number | null;
    avgSoreness: number | null;
    avgRecovery: number | null;
  };

  // Body measurement changes
  measurements: {
    chest: { start: number | null; current: number | null; change: number | null };
    waist: { start: number | null; current: number | null; change: number | null };
    hips: { start: number | null; current: number | null; change: number | null };
    bicepLeft: { start: number | null; current: number | null; change: number | null };
    bicepRight: { start: number | null; current: number | null; change: number | null };
    thighLeft: { start: number | null; current: number | null; change: number | null };
    thighRight: { start: number | null; current: number | null; change: number | null };
  };

  // Adherence
  adherence: {
    checkInFrequency: 'regular' | 'sporadic' | 'none';
    completedWorkouts: number;
    missedWorkouts: number;
  };

  // Recent notes (last 3)
  recentNotes: string[];
}

export interface CheckInFeedbackContext {
  hasHistory: boolean;
  summary: CheckInSummary | null;
  recommendations: string[];
}
