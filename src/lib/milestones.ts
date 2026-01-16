import { MilestoneType } from '@prisma/client';

export interface MilestoneConfig {
  type: MilestoneType;
  threshold: number;
  name: string;
  quote: string;
  icon: string;
  gradient: string;
}

// Milestone configurations from design spec (236-design-concepts.md)
export const MILESTONES: MilestoneConfig[] = [
  {
    type: 'WORKOUT_1',
    threshold: 1,
    name: 'Day One',
    quote: 'The first rep is the hardest one to take.',
    icon: 'star',
    gradient: 'from-amber-400 to-amber-600',
  },
  {
    type: 'WORKOUT_10',
    threshold: 10,
    name: 'Getting Started',
    quote: "Ten down. You're building something.",
    icon: 'flame',
    gradient: 'from-orange-400 to-orange-600',
  },
  {
    type: 'WORKOUT_25',
    threshold: 25,
    name: 'Quarter Century',
    quote: 'Twenty-five workouts. The habit is forming.',
    icon: 'medal',
    gradient: 'from-yellow-400 to-yellow-600',
  },
  {
    type: 'WORKOUT_50',
    threshold: 50,
    name: 'Fifty Strong',
    quote: 'Fifty workouts. This is who you are now.',
    icon: 'dumbbell',
    gradient: 'from-emerald-400 to-emerald-600',
  },
  {
    type: 'WORKOUT_100',
    threshold: 100,
    name: 'Century Club',
    quote: "One hundred workouts. You're in the Century Club.",
    icon: 'crown',
    gradient: 'from-blue-400 to-blue-600',
  },
  {
    type: 'WORKOUT_250',
    threshold: 250,
    name: 'Two-Fifty',
    quote: 'Two hundred fifty. Most people quit at ten.',
    icon: 'diamond',
    gradient: 'from-violet-400 to-violet-600',
  },
  {
    type: 'WORKOUT_365',
    threshold: 365,
    name: "Year's Worth",
    quote: "A year's worth of workouts. Respect earned.",
    icon: 'calendar-check',
    gradient: 'from-indigo-400 to-indigo-600',
  },
  {
    type: 'WORKOUT_500',
    threshold: 500,
    name: 'Five Hundred',
    quote: 'Five hundred workouts. Elite commitment.',
    icon: 'trophy',
    gradient: 'from-rose-400 to-rose-600',
  },
  {
    type: 'WORKOUT_1000',
    threshold: 1000,
    name: 'The Thousand',
    quote: 'One thousand workouts. Legendary.',
    icon: 'infinity',
    gradient: 'from-[#FF6B6B] to-[#0F172A]',
  },
];

// Helper to get milestone config by type
export function getMilestoneConfig(type: MilestoneType): MilestoneConfig | undefined {
  return MILESTONES.find((m) => m.type === type);
}

// Helper to get milestone by threshold
export function getMilestoneByThreshold(threshold: number): MilestoneConfig | undefined {
  return MILESTONES.find((m) => m.threshold === threshold);
}

// Check which milestones are unlocked by a given workout count
export function getUnlockedMilestones(totalWorkouts: number): MilestoneConfig[] {
  return MILESTONES.filter((m) => totalWorkouts >= m.threshold);
}

// Get the next milestone a user needs to reach
export function getNextMilestone(totalWorkouts: number): MilestoneConfig | undefined {
  return MILESTONES.find((m) => m.threshold > totalWorkouts);
}

// Check if a specific workout count crosses a milestone threshold
export function checkMilestoneThresholdCrossed(
  previousCount: number,
  newCount: number
): MilestoneConfig | null {
  const crossed = MILESTONES.find(
    (m) => previousCount < m.threshold && newCount >= m.threshold
  );
  return crossed || null;
}

// Format volume (lbs) for display
export function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M lbs`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K lbs`;
  }
  return `${Math.round(volume)} lbs`;
}
