'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface ProgressData {
  id: string;
  programName: string;
  firstName: string;
  startDate: string;
  stats: {
    weeksCompleted: number;
    totalWorkouts: number;
    totalVolume: number;
    totalMinutes: number;
    startWeight: number | null;
    currentWeight: number | null;
    weightChange: number | null;
  };
  photos: {
    before: string | null;
    after: string | null;
  };
}

const CHEER_MESSAGES = [
  "Amazing progress! 🔥",
  "Incredible work! 💪",
  "Keep crushing it! 🚀",
  "So inspiring! ⭐",
  "Beast mode! 🦍",
  "Goals! 🎯",
  "Respect! 🙌",
  "Legendary! 👑",
];

export default function ShareProgressPage() {
  const params = useParams();
  const programId = params?.programId as string;

  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cheered, setCheered] = useState(false);
  const [cheerMessage, setCheerMessage] = useState('');
  const [cheerCount, setCheerCount] = useState(0);

  useEffect(() => {
    if (!programId) return;

    async function fetchProgress() {
      try {
        const response = await fetch(`/api/share/progress/${programId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('notfound');
          } else {
            setError('error');
          }
          return;
        }
        const progressData = await response.json();
        setData(progressData);

        // Check if user already cheered (localStorage)
        const cheeredPrograms = JSON.parse(localStorage.getItem('cheeredPrograms') || '{}');
        if (cheeredPrograms[programId]) {
          setCheered(true);
        }

        // Random cheer count for demo
        setCheerCount(Math.floor(Math.random() * 25) + 3);
      } catch {
        setError('error');
      } finally {
        setLoading(false);
      }
    }

    fetchProgress();
  }, [programId]);

  const handleCheer = () => {
    if (cheered) return;

    setCheered(true);
    setCheerMessage(CHEER_MESSAGES[Math.floor(Math.random() * CHEER_MESSAGES.length)]);
    setCheerCount(prev => prev + 1);

    // Save to localStorage
    const cheeredPrograms = JSON.parse(localStorage.getItem('cheeredPrograms') || '{}');
    cheeredPrograms[programId] = true;
    localStorage.setItem('cheeredPrograms', JSON.stringify(cheeredPrograms));

    // Clear message after animation
    setTimeout(() => setCheerMessage(''), 2000);
  };

  const formatWeight = (weight: number) => `${Math.abs(weight).toFixed(1)} lbs`;
  const formatWeightChange = (change: number) => {
    if (change === 0) return 'maintained';
    return change > 0 ? `+${change.toFixed(1)} lbs` : `${change.toFixed(1)} lbs`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFFFF' }}>
        <div
          className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#FF6B6B', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#FFFFFF', fontFamily: "'Outfit', sans-serif" }}>
        <header style={{ background: 'linear-gradient(to right, #FF6B6B, #FF8E8E)' }} className="py-6 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span style={{ color: '#FF6B6B' }} className="font-bold">B</span>
              </div>
              <span className="font-bold text-xl text-white">baisics</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#F1F5F9' }}>
              <svg className="w-10 h-10" style={{ color: '#94A3B8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-3" style={{ color: '#0F172A' }}>
              Progress Not Found
            </h1>
            <p className="mb-8" style={{ color: '#64748B' }}>
              This progress link may be invalid or the program doesn&apos;t exist.
            </p>
            <Link
              href="/hi"
              className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(to right, #FF6B6B, #FF8E8E)',
                color: 'white',
              }}
            >
              Start Your Own Program
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFFFFF', fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <header style={{ background: 'linear-gradient(to right, #FF6B6B, #FF8E8E)' }} className="py-6 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span style={{ color: '#FF6B6B' }} className="font-bold">B</span>
            </div>
            <span className="font-bold text-xl text-white">baisics</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-lg mx-auto">
          {/* Success badge */}
          <div className="text-center mb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: '#FFE5E5' }}
            >
              <span className="text-4xl">📈</span>
            </div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#0F172A' }}>
              {data.firstName}&apos;s Progress
            </h1>
            <p style={{ color: '#64748B' }}>
              {data.stats.weeksCompleted} {data.stats.weeksCompleted === 1 ? 'week' : 'weeks'} on {data.programName}
            </p>
          </div>

          {/* Progress card */}
          <div className="rounded-2xl p-6 mb-6" style={{ background: '#0F172A' }}>
            {/* Photos (if available) */}
            {(data.photos.before || data.photos.after) && (
              <div className="flex gap-3 mb-6">
                {data.photos.before && (
                  <div className="flex-1">
                    <div className="aspect-square rounded-xl overflow-hidden bg-white/10 mb-2">
                      <img
                        src={data.photos.before}
                        alt="Before"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-white/60 text-center">Before</p>
                  </div>
                )}
                {data.photos.after && (
                  <div className="flex-1">
                    <div className="aspect-square rounded-xl overflow-hidden bg-white/10 mb-2">
                      <img
                        src={data.photos.after}
                        alt="After"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-white/60 text-center">After</p>
                  </div>
                )}
              </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="text-3xl font-bold" style={{ color: '#FF6B6B' }}>
                  {data.stats.totalWorkouts}
                </div>
                <div className="text-xs text-white/60">Workouts</div>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="text-3xl font-bold" style={{ color: '#34D399' }}>
                  {data.stats.weeksCompleted}
                </div>
                <div className="text-xs text-white/60">Weeks</div>
              </div>
            </div>

            {/* Volume & Time */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {data.stats.totalVolume > 0 && (
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div className="text-xl font-bold text-amber-400">
                    {(data.stats.totalVolume / 1000).toFixed(0)}k
                  </div>
                  <div className="text-xs text-white/60">lbs lifted</div>
                </div>
              )}
              {data.stats.totalMinutes > 0 && (
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div className="text-xl font-bold text-sky-400">
                    {Math.round(data.stats.totalMinutes / 60)}h
                  </div>
                  <div className="text-xs text-white/60">training time</div>
                </div>
              )}
            </div>

            {/* Weight change */}
            {data.stats.weightChange !== null && (
              <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className={`text-2xl font-bold ${
                  data.stats.weightChange < 0 ? 'text-sky-400' : data.stats.weightChange > 0 ? 'text-emerald-400' : 'text-white'
                }`}>
                  {formatWeightChange(data.stats.weightChange)}
                </div>
                <div className="text-xs text-white/60">
                  {data.stats.startWeight && data.stats.currentWeight && (
                    <span>{formatWeight(data.stats.startWeight)} → {formatWeight(data.stats.currentWeight)}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cheer button */}
          <div className="relative mb-6">
            <button
              onClick={handleCheer}
              disabled={cheered}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                cheered
                  ? 'bg-emerald-500 text-white cursor-default'
                  : 'hover:scale-[1.02]'
              }`}
              style={!cheered ? {
                background: 'linear-gradient(to right, #FF6B6B, #FF8E8E)',
                color: 'white',
              } : undefined}
            >
              {cheered ? (
                <span className="flex items-center justify-center gap-2">
                  <span>🎉</span>
                  Cheered!
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>👏</span>
                  Cheer {data.firstName} On
                </span>
              )}
            </button>

            {/* Cheer count */}
            <div className="text-center mt-2" style={{ color: '#94A3B8' }}>
              <span className="text-sm">{cheerCount} {cheerCount === 1 ? 'person' : 'people'} cheered this progress</span>
            </div>

            {/* Floating message */}
            {cheerMessage && (
              <div
                className="absolute left-1/2 -translate-x-1/2 -top-12 px-4 py-2 rounded-full text-white font-bold animate-bounce"
                style={{ background: '#FF6B6B' }}
              >
                {cheerMessage}
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <p className="mb-4" style={{ color: '#64748B' }}>
              Want to track your own progress?
            </p>
            <Link
              href="/hi"
              className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-xl transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(to right, #FF6B6B, #FF8E8E)',
                color: 'white',
                boxShadow: '0 10px 25px -5px rgba(255, 107, 107, 0.25)',
              }}
            >
              Get Your Free Program
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <p className="mt-3 text-sm" style={{ color: '#94A3B8' }}>
              Free to start. No credit card required.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4" style={{ borderTop: '1px solid #F1F5F9' }}>
        <div className="max-w-lg mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: '#FF6B6B' }}>
              <span className="text-white font-bold text-xs">B</span>
            </div>
            <span className="font-semibold" style={{ color: '#0F172A' }}>baisics</span>
          </div>
          <p className="text-xs" style={{ color: '#94A3B8' }}>
            AI-powered workout programs that actually work.
          </p>
        </div>
      </footer>
    </div>
  );
}
