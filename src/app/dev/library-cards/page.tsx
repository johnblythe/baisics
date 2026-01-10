'use client';

import { useState } from 'react';

// Mock program data matching the screenshot
const MOCK_PROGRAMS = [
  { id: '1', name: 'Starting Strength', description: 'The classic linear progression program for beginners. Focus on compound lifts with simple progression.', difficulty: 'beginner', category: 'Strength', daysPerWeek: 3, weeks: 12, goals: ['Build strength', 'Learn compound lifts'], equipment: ['barbell', 'squat rack', 'bench'], author: 'Mark Rippetoe' },
  { id: '2', name: 'Summer Shred', description: 'Get lean and toned for summer. High-intensity training combined with strategic cardio for maximum fat loss.', difficulty: 'intermediate', category: 'General', daysPerWeek: 5, weeks: 6, goals: ['Lose fat', 'Get toned'], equipment: ['dumbbells', 'kettlebells', 'cables'], author: null },
  { id: '3', name: 'Booty Builder', description: 'The ultimate glute-focused program. Build, shape, and lift your booty with targeted exercises and progressive...', difficulty: 'beginner', category: 'Hypertrophy', daysPerWeek: 4, weeks: 8, goals: ['Build glutes', 'Shape booty'], equipment: ['barbell', 'dumbbells', 'resistance bands'], author: null },
];

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  beginner: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  intermediate: { bg: 'bg-amber-100', text: 'text-amber-700' },
  advanced: { bg: 'bg-red-100', text: 'text-red-700' },
};

