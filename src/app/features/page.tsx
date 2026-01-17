'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

// Feature catalog page following v2a style guide

const FEATURES = [
  {
    id: 'program-builder',
    title: 'AI Program Builder',
    description: 'Answer a few questions about your goals, experience, and available equipment. Get a fully personalized workout program in minutes.',
    screenshot: '/features/program-builder.png',
    category: 'Core',
  },
  {
    id: 'workout-logging',
    title: 'Workout Logging',
    description: 'Track every set, rep, and weight during your workout. See your PRs and last session data right where you need it.',
    screenshot: '/features/workout-logging.png',
    category: 'Core',
  },
  {
    id: 'exercise-library',
    title: 'Exercise Library',
    description: '500+ exercises with video demos, muscle group targeting, and alternative suggestions based on your equipment.',
    screenshot: '/features/exercise-library.png',
    category: 'Core',
  },
  {
    id: 'nutrition-macros',
    title: 'Nutrition & Macros',
    description: 'Personalized calorie and macro targets based on your goals. TDEE calculations that actually work.',
    screenshot: '/features/nutrition-macros.png',
    category: 'Nutrition',
  },
  {
    id: 'progress-tracking',
    title: 'Progress Tracking',
    description: 'Visual charts showing strength gains, volume trends, and workout consistency over time.',
    screenshot: '/features/progress-tracking.png',
    category: 'Analytics',
  },
  {
    id: 'ai-trainer-chat',
    title: 'AI Trainer Chat',
    description: 'Get real-time answers about form, exercise swaps, and programming questions during your workout.',
    screenshot: '/features/ai-trainer-chat.png',
    category: 'AI',
  },
  {
    id: 'weekly-checkins',
    title: 'Weekly Check-ins',
    description: 'Regular progress check-ins that adapt your program based on how you\'re feeling and performing.',
    screenshot: '/features/weekly-checkins.png',
    category: 'Tracking',
  },
  {
    id: 'pdf-export',
    title: 'PDF Export',
    description: 'Export your workout program to PDF for offline access or to share with your gym buddy.',
    screenshot: '/features/pdf-export.png',
    category: 'Export',
  },
];

const CATEGORIES = ['All', 'Core', 'AI', 'Nutrition', 'Analytics', 'Tracking', 'Export'];

