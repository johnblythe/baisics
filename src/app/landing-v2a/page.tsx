'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { sendGTMEvent } from '@next/third-parties/google';
import BetaModal from '../components/BetaModal';

// VERSION A: Fresh Athletic
// Crisp white + deep navy + warm coral accent
// Bold, confident, energetic - distinct from SoFi

export default function LandingPageV2A() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    sendGTMEvent({ event: 'button clicked', value: 'getStarted_v2a' });
    if (process.env.NEXT_PUBLIC_WE_LIVE === 'true') {
      router.push('/hi');
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

        .landing-v2a {
          --color-white: #FFFFFF;
          --color-gray-50: #F8FAFC;
          --color-gray-100: #F1F5F9;
          --color-gray-400: #94A3B8;
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

        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        .pulse-ring::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid var(--color-coral);
          animation: pulse-ring 2s ease-out infinite;
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }

        .delay-1 { animation-delay: 0.1s; opacity: 0; }
        .delay-2 { animation-delay: 0.2s; opacity: 0; }
        .delay-3 { animation-delay: 0.3s; opacity: 0; }
        .delay-4 { animation-delay: 0.4s; opacity: 0; }
      `}</style>

      <div className="landing-v2a min-h-screen">
        <BetaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

        {/* Navigation */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-white)]/95 backdrop-blur-md border-b border-[var(--color-gray-100)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[var(--color-coral)] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <span className="font-bold text-xl text-[var(--color-navy)]">baisics</span>
              </Link>

              <nav className="hidden md:flex items-center gap-8">
                <Link href="#features" className="text-sm font-medium text-[var(--color-gray-600)] hover:text-[var(--color-navy)] transition-colors">Features</Link>
                <Link href="#pricing" className="text-sm font-medium text-[var(--color-gray-600)] hover:text-[var(--color-navy)] transition-colors">Pricing</Link>
                <Link href="/blog" className="text-sm font-medium text-[var(--color-gray-600)] hover:text-[var(--color-navy)] transition-colors">Blog</Link>
              </nav>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleGetStarted}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[var(--color-navy)] rounded-lg hover:bg-[var(--color-navy-light)] transition-all"
                >
                  Get Started
                </button>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="pt-28 lg:pt-36 pb-20 px-6 lg:px-8 bg-gradient-to-b from-[var(--color-gray-50)] to-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="space-y-8">
                <div className="animate-slide-up delay-1">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--color-coral-light)] text-[var(--color-coral-dark)] rounded-full text-sm font-semibold">
                    <span className="relative w-2 h-2 bg-[var(--color-coral)] rounded-full pulse-ring"></span>
                    Now with AI-powered adjustments
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight animate-slide-up delay-2">
                  Your workout plan,{' '}
                  <span className="text-[var(--color-coral)]">built for you</span>
                </h1>

                <p className="text-lg lg:text-xl text-[var(--color-gray-600)] max-w-lg leading-relaxed animate-slide-up delay-3">
                  Stop following generic programs. Get a personalized training plan that adapts to your goals, schedule, and equipment in under 2 minutes.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 animate-slide-up delay-4">
                  <button
                    onClick={handleGetStarted}
                    className="group px-8 py-4 text-base font-bold text-white bg-[var(--color-coral)] rounded-xl hover:bg-[var(--color-coral-dark)] transition-all shadow-lg shadow-[var(--color-coral)]/25 hover:shadow-xl hover:shadow-[var(--color-coral)]/30"
                  >
                    Start Free
                    <svg className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                  <Link href="#features" className="px-8 py-4 text-base font-semibold text-[var(--color-navy)] border-2 border-[var(--color-gray-100)] rounded-xl hover:border-[var(--color-navy)] transition-all text-center">
                    Learn More
                  </Link>
                </div>

                <div className="flex items-center gap-6 pt-4 font-mono text-xs text-[var(--color-gray-400)] uppercase tracking-wider">
                  <span>✓ Free forever plan</span>
                  <span>✓ No credit card</span>
                  <span>✓ 2 min setup</span>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[var(--color-coral)]/20 to-[var(--color-navy)]/20 rounded-3xl blur-3xl"></div>
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border-4 border-white shadow-2xl">
                  <picture>
                    <source type="image/webp" srcSet="/lp/gym-hero.webp" />
                    <Image src="/lp/gym-hero.png" alt="Fitness" fill className="object-cover" priority />
                  </picture>
                </div>

                {/* Stats Card */}
                <div className="absolute -bottom-6 -left-6 p-4 bg-white rounded-xl shadow-xl border border-[var(--color-gray-100)]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[var(--color-coral-light)] rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-[var(--color-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-[var(--color-navy)]">500+ Programs</p>
                      <p className="text-sm text-[var(--color-gray-400)]">Created this month</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 lg:py-32 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="font-mono text-sm text-[var(--color-coral)] uppercase tracking-wider mb-4">How It Works</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">Simple. Fast. Effective.</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { num: '01', title: 'Tell us about you', desc: 'Share your goals, schedule, and available equipment through a quick chat.' },
                { num: '02', title: 'Get your plan', desc: 'Our AI creates a fully customized workout and nutrition program just for you.' },
                { num: '03', title: 'Track & improve', desc: 'Log workouts, check in weekly, and watch your program evolve with you.' },
              ].map((step, i) => (
                <div key={i} className="group p-8 rounded-2xl bg-[var(--color-gray-50)] hover:bg-[var(--color-navy)] transition-all duration-300">
                  <span className="font-mono text-5xl font-bold text-[var(--color-gray-100)] group-hover:text-[var(--color-navy-light)] transition-colors">{step.num}</span>
                  <h3 className="text-xl font-bold mt-4 mb-2 text-[var(--color-navy)] group-hover:text-white transition-colors">{step.title}</h3>
                  <p className="text-[var(--color-gray-600)] group-hover:text-[var(--color-gray-400)] transition-colors">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-16 px-6 lg:px-8 bg-[var(--color-navy)]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to transform your fitness?</h2>
            <p className="text-lg text-[var(--color-gray-400)] mb-8">Join hundreds of people who stopped guessing and started progressing.</p>
            <button onClick={handleGetStarted} className="px-10 py-4 text-lg font-bold text-[var(--color-navy)] bg-[var(--color-coral)] rounded-xl hover:bg-[var(--color-coral-dark)] transition-all">
              Create Your Free Program
            </button>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 lg:py-32 px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="font-mono text-sm text-[var(--color-coral)] uppercase tracking-wider mb-4">Pricing</p>
              <h2 className="text-3xl sm:text-4xl font-bold">Start free, upgrade anytime</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 rounded-2xl border-2 border-[var(--color-gray-100)] bg-white">
                <p className="font-mono text-sm text-[var(--color-gray-400)] uppercase mb-2">Free</p>
                <p className="text-4xl font-bold text-[var(--color-navy)] mb-6">$0<span className="text-lg font-normal text-[var(--color-gray-400)]">/forever</span></p>
                <ul className="space-y-3 mb-8">
                  {['Unlimited programs', 'Exercise library', 'Basic nutrition', 'PDF export'].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-[var(--color-gray-600)]">
                      <svg className="w-5 h-5 text-[var(--color-coral)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button onClick={handleGetStarted} className="w-full py-3 font-semibold border-2 border-[var(--color-navy)] text-[var(--color-navy)] rounded-xl hover:bg-[var(--color-navy)] hover:text-white transition-all">
                  Get Started
                </button>
              </div>

              <div className="relative p-8 rounded-2xl bg-[var(--color-navy)] text-white">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--color-coral)] text-xs font-bold rounded-full">POPULAR</div>
                <p className="font-mono text-sm text-[var(--color-gray-400)] uppercase mb-2">Pro</p>
                <p className="text-4xl font-bold mb-1">$10<span className="text-lg font-normal text-[var(--color-gray-400)]">/month</span></p>
                <p className="text-[var(--color-coral)] text-sm mb-6 line-through decoration-[var(--color-gray-400)]">$20/month</p>
                <ul className="space-y-3 mb-8">
                  {['Everything in Free', 'Workout tracking', 'Weekly check-ins', 'Auto-adjusting programs', 'Progress photos', 'Priority support'].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-[var(--color-gray-400)]">
                      <svg className="w-5 h-5 text-[var(--color-coral)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button onClick={handleGetStarted} className="w-full py-3 font-bold bg-[var(--color-coral)] rounded-xl hover:bg-[var(--color-coral-dark)] transition-all">
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 lg:px-8 border-t border-[var(--color-gray-100)]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[var(--color-coral)] rounded-md"></div>
              <span className="font-bold text-[var(--color-navy)]">baisics</span>
            </div>
            <p className="text-sm text-[var(--color-gray-400)]">&copy; {new Date().getFullYear()} baisics. Made in Indianapolis.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
