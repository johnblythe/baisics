'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { sendGTMEvent } from '@next/third-parties/google';

// VERSION 3: Anti-Marketing Honest
// Same design system (white/navy/coral) but with personality
// Show real stuff, no BS, direct copy

const PERSONAS = [
  {
    id: 'comeback',
    archetype: 'The Comeback Kid',
    name: 'Sarah',
    age: 34,
    tagline: "Haven't worked out in 3 years. Ready to feel strong again.",
    details: ['Gym at work, 45 min lunch breaks', '4 days/week available', 'Wants strength, not just cardio'],
    program: {
      name: '12-Week Strength Restart',
      phases: 3,
      days: 4,
      focus: 'Full body strength + habit building',
      sample: [
        { day: 'Monday', type: 'Upper', exercises: ['Bench Press 3×8', 'Dumbbell Rows 3×10', 'Shoulder Press 3×10', 'Bicep Curls 2×12'] },
        { day: 'Tuesday', type: 'Lower', exercises: ['Goblet Squats 3×10', 'Romanian Deadlift 3×8', 'Leg Press 3×12', 'Calf Raises 3×15'] },
        { day: 'Thursday', type: 'Upper', exercises: ['Incline DB Press 3×10', 'Lat Pulldown 3×10', 'Face Pulls 3×15', 'Tricep Pushdown 3×12'] },
        { day: 'Saturday', type: 'Lower', exercises: ['Barbell Squats 3×8', 'Hip Thrusts 3×10', 'Lunges 3×10 each', 'Leg Curls 3×12'] },
      ],
      macros: { calories: 1850, protein: 130, carbs: 185, fat: 62 },
    },
  },
  {
    id: 'intermediate',
    archetype: 'The Stuck Intermediate',
    name: 'Marcus',
    age: 28,
    tagline: "2 years of fuckarounditis. Time for a real program.",
    details: ['Home garage gym (barbell, rack, dumbbells)', '5 days available', 'Wants to actually get strong'],
    program: {
      name: '16-Week Strength Builder',
      phases: 4,
      days: 5,
      focus: 'Progressive overload + periodization',
      sample: [
        { day: 'Monday', type: 'Push', exercises: ['Bench Press 4×5', 'OHP 4×6', 'Incline DB 3×10', 'Lateral Raises 3×15'] },
        { day: 'Tuesday', type: 'Pull', exercises: ['Deadlift 3×5', 'Barbell Rows 4×6', 'Pull-ups 3×8', 'Face Pulls 4×15'] },
        { day: 'Wednesday', type: 'Legs', exercises: ['Back Squat 4×5', 'Front Squat 3×8', 'RDL 3×10', 'Leg Curls 3×12'] },
        { day: 'Friday', type: 'Upper', exercises: ['Close Grip Bench 4×6', 'Weighted Chins 4×6', 'DB Press 3×10', 'Curls 3×12'] },
        { day: 'Saturday', type: 'Lower', exercises: ['Pause Squats 3×6', 'Hip Thrusts 4×8', 'Lunges 3×10', 'Calf Raises 4×15'] },
      ],
      macros: { calories: 2800, protein: 180, carbs: 310, fat: 85 },
    },
  },
  {
    id: 'parent',
    archetype: 'The Time-Crunched Parent',
    name: 'Elena',
    age: 42,
    tagline: "30 minutes, 3 days. Just needs something that works.",
    details: ['Planet Fitness near work', '30 min max per session', 'Sanity > aesthetics'],
    program: {
      name: '8-Week Efficient Full Body',
      phases: 2,
      days: 3,
      focus: 'Max results, minimum time',
      sample: [
        { day: 'Monday', type: 'Full A', exercises: ['Goblet Squat 3×10', 'DB Bench 3×10', 'Cable Row 3×12', 'Plank 3×30s'] },
        { day: 'Wednesday', type: 'Full B', exercises: ['Leg Press 3×12', 'Shoulder Press 3×10', 'Lat Pulldown 3×12', 'Lunges 2×10'] },
        { day: 'Friday', type: 'Full C', exercises: ['RDL 3×10', 'Push-ups 3×max', 'DB Rows 3×10', 'Glute Bridge 3×15'] },
      ],
      macros: { calories: 1650, protein: 120, carbs: 165, fat: 55 },
    },
  },
];

