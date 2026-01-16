'use client';

interface RestDayOptionCProps {
  nextWorkout?: {
    name: string;
    dayOfWeek: string;
  };
}

/**
 * Option C: Active Recovery Suggestions Card
 * - 2-3 optional activity tiles
 * - Options: Log Nutrition, Light Stretch, Train Anyway
 * - One option is locked/premium
 * - Clear that these are OPTIONAL - rest is fine
 */
export function RestDayOptionC({ nextWorkout }: RestDayOptionCProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main Card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 50%, #BBF7D0 100%)',
          boxShadow: '0 4px 20px rgba(34, 197, 94, 0.12)',
        }}
      >
        {/* Header */}
        <div className="p-6 text-center">
          {/* Icon */}
          <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-[#4ADE80] to-[#22C55E] flex items-center justify-center shadow-md mb-4">
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
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>

          <h2
            className="text-xl font-semibold text-[#166534] mb-1"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Rest Day
          </h2>
          <p className="text-[#15803D] text-sm">
            Take it easy, or try something light
          </p>
        </div>

        {/* Optional note */}
        <div className="px-6">
          <div className="bg-white/60 rounded-lg px-4 py-2 text-center mb-4">
            <p className="text-xs text-[#166534]/80">
              These are <span className="font-medium">optional</span> — resting is totally fine
            </p>
          </div>
        </div>

        {/* Activity Options */}
        <div className="px-6 pb-6 space-y-3">
          {/* Option 1: Log Nutrition */}
          <button className="w-full bg-white/80 hover:bg-white rounded-xl p-4 flex items-center gap-4 transition-all group border border-[#86EFAC]/50 hover:border-[#4ADE80] hover:shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-[#D97706]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-[#166534] group-hover:text-[#14532D]">Log Nutrition</p>
              <p className="text-sm text-[#15803D]/70">Track today&apos;s meals</p>
            </div>
            <svg
              className="w-5 h-5 text-[#86EFAC] group-hover:text-[#4ADE80] transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Option 2: Light Stretch (Premium/Locked) */}
          <button className="w-full bg-white/50 rounded-xl p-4 flex items-center gap-4 border border-dashed border-[#86EFAC] relative overflow-hidden cursor-not-allowed">
            {/* Premium badge */}
            <div className="absolute top-2 right-2 bg-[#A855F7] text-white text-xs px-2 py-0.5 rounded-full font-medium">
              Premium
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F3E8FF] to-[#E9D5FF] flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-[#9333EA]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-[#166534]/60">Light Stretch</p>
              <p className="text-sm text-[#15803D]/50">10 min guided video</p>
            </div>
            <svg
              className="w-5 h-5 text-[#A855F7]/60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </button>

          {/* Option 3: Train Anyway */}
          <button className="w-full bg-white/80 hover:bg-white rounded-xl p-4 flex items-center gap-4 transition-all group border border-[#86EFAC]/50 hover:border-[#4ADE80] hover:shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#DBEAFE] to-[#BFDBFE] flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-[#2563EB]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-[#166534] group-hover:text-[#14532D]">Train Anyway</p>
              <p className="text-sm text-[#15803D]/70">Feeling energized?</p>
            </div>
            <svg
              className="w-5 h-5 text-[#86EFAC] group-hover:text-[#4ADE80] transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Next Workout Preview */}
        {nextWorkout && (
          <div className="px-6 pb-6">
            <div className="bg-white/40 rounded-xl p-4 text-center border border-[#86EFAC]/30">
              <p className="text-xs text-[#166534]/70 uppercase tracking-wider font-medium mb-1">
                Scheduled Next
              </p>
              <p className="text-[#166534] font-medium">
                {nextWorkout.name} · {nextWorkout.dayOfWeek}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
