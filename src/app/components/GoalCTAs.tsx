'use client'

import { useState, useEffect } from 'react'
import ReactConfetti from 'react-confetti'

export type Goal = {
  id: number
  text: string
  emoji: string
  message: string
}

const GOALS: Goal[] = [
  {
    id: 1,
    text: "Help me lose weight",
    emoji: "🎯",
    message: "I want to lose weight and get in better shape. Can you help me create a program?"
  },
  {
    id: 2,
    text: "Get me ripped",
    emoji: "💪",
    message: "I want to build muscle and get ripped. What's the best program for me?"
  },
  {
    id: 3,
    text: "I want to be stronger",
    emoji: "🏋️‍♂️",
    message: "I'm looking to build strength. Can you create a program focused on that?"
  },
  {
    id: 4,
    text: "Build muscle mass",
    emoji: "🦾",
    message: "I want to build muscle mass. What kind of program would work best?"
  },
  {
    id: 5,
    text: "Get fit for summer",
    emoji: "🏖️",
    message: "I want to get in shape for summer. Can you help me with a program?"
  }
]

interface GoalCTAsProps {
  onGoalSelect: (message: string) => void
}

export default function GoalCTAs({ onGoalSelect }: GoalCTAsProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null)
  const [isRotating, setIsRotating] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (!isRotating) return

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % GOALS.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [isRotating])

  useEffect(() => {
    if (showConfetti) {
      // Hide confetti after 2.5 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false)
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [showConfetti])

  const handleGoalClick = (goal: Goal) => {
    if (selectedGoal === goal.id) return // Prevent re-selecting same goal
    
    setSelectedGoal(goal.id)
    setIsRotating(false)
    setActiveIndex(GOALS.findIndex(g => g.id === goal.id))
    setShowConfetti(true)
    
    // Submit the message after a brief delay to let confetti start
    setTimeout(() => {
      onGoalSelect(goal.message)
    }, 100)
  }

  return (
    <div className="space-y-3 relative">
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          initialVelocityY={20}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 100
          }}
        />
      )}
      
      {GOALS.map((goal, index) => (
        <button
          key={goal.id}
          onClick={() => handleGoalClick(goal)}
          className={`
            w-full text-left px-4 py-3 rounded-lg transition-all duration-300
            ${(index === activeIndex || goal.id === selectedGoal) ? 
              'bg-indigo-600 text-white shadow-lg scale-[1.02] -translate-y-0.5' : 
              'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }
            group relative overflow-hidden
          `}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{goal.emoji}</span>
            <span className="font-medium">{goal.text}</span>
          </div>
          
          {/* Animated gradient background for active item */}
          {(index === activeIndex || goal.id === selectedGoal) && (
            <div 
              className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 opacity-100 dark:opacity-90"
              style={{
                backgroundSize: '200% 100%',
                animation: 'gradient-x 8s linear infinite'
              }}
            />
          )}
        </button>
      ))}

      <style jsx>{`
        @keyframes gradient-x {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }
      `}</style>
    </div>
  )
} 