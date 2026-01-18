'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Mail, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';

const COACH_TYPES = [
  { value: '', label: 'Select your role...' },
  { value: 'personal_trainer', label: 'Personal trainer' },
  { value: 'online_coach', label: 'Online coach' },
  { value: 'gym_owner', label: 'Gym owner' },
  { value: 'strength_coach', label: 'Strength coach' },
  { value: 'nutritionist', label: 'Nutritionist / RD' },
  { value: 'other', label: 'Other' },
];

export default function CoachSignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [coachType, setCoachType] = useState('');
  const [otherCoachType, setOtherCoachType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !coachType) return;

    // If "Other" is selected, require the custom type
    if (coachType === 'other' && !otherCoachType.trim()) {
      setError('Please specify your role');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const finalCoachType = coachType === 'other' ? otherCoachType.trim() : coachType;
      const normalizedEmail = email.toLowerCase().trim();

      // Step 1: Store pending coach signup data on the server (sets a cookie)
      const response = await fetch('/api/coaches/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: normalizedEmail,
          coachType: finalCoachType,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to initialize signup. Please try again.');
        setIsLoading(false);
        return;
      }

      // Step 2: Trigger NextAuth magic link email
      await signIn('email', {
        email: normalizedEmail,
        callbackUrl: '/coach/dashboard',
        redirect: false,
      });

      setIsSubmitted(true);
    } catch (err) {
      console.error('Sign up error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError('');

    try {
      await signIn('email', {
        email: email.toLowerCase().trim(),
        callbackUrl: '/coach/dashboard',
        redirect: false,
      });
    } catch (err) {
      console.error('Resend error:', err);
      setError('Failed to resend. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Confirmation screen after form submission
  if (isSubmitted) {
    return (
      <>
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');

          .coach-signup {
            --color-white: #FFFFFF;
            --color-gray-50: #F8FAFC;
            --color-gray-100: #F1F5F9;
            --color-gray-200: #E2E8F0;
            --color-gray-400: #94A3B8;
            --color-gray-500: #64748B;
            --color-gray-600: #475569;
            --color-navy: #0F172A;
            --color-navy-light: #1E293B;
            --color-coral: #FF6B6B;
            --color-coral-dark: #EF5350;
            --color-coral-light: #FFE5E5;

            font-family: 'Outfit', sans-serif;
            background-color: var(--color-white);
            color: var(--color-navy);
          }
        `}</style>

        <div className="coach-signup min-h-screen flex flex-col">
          {/* Header */}
          <header className="bg-[var(--color-white)] border-b border-[var(--color-gray-100)]">
            <div className="max-w-6xl mx-auto px-6">
              <div className="flex items-center justify-between h-16">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[var(--color-coral)] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">B</span>
                  </div>
                  <span className="font-bold text-xl text-[var(--color-navy)]">baisics</span>
                  <span className="text-sm text-[var(--color-coral)] font-semibold border-l border-[var(--color-gray-200)] pl-3 ml-1">
                    for Coaches
                  </span>
                </Link>
              </div>
            </div>
          </header>

          {/* Confirmation Content */}
          <div className="flex-1 flex items-center justify-center px-4 py-16">
            <div className="max-w-md w-full">
              <div className="bg-white rounded-2xl border border-[var(--color-gray-100)] shadow-lg p-8 text-center">
                {/* Success Icon */}
                <div className="w-16 h-16 mx-auto bg-[var(--color-coral-light)] rounded-2xl flex items-center justify-center mb-6">
                  <CheckCircle className="w-8 h-8 text-[var(--color-coral)]" />
                </div>

                <h1 className="text-2xl font-bold text-[var(--color-navy)] mb-2">
                  Check your email
                </h1>
                <p className="text-[var(--color-gray-600)] mb-6">
                  We sent a sign-in link to <span className="font-semibold text-[var(--color-navy)]">{email}</span>
                </p>

                <div className="bg-[var(--color-gray-50)] rounded-xl p-4 mb-6 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[var(--color-navy)] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-navy)] mb-1">
                        Click the link in your email to complete signup
                      </p>
                      <p className="text-sm text-[var(--color-gray-400)]">
                        If you don&apos;t see it, check your spam folder.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleResend}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 text-sm text-[var(--color-coral)] hover:text-[var(--color-coral-dark)] font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Resend link
                    </>
                  )}
                </button>

                <div className="mt-6 pt-6 border-t border-[var(--color-gray-100)]">
                  <Link
                    href="/coaches"
                    className="text-sm text-[var(--color-gray-400)] hover:text-[var(--color-navy)] transition-colors"
                  >
                    &larr; Back to Coaches
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Signup form
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');

        .coach-signup {
          --color-white: #FFFFFF;
          --color-gray-50: #F8FAFC;
          --color-gray-100: #F1F5F9;
          --color-gray-200: #E2E8F0;
          --color-gray-400: #94A3B8;
          --color-gray-500: #64748B;
          --color-gray-600: #475569;
          --color-navy: #0F172A;
          --color-navy-light: #1E293B;
          --color-coral: #FF6B6B;
          --color-coral-dark: #EF5350;
          --color-coral-light: #FFE5E5;

          font-family: 'Outfit', sans-serif;
          background-color: var(--color-white);
          color: var(--color-navy);
        }
      `}</style>

      <div className="coach-signup min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-[var(--color-white)] border-b border-[var(--color-gray-100)]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[var(--color-coral)] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <span className="font-bold text-xl text-[var(--color-navy)]">baisics</span>
                <span className="text-sm text-[var(--color-coral)] font-semibold border-l border-[var(--color-gray-200)] pl-3 ml-1">
                  for Coaches
                </span>
              </Link>

              <Link href="/auth/signin" className="text-sm font-medium text-[var(--color-gray-500)] hover:text-[var(--color-navy)] transition-colors">
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[var(--color-navy)] mb-3">
                Start your coach account
              </h1>
              <p className="text-[var(--color-gray-600)]">
                Get set up in minutes. No credit card required.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[var(--color-gray-100)] shadow-lg p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[var(--color-gray-600)] mb-2">
                    Your name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-gray-100)] bg-white text-[var(--color-navy)] placeholder-[var(--color-gray-400)] focus:ring-2 focus:ring-[var(--color-coral)]/20 focus:border-[var(--color-coral)] transition-colors"
                    placeholder="John Smith"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--color-gray-600)] mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-gray-100)] bg-white text-[var(--color-navy)] placeholder-[var(--color-gray-400)] focus:ring-2 focus:ring-[var(--color-coral)]/20 focus:border-[var(--color-coral)] transition-colors"
                    placeholder="you@example.com"
                  />
                </div>

                {/* Coach Type */}
                <div>
                  <label htmlFor="coachType" className="block text-sm font-medium text-[var(--color-gray-600)] mb-2">
                    What type of coach are you?
                  </label>
                  <select
                    id="coachType"
                    name="coachType"
                    required
                    value={coachType}
                    onChange={(e) => setCoachType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-gray-100)] bg-white text-[var(--color-navy)] focus:ring-2 focus:ring-[var(--color-coral)]/20 focus:border-[var(--color-coral)] transition-colors appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394A3B8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.75rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem',
                    }}
                  >
                    {COACH_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Other Coach Type - shown when "Other" is selected */}
                {coachType === 'other' && (
                  <div>
                    <label htmlFor="otherCoachType" className="block text-sm font-medium text-[var(--color-gray-600)] mb-2">
                      Please specify your role
                    </label>
                    <input
                      id="otherCoachType"
                      name="otherCoachType"
                      type="text"
                      required
                      value={otherCoachType}
                      onChange={(e) => setOtherCoachType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--color-gray-100)] bg-white text-[var(--color-navy)] placeholder-[var(--color-gray-400)] focus:ring-2 focus:ring-[var(--color-coral)]/20 focus:border-[var(--color-coral)] transition-colors"
                      placeholder="e.g., Yoga instructor, CrossFit coach"
                    />
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !name || !email || !coachType}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[var(--color-coral)] text-white font-semibold hover:bg-[var(--color-coral-dark)] transition-colors shadow-lg shadow-[var(--color-coral)]/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending link...</span>
                    </>
                  ) : (
                    <>
                      <span>Get started</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[var(--color-gray-400)]">
                We&apos;ll send you a secure sign-in link. No password needed.
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-[var(--color-gray-400)]">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-[var(--color-coral)] hover:underline">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-[var(--color-coral)] hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
