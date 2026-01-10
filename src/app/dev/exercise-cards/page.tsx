'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock exercise data
const MOCK_EXERCISES = [
  { id: '1', name: 'Barbell Back Squat', sets: 4, reps: '8-10', rest: '120s', category: 'primary', notes: 'Focus on depth and keeping chest up', instructions: ['Unrack the bar and step back', 'Set feet shoulder-width apart', 'Break at hips and knees simultaneously', 'Descend until thighs are parallel', 'Drive through heels to stand'] },
  { id: '2', name: 'Romanian Deadlift', sets: 3, reps: '10-12', rest: '90s', category: 'primary', notes: 'Feel the hamstring stretch', instructions: ['Hold bar at hip level', 'Push hips back while lowering', 'Keep bar close to legs', 'Stop when you feel hamstring stretch'] },
  { id: '3', name: 'Leg Press', sets: 3, reps: '12-15', rest: '90s', category: 'secondary', notes: null, instructions: [] },
  { id: '4', name: 'Leg Curl', sets: 3, reps: '12-15', rest: '60s', category: 'isolation', notes: null, instructions: [] },
  { id: '5', name: 'Calf Raises', sets: 4, reps: '15-20', rest: '45s', category: 'isolation', notes: 'Full range of motion', instructions: [] },
];

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string; icon?: string }> = {
  primary: { bg: 'bg-[#FFE5E5]', text: 'text-[#EF5350]', label: 'PRI', icon: '🔥' },
  secondary: { bg: 'bg-[#E0F2FE]', text: 'text-[#0284C7]', label: 'SEC', icon: '💪' },
  isolation: { bg: 'bg-[#F3E8FF]', text: 'text-[#9333EA]', label: 'ISO', icon: '🎯' },
  cardio: { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]', label: 'CAR', icon: '❤️' },
  compound: { bg: 'bg-[#FFE5E5]', text: 'text-[#EF5350]', label: 'COM', icon: '🏋️' },
};

