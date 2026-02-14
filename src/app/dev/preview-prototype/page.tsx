'use client';

import { useState } from 'react';

// Mock data for realistic preview
const mockProgram = {
  name: "12-Week Strength Builder",
  description: "A progressive program designed to build strength and muscle with compound lifts and strategic accessory work.",
  phases: [
    {
      number: 1,
      name: "Foundation",
      weeks: "1-4",
      description: "Build base strength with moderate volume",
      workouts: [
        { day: 1, name: "Upper Push", exercises: 6, focus: "Chest, Shoulders, Triceps" },
        { day: 2, name: "Lower", exercises: 5, focus: "Quads, Hamstrings, Glutes" },
        { day: 3, name: "Upper Pull", exercises: 6, focus: "Back, Biceps, Rear Delts" },
        { day: 4, name: "Full Body", exercises: 5, focus: "Compound Movements" },
      ]
    },
    {
      number: 2,
      name: "Progression",
      weeks: "5-8",
      description: "Increase intensity with heavier loads",
      workouts: [
        { day: 1, name: "Push Power", exercises: 6, focus: "Heavy Pressing" },
        { day: 2, name: "Pull Power", exercises: 6, focus: "Heavy Pulling" },
        { day: 3, name: "Legs Power", exercises: 5, focus: "Heavy Legs" },
        { day: 4, name: "Hypertrophy", exercises: 7, focus: "Volume Work" },
      ]
    },
    {
      number: 3,
      name: "Peak",
      weeks: "9-12",
      description: "Peak strength with max effort work",
      workouts: [
        { day: 1, name: "Max Upper", exercises: 5, focus: "1RM Testing" },
        { day: 2, name: "Max Lower", exercises: 5, focus: "1RM Testing" },
        { day: 3, name: "Volume", exercises: 8, focus: "Deload & Volume" },
        { day: 4, name: "Full Body", exercises: 6, focus: "Maintenance" },
      ]
    }
  ],
  nutrition: {
    calories: 2400,
    protein: 180,
    carbs: 240,
    fats: 80
  }
};