const PRICING_TIERS = [
  {
    name: 'Starter',
    price: 0,
    period: 'forever',
    description: 'Everything you need to start',
    features: [
      'Custom workout program',
      'Nutrition & macro targets',
      'Exercise library access',
      'PDF export',
      '1 active program',
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Fit',
    price: 10,
    period: 'month',
    description: 'For people who want to track progress',
    features: [
      'Everything in Starter',
      'Workout logging',
      'Weekly check-ins',
      'Program auto-adjusts',
      'Progress charts',
      'Unlimited programs',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Jacked',
    price: 20,
    period: 'month',
    description: 'The full experience',
    features: [
      'Everything in Fit',
      'AI meal prep plans',
      'Progress photo analysis',
      'Exercise swap suggestions',
      'Priority generation',
      'Early access to new features',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
];

const TOOLS = [
  { name: 'TDEE Calculator', href: '/tools/tdee', desc: 'Find your daily calories' },
  { name: '1RM Calculator', href: '/tools/one-rep-max', desc: 'Calculate your max' },
  { name: 'Macro Calculator', href: '/tools/macros', desc: 'Get your macro split' },
  { name: 'Body Fat Estimator', href: '/tools/body-fat', desc: 'Estimate body composition' },
];

export default function LandingPageV3() {
  const router = useRouter();
  const { data: session } = useSession();
  const [expandedPersona, setExpandedPersona] = useState<string | null>(null);
  const [showFullProgram, setShowFullProgram] = useState<string | null>(null);

  const handleGetStarted = (personaId?: string) => {
    sendGTMEvent({ event: 'button clicked', value: `getStarted_v3${personaId ? `_${personaId}` : ''}` });
    if (personaId) {
      router.push(`/hi?persona=${personaId}`);
    } else {
      router.push('/hi');
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');

        .landing-v3 {
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

        .program-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .program-card:hover {
          transform: translateY(-4px);
        }

        .exercise-list {
          font-family: 'Space Mono', monospace;
          font-size: 0.8rem;
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

      <div className="landing-v3 min-h-screen">
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
                <Link href="#examples" className="text-sm font-medium text-[var(--color-gray-500)] hover:text-[var(--color-navy)] transition-colors">Examples</Link>
                <Link href="#pricing" className="text-sm font-medium text-[var(--color-gray-500)] hover:text-[var(--color-navy)] transition-colors">Pricing</Link>
                <Link href="/tools/tdee" className="text-sm font-medium text-[var(--color-gray-500)] hover:text-[var(--color-navy)] transition-colors">Free Tools</Link>
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
                      onClick={() => handleGetStarted()}
                      className="px-5 py-2 text-sm font-semibold text-white bg-[var(--color-navy)] rounded-lg hover:bg-[var(--color-navy-light)] transition-all"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Hero - Honest, Direct */}
        <section className="pt-32 pb-24 px-6 relative overflow-hidden bg-gradient-to-b from-white via-[var(--color-gray-50)] to-white">
          {/* Decorative geometric shapes - actually visible */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--color-coral)]/25 rounded-full blur-md"></div>
          <div className="absolute top-10 right-0 w-[32rem] h-[32rem] bg-[var(--color-navy)]/20 rounded-full blur-md"></div>
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-[var(--color-coral)]/20 rounded-full blur-md"></div>
          
          <div className="max-w-3xl mx-auto text-center relative z-10">
            {/* Content container with subtle depth */}
            <div className="relative">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-[var(--color-navy)] animate-in stagger-1 drop-shadow-sm">
                We make workout programs that{' '}
                <span className="bg-gradient-to-r from-[var(--color-coral)] to-[var(--color-coral-dark)] bg-clip-text text-transparent drop-shadow-sm">
                  actually work.
                </span>
              </h1>
              {/* Visual accent line - solid and prominent */}
              <div className="mt-8 flex items-center justify-center gap-2 animate-in stagger-2">
                <div className="w-12 h-0.5 bg-[var(--color-gray-300)]"></div>
                <div className="w-16 h-1 bg-[var(--color-coral)] rounded-full"></div>
                <div className="w-12 h-0.5 bg-[var(--color-gray-300)]"></div>
              </div>
            </div>
            
            <div className="mt-10 space-y-4">
              <p className="text-xl sm:text-2xl text-[var(--color-gray-700)] leading-relaxed font-semibold animate-in stagger-2">
                Tell us where you&apos;re at. Tell us where you want to go. We&apos;ll build a custom program to get you there.
              </p>
              <p className="text-lg sm:text-xl text-[var(--color-gray-600)] leading-relaxed font-medium animate-in stagger-2">
                No fitspos. No templates. No BS. Just a program built for you.
              </p>
            </div>
            
            <div className="mt-14 flex flex-col sm:flex-row gap-5 justify-center items-center animate-in stagger-3">
              <button
                onClick={() => handleGetStarted()}
                className="px-12 py-5 text-lg font-bold text-white bg-[var(--color-coral)] rounded-xl hover:bg-[var(--color-coral-dark)] transition-all shadow-xl shadow-[var(--color-coral)]/40 hover:shadow-2xl hover:shadow-[var(--color-coral)]/50 transform hover:-translate-y-1 hover:scale-105"
              >
                Build My Program
              </button>
              <Link
                href="#examples"
                className="px-12 py-5 text-lg font-semibold text-[var(--color-navy)] bg-white border-2 border-[var(--color-gray-400)] rounded-xl hover:border-[var(--color-navy)] hover:bg-[var(--color-gray-50)] hover:shadow-lg transition-all text-center transform hover:-translate-y-0.5"
              >
                See Examples
              </Link>
            </div>
          </div>
        </section>

        {/* 3 Personas - Real Examples */}
        <section id="examples" className="py-20 px-6 bg-[var(--color-gray-50)]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold">Real programs for real people</h2>
              <p className="mt-3 text-lg text-[var(--color-gray-500)]">Here&apos;s what we built for three different situations. Click to see the details.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {PERSONAS.map((persona) => (
                <div
                  key={persona.id}
                  className="program-card bg-white rounded-2xl border border-[var(--color-gray-200)] overflow-hidden cursor-pointer"
                  onClick={() => setExpandedPersona(expandedPersona === persona.id ? null : persona.id)}
                >
                  {/* Persona Header */}
                  <div className="p-6 border-b border-[var(--color-gray-100)]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs text-[var(--color-coral)] uppercase tracking-wider">{persona.archetype}</span>
                      <span className="text-sm text-[var(--color-gray-400)]">{persona.name}, {persona.age}</span>
                    </div>
                    <p className="text-lg font-semibold text-[var(--color-navy)] leading-snug">&ldquo;{persona.tagline}&rdquo;</p>
                    <ul className="mt-4 space-y-1">
                      {persona.details.map((detail, i) => (
                        <li key={i} className="text-sm text-[var(--color-gray-500)] flex items-center gap-2">
                          <span className="w-1 h-1 bg-[var(--color-gray-400)] rounded-full"></span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Program Preview */}
                  <div className="p-6 bg-[var(--color-gray-50)]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-[var(--color-navy)]">{persona.program.name}</h3>
                      <span className="font-mono text-xs text-[var(--color-gray-400)]">{persona.program.days}x/week</span>
                    </div>

                    {/* Week Overview */}
                    <div className="flex gap-1 mb-4">
                      {persona.program.sample.map((day, i) => (
                        <div
                          key={i}
                          className="flex-1 py-2 px-1 bg-white rounded text-center border border-[var(--color-gray-200)]"
                        >
                          <p className="text-[10px] font-mono text-[var(--color-gray-400)] uppercase">{day.day.slice(0, 3)}</p>
                          <p className="text-xs font-semibold text-[var(--color-navy)]">{day.type}</p>
                        </div>
                      ))}
                    </div>

                    {/* Expanded Details */}
                    {expandedPersona === persona.id && (
                      <div className="space-y-4 animate-in">
                        {/* Sample Day */}
                        <div className="p-4 bg-white rounded-lg border border-[var(--color-gray-200)]">
                          <p className="text-xs font-mono text-[var(--color-gray-400)] uppercase mb-2">{persona.program.sample[0].day}: {persona.program.sample[0].type}</p>
                          <ul className="exercise-list space-y-1 text-[var(--color-gray-600)]">
                            {persona.program.sample[0].exercises.map((ex, i) => (
                              <li key={i}>• {ex}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Macros */}
                        <div className="flex gap-2">
                          {[
                            { label: 'Cal', value: persona.program.macros.calories },
                            { label: 'P', value: `${persona.program.macros.protein}g` },
                            { label: 'C', value: `${persona.program.macros.carbs}g` },
                            { label: 'F', value: `${persona.program.macros.fat}g` },
                          ].map((macro, i) => (
                            <div key={i} className="flex-1 py-2 px-2 bg-white rounded border border-[var(--color-gray-200)] text-center">
                              <p className="text-[10px] text-[var(--color-gray-400)]">{macro.label}</p>
                              <p className="text-sm font-bold text-[var(--color-navy)]">{macro.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* CTA */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGetStarted(persona.id);
                          }}
                          className="w-full py-3 text-sm font-bold text-white bg-[var(--color-coral)] rounded-lg hover:bg-[var(--color-coral-dark)] transition-all"
                        >
                          I want something like this
                        </button>
                      </div>
                    )}

                    {expandedPersona !== persona.id && (
                      <p className="text-xs text-[var(--color-coral)] font-medium text-center mt-2">Click to see full program →</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-[var(--color-gray-500)] mb-4">Not quite like any of these?</p>
              <button
                onClick={() => handleGetStarted()}
                className="px-8 py-4 text-base font-bold text-[var(--color-navy)] border-2 border-[var(--color-navy)] rounded-xl hover:bg-[var(--color-navy)] hover:text-white transition-all"
              >
                Tell us about you instead
              </button>
            </div>
          </div>
        </section>

        {/* Why Not Just... */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold">&ldquo;Why not just...&rdquo;</h2>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-[var(--color-gray-50)] rounded-xl border border-[var(--color-gray-200)]">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">📱</span>
                  <div>
                    <h3 className="font-bold text-[var(--color-navy)]">&ldquo;...follow fitness influencers?&rdquo;</h3>
                    <p className="text-[var(--color-gray-500)] mt-1">
                      Endless noise. Conflicting advice. Pressure to buy supplements. You&apos;ll spend more time scrolling than lifting.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[var(--color-gray-50)] rounded-xl border border-[var(--color-gray-200)]">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">🏋️</span>
                  <div>
                    <h3 className="font-bold text-[var(--color-navy)]">&ldquo;...hire a coach?&rdquo;</h3>
                    <p className="text-[var(--color-gray-500)] mt-1">
                      Good ones are hard to find (lots of fitspos pretending). They cost $200-500/month <em>minimum</em>. And many still give you cookie-cutter programs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[var(--color-gray-50)] rounded-xl border border-[var(--color-gray-200)]">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">📰</span>
                  <div>
                    <h3 className="font-bold text-[var(--color-navy)]">&ldquo;...find a free program online?&rdquo;</h3>
                    <p className="text-[var(--color-gray-500)] mt-1">
                      Men&apos;s Health, Cosmo, and the rest will give you the same generic 12-week plan they give everyone else. It wasn&apos;t built for you.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Mid-Hero: The Pitch */}
        <section className="py-20 bg-[var(--color-navy)]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Bold Statement */}
              <div>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1]">
                  Your program.<br />
                  <span className="text-[var(--color-coral)]">Your rules.</span>
                </h2>
                <p className="mt-6 text-xl text-[var(--color-gray-400)]">
                  Stop overthinking. Start training.
                </p>
              </div>

              {/* Right: Proof Points + CTA */}
              <div className="bg-[var(--color-navy-light)] rounded-2xl p-8 border border-[var(--color-gray-600)]">
                <ul className="space-y-4">
                  <li className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-coral)]/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[var(--color-coral)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-lg text-white font-medium">Your schedule, not ours</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-coral)]/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[var(--color-coral)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-lg text-white font-medium">Your equipment, not ideal</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-coral)]/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[var(--color-coral)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-lg text-white font-medium">Your goals, not trending</span>
                  </li>
                </ul>
                <button
                  onClick={() => handleGetStarted()}
                  className="mt-8 w-full py-4 text-lg font-bold text-white bg-[var(--color-coral)] rounded-xl hover:bg-[var(--color-coral-dark)] transition-all"
                >
                  Build Mine →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* What You Actually Get */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold">&ldquo;What do I actually get?&rdquo;</h2>
            </div>

            {/* Free Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="relative p-8 bg-white rounded-2xl border border-[var(--color-gray-200)] shadow-sm">
                <span className="absolute top-4 right-4 px-2 py-1 bg-[var(--color-green-light)] text-[var(--color-green)] text-xs font-bold rounded-full uppercase tracking-wide">Free</span>
                <div className="w-16 h-16 bg-[var(--color-coral-light)] rounded-2xl flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-[var(--color-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[var(--color-navy)] mb-3">A Real Program</h3>
                <p className="text-[var(--color-gray-500)]">Not a template. Phases, progression, deload weeks—structured for your specific goals and timeline.</p>
              </div>

              <div className="relative p-8 bg-white rounded-2xl border border-[var(--color-gray-200)] shadow-sm">
                <span className="absolute top-4 right-4 px-2 py-1 bg-[var(--color-green-light)] text-[var(--color-green)] text-xs font-bold rounded-full uppercase tracking-wide">Free</span>
                <div className="w-16 h-16 bg-[var(--color-coral-light)] rounded-2xl flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-[var(--color-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[var(--color-navy)] mb-3">Every Workout</h3>
                <p className="text-[var(--color-gray-500)]">Exercises, sets, reps, rest times. No guessing what to do when you walk into the gym.</p>
              </div>

              <div className="relative p-8 bg-white rounded-2xl border border-[var(--color-gray-200)] shadow-sm">
                <span className="absolute top-4 right-4 px-2 py-1 bg-[var(--color-green-light)] text-[var(--color-green)] text-xs font-bold rounded-full uppercase tracking-wide">Free</span>
                <div className="w-16 h-16 bg-[var(--color-coral-light)] rounded-2xl flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-[var(--color-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[var(--color-navy)] mb-3">Nutrition Targets</h3>
                <p className="text-[var(--color-gray-500)]">Calories and macros calculated for your goal. Gain muscle, lose fat, or maintain—we&apos;ll set the numbers.</p>
              </div>
            </div>

            {/* Premium Features */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="relative p-8 bg-white rounded-2xl border border-[var(--color-gray-200)] shadow-sm">
                <div className="w-16 h-16 bg-[var(--color-coral-light)] rounded-2xl flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-[var(--color-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[var(--color-navy)] mb-3">Progress Tracking</h3>
                <p className="text-[var(--color-gray-500)]">Log workouts, track weights, see your progress over time with charts and insights.</p>
              </div>

              <div className="relative p-8 bg-white rounded-2xl border border-[var(--color-gray-200)] shadow-sm">
                <div className="w-16 h-16 bg-[var(--color-coral-light)] rounded-2xl flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-[var(--color-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[var(--color-navy)] mb-3">AI Meal Prep</h3>
                <p className="text-[var(--color-gray-500)]">Weekly meal plans and grocery lists generated to hit your macro targets.</p>
              </div>

              <div className="relative p-8 bg-white rounded-2xl border border-[var(--color-gray-200)] shadow-sm">
                <div className="w-16 h-16 bg-[var(--color-coral-light)] rounded-2xl flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-[var(--color-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[var(--color-navy)] mb-3">Photo Analysis</h3>
                <p className="text-[var(--color-gray-500)]">Track visual progress with side-by-side comparisons and body composition estimates.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-6 bg-[var(--color-gray-50)]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-navy)]">Real People, Real Results</h2>
              <p className="mt-3 text-lg text-[var(--color-gray-500)]">No actors. No stock photos. Just people who stopped overthinking and started training.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  quote: "I was intimidated by the gym. Baisics gave me a plan that actually made sense for a complete beginner.",
                  name: "Alex M.",
                  result: "3 months in",
                },
                {
                  quote: "Down 22 lbs and actually enjoying my workouts. The AI-built program adapts as I get stronger.",
                  name: "Sarah K.",
                  result: "Lost 22 lbs",
                },
                {
                  quote: "As a busy parent, I needed something flexible. 30-minute home workouts that actually work.",
                  name: "Jordan T.",
                  result: "Stay-at-home dad",
                },
                {
                  quote: "Finally a fitness app that doesn't try to sell me supplements on every screen.",
                  name: "Chris R.",
                  result: "6 months in",
                },
                {
                  quote: "Hit my first pull-up at 62. Never thought I'd say that.",
                  name: "Robert L.",
                  result: "Age 62",
                },
              ].map((testimonial, i) => (
                <div
                  key={i}
                  className="p-6 bg-white rounded-2xl border border-[var(--color-gray-200)] shadow-sm flex flex-col"
                >
                  <div className="mb-4 text-[var(--color-coral)]">
                    <svg className="w-8 h-8 opacity-40" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>
                  <p className="text-[var(--color-navy)] font-medium leading-relaxed flex-1">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="mt-5 pt-4 border-t border-[var(--color-gray-100)] flex items-center justify-between">
                    <span className="font-semibold text-sm text-[var(--color-navy)]">{testimonial.name}</span>
                    <span className="font-mono text-xs text-[var(--color-coral)] uppercase tracking-wider">{testimonial.result}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 px-6 bg-[var(--color-navy)]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">Simple pricing</h2>
              <p className="mt-3 text-lg text-[var(--color-gray-400)]">Free is actually free. Forever. No tricks.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {PRICING_TIERS.map((tier) => (
                <div
                  key={tier.name}
                  className={`p-6 rounded-2xl ${
                    tier.highlighted
                      ? 'bg-white ring-2 ring-[var(--color-coral)]'
                      : 'bg-[var(--color-navy-light)] border border-[var(--color-gray-600)]'
                  }`}
                >
                  {tier.highlighted && (
                    <span className="inline-block px-3 py-1 bg-[var(--color-coral-light)] text-[var(--color-coral)] text-xs font-bold rounded-full mb-4">
                      MOST POPULAR
                    </span>
                  )}
                  <p className={`font-mono text-sm uppercase tracking-wider ${tier.highlighted ? 'text-[var(--color-gray-500)]' : 'text-[var(--color-gray-400)]'}`}>
                    {tier.name}
                  </p>
                  <p className={`text-4xl font-bold mt-2 ${tier.highlighted ? 'text-[var(--color-navy)]' : 'text-white'}`}>
                    {tier.price === 0 ? 'Free' : `$${tier.price}`}
                    {tier.price > 0 && <span className="text-lg font-normal text-[var(--color-gray-400)]">/{tier.period}</span>}
                  </p>
                  <p className={`text-sm mt-2 ${tier.highlighted ? 'text-[var(--color-gray-500)]' : 'text-[var(--color-gray-400)]'}`}>
                    {tier.description}
                  </p>

                  <ul className="mt-6 space-y-3">
                    {tier.features.map((feature, i) => (
                      <li key={i} className={`flex items-center gap-2 text-sm ${tier.highlighted ? 'text-[var(--color-gray-600)]' : 'text-[var(--color-gray-400)]'}`}>
                        <svg className="w-4 h-4 text-[var(--color-coral)] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleGetStarted()}
                    className={`w-full mt-6 py-3 font-semibold rounded-xl transition-all ${
                      tier.highlighted
                        ? 'bg-[var(--color-coral)] text-white hover:bg-[var(--color-coral-dark)]'
                        : 'bg-white text-[var(--color-navy)] hover:bg-[var(--color-gray-100)]'
                    }`}
                  >
                    {tier.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-navy)]">Still here?</h2>
            <p className="mt-4 text-lg text-[var(--color-gray-500)]">
              You could&apos;ve had your program by now!<br/>Just take the 2 minutes and see for yourself.
            </p>
            <button
              onClick={() => handleGetStarted()}
              className="mt-8 px-10 py-4 text-lg font-bold text-white bg-[var(--color-coral)] rounded-xl hover:bg-[var(--color-coral-dark)] transition-all shadow-lg shadow-[var(--color-coral)]/20"
            >
              Fine, I&apos;ll Try It
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 px-6 bg-[var(--color-gray-50)] border-t border-[var(--color-gray-200)]">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-12">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-[var(--color-coral)] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">B</span>
                  </div>
                  <span className="font-bold text-xl text-[var(--color-navy)]">baisics</span>
                </div>
                <p className="text-sm text-[var(--color-gray-500)]">
                  Workout programs that work.<br />
                  Made with <span className="text-[var(--color-coral)]">&hearts;</span> in Indy.
                </p>
              </div>

              {/* Free Tools */}
              <div>
                <h4 className="font-bold text-[var(--color-navy)] mb-4">Free Tools</h4>
                <ul className="space-y-2">
                  {TOOLS.map((tool) => (
                    <li key={tool.href}>
                      <Link href={tool.href} className="text-sm text-[var(--color-gray-500)] hover:text-[var(--color-navy)] transition-colors">
                        {tool.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="font-bold text-[var(--color-navy)] mb-4">Resources</h4>
                <ul className="space-y-2">
                  <li><Link href="/blog" className="text-sm text-[var(--color-gray-500)] hover:text-[var(--color-navy)] transition-colors">Blog</Link></li>
                  <li><Link href="/templates" className="text-sm text-[var(--color-gray-500)] hover:text-[var(--color-navy)] transition-colors">Program Templates</Link></li>
                  <li><Link href="/library" className="text-sm text-[var(--color-gray-500)] hover:text-[var(--color-navy)] transition-colors">Exercise Library</Link></li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="font-bold text-[var(--color-navy)] mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><Link href="/privacy" className="text-sm text-[var(--color-gray-500)] hover:text-[var(--color-navy)] transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-sm text-[var(--color-gray-500)] hover:text-[var(--color-navy)] transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-[var(--color-gray-200)] text-center">
              <p className="text-sm text-[var(--color-gray-400)]">&copy; {new Date().getFullYear()} baisics. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
