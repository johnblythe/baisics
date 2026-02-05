'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import {
  Camera,
  FileText,
  Target,
  Trophy,
  TrendingUp,
  CheckCircle,
  MoreHorizontal,
  X,
} from 'lucide-react';

interface HistoryEntry {
  date: string;
  displayDate: string;
  weight: number | null;
  photoCount: number;
  hasNotes: boolean;
}

interface Streak {
  current: number;
  longest: number;
}

interface HistoryResponse {
  history: HistoryEntry[];
  streak: Streak;
  targetWeight: number | null;
  totalPulses: number;
}

/* ─── Helpers ─── */

function formatRelativeDate(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr + 'T12:00:00');
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function weightDelta(current: number | null, previous: number | null): { value: number; direction: 'down' | 'up' | 'same' } | null {
  if (current == null || previous == null) return null;
  const diff = current - previous;
  if (Math.abs(diff) < 0.05) return { value: 0, direction: 'same' };
  return { value: diff, direction: diff < 0 ? 'down' : 'up' };
}

/* ─── Enhanced Tooltip ─── */

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { displayDate: string; weight: number; prevWeight?: number } }>;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  const delta = data.prevWeight != null ? data.weight - data.prevWeight : null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-[#F1F5F9] px-4 py-3 min-w-[140px]">
      <p className="text-xs text-[#94A3B8] mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
        {data.displayDate}
      </p>
      <p
        className="text-lg font-bold text-[#0F172A]"
        style={{ fontFamily: 'Space Mono, monospace' }}
      >
        {data.weight} <span className="text-xs font-normal text-[#94A3B8]">lbs</span>
      </p>
      {delta != null && (
        <p
          className={`text-xs font-medium mt-1 ${
            delta < -0.05 ? 'text-emerald-500' : delta > 0.05 ? 'text-[#FF6B6B]' : 'text-[#94A3B8]'
          }`}
        >
          {delta > 0 ? '+' : ''}
          {delta.toFixed(1)} from prev
        </p>
      )}
    </div>
  );
}

/* ─── Component ─── */

