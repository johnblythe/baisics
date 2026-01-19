'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

// Feature catalog page following v2a style guide

const HERO_FEATURES = [
  {
    id: 'ai-program-builder',
    title: 'AI Program Builder',
    description: 'Chat naturally about your goals, experience, and schedule. Our AI builds you a personalized workout program in minutes, not hours.',
    screenshot: '/features/ai-program-builder.png',
    category: 'Core',
  },
  {
    id: 'workout-logging',
    title: 'Workout Logging',
    description: 'Track every set, rep, and weight during your workout. See your PRs and last session data right where you need it.',
    screenshot: '/features/workout-logging-mobile.png',
    category: 'Core',
  },
  {
    id: 'progress-dashboard',
    title: 'Progress Dashboard',
    description: "Your command center for training. See today's workout, track your streak, and monitor your progress all in one place.",
    screenshot: '/features/progress-dashboard.png',
    category: 'Core',
  },
];

const MORE_FEATURES = [
  {
    id: 'import-program',
    title: 'Import or Create Your Own',
    description: 'Already have a program? Paste it, upload a file, or even just talk through it. We\'ll turn any workout into a trackable program.',
    screenshot: '/features/import-program.png',
    category: 'Core',
  },
  {
    id: 'templates-library',
    title: 'Templates Library',
    description: 'Browse proven programs from PPL to 5/3/1 to full-body splits. Find one that fits your schedule and goals, customize it your way.',
    screenshot: '/features/templates-library.png',
    category: 'Core',
  },
  {
    id: 'ai-trainer-chat',
    title: 'AI Trainer Chat',
    description: 'Get real-time answers about form, exercise swaps, and programming questions. Like having a trainer in your pocket.',
    screenshot: '/features/ai-trainer-chat.png',
    category: 'AI',
  },
  {
    id: 'nutrition-tracking',
    title: 'Nutrition & Macros',
    description: 'Personalized calorie and macro targets based on your goals. Track what you eat and see how it aligns with your targets.',
    screenshot: '/features/nutrition-tracking.png',
    category: 'Nutrition',
  },
  {
    id: 'meal-prep',
    title: 'Meal Planning',
    description: 'Generate meal plans that hit your macros. Get grocery lists, prep instructions, and recipes tailored to your preferences.',
    screenshot: '/features/meal-prep.png',
    category: 'Nutrition',
  },
  {
    id: 'check-in',
    title: 'Check-ins & Progress Photos',
    description: 'Track measurements, take progress photos, and see your transformation over time. We celebrate progress, not perfection.',
    screenshot: '/features/check-in.png',
    category: 'Progress',
  },
  {
    id: 'exercise-library',
    title: 'Exercise Library',
    description: '500+ exercises with video demos, muscle group targeting, and smart suggestions based on your equipment.',
    screenshot: '/features/exercise-library.png',
    category: 'Core',
  },
];

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
                <Link href="/templates" className="text-sm font-medium text-[var(--color-gray-500)] hover:text-[var(--color-navy)] transition-colors">Templates</Link>
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

        {/* Hero Features */}
        <section className="py-16 px-6 bg-[var(--color-gray-50)]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[var(--color-navy)] mb-4">Core Features</h2>
              <p className="text-[var(--color-gray-500)] max-w-2xl mx-auto">The essentials that make baisics different</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {HERO_FEATURES.map((feature) => (
                <div
                  key={feature.id}
                  className="group bg-white rounded-3xl border border-[var(--color-gray-200)] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-[var(--color-gray-100)] to-[var(--color-gray-200)] relative overflow-hidden">
                    <Image
                      src={feature.screenshot}
                      alt={`${feature.title} screenshot`}
                      fill
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1.5 text-xs font-bold text-[var(--color-coral)] bg-[var(--color-coral-light)] rounded-full uppercase tracking-wide">
                        {feature.category}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--color-navy)] mb-3">{feature.title}</h3>
                    <p className="text-[var(--color-gray-500)] leading-relaxed text-lg">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* More Features */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[var(--color-navy)] mb-4">More Features</h2>
              <p className="text-[var(--color-gray-500)] max-w-2xl mx-auto">Everything else you need to succeed</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {MORE_FEATURES.map((feature) => (
                <div
                  key={feature.id}
                  className="group bg-white rounded-2xl border border-[var(--color-gray-200)] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-video bg-gradient-to-br from-[var(--color-gray-100)] to-[var(--color-gray-200)] relative overflow-hidden">
                    <Image
                      src={feature.screenshot}
                      alt={`${feature.title} screenshot`}
                      fill
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-navy)]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

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

        {/* Philosophy Section */}
        <section className="py-16 px-6 bg-[var(--color-gray-50)]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-[var(--color-navy)] mb-6">
              Built Different
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mt-10">
              <div className="p-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[var(--color-coral-light)] flex items-center justify-center">
                  <svg className="w-7 h-7 text-[var(--color-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[var(--color-navy)] mb-2">No Anxiety Streaks</h3>
                <p className="text-[var(--color-gray-500)]">We celebrate progress, not perfection. Miss a day? Life happens. Your streak doesn&apos;t break, it pauses.</p>
              </div>
              <div className="p-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[var(--color-coral-light)] flex items-center justify-center">
                  <svg className="w-7 h-7 text-[var(--color-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[var(--color-navy)] mb-2">Long Game Thinking</h3>
                <p className="text-[var(--color-gray-500)]">Fitness is a lifetime journey. We build tools that help you stay consistent for years, not weeks.</p>
              </div>
              <div className="p-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[var(--color-coral-light)] flex items-center justify-center">
                  <svg className="w-7 h-7 text-[var(--color-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[var(--color-navy)] mb-2">Your Way</h3>
                <p className="text-[var(--color-gray-500)]">Build from scratch, import your program, or use a template. However you train, we adapt to you.</p>
              </div>
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
                href="/templates"
                className="px-12 py-5 text-lg font-semibold text-white border-2 border-white rounded-xl hover:bg-white hover:text-[var(--color-navy)] transition-all"
              >
                Browse Templates
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
                <Link href="/templates" className="text-sm text-[var(--color-gray-500)] hover:text-[var(--color-navy)] transition-colors">Templates</Link>
                <Link href="/coaches" className="text-sm text-[var(--color-gray-500)] hover:text-[var(--color-navy)] transition-colors">Coaches</Link>
                <Link href="/privacy" className="text-sm text-[var(--color-gray-500)] hover:text-[var(--color-navy)] transition-colors">Privacy</Link>
              </nav>

              <p className="text-sm text-[var(--color-gray-400)]">&copy; {new Date().getFullYear()} baisics. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