export default function FeaturesPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleGetStarted = () => {
    router.push('/hi');
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');

        .features-page {
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

        .font-mono {
          font-family: 'Space Mono', monospace;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in {
          animation: fadeInUp 0.5s ease-out forwards;
        }

        .stagger-1 { animation-delay: 0.1s; opacity: 0; }
        .stagger-2 { animation-delay: 0.2s; opacity: 0; }
        .stagger-3 { animation-delay: 0.3s; opacity: 0; }
      `}</style>

      <div className="features-page min-h-screen">
        {/* Navigation */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-white)]/95 backdrop-blur-md border-b border-[var(--color-gray-100)]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[var(--color-coral)] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <span className="font-bold text-xl text-[var(--color-navy)]">baisics</span>
              </Link>

              <nav className="hidden md:flex items-center gap-8">
                <Link href="/" className="text-sm font-medium text-[var(--color-gray-500)] hover:text-[var(--color-navy)] transition-colors">Home</Link>
                <Link href="/coaches" className="text-sm font-medium text-[var(--color-gray-500)] hover:text-[var(--color-navy)] transition-colors">Coaches</Link>
                <Link href="/pricing" className="text-sm font-medium text-[var(--color-gray-500)] hover:text-[var(--color-navy)] transition-colors">Pricing</Link>
              </nav>

              <div className="flex items-center gap-3">
                {session ? (
                  <Link
                    href="/dashboard"
                    className="px-5 py-2 text-sm font-semibold text-white bg-[var(--color-navy)] rounded-lg hover:bg-[var(--color-navy-light)] transition-all"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/signin" className="text-sm font-medium text-[var(--color-gray-500)] hover:text-[var(--color-navy)] transition-colors">
                      Log in
                    </Link>
                    <button
                      onClick={handleGetStarted}
                      className="px-5 py-2 text-sm font-semibold text-white bg-[var(--color-coral)] rounded-lg hover:bg-[var(--color-coral-dark)] transition-all"
                    >
                      Try Free
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="pt-32 pb-16 px-6 relative overflow-hidden bg-gradient-to-b from-white via-[var(--color-gray-50)] to-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-coral)]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[32rem] h-[32rem] bg-[var(--color-navy)]/10 rounded-full blur-3xl"></div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-block px-4 py-2 bg-[var(--color-coral-light)] rounded-full mb-6 animate-in stagger-1">
              <span className="text-sm font-semibold text-[var(--color-coral)]">Everything you need to train smarter</span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.1] tracking-tight text-[var(--color-navy)] animate-in stagger-1">
              Features that{' '}
              <span className="bg-gradient-to-r from-[var(--color-coral)] to-[var(--color-coral-dark)] bg-clip-text text-transparent">
                actually help
              </span>
            </h1>

            <p className="mt-6 text-xl text-[var(--color-gray-600)] leading-relaxed font-medium animate-in stagger-2 max-w-2xl mx-auto">
              No bloat. No unnecessary complexity. Just the tools you need to build a workout habit that sticks.
            </p>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {FEATURES.map((feature, i) => (
                <div
                  key={feature.id}
                  className="group bg-white rounded-2xl border border-[var(--color-gray-200)] overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  {/* Screenshot placeholder */}
                  <div className="aspect-video bg-gradient-to-br from-[var(--color-gray-100)] to-[var(--color-gray-200)] relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-6">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-[var(--color-coral-light)] flex items-center justify-center">
                          <svg className="w-8 h-8 text-[var(--color-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-[var(--color-gray-400)]">Screenshot coming soon</span>
                      </div>
                    </div>
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-navy)]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 text-xs font-semibold text-[var(--color-coral)] bg-[var(--color-coral-light)] rounded-full">
                        {feature.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--color-navy)] mb-2">{feature.title}</h3>
                    <p className="text-[var(--color-gray-500)] leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-[var(--color-navy)]">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to start training smarter?
            </h2>
            <p className="text-xl text-[var(--color-gray-400)] mb-10">
              Get your personalized workout program in 5 minutes. Free.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <button
                onClick={handleGetStarted}
                className="px-12 py-5 text-lg font-bold text-white bg-[var(--color-coral)] rounded-xl hover:bg-[var(--color-coral-dark)] transition-all shadow-xl shadow-[var(--color-coral)]/40"
              >
                Get Started Free
              </button>
              <Link
                href="/coaches"
                className="px-12 py-5 text-lg font-semibold text-white border-2 border-white rounded-xl hover:bg-white hover:text-[var(--color-navy)] transition-all"
              >
                For Coaches
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 px-6 bg-[var(--color-gray-50)] border-t border-[var(--color-gray-200)]">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[var(--color-coral)] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <span className="font-bold text-xl text-[var(--color-navy)]">baisics</span>
              </div>

              <nav className="flex gap-8">
                <Link href="/" className="text-sm text-[var(--color-gray-500)] hover:text-[var(--color-navy)] transition-colors">Home</Link>
                <Link href="/coaches" className="text-sm text-[var(--color-gray-500)] hover:text-[var(--color-navy)] transition-colors">Coaches</Link>
                <Link href="/privacy" className="text-sm text-[var(--color-gray-500)] hover:text-[var(--color-navy)] transition-colors">Privacy</Link>
                <Link href="/terms" className="text-sm text-[var(--color-gray-500)] hover:text-[var(--color-navy)] transition-colors">Terms</Link>
              </nav>

              <p className="text-sm text-[var(--color-gray-400)]">&copy; {new Date().getFullYear()} baisics. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
