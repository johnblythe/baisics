'use client'

import { useState, useEffect } from 'react'

export type Testimonial = {
  id: number
  text: string
  author: string
  location?: string
  achievement?: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    text: "I've tried lots of programs before, but this one actually delivered results.",
    author: "Timothy R.",
    location: "Chicago",
    achievement: "Lost 30lbs in 3 months"
  },
  {
    id: 2,
    text: "The personalization is incredible. It's like having a trainer who really knows me.",
    author: "Sarah M.",
    location: "Austin",
    achievement: "Gained 10lbs muscle"
  },
  {
    id: 3,
    text: "Finally, a program that fits my schedule and my goals!",
    author: "James L.",
    location: "NYC",
    achievement: "Improved strength by 60%"
  },
  {
    id: 4,
    text: "The AI trainer keeps me accountable and adjusts my program when needed.",
    author: "Michelle K.",
    location: "Seattle",
    achievement: "Reached goal weight"
  }
]

interface TestimonialScrollerProps {
  compact?: boolean
  autoScroll?: boolean
  interval?: number
}

export default function TestimonialScroller({ 
  compact = false, 
  autoScroll = true, 
  interval = 4000 
}: TestimonialScrollerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (!autoScroll) return

    const scrollInterval = setInterval(() => {
      setIsAnimating(true)
      
      // Wait for fade out
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length)
        // Quick RAF chain to ensure smooth transition
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsAnimating(false)
          })
        })
      }, 150) // Slightly faster transition for better UX
    }, interval)

    return () => clearInterval(scrollInterval)
  }, [autoScroll, interval])

  return (
    <div 
      className={`relative ${compact ? 'h-32' : 'h-48'} overflow-hidden group`}
    >
      {/* Progress dots */}
      <div className="absolute -top-2 left-0 right-0 flex justify-start gap-1.5">
        {TESTIMONIALS.map((_, index) => (
          <div 
            key={index}
            className={`h-1 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'w-6 bg-[#FF6B6B] dark:bg-[#FF6B6B]' 
                : 'w-1.5 bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>

      {/* Quote mark */}
      {/* <div className="absolute -left-1 top-4 text-4xl font-serif text-indigo-200 dark:text-indigo-800 select-none">
        "
      </div> */}

      <div 
        className={`absolute w-full pt-6 transition-opacity duration-150 ease-in-out
          ${isAnimating ? 'opacity-0' : 'opacity-100'}
        `}
      >
        <div className="space-y-3">
          <p className={`
            ${compact ? 'text-base' : 'text-lg'} 
            text-gray-600 dark:text-gray-300 
            leading-relaxed pl-4
          `}>
            {TESTIMONIALS[currentIndex].text}
          </p>

          <div className="flex items-center gap-3 pl-4">
            <div className="h-px flex-1 bg-gradient-to-r from-[#FFE5E5] dark:from-[#FF6B6B]/30" />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-white">
                {TESTIMONIALS[currentIndex].author}
              </span>
              {TESTIMONIALS[currentIndex].location && (
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  • {TESTIMONIALS[currentIndex].location}
                </span>
              )}
            </div>
          </div>

          {!compact && TESTIMONIALS[currentIndex].achievement && (
            <div className="pl-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FFE5E5] dark:bg-[#FF6B6B]/20 text-[#FF6B6B] dark:text-[#FF6B6B]">
                <span className="w-1 h-1 rounded-full bg-[#FF6B6B] dark:bg-[#FF6B6B]" />
                {TESTIMONIALS[currentIndex].achievement}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 