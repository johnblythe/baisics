'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface ExerciseSet {
  setNumber: number;
  weight: number | null;
  reps: number | null;
}

interface ExerciseSummary {
  name: string;
  targetSets: number;
  targetReps: number | null;
  completedSets: number;
  sets: ExerciseSet[];
}

interface WorkoutData {
  id: string;
  firstName: string;
  workoutName: string;
  programName: string;
  dayNumber: number | null;
  completedAt: string;
  stats: {
    exercisesCompleted: number;
    totalExercises: number;
    totalSets: number;
    totalVolume: number;
    duration: number | null;
  };
  exercises: ExerciseSummary[];
}

const SPOT_MESSAGES = [
  "Nice work! 💪",
  "Crushing it! 🔥",
  "Beast mode! 🦍",
  "Keep grinding! 💯",
  "Gains incoming! 📈",
  "LFG! 🚀",
  "Respect! 🙌",
  "Strong! 💪",
];

export default function ShareWorkoutPage() {
  const params = useParams();
  const workoutId = params?.id as string;

  const [data, setData] = useState<WorkoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [spotted, setSpotted] = useState(false);
  const [spotMessage, setSpotMessage] = useState('');
  const [spotCount, setSpotCount] = useState(0);

  useEffect(() => {
    if (!workoutId) return;

    async function fetchWorkout() {
      try {
        const response = await fetch(`/api/share/workout/${workoutId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('notfound');
          } else {
            setError('error');
          }
          return;
        }
        const workoutData = await response.json();
        setData(workoutData);

        // Check if user already spotted this workout (localStorage)
        const spottedWorkouts = JSON.parse(localStorage.getItem('spottedWorkouts') || '{}');
        if (spottedWorkouts[workoutId]) {
          setSpotted(true);
        }

        // For demo, show a random spot count
        setSpotCount(Math.floor(Math.random() * 12) + 1);
      } catch {
        setError('error');
      } finally {
        setLoading(false);
      }
    }

    fetchWorkout();
  }, [workoutId]);

  const handleSpot = () => {
    if (spotted) return;

    setSpotted(true);
    setSpotMessage(SPOT_MESSAGES[Math.floor(Math.random() * SPOT_MESSAGES.length)]);
    setSpotCount(prev => prev + 1);

    // Save to localStorage
    const spottedWorkouts = JSON.parse(localStorage.getItem('spottedWorkouts') || '{}');
    spottedWorkouts[workoutId] = true;
    localStorage.setItem('spottedWorkouts', JSON.stringify(spottedWorkouts));

    // Clear message after animation
    setTimeout(() => setSpotMessage(''), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
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

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#F1F5F9' }}>
              <svg className="w-10 h-10" style={{ color: '#94A3B8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-3" style={{ color: '#0F172A' }}>
              Workout Not Found
            </h1>
            <p className="mb-8" style={{ color: '#64748B' }}>
              This workout link may be invalid or the workout hasn&apos;t been completed yet.
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
      {/* Header with gradient */}
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
              <svg className="w-10 h-10" style={{ color: '#FF6B6B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#0F172A' }}>
              {data.firstName} crushed it! 🎉
            </h1>
            <p style={{ color: '#64748B' }}>
              {formatDate(data.completedAt)}
            </p>
          </div>

          {/* Workout card */}
          <div
            className="rounded-2xl p-6 mb-6"
            style={{ background: '#0F172A' }}
          >
            <div className="text-center mb-6">
              <p className="text-white/60 text-sm mb-1">{data.programName}</p>
              <h2 className="text-xl font-bold text-white">{data.workoutName}</h2>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="text-3xl font-bold" style={{ color: '#FF6B6B' }}>
                  {data.stats.exercisesCompleted}
                </div>
                <div className="text-xs text-white/60">Exercises</div>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="text-3xl font-bold" style={{ color: '#34D399' }}>
                  {data.stats.totalSets}
                </div>
                <div className="text-xs text-white/60">Sets</div>
              </div>
            </div>

            {data.stats.duration && (
              <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <span className="text-xl font-bold text-amber-400">{formatDuration(data.stats.duration)}</span>
                <span className="text-white/60 ml-2">workout time</span>
              </div>
            )}

            {data.stats.totalVolume > 0 && (
              <div className="mt-3 text-center text-white/50 text-sm">
                {data.stats.totalVolume.toLocaleString()} lbs total volume
              </div>
            )}
          </div>

          {/* Spot button */}
          <div className="relative mb-6">
            <button
              onClick={handleSpot}
              disabled={spotted}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                spotted
                  ? 'bg-emerald-500 text-white cursor-default'
                  : 'hover:scale-[1.02]'
              }`}
              style={!spotted ? {
                background: 'linear-gradient(to right, #FF6B6B, #FF8E8E)',
                color: 'white',
              } : undefined}
            >
              {spotted ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  Spotted!
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Spot {data.firstName}
                </span>
              )}
            </button>

            {/* Spot count */}
            <div className="text-center mt-2" style={{ color: '#94A3B8' }}>
              <span className="text-sm">{spotCount} {spotCount === 1 ? 'person' : 'people'} spotted this workout</span>
            </div>

            {/* Floating message */}
            {spotMessage && (
              <div
                className="absolute left-1/2 -translate-x-1/2 -top-12 px-4 py-2 rounded-full text-white font-bold animate-bounce"
                style={{ background: '#FF6B6B' }}
              >
                {spotMessage}
              </div>
            )}
          </div>

          {/* Exercise details toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full py-3 px-4 rounded-xl flex items-center justify-between transition-colors"
            style={{ background: '#F8FAFC', color: '#475569' }}
          >
            <span className="font-medium">View exercise details</span>
            <svg
              className={`w-5 h-5 transition-transform ${showDetails ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Exercise list */}
          {showDetails && (
            <div className="mt-4 space-y-3">
              {data.exercises.map((exercise, idx) => (
                <div
                  key={idx}
                  className="rounded-xl p-4"
                  style={{ background: '#F8FAFC' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold" style={{ color: '#0F172A' }}>{exercise.name}</h3>
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ background: '#FFE5E5', color: '#EF5350' }}
                    >
                      {exercise.completedSets} sets
                    </span>
                  </div>
                  <div className="text-sm" style={{ color: '#64748B' }}>
                    {exercise.sets.map((set, setIdx) => (
                      <span key={setIdx}>
                        {setIdx > 0 && ' • '}
                        {set.weight ? `${set.weight}lb` : ''} × {set.reps}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-8 text-center">
            <p className="mb-4" style={{ color: '#64748B' }}>
              Want to track your own workouts?
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
