'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

interface CoachData {
  coach: {
    name: string | null;
    brandColor: string;
    brandLogo: string | null;
  };
  inviteToken: string;
}

export default function JoinCoachPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [coachData, setCoachData] = useState<CoachData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  const slug = params.slug as string;

  useEffect(() => {
    async function lookupCoach() {
      try {
        const res = await fetch(`/api/coach/lookup-slug?slug=${slug}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Coach not found');
        }

        setCoachData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Coach not found');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      lookupCoach();
    }
  }, [slug]);

  async function handleAccept() {
    if (!coachData?.inviteToken) return;

    if (!session?.user?.id) {
      signIn(undefined, {
        callbackUrl: `/coach/invite/${coachData.inviteToken}`,
      });
      return;
    }

    setAccepting(true);
    try {
      const res = await fetch('/api/coach/clients/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: coachData.inviteToken }),
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

  const brandColor = coachData?.coach.brandColor || '#FF6B6B';
  const coachName = coachData?.coach.name || 'Your Coach';

  function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (error || !coachData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Coach Not Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t find a coach with this invite link. The link may be incorrect or expired.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350] transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        .join-page {
          font-family: 'Outfit', sans-serif;
        }
      `}</style>

      <div className="join-page min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full">
          {/* Coach Brand Header */}
          <div className="text-center mb-8">
            {coachData.coach.brandLogo ? (
              <img
                src={coachData.coach.brandLogo}
                alt={coachName}
                className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: brandColor }}
              >
                {getInitials(coachName)}
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Train with {coachName}
            </h1>
            <p className="text-gray-600">
              Join{' '}
              <span className="font-semibold" style={{ color: brandColor }}>
                {coachName}
              </span>{' '}
              on BAISICS to get personalized training programs.
            </p>
          </div>

          {/* Benefits */}
          <div
            className="rounded-xl p-4 mb-6"
            style={{ backgroundColor: `${brandColor}10` }}
          >
            <h3 className="font-semibold text-gray-900 mb-2">What you&apos;ll get:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  style={{ color: brandColor }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Personalized workout programs
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  style={{ color: brandColor }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Progress tracking & feedback
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  style={{ color: brandColor }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Direct connection with your coach
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          {status === 'authenticated' ? (
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full px-6 py-3 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: brandColor }}
            >
              {accepting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect with Coach'
              )}
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() =>
                  signIn(undefined, {
                    callbackUrl: `/coach/invite/${coachData.inviteToken}`,
                  })
                }
                className="w-full px-6 py-3 text-white rounded-lg transition-colors font-medium hover:opacity-90"
                style={{ backgroundColor: brandColor }}
              >
                Sign In to Connect
              </button>
              <p className="text-center text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <Link
                  href={`/hi?invite=${coachData.inviteToken}`}
                  className="hover:underline"
                  style={{ color: brandColor }}
                >
                  Get started free
                </Link>
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              By connecting, you agree to share your workout data with your coach.
            </p>
            <Link
              href="/"
              className="inline-block mt-3 text-xs text-gray-400 hover:text-gray-600"
            >
              Powered by BAISICS
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