export function PulseHistoryView() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [streak, setStreak] = useState<Streak>({ current: 0, longest: 0 });
  const [targetWeight, setTargetWeight] = useState<number | null>(null);
  const [totalPulses, setTotalPulses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  // Goal inline form
  const [goalInput, setGoalInput] = useState('');
  const [settingGoal, setSettingGoal] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const goalInputRef = useRef<HTMLInputElement>(null);

  // Goal menu
  const [showGoalMenu, setShowGoalMenu] = useState(false);
  const goalMenuRef = useRef<HTMLDivElement>(null);

  // Photo modal state
  const [viewingPhotos, setViewingPhotos] = useState<{ date: string; displayDate: string } | null>(null);
  const [modalPhotos, setModalPhotos] = useState<{ id: string; base64Data: string; fileName: string }[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Close goal menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (goalMenuRef.current && !goalMenuRef.current.contains(e.target as Node)) {
        setShowGoalMenu(false);
      }
    }
    if (showGoalMenu) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [showGoalMenu]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/pulse/history?days=${days}`)
      .then((r) => r.json())
      .then((data: HistoryResponse) => {
        setHistory(data.history);
        setStreak(data.streak);
        setTargetWeight(data.targetWeight);
        setTotalPulses(data.totalPulses);
      })
      .catch(() => {
        // silent fail — empty state handles it
      })
      .finally(() => setLoading(false));
  }, [days]);

  const chartData = useMemo(
    () => {
      const filtered = history.filter((e) => e.weight !== null);
      return filtered.map((e, i) => ({
        ...e,
        prevWeight: i > 0 ? filtered[i - 1].weight : undefined,
      }));
    },
    [history]
  );

  const recentEntries = useMemo(() => [...history].reverse(), [history]);

  const viewPhotos = async (entry: HistoryEntry) => {
    setViewingPhotos({ date: entry.date, displayDate: entry.displayDate });
    setActivePhotoIndex(0);
    setLoadingPhotos(true);
    try {
      const res = await fetch(`/api/pulse?date=${entry.date}`);
      const data = await res.json();
      setModalPhotos(data.pulse?.photos ?? []);
    } catch {
      setModalPhotos([]);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const saveGoalWeight = async () => {
    const weight = parseFloat(goalInput);
    if (isNaN(weight) || weight <= 0) return;
    setSettingGoal(true);
    try {
      const res = await fetch('/api/goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primaryGoal: 'LOSE_WEIGHT', targetWeight: weight }),
      });
      if (res.ok) {
        setTargetWeight(weight);
        setShowGoalForm(false);
        setGoalInput('');
      }
    } catch {
      // silent
    } finally {
      setSettingGoal(false);
    }
  };

  // Compute goal progress
  const goalProgress = useMemo(() => {
    if (targetWeight == null || chartData.length === 0) return null;
    const firstWeight = chartData[0].weight;
    const latestWeight = chartData[chartData.length - 1].weight;
    if (firstWeight == null || latestWeight == null) return null;
    const totalToLose = firstWeight - targetWeight;
    if (totalToLose <= 0) return { percent: 100, diff: latestWeight - targetWeight, hitGoal: latestWeight <= targetWeight };
    const lost = firstWeight - latestWeight;
    const percent = Math.min(100, Math.max(0, (lost / totalToLose) * 100));
    return { percent, diff: latestWeight - targetWeight, hitGoal: latestWeight <= targetWeight };
  }, [targetWeight, chartData]);

  /* ─── Loading Skeleton ─── */
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="space-y-6">
          {/* Stats skeleton */}
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-xl p-5 shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #F8FAFC, #FFFFFF)',
                  animationDelay: `${i * 150}ms`,
                }}
              >
                <div className="animate-pulse" style={{ animationDelay: `${i * 150}ms` }}>
                  <div className="h-8 w-14 bg-[#F1F5F9] rounded-lg mx-auto mb-2" />
                  <div className="h-3 w-20 bg-[#F1F5F9] rounded mx-auto" />
                </div>
              </div>
            ))}
          </div>
          {/* Chart skeleton */}
          <div className="rounded-2xl shadow-sm p-5" style={{ background: 'linear-gradient(135deg, #F8FAFC, #FFFFFF)' }}>
            <div className="animate-pulse" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-28 bg-[#F1F5F9] rounded" />
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-7 w-10 bg-[#F1F5F9] rounded-full" />
                  ))}
                </div>
              </div>
              <div className="h-[250px] bg-[#F8FAFC] rounded-xl" />
            </div>
          </div>
          {/* List skeleton */}
          <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: 'linear-gradient(135deg, #F8FAFC, #FFFFFF)' }}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between px-5 py-4 animate-pulse"
                style={{ animationDelay: `${300 + i * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-[#F1F5F9] rounded-full" />
                  <div>
                    <div className="h-4 w-24 bg-[#F1F5F9] rounded mb-1.5" />
                    <div className="h-3 w-16 bg-[#F1F5F9] rounded" />
                  </div>
                </div>
                <div className="h-4 w-12 bg-[#F1F5F9] rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ─── Empty State ─── */
  if (!history.length) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        {/* Stacked card illustration */}
        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
          <div className="absolute w-16 h-10 rounded-lg bg-[#F1F5F9] transform -rotate-6 translate-y-1 shadow-sm" />
          <div className="absolute w-16 h-10 rounded-lg bg-[#FFE5E5] transform rotate-3 -translate-y-1 shadow-sm" />
          <div className="absolute w-16 h-10 rounded-lg bg-white border border-[#F1F5F9] shadow-sm flex items-center justify-center -translate-y-3">
            <span className="text-[#94A3B8] text-lg">?</span>
          </div>
        </div>
        <h3
          className="text-lg font-semibold text-[#0F172A] mb-2"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Start your Daily Pulse
        </h3>
        <p className="text-sm text-[#94A3B8] mb-6 max-w-xs mx-auto">
          Track your weight daily to see trends, streaks, and progress toward your goals
        </p>
        <Link
          href="?tab=log"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6B6B] hover:bg-[#EF5350] text-white text-sm font-medium rounded-full transition-colors shadow-sm"
        >
          Log your first check-in
        </Link>
      </div>
    );
  }

  const isPersonalBest = streak.current > 0 && streak.current === streak.longest;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* ─── Stats Cards ─── */}
      <div className="grid grid-cols-3 gap-3">
        {/* Current Streak */}
        <div
          className={`rounded-xl p-5 text-center shadow-sm transition-all ${
            streak.current > 0
              ? 'bg-gradient-to-br from-[#FF6B6B]/5 via-[#FF6B6B]/10 to-[#FF6B6B]/20 border border-[#FF6B6B]/15'
              : 'bg-white border border-[#F1F5F9]'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 mb-1">
            {streak.current > 0 && (
              <span className="text-lg leading-none" role="img" aria-label="fire">
                &#x1F525;
              </span>
            )}
            <span
              className="text-3xl font-bold text-[#0F172A]"
              style={{ fontFamily: 'Space Mono, monospace' }}
            >
              {streak.current}
            </span>
          </div>
          <div className="text-[10px] text-[#94A3B8] uppercase tracking-widest font-medium mt-1">
            {streak.current === 1 ? 'Day Streak' : 'Day Streak'}
          </div>
          {isPersonalBest && streak.current > 1 && (
            <div className="mt-2 text-[10px] font-semibold text-[#FF6B6B] uppercase tracking-wider">
              Personal Best!
            </div>
          )}
        </div>

        {/* Best Streak */}
        <div className="bg-white rounded-xl border border-[#F1F5F9] p-5 text-center shadow-sm relative overflow-hidden">
          {streak.longest > 0 && (
            <div className="absolute top-2 right-2">
              <Trophy className="w-3.5 h-3.5 text-amber-300/60" />
            </div>
          )}
          <div className="flex items-center justify-center mb-1">
            <span
              className="text-3xl font-bold text-[#0F172A]"
              style={{ fontFamily: 'Space Mono, monospace' }}
            >
              {streak.longest}
            </span>
          </div>
          <div className="text-[10px] text-[#94A3B8] uppercase tracking-widest font-medium mt-1">
            Best Streak
          </div>
        </div>

        {/* Total Check-ins */}
        <div className="bg-white rounded-xl border border-[#F1F5F9] p-5 text-center shadow-sm">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span
              className="text-3xl font-bold text-[#0F172A]"
              style={{ fontFamily: 'Space Mono, monospace' }}
            >
              {totalPulses}
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400 mt-1" />
          </div>
          <div className="text-[10px] text-[#94A3B8] uppercase tracking-widest font-medium mt-1">
            Check-ins
          </div>
        </div>
      </div>

      {/* ─── Goal Section ─── */}
      {!showGoalForm && targetWeight === null && (
        <button
          onClick={() => {
            setShowGoalForm(true);
            setTimeout(() => goalInputRef.current?.focus(), 100);
          }}
          className="w-full group bg-white rounded-xl border border-dashed border-[#E2E8F0] hover:border-[#FF6B6B]/40 px-4 py-4 flex items-center gap-3 transition-all hover:shadow-sm"
        >
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#F8FAFC] group-hover:bg-[#FFE5E5]/60 flex items-center justify-center transition-colors">
            <Target className="w-4 h-4 text-[#94A3B8] group-hover:text-[#FF6B6B] transition-colors" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-[#0F172A]">Set a goal weight</p>
            <p className="text-xs text-[#94A3B8]">See a target line on your chart</p>
          </div>
        </button>
      )}

      {!showGoalForm &&
        targetWeight !== null &&
        (() => {
          const hitGoal = goalProgress?.hitGoal ?? false;
          return (
            <div
              className={`relative rounded-xl px-4 py-4 transition-all overflow-hidden ${
                hitGoal
                  ? 'bg-gradient-to-br from-emerald-50 via-emerald-50/80 to-emerald-100/50 border border-emerald-200 shadow-sm'
                  : 'bg-white border border-[#F1F5F9] shadow-sm'
              }`}
            >
              {/* Celebration dots for goal hit */}
              {hitGoal && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute w-2 h-2 rounded-full bg-emerald-200/60 top-2 left-[15%]" />
                  <div className="absolute w-1.5 h-1.5 rounded-full bg-emerald-300/40 top-4 right-[20%]" />
                  <div className="absolute w-2.5 h-2.5 rounded-full bg-emerald-200/50 bottom-2 left-[30%]" />
                  <div className="absolute w-1 h-1 rounded-full bg-emerald-300/60 top-3 left-[60%]" />
                  <div className="absolute w-2 h-2 rounded-full bg-emerald-200/40 bottom-3 right-[35%]" />
                  <div className="absolute w-1.5 h-1.5 rounded-full bg-emerald-300/30 bottom-1 right-[10%]" />
                </div>
              )}

              <div className="flex items-center justify-between relative">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {hitGoal ? (
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#F8FAFC] flex items-center justify-center">
                      <Target className="w-4 h-4 text-[#94A3B8]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-semibold text-[#0F172A]"
                        style={{ fontFamily: 'Outfit, sans-serif' }}
                      >
                        {hitGoal ? 'Goal reached!' : 'Goal:'}{' '}
                        <span style={{ fontFamily: 'Space Mono, monospace' }}>
                          {targetWeight}
                        </span>{' '}
                        <span className="text-xs font-normal text-[#94A3B8]">lbs</span>
                      </span>
                    </div>
                    {goalProgress && !hitGoal && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#EF5350] rounded-full transition-all duration-700"
                            style={{ width: `${goalProgress.percent}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-[#94A3B8] whitespace-nowrap tabular-nums" style={{ fontFamily: 'Space Mono, monospace' }}>
                          {goalProgress.diff.toFixed(1)} to go
                        </span>
                      </div>
                    )}
                    {hitGoal && goalProgress && (
                      <span className="text-xs font-medium text-emerald-600 mt-0.5 block">
                        {Math.abs(goalProgress.diff).toFixed(1)} lbs below target
                      </span>
                    )}
                  </div>
                </div>

                {/* ... menu for edit/remove */}
                <div className="relative flex-shrink-0 ml-2" ref={goalMenuRef}>
                  <button
                    onClick={() => setShowGoalMenu(!showGoalMenu)}
                    className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#475569] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {showGoalMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-[#F1F5F9] py-1 z-10 min-w-[120px]">
                      <button
                        onClick={() => {
                          setGoalInput(String(targetWeight));
                          setShowGoalForm(true);
                          setShowGoalMenu(false);
                          setTimeout(() => goalInputRef.current?.focus(), 100);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-[#475569] hover:bg-[#F8FAFC] transition-colors"
                      >
                        Edit goal
                      </button>
                      <button
                        onClick={async () => {
                          await fetch('/api/goal', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ primaryGoal: 'HEALTH', targetWeight: null }),
                          });
                          setTargetWeight(null);
                          setShowGoalMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        Remove goal
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

      {/* Inline goal form (create or edit) */}
      {showGoalForm && (
        <div className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm px-4 py-4 flex items-center gap-3">
          <label className="text-sm text-[#475569] whitespace-nowrap font-medium">Goal weight:</label>
          <input
            ref={goalInputRef}
            type="number"
            step="0.1"
            inputMode="decimal"
            placeholder="e.g. 175"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveGoalWeight();
            }}
            className="w-24 px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg text-center outline-none focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B]/20 transition-all"
            style={{ fontFamily: 'Space Mono, monospace' }}
          />
          <span className="text-xs text-[#94A3B8]">lbs</span>
          <button
            onClick={saveGoalWeight}
            disabled={settingGoal || !goalInput}
            className="px-4 py-2 text-sm font-medium text-white bg-[#FF6B6B] hover:bg-[#EF5350] disabled:bg-[#F1F5F9] disabled:text-[#94A3B8] rounded-lg transition-colors shadow-sm"
          >
            {settingGoal ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => {
              setShowGoalForm(false);
              setGoalInput('');
            }}
            className="text-xs text-[#94A3B8] hover:text-[#475569] transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* ─── Weight Trend Chart ─── */}
      {chartData.length > 1 && (
        <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-sm font-semibold text-[#0F172A]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Weight Trend
            </h3>
            {/* Period selector — integrated */}
            <div className="flex gap-1.5">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                    days === d
                      ? 'bg-[#0F172A] text-white shadow-sm'
                      : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="weightAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6B6B" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#FF6B6B" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F1F5F9"
                vertical={false}
              />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                tickLine={false}
                axisLine={{ stroke: '#F1F5F9' }}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                tickLine={false}
                axisLine={false}
                padding={{ top: 10, bottom: 10 }}
                label={{
                  value: 'lbs',
                  position: 'insideTopLeft',
                  offset: 10,
                  style: { fontSize: 10, fill: '#94A3B8', fontFamily: 'Space Mono, monospace' },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              {targetWeight !== null && (
                <ReferenceLine
                  y={targetWeight}
                  stroke="#10B981"
                  strokeDasharray="6 4"
                  strokeWidth={1.5}
                  label={{
                    value: 'Goal',
                    position: 'right',
                    fill: '#10B981',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
              )}
              <Area
                type="monotone"
                dataKey="weight"
                stroke="none"
                fill="url(#weightAreaGradient)"
                fillOpacity={1}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#FF6B6B"
                strokeWidth={2.5}
                dot={{ fill: '#FF6B6B', r: 3, strokeWidth: 2, stroke: '#FFFFFF' }}
                activeDot={{ fill: '#FF6B6B', r: 6, strokeWidth: 3, stroke: '#FFFFFF' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Single data point — no chart */}
      {chartData.length === 1 && (
        <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-sm p-5 text-center">
          <div className="flex items-center justify-between mb-3">
            <h3
              className="text-sm font-semibold text-[#0F172A]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Weight Trend
            </h3>
            <div className="flex gap-1.5">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                    days === d
                      ? 'bg-[#0F172A] text-white shadow-sm'
                      : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm text-[#94A3B8] mb-2">
            Log a few more days to see your trend chart
          </p>
          <p
            className="text-2xl font-bold text-[#0F172A]"
            style={{ fontFamily: 'Space Mono, monospace' }}
          >
            {chartData[0].weight}{' '}
            <span className="text-sm font-normal text-[#94A3B8]">lbs</span>
          </p>
        </div>
      )}

      {/* No weight entries in chart but has history */}
      {chartData.length === 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[#0F172A]" style={{ fontFamily: 'Outfit, sans-serif' }}>
            History
          </span>
          <div className="flex gap-1.5">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                  days === d
                    ? 'bg-[#0F172A] text-white shadow-sm'
                    : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Recent Entries ─── */}
      <div>
        <h3
          className="text-sm font-semibold text-[#0F172A] mb-3"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Recent Entries
        </h3>
        <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-sm overflow-hidden">
          {recentEntries.map((entry, i) => {
            const prevEntry = i < recentEntries.length - 1 ? recentEntries[i + 1] : null;
            const delta = weightDelta(entry.weight, prevEntry?.weight ?? null);
            const borderColor =
              delta == null || delta.direction === 'same'
                ? '#E2E8F0'
                : delta.direction === 'down'
                ? '#10B981'
                : '#FF6B6B';

            return (
              <div
                key={entry.date}
                className={`flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-[#F8FAFC]/60 ${
                  i < recentEntries.length - 1 ? 'border-b border-[#F8FAFC]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Colored left bar indicator */}
                  <div
                    className="w-1 h-8 rounded-full flex-shrink-0 transition-colors"
                    style={{ backgroundColor: borderColor }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-medium text-[#0F172A]"
                        style={{ fontFamily: 'Outfit, sans-serif' }}
                      >
                        {formatRelativeDate(entry.date)}
                      </span>
                      {entry.weight !== null && (
                        <span
                          className="text-sm text-[#475569]"
                          style={{ fontFamily: 'Space Mono, monospace' }}
                        >
                          {entry.weight} lbs
                        </span>
                      )}
                      {/* Delta pill */}
                      {delta && delta.direction !== 'same' && (
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold tabular-nums ${
                            delta.direction === 'down'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-[#FFE5E5] text-[#FF6B6B]'
                          }`}
                          style={{ fontFamily: 'Space Mono, monospace' }}
                        >
                          {delta.direction === 'down' ? '' : '+'}
                          {delta.value.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {/* Show first few words of notes on small text below */}
                    {entry.hasNotes && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <FileText className="w-3 h-3 text-[#94A3B8]" />
                        <span className="text-[11px] text-[#94A3B8]">Has notes</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side: photo button */}
                {entry.photoCount > 0 && (
                  <button
                    onClick={() => viewPhotos(entry)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[#94A3B8] hover:text-[#FF6B6B] hover:bg-[#FFE5E5]/40 transition-all"
                  >
                    <div className="relative">
                      <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-[#F1F5F9] flex items-center justify-center overflow-hidden">
                        <Camera className="w-3.5 h-3.5" />
                      </div>
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF6B6B] text-white text-[9px] font-bold flex items-center justify-center">
                        {entry.photoCount}
                      </span>
                    </div>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Photo Modal ─── */}
      {viewingPhotos && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setViewingPhotos(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F8FAFC]">
              <div>
                <h3
                  className="font-semibold text-[#0F172A]"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {viewingPhotos.displayDate}
                </h3>
                {!loadingPhotos && modalPhotos.length > 0 && (
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    {modalPhotos.length} photo{modalPhotos.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <button
                onClick={() => setViewingPhotos(null)}
                className="w-8 h-8 rounded-full bg-[#F8FAFC] hover:bg-[#F1F5F9] flex items-center justify-center text-[#94A3B8] hover:text-[#0F172A] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              {loadingPhotos ? (
                <div className="py-12 text-center">
                  <div className="inline-flex items-center gap-2 text-sm text-[#94A3B8]">
                    <div className="w-4 h-4 border-2 border-[#F1F5F9] border-t-[#FF6B6B] rounded-full animate-spin" />
                    Loading photos...
                  </div>
                </div>
              ) : modalPhotos.length === 0 ? (
                <div className="py-12 text-center text-sm text-[#94A3B8]">No photos found</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {modalPhotos.map((photo, idx) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={photo.id}
                        src={photo.base64Data}
                        alt={photo.fileName}
                        className="w-full rounded-xl object-cover aspect-square shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                        onClick={() => setActivePhotoIndex(idx)}
                      />
                    ))}
                  </div>
                  {/* Photo counter */}
                  {modalPhotos.length > 1 && (
                    <p className="text-center text-xs text-[#94A3B8] mt-3">
                      {activePhotoIndex + 1} of {modalPhotos.length}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
