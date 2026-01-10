'use client';

import { useState } from 'react';
import { CheckCircle, Circle, Play, Pause, RotateCcw, Clock, ChevronDown, ChevronUp, PlayCircle, MessageCircle, Dumbbell } from 'lucide-react';

// Mock exercise data
const MOCK_EXERCISE = {
  name: 'Barbell Back Squat',
  sets: 4,
  reps: '8-10',
  restPeriod: 120,
  instructions: ['Unrack the bar', 'Break at hips and knees', 'Descend to parallel', 'Drive through heels'],
};

const MOCK_LOGS = [
  { setNumber: 1, weight: 185, reps: 10, isCompleted: true },
  { setNumber: 2, weight: 185, reps: 9, isCompleted: true },
  { setNumber: 3, weight: 0, reps: 0, isCompleted: false },
  { setNumber: 4, weight: 0, reps: 0, isCompleted: false },
];

// ============================================
// OPTION A: Current Design (Reference)
// ============================================
function OptionACurrent() {
  const [logs, setLogs] = useState(MOCK_LOGS);
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(120);

  const activeSetIndex = logs.findIndex(l => !l.isCompleted);

  return (
    <div className="space-y-4">
      {/* Exercise Header */}
      <div className="bg-[#F8FAFC] px-4 py-4 rounded-t-xl border border-[#E2E8F0]">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs uppercase tracking-wider text-[#64748B]">
            Exercise 1 of 5
          </span>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white text-[#475569] border border-[#E2E8F0] text-sm">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Swap
            </button>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FF6B6B] text-white text-sm">
              <PlayCircle className="w-3.5 h-3.5" />
              Form
            </button>
          </div>
        </div>
        <h3 className="text-xl font-bold text-[#0F172A] mb-2">{MOCK_EXERCISE.name}</h3>
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#0F172A] text-white text-sm">
          {MOCK_EXERCISE.sets} sets × {MOCK_EXERCISE.reps} reps
        </div>
      </div>

      {/* Sets */}
      <div className="space-y-3 p-4 bg-white rounded-b-xl border border-t-0 border-[#E2E8F0]">
        {logs.map((log, idx) => {
          const isActive = idx === activeSetIndex;
          return (
            <div key={idx}>
              <div className={`p-4 rounded-xl transition-all ${
                log.isCompleted
                  ? 'bg-green-50 border-2 border-green-200'
                  : isActive
                    ? 'bg-white border-2 border-[#FF6B6B]/30 shadow-lg'
                    : 'bg-white border border-[#F1F5F9]'
              }`}>
                <div className="flex items-center gap-4">
                  <div className="w-6">
                    {log.isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className={`w-3 h-3 ${isActive ? 'text-[#FF6B6B] fill-[#FF6B6B]/20' : 'text-[#94A3B8]'}`} />
                    )}
                  </div>
                  <span className={`font-medium ${isActive ? 'text-[#FF6B6B]' : 'text-[#475569]'}`}>
                    Set {log.setNumber}
                  </span>
                  <input
                    type="number"
                    placeholder="Weight"
                    defaultValue={log.weight || ''}
                    disabled={log.isCompleted || !isActive}
                    className="w-20 px-3 py-2 rounded-lg border border-[#F1F5F9] text-sm disabled:opacity-50"
                  />
                  <input
                    type="number"
                    placeholder="Reps"
                    defaultValue={log.reps || ''}
                    disabled={log.isCompleted || !isActive}
                    className="w-20 px-3 py-2 rounded-lg border border-[#F1F5F9] text-sm disabled:opacity-50"
                  />
                  <input
                    type="text"
                    placeholder="Notes..."
                    disabled={log.isCompleted || !isActive}
                    className="flex-1 px-3 py-2 rounded-lg border border-[#F1F5F9] text-sm disabled:opacity-50"
                  />
                  {isActive && (
                    <button className="px-4 py-2 rounded-lg bg-[#FF6B6B] text-white text-sm font-medium">
                      Complete
                    </button>
                  )}
                </div>
              </div>

              {/* Rest timer between sets */}
              {idx < logs.length - 1 && log.isCompleted && (
                <div className="py-3 my-2 bg-[#F8FAFC] rounded-lg flex items-center justify-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#F1F5F9]">
                    <Clock className="w-4 h-4 text-[#94A3B8]" />
                    <span className="text-sm text-[#475569]">Rest: 2:00</span>
                  </div>
                  <button className="p-2 rounded-full bg-[#FF6B6B] text-white">
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// OPTION B: Hybrid C+D - Big Card + Progress Grid
// ============================================
function OptionBHybrid() {
  const [logs, setLogs] = useState(MOCK_LOGS);
  const [selectedSetIndex, setSelectedSetIndex] = useState<number | null>(null);

  const activeSetIndex = logs.findIndex(l => !l.isCompleted);
  const currentSetIndex = selectedSetIndex !== null ? selectedSetIndex : activeSetIndex;
  const completedCount = logs.filter(l => l.isCompleted).length;

  return (
    <div className="space-y-4">
      {/* Minimal header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-xs text-[#94A3B8] font-mono uppercase tracking-wider">Exercise 1 of 5</p>
          <h3 className="text-lg font-bold text-[#0F172A]">{MOCK_EXERCISE.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg border border-[#E2E8F0] text-[#475569] hover:border-[#FF6B6B] hover:text-[#FF6B6B]">
            <MessageCircle className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg bg-[#FF6B6B] text-white">
            <PlayCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress grid - see all sets at a glance */}
      <div className="grid grid-cols-4 gap-2">
        {logs.map((log, idx) => {
          const isActive = idx === activeSetIndex;
          const isSelected = idx === currentSetIndex;

          return (
            <button
              key={idx}
              onClick={() => !log.isCompleted && setSelectedSetIndex(idx === selectedSetIndex ? null : idx)}
              className={`relative rounded-xl p-2.5 text-center transition-all ${
                log.isCompleted
                  ? 'bg-green-100 border-2 border-green-300'
                  : isSelected
                    ? 'bg-[#FF6B6B] text-white ring-2 ring-[#FF6B6B] ring-offset-2'
                    : isActive
                      ? 'bg-[#FFE5E5] border-2 border-[#FF6B6B]/50'
                      : 'bg-[#F8FAFC] border border-[#E2E8F0]'
              }`}
            >
              <p className={`text-[10px] font-semibold uppercase ${
                log.isCompleted ? 'text-green-600' : isSelected ? 'text-white/80' : 'text-[#94A3B8]'
              }`}>
                Set {idx + 1}
              </p>
              {log.isCompleted ? (
                <p className="text-sm font-bold text-green-700">{log.weight}×{log.reps}</p>
              ) : isSelected ? (
                <p className="text-sm font-bold">Active</p>
              ) : (
                <p className="text-sm font-bold text-[#94A3B8]">--</p>
              )}
              {log.isCompleted && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-3 px-1">
        <div className="flex-1 h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#EF5350] rounded-full transition-all"
            style={{ width: `${(completedCount / logs.length) * 100}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-[#475569]">{completedCount}/{logs.length}</span>
      </div>

      {/* Big active set input card (from D) */}
      <div className="bg-gradient-to-br from-[#FF6B6B] to-[#EF5350] rounded-2xl p-5 text-white shadow-xl shadow-[#FF6B6B]/30">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-white/70 text-xs font-medium uppercase">Logging Set</p>
            <p className="text-3xl font-bold">{currentSetIndex + 1}</p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs font-medium uppercase">Target</p>
            <p className="text-xl font-bold">{MOCK_EXERCISE.reps} reps</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block text-white/70 text-xs font-medium mb-1.5">Weight (lbs)</label>
            <input
              type="number"
              placeholder="185"
              defaultValue={logs[currentSetIndex]?.weight || ''}
              className="w-full px-4 py-3.5 rounded-xl bg-white/20 border border-white/30 text-white text-xl font-bold placeholder-white/50 focus:bg-white/30 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-white/70 text-xs font-medium mb-1.5">Reps</label>
            <input
              type="number"
              placeholder="10"
              defaultValue={logs[currentSetIndex]?.reps || ''}
              className="w-full px-4 py-3.5 rounded-xl bg-white/20 border border-white/30 text-white text-xl font-bold placeholder-white/50 focus:bg-white/30 focus:outline-none"
            />
          </div>
        </div>

        <button className="w-full py-4 rounded-xl bg-white text-[#FF6B6B] font-bold text-lg shadow-lg active:scale-[0.98] transition-transform">
          Complete Set {currentSetIndex + 1}
        </button>
      </div>

      {/* Rest timer - inline with auto-start toggle */}
      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#E2E8F0]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FFE5E5] flex items-center justify-center">
            <Clock className="w-5 h-5 text-[#FF6B6B]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">Rest Timer</p>
            <p className="text-xs text-[#94A3B8]">2:00 between sets</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#64748B]">Auto-start</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" defaultChecked className="sr-only peer" />
            <div className="w-11 h-6 bg-[#E2E8F0] peer-focus:ring-2 peer-focus:ring-[#FF6B6B]/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B6B]"></div>
          </label>
        </div>
      </div>
    </div>
  );
}

// ============================================
// OPTION C: All Sets Visible + Inline Timer
// ============================================
function OptionCAllSetsInline() {
  const [logs, setLogs] = useState(MOCK_LOGS);
  const [expandedSet, setExpandedSet] = useState<number | null>(2);

  const activeSetIndex = logs.findIndex(l => !l.isCompleted);

  return (
    <div className="space-y-4">
      {/* Exercise card with all info */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#F1F5F9] bg-gradient-to-r from-[#F8FAFC] to-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Dumbbell className="w-4 h-4 text-[#FF6B6B]" />
                <span className="text-xs text-[#94A3B8] font-mono uppercase">Exercise 1 of 5</span>
              </div>
              <h3 className="text-xl font-bold text-[#0F172A]">{MOCK_EXERCISE.name}</h3>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg border border-[#E2E8F0] text-[#475569] hover:border-[#FF6B6B] hover:text-[#FF6B6B]">
                <MessageCircle className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg border border-[#E2E8F0] text-[#475569] hover:border-[#FF6B6B] hover:text-[#FF6B6B]">
                <PlayCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Target display */}
          <div className="mt-3 flex items-center gap-4">
            <div className="px-3 py-1.5 rounded-lg bg-[#0F172A] text-white text-sm font-medium">
              Target: {MOCK_EXERCISE.sets} × {MOCK_EXERCISE.reps}
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#FFE5E5] text-[#FF6B6B] text-sm font-medium">
              Rest: {Math.floor(MOCK_EXERCISE.restPeriod / 60)}:{(MOCK_EXERCISE.restPeriod % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* All sets in grid */}
        <div className="p-4">
          <div className="grid grid-cols-4 gap-3">
            {logs.map((log, idx) => {
              const isActive = idx === activeSetIndex;
              const isExpanded = expandedSet === idx;

              return (
                <div
                  key={idx}
                  onClick={() => !log.isCompleted && setExpandedSet(isExpanded ? null : idx)}
                  className={`relative rounded-xl p-3 cursor-pointer transition-all ${
                    log.isCompleted
                      ? 'bg-green-50 border-2 border-green-200'
                      : isActive
                        ? 'bg-[#FFF5F5] border-2 border-[#FF6B6B] shadow-lg'
                        : 'bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#FF6B6B]/50'
                  }`}
                >
                  <div className="text-center">
                    <p className={`text-xs font-medium mb-1 ${
                      log.isCompleted ? 'text-green-600' : isActive ? 'text-[#FF6B6B]' : 'text-[#94A3B8]'
                    }`}>
                      Set {idx + 1}
                    </p>
                    {log.isCompleted ? (
                      <>
                        <p className="text-lg font-bold text-green-700">{log.weight}</p>
                        <p className="text-xs text-green-600">{log.reps} reps</p>
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-bold text-[#475569]">--</p>
                        <p className="text-xs text-[#94A3B8]">tap to log</p>
                      </>
                    )}
                  </div>

                  {/* Checkmark badge */}
                  {log.isCompleted && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Expanded input for active set */}
          {expandedSet !== null && !logs[expandedSet].isCompleted && (
            <div className="mt-4 p-4 rounded-xl bg-[#FFF5F5] border-2 border-[#FF6B6B]/30">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-[#64748B] mb-1">Weight (lbs)</label>
                  <input
                    type="number"
                    placeholder="185"
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-[#64748B] mb-1">Reps</label>
                  <input
                    type="number"
                    placeholder="10"
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20"
                  />
                </div>
                <button className="mt-5 px-6 py-2.5 rounded-lg bg-[#FF6B6B] text-white font-semibold shadow-lg shadow-[#FF6B6B]/25">
                  Complete Set
                </button>
              </div>

              {/* Rest timer inline */}
              <div className="mt-4 pt-4 border-t border-[#FFD5D5] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FF6B6B]" />
                  <span className="text-sm text-[#475569]">Start rest timer after set?</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#E2E8F0] peer-focus:ring-2 peer-focus:ring-[#FF6B6B]/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B6B]"></div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// OPTION D: Mobile-First Swipeable Cards
// ============================================
function OptionDMobileSwipe() {
  const [logs, setLogs] = useState(MOCK_LOGS);
  const activeSetIndex = logs.findIndex(l => !l.isCompleted);

  return (
    <div className="space-y-4">
      {/* Exercise header - minimal */}
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-xs text-[#94A3B8] font-mono">1 OF 5</p>
          <h3 className="text-lg font-bold text-[#0F172A]">{MOCK_EXERCISE.name}</h3>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-[#FF6B6B]">
            <PlayCircle className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Active set - prominent */}
      <div className="bg-gradient-to-br from-[#FF6B6B] to-[#EF5350] rounded-2xl p-6 text-white shadow-xl shadow-[#FF6B6B]/30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white/70 text-sm">Current Set</p>
            <p className="text-4xl font-bold">{activeSetIndex + 1}</p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-sm">Target</p>
            <p className="text-2xl font-bold">{MOCK_EXERCISE.reps} reps</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-white/70 text-xs mb-2">Weight</label>
            <input
              type="number"
              placeholder="185"
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white text-xl font-bold placeholder-white/50 focus:bg-white/30"
            />
          </div>
          <div>
            <label className="block text-white/70 text-xs mb-2">Reps</label>
            <input
              type="number"
              placeholder="10"
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white text-xl font-bold placeholder-white/50 focus:bg-white/30"
            />
          </div>
        </div>

        <button className="w-full py-4 rounded-xl bg-white text-[#FF6B6B] font-bold text-lg shadow-lg">
          Complete Set {activeSetIndex + 1}
        </button>
      </div>

      {/* Rest timer preview */}
      <div className="flex items-center justify-center gap-3 py-3">
        <Clock className="w-5 h-5 text-[#94A3B8]" />
        <span className="text-[#475569]">2:00 rest after set</span>
        <button className="text-[#FF6B6B] text-sm font-medium">Edit</button>
      </div>

      {/* Set history - horizontal scroll */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex gap-3">
          {logs.map((log, idx) => {
            const isActive = idx === activeSetIndex;
            const isPast = log.isCompleted;
            const isFuture = !log.isCompleted && idx > activeSetIndex;

            return (
              <div
                key={idx}
                className={`flex-shrink-0 w-20 rounded-xl p-3 text-center ${
                  isPast
                    ? 'bg-green-50 border-2 border-green-200'
                    : isActive
                      ? 'bg-[#FF6B6B] text-white'
                      : 'bg-[#F8FAFC] border border-[#E2E8F0]'
                }`}
              >
                <p className={`text-xs font-medium ${
                  isPast ? 'text-green-600' : isActive ? 'text-white/80' : 'text-[#94A3B8]'
                }`}>
                  Set {idx + 1}
                </p>
                {isPast ? (
                  <>
                    <p className="text-lg font-bold text-green-700">{log.weight}</p>
                    <p className="text-xs text-green-600">×{log.reps}</p>
                  </>
                ) : isActive ? (
                  <p className="text-lg font-bold">Now</p>
                ) : (
                  <p className="text-lg font-bold text-[#94A3B8]">--</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main Page
// ============================================
export default function WorkoutTrackerDemoPage() {
  const [activeOption, setActiveOption] = useState<'A' | 'B' | 'C' | 'D'>('A');

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <a href="/dev" className="text-sm text-[#94A3B8] hover:text-[#FF6B6B] mb-2 inline-block">← Back to Dev</a>
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Workout Tracker - Design Options</h1>
          <p className="text-[#475569]">Testing exercise + sets view with integrated rest timer. Focus on: mobile usability, set logging flow, timer prominence.</p>
        </div>

        {/* Option Selector */}
        <div className="flex flex-wrap gap-2 mb-6 p-1 bg-white rounded-xl border border-[#E2E8F0]">
          {(['A', 'B', 'C', 'D'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setActiveOption(opt)}
              className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors min-w-[60px] ${
                activeOption === opt
                  ? 'bg-[#0F172A] text-white'
                  : 'text-[#475569] hover:bg-[#F8FAFC]'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Description */}
        <div className="mb-6 p-4 bg-white rounded-xl border border-[#E2E8F0]">
          {activeOption === 'A' && (
            <>
              <h3 className="font-semibold text-[#0F172A] mb-1">Option A: Current Design (Reference)</h3>
              <p className="text-sm text-[#475569]">One exercise at a time. Set rows with inline inputs. Rest timer between sets (expandable). Desktop-oriented layout.</p>
            </>
          )}
          {activeOption === 'B' && (
            <>
              <h3 className="font-semibold text-[#0F172A] mb-1">Option B: Hybrid C+D - Progress Grid + Big Card</h3>
              <p className="text-sm text-[#475569]">Best of both: tap-able progress grid at top (from C) + large mobile-friendly input card (from D). See all sets at a glance, log with big touch targets. Auto-start rest timer toggle.</p>
            </>
          )}
          {activeOption === 'C' && (
            <>
              <h3 className="font-semibold text-[#0F172A] mb-1">Option C: All Sets Visible Grid</h3>
              <p className="text-sm text-[#475569]">All 4 sets shown in grid. Tap to expand and log. Auto-start timer toggle. See progress at a glance.</p>
            </>
          )}
          {activeOption === 'D' && (
            <>
              <h3 className="font-semibold text-[#0F172A] mb-1">Option D: Mobile-First Card</h3>
              <p className="text-sm text-[#475569]">Large active set card. Big touch targets for inputs. Horizontal scroll for set history. Optimized for phone use in gym.</p>
            </>
          )}
        </div>

        {/* Demo */}
        <div className="mb-8">
          {activeOption === 'A' && <OptionACurrent />}
          {activeOption === 'B' && <OptionBHybrid />}
          {activeOption === 'C' && <OptionCAllSetsInline />}
          {activeOption === 'D' && <OptionDMobileSwipe />}
        </div>

        {/* Test Notes */}
        <div className="p-4 bg-[#FEF3C7]/50 rounded-xl border border-[#FEF3C7]">
          <h4 className="font-semibold text-[#92400E] mb-2">Test Notes</h4>
          <ul className="text-sm text-[#92400E] space-y-1">
            <li>• Test on mobile (most workout logging happens on phone)</li>
            <li>• Can you easily tap weight/rep inputs?</li>
            <li>• Is the rest timer easy to start/see?</li>
            <li>• How does it feel to complete multiple sets in a row?</li>
            <li>• Note: These are static mocks, timer doesn&apos;t actually count</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
