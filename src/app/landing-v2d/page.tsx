'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { sendGTMEvent } from '@next/third-parties/google';
import BetaModal from '../components/BetaModal';

// VERSION D: Warm Optimist
// Bright white + deep forest green + golden yellow accents
// Fresh, optimistic, growth-focused

export default function LandingPageV2D() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    sendGTMEvent({ event: 'button clicked', value: 'getStarted_v2d' });
    if (process.env.NEXT_PUBLIC_WE_LIVE === 'true') {
      router.push('/hi');
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap');

        .landing-v2d {
          --color-white: #FFFFFF;
          --color-off-white: #FEFDFB;
          --color-gray-100: #F3F2EF;
          --color-gray-400: #9CA3AF;
          --color-gray-600: #4B5563;
          --color-forest: #1B4332;
          --color-forest-light: #2D6A4F;
          --color-green-50: #F0FDF4;
          --color-gold: #F59E0B;
          --color-gold-light: #FEF3C7;
          --color-gold-dark: #D97706;

          font-family: 'Sora', sans-serif;
          background-color: var(--color-white);
          color: var(--color-forest);
        }

        .font-serif {
          font-family: 'Newsreader', serif;
        }

        @keyframes shine {
          0% { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }

        .shine {
          background: linear-gradient(90deg, var(--color-gold) 0%, #FBBF24 50%, var(--color-gold) 100%);
          background-size: 200% auto;
          animation: shine 3s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }

        @keyframes reveal {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .reveal {
          animation: reveal 0.7s ease-out forwards;
        }

        .reveal-delay-1 { animation-delay: 0.1s; opacity: 0; }
        .reveal-delay-2 { animation-delay: 0.2s; opacity: 0; }
        .reveal-delay-3 { animation-delay: 0.3s; opacity: 0; }
        .reveal-delay-4 { animation-delay: 0.4s; opacity: 0; }
      `}</style>

      <div className="landing-v2d min-h-screen">
        <BetaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

        {/* Navigation */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-white)]/95 backdrop-blur-md border-b border-[var(--color-gray-100)]">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[var(--color-forest)] rounded-full flex items-center justify-center">
                  <span className="text-[var(--color-gold)] text-sm font-bold">b</span>
                </div>
                <span className="font-semibold text-xl text-[var(--color-forest)]">baisics</span>
              </Link>

              <nav className="hidden md:flex items-center gap-10">
                <Link href="#features" className="text-sm text-[var(--color-gray-600)] hover:text-[var(--color-forest)] transition-colors">Features</Link>
                <Link href="#pricing" className="text-sm text-[var(--color-gray-600)] hover:text-[var(--color-forest)] transition-colors">Pricing</Link>
                <Link href="/blog" className="text-sm text-[var(--color-gray-600)] hover:text-[var(--color-forest)] transition-colors">Blog</Link>
              </nav>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleGetStarted}
                  className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[var(--color-forest)] bg-[var(--color-gold)] rounded-full hover:bg-[var(--color-gold-dark)] transition-all"
                >
                  <span>Get Started</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="pt-28 lg:pt-40 pb-16 lg:pb-24 px-6 lg:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-8">
                <div className="reveal reveal-delay-1">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-gold-light)] border border-[var(--color-gold)]/30 rounded-full">
                    <span className="text-lg bounce-subtle">🌟</span>
                    <span className="text-sm font-medium text-[var(--color-gold-dark)]">New chapter starts here</span>
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] reveal reveal-delay-2">
                  Your body deserves a{' '}
                  <span className="font-serif italic font-normal text-[var(--color-forest-light)]">real</span>{' '}
                  plan
                </h1>

                <p className="text-lg lg:text-xl text-[var(--color-gray-600)] max-w-lg leading-relaxed reveal reveal-delay-3">
                  Stop following programs made for someone else. In 2 minutes, get a workout plan built around your goals, your schedule, and your life.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 reveal reveal-delay-4">
                  <button
                    onClick={handleGetStarted}
                    className="group px-8 py-4 text-base font-semibold text-[var(--color-forest)] bg-[var(--color-gold)] rounded-full hover:bg-[var(--color-gold-dark)] transition-all shadow-lg shadow-[var(--color-gold)]/30 hover:shadow-xl"
                  >
                    Create Your Program — Free
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-[var(--color-gray-600)] reveal reveal-delay-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-[var(--color-green-50)] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-[var(--color-forest)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </div>
                    <span>100% Free to start</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-[var(--color-green-50)] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-[var(--color-forest)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </div>
                    <span>No credit card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-[var(--color-green-50)] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-[var(--color-forest)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </div>
                    <span>Takes 2 minutes</span>
                  </div>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative reveal reveal-delay-3">
                <div className="absolute -inset-8 bg-[var(--color-gold)]/10 rounded-[3rem] -rotate-3"></div>
                <div className="absolute -inset-8 bg-[var(--color-forest)]/5 rounded-[3rem] rotate-3"></div>
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                  <picture>
                    <source type="image/webp" srcSet="/lp/gym-hero.webp" />
                    <Image src="/lp/gym-hero.png" alt="Fitness journey" fill className="object-cover" priority />
                  </picture>
                </div>

                {/* Floating badge */}
                <div className="absolute -bottom-4 -right-4 lg:right-8 px-5 py-3 bg-white rounded-2xl shadow-xl border border-[var(--color-gray-100)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--color-gold-light)] rounded-xl flex items-center justify-center text-xl">
                      💪
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--color-forest)]">500+ programs</p>
                      <p className="text-xs text-[var(--color-gray-400)]">created this month</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-12 px-6 lg:px-8 bg-[var(--color-forest)] text-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-8">
              <div className="text-center">
                <p className="text-3xl lg:text-4xl font-bold shine">500+</p>
                <p className="text-sm text-white/70 mt-1">Programs created</p>
              </div>
              <div className="text-center">
                <p className="text-3xl lg:text-4xl font-bold shine">100s</p>
                <p className="text-sm text-white/70 mt-1">of exercises</p>
              </div>
              <div className="text-center">
                <p className="text-3xl lg:text-4xl font-bold shine">2 min</p>
                <p className="text-sm text-white/70 mt-1">average setup</p>
              </div>
              <div className="text-center">
                <p className="text-3xl lg:text-4xl font-bold text-[var(--color-gold)]">Free</p>
                <p className="text-sm text-white/70 mt-1">to get started</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 lg:py-32 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-[var(--color-green-50)] text-[var(--color-forest)] text-sm font-medium rounded-full mb-4">How it works</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">Simple as 1, 2, 3</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { num: '1', emoji: '💬', title: 'Tell us about you', desc: 'Quick chat about your goals, schedule, and what equipment you have.' },
                { num: '2', emoji: '✨', title: 'Get your plan', desc: 'AI builds a program designed specifically for your situation.' },
                { num: '3', emoji: '📈', title: 'Track progress', desc: 'Log workouts, check in weekly, and watch your program evolve.' },
              ].map((step, i) => (
                <div key={i} className="relative p-8 rounded-3xl bg-[var(--color-off-white)] border border-[var(--color-gray-100)] hover:border-[var(--color-gold)] hover:shadow-lg transition-all duration-300">
                  <div className="absolute -top-4 -left-2 w-10 h-10 bg-[var(--color-gold)] rounded-full flex items-center justify-center font-bold text-[var(--color-forest)]">
                    {step.num}
                  </div>
                  <div className="text-4xl mb-4">{step.emoji}</div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-[var(--color-gray-600)]">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 lg:py-32 px-6 lg:px-8 bg-[var(--color-off-white)]">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative order-2 lg:order-1">
                <div className="aspect-square rounded-3xl overflow-hidden">
                  <picture>
                    <source type="image/webp" srcSet="/lp/ai-helper-opt.webp" />
                    <Image src="/lp/ai-helper.jpg" alt="AI fitness" fill className="object-cover" />
                  </picture>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <span className="inline-block px-4 py-1.5 bg-[var(--color-gold-light)] text-[var(--color-gold-dark)] text-sm font-medium rounded-full mb-4">Why baisics?</span>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">Built for your real life</h2>
                <p className="text-lg text-[var(--color-gray-600)] mb-8">No more forcing yourself into programs that don&apos;t fit. We build around you.</p>

                <div className="space-y-6">
                  {[
                    { title: 'Your schedule', desc: '3 days or 6. 20 mins or an hour. We work with what you have.' },
                    { title: 'Your equipment', desc: 'Full gym? Dumbbells at home? Bodyweight only? All good.' },
                    { title: 'Your progress', desc: 'Weekly check-ins keep your program evolving with you.' },
                  ].map((b, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 flex-shrink-0 bg-[var(--color-gold)] rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-[var(--color-forest)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--color-forest)] mb-1">{b.title}</h3>
                        <p className="text-sm text-[var(--color-gray-600)]">{b.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 lg:py-32 px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-[var(--color-green-50)] text-[var(--color-forest)] text-sm font-medium rounded-full mb-4">Pricing</span>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, honest pricing</h2>
              <p className="text-[var(--color-gray-600)]">Start free. Upgrade when you&apos;re ready.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 rounded-3xl bg-white border-2 border-[var(--color-gray-100)]">
                <p className="text-sm font-semibold text-[var(--color-gray-400)] uppercase mb-2">Free Forever</p>
                <p className="text-5xl font-bold text-[var(--color-forest)] mb-6">$0</p>
                <ul className="space-y-4 mb-8">
                  {['Unlimited programs', 'Exercise library', 'Basic nutrition', 'PDF export'].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-[var(--color-gray-600)]">
                      <svg className="w-5 h-5 text-[var(--color-forest)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button onClick={handleGetStarted} className="w-full py-4 font-semibold border-2 border-[var(--color-forest)] text-[var(--color-forest)] rounded-full hover:bg-[var(--color-forest)] hover:text-white transition-all">
                  Get Started Free
                </button>
              </div>

              <div className="relative p-8 rounded-3xl bg-[var(--color-forest)] text-white overflow-hidden">
                <div className="absolute top-4 right-4 px-3 py-1 bg-[var(--color-gold)] text-[var(--color-forest)] text-xs font-bold rounded-full">
                  BEST VALUE
                </div>
                <p className="text-sm font-semibold text-white/60 uppercase mb-2">Pro</p>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-bold">$10</span>
                  <span className="text-white/60">/month</span>
                </div>
                <p className="text-sm text-[var(--color-gold)] mb-6"><span className="line-through text-white/40">$20</span> 50% off!</p>
                <ul className="space-y-4 mb-8">
                  {['Everything in Free', 'Workout tracking', 'Weekly check-ins', 'Auto-adjusting programs', 'Progress photos', 'Priority support'].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/80">
                      <svg className="w-5 h-5 text-[var(--color-gold)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button onClick={handleGetStarted} className="w-full py-4 font-bold bg-[var(--color-gold)] text-[var(--color-forest)] rounded-full hover:bg-[var(--color-gold-dark)] transition-all">
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 lg:py-32 px-6 lg:px-8 bg-[var(--color-gold-light)]">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-5xl mb-6 block">🚀</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-forest)] mb-6">Ready for a fresh start?</h2>
            <p className="text-lg text-[var(--color-forest-light)] mb-10">Join hundreds who stopped waiting and started moving. Your personalized program is 2 minutes away.</p>
            <button onClick={handleGetStarted} className="px-10 py-5 text-lg font-bold text-[var(--color-forest)] bg-white rounded-full hover:bg-[var(--color-off-white)] shadow-lg transition-all">
              Create Your Free Program
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 lg:px-8 bg-[var(--color-forest)] text-white/60">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[var(--color-gold)] rounded-full flex items-center justify-center">
                <span className="text-[var(--color-forest)] text-xs font-bold">b</span>
              </div>
              <span className="font-semibold text-white">baisics</span>
            </div>
            <p className="text-sm">&copy; {new Date().getFullYear()} baisics. Made with <span className="text-[var(--color-gold)]">&hearts;</span> in Indy.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
