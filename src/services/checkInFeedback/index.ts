/**
 * Check-in Feedback Service
 *
 * Fetches and summarizes check-in data to inform program generation.
 * This creates a feedback loop where user progress influences future programs.
 */

import { prisma } from '@/lib/prisma';
import type { CheckInSummary, CheckInFeedbackContext } from './types';

/**
 * Fetches all check-in data for a user and summarizes it for program generation
 */
export async function getCheckInFeedback(userId: string): Promise<CheckInFeedbackContext> {
  try {
    // Get user's check-ins with stats, ordered by date
    const checkIns = await prisma.checkIn.findMany({
      where: { userId },
      include: {
        stats: true,
      },
      orderBy: { date: 'asc' },
    });

    if (checkIns.length === 0) {
      return {
        hasHistory: false,
        summary: null,
        recommendations: ['No check-in history available - using baseline profile for generation.'],
      };
    }

    // Get workout completion stats
    const workoutLogs = await prisma.workoutLog.findMany({
      where: {
        workout: {
          workoutPlan: {
            program: { createdBy: userId },
          },
        },
      },
    });

    // Get user's intake for starting weight reference
    const userIntake = await prisma.userIntake.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    const summary = computeCheckInSummary(checkIns, workoutLogs, userIntake);
    const recommendations = generateRecommendations(summary);

    return {
      hasHistory: true,
      summary,
      recommendations,
    };
  } catch (error) {
    console.error('Error fetching check-in feedback:', error);
    return {
      hasHistory: false,
      summary: null,
      recommendations: ['Error fetching check-in history.'],
    };
  }
}

/**
 * Computes a summary of check-in data
 */
