'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Authentication Error
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {error === 'Configuration' && 'There is a problem with the server configuration.'}
          {error === 'AccessDenied' && 'You do not have permission to sign in.'}
          {error === 'Verification' && 'The verification link was invalid or has expired.'}
          {!error && 'An unknown error occurred.'}
        </p>
        <div className="mt-6">
          <Link
            href="/auth/signin"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Try signing in again
          </Link>
        </div>
      </div>
    </div>
  );
} 