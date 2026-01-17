'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Coach-focused landing page following v2a style guide

const COACH_BENEFITS = [
  {
    icon: (
      <svg className="w-8 h-8 text-[var(--color-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Save Hours Per Client',
    description: 'Stop writing the same program over and over. Generate customized programs in minutes, not hours.',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[var(--color-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Scale Your Practice',
    description: 'Take on more clients without sacrificing quality. Your expertise + our tech = more impact.',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[var(--color-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Your Brand, Your Rules',
    description: 'White-label programs under your name. Clients see your branding, not ours.',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[var(--color-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Track Client Progress',
    description: 'See workout logs, check-ins, and progress photos in one place. Spot who needs attention.',
  },
];

const COMPARISON = [
  { task: 'Create custom program', without: '2-4 hours', with: '5 minutes' },
  { task: 'Adjust for equipment', without: '30+ minutes', with: 'Automatic' },
  { task: 'Calculate nutrition', without: '15-30 minutes', with: 'Instant' },
  { task: 'Track client workouts', without: 'Spreadsheets', with: 'Real-time' },
  { task: 'Weekly check-ins', without: 'Email chaos', with: 'In-app' },
];

const TESTIMONIALS = [
  {
    quote: "I used to cap at 15 clients because program writing took so long. Now I handle 40+ without burning out.",
    name: 'Marcus T.',
    title: 'Online Coach, 3 years',
  },
  {
    quote: "The AI handles the boring stuff. I get to focus on what I'm actually good at—coaching and motivation.",
    name: 'Sarah K.',
    title: 'Personal Trainer',
  },
];

export default function CoachesPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleGetStarted = () => {
    router.push('/hi?ref=coaches');
  };

  const handleContactSales = () => {
    window.location.href = 'mailto:coaches@baisics.app?subject=Coach Partnership Inquiry';
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');

        .coaches-page {
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
          --color-green: #22C55E;
          --color-green-light: #DCFCE7;

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

      <div className="coaches-page min-h-screen">
        {/* Navigation */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-white)]/95 backdrop-blur-md border-b border-[var(--color-gray-100)]">
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

              <nav className="hidden md:flex items-center gap-8">
                <Link href="/" className="text-sm font-medium text-[var(--color-gray-500)] hover:text-[var(--color-navy)] transition-colors">Home</Link>
                <Link href="#benefits" className="text-sm font-medium text-[var(--color-gray-500)] hover:text-[var(--color-navy)] transition-colors">Benefits</Link>
                <Link href="#comparison" className="text-sm font-medium text-[var(--color-gray-500)] hover:text-[var(--color-navy)] transition-colors">Compare</Link>
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
        <section className="pt-32 pb-24 px-6 relative overflow-hidden bg-gradient-to-b from-white via-[var(--color-gray-50)] to-white">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--color-coral)]/25 rounded-full blur-md"></div>
          <div className="absolute top-10 right-0 w-[32rem] h-[32rem] bg-[var(--color-navy)]/20 rounded-full blur-md"></div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-block px-4 py-2 bg-[var(--color-coral-light)] rounded-full mb-6 animate-in stagger-1">
              <span className="text-sm font-semibold text-[var(--color-coral)]">Built for coaches who give a damn</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-[var(--color-navy)] animate-in stagger-1">
              Stop writing programs.{' '}
              <span className="bg-gradient-to-r from-[var(--color-coral)] to-[var(--color-coral-dark)] bg-clip-text text-transparent">
                Start coaching.
              </span>
            </h1>

            <p className="mt-8 text-xl sm:text-2xl text-[var(--color-gray-600)] leading-relaxed font-medium animate-in stagger-2 max-w-3xl mx-auto">
              Your clients need your expertise, not your Excel skills. Let AI handle program design so you can focus on what matters.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-5 justify-center items-center animate-in stagger-3">
              <button
                onClick={handleGetStarted}
                className="px-12 py-5 text-lg font-bold text-white bg-[var(--color-coral)] rounded-xl hover:bg-[var(--color-coral-dark)] transition-all shadow-xl shadow-[var(--color-coral)]/40 hover:shadow-2xl hover:shadow-[var(--color-coral)]/50 transform hover:-translate-y-1"
              >
                Start Free Trial
              </button>
              <button
                onClick={handleContactSales}
                className="px-12 py-5 text-lg font-semibold text-[var(--color-navy)] bg-white border-2 border-[var(--color-gray-400)] rounded-xl hover:border-[var(--color-navy)] hover:bg-[var(--color-gray-50)] transition-all"
              >
                Talk to Sales
              </button>
            </div>
          </div>
        </section>

        {/* The Problem */}
        <section className="py-20 px-6 bg-[var(--color-navy)]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
              Sound familiar?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-[var(--color-navy-light)] rounded-xl border border-[var(--color-gray-600)]">
                <p className="text-lg text-[var(--color-gray-400)]">
                  &ldquo;I spend more time on spreadsheets than actually coaching.&rdquo;
                </p>
              </div>
              <div className="p-6 bg-[var(--color-navy-light)] rounded-xl border border-[var(--color-gray-600)]">
                <p className="text-lg text-[var(--color-gray-400)]">
                  &ldquo;Every new client means hours of program writing.&rdquo;
                </p>
              </div>
              <div className="p-6 bg-[var(--color-navy-light)] rounded-xl border border-[var(--color-gray-600)]">
                <p className="text-lg text-[var(--color-gray-400)]">
                  &ldquo;I cap my clients because I can&apos;t scale the personal touch.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section id="benefits" className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold">What you get</h2>
              <p className="mt-3 text-lg text-[var(--color-gray-500)]">Tools that multiply your impact, not your workload.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {COACH_BENEFITS.map((benefit, i) => (
                <div key={i} className="p-8 bg-white rounded-2xl border border-[var(--color-gray-200)] shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-[var(--color-coral-light)] rounded-2xl flex items-center justify-center mb-5">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-navy)] mb-3">{benefit.title}</h3>
                  <p className="text-[var(--color-gray-500)]">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Time Comparison */}
        <section id="comparison" className="py-20 px-6 bg-[var(--color-gray-50)]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold">Time is money</h2>
              <p className="mt-3 text-lg text-[var(--color-gray-500)]">See how much you could save per client.</p>
            </div>

            <div className="bg-white rounded-2xl border border-[var(--color-gray-200)] overflow-hidden">
              <div className="grid grid-cols-3 bg-[var(--color-navy)] text-white">
                <div className="p-4 font-semibold">Task</div>
                <div className="p-4 font-semibold text-center">Without baisics</div>
                <div className="p-4 font-semibold text-center">With baisics</div>
              </div>
              {COMPARISON.map((row, i) => (
                <div key={i} className={`grid grid-cols-3 ${i % 2 === 0 ? 'bg-white' : 'bg-[var(--color-gray-50)]'}`}>
                  <div className="p-4 text-[var(--color-navy)] font-medium">{row.task}</div>
                  <div className="p-4 text-center text-[var(--color-gray-500)]">{row.without}</div>
                  <div className="p-4 text-center text-[var(--color-coral)] font-semibold">{row.with}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-[var(--color-coral-light)] rounded-xl text-center">
              <p className="text-lg font-semibold text-[var(--color-navy)]">
                Average time saved per client: <span className="text-[var(--color-coral)]">3-5 hours/week</span>
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold">Coaches who switched</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {TESTIMONIALS.map((testimonial, i) => (
                <div key={i} className="p-8 bg-white rounded-2xl border border-[var(--color-gray-200)] shadow-sm">
                  <p className="text-lg text-[var(--color-gray-600)] italic mb-6">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[var(--color-coral)] rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--color-navy)]">{testimonial.name}</p>
                      <p className="text-sm text-[var(--color-gray-500)]">{testimonial.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-[var(--color-navy)]">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to coach more, admin less?
            </h2>
            <p className="text-xl text-[var(--color-gray-400)] mb-10">
              Join coaches who are scaling their practice without burning out.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <button
                onClick={handleGetStarted}
                className="px-12 py-5 text-lg font-bold text-white bg-[var(--color-coral)] rounded-xl hover:bg-[var(--color-coral-dark)] transition-all shadow-xl shadow-[var(--color-coral)]/40"
              >
                Start Free Trial
              </button>
              <button
                onClick={handleContactSales}
                className="px-12 py-5 text-lg font-semibold text-white border-2 border-white rounded-xl hover:bg-white hover:text-[var(--color-navy)] transition-all"
              >
                Contact Sales
              </button>
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
