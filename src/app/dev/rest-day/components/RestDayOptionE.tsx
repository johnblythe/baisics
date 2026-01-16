'use client';

interface RestDayOptionEProps {
  streak?: number;
  restDayXP?: number;
  nextWorkout?: {
    name: string;
    dayOfWeek: string;
  };
}

/**
 * Option E: Gamified Rest Card
 * - Rest day as an 'achievement' or 'mission'
 * - XP/points for taking rest day
 * - Recovery progress indicator that fills over the day
 * - Streak includes rest days (training streak concept)
 * - Gamified but not annoying
 */
export function RestDayOptionE({
  streak = 7,
  restDayXP = 50,
  nextWorkout,
}: RestDayOptionEProps) {
  // Calculate recovery progress based on time of day (0-24 hours)
  const now = new Date();
  const hoursElapsed = now.getHours() + now.getMinutes() / 60;
  const recoveryProgress = Math.min((hoursElapsed / 24) * 100, 100);
  const hoursDisplay = Math.floor(hoursElapsed);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main Card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #FDF4FF 0%, #FAE8FF 50%, #F5D0FE 100%)',
          boxShadow: '0 4px 20px rgba(168, 85, 247, 0.15)',
        }}
      >
        {/* Header with Achievement Badge */}
        <div className="p-6 text-center">
          {/* Achievement Badge */}
          <div className="relative inline-block mb-4">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #D946EF 0%, #A855F7 50%, #7C3AED 100%)',
              }}
            >
              <svg
                className="w-10 h-10 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            {/* XP Badge */}
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold shadow-md">
              +{restDayXP} XP
            </div>
            {/* Sparkle effects */}
            <div className="absolute -left-1 top-0 w-2 h-2 rounded-full bg-yellow-300 animate-ping opacity-75" />
            <div className="absolute -right-1 bottom-2 w-1.5 h-1.5 rounded-full bg-fuchsia-300 animate-ping opacity-75" style={{ animationDelay: '0.5s' }} />
          </div>

          <h2
            className="text-xl font-bold text-[#86198F] mb-1"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Recovery Mission
          </h2>
          <p className="text-[#A21CAF] text-sm">
            Active rest is part of the journey
          </p>
        </div>

        {/* Recovery Progress */}
        <div className="px-6 pb-4">
          <div className="bg-white/60 rounded-xl p-5 border border-[#E879F9]/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FAE8FF] to-[#F5D0FE] flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-[#A855F7]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <span className="text-[#86198F] font-medium text-sm">Recovery Progress</span>
              </div>
              <span className="text-[#A21CAF] text-sm font-mono">
                {hoursDisplay}/24 hrs
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-4 bg-[#FAE8FF] rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out relative"
                style={{
                  width: `${recoveryProgress}%`,
                  background: 'linear-gradient(90deg, #D946EF 0%, #A855F7 50%, #7C3AED 100%)',
                }}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              </div>
            </div>

            {/* Progress message */}
            <p className="text-xs text-[#A21CAF]/70 mt-2 text-center">
              {recoveryProgress < 50
                ? 'Keep resting, gains are happening!'
                : recoveryProgress < 100
                ? 'Great progress - recovery almost complete!'
                : 'Mission complete! Full recovery achieved.'}
            </p>
          </div>
        </div>

        {/* Streak Display */}
        <div className="px-6 pb-4">
          <div className="bg-white/50 rounded-xl p-4 border border-[#E879F9]/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FEF08A] to-[#FDE047] flex items-center justify-center shadow-sm">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.5 2C8.5 2 6 6 6 6s5 1 3 9c0 0 3.5-1.5 4.5-4 0 0 .5 2.5 0 4.5 0 0 4-1 5-4.5s0-7-6-9z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-[#A21CAF]/70 uppercase tracking-wider font-medium">
                  Training Streak
                </p>
                <p className="text-[#86198F] font-bold text-lg">
                  {streak} Days
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#A21CAF]/50 block">Includes rest</span>
              <span className="text-green-600 text-xs font-medium">✓ Protected</span>
            </div>
          </div>
        </div>

        {/* Badges Earned */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 justify-center">
            <span className="text-xs text-[#A21CAF]/60">Today&apos;s badges:</span>
            <div className="flex gap-1">
              {/* Rest day badge */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #86EFAC 0%, #22C55E 100%)' }}
                title="Rest Champion"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              {/* Recovery badge */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' }}
                title="Recovery Master"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              {/* Streak shield */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #FDE047 0%, #F59E0B 100%)' }}
                title="Streak Shield"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Next Workout Preview */}
        {nextWorkout && (
          <div className="px-6 pb-6">
            <div className="bg-white/50 rounded-xl p-4 text-center border border-[#E879F9]/20">
              <p className="text-xs text-[#A21CAF]/70 uppercase tracking-wider font-medium mb-1">
                Next Mission
              </p>
              <p className="text-[#86198F] font-medium">
                {nextWorkout.name} · {nextWorkout.dayOfWeek}
              </p>
              <p className="text-xs text-[#A21CAF]/50 mt-1">
                Reward: +100 XP
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