// ============================================
// OPTION A: Current Design (Reference)
// ============================================
function OptionACurrent({ exercises }: { exercises: typeof MOCK_EXERCISES }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-xl border border-[#F1F5F9] overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-12 gap-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider px-4 py-3 bg-[#FAFAFA] border-b border-[#F1F5F9]" style={{ fontFamily: "'Space Mono', monospace" }}>
        <div className="col-span-1">Type</div>
        <div className="col-span-5">Exercise</div>
        <div className="col-span-3 text-right">Sets x Reps</div>
        <div className="col-span-2 text-right">Rest</div>
        <div className="col-span-1"></div>
      </div>

      {exercises.map((ex) => {
        const style = CATEGORY_STYLES[ex.category] || CATEGORY_STYLES.secondary;
        const hasDetails = ex.notes || ex.instructions.length > 0;
        const isExpanded = expanded === ex.id;

        return (
          <div key={ex.id}>
            <div
              className={`flex items-center gap-3 py-3 px-4 border-b border-[#F1F5F9] last:border-0 hover:bg-[#FAFAFA] transition-colors ${hasDetails ? 'cursor-pointer' : ''}`}
              onClick={() => hasDetails && setExpanded(isExpanded ? null : ex.id)}
            >
              <div className={`w-10 h-6 rounded-md ${style.bg} flex items-center justify-center flex-shrink-0`}>
                <span className={`text-[10px] font-bold ${style.text} tracking-wider`} style={{ fontFamily: "'Space Mono', monospace" }}>
                  {style.label}
                </span>
              </div>
              <span className="flex-1 text-sm text-[#0F172A] font-medium">{ex.name}</span>
              <div className="flex items-center gap-1.5 text-xs text-[#475569] tabular-nums flex-shrink-0" style={{ fontFamily: "'Space Mono', monospace" }}>
                <span className="text-[#0F172A] font-semibold">{ex.sets}</span>
                <span className="text-[#94A3B8]">x</span>
                <span className="text-[#0F172A] font-semibold">{ex.reps}</span>
              </div>
              <div className="w-16 text-xs text-[#94A3B8] text-right flex-shrink-0" style={{ fontFamily: "'Space Mono', monospace" }}>
                {ex.rest}
              </div>
              {hasDetails && (
                <div className={`w-5 h-5 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  <svg className="w-3 h-3 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}
            </div>
            {isExpanded && hasDetails && (
              <div className="px-4 py-3 bg-[#F8FAFC] text-sm text-[#475569] border-b border-[#F1F5F9] space-y-3">
                {ex.instructions.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">How to perform</p>
                    <ol className="list-decimal list-inside space-y-1">
                      {ex.instructions.map((inst, i) => <li key={i}>{inst}</li>)}
                    </ol>
                  </div>
                )}
                {ex.notes && (
                  <div>
                    <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Notes</p>
                    <p>{ex.notes}</p>
                  </div>
                )}
                <a href="#" className="inline-flex items-center text-[#FF6B6B] hover:text-[#EF5350] gap-1 text-xs font-medium">
                  Watch tutorial
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// OPTION B: Card-Based with Larger Touch Targets
// ============================================
function OptionBCards({ exercises }: { exercises: typeof MOCK_EXERCISES }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {exercises.map((ex) => {
        const style = CATEGORY_STYLES[ex.category] || CATEGORY_STYLES.secondary;
        const hasDetails = ex.notes || ex.instructions.length > 0;
        const isExpanded = expanded === ex.id;

        return (
          <motion.div
            key={ex.id}
            className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden hover:shadow-md transition-shadow"
            layout
          >
            <div
              className={`p-4 ${hasDetails ? 'cursor-pointer' : ''}`}
              onClick={() => hasDetails && setExpanded(isExpanded ? null : ex.id)}
            >
              <div className="flex items-start gap-4">
                {/* Category + Visual */}
                <div className={`w-14 h-14 rounded-xl ${style.bg} flex flex-col items-center justify-center flex-shrink-0`}>
                  <span className="text-lg">{style.icon}</span>
                  <span className={`text-[9px] font-bold ${style.text} uppercase`}>{style.label}</span>
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[#0F172A] mb-1">{ex.name}</h4>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-[#475569]">
                      <span className="font-bold text-[#0F172A]">{ex.sets}</span> sets
                    </span>
                    <span className="text-[#475569]">
                      <span className="font-bold text-[#0F172A]">{ex.reps}</span> reps
                    </span>
                    <span className="text-[#94A3B8]">{ex.rest} rest</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className="w-10 h-10 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center hover:bg-[#FFE5E5] hover:border-[#FF6B6B]/30 transition-colors group">
                    <svg className="w-5 h-5 text-[#94A3B8] group-hover:text-[#FF6B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button className="w-10 h-10 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center hover:bg-[#E0F2FE] hover:border-[#0284C7]/30 transition-colors group">
                    <svg className="w-5 h-5 text-[#94A3B8] group-hover:text-[#0284C7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </button>
                  {hasDetails && (
                    <div className={`w-10 h-10 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      <svg className="w-5 h-5 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isExpanded && hasDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-0 space-y-3 border-t border-[#F1F5F9]">
                    {ex.instructions.length > 0 && (
                      <div className="pt-3">
                        <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Instructions</p>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-[#475569]">
                          {ex.instructions.map((inst, i) => <li key={i}>{inst}</li>)}
                        </ol>
                      </div>
                    )}
                    {ex.notes && (
                      <div className="p-3 rounded-lg bg-[#FEF3C7]/50 border border-[#FEF3C7]">
                        <p className="text-sm text-[#92400E]">💡 {ex.notes}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

// ============================================
// OPTION C: Compact List with Inline Actions
// ============================================
function OptionCCompact({ exercises }: { exercises: typeof MOCK_EXERCISES }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] divide-y divide-[#F1F5F9]">
      {exercises.map((ex) => {
        const style = CATEGORY_STYLES[ex.category] || CATEGORY_STYLES.secondary;
        const hasDetails = ex.notes || ex.instructions.length > 0;
        const isExpanded = expanded === ex.id;

        return (
          <div key={ex.id}>
            <div className="p-3 hover:bg-[#FAFAFA] transition-colors">
              <div className="flex items-center gap-3">
                {/* Left: Category color bar */}
                <div className={`w-1 h-12 rounded-full ${style.bg.replace('bg-', 'bg-').replace('100', '400').replace('E5E5', 'EF5350').replace('E0F2FE', '0284C7').replace('F3E8FF', '9333EA')}`} style={{ backgroundColor: style.text.includes('EF5350') ? '#EF5350' : style.text.includes('0284C7') ? '#0284C7' : '#9333EA' }} />

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-medium text-[#0F172A] text-sm truncate">{ex.name}</h4>
                    <span className={`text-[9px] font-bold ${style.text} ${style.bg} px-1.5 py-0.5 rounded`}>{style.label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#94A3B8]" style={{ fontFamily: "'Space Mono', monospace" }}>
                    <span>{ex.sets}x{ex.reps}</span>
                    <span>•</span>
                    <span>{ex.rest}</span>
                  </div>
                </div>

                {/* Actions inline */}
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg hover:bg-[#FFE5E5] transition-colors group" title="Watch video">
                    <svg className="w-4 h-4 text-[#94A3B8] group-hover:text-[#FF6B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button className="p-2 rounded-lg hover:bg-[#E0F2FE] transition-colors group" title="Swap exercise">
                    <svg className="w-4 h-4 text-[#94A3B8] group-hover:text-[#0284C7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </button>
                  {hasDetails && (
                    <button
                      className="p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors"
                      onClick={() => setExpanded(isExpanded ? null : ex.id)}
                    >
                      <svg className={`w-4 h-4 text-[#94A3B8] transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {isExpanded && hasDetails && (
              <div className="px-4 py-3 bg-[#F8FAFC] text-sm text-[#475569] space-y-2 ml-4 mr-3 mb-3 rounded-lg">
                {ex.instructions.length > 0 && (
                  <ol className="list-decimal list-inside space-y-1">
                    {ex.instructions.map((inst, i) => <li key={i} className="text-xs">{inst}</li>)}
                  </ol>
                )}
                {ex.notes && <p className="text-xs italic text-[#94A3B8]">{ex.notes}</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// Main Page
// ============================================
export default function ExerciseCardsDemoPage() {
  const [activeOption, setActiveOption] = useState<'A' | 'B' | 'C'>('A');

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <a href="/dev" className="text-sm text-[#94A3B8] hover:text-[#FF6B6B] mb-2 inline-block">← Back to Dev</a>
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Exercise Cards - Design Options (#103)</h1>
          <p className="text-[#475569]">Testing different exercise card layouts. Focus on: larger touch targets, visible video/swap buttons, better visual hierarchy.</p>
        </div>

        {/* Option Selector */}
        <div className="flex gap-2 mb-6 p-1 bg-white rounded-xl border border-[#E2E8F0]">
          {(['A', 'B', 'C'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setActiveOption(opt)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
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
              <p className="text-sm text-[#475569]">Table-style layout. Small category badge, compact info, expand on click. Video link only visible when expanded.</p>
            </>
          )}
          {activeOption === 'B' && (
            <>
              <h3 className="font-semibold text-[#0F172A] mb-1">Option B: Card-Based with Large Touch Targets</h3>
              <p className="text-sm text-[#475569]">Each exercise is a card. Bigger category icon with emoji. Prominent video + swap buttons always visible (40x40px touch targets).</p>
            </>
          )}
          {activeOption === 'C' && (
            <>
              <h3 className="font-semibold text-[#0F172A] mb-1">Option C: Compact List with Inline Actions</h3>
              <p className="text-sm text-[#475569]">Denser layout with color bar indicator. Inline action buttons on hover/always. Good for fitting more exercises on screen.</p>
            </>
          )}
        </div>

        {/* Demo */}
        <div className="mb-8">
          {activeOption === 'A' && <OptionACurrent exercises={MOCK_EXERCISES} />}
          {activeOption === 'B' && <OptionBCards exercises={MOCK_EXERCISES} />}
          {activeOption === 'C' && <OptionCCompact exercises={MOCK_EXERCISES} />}
        </div>

        {/* Notes */}
        <div className="p-4 bg-[#FEF3C7]/50 rounded-xl border border-[#FEF3C7]">
          <h4 className="font-semibold text-[#92400E] mb-2">Test Notes</h4>
          <ul className="text-sm text-[#92400E] space-y-1">
            <li>• Click exercises to expand details (all options)</li>
            <li>• Options B & C have visible video/swap buttons</li>
            <li>• Try on mobile to test touch targets</li>
            <li>• Note: These are static mocks, buttons don&apos;t do anything</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
