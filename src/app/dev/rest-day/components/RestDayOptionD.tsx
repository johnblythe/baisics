'use client';

interface RestDayOptionDProps {
  nextWorkout?: {
    name: string;
    dayOfWeek: string;
  };
}

const RECOVERY_TIPS = [
  {
    tip: 'Muscle growth happens during rest, not during workouts. Training creates the stimulus; recovery builds the muscle.',
    source: 'Exercise Physiology Research',
    icon: 'muscle',
  },
  {
    tip: 'Sleep 7-9 hours for optimal recovery. Growth hormone peaks during deep sleep, accelerating tissue repair.',
    source: 'Sleep Science Foundation',
    icon: 'moon',
  },
  {
    tip: 'Hydration supports nutrient delivery to muscles. Aim for half your body weight in ounces daily.',
    source: 'Sports Nutrition Guidelines',
    icon: 'water',
  },
  {
    tip: 'Active recovery (light walking, stretching) can reduce soreness by 40% compared to complete rest.',
    source: 'Journal of Sports Medicine',
    icon: 'heart',
  },
  {
    tip: 'Protein synthesis remains elevated 24-48 hours after training. Your rest day is when gains are made.',
    source: 'Muscle & Fitness Research',
    icon: 'chart',
  },
];

function TipIcon({ type }: { type: string }) {
  switch (type) {
    case 'muscle':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case 'moon':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      );
    case 'water':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      );
    case 'heart':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    case 'chart':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    default:
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
  }
}

/**
 * Option D: Coach Wisdom Card
 * - Rotating tip of the day about recovery
 * - Educational, subtle, builds trust
 * - Not preachy - shares science-backed wisdom
 */
export function RestDayOptionD({ nextWorkout }: RestDayOptionDProps) {
  // Get a "random" tip based on the day of week for consistency
  const tipIndex = new Date().getDay() % RECOVERY_TIPS.length;
  const currentTip = RECOVERY_TIPS[tipIndex];

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main Card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 50%, #DDD6FE 100%)',
          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.12)',
        }}
      >
        {/* Header */}
        <div className="p-6 text-center">
          {/* Icon */}
          <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] flex items-center justify-center shadow-md mb-4">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>

          <h2
            className="text-xl font-semibold text-[#5B21B6] mb-1"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Rest Day
          </h2>
          <p className="text-[#7C3AED] text-sm">
            Recovery wisdom for today
          </p>
        </div>

        {/* Tip Card */}
        <div className="px-6 pb-4">
          <div className="bg-white/70 rounded-xl p-5 border border-[#C4B5FD]/50">
            {/* Tip header with icon */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#EDE9FE] to-[#DDD6FE] flex items-center justify-center text-[#7C3AED]">
                <TipIcon type={currentTip.icon} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-[#8B5CF6] uppercase tracking-wider font-medium">
                  Recovery Tip
                </p>
              </div>
            </div>

            {/* Tip content */}
            <p className="text-[#5B21B6] leading-relaxed mb-3">
              {currentTip.tip}
            </p>

            {/* Source attribution */}
            <p className="text-xs text-[#8B5CF6]/70 italic">
              — {currentTip.source}
            </p>
          </div>
        </div>

        {/* Subtle message */}
        <div className="px-6 pb-4">
          <div className="bg-white/40 rounded-lg px-4 py-2.5 text-center">
            <p className="text-xs text-[#5B21B6]/70">
              Your body is recovering and getting stronger today
            </p>
          </div>
        </div>

        {/* Next Workout Preview */}
        {nextWorkout && (
          <div className="px-6 pb-6">
            <div className="bg-white/50 rounded-xl p-4 text-center border border-[#C4B5FD]/30">
              <p className="text-xs text-[#5B21B6]/70 uppercase tracking-wider font-medium mb-1">
                Next Workout
              </p>
              <p className="text-[#5B21B6] font-medium">
                {nextWorkout.name} · {nextWorkout.dayOfWeek}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
