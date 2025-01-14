'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import BetaModal from './components/BetaModal'
import { signIn } from 'next-auth/react'

// Track when user opens the modal
const trackGetStartedClick = () => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'conversion', {
      'send_to': 'G-2X1L89GZHR/signup',
      'event_category': 'engagement',
      'event_label': 'get_started',
      'value': 1
    });
  } else {
    console.log('DEV MODE - Get Started click tracked');
  }
}

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault()
    // Track the conversion
    trackGetStartedClick()
    // Open the modal
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <BetaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-3">
              <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                baisics
              </Link>
              <span className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 border-l border-gray-200 dark:border-gray-700 pl-3">
                fitness for the rest of us
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Features</Link>
              <Link href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Pricing</Link>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4">
            <button
                  onClick={() => signIn()}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
                >
                  Log in
                </button>
              <Link 
                href="#"
                onClick={handleGetStarted}
                className="inline-block px-4 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Add padding to account for fixed header */}
      <div className="pt-16">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="relative flex flex-col lg:flex-row items-center justify-between py-12 lg:py-20 gap-8 lg:gap-12">
            {/* Background Texture */}
            <div className="absolute inset-0 -mx-4 sm:-mx-6 lg:-mx-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03),transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent_70%)]"></div>
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(99,102,241,0.01)_25%,transparent_25%,transparent_75%,rgba(99,102,241,0.01)_75%,rgba(99,102,241,0.01))] dark:bg-[linear-gradient(45deg,rgba(99,102,241,0.02)_25%,transparent_25%,transparent_75%,rgba(99,102,241,0.02)_75%,rgba(99,102,241,0.02))]" style={{ backgroundSize: '60px 60px' }}></div>
            </div>

            {/* Left Column - Text Content */}
            <div className="flex-1 space-y-8">
              <div className="space-y-2">
                <p className="text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide uppercase flex items-center gap-2">
                  AI Powered Fitness
                  <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs px-2 py-0.5 rounded-full">Make 2025 your year</span>
                </p>
                
                <h1 className="relative">
                  <span className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                    <span className="font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 text-transparent bg-clip-text drop-shadow-sm">YOUR</span>
                    <span className="text-gray-900 dark:text-white">sonal training</span>
                  </span>
                  <br />
                  <span className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
                    is finally here
                  </span>
                </h1>

                {/* Social Proof */}
                <div className="flex gap-6 mt-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span>Over 1,000 programs created</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span>Hundreds of exercises</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6 text-lg text-gray-600 dark:text-gray-300">
                <p>
                  👋 Say good-bye to cookie-cutter programs, high-cost trainers, and confusing-and-confused influencers.
                </p>
                <p>
                  💪 Customize the program you need to build the body you want.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="group relative inline-flex">
                    <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-70 blur transition duration-200 group-hover:opacity-100 animate-tilt"></div>
                    <Link 
                      href="#"
                      onClick={handleGetStarted}
                      className="relative inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
                    >
                      <span className="text-xl">Get Started</span>
                      <div className="flex flex-col text-xs opacity-90">
                        <span>⚡️ 2-minute setup</span>
                        <span>💳 No credit card needed</span>
                      </div>
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-sm text-grey-600 dark:text-gray-300">Limited time offer inside!</span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    Start <span className="font-bold">free</span> or unlock premium and <span className="text-green-600 dark:text-green-400 font-bold">save 50% today</span>
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right Column - Image */}
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-100 dark:from-indigo-900/20 via-purple-100 dark:via-purple-900/20 to-indigo-100 dark:to-indigo-900/20 rounded-2xl rotate-1 scale-105"></div>
                <div className="absolute -inset-4 bg-gradient-to-bl from-indigo-100 dark:from-indigo-900/20 via-purple-100 dark:via-purple-900/20 to-indigo-100 dark:to-indigo-900/20 rounded-2xl -rotate-1 scale-105 opacity-75"></div>
                
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-2xl opacity-20 dark:opacity-10 blur-xl group-hover:opacity-30 dark:group-hover:opacity-20 transition duration-500"></div>
                
                {/* Main image container */}
                <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-2xl">
                  <Image
                    src="/lp/gym-hero.png"
                    alt="Woman checking her fitness app while working out with dumbbells"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    quality={90}
                  />
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/20 via-transparent to-transparent"></div>
                </div>
                
                {/* Decorative dots */}
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full opacity-50"></div>
                <div className="absolute -left-8 -top-8 w-32 h-32 bg-purple-50 dark:bg-purple-900/20 rounded-full opacity-50"></div>
              </div>
            </div>
          </div>
        </main>

        <main className="w-full">
          {/* Zero Risk Section */}
          <section className="w-full bg-indigo-50/30 dark:bg-indigo-900/10 border-t border-b border-gray-200 dark:border-gray-800">
            <div className="relative py-16 lg:py-32 overflow-hidden">
              {/* Background Testimonials Grid */}
              <div className="absolute inset-0 w-full h-full">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className={`absolute w-full whitespace-nowrap ${i % 2 === 0 ? 'animate-scroll-left' : 'animate-scroll-right'}`} 
                       style={{top: `${i * 12.5}%`}}>
                    <div className="inline-block whitespace-nowrap text-indigo-900/20 dark:text-indigo-100/10">
                      <span className="inline-block mx-8 text-2xl">&ldquo;Life changing! Truly.&rdquo; — Addison W.</span>
                      <span className="inline-block mx-8 text-2xl">&ldquo;I&apos;ve tried lots of programs before, but this one actually delivered results.&rdquo; — Timothy R.</span>
                      <span className="inline-block mx-8 text-2xl">&ldquo;Too easy to not try it!&rdquo; — Lo B.</span>
                      <span className="inline-block mx-8 text-2xl">&ldquo;I can&apos;t overstate how easy this was to succeed with.&rdquo; — John B.</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Content */}
              <div className="relative">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col items-center bg-gradient-to-b from-white/90 to-white/40 dark:from-gray-900/90 dark:to-gray-900/40 rounded-lg p-8">
                    <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-12">
                      <span className="underline underline-offset-4 font-bold">Zero Risk</span>
                    </p>

                    <h2 className="text-6xl sm:text-7xl lg:text-[10rem] font-bold mb-12 md:mb-24 leading-[0.9]">
                      <span className="font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 text-transparent bg-clip-text drop-shadow-sm">No pain,</span><br />
                      <span className="font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 text-transparent bg-clip-text drop-shadow-sm">all gain</span>
                    </h2>

                    <p className="text-2xl sm:text-3xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
                      Rome wasn&apos;t built in a day, and your ideal body won&apos;t be either. But you <span className="font-bold">can</span> build a great plan in less than two minutes.
                    </p>

                    <p className="text-2xl sm:text-3xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
                      What are you waiting for? Jump in, chat, and get your free training & nutrition plan now!
                    </p>

                    <Link 
                      href="#"
                      onClick={handleGetStarted}
                      className="inline-block px-16 py-6 text-2xl rounded-full bg-indigo-600 dark:bg-indigo-500 text-white font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
                    >
                      Let&apos;s go!
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <a id="pricing"></a>
          {/* Pricing Section */}
          <div className="py-12 lg:py-20">
            <div className="text-center mb-8 lg:mb-16">
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase mb-4">Simple Pricing</p>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900 dark:text-white">Start your journey today</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Choose the plan that works best for you. No hidden fees, no contracts, just results. Cancel anytime. Or <span className="font-bold">use the forever free version</span> to make as many programs as you want. Here&apos;s to health!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-8 mx-auto md:max-w-5xl">
              {/* Core Monthly Plan */}
              <div className="relative space-y-6 p-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-indigo-600 dark:bg-indigo-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
                <div>
                  <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 dark:from-indigo-400/5 dark:via-purple-400/5 dark:to-indigo-400/5 rounded-lg border border-indigo-200 dark:border-indigo-800 p-4 mb-4">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400"></div>
                    <div className="flex items-center gap-3">
                      <span className="animate-pulse flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          🎉 New Year, New Me Special Offer
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          Less than 100 spots left at this price — Lock it in forever!
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Core Monthly Membership</p>
                  <div className="mt-4 flex flex-col">
                    <div className="flex items-baseline gap-2">
                      <div className="flex items-baseline">
                        <span className="text-5xl font-bold text-gray-900 dark:text-white">$10</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1">/month</span>
                      </div>
                      <span className="text-red-500 dark:text-red-400 font-bold text-xl line-through decoration-2">$20</span>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 px-2 py-1 rounded-full">
                        50% off!
                      </span>
                    </div>
                  </div>
                  <p className="mt-6 text-gray-600 dark:text-gray-300">
                    There&apos;s no better time than now to start your journey, and there&apos;s no better value than this. You&apos;ll get:
                  </p>
                </div>

                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <span className="text-indigo-600 dark:text-indigo-400">✓</span>
                    <span className="text-gray-900 dark:text-white">Unlimited program creation</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-indigo-600 dark:text-indigo-400">✓</span>
                    <span className="text-gray-900 dark:text-white">Unlimited customization</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-indigo-600 dark:text-indigo-400">✓</span>
                    <span className="text-gray-900 dark:text-white">Body composition assessment</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-indigo-600 dark:text-indigo-400">✓</span>
                    <span className="text-gray-900 dark:text-white">Nutrition goals</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-indigo-600 dark:text-indigo-400">✓</span>
                    <span className="text-gray-900 dark:text-white">Weekly check-ins</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-indigo-600 dark:text-indigo-400">✓</span>
                    <span className="text-gray-900 dark:text-white">Automatic program adjustments</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-indigo-600 dark:text-indigo-400">✓</span>
                    <span className="text-gray-900 dark:text-white">Amazing customer support</span>
                  </li>
                </ul>

                <Link 
                  href="#"
                  onClick={handleGetStarted}
                  className="block w-full text-center px-8 py-3 rounded-lg bg-gray-900 dark:bg-gray-700 text-white font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                >
                  Get started
                </Link>
              </div>

              {/* Lifetime Access Plan */}
              <div className="relative space-y-6 p-8 rounded-xl border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-green-600 dark:bg-green-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                    Best Value
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 uppercase">Lifetime Access</p>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">$99</span>
                  </div>
                  <p className="mt-4 text-gray-600 dark:text-gray-300">
                    You&apos;ve got that body for life, so make sure you take care of it just as long.
                  </p>
                </div>

                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <span className="text-indigo-600 dark:text-indigo-400">✓</span>
                    <span className="text-gray-900 dark:text-white">Everything from the <span className="font-bold">Core</span> plan</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-indigo-600 dark:text-indigo-400">✓</span>
                    <span className="text-gray-900 dark:text-white">And every future update and improvement—for life!</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-indigo-600 dark:text-indigo-400">✓</span>
                    <span className="text-gray-900 dark:text-white">Pay once, enjoy forever</span>
                  </li>
                </ul>

                <Link 
                  href="#"
                  onClick={handleGetStarted}
                  className="block w-full text-center px-8 py-3 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                >
                  Get started
                </Link>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center mt-12">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cancel anytime. No questions asked.<br/>Need financial assistance? <a href="mailto:baisics.app@gmail.com" className="text-indigo-600 dark:text-indigo-400">Just ask.</a>
                </p>
              </div>
          </div>
        </main>

        <a id="features"></a>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">baisics</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                 &copy; {new Date().getFullYear()} baisics. All rights reserved. ♥️ from Indianapolis.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
} 