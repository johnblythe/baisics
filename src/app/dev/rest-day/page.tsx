'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RestDayOptionA } from './components/RestDayOptionA';
import { RestDayOptionB } from './components/RestDayOptionB';
import { RestDayOptionC } from './components/RestDayOptionC';
import { RestDayOptionD } from './components/RestDayOptionD';

type OptionKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

const OPTIONS: { key: OptionKey; label: string; description: string }[] = [
  { key: 'A', label: 'Zen', description: 'Minimal, calm card - permission to rest' },
  { key: 'B', label: 'Celebrate', description: 'Achievement/progress celebration' },
  { key: 'C', label: 'Active', description: 'Optional activity suggestions' },
  { key: 'D', label: 'Coach', description: 'Recovery tips and wisdom' },
  { key: 'E', label: 'Game', description: 'Gamified rest as achievement' },
  { key: 'F', label: 'Social', description: 'Community social proof' },
];

export default function RestDayDevPage() {
  const [activeOption, setActiveOption] = useState<OptionKey>('A');

  return (
    <div className="min-h-screen bg-[#0F172A] py-8 px-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dev" className="text-sm text-[#94A3B8] hover:text-[#FF6B6B] mb-2 inline-block">
            ← Back to Dev
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-[#FF6B6B] animate-pulse" />
            <span className="text-xs text-[#FF6B6B] font-mono uppercase tracking-wider">Dev Mode</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Rest Day UI Prototypes (#233)</h1>
          <p className="text-[#94A3B8]">
            Exploring different approaches to rest day UX. Toggle between options to compare.
          </p>
        </div>

        {/* Option Selector */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
          {OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setActiveOption(opt.key)}
              className={`py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                activeOption === opt.key
                  ? 'bg-[#FF6B6B] text-white'
                  : 'bg-[#1E293B] text-[#94A3B8] hover:bg-[#334155] hover:text-white border border-[#334155]'
              }`}
            >
              {opt.key}
            </button>
          ))}
        </div>

        {/* Option Description */}
        <div className="mb-6 p-4 rounded-xl bg-[#1E293B] border border-[#334155]">
          <h3 className="font-semibold text-white mb-1">
            Option {activeOption}: {OPTIONS.find(o => o.key === activeOption)?.label}
          </h3>
          <p className="text-sm text-[#94A3B8]">
            {OPTIONS.find(o => o.key === activeOption)?.description}
          </p>
        </div>

        {/* Component Preview Area */}
        <div className="mb-8 p-6 rounded-xl bg-[#F8FAFC] min-h-[400px] flex items-center justify-center">
          {activeOption === 'A' && (
            <RestDayOptionA
              nextWorkout={{ name: 'Legs', dayOfWeek: 'Tomorrow' }}
            />
          )}
          {activeOption === 'B' && (
            <RestDayOptionB
              workoutsCompleted={3}
              weeklyTarget={4}
              streak={7}
              nextWorkout={{ name: 'Legs', dayOfWeek: 'Tomorrow' }}
            />
          )}
          {activeOption === 'C' && (
            <RestDayOptionC
              nextWorkout={{ name: 'Legs', dayOfWeek: 'Tomorrow' }}
            />
          )}
          {activeOption === 'D' && (
            <RestDayOptionD
              nextWorkout={{ name: 'Legs', dayOfWeek: 'Tomorrow' }}
            />
          )}
          {activeOption !== 'A' && activeOption !== 'B' && activeOption !== 'C' && activeOption !== 'D' && (
            <div className="text-center">
              <p className="text-[#94A3B8] mb-2">Option {activeOption} component</p>
              <p className="text-sm text-[#CBD5E1]">Component not yet implemented</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="p-4 rounded-xl bg-[#1E293B]/50 border border-dashed border-[#334155]">
          <h4 className="font-semibold text-[#94A3B8] mb-3 text-sm">Options Overview</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {OPTIONS.map((opt) => (
              <div key={opt.key} className="flex items-center gap-2 text-sm">
                <span className="w-6 h-6 rounded bg-[#334155] flex items-center justify-center text-[#FF6B6B] font-mono text-xs">
                  {opt.key}
                </span>
                <span className="text-[#64748B]">
                  <span className="text-[#94A3B8] font-medium">{opt.label}</span> - {opt.description}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link href="/dev" className="text-sm text-[#64748B] hover:text-[#FF6B6B] transition-colors">
            ← Back to Dev Index
          </Link>
        </div>
      </div>
    </div>
  );
}
