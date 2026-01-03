'use client';

interface StreakBadgeProps {
  current: number;
  longest?: number;
  showLongest?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakBadge({
  current,
  longest,
  showLongest = false,
  size = 'md'
}: StreakBadgeProps) {
  // Don't show if no streak
  if (current === 0) return null;

  const sizes = {
    sm: 'text-sm gap-1',
    md: 'text-lg gap-2',
    lg: 'text-2xl gap-2'
  };

  const numberSizes = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  return (
    <div
      className={`inline-flex items-center ${sizes[size]} bg-coral-50 px-3 py-1.5 rounded-full`}
      title={`${current} day workout streak${longest && longest > current ? ` (best: ${longest})` : ''}`}
    >
      <span className={`font-bold text-coral-600 ${numberSizes[size]}`}>
        {current}
      </span>
      <span role="img" aria-label="fire">🔥</span>
      {showLongest && longest && longest > current && (
        <span className="text-gray-400 text-xs ml-1">
          (best: {longest})
        </span>
      )}
    </div>
  );
}
