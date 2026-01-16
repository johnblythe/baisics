'use client';

interface RestDayOptionFProps {
  othersResting?: number;
  topPerformerRestDays?: number;
  nextWorkout?: {
    name: string;
    dayOfWeek: string;
  };
}

/**
 * Option F: Social Proof Rest Card
 * - Shows community rest day activity
 * - "X others are resting today" or "Top performers rest 2x/week"
 * - Anonymous avatars of others resting
 * - Normalizes rest, reduces guilt
 * - Light, not heavy-handed
 */
export function RestDayOptionF({
  othersResting = 2847,
  topPerformerRestDays = 2,
  nextWorkout,
}: RestDayOptionFProps) {
  // Generate random avatar colors for community display
  const avatarColors = [
    'from-[#22D3EE] to-[#06B6D4]',
    'from-[#34D399] to-[#10B981]',
    'from-[#A78BFA] to-[#8B5CF6]',
    'from-[#F472B6] to-[#EC4899]',
    'from-[#FBBF24] to-[#F59E0B]',
    'from-[#60A5FA] to-[#3B82F6]',
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main Card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #ECFEFF 0%, #CFFAFE 50%, #A5F3FC 100%)',
          boxShadow: '0 4px 20px rgba(6, 182, 212, 0.15)',
        }}
      >
        {/* Header */}
        <div className="p-6 text-center">
          {/* Community Icon */}
          <div className="relative inline-block mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #22D3EE 0%, #06B6D4 100%)',
                boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)',
              }}
            >
              <svg
                className="w-9 h-9 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>

          <h2
            className="text-xl font-bold text-[#0E7490] mb-1"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Rest Day
          </h2>
          <p className="text-[#0891B2] text-sm">
            You&apos;re in good company
          </p>
        </div>

        {/* Others Resting Today */}
        <div className="px-6 pb-4">
          <div className="bg-white/70 rounded-xl p-5 border border-[#22D3EE]/30">
            {/* Avatar Stack */}
            <div className="flex justify-center mb-4">
              <div className="flex -space-x-3">
                {avatarColors.map((gradient, index) => (
                  <div
                    key={index}
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} border-2 border-white shadow-sm flex items-center justify-center`}
                    style={{ zIndex: avatarColors.length - index }}
                  >
                    <svg
                      className="w-5 h-5 text-white/80"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                ))}
                {/* "+more" indicator */}
                <div className="w-10 h-10 rounded-full bg-[#0E7490] border-2 border-white shadow-sm flex items-center justify-center">
                  <span className="text-white text-xs font-medium">+{Math.floor(othersResting / 100)}k</span>
                </div>
              </div>
            </div>

            {/* Count Display */}
            <div className="text-center">
              <p className="text-[#0E7490] font-bold text-2xl mb-1">
                {othersResting.toLocaleString()}
              </p>
              <p className="text-[#0891B2] text-sm">
                others are resting today
              </p>
            </div>
          </div>
        </div>

        {/* Top Performers Insight */}
        <div className="px-6 pb-4">
          <div className="bg-white/50 rounded-xl p-4 border border-[#22D3EE]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FEF08A] to-[#FDE047] flex items-center justify-center shadow-sm flex-shrink-0">
                <svg
                  className="w-5 h-5 text-amber-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 3l3.057-3L20 12 8.057 24 5 21l9-9-9-9z" />
                </svg>
              </div>
              <div>
                <p className="text-[#0E7490] font-medium text-sm">
                  Top performers rest {topPerformerRestDays}x per week
                </p>
                <p className="text-[#0891B2]/70 text-xs">
                  Rest is part of the winning formula
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reassuring Message */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-center gap-2 text-[#0891B2]/60 text-xs">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Smart athletes prioritize recovery</span>
          </div>
        </div>

        {/* Next Workout Preview */}
        {nextWorkout && (
          <div className="px-6 pb-6">
            <div className="bg-white/50 rounded-xl p-4 text-center border border-[#22D3EE]/20">
              <p className="text-xs text-[#0891B2]/70 uppercase tracking-wider font-medium mb-1">
                Back at it
              </p>
              <p className="text-[#0E7490] font-medium">
                {nextWorkout.name} · {nextWorkout.dayOfWeek}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
