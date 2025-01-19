import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import Link from 'next/link'

interface BetaModalProps {
  isOpen: boolean
  onClose: () => void
  user?: {
    id: string
    email: string | null
    isPremium?: boolean
  } | null
}

const trackLeadConversion = () => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'Pre-launch signups', {
      'event_callback': function() {
        console.log('Lead conversion tracked');
      },
      'event_timeout': 2000,
    });
  } else {
    console.log('DEV MODE - Lead conversion tracked');
  }
}

export default function BetaModal({ isOpen, onClose, user }: BetaModalProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to join waitlist')
      }
      
      // Track the conversion after successful submission
      trackLeadConversion()
      setSubmitted(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong')
      console.error('Failed to join waitlist:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

      {/* Modal container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-gray-800 p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {user ? (
            // Existing user view
            <div className="text-center py-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 mb-4">
                <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <Dialog.Title className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                You already have access!
              </Dialog.Title>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                {user.isPremium 
                  ? "You're already a premium member. Thank you for your support!" 
                  : "Want to unlock all premium features and take your fitness journey to the next level?"}
              </p>
              {!user.isPremium && (
                <Link 
                  href="#pricing"
                  onClick={onClose}
                  className="inline-block px-8 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors"
                >
                  View Premium Plans
                </Link>
              )}
            </div>
          ) : submitted ? (
            // Successful submission view
            <div className="text-center py-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 mb-4">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <Dialog.Title className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">You&apos;re on the list!</Dialog.Title>
              <p className="text-gray-600 dark:text-gray-300">
                We can&apos;t wait to see you in a few weeks and all that you accomplish!
              </p>
            </div>
          ) : (
            // New user signup view
            <>
              <div className="mb-8">
                <div className="bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                  Coming Soon
                </div>
                <Dialog.Title className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
                  Be the first to experience baisics
                </Dialog.Title>
                <Dialog.Description className="text-gray-600 dark:text-gray-300">
                  We&apos;re wrapping up beta testing and preparing for our public launch in <span className="underline underline-offset-4">January 2025</span>. <br/><br/>Join the waitlist to get early access and special perks!
                </Dialog.Description>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={isSubmitting}
                    className="w-full text-gray-800 dark:text-white bg-white dark:bg-gray-700 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {error && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-8 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Joining...' : 'Join the waitlist'}
                  </button>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  No spam, ever. Unsubscribe anytime.
                </p>
              </form>
            </>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  )
} 