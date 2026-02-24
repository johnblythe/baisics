'use client';

interface DualRingProps {
  totals: { calories: number; protein: number };
  targets: { calories: number; protein: number };
  size: 'sm' | 'md';
}

export function DualRing({ totals, targets, size }: DualRingProps) {
  const calPct = targets.calories > 0
    ? Math.min(Math.round((totals.calories / targets.calories) * 100), 100)
    : 0;
  const protPct = targets.protein > 0
    ? Math.min(Math.round((totals.protein / targets.protein) * 100), 100)
    : 0;

  const isMd = size === 'md';
  const containerClass = isMd ? 'w-20 h-20' : 'w-14 h-14';

  return (
    <div className={`relative ${containerClass} flex-shrink-0`}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        {/* Outer ring — calories */}
        <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F5F9" strokeWidth="7" />
        <circle
          cx="50" cy="50" r="42"
          fill="none"
          stroke="#FF6B6B"
          strokeWidth="7"
          strokeDasharray={`${calPct * 2.64} 264`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.4s ease' }}
        />
        {/* Inner ring — protein */}
        <circle cx="50" cy="50" r="33" fill="none" stroke="#F1F5F9" strokeWidth="5" />
        <circle
          cx="50" cy="50" r="33"
          fill="none"
          stroke="#22C55E"
          strokeWidth="5"
          strokeDasharray={`${protPct * 2.07} 207`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.4s ease' }}
        />
      </svg>
      {isMd && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-[#0F172A]">{calPct}%</span>
        </div>
      )}
    </div>
  );
}
