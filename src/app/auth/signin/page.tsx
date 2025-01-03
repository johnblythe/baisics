'use client';

import { signIn, useSession } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import { BsTwitterX } from 'react-icons/bs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to Baisics
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to start your fitness journey
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={() => signIn('google')}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FcGoogle className="h-5 w-5 mr-2" />
            Continue with Google
          </button>

          <button
            onClick={() => signIn('twitter')}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <BsTwitterX className="h-5 w-5 mr-2" />
            Continue with X
          </button>
        </div>
      </div>
    </div>
  );
} 