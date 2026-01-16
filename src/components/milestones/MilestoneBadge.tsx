'use client';

import { MilestoneConfig, getMilestoneConfig, getNextMilestone, MILESTONES } from '@/lib/milestones';
import { MilestoneType } from '@prisma/client';
import {
  Star,
  Flame,
  Medal,
  Dumbbell,
  Crown,
  Diamond,
  CalendarCheck,
  Trophy,
  Infinity,
  Lock,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  star: Star,
  flame: Flame,
  medal: Medal,
  dumbbell: Dumbbell,
  crown: Crown,
  diamond: Diamond,
  'calendar-check': CalendarCheck,
  trophy: Trophy,
  infinity: Infinity,
};

interface MilestoneBadgeProps {
  type: MilestoneType;
  earned: boolean;
  earnedAt?: Date;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onClick?: () => void;
}

export function MilestoneBadge({
  type,
  earned,
  earnedAt,
  size = 'md',
  showLabel = true,
  onClick,
}: MilestoneBadgeProps) {
  const config = getMilestoneConfig(type);
  if (!config) return null;

  const Icon = ICON_MAP[config.icon] || Star;

  const sizeClasses = {
    sm: { container: 'w-12 h-12', icon: 'w-5 h-5', text: 'text-[10px]' },
    md: { container: 'w-16 h-16', icon: 'w-6 h-6', text: 'text-xs' },
    lg: { container: 'w-20 h-20', icon: 'w-8 h-8', text: 'text-sm' },
  };

  const sizes = sizeClasses[size];

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`flex flex-col items-center gap-1 ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div
        className={`
          ${sizes.container} rounded-xl flex items-center justify-center relative
          ${earned
            ? `bg-gradient-to-br ${config.gradient} shadow-lg`
            : 'bg-gray-200 dark:bg-gray-700'
          }
          transition-all duration-300
          ${onClick && earned ? 'hover:scale-105 hover:shadow-xl' : ''}
        `}
      >
        {earned ? (
          <>
            <Icon className={`${sizes.icon} text-white`} />
            {/* Subtle glow effect for earned badges */}
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${config.gradient} opacity-30 blur-md -z-10`} />
          </>
        ) : (
          <Lock className={`${sizes.icon} text-gray-400 dark:text-gray-500`} />
        )}
      </div>

      {showLabel && (
        <div className="text-center">
          <div className={`${sizes.text} font-semibold ${earned ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
            {config.threshold}
          </div>
          {size !== 'sm' && (
            <div className={`${sizes.text} ${earned ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
              {config.name}
            </div>
          )}
        </div>
      )}
    </button>
  );
}

interface MilestoneBadgeGridProps {
  earnedMilestones: { type: MilestoneType; earnedAt: Date }[];
  totalWorkouts: number;
  onBadgeClick?: (type: MilestoneType, earned: boolean) => void;
}

export function MilestoneBadgeGrid({
  earnedMilestones,
  totalWorkouts,
  onBadgeClick,
}: MilestoneBadgeGridProps) {
  const earnedSet = new Set(earnedMilestones.map((m) => m.type));
  const nextMilestone = getNextMilestone(totalWorkouts);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 sm:gap-4">
        {MILESTONES.map((milestone) => {
          const earned = earnedSet.has(milestone.type);
          const earnedData = earnedMilestones.find((m) => m.type === milestone.type);
          return (
            <MilestoneBadge
              key={milestone.type}
              type={milestone.type}
              earned={earned}
              earnedAt={earnedData?.earnedAt}
              size="md"
              onClick={onBadgeClick ? () => onBadgeClick(milestone.type, earned) : undefined}
            />
          );
        })}
      </div>

      {/* Progress to next milestone */}
      {nextMilestone && (
        <div className="mt-6 px-2">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">Progress to next</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {totalWorkouts}/{nextMilestone.threshold}
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${nextMilestone.gradient} transition-all duration-500`}
              style={{ width: `${Math.min(100, (totalWorkouts / nextMilestone.threshold) * 100)}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            {nextMilestone.threshold - totalWorkouts} workouts to{' '}
            <span className="font-medium">{nextMilestone.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default MilestoneBadge;
