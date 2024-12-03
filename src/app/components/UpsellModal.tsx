import { useState, useEffect } from "react";
import { validateEmail } from "@/utils/forms/validation";
import ReactConfetti from "react-confetti";
import { updateUser } from '../start/actions';

/**
 * TODOs:
 * - refactor testimonials to its own component for reuse
 * - add real stripe checkout or link
 * - more evidence based stats/upsell stuff (add citations?)
 */

type UpsellModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onEmailSubmit: (email: string) => void;
  onPurchase: () => void;
  userEmail?: string | null;
};

export function UpsellModal({ isOpen, onClose, onEmailSubmit, onPurchase, userEmail }: UpsellModalProps) {
  const [email, setEmail] = useState(userEmail || "");
  const [emailError, setEmailError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  const testimonials = [
    { text: "Life changing! Truly.", author: "Addison W., Premium Member" },
    { text: "I've tried lots of programs before, but this one actually delivered results. The premium features made all the difference!", author: "Sarah M., Premium Member" },
    { text: "I can't overstate how easy this was to follow. I didn't need to think about costs, annoying my trainer with too many questions, or anything else. Simple, affordable, and EFFECTIVE! Thank you bAIsic!", author: "John D., Premium Member" },
    { text: "Too easy to not try it!", author: "Emily R., Premium Member" },
  ];

  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleUpdateAnonUser = async (email: string) => {
    const userId = new URLSearchParams(window.location.search).get('userId');
    if (!userId) {
      throw new Error("No user ID found in URL");
    }
    const response = await updateUser(userId, { email });
    if (response.success) {
      // setShowConfetti(true);
      onEmailSubmit(email);
      onClose();
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
            <h2 className="text-3xl font-bold mb-2">Transform Your Fitness Journey</h2>
            <p className="text-gray-600 dark:text-gray-400">Become one of thousands of people who have achieved their fitness goals</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
            <span className="sr-only">Close</span>
            ✕
          </button>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-3 gap-4 mb-8 text-center">
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">75%</div>
            <div className="text-sm">Better Results with Premium</div>
          </div>
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">10k+</div>
            <div className="text-sm">Active Members</div>
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
            <h3 className="text-2xl font-bold mb-4">Start Your Journey</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Basic workout plan
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Weekly fitness tips
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Exercise tutorials
              </li>
            </ul>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (validateEmail(email)) {
                handleUpdateAnonUser(email);
              }
            }}>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                onBlur={() => {
                  if (!validateEmail(email) && email !== "") {
                    setEmailError("Please enter a valid email address");
                  }
                }}
                placeholder="Enter your email"
                className={`w-full p-3 border rounded-lg mb-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${
                  emailError ? "border-red-500 ring-1 ring-red-500 ring-opacity-50" : ""
                } ${validateEmail(email) && email !== "" ? "border-green-500 ring-1 ring-green-500 ring-opacity-50" : ""}`}
                required
              />
              {emailError && (
                <p className="text-red-500 text-sm mb-3">{emailError}</p>
              )}
              <button
                type="submit"
                className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 font-medium"
              >
                Get Free Access
              </button>
              <p className="text-center text-sm mt-3 text-gray-600 dark:text-gray-400">
                Enjoy the full, multi-phased program at <u>no cost</u>!
              </p>
            </form>
          </div>

          {/* Premium Option */}
          <div className="p-6 border rounded-xl bg-blue-50 dark:bg-gray-700 relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Premium Access
              </span>
              <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-medium">
                MOST POPULAR
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-4">Unlock Your Full Potential</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <strong>Everything in Free, plus:</strong>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Complete workout program
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Personalized nutrition plans
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Advanced progress tracking
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                1-on-1 coaching support
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Priority customer support
              </li>
            </ul>
            <button
              onClick={onPurchase}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Upgrade Now - $29.99/month
            </button>
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
                onClick={() => setCurrentTestimonialIndex(index)}
                className={`h-2 w-2 mx-1 rounded-full cursor-pointer ${index === currentTestimonialIndex ? 'bg-blue-600' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}