// ============================================
// OPTION A: Current Design (Reference)
// ============================================
function OptionACurrent({ programs }: { programs: typeof MOCK_PROGRAMS }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {programs.map((p) => {
        const diff = DIFFICULTY_COLORS[p.difficulty] || DIFFICULTY_COLORS.beginner;
        return (
          <div key={p.id} className="bg-white rounded-xl overflow-hidden border border-[#F1F5F9] hover:shadow-lg transition-shadow">
            {/* Header - Navy gradient */}
            <div className="p-5 text-white" style={{ background: 'linear-gradient(to bottom right, #0F172A, #1E293B)' }}>
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs px-2 py-1 rounded-full ${diff.bg} ${diff.text}`}>{p.difficulty}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-white/20">{p.category}</span>
              </div>
              <h3 className="text-lg font-bold mb-1">{p.name}</h3>
              <p className="text-sm text-white/70 line-clamp-2">{p.description}</p>
            </div>

            {/* Stats - White bg */}
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-[#0F172A]">{p.daysPerWeek}</div>
                  <div className="text-xs text-[#94A3B8]">Days/Week</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-[#0F172A]">{p.weeks}</div>
                  <div className="text-xs text-[#94A3B8]">Weeks</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {p.goals.slice(0, 2).map((g) => (
                  <span key={g} className="text-xs px-2 py-1 rounded bg-[#F1F5F9] text-[#475569]">{g}</span>
                ))}
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {p.equipment.slice(0, 3).map((e) => (
                  <span key={e} className="text-xs px-2 py-0.5 rounded border border-[#F1F5F9] bg-[#F8FAFC] text-[#475569]">{e}</span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9]">
                {p.author && <span className="text-xs text-[#94A3B8]">by {p.author}</span>}
                <button className="text-xs px-3 py-1.5 rounded-lg bg-[#FF6B6B] text-white font-medium hover:bg-[#EF5350]">
                  Claim Program
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// OPTION B: Subtle Background + Border Accent
// ============================================
function OptionBSubtle({ programs }: { programs: typeof MOCK_PROGRAMS }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {programs.map((p) => {
        const diff = DIFFICULTY_COLORS[p.difficulty] || DIFFICULTY_COLORS.beginner;
        return (
          <div key={p.id} className="bg-[#FAFAFA] rounded-xl overflow-hidden border-2 border-[#E2E8F0] hover:border-[#FF6B6B]/40 hover:shadow-lg transition-all">
            {/* Header - Softer gradient with coral accent line */}
            <div className="relative p-5 text-white" style={{ background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)' }}>
              {/* Coral accent line at top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E]" />

              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs px-2 py-1 rounded-full ${diff.bg} ${diff.text}`}>{p.difficulty}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/20">{p.category}</span>
              </div>
              <h3 className="text-lg font-bold mb-1">{p.name}</h3>
              <p className="text-sm text-white/80 line-clamp-2">{p.description}</p>
            </div>

            {/* Stats - Off-white bg with better contrast */}
            <div className="p-5 bg-white">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-2 rounded-lg bg-[#F8FAFC]">
                  <div className="text-xl font-bold text-[#0F172A]">{p.daysPerWeek}</div>
                  <div className="text-xs text-[#64748B]">Days/Week</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-[#F8FAFC]">
                  <div className="text-xl font-bold text-[#0F172A]">{p.weeks}</div>
                  <div className="text-xs text-[#64748B]">Weeks</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {p.goals.slice(0, 2).map((g) => (
                  <span key={g} className="text-xs px-2 py-1 rounded-full bg-[#FFE5E5] text-[#EF5350] font-medium">{g}</span>
                ))}
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {p.equipment.slice(0, 3).map((e) => (
                  <span key={e} className="text-xs px-2 py-0.5 rounded border border-[#E2E8F0] text-[#64748B]">{e}</span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                {p.author ? <span className="text-xs text-[#64748B]">by {p.author}</span> : <span />}
                <button className="text-xs px-4 py-2 rounded-lg bg-[#FF6B6B] text-white font-semibold hover:bg-[#EF5350] shadow-sm shadow-[#FF6B6B]/20">
                  Claim Program
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// OPTION C: Full Card Border + Stats Highlight
// ============================================
function OptionCBordered({ programs }: { programs: typeof MOCK_PROGRAMS }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {programs.map((p) => {
        const diff = DIFFICULTY_COLORS[p.difficulty] || DIFFICULTY_COLORS.beginner;
        return (
          <div key={p.id} className="rounded-xl overflow-hidden border-2 border-[#1E293B] hover:shadow-xl transition-all bg-white">
            {/* Header - Navy solid with rounded internal corners */}
            <div className="p-5 text-white bg-[#0F172A]">
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs px-2 py-1 rounded-full ${diff.bg} ${diff.text} font-medium`}>{p.difficulty}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-[#FF6B6B] text-white font-medium">{p.category}</span>
              </div>
              <h3 className="text-lg font-bold mb-1">{p.name}</h3>
              <p className="text-sm text-[#94A3B8] line-clamp-2">{p.description}</p>
            </div>

            {/* Stats bar - coral background */}
            <div className="grid grid-cols-2 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white">
              <div className="text-center py-3 border-r border-white/20">
                <div className="text-xl font-bold">{p.daysPerWeek}</div>
                <div className="text-xs text-white/80">Days/Week</div>
              </div>
              <div className="text-center py-3">
                <div className="text-xl font-bold">{p.weeks}</div>
                <div className="text-xs text-white/80">Weeks</div>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex flex-wrap gap-1 mb-4">
                {p.goals.slice(0, 2).map((g) => (
                  <span key={g} className="text-xs px-2 py-1 rounded bg-[#F1F5F9] text-[#475569]">{g}</span>
                ))}
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {p.equipment.slice(0, 3).map((e) => (
                  <span key={e} className="text-xs px-2 py-0.5 rounded border border-[#E2E8F0] text-[#64748B]">{e}</span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9]">
                {p.author ? <span className="text-xs text-[#94A3B8]">by {p.author}</span> : <span />}
                <button className="text-xs px-4 py-2 rounded-lg bg-[#0F172A] text-white font-semibold hover:bg-[#1E293B]">
                  Claim Program
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// OPTION D: Gradient Fade + Elevated Stats
// ============================================
function OptionDGradient({ programs }: { programs: typeof MOCK_PROGRAMS }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {programs.map((p) => {
        const diff = DIFFICULTY_COLORS[p.difficulty] || DIFFICULTY_COLORS.beginner;
        return (
          <div key={p.id} className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all bg-white border border-[#E2E8F0]">
            {/* Header - gradient that fades to content */}
            <div className="p-5 text-white" style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 60%, #334155 100%)' }}>
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs px-2 py-1 rounded-full ${diff.bg} ${diff.text}`}>{p.difficulty}</span>
                <span className="text-xs px-2 py-1 rounded-full border border-white/30 text-white/90">{p.category}</span>
              </div>
              <h3 className="text-lg font-bold mb-1">{p.name}</h3>
              <p className="text-sm text-[#CBD5E1] line-clamp-2">{p.description}</p>

              {/* Stats overlapping header/content */}
              <div className="flex gap-4 mt-4 -mb-8 relative z-10">
                <div className="flex-1 text-center py-3 rounded-lg bg-white shadow-lg border border-[#E2E8F0]">
                  <div className="text-xl font-bold text-[#0F172A]">{p.daysPerWeek}</div>
                  <div className="text-xs text-[#64748B]">Days/Week</div>
                </div>
                <div className="flex-1 text-center py-3 rounded-lg bg-white shadow-lg border border-[#E2E8F0]">
                  <div className="text-xl font-bold text-[#0F172A]">{p.weeks}</div>
                  <div className="text-xs text-[#64748B]">Weeks</div>
                </div>
              </div>
            </div>

            {/* Content with padding for overlapping stats */}
            <div className="p-5 pt-12 bg-[#FAFAFA]">
              <div className="flex flex-wrap gap-1 mb-4">
                {p.goals.slice(0, 2).map((g) => (
                  <span key={g} className="text-xs px-2 py-1 rounded-full bg-[#FFE5E5] text-[#EF5350] font-medium">{g}</span>
                ))}
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {p.equipment.slice(0, 3).map((e) => (
                  <span key={e} className="text-xs px-2 py-0.5 rounded bg-white border border-[#E2E8F0] text-[#64748B]">{e}</span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                {p.author ? <span className="text-xs text-[#64748B]">by {p.author}</span> : <span />}
                <button className="text-xs px-4 py-2 rounded-lg bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white font-semibold hover:opacity-90 shadow-md shadow-[#FF6B6B]/25">
                  Claim Program
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// Main Page
// ============================================
export default function LibraryCardsDemoPage() {
  const [activeOption, setActiveOption] = useState<'A' | 'B' | 'C' | 'D'>('A');

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <a href="/dev" className="text-sm text-[#94A3B8] hover:text-[#FF6B6B] mb-2 inline-block">← Back to Dev</a>
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Library Cards - Design Options (#225)</h1>
          <p className="text-[#475569]">Testing color/contrast improvements. Keep shape/size, improve visual pop. Issues: stark navy header, white body blends with page bg.</p>
        </div>

        {/* Option Selector */}
        <div className="flex flex-wrap gap-2 mb-6 p-1 bg-white rounded-xl border border-[#E2E8F0]">
          {(['A', 'B', 'C', 'D'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setActiveOption(opt)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors min-w-[80px] ${
                activeOption === opt
                  ? 'bg-[#0F172A] text-white'
                  : 'text-[#475569] hover:bg-[#F8FAFC]'
              }`}
            >
              Option {opt}
            </button>
          ))}
        </div>

        {/* Description */}
        <div className="mb-6 p-4 bg-white rounded-xl border border-[#E2E8F0]">
          {activeOption === 'A' && (
            <>
              <h3 className="font-semibold text-[#0F172A] mb-1">Option A: Current Design (Reference)</h3>
              <p className="text-sm text-[#475569]">Dark navy header gradient, pure white body. Body blends into page background. Stats are plain text.</p>
            </>
          )}
          {activeOption === 'B' && (
            <>
              <h3 className="font-semibold text-[#0F172A] mb-1">Option B: Subtle Background + Coral Accent</h3>
              <p className="text-sm text-[#475569]">Card has off-white bg (#FAFAFA), white body section. Coral accent line at top. Stats in subtle boxes. Goals use coral highlight. Border accent on hover.</p>
            </>
          )}
          {activeOption === 'C' && (
            <>
              <h3 className="font-semibold text-[#0F172A] mb-1">Option C: Full Border + Stats Bar</h3>
              <p className="text-sm text-[#475569]">Bold navy border around entire card. Stats in coral bar between header and content. Category badge is coral. CTA is navy.</p>
            </>
          )}
          {activeOption === 'D' && (
            <>
              <h3 className="font-semibold text-[#0F172A] mb-1">Option D: Gradient Fade + Elevated Stats</h3>
              <p className="text-sm text-[#475569]">Header gradient fades to lighter navy. Stats cards overlap header/body with shadow elevation. Body is subtle gray. Gradient CTA button.</p>
            </>
          )}
        </div>

        {/* Demo */}
        <div className="mb-8">
          {activeOption === 'A' && <OptionACurrent programs={MOCK_PROGRAMS} />}
          {activeOption === 'B' && <OptionBSubtle programs={MOCK_PROGRAMS} />}
          {activeOption === 'C' && <OptionCBordered programs={MOCK_PROGRAMS} />}
          {activeOption === 'D' && <OptionDGradient programs={MOCK_PROGRAMS} />}
        </div>

        {/* Comparison Notes */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] mb-4">
          <h4 className="font-semibold text-[#0F172A] mb-3">Key Differences</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-[#475569] mb-1">Header Treatment</p>
              <ul className="text-[#94A3B8] space-y-0.5">
                <li>A: Pure navy gradient</li>
                <li>B: Coral accent line, softer gradient</li>
                <li>C: Solid navy, coral category badge</li>
                <li>D: Fading gradient, overlapping stats</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-[#475569] mb-1">Body Contrast</p>
              <ul className="text-[#94A3B8] space-y-0.5">
                <li>A: White (blends with page)</li>
                <li>B: White body on #FAFAFA card</li>
                <li>C: White with coral stats bar</li>
                <li>D: #FAFAFA body, elevated white stat cards</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="p-4 bg-[#FEF3C7]/50 rounded-xl border border-[#FEF3C7]">
          <h4 className="font-semibold text-[#92400E] mb-2">Test Notes</h4>
          <ul className="text-sm text-[#92400E] space-y-1">
            <li>• Focus on: Does the card pop against the page background?</li>
            <li>• Does the body section have enough visual weight?</li>
            <li>• Is there good hierarchy between header and content?</li>
            <li>• Test on different screens/lighting</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
