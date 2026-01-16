'use client';

interface RestDayOptionBProps {
  workoutsCompleted?: number;
  weeklyTarget?: number;
  streak?: number;
  nextWorkout?: {
    name: string;
    dayOfWeek: string;
  };
}

/**
 * Option B: Achievement Celebration Card
 * - Celebratory, shows week progress prominently
 * - "You crushed it!" messaging
 * - Progress ring showing weekly completion
 * - Streak display if applicable
 */
export function RestDayOptionB({
  workoutsCompleted = 3,
  weeklyTarget = 4,
  streak = 7,
  nextWorkout,
}: RestDayOptionBProps) {
  const progressPercent = Math.round((workoutsCompleted / weeklyTarget) * 100);
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main Card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 50%, #FED7AA 100%)',
          boxShadow: '0 4px 20px rgba(251, 146, 60, 0.15)',
        }}
      >
        {/* Celebration Header */}
        <div className="p-6 text-center">
          {/* Animated sparkle effect */}
          <div className="relative mb-4">
            <div className="absolute top-0 left-1/4 w-2 h-2 bg-[#FBBF24] rounded-full animate-ping opacity-75" />
            <div className="absolute top-2 right-1/4 w-1.5 h-1.5 bg-[#F97316] rounded-full animate-ping opacity-75 animation-delay-200" />
            <div className="absolute top-4 left-1/3 w-1 h-1 bg-[#FB923C] rounded-full animate-ping opacity-75 animation-delay-400" />

            {/* Trophy Icon */}
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#FBBF24] to-[#F97316] flex items-center justify-center shadow-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
          </div>

          {/* Main message */}
          <h2
            className="text-2xl font-bold text-[#9A3412] mb-1"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            You crushed it! 🔥
          </h2>
          <p className="text-[#C2410C] text-sm mb-6">
            Time to let those muscles recover
          </p>
        </div>

        {/* Progress Ring Section */}
        <div className="px-6 pb-6">
          <div className="bg-white/80 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-8">
              {/* Progress Ring */}
              <div className="relative">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#FED7AA"
                    strokeWidth="8"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#F97316"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-[#9A3412]">{workoutsCompleted}/{weeklyTarget}</span>
                  <span className="text-xs text-[#C2410C]">this week</span>
                </div>
              </div>

              {/* Stats */}
              <div className="text-left space-y-3">
                <div>
                  <p className="text-xs text-[#9A3412]/70 uppercase tracking-wider font-medium">Weekly Progress</p>
                  <p className="text-lg font-semibold text-[#9A3412]">{progressPercent}% Complete</p>
                </div>
                {streak > 0 && (
                  <div>
                    <p className="text-xs text-[#9A3412]/70 uppercase tracking-wider font-medium">Streak</p>
                    <p className="text-lg font-semibold text-[#9A3412] flex items-center gap-1">
                      {streak} days
                      <span className="text-base">⚡</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Next Workout Teaser */}
        {nextWorkout && (
          <div className="px-6 pb-6">
            <div className="bg-white/50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#9A3412]/70 uppercase tracking-wider font-medium mb-1">Coming Up</p>
                <p className="text-[#9A3412] font-medium">
                  {nextWorkout.name}
                </p>
                <p className="text-sm text-[#C2410C]">{nextWorkout.dayOfWeek}</p>
              </div>
              <button
                className="py-2 px-4 rounded-lg bg-[#F97316] text-white text-sm font-medium hover:bg-[#EA580C] transition-colors"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Preview →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
