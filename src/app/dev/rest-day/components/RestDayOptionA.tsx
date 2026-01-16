'use client';

interface RestDayOptionAProps {
  nextWorkout?: {
    name: string;
    dayOfWeek: string;
  };
}

/**
 * Option A: Minimal Zen Rest Card
 * - Calm, light design with subtle gradient
 * - Minimal text, no pressure
 * - Permission to rest
 */
export function RestDayOptionA({ nextWorkout }: RestDayOptionAProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main Card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 50%, #F1F5F9 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Content */}
        <div className="p-8 text-center">
          {/* Subtle icon */}
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#E0F2FE] to-[#F0F9FF] flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[#0284C7]/60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2
            className="text-2xl font-medium text-[#0F172A] mb-3"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Rest Day
          </h2>

          {/* Encouraging message */}
          <p className="text-[#64748B] text-base mb-8 leading-relaxed">
            Your body grows stronger during rest. <br />
            Take it easy today.
          </p>

          {/* Divider */}
          <div className="w-12 h-px bg-[#E2E8F0] mx-auto mb-8" />

          {/* Next workout preview (subtle) */}
          {nextWorkout && (
            <div className="text-sm text-[#94A3B8]">
              <p className="mb-1">Next up</p>
              <p className="text-[#475569] font-medium">
                {nextWorkout.name} · {nextWorkout.dayOfWeek}
              </p>
            </div>
          )}
        </div>

        {/* Optional CTA - very subtle */}
        {nextWorkout && (
          <div className="px-8 pb-8">
            <button
              className="w-full py-3 px-4 rounded-xl text-sm text-[#64748B] hover:text-[#475569] hover:bg-[#F1F5F9] transition-colors"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Preview next workout →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
