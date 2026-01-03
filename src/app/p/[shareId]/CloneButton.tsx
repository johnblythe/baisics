'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CloneButtonProps {
  programId: string;
  isAuthenticated: boolean;
}

export function CloneButton({ programId, isAuthenticated }: CloneButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleClone = async () => {
    if (!isAuthenticated) {
      // Redirect to signin with callback to current page
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.href));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/programs/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId })
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle specific error cases
        if (data.error?.includes('limit') || data.error?.includes('premium')) {
          setError('Upgrade to premium to clone more programs');
        } else {
          setError(data.error || 'Failed to clone program');
        }
        return;
      }

      // Redirect to the cloned program
      router.push(`/dashboard/${data.id}`);
    } catch (err) {
      console.error('Clone error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleClone}
        disabled={loading}
        className="bg-coral-500 hover:bg-coral-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Cloning...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Clone to My Programs
          </>
        )}
      </button>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
