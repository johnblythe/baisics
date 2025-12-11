'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { sendGTMEvent } from '@next/third-parties/google';
import BetaModal from '../components/BetaModal';

export default function LandingPageV2() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    sendGTMEvent({ event: 'button clicked', value: 'getStarted_v2' });

    if (process.env.NEXT_PUBLIC_WE_LIVE === 'true') {
      router.push('/hi');
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .landing-v2 {
          --color-cream: #FAF7F2;
          --color-warm-white: #FFFDF9;
          --color-charcoal: #2D2A26;
          --color-charcoal-light: #4A4640;
          --color-terracotta: #C4715B;
          --color-terracotta-dark: #A85D4A;
          --color-sage: #8B9A7D;
          --color-sand: #E8E2D9;

          font-family: 'Plus Jakarta Sans', sans-serif;
          background-color: var(--color-cream);
          color: var(--color-charcoal);
        }

        .font-display {
          font-family: 'DM Serif Display', serif;
        }

        .text-balance {
          text-wrap: balance;
        }

        .grain-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 0.03;
          z-index: 1000;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .float-animation {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
      `}</style>

      <div className="landing-v2 min-h-screen">
        <div className="grain-overlay" />
        <BetaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

        {/* Navigation */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-cream)]/90 backdrop-blur-md border-b border-[var(--color-sand)]">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              <Link href="/" className="flex items-center gap-3">
                <span className="font-display text-2xl lg:text-3xl text-[var(--color-charcoal)]">baisics</span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-8">
                <Link href="#how-it-works" className="text-sm font-medium text-[var(--color-charcoal-light)] hover:text-[var(--color-charcoal)] transition-colors">
                  How it Works
                </Link>
                <Link href="#pricing" className="text-sm font-medium text-[var(--color-charcoal-light)] hover:text-[var(--color-charcoal)] transition-colors">
                  Pricing
                </Link>
                <Link href="/blog" className="text-sm font-medium text-[var(--color-charcoal-light)] hover:text-[var(--color-charcoal)] transition-colors">
                  Blog
                </Link>
              </nav>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleGetStarted}
                  className="hidden sm:block px-5 py-2.5 text-sm font-semibold text-[var(--color-warm-white)] bg-[var(--color-charcoal)] rounded-full hover:bg-[var(--color-charcoal-light)] transition-all duration-300 hover:scale-[1.02]"
                >
                  Start Free
                </button>

                {/* Mobile Menu */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2"
                  aria-label="Menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
              <div className="md:hidden pb-4 border-t border-[var(--color-sand)]">
                <nav className="flex flex-col gap-2 pt-4">
                  <Link href="#how-it-works" className="px-4 py-2 text-[var(--color-charcoal-light)]" onClick={() => setIsMenuOpen(false)}>
                    How it Works
                  </Link>
                  <Link href="#pricing" className="px-4 py-2 text-[var(--color-charcoal-light)]" onClick={() => setIsMenuOpen(false)}>
                    Pricing
                  </Link>
                  <Link href="/blog" className="px-4 py-2 text-[var(--color-charcoal-light)]" onClick={() => setIsMenuOpen(false)}>
                    Blog
                  </Link>
                  <button
                    onClick={handleGetStarted}
                    className="mx-4 mt-2 px-5 py-2.5 text-sm font-semibold text-[var(--color-warm-white)] bg-[var(--color-charcoal)] rounded-full"
                  >
                    Start Free
                  </button>
                </nav>
              </div>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className="pt-32 lg:pt-40 pb-16 lg:pb-24 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Content */}
              <div className="space-y-8 opacity-0 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-sand)] rounded-full">
                  <span className="w-2 h-2 bg-[var(--color-sage)] rounded-full"></span>
                  <span className="text-sm font-medium text-[var(--color-charcoal-light)]">AI-powered, human-focused</span>
                </div>

                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] text-balance">
                  Your fitness journey,{' '}
                  <span className="text-[var(--color-terracotta)]">simplified</span>
                </h1>

                <p className="text-lg lg:text-xl text-[var(--color-charcoal-light)] max-w-lg leading-relaxed">
                  Get a personalized training program in under 2 minutes. No confusing jargon, no expensive trainers, no one-size-fits-all plans.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={handleGetStarted}
                    className="group px-8 py-4 text-base font-semibold text-[var(--color-warm-white)] bg-[var(--color-terracotta)] rounded-full hover:bg-[var(--color-terracotta-dark)] transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-[var(--color-terracotta)]/20"
                  >
                    Create Your Program
                    <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">&rarr;</span>
                  </button>
                  <Link
                    href="#how-it-works"
                    className="px-8 py-4 text-base font-semibold text-[var(--color-charcoal)] border-2 border-[var(--color-sand)] rounded-full hover:border-[var(--color-charcoal)] hover:bg-[var(--color-sand)] transition-all duration-300 text-center"
                  >
                    See How It Works
                  </Link>
                </div>

                <div className="flex items-center gap-6 pt-4 text-sm text-[var(--color-charcoal-light)]">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[var(--color-sage)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Free to start</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[var(--color-sage)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>No credit card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[var(--color-sage)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>

              {/* Right Image */}
              <div className="relative opacity-0 animate-fade-in-up delay-200">
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-[var(--color-sand)]">
                  <picture>
                    <source type="image/webp" srcSet="/lp/gym-hero.webp" />
                    <Image
                      src="/lp/gym-hero.png"
                      alt="Person working out with confidence"
                      fill
                      className="object-cover"
                      priority
                    />
                  </picture>
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-charcoal)]/20 to-transparent" />
                </div>

                {/* Floating Card */}
                <div className="absolute -bottom-6 -left-6 lg:-left-12 p-5 bg-[var(--color-warm-white)] rounded-2xl shadow-xl border border-[var(--color-sand)] float-animation">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--color-sage)]/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-[var(--color-sage)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--color-charcoal)]">2 min setup</p>
                      <p className="text-sm text-[var(--color-charcoal-light)]">Chat & go</p>
                    </div>
                  </div>
                </div>

                {/* Floating Card 2 */}
                <div className="absolute -top-4 -right-4 lg:-right-8 p-4 bg-[var(--color-warm-white)] rounded-2xl shadow-xl border border-[var(--color-sand)] float-animation delay-300">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 bg-[var(--color-terracotta)] rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">A</div>
                      <div className="w-8 h-8 bg-[var(--color-sage)] rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">M</div>
                      <div className="w-8 h-8 bg-[var(--color-charcoal)] rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">+</div>
                    </div>
                    <span className="text-sm font-medium text-[var(--color-charcoal-light)]">100s of programs created</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Bar */}
        <section className="py-12 border-y border-[var(--color-sand)] bg-[var(--color-warm-white)]">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <p className="text-center text-sm font-medium text-[var(--color-charcoal-light)] mb-8">
              Trusted by people ready to take control of their fitness
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16 text-[var(--color-charcoal-light)]">
              <div className="text-center">
                <p className="font-display text-3xl lg:text-4xl text-[var(--color-charcoal)]">500+</p>
                <p className="text-sm mt-1">Programs Created</p>
              </div>
              <div className="w-px h-12 bg-[var(--color-sand)] hidden sm:block" />
              <div className="text-center">
                <p className="font-display text-3xl lg:text-4xl text-[var(--color-charcoal)]">100s</p>
                <p className="text-sm mt-1">Exercises</p>
              </div>
              <div className="w-px h-12 bg-[var(--color-sand)] hidden sm:block" />
              <div className="text-center">
                <p className="font-display text-3xl lg:text-4xl text-[var(--color-charcoal)]">2 min</p>
                <p className="text-sm mt-1">Average Setup</p>
              </div>
              <div className="w-px h-12 bg-[var(--color-sand)] hidden sm:block" />
              <div className="text-center">
                <p className="font-display text-3xl lg:text-4xl text-[var(--color-terracotta)]">Free</p>
                <p className="text-sm mt-1">To Start</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 lg:py-32 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 lg:mb-20">
              <p className="text-sm font-semibold text-[var(--color-terracotta)] uppercase tracking-wider mb-4">How It Works</p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-balance">
                Three steps to your<br />personalized program
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {/* Step 1 */}
              <div className="relative group">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-[var(--color-terracotta)]/10 rounded-full flex items-center justify-center font-display text-2xl text-[var(--color-terracotta)]">
                  1
                </div>
                <div className="pt-8 pl-4">
                  <div className="w-16 h-16 mb-6 bg-[var(--color-sand)] rounded-2xl flex items-center justify-center group-hover:bg-[var(--color-terracotta)]/10 transition-colors duration-300">
                    <svg className="w-8 h-8 text-[var(--color-charcoal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="font-display text-xl lg:text-2xl mb-3">Chat with us</h3>
                  <p className="text-[var(--color-charcoal-light)] leading-relaxed">
                    Tell us about your goals, schedule, and what equipment you have access to. It&apos;s like talking to a friend who happens to be a fitness expert.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative group">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-[var(--color-terracotta)]/10 rounded-full flex items-center justify-center font-display text-2xl text-[var(--color-terracotta)]">
                  2
                </div>
                <div className="pt-8 pl-4">
                  <div className="w-16 h-16 mb-6 bg-[var(--color-sand)] rounded-2xl flex items-center justify-center group-hover:bg-[var(--color-terracotta)]/10 transition-colors duration-300">
                    <svg className="w-8 h-8 text-[var(--color-charcoal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="font-display text-xl lg:text-2xl mb-3">Get your plan</h3>
                  <p className="text-[var(--color-charcoal-light)] leading-relaxed">
                    Our AI creates a workout program tailored specifically to you, complete with exercises, sets, reps, and nutrition guidance.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative group">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-[var(--color-terracotta)]/10 rounded-full flex items-center justify-center font-display text-2xl text-[var(--color-terracotta)]">
                  3
                </div>
                <div className="pt-8 pl-4">
                  <div className="w-16 h-16 mb-6 bg-[var(--color-sand)] rounded-2xl flex items-center justify-center group-hover:bg-[var(--color-terracotta)]/10 transition-colors duration-300">
                    <svg className="w-8 h-8 text-[var(--color-charcoal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="font-display text-xl lg:text-2xl mb-3">Track & grow</h3>
                  <p className="text-[var(--color-charcoal-light)] leading-relaxed">
                    Log your workouts, check in weekly, and watch your program evolve with you. We adjust as you progress.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-16">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 text-base font-semibold text-[var(--color-warm-white)] bg-[var(--color-charcoal)] rounded-full hover:bg-[var(--color-charcoal-light)] transition-all duration-300"
              >
                Start Your Journey
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 lg:py-32 px-6 lg:px-8 bg-[var(--color-charcoal)] text-[var(--color-warm-white)]">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-sm font-semibold text-[var(--color-terracotta)] uppercase tracking-wider mb-4">Built for You</p>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mb-6 text-balance">
                  Not another cookie-cutter program
                </h2>
                <p className="text-lg text-[var(--color-sand)] mb-8 leading-relaxed">
                  Generic programs don&apos;t work because you&apos;re not generic. We build around your life, not the other way around.
                </p>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 flex-shrink-0 bg-[var(--color-terracotta)]/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-[var(--color-terracotta)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Your schedule, your rules</h3>
                      <p className="text-[var(--color-sand)] text-sm">3 days a week? 6 days? 20 minutes or an hour? We work with what you&apos;ve got.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 flex-shrink-0 bg-[var(--color-terracotta)]/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-[var(--color-terracotta)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Any equipment (or none)</h3>
                      <p className="text-[var(--color-sand)] text-sm">Full gym, home dumbbells, or just your body. Every setup gets a great workout.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 flex-shrink-0 bg-[var(--color-terracotta)]/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-[var(--color-terracotta)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Adapts as you progress</h3>
                      <p className="text-[var(--color-sand)] text-sm">Weekly check-ins help us adjust your program so you keep seeing results.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-terracotta)]/20 to-transparent rounded-3xl" />
                <div className="relative aspect-square rounded-3xl overflow-hidden">
                  <picture>
                    <source type="image/webp" srcSet="/lp/ai-helper-opt.webp" />
                    <Image
                      src="/lp/ai-helper.jpg"
                      alt="AI fitness assistant visualization"
                      fill
                      className="object-cover"
                    />
                  </picture>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-20 lg:py-32 px-6 lg:px-8 bg-[var(--color-sand)]/30">
          <div className="max-w-4xl mx-auto text-center">
            <svg className="w-12 h-12 mx-auto mb-8 text-[var(--color-terracotta)]/30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <blockquote className="font-display text-2xl sm:text-3xl lg:text-4xl mb-8 text-[var(--color-charcoal)] leading-relaxed">
              I&apos;ve tried so many apps and programs. This is the first one that actually felt like it was made for me, not just another template.
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-[var(--color-terracotta)] rounded-full flex items-center justify-center text-white font-semibold">
                JB
              </div>
              <div className="text-left">
                <p className="font-semibold text-[var(--color-charcoal)]">John B.</p>
                <p className="text-sm text-[var(--color-charcoal-light)]">Lost 15 lbs in 3 months</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 lg:py-32 px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-[var(--color-terracotta)] uppercase tracking-wider mb-4">Simple Pricing</p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mb-4">
                Start free, upgrade when ready
              </h2>
              <p className="text-lg text-[var(--color-charcoal-light)] max-w-2xl mx-auto">
                Your first program is always free. No credit card, no commitment.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Free Plan */}
              <div className="p-8 lg:p-10 rounded-3xl border-2 border-[var(--color-sand)] bg-[var(--color-warm-white)]">
                <p className="text-sm font-semibold text-[var(--color-charcoal-light)] uppercase mb-2">Free Forever</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-display text-5xl text-[var(--color-charcoal)]">$0</span>
                </div>
                <p className="text-[var(--color-charcoal-light)] mb-8">Perfect for getting started</p>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[var(--color-sage)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[var(--color-charcoal)]">Unlimited program creation</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[var(--color-sage)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[var(--color-charcoal)]">Full exercise library</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[var(--color-sage)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[var(--color-charcoal)]">Basic nutrition guidance</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[var(--color-sage)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[var(--color-charcoal)]">PDF export</span>
                  </li>
                </ul>

                <button
                  onClick={handleGetStarted}
                  className="w-full py-4 text-base font-semibold text-[var(--color-charcoal)] border-2 border-[var(--color-charcoal)] rounded-full hover:bg-[var(--color-charcoal)] hover:text-[var(--color-warm-white)] transition-all duration-300"
                >
                  Get Started Free
                </button>
              </div>

              {/* Pro Plan */}
              <div className="relative p-8 lg:p-10 rounded-3xl bg-[var(--color-charcoal)] text-[var(--color-warm-white)]">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 text-xs font-semibold bg-[var(--color-terracotta)] text-white rounded-full">
                    Most Popular
                  </span>
                </div>

                <p className="text-sm font-semibold text-[var(--color-sand)] uppercase mb-2">Pro Monthly</p>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-display text-5xl">$10</span>
                  <span className="text-[var(--color-sand)]">/month</span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[var(--color-terracotta)] line-through">$20</span>
                  <span className="px-2 py-0.5 text-xs font-semibold bg-[var(--color-terracotta)]/20 text-[var(--color-terracotta)] rounded">50% OFF</span>
                </div>
                <p className="text-[var(--color-sand)] mb-8">Everything you need to succeed</p>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[var(--color-terracotta)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Everything in Free</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[var(--color-terracotta)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Workout tracking</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[var(--color-terracotta)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Weekly check-ins</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[var(--color-terracotta)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Auto-adjusting programs</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[var(--color-terracotta)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Progress photos & tracking</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[var(--color-terracotta)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Priority support</span>
                  </li>
                </ul>

                <button
                  onClick={handleGetStarted}
                  className="w-full py-4 text-base font-semibold bg-[var(--color-terracotta)] text-white rounded-full hover:bg-[var(--color-terracotta-dark)] transition-all duration-300"
                >
                  Start Free Trial
                </button>
              </div>
            </div>

            <p className="text-center text-sm text-[var(--color-charcoal-light)] mt-8">
              Cancel anytime. No questions asked. Need help? <a href="mailto:john@baisics.app" className="text-[var(--color-terracotta)] hover:underline">Just ask.</a>
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 lg:py-32 px-6 lg:px-8 bg-[var(--color-charcoal)]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[var(--color-warm-white)] mb-6">
              Ready to feel better<br />in your own skin?
            </h2>
            <p className="text-lg text-[var(--color-sand)] mb-10 max-w-2xl mx-auto">
              Join hundreds of people who stopped overthinking and started moving. Your personalized program is just a conversation away.
            </p>
            <button
              onClick={handleGetStarted}
              className="px-10 py-5 text-lg font-semibold text-[var(--color-charcoal)] bg-[var(--color-warm-white)] rounded-full hover:bg-[var(--color-sand)] transition-all duration-300 hover:scale-[1.02]"
            >
              Create Your Free Program
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 lg:px-8 border-t border-[var(--color-sand)] bg-[var(--color-cream)]">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="font-display text-2xl text-[var(--color-charcoal)]">baisics</span>
              <p className="text-sm text-[var(--color-charcoal-light)]">
                &copy; {new Date().getFullYear()} baisics. Made with care in Indianapolis.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
