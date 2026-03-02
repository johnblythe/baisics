'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';

export default function BuddyJoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]">
        <div className="w-8 h-8 border-t-2 border-white rounded-full animate-spin" />
      </div>
    }>
      <BuddyJoinContent />
    </Suspense>
  );
}

function BuddyJoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auto-fill from URL param
  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode) {
      setCode(urlCode.toUpperCase().slice(0, 8));
    }
  }, [searchParams]);

  // Auto-join if code is in URL and user is authenticated
  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode && status === 'authenticated' && !joining && !error && !success) {
      handleJoin(urlCode.toUpperCase().slice(0, 8));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, searchParams]);

  async function handleJoin(joinCode?: string) {
    const codeToUse = joinCode || code;
    if (!codeToUse || codeToUse.length !== 8) {
      setError('Please enter a valid 8-character code');
      return;
    }

    if (status !== 'authenticated') {
      signIn(undefined, {
        callbackUrl: `/buddy/join?code=${codeToUse}`,
      });
      return;
    }

    setJoining(true);
    setError(null);

    try {
      const res = await fetch('/api/buddy/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToUse }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to join group');
      }

      setSuccess(true);
      setTimeout(() => router.push('/nutrition?tab=pantry'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join group');
      setJoining(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            You&apos;re In!
          </h1>
          <p className="text-gray-600">
            Your buddy&apos;s recipes, quick foods, and staples will now appear
            in your library. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] px-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💪</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Join a Gym Buddy Group
          </h1>
          <p className="text-gray-600">
            Enter the invite code from your partner or gym buddy to share food
            libraries.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Invite Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase().replace(/[^23456789ABCDEFGHJKMNPQRSTUVWXYZ]/g, '').slice(0, 8));
                setError(null);
              }}
              placeholder="e.g. X4MN7P3R"
              className="w-full px-4 py-3 text-center text-2xl font-mono tracking-[0.3em] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent outline-none"
              maxLength={8}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          {status === 'authenticated' ? (
            <button
              onClick={() => handleJoin()}
              disabled={joining || code.length !== 8}
              className="w-full px-6 py-3 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350] transition-colors font-medium disabled:opacity-50"
            >
              {joining ? 'Joining...' : 'Join Group'}
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() =>
                  signIn(undefined, {
                    callbackUrl: `/buddy/join${code ? `?code=${code}` : ''}`,
                  })
                }
                className="w-full px-6 py-3 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350] transition-colors font-medium"
              >
                Sign In to Join
              </button>
              <p className="text-center text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <Link
                  href={`/hi${code ? `?buddy_code=${code}` : ''}`}
                  className="text-[#FF6B6B] hover:text-[#EF5350]"
                >
                  Get started free
                </Link>
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-2 text-sm">
            What happens when you join:
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              See your buddy&apos;s recipes in your library
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              Their quick foods appear in your quick add bar
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              Share staples for meal planning together
            </li>
          </ul>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          You can leave a group anytime from the Pantry tab.
        </p>
      </div>
    </div>
  );
}
