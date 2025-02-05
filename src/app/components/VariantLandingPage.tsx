'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import BetaModal from '../components/BetaModal'
import { useRouter } from 'next/navigation'
import ConversationalIntakeContainer, { ConversationalIntakeRef } from '../hi/components/ConversationalIntakeContainer'
import GoalCTAs from './GoalCTAs'
import Header from '@/components/Header'

// Rotating headlines
const ROTATING_HEADLINES = [
  'Your Perfect Workout',
  'Your Dream Body',
  'Your Goal Weight',
  'Your Fitness Journey',
  'Your Best Self',
  'Your Nutrition Plan',
  'Your Gym Buddy',
  'Your Goal Weight',
  'Your Fitness Journey',
  'Your Best Self',
  'Your Custom Program',
]

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
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentHeadlineIndex, setCurrentHeadlineIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState<'enter' | 'exit'>('enter')
  const chatRef = useRef<ConversationalIntakeRef>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      // Start exit animation
      setDirection('exit')
      setIsAnimating(true)

      // After exit animation, change text and start enter animation
      setTimeout(() => {
        setCurrentHeadlineIndex((prev) => (prev + 1) % ROTATING_HEADLINES.length)
        setDirection('enter')
        // Small delay to ensure the new text is ready
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsAnimating(false)
          })
        })
      }, 200) // Match this with the CSS transition duration
    }, 3000) // Change headline every 3 seconds

    return () => clearInterval(interval)
  }, [])

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault()
    // Track the conversion
    trackGetStartedClick();

    if (process.env.NEXT_PUBLIC_WE_LIVE === 'true') {
      router.push('/hi')
    } else {
      // Open the modal
      setIsModalOpen(true)
    }
  }

  const handleGoalSelect = (message: string) => {
    chatRef.current?.prefillAndSubmit(message);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <BetaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* Use the Header component */}
      <Header />
      
      {/* Add padding to account for fixed header */}
      <div className="pt-16">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="relative flex flex-col lg:flex-row items-start justify-between py-12 lg:py-20 gap-8 lg:gap-12">
            {/* Left Column - Text Content */}
            <div className="flex-1 space-y-8 lg:sticky lg:top-24">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide uppercase">AI POWERED FITNESS</span>
                  <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs px-2 py-0.5 rounded-full">MAKE 2025 YOUR YEAR</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white space-y-2">
                  <div className="relative h-[1.2em] overflow-hidden">
                    <span 
                      className={`absolute w-full transition-all duration-200 ease-in-out lg:text-5xl sm:text-4xl text-3xl
                        ${direction === 'enter' 
                          ? (isAnimating ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100') 
                          : (isAnimating ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100')
                        }`}
                    >
                      {ROTATING_HEADLINES[currentHeadlineIndex]}
                    </span>
                  </div>
                  <span className="block">in Just <span className="text-indigo-600 dark:text-indigo-400">2 Minutes</span></span>
                </h1>

                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
                  <span className="underline underline-offset-4">No credit card required.</span> Just chat with our AI trainer and get a personalized program built just for you!
                </p>

                {/* Add Testimonial Scroller */}
                {/* <div className="border-l-4 border-indigo-100 dark:border-indigo-900 pl-4">
                  <TestimonialScroller compact />
                </div> */}

                {/* Add Goal CTAs */}
                <div className="mt-8">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    Choose your goal to get started:
                  </p>
                  <GoalCTAs onGoalSelect={handleGoalSelect} />
                </div>
              </div>

              {/* Social Proof */}
              <div className="flex flex-col space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Thousands of custom programs created</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Exercise library with hundreds of variations</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Growing library of curated workout programs</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Body comp assessment and tracking</span>
                </div>
              </div>
            </div>

            {/* Right Column - Conversational Interface */}
            <div className="flex-1 w-full lg:w-auto min-h-[700px] relative">
              <div className="sticky top-24">
                <div className="relative">
                  {/* Background gradient effects */}
                  <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-100 via-purple-100 to-indigo-100 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 rounded-2xl rotate-1 scale-105 opacity-70"></div>
                  <div className="absolute -inset-4 bg-gradient-to-bl from-indigo-100 via-purple-100 to-indigo-100 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 rounded-2xl -rotate-1 scale-105 opacity-50"></div>
                  
                  {/* Conversational Interface */}
                  <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 conversational-interface h-max-[800px] overflow-hidden">
                    <div className="h-full">
                      <ConversationalIntakeContainer 
                        ref={chatRef}
                        preventNavigation={true}
                      />
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full opacity-50"></div>
                  <div className="absolute -left-8 -top-8 w-32 h-32 bg-purple-50 dark:bg-purple-900/20 rounded-full opacity-50"></div>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-200 my-12 lg:my-20"/>
        <a id="features"></a>
          
          {/* Value Props Section */}
          <div className="py-12 lg:py-20 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/30 dark:via-indigo-900/20 to-transparent"></div>
            <div className="relative max-w-7xl mx-auto">
              <div className="text-center mb-8 lg:mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900 dark:text-white">Why baisics?</h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Because getting healthy & fit shouldn&apos;t be complicated
                </p>
              </div>

              {/* Value Props Grid */}
              <div className="grid md:grid-cols-3 gap-4 lg:gap-8">
                {/* Quick Card */}
                <div className="group relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-lg opacity-0 blur-xl transition duration-500 group-hover:opacity-30"></div>
                  <div className="relative space-y-4 p-6 rounded-lg border border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-800/80 transition duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl">
                    <div className="absolute -top-3 -left-3 w-12 h-12 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 ring-4 ring-white dark:ring-gray-900">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <div className="ml-4">
                      <div className="h-0.5 w-12 bg-indigo-600/30 dark:bg-indigo-400/30 mb-4"></div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Quick</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Whether you&apos;re looking to trim some fat or build some muscle, you can have your own personalized training program in less than 2 minutes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Easy Card */}
                <div className="group relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-lg opacity-0 blur-xl transition duration-500 group-hover:opacity-30"></div>
                  <div className="relative space-y-4 p-6 rounded-lg border border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-800/80 transition duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl">
                    <div className="absolute -top-3 -left-3 w-12 h-12 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 ring-4 ring-white dark:ring-gray-900">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div className="ml-4">
                      <div className="h-0.5 w-12 bg-indigo-600/30 dark:bg-indigo-400/30 mb-4"></div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Easy</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Just chat with our AI trainer to figure out what works for you. New to fitness and need to take it slow? Have a new injury and need to take it easy? Whatever you need, we&apos;ve got you covered.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Affordable Card */}
                <div className="group relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-lg opacity-0 blur-xl transition duration-500 group-hover:opacity-30"></div>
                  <div className="relative space-y-4 p-6 rounded-lg border border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-800/80 transition duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl">
                    <div className="absolute -top-3 -left-3 w-12 h-12 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 ring-4 ring-white dark:ring-gray-900">
                      <span className="text-2xl">💰</span>
                    </div>
                    <div className="ml-4">
                      <div className="h-0.5 w-12 bg-indigo-600/30 dark:bg-indigo-400/30 mb-4"></div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Affordable</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        It&apos;s completely free to make a customized program. Seriously. But if you want weekly check-ins, updated nutrition plans, further customization, meal plans, goal tracking, and the rest then it&apos;s still wildly affordable.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Built for You Section */}
          <div className="relative py-16 lg:py-32 w-full overflow-hidden border-t border-b border-gray-100 dark:border-gray-800">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/30 via-transparent to-indigo-50/30 dark:from-indigo-900/20 dark:via-transparent dark:to-indigo-900/20"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                {/* Left Content */}
                <div className="flex-1 space-y-8">
                  <div className="space-y-2">
                    <div className="h-0.5 w-12 bg-indigo-600/30 dark:bg-indigo-400/30 mb-4"></div>
                    <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase">Built for <span className="underline underline-offset-4">you</span></p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                      Training and nutrition<br />
                      as unique as you
                    </h2>
                  </div>

                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    There&apos;s only one you in this world, and now you can get a training program to match. A quick conversation with our AI will have a personalized workout and nutrition plan tailored to your needs, focused on your goals.
                  </p>

                  <div className="space-y-3 lg:space-y-4">
                    <div className="space-y-2 lg:space-y-4">
                      <p className="text-lg text-gray-600 dark:text-gray-300">You&apos;ll have access to:</p>
                      <ul className="space-y-2 lg:space-y-4">
                        <li className="flex items-start gap-3">
                          <span className="text-indigo-600 dark:text-indigo-400">✓</span>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">Hundreds of exercises</p>
                            <p className="text-gray-600 dark:text-gray-300">Complete with education around form and targeted muscle groups</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-indigo-600 dark:text-indigo-400">✓</span>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">Unlimited customization</p>
                            <p className="text-gray-600 dark:text-gray-300">Based on your dietary needs, physical abilities, and goals</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-indigo-600 dark:text-indigo-400">✓</span>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">World-class AI models</p>
                            <p className="text-gray-600 dark:text-gray-300">Helping do the work of planning so you can do the work of building your best life</p>
                          </div>
                        </li>
                      </ul>
                    </div>

                    <Link 
                      href="#"
                      onClick={handleGetStarted}
                      className="inline-block px-8 py-3 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                    >
                      Start for free
                    </Link>
                  </div>
                </div>

                {/* Right Illustration */}
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-indigo-50/50 dark:bg-indigo-900/30 rounded-lg rotate-2"></div>
                    <picture>
                      <source
                        type="image/webp"
                        srcSet="/lp/ai-helper-opt.webp"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px"
                      />
                      <Image
                        src="/lp/ai-helper.jpg"
                        alt="Fitness data visualization and workout planning illustration"
                        width={500}
                        height={500}
                        className="relative w-full rounded-lg"
                        quality={75}
                        loading="eager"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px"
                      />
                    </picture>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Work Smarter Section */}
          <div className="relative py-16 lg:py-32 w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/30 dark:via-indigo-900/20 to-transparent"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1),transparent_70%)]"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-12">
                {/* Left Content */}
                <div className="flex-1 space-y-8">
                  <div className="space-y-2">
                    <div className="h-0.5 w-12 bg-indigo-600/30 dark:bg-indigo-400/30 mb-4"></div>
                    <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase">Work <span className="underline underline-offset-4">Smarter</span>, Not Harder</p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                      Guess what? No more guesswork!
                    </h2>
                  </div>

                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Put your health and wellness on easy mode with <span className="text-indigo-600 dark:text-indigo-400 font-bold">baisics</span> by focusing on doing the work in the gym and the kitchen, not online scouring the web for workouts or sorting through the BS from influencers who are just trying to get more likes.
                  </p>

                  <Link 
                    href="#"
                    onClick={handleGetStarted}
                    className="inline-block px-8 py-4 text-lg rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
                  >
                    Try it free
                  </Link>
                </div>

                {/* Right Image */}
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-white/50 dark:bg-gray-800/50 rounded-xl rotate-2 backdrop-blur-sm"></div>
                    <picture>
                      <source
                        type="image/webp"
                        srcSet="/lp/clarity-opt.webp"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px"
                      />
                      <Image
                        src="/lp/clarity.webp"
                        alt="Dynamic fitness collage showing workout and nutrition tracking"
                        width={500}
                        height={500}
                        className="relative w-full rounded-lg shadow-lg"
                        quality={75}
                        loading="lazy"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px"
                      />
                    </picture>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cut the Shit Section */}
          <div className="relative py-16 lg:py-32 w-full overflow-hidden bg-gradient-to-b from-transparent via-indigo-50/30 dark:via-indigo-900/20 to-transparent">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1),transparent_70%)]"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                {/* Left Content */}
                <div className="flex-1 space-y-8">
                  <div className="space-y-2">
                    <div className="h-0.5 w-12 bg-indigo-600/30 dark:bg-indigo-400/30 mb-4"></div>
                    <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase">All you need, <span className="underline underline-offset-4">all in one</span></p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                      Cut the shit, just get fit
                    </h2>
                  </div>

                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Great trainers can cost you $100-400 a month. A nutritionist will set you back another $100-200 per visit. Hunting down the best information online takes dozens if not hundreds of hours. We&apos;ll do the work there so you can do the work that matters.
                  </p>

                  <div className="space-y-3 lg:space-y-4">
                    <div className="space-y-2 lg:space-y-4">
                      <p className="text-gray-600 dark:text-gray-300 text-lg">For just <span className="text-red-500 dark:text-red-400 font-bold text-xl line-through decoration-2">$20/m</span> <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 text-transparent bg-clip-text drop-shadow-sm">$10/m</span> you can</p>
                      <ul className="space-y-2 lg:space-y-4">
                        <li className="flex items-start gap-3">
                          <span className="text-indigo-600 dark:text-indigo-400">✓</span>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">Track every workout</p>
                            <p className="text-gray-600 dark:text-gray-300">Easy to use, easy to track, and easy to see how much progress you&apos;re making</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-indigo-600 dark:text-indigo-400">✓</span>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">Get meal plans</p>
                            <p className="text-gray-600 dark:text-gray-300">To best help you succeed with your dietary needs, preferences, and goals</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-indigo-600 dark:text-indigo-400">✓</span>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">Adjust nutrition and workouts automagically</p>
                            <p className="text-gray-600 dark:text-gray-300">Based on your weekly progress check-ins and goals. You&apos;ll be changing, why shouldn&apos;t your program?</p>
                          </div>
                        </li>
                      </ul>
                    </div>

                    <Link 
                      href="#"
                      onClick={handleGetStarted}
                      className="inline-block px-8 py-4 text-lg rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
                    >
                      Zero risk to start
                    </Link>
                  </div>
                </div>

                {/* Right Image */}
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-white/50 dark:bg-gray-800/50 rounded-xl rotate-2 backdrop-blur-sm"></div>
                    <picture>
                      <source
                        type="image/webp"
                        srcSet="/lp/all-in-one-opt.webp"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px"
                      />
                      <Image
                        src="/lp/all-in-one.webp"
                        alt="Futuristic AI-powered fitness technology visualization"
                        width={500}
                        height={500}
                        className="relative w-full rounded-lg shadow-lg"
                        quality={75}
                        loading="lazy"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px"
                      />
                    </picture>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <main className="w-full">
          {/* Zero Risk Section */}
          <section className="w-full bg-indigo-50/30 dark:bg-indigo-900/20 border-t border-b border-gray-200 dark:border-gray-800">
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
                  <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-indigo-500/20 rounded-lg border border-indigo-200 dark:border-indigo-700 p-4 mb-4">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
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
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Cancel anytime. No questions asked.<br/>Need financial assistance? <a href="mailto:john@baisics.app" className="text-indigo-600 dark:text-indigo-400">Just ask.</a>
              </p>
            </div>
          </div>
        </main>

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
      {/* <TawkChat /> */}
    </div>
  )
} 