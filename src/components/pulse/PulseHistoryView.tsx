'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Camera, FileText } from 'lucide-react';

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

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { displayDate: string; weight: number } }> }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-[#F1F5F9] px-3 py-2">
      <p className="text-xs text-[#94A3B8]">{data.displayDate}</p>
      <p className="text-sm font-semibold text-[#0F172A]">{data.weight} lbs</p>
    </div>
  );
}

export function PulseHistoryView() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [streak, setStreak] = useState<Streak>({ current: 0, longest: 0 });
  const [targetWeight, setTargetWeight] = useState<number | null>(null);
  const [totalPulses, setTotalPulses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  // Photo modal state
  const [viewingPhotos, setViewingPhotos] = useState<{date: string, displayDate: string} | null>(null);
  const [modalPhotos, setModalPhotos] = useState<{id: string, base64Data: string, fileName: string}[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

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
    () => history.filter((e) => e.weight !== null),
    [history]
  );

  const recentEntries = useMemo(
    () => [...history].reverse(),
    [history]
  );

  const viewPhotos = async (entry: HistoryEntry) => {
    setViewingPhotos({ date: entry.date, displayDate: entry.displayDate });
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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="space-y-6">
          {/* Stats skeleton */}
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-[#F1F5F9] p-4 animate-pulse">
                <div className="h-7 w-12 bg-[#F1F5F9] rounded mx-auto mb-2" />
                <div className="h-3 w-20 bg-[#F1F5F9] rounded mx-auto" />
              </div>
            ))}
          </div>
          {/* Chart skeleton */}
          <div className="bg-white rounded-2xl border border-[#F1F5F9] p-4 animate-pulse">
            <div className="h-4 w-28 bg-[#F1F5F9] rounded mb-4" />
            <div className="h-[250px] bg-[#F8FAFC] rounded" />
          </div>
          {/* List skeleton */}
          <div className="space-y-0">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-[#F8FAFC] animate-pulse">
                <div className="h-4 w-36 bg-[#F1F5F9] rounded" />
                <div className="h-4 w-12 bg-[#F1F5F9] rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!history.length) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FFE5E5] mb-4">
          <span className="text-3xl">&#x1F4CA;</span>
        </div>
        <h3 className="text-lg font-semibold text-[#0F172A] mb-1">
          Start your Daily Pulse
        </h3>
        <p className="text-sm text-[#94A3B8]">
          Track your weight daily to see trends here
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Period selector */}
      <div className="flex gap-2 justify-end">
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              days === d
                ? 'bg-[#0F172A] text-white'
                : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
            }`}
          >
            {d}d
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-[#F1F5F9] p-4 text-center">
          <div className="text-2xl font-bold text-[#0F172A]">
            &#x1F525; {streak.current}
          </div>
          <div className="text-xs text-[#94A3B8] uppercase tracking-wider mt-1">
            Current Streak
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#F1F5F9] p-4 text-center">
          <div className="text-2xl font-bold text-[#0F172A]">
            {streak.longest}
          </div>
          <div className="text-xs text-[#94A3B8] uppercase tracking-wider mt-1">
            Best Streak
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#F1F5F9] p-4 text-center">
          <div className="text-2xl font-bold text-[#0F172A]">
            {totalPulses}
          </div>
          <div className="text-xs text-[#94A3B8] uppercase tracking-wider mt-1">
            Total Check-ins
          </div>
        </div>
      </div>

      {/* Goal CTA when no target weight is set */}
      {targetWeight === null && (
        <div className="bg-[#FFE5E5] rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-[#0F172A]">Set a goal weight to see a target line on your chart</p>
          <Link href="/settings" className="text-sm font-medium text-[#FF6B6B] hover:underline whitespace-nowrap ml-3">
            Set Goal
          </Link>
        </div>
      )}

      {/* Goal weight label when target is set */}
      {targetWeight !== null && (
        <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
          <span className="inline-block w-4 border-t-2 border-dashed border-[#94A3B8]" />
          <span>Goal: {targetWeight} lbs</span>
        </div>
      )}

      {/* Weight Trend Chart */}
      {chartData.length > 1 && (
        <div className="bg-white rounded-2xl border border-[#F1F5F9] p-4">
          <h3 className="text-sm font-semibold text-[#0F172A] mb-3">
            Weight Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
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
              />
              <Tooltip content={<CustomTooltip />} />
              {targetWeight !== null && (
                <ReferenceLine
                  y={targetWeight}
                  stroke="#94A3B8"
                  strokeDasharray="5 5"
                  label={{
                    value: 'Goal',
                    position: 'right',
                    fill: '#94A3B8',
                    fontSize: 11,
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#FF6B6B"
                strokeWidth={2}
                dot={{ fill: '#FF6B6B', r: 3, strokeWidth: 0 }}
                activeDot={{ fill: '#FF6B6B', r: 5, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Single data point — no chart, just show the weight */}
      {chartData.length === 1 && (
        <div className="bg-white rounded-2xl border border-[#F1F5F9] p-4 text-center">
          <h3 className="text-sm font-semibold text-[#0F172A] mb-2">
            Weight Trend
          </h3>
          <p className="text-sm text-[#94A3B8]">
            Log a few more days to see your trend chart
          </p>
          <p className="text-xl font-bold text-[#0F172A] mt-2">
            {chartData[0].weight} lbs
          </p>
        </div>
      )}

      {/* Recent Entries */}
      <div>
        <h3 className="text-sm font-semibold text-[#0F172A] mb-3">
          Recent Entries
        </h3>
        <div className="bg-white rounded-2xl border border-[#F1F5F9] divide-y divide-[#F8FAFC]">
          {recentEntries.map((entry) => (
            <div
              key={entry.date}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-2 text-sm text-[#0F172A]">
                <span>{entry.displayDate}</span>
                {entry.weight !== null && (
                  <>
                    <span className="text-[#94A3B8]">&middot;</span>
                    <span className="font-medium">{entry.weight} lbs</span>
                  </>
                )}
                {entry.hasNotes && (
                  <FileText className="w-3.5 h-3.5 text-[#94A3B8]" />
                )}
              </div>
              {entry.photoCount > 0 && (
                <button
                  onClick={() => viewPhotos(entry)}
                  className="flex items-center gap-1 text-xs text-[#94A3B8] hover:text-[#FF6B6B] transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{entry.photoCount}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Photo viewing modal */}
      {viewingPhotos && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setViewingPhotos(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#0F172A]">{viewingPhotos.displayDate}</h3>
              <button onClick={() => setViewingPhotos(null)} className="text-[#94A3B8] hover:text-[#0F172A]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {loadingPhotos ? (
              <div className="py-8 text-center text-[#94A3B8]">Loading photos...</div>
            ) : modalPhotos.length === 0 ? (
              <div className="py-8 text-center text-[#94A3B8]">No photos found</div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {modalPhotos.map(photo => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={photo.id} src={photo.base64Data} alt={photo.fileName} className="w-full rounded-lg object-cover aspect-square" />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
