import { useState, useEffect, useRef } from "react";
import { validateEmail } from "@/utils/forms/validation";
import ReactConfetti from "react-confetti";
import { updateUser } from '../start/actions';
import { welcomeFreeTemplate, welcomePremiumTemplate } from '@/lib/email/templates';
import { adminSignupNotificationTemplate } from '@/lib/email/templates/admin';
import { sendEmailAction } from "../hi/actions";
import { User } from "@prisma/client";

/**
 * TODOs:
 * - refactor testimonials to its own component for reuse
 * - add real stripe checkout or link
 * - more evidence based stats/upsell stuff (add citations?)
 */

interface UpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailSubmit: (email: string) => void;
  onPurchase: () => void;
  userEmail?: string | null;
  user?: User | null;
  onSuccessfulSubmit?: () => void;
}

const LoadingSpinner = () => (
  <div className="flex items-center gap-2">
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
    <span>Processing...</span>
  </div>
);

export function UpsellModal({ isOpen, onClose, onEmailSubmit, onPurchase, userEmail, user, onSuccessfulSubmit }: UpsellModalProps) {
  const [freeEmail, setFreeEmail] = useState(userEmail || user?.email || "");
  const [premiumEmail, setPremiumEmail] = useState(userEmail || user?.email || "");
  const [freeEmailError, setFreeEmailError] = useState("");
  const [premiumEmailError, setPremiumEmailError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const testimonials = [
    { text: "Life changing! Truly.", author: "Addison W., Premium Member" },
    { text: "I've tried lots of programs before, but this one actually delivered results. The premium features made all the difference!", author: "Timothy R., Premium Member" },
    { text: "I can't overstate how easy this was to succeed with. I wasn't worried about costs or bugging my trainer, I just asked for what I needed anytime I needed it. Simple, affordable, EFFECTIVE!", author: "John B., Premium Member" },
    { text: "Too easy to not try it!", author: "Lo B., Premium Member" },
  ];

  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  useEffect(() => {
    const startInterval = () => {
      intervalRef.current = setInterval(() => {
        setCurrentTestimonialIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
      }, 4000);
    };

    startInterval();
    return () => clearInterval(intervalRef.current);
  }, [testimonials.length]);

  const resetCurrentTestimonialIndex = (index: number) => {
    setCurrentTestimonialIndex(index);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentTestimonialIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 4000);
  };

  /**
   * @param email - the email address to update the user with
   * @param isPremium - whether the user is upgrading to premium
   */
  const handleUpdateAnonUser = async (email: string, isPremium = false) => {
    try {
      const userId = new URLSearchParams(window.location.search).get('userId');
      const programId = new URLSearchParams(window.location.search).get('programId');
      
      if (!userId) {
        throw new Error("No user ID found in URL");
      }

      setIsLoading(true);

      // Critical path: Create purchase session if premium
      let purchaseSessionId;
      if (isPremium) {
        try {
          const sessionResponse = await fetch('/api/purchase-sessions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
          });

          if (!sessionResponse.ok) {
            throw new Error('Failed to create purchase session');
          }

          const { sessionId } = await sessionResponse.json();
          purchaseSessionId = sessionId;
        } catch (error) {
          console.error('Purchase session error:', error);
          throw new Error('Failed to start purchase process');
        }
      }

      // Critical path: Update user
      const response = await updateUser(userId, { 
        email,
      });

      if (response.success) {
        // Show success immediately
        setShowConfetti(true);
        onEmailSubmit(email);

        // Trigger PDF generation for free users
        if (!isPremium) {
          onSuccessfulSubmit?.();
        }

        // Handle Stripe redirect for premium users
        if (isPremium && purchaseSessionId) {
          const stripeUrl = `${process.env.NEXT_PUBLIC_STRIPE_LINK}?` + 
            new URLSearchParams({
              prefilled_email: email,
              utm_content: purchaseSessionId,
            }).toString();
          
          // Create a button to handle the redirect
          const redirectButton = document.createElement('button');
          redirectButton.style.display = 'none';
          document.body.appendChild(redirectButton);
          
          redirectButton.onclick = () => {
            window.location.href = stripeUrl;
          };
          
          // Trigger the click after a short delay
          setTimeout(() => {
            redirectButton.click();
            document.body.removeChild(redirectButton);
          }, 100);
        } else {
          // Close modal for free users after a short delay
          setTimeout(() => {
            onClose();
          }, 1500); // Give time for confetti animation
        }

        // Non-critical path: Send emails asynchronously
        Promise.all([
          // Welcome email
          sendEmailAction({
            to: email,
            subject: isPremium ? 'Welcome to Baisics Premium!' : 'Welcome to Baisics!',
            html: isPremium 
              ? welcomePremiumTemplate()
              : welcomeFreeTemplate({ upgradeLink: process.env.NEXT_PUBLIC_STRIPE_LINK, programLink: `${process.env.NEXT_PUBLIC_APP_URL}/hi?userId=${userId}&programId=${programId}` })
          }).catch(error => console.error('Welcome email error:', error)),

          // Admin notification
          sendEmailAction({
            to: process.env.NEXT_PUBLIC_ADMIN_EMAIL!,
            subject: `New ${isPremium ? 'Premium' : 'Free'} User Signup: ${email}`,
            html: adminSignupNotificationTemplate({
              userEmail: email,
              isPremium,
              userId,
              programId: programId || undefined
            })
          }).catch(error => console.error('Admin notification error:', error))
        ]);
      } else if (response.error === 'EMAIL_EXISTS') {
        if (isPremium) {
          setPremiumEmailError("This email is already registered. Please upgrade, log in, or use a different email.");
        } else {
          setFreeEmailError("This email is already registered. Please upgrade, log in, or use a different email.");
        }
      }
    } catch (error) {
      console.error('Error updating user:', error);
      if (isPremium) {
        setPremiumEmailError("An error occurred. Please try again.");
      } else {
        setFreeEmailError("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {showConfetti && <ReactConfetti />}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-4xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">No pain, just gain. Join today!</h2>
            <p className="text-gray-600 dark:text-gray-400">Don&apos;t wait to become another success story.</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
            <span className="sr-only">Close</span>
            ✕
          </button>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-3 gap-4 mb-8 text-center">
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{'>'}75%</div>
            <div className="text-sm">Better Results with Premium</div>
          </div>
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">300+</div>
            <div className="text-sm">Exercises in the Library</div>
          </div>
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">100%</div>
            <div className="text-sm">Satisfaction Guaranteed</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Free Option */}
          <div className="p-6 border rounded-xl">
            <div className="bg-gray-100 dark:bg-gray-700 inline-block px-3 py-1 rounded-full text-sm mb-4">Free Access</div>
            <h3 className="text-2xl font-bold mb-4">Start Your Journey for Free</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Your custom program&apos;s first phase
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Request customizations
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Access online or download to go
              </li>
            </ul>
            <div className="space-y-2 mb-6">
              <div className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <span className="bg-blue-50 dark:bg-gray-700 px-3 py-1 rounded-full text-sm">
                  No credit card required
                </span>
              </div>
              <div className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <span className="bg-blue-50 dark:bg-gray-700 px-3 py-1 rounded-full text-sm">
                  No commitment
                </span>
              </div>
            </div>
            {user?.email ? (
              <div className="text-center space-y-3">
                <div className="bg-blue-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-600 dark:text-white">
                    You&apos;ve already started your free journey! 🎉
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Ready to unlock all features? Check out our Premium plan →
                  </p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Need to get back to your baisics dashboard?<br/><a href={`${process.env.NEXT_PUBLIC_APP_URL}/hi?userId=${user.id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">Log in here</a>
                </p>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (validateEmail(freeEmail)) {
                  try {
                    setIsLoading(true);
                    await handleUpdateAnonUser(freeEmail);
                  } catch (error) {
                    console.error('Error:', error);
                  } finally {
                    setIsLoading(false);
                  }
                }
              }}>
                <input
                  type="email"
                  value={freeEmail}
                  onChange={(e) => {
                    setFreeEmail(e.target.value);
                    setFreeEmailError("");
                  }}
                  onBlur={() => {
                    if (!validateEmail(freeEmail) && freeEmail !== "") {
                      setFreeEmailError("Please enter a valid email address");
                    }
                  }}
                  disabled={isLoading}
                  placeholder="Enter your email"
                  className={`w-full p-3 border rounded-lg mb-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${
                    freeEmailError ? "border-red-500 ring-1 ring-red-500 ring-opacity-50" : ""
                  } ${validateEmail(freeEmail) && freeEmail !== "" ? "border-green-500 ring-1 ring-green-500 ring-opacity-50" : ""}`}
                  required
                />
                {freeEmailError && (
                  <p className="text-red-500 text-sm mb-3">{freeEmailError}</p>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-2 text-white font-medium rounded-lg bg-gray-600  hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? <LoadingSpinner /> : 'Continue with Free Access'}
                </button>
                <p className="text-center text-sm mt-3 text-gray-600 dark:text-gray-400">
                  Enjoy your custom program at <u>no cost</u>!
                </p>
              </form>
            )}
          </div>

          {/* Premium Option */}
          <div className="p-6 border rounded-xl bg-blue-50 dark:bg-gray-700 relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
              💪 Premium Access
              </span>
              <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-extrabold">
                MOST POPULAR
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-4">Unlock Your Best Self</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center">
                <strong><span className="font-extrabold underline">Everything</span> in Free, plus:</strong>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Unlimited custom programs
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Personalized nutrition and meal planning
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Workout planner & tracking
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Advanced progress tracking
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Priority customer support
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Full access to the growing library of programs
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                And lots more! New features coming soon!
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                More affordable than even Planet Fitness!
              </li>
            </ul>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (validateEmail(premiumEmail)) {
                try {
                  await handleUpdateAnonUser(premiumEmail, true);
                } catch (error) {
                  console.error('Error:', error);
                }
              }
            }}>
              <input
                type="email"
                value={premiumEmail}
                onChange={(e) => {
                  setPremiumEmail(e.target.value);
                  setPremiumEmailError("");
                }}
                onBlur={() => {
                  if (!validateEmail(premiumEmail) && premiumEmail !== "") {
                    setPremiumEmailError("Please enter a valid email address");
                  }
                }}
                placeholder="Enter your email"
                className={`w-full p-3 border rounded-lg mb-3 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${
                  premiumEmailError ? "border-red-500 ring-1 ring-red-500 ring-opacity-50" : ""
                } ${validateEmail(premiumEmail) && premiumEmail !== "" ? "border-green-500 ring-1 ring-green-500 ring-opacity-50" : ""}`}
                required
              />
              {premiumEmailError && (
                <p className="text-red-500 text-sm mb-3">{premiumEmailError}</p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? <LoadingSpinner /> : <strong>Upgrade Now - $10/month</strong>}
              </button>
            </form>
            <p className="text-center text-sm mt-3 text-gray-600 dark:text-gray-400">
              Cancel anytime. Keep everything you&apos;ve built.
            </p>
          </div>
        </div>

        {/* Testimonial */}
        <div className="mt-8 text-center">
          <p className="italic text-gray-600 dark:text-gray-400">
            &quot;{testimonials[currentTestimonialIndex].text}&quot;
          </p>
          <p className="mt-2 font-medium">- {testimonials[currentTestimonialIndex].author}</p>
          <div className="flex justify-center mt-4">
            {testimonials.map((_, index) => (
              <span
                key={index}
                onClick={() => resetCurrentTestimonialIndex(index)}
                className={`h-2 w-2 mx-1 rounded-full cursor-pointer ${index === currentTestimonialIndex ? 'bg-blue-600' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}