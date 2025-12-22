'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { sendGTMEvent } from '@next/third-parties/google';
import BetaModal from '../components/BetaModal';

// VERSION B: Soft Wellness
// Light gray + sage green + calming aesthetic
// Clean, minimal, health-focused

export default function LandingPageV2B() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    sendGTMEvent({ event: 'button clicked', value: 'getStarted_v2b' });
    if (process.env.NEXT_PUBLIC_WE_LIVE === 'true') {
      router.push('/hi');
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,600&display=swap');

        .landing-v2b {
          --color-white: #FFFFFF;
          --color-gray-50: #FAFAFA;
          --color-gray-100: #F5F5F5;
          --color-gray-200: #E5E5E5;
          --color-gray-500: #737373;
          --color-gray-700: #404040;
          --color-gray-900: #171717;
          --color-sage: #7C9A82;
          --color-sage-dark: #5A7860;
          --color-sage-light: #E8F0E9;
          --color-sage-50: #F4F8F5;

          font-family: 'Instrument Sans', sans-serif;
          background-color: var(--color-gray-50);
          color: var(--color-gray-900);
        }

        .font-serif {
          font-family: 'Fraunces', serif;
        }

        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 1; }
        }

        .breathe {
          animation: breathe 4s ease-in-out infinite;
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .delay-1 { animation-delay: 0.15s; opacity: 0; }
        .delay-2 { animation-delay: 0.3s; opacity: 0; }
        .delay-3 { animation-delay: 0.45s; opacity: 0; }
      `}</style>

      <div className="landing-v2b min-h-screen">
        <BetaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

        {/* Navigation */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-gray-50)]/90 backdrop-blur-lg">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              <Link href="/" className="font-serif text-2xl text-[var(--color-gray-900)]">baisics</Link>

              <nav className="hidden md:flex items-center gap-10">
                <Link href="#how" className="text-sm text-[var(--color-gray-500)] hover:text-[var(--color-gray-900)] transition-colors">How it works</Link>
                <Link href="#pricing" className="text-sm text-[var(--color-gray-500)] hover:text-[var(--color-gray-900)] transition-colors">Pricing</Link>
                <Link href="/blog" className="text-sm text-[var(--color-gray-500)] hover:text-[var(--color-gray-900)] transition-colors">Blog</Link>
              </nav>

              <button
                onClick={handleGetStarted}
                className="hidden sm:block px-5 py-2.5 text-sm font-medium text-white bg-[var(--color-sage)] rounded-full hover:bg-[var(--color-sage-dark)] transition-all"
              >
                Start free
              </button>

              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="pt-32 lg:pt-44 pb-20 lg:pb-32 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-sage-light)] rounded-full mb-8 fade-in delay-1">
                <div className="w-2 h-2 bg-[var(--color-sage)] rounded-full breathe"></div>
                <span className="text-sm text-[var(--color-sage-dark)]">Personalized fitness, simplified</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.15] mb-6 fade-in delay-2">
                A gentler approach to{' '}
                <span className="text-[var(--color-sage)]">getting stronger</span>
              </h1>

              <p className="text-lg lg:text-xl text-[var(--color-gray-500)] max-w-xl mx-auto mb-10 leading-relaxed fade-in delay-3">
                No intimidation, no confusion. Just a personalized workout plan that meets you exactly where you are.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in delay-3">
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-4 text-base font-medium text-white bg-[var(--color-sage)] rounded-full hover:bg-[var(--color-sage-dark)] transition-all shadow-sm hover:shadow-md"
                >
                  Create your program
                </button>
                <Link href="#how" className="px-8 py-4 text-base font-medium text-[var(--color-gray-700)] bg-white border border-[var(--color-gray-200)] rounded-full hover:border-[var(--color-gray-500)] transition-all text-center">
                  See how it works
                </Link>
              </div>

              <div className="flex items-center justify-center gap-8 mt-12 text-sm text-[var(--color-gray-500)]">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--color-sage)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Free to start
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--color-sage)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  2 minute setup
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--color-sage)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Cancel anytime
                </span>
              </div>
            </div>

            {/* Hero Image */}
            <div className="mt-16 lg:mt-24 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--color-gray-50)] z-10 pointer-events-none h-32 bottom-0 top-auto"></div>
              <div className="relative aspect-[16/9] lg:aspect-[21/9] rounded-3xl overflow-hidden bg-[var(--color-sage-light)]">
                <picture>
                  <source type="image/webp" srcSet="/lp/gym-hero.webp" />
                  <Image src="/lp/gym-hero.png" alt="Fitness" fill className="object-cover opacity-90" priority />
                </picture>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how" className="py-20 lg:py-32 px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 lg:mb-20">
              <p className="text-sm font-medium text-[var(--color-sage)] uppercase tracking-wider mb-3">How it works</p>
              <h2 className="font-serif text-3xl sm:text-4xl">Three simple steps</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
              {[
                { icon: '💬', title: 'Have a conversation', desc: 'Tell us about your goals, your life, and what you have to work with. No judgment, just understanding.' },
                { icon: '✨', title: 'Receive your plan', desc: 'Get a workout program designed specifically for you, complete with exercises, sets, and nutrition guidance.' },
                { icon: '📈', title: 'Grow with support', desc: 'Track your progress, check in weekly, and let your program evolve as you do.' },
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-[var(--color-sage-50)] rounded-2xl flex items-center justify-center text-3xl">
                    {step.icon}
                  </div>
                  <h3 className="font-serif text-xl mb-3">{step.title}</h3>
                  <p className="text-[var(--color-gray-500)] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 lg:py-32 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-sm font-medium text-[var(--color-sage)] uppercase tracking-wider mb-3">Built for real life</p>
                <h2 className="font-serif text-3xl sm:text-4xl mb-6">Your program, your pace</h2>
                <p className="text-[var(--color-gray-500)] text-lg leading-relaxed mb-8">
                  We know life gets busy. That&apos;s why every program is built around your schedule, your equipment, and your comfort level.
                </p>

                <div className="space-y-6">
                  {[
                    { title: 'Flexible scheduling', desc: 'Whether you have 3 days or 6, 20 minutes or an hour.' },
                    { title: 'Any equipment', desc: 'Full gym, home setup, or just your bodyweight.' },
                    { title: 'Adaptive programs', desc: 'Your plan adjusts as you progress and life changes.' },
                  ].map((f, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 flex-shrink-0 bg-[var(--color-sage-light)] rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-[var(--color-sage)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-[var(--color-gray-900)] mb-1">{f.title}</h3>
                        <p className="text-sm text-[var(--color-gray-500)]">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square rounded-3xl overflow-hidden bg-[var(--color-sage-light)]">
                  <picture>
                    <source type="image/webp" srcSet="/lp/clarity-opt.webp" />
                    <Image src="/lp/clarity.webp" alt="Clarity" fill className="object-cover" />
                  </picture>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-20 lg:py-32 px-6 lg:px-8 bg-[var(--color-sage-50)]">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-8 bg-[var(--color-sage-light)] rounded-full flex items-center justify-center">
              <span className="text-2xl">🌱</span>
            </div>
            <blockquote className="font-serif text-2xl sm:text-3xl text-[var(--color-gray-700)] leading-relaxed mb-8">
              &ldquo;Finally, a fitness app that doesn&apos;t make me feel like I&apos;m behind. It just meets me where I am.&rdquo;
            </blockquote>
            <p className="text-[var(--color-gray-500)]">— Sarah M., member since 2024</p>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 lg:py-32 px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm font-medium text-[var(--color-sage)] uppercase tracking-wider mb-3">Simple pricing</p>
              <h2 className="font-serif text-3xl sm:text-4xl mb-4">Start free, grow at your pace</h2>
              <p className="text-[var(--color-gray-500)]">Your first program is completely free. No strings attached.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-8 rounded-3xl bg-[var(--color-gray-50)] border border-[var(--color-gray-100)]">
                <p className="text-sm font-medium text-[var(--color-gray-500)] uppercase mb-2">Free</p>
                <p className="font-serif text-4xl mb-6">$0</p>
                <ul className="space-y-3 mb-8 text-[var(--color-gray-700)]">
                  {['Unlimited programs', 'Full exercise library', 'Basic nutrition guidance', 'PDF export'].map((f, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-[var(--color-sage)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button onClick={handleGetStarted} className="w-full py-3 text-[var(--color-gray-700)] border border-[var(--color-gray-200)] rounded-full hover:border-[var(--color-gray-500)] transition-all">
                  Get started
                </button>
              </div>

              <div className="p-8 rounded-3xl bg-[var(--color-sage)] text-white">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-medium text-[var(--color-sage-light)] uppercase">Pro</p>
                  <span className="px-2 py-0.5 text-xs bg-white/20 rounded-full">50% off</span>
                </div>
                <p className="font-serif text-4xl mb-1">$10<span className="text-lg font-normal opacity-70">/mo</span></p>
                <p className="text-sm opacity-70 line-through mb-6">$20/mo</p>
                <ul className="space-y-3 mb-8 text-white/90">
                  {['Everything in Free', 'Workout tracking', 'Weekly check-ins', 'Auto-adjusting programs', 'Progress photos', 'Priority support'].map((f, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button onClick={handleGetStarted} className="w-full py-3 bg-white text-[var(--color-sage-dark)] font-medium rounded-full hover:bg-[var(--color-sage-light)] transition-all">
                  Start free trial
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 lg:py-32 px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-3xl sm:text-4xl mb-6">Ready to begin?</h2>
            <p className="text-lg text-[var(--color-gray-500)] mb-10">Your personalized program is just a conversation away.</p>
            <button onClick={handleGetStarted} className="px-10 py-4 text-base font-medium text-white bg-[var(--color-sage)] rounded-full hover:bg-[var(--color-sage-dark)] transition-all">
              Create your free program
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 lg:px-8 border-t border-[var(--color-gray-100)]">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-serif text-xl text-[var(--color-gray-900)]">baisics</span>
            <p className="text-sm text-[var(--color-gray-500)]">&copy; {new Date().getFullYear()} baisics. Made with <span className="text-[var(--color-sage)]">&hearts;</span> in Indy.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
