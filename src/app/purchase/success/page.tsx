'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Suspense } from 'react';

function PurchaseSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const processStripeReturn = async () => {
      try {
        // Get the purchase session ID from URL params
        const sessionId = searchParams.get('utm_content');
        if (!sessionId) {
          throw new Error('No purchase session found');
        }

        // Validate and complete the purchase session
        const response = await fetch('/api/purchase-sessions/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to complete purchase');
        }

        const { email, userId } = await response.json();

        // Sign in the user directly using credentials
        const result = await signIn('credentials', {
          email,
          userId,
          redirect: false,
          callbackUrl: '/dashboard'
        });


        // middleware is fucking me
        // remove for now or figure out how to set tokens here

        // const token = await setToken({
        //   token: result?.user?.id,
        //   secret: process.env.NEXTAUTH_SECRET
        // })

        if (result?.error) {
          throw new Error('Failed to sign in');
        }

        setIsProcessing(false);
      } catch (error) {
        console.error('Error processing purchase:', error);
        setError('There was an error processing your purchase. Please contact support.');
        setIsProcessing(false);
      }
    };

    if (!session && status !== 'loading') {
      processStripeReturn();
    }
  }, [searchParams, session, status]);

  // Handle redirect after successful authentication
  useEffect(() => {
    if (session && !isProcessing) {
      router.push('/dashboard?new_user=true');
    }
  }, [session, isProcessing, router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gradient-to-b from-white via-indigo-50/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
            {isProcessing ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Processing your purchase...
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Please wait while we set up your premium account.
                </p>
              </div>
            ) : error ? (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">❌</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Oops! Something went wrong
                </h2>
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✨</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome to Premium!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Your account has been successfully upgraded. Redirecting you to your dashboard...
                </p>
                <div className="animate-pulse text-sm text-gray-500 dark:text-gray-400">
                  Redirecting in a few seconds...
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 

export default function PurchaseSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PurchaseSuccess />
    </Suspense>
  );
}