function computeCheckInSummary(
  checkIns: any[],
  workoutLogs: any[],
  userIntake: any
): CheckInSummary {
  const stats = checkIns
    .map((c) => c.stats)
    .filter(Boolean)
    .flat();

  const firstStats = stats[0];
  const lastStats = stats[stats.length - 1];

  // Calculate weight trend
  const startingWeight = userIntake?.weight || firstStats?.weight || null;
  const currentWeight = lastStats?.weight || null;
  const weightChange = startingWeight && currentWeight ? currentWeight - startingWeight : null;

  let weightTrend: 'losing' | 'gaining' | 'maintaining' | 'unknown' = 'unknown';
  if (weightChange !== null) {
    if (weightChange < -2) weightTrend = 'losing';
    else if (weightChange > 2) weightTrend = 'gaining';
    else weightTrend = 'maintaining';
  }

  // Calculate wellness averages
  const wellnessMetrics = {
    sleepHours: stats.map((s) => s.sleepHours).filter(Boolean),
    sleepQuality: stats.map((s) => s.sleepQuality).filter(Boolean),
    energyLevel: stats.map((s) => s.energyLevel).filter(Boolean),
    stressLevel: stats.map((s) => s.stressLevel).filter(Boolean),
    soreness: stats.map((s) => s.soreness).filter(Boolean),
    recovery: stats.map((s) => s.recovery).filter(Boolean),
  };

  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

  // Calculate measurement changes
  const getMeasurementChange = (field: string) => {
    const start = firstStats?.[field] || null;
    const current = lastStats?.[field] || null;
    return {
      start,
      current,
      change: start && current ? current - start : null,
    };
  };

  // Determine check-in frequency
  const daysSinceFirst = checkIns.length > 0
    ? Math.ceil((Date.now() - new Date(checkIns[0].date).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const expectedCheckIns = Math.floor(daysSinceFirst / 7); // Weekly expected
  const adherenceRatio = expectedCheckIns > 0 ? checkIns.length / expectedCheckIns : 0;

  let checkInFrequency: 'regular' | 'sporadic' | 'none' = 'none';
  if (checkIns.length === 0) checkInFrequency = 'none';
  else if (adherenceRatio >= 0.7) checkInFrequency = 'regular';
  else checkInFrequency = 'sporadic';

  // Get recent notes
  const recentNotes = checkIns
    .slice(-3)
    .map((c) => c.notes)
    .filter(Boolean);

  return {
    checkInCount: checkIns.length,
    dateRange: {
      first: checkIns[0]?.date || null,
      last: checkIns[checkIns.length - 1]?.date || null,
    },
    weight: {
      starting: startingWeight,
      current: currentWeight,
      change: weightChange,
      trend: weightTrend,
    },
    wellness: {
      avgSleepHours: avg(wellnessMetrics.sleepHours),
      avgSleepQuality: avg(wellnessMetrics.sleepQuality),
      avgEnergyLevel: avg(wellnessMetrics.energyLevel),
      avgStressLevel: avg(wellnessMetrics.stressLevel),
      avgSoreness: avg(wellnessMetrics.soreness),
      avgRecovery: avg(wellnessMetrics.recovery),
    },
    measurements: {
      chest: getMeasurementChange('chest'),
      waist: getMeasurementChange('waist'),
      hips: getMeasurementChange('hips'),
      bicepLeft: getMeasurementChange('bicepLeft'),
      bicepRight: getMeasurementChange('bicepRight'),
      thighLeft: getMeasurementChange('thighLeft'),
      thighRight: getMeasurementChange('thighRight'),
    },
    adherence: {
      checkInFrequency,
      completedWorkouts: workoutLogs.length,
      missedWorkouts: 0, // Would need more complex calculation
    },
    recentNotes,
  };
}

/**
 * Generates recommendations based on check-in summary
 */
function generateRecommendations(summary: CheckInSummary): string[] {
  const recommendations: string[] = [];

  // Weight-based recommendations
  if (summary.weight.trend === 'losing' && summary.weight.change && summary.weight.change < -5) {
    recommendations.push('Significant weight loss detected - consider increasing calories or reducing training volume.');
  }
  if (summary.weight.trend === 'gaining' && summary.weight.change && summary.weight.change > 5) {
    recommendations.push('Significant weight gain detected - review nutrition targets and training intensity.');
  }

  // Wellness-based recommendations
  if (summary.wellness.avgSleepHours && summary.wellness.avgSleepHours < 6) {
    recommendations.push('Low sleep reported - prioritize recovery and consider reducing training frequency.');
  }
  if (summary.wellness.avgEnergyLevel && summary.wellness.avgEnergyLevel < 4) {
    recommendations.push('Low energy levels - may need deload week or nutrition adjustment.');
  }
  if (summary.wellness.avgSoreness && summary.wellness.avgSoreness > 7) {
    recommendations.push('High soreness levels - consider reducing volume or adding recovery protocols.');
  }
  if (summary.wellness.avgStressLevel && summary.wellness.avgStressLevel > 7) {
    recommendations.push('High stress levels - prioritize lower-intensity training and recovery.');
  }

  // Adherence-based recommendations
  if (summary.adherence.checkInFrequency === 'sporadic') {
    recommendations.push('Inconsistent check-ins - encourage regular weekly tracking for better progress monitoring.');
  }

  // Measurement-based insights
  const waistChange = summary.measurements.waist.change;
  const armChange = (summary.measurements.bicepLeft.change || 0) + (summary.measurements.bicepRight.change || 0);
  if (waistChange && waistChange < -2 && armChange > 0) {
    recommendations.push('Positive body recomposition detected - maintaining current approach is working well.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Progress looks steady - continue with current training approach.');
  }

  return recommendations;
}

/**
 * Formats check-in feedback as a prompt section for AI generation
 */
export function formatCheckInFeedbackForPrompt(context: CheckInFeedbackContext): string {
  if (!context.hasHistory || !context.summary) {
    return 'No previous check-in history available. Generate program based on intake profile only.';
  }

  const s = context.summary;
  const lines: string[] = [
    '=== USER PROGRESS FEEDBACK ===',
    '',
    `Check-ins completed: ${s.checkInCount}`,
    `Tracking frequency: ${s.adherence.checkInFrequency}`,
    `Workouts completed: ${s.adherence.completedWorkouts}`,
    '',
  ];

  // Weight progress
  if (s.weight.current || s.weight.starting) {
    lines.push('Weight Progress:');
    if (s.weight.starting) lines.push(`  Starting: ${s.weight.starting} lbs`);
    if (s.weight.current) lines.push(`  Current: ${s.weight.current} lbs`);
    if (s.weight.change) lines.push(`  Change: ${s.weight.change > 0 ? '+' : ''}${s.weight.change.toFixed(1)} lbs`);
    lines.push(`  Trend: ${s.weight.trend}`);
    lines.push('');
  }

  // Wellness averages
  const w = s.wellness;
  if (w.avgSleepHours || w.avgEnergyLevel || w.avgRecovery) {
    lines.push('Wellness Averages (1-10 scale where applicable):');
    if (w.avgSleepHours) lines.push(`  Sleep: ${w.avgSleepHours.toFixed(1)} hrs/night`);
    if (w.avgSleepQuality) lines.push(`  Sleep Quality: ${w.avgSleepQuality.toFixed(1)}/10`);
    if (w.avgEnergyLevel) lines.push(`  Energy: ${w.avgEnergyLevel.toFixed(1)}/10`);
    if (w.avgStressLevel) lines.push(`  Stress: ${w.avgStressLevel.toFixed(1)}/10`);
    if (w.avgSoreness) lines.push(`  Soreness: ${w.avgSoreness.toFixed(1)}/10`);
    if (w.avgRecovery) lines.push(`  Recovery: ${w.avgRecovery.toFixed(1)}/10`);
    lines.push('');
  }

  // Measurement changes
  const hasChanges = Object.values(s.measurements).some((m) => m.change !== null);
  if (hasChanges) {
    lines.push('Body Measurement Changes:');
    for (const [key, val] of Object.entries(s.measurements)) {
      if (val.change !== null) {
        const sign = val.change > 0 ? '+' : '';
        lines.push(`  ${key}: ${sign}${val.change.toFixed(1)} inches`);
      }
    }
    lines.push('');
  }

  // Recommendations
  if (context.recommendations.length > 0) {
    lines.push('AI Recommendations based on progress:');
    context.recommendations.forEach((rec) => lines.push(`  - ${rec}`));
    lines.push('');
  }

  // Recent notes
  if (s.recentNotes.length > 0) {
    lines.push('Recent user notes:');
    s.recentNotes.forEach((note) => lines.push(`  "${note}"`));
  }

  return lines.join('\n');
}

export type { CheckInSummary, CheckInFeedbackContext };