export default function PreviewPrototypePage() {
  const [email, setEmail] = useState('');
  const [expandedPhase, setExpandedPhase] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const isUnlocked = (phaseIndex: number) => phaseIndex === 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
      {/* ═══════════════════════════════════════════════════════════════════════
          PREVIEW BANNER - Creates desire at entry
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B6B]/20 border border-[#FF6B6B]/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B6B] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6B6B]"></span>
                </span>
                <span className="text-xs font-semibold text-[#FF6B6B] uppercase tracking-wider">Preview</span>
              </div>
              <span className="text-sm text-white/80">
                Viewing <span className="font-semibold text-white">Phase 1 of 3</span>
              </span>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="text-sm font-medium text-white/90 hover:text-white flex items-center gap-2 group"
            >
              <span>Unlock full program</span>
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO HEADER
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        <div className="relative max-w-5xl mx-auto px-4 py-8 sm:py-12">
          {/* Program Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
            {mockProgram.name}
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl mb-6">
            {mockProgram.description}
          </p>

          {/* Stats badges */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { icon: "📅", label: "12 weeks" },
              { icon: "💪", label: "4 days/week" },
              { icon: "📈", label: "3 phases" },
              { icon: "🎯", label: "All Levels" },
            ].map((stat, i) => (
              <div key={i} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium border border-white/10">
                <span>{stat.icon}</span>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              VALUE COMPARISON CARD - Creates desire
              ═══════════════════════════════════════════════════════════════════ */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 sm:p-6 mb-6">
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {/* What you're seeing */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-white/90 uppercase tracking-wider">Preview includes</span>
                </div>
                <ul className="space-y-2">
                  {[
                    "Phase 1 workouts (4 weeks)",
                    "Nutrition overview",
                    "Exercise descriptions",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                      <svg className="w-4 h-4 text-white/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* What's locked */}
              <div className="sm:border-l sm:border-white/10 sm:pl-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-[#FF6B6B]/20 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-[#FF6B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-[#FF6B6B] uppercase tracking-wider">Free signup unlocks</span>
                </div>
                <ul className="space-y-2">
                  {[
                    "All 3 phases (12 weeks)",
                    "PDF download",
                    "Progress tracking dashboard",
                    "Exercise swap suggestions",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-white/90">
                      <svg className="w-4 h-4 text-[#FF6B6B] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-4 w-full sm:w-auto px-6 py-2.5 bg-[#FF6B6B] text-white font-semibold rounded-xl hover:bg-[#EF5350] transition-all shadow-lg shadow-[#FF6B6B]/25 text-sm"
                >
                  Keep My Program — Free
                </button>
              </div>
            </div>
          </div>

          {/* Primary CTA */}
          <button className="inline-flex items-center gap-3 px-8 py-4 bg-[#FF6B6B] text-white font-bold text-lg rounded-2xl hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#FF6B6B]/30 transition-all shadow-xl shadow-[#FF6B6B]/25">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Preview Phase 1
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          PHASE NAVIGATION
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-20 bg-[#F8FAFC]/95 backdrop-blur-sm border-b border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 overflow-x-auto">
            {mockProgram.phases.map((phase, i) => (
              <button
                key={i}
                onClick={() => isUnlocked(i) && setExpandedPhase(i)}
                disabled={!isUnlocked(i)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all flex-shrink-0 ${
                  expandedPhase === i
                    ? 'bg-[#FF6B6B] text-white shadow-lg shadow-[#FF6B6B]/25'
                    : isUnlocked(i)
                      ? 'bg-white text-[#475569] border border-[#E2E8F0] hover:border-[#FF6B6B]/50 hover:text-[#FF6B6B]'
                      : 'bg-[#F1F5F9] text-[#94A3B8] border border-[#E2E8F0] cursor-not-allowed'
                }`}
              >
                {!isUnlocked(i) && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
                {isUnlocked(i) && expandedPhase === i && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <span style={{ fontFamily: "'Space Mono', monospace" }}>Phase {phase.number}</span>
              </button>
            ))}

            {/* Progress dots */}
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] flex-shrink-0">
              {mockProgram.phases.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === expandedPhase ? 'bg-[#FF6B6B] scale-125' : isUnlocked(i) ? 'bg-[#0F172A]' : 'bg-[#E2E8F0]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          PHASE CONTENT
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {mockProgram.phases.map((phase, phaseIndex) => (
          <div key={phaseIndex}>
            {isUnlocked(phaseIndex) ? (
              /* ═══ UNLOCKED PHASE ═══ */
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="p-5 border-b border-[#F1F5F9]">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FF6B6B] to-[#EF5350] flex flex-col items-center justify-center shadow-lg shadow-[#FF6B6B]/20">
                      <span className="text-[9px] uppercase tracking-wider text-white/80" style={{ fontFamily: "'Space Mono', monospace" }}>Phase</span>
                      <span className="text-xl font-extrabold text-white">{phase.number}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#0F172A]">{phase.name}</h3>
                      <p className="text-sm text-[#64748B]">Weeks {phase.weeks} • {phase.description}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  {phase.workouts.map((workout, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors">
                      <div className="w-12 h-12 rounded-xl bg-white border-2 border-[#F1F5F9] flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-[8px] uppercase tracking-widest text-[#94A3B8]">Day</span>
                        <span className="text-lg font-extrabold text-[#0F172A]">{workout.day}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[#0F172A]">{workout.name}</h4>
                        <p className="text-sm text-[#94A3B8]">{workout.focus}</p>
                      </div>
                      <span className="text-xs text-[#94A3B8]" style={{ fontFamily: "'Space Mono', monospace" }}>
                        {workout.exercises} exercises
                      </span>
                    </div>
                  ))}
                </div>

                {/* Nutrition preview */}
                <div className="p-5 bg-[#F8FAFC] border-t border-[#F1F5F9]">
                  <h4 className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold mb-3">Daily Nutrition Targets</h4>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { label: "Calories", value: mockProgram.nutrition.calories, unit: "kcal", color: "#FF6B6B" },
                      { label: "Protein", value: mockProgram.nutrition.protein, unit: "g", color: "#3B82F6" },
                      { label: "Carbs", value: mockProgram.nutrition.carbs, unit: "g", color: "#10B981" },
                      { label: "Fats", value: mockProgram.nutrition.fats, unit: "g", color: "#F59E0B" },
                    ].map((macro, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: macro.color }} />
                        <span className="text-sm text-[#475569]">
                          <span className="font-semibold" style={{ color: macro.color }}>{macro.value}</span>
                          <span className="text-[#94A3B8]">{macro.unit}</span>
                          <span className="text-[#94A3B8] ml-1">{macro.label}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* ═══════════════════════════════════════════════════════════════
                 LOCKED PHASE - MOMENT OF DESIRE CAPTURE
                 ═══════════════════════════════════════════════════════════════ */
              <div className="relative bg-white rounded-2xl border-2 border-dashed border-[#E2E8F0] overflow-hidden">
                {/* Blurred preview */}
                <div className="p-5 border-b border-[#F1F5F9] blur-[2px] opacity-50 pointer-events-none">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#94A3B8] to-[#64748B] flex flex-col items-center justify-center">
                      <span className="text-[9px] uppercase tracking-wider text-white/80">Phase</span>
                      <span className="text-xl font-extrabold text-white">{phase.number}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#0F172A]">{phase.name}</h3>
                      <p className="text-sm text-[#64748B]">Weeks {phase.weeks}</p>
                    </div>
                  </div>
                </div>

                {/* Unlock overlay */}
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center p-6">
                  <div className="max-w-md w-full text-center">
                    {/* Lock icon */}
                    <div className="w-16 h-16 rounded-2xl bg-[#FFE5E5] flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-[#FF6B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>

                    <h3 className="text-xl font-bold text-[#0F172A] mb-2">
                      Unlock Phase {phase.number}: {phase.name}
                    </h3>
                    <p className="text-sm text-[#64748B] mb-6">
                      Get the full 12-week program plus tracking dashboard — completely free.
                    </p>

                    {/* Benefits reminder */}
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      {["All phases", "PDF", "Dashboard", "Exercise swaps"].map((item, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] text-xs text-[#475569]">
                          <svg className="w-3 h-3 text-[#FF6B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {item}
                        </span>
                      ))}
                    </div>

                    {/* Email capture form */}
                    <div className="space-y-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 border-2 border-[#E2E8F0] rounded-xl text-center text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#FF6B6B] transition-colors"
                      />
                      <button className="w-full px-6 py-3 bg-[#FF6B6B] text-white font-bold rounded-xl hover:bg-[#EF5350] transition-all shadow-lg shadow-[#FF6B6B]/25">
                        Unlock Full Program
                      </button>
                      <p className="text-xs text-[#94A3B8]">
                        100% free • No credit card • Instant access
                      </p>
                    </div>
                  </div>
                </div>

                {/* Spacer to maintain height */}
                <div className="p-5 opacity-0 pointer-events-none">
                  <div className="h-48" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          UPSELL MODAL (for header CTA clicks)
          ═══════════════════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#0F172A]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-[#FFE5E5] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#FF6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Keep Your Program</h2>
              <p className="text-[#64748B] mb-6">Enter your email to save this program and unlock everything.</p>

              <div className="space-y-4 mb-6">
                {[
                  "All 3 training phases",
                  "Downloadable PDF",
                  "Progress tracking dashboard",
                  "Exercise swap suggestions",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-lg bg-[#FFE5E5] flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-[#FF6B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[#475569]">{item}</span>
                  </div>
                ))}
              </div>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-4 border-2 border-[#E2E8F0] rounded-xl text-center text-lg text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#FF6B6B] transition-colors mb-3"
              />
              <button className="w-full px-6 py-4 bg-[#FF6B6B] text-white font-bold text-lg rounded-xl hover:bg-[#EF5350] transition-all shadow-lg shadow-[#FF6B6B]/25">
                Get My Program — Free
              </button>
              <p className="text-xs text-[#94A3B8] mt-3">
                100% free • No credit card required
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
