'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';

interface InviteData {
  valid: boolean;
  coach: {
    name: string | null;
    email: string | null;
  };
  inviteEmail: string;
}

export default function AcceptInvitePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    async function validateInvite() {
      try {
        const res = await fetch(`/api/coach/clients/invite?token=${params.token}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Invalid invite');
        }

        setInvite(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid invite');
      } finally {
        setLoading(false);
      }
    }

    if (params.token) {
      validateInvite();
    }
  }, [params.token]);

  async function handleAccept() {
    if (!session?.user?.id) {
      // Redirect to sign in with callback
      signIn(undefined, {
        callbackUrl: `/coach/invite/${params.token}`,
      });
      return;
    }

    setAccepting(true);
    try {
      const res = await fetch('/api/coach/clients/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: params.token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to accept invite');
      }

      router.push('/dashboard?coach_connected=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept');
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-700">
        <div className="w-8 h-8 border-t-2 border-white border-solid rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-700 px-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Invalid Invite
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'This invite link is invalid or has already been used.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-700 px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏋️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            You&apos;ve Been Invited!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            <strong className="text-gray-900 dark:text-white">
              {invite.coach.name || 'A fitness coach'}
            </strong>{' '}
            has invited you to join their client roster on BAISICS.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            What this means:
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Your coach can see your workout progress
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Your coach can create programs for you
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              You still have full control over your data
            </li>
          </ul>
        </div>

        {status === 'authenticated' ? (
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
          >
            {accepting ? 'Accepting...' : 'Accept Invite'}
          </button>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() =>
                signIn(undefined, {
                  callbackUrl: `/coach/invite/${params.token}`,
                })
              }
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Sign In to Accept
            </button>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Link
                href={`/hi?invite=${params.token}`}
                className="text-indigo-600 hover:text-indigo-700"
              >
                Get started free
              </Link>
            </p>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          By accepting, you agree to share your workout data with your coach.
        </p>
      </div>
    </div>
  );
}
