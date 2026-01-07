import { useState, useEffect } from "react";
import { validateEmail } from "@/utils/forms/validation";
import ReactConfetti from "react-confetti";
import { updateUser } from '@/lib/actions/user';
import { welcomeFreeTemplate, welcomePremiumTemplate } from '@/lib/email/templates';
import { adminSignupNotificationTemplate } from '@/lib/email/templates/admin';
import { sendEmailAction } from "../hi/actions";
import { User } from "@prisma/client";
import { sendGTMEvent } from "@next/third-parties/google";
import { useABTest } from "@/utils/abTest";

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

// Shared form props
interface VariantFormProps {
  email: string;
  setEmail: (email: string) => void;
  emailError: string;
  setEmailError: (error: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

// =============================================================================
// VARIANT A: Program Preview
// =============================================================================
function VariantA({ onClose, formProps }: { onClose: () => void; formProps: VariantFormProps }) {
  const { email, setEmail, emailError, setEmailError, isLoading, onSubmit } = formProps;

  return (
    <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white z-10">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] p-6 text-white">
        <p className="text-[#FF6B6B] text-xs font-bold uppercase tracking-wider mb-1">✨ Just for you</p>
        <h2 className="text-2xl font-bold">Your Custom Program is Ready</h2>
        <p className="text-white/70 mt-1 text-sm">Built from your goals, schedule, and equipment.</p>
      </div>

      {/* Program Preview */}
      <div className="relative mx-6 my-4">
        <div className="bg-gradient-to-b from-[#F8FAFC] to-white rounded-xl p-4 border border-[#E2E8F0]">
          <div className="blur-[2px] opacity-60 pointer-events-none">
            <p className="text-xs text-[#94A3B8] uppercase tracking-wider">Week 1 Preview</p>
            <p className="font-semibold text-[#0F172A]">Day 1: Upper Body Push</p>
            <div className="mt-2 space-y-1 text-sm text-[#475569]">
              <p>• Bench Press - 4x8</p>
              <p>• Overhead Press - 3x10</p>
              <p>• Incline DB Press - 3x12</p>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-[#0F172A] text-white text-xs font-bold px-3 py-1.5 rounded-full">
              Enter email to unlock
            </span>
          </div>
        </div>
      </div>

      {/* What's included */}
      <div className="px-6 mb-4">
        <div className="flex flex-wrap gap-2 justify-center text-xs">
          <span className="bg-[#FFE5E5] text-[#FF6B6B] px-2.5 py-1 rounded-full font-medium">Full workout plan</span>
          <span className="bg-[#FFE5E5] text-[#FF6B6B] px-2.5 py-1 rounded-full font-medium">Nutrition targets</span>
          <span className="bg-[#FFE5E5] text-[#FF6B6B] px-2.5 py-1 rounded-full font-medium">PDF download</span>
        </div>
      </div>

      {/* Form */}
      <div className="px-6 pb-6">
        <form onSubmit={onSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
            onBlur={() => { if (!validateEmail(email) && email !== "") setEmailError("Please enter a valid email"); }}
            placeholder="your@email.com"
            disabled={isLoading}
            className={`w-full p-4 border-2 rounded-xl text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#FF6B6B] text-center text-lg ${
              emailError ? "border-[#EF5350]" : "border-[#E2E8F0]"
            } ${validateEmail(email) && email ? "border-green-500" : ""}`}
          />
          {emailError && <p className="text-[#EF5350] text-sm mt-2 text-center">{emailError}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 px-4 py-4 bg-[#FF6B6B] text-white font-bold rounded-xl hover:bg-[#EF5350] transition-all hover:scale-[1.02] shadow-lg shadow-[#FF6B6B]/30 text-lg disabled:opacity-50"
          >
            {isLoading ? <LoadingSpinner /> : 'Send Me My Program'}
          </button>
        </form>
        <p className="text-center text-xs text-[#94A3B8] mt-3">
          100% free • No credit card required
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// VARIANT B: Benefits List
// =============================================================================
function VariantB({ onClose, formProps }: { onClose: () => void; formProps: VariantFormProps }) {
  const { email, setEmail, emailError, setEmailError, isLoading, onSubmit } = formProps;

  return (
    <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#0F172A] z-10">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Header */}
      <div className="p-6 pb-4 text-center">
        <div className="w-14 h-14 bg-[#FFE5E5] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-[#FF6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#0F172A]">Your Program is Ready</h2>
        <p className="text-[#64748B] mt-1">Here&apos;s what you&apos;re getting:</p>
      </div>

      {/* Benefits List */}
      <div className="px-6 mb-6">
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-[#F8FAFC] rounded-xl">
            <div className="w-8 h-8 bg-[#FF6B6B] rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-[#0F172A]">Personalized Workout Plan</p>
              <p className="text-sm text-[#64748B]">Built for your goals, schedule & equipment</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-[#F8FAFC] rounded-xl">
            <div className="w-8 h-8 bg-[#FF6B6B] rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-[#0F172A]">Nutrition Targets</p>
              <p className="text-sm text-[#64748B]">Calories & macros matched to your goals</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-[#F8FAFC] rounded-xl">
            <div className="w-8 h-8 bg-[#FF6B6B] rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-[#0F172A]">PDF Download</p>
              <p className="text-sm text-[#64748B]">Take it to the gym, no login needed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-6 pb-6">
        <form onSubmit={onSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
            onBlur={() => { if (!validateEmail(email) && email !== "") setEmailError("Please enter a valid email"); }}
            placeholder="your@email.com"
            disabled={isLoading}
            className={`w-full p-4 border-2 rounded-xl text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#FF6B6B] text-center ${
              emailError ? "border-[#EF5350]" : "border-[#E2E8F0]"
            } ${validateEmail(email) && email ? "border-green-500" : ""}`}
          />
          {emailError && <p className="text-[#EF5350] text-sm mt-2 text-center">{emailError}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 px-4 py-4 bg-[#FF6B6B] text-white font-bold rounded-xl hover:bg-[#EF5350] transition-all shadow-lg shadow-[#FF6B6B]/30 disabled:opacity-50"
          >
            {isLoading ? <LoadingSpinner /> : 'Get My Free Program'}
          </button>
        </form>
        <p className="text-center text-xs text-[#94A3B8] mt-3">
          Free forever • No credit card • No spam
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// VARIANT C: Minimal
// =============================================================================
function VariantC({ onClose, formProps }: { onClose: () => void; formProps: VariantFormProps }) {
  const { email, setEmail, emailError, setEmailError, isLoading, onSubmit } = formProps;
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmail(email)) {
      setSubmitted(true);
      onSubmit(e);
    }
  };

  return (
    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
      <button onClick={onClose} className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#0F172A] z-10">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {!submitted ? (
        <div className="p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-[#FFE5E5] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#FF6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Copy */}
          <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Your Program is Ready!</h2>
          <p className="text-[#64748B] mb-6">Where should we send it?</p>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
              onBlur={() => { if (!validateEmail(email) && email !== "") setEmailError("Please enter a valid email"); }}
              placeholder="your@email.com"
              disabled={isLoading}
              className={`w-full p-4 border-2 rounded-xl text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#FF6B6B] text-center ${
                emailError ? "border-[#EF5350]" : "border-[#E2E8F0]"
              } ${validateEmail(email) && email ? "border-green-500" : ""}`}
              autoFocus
            />
            {emailError && <p className="text-[#EF5350] text-sm mt-2">{emailError}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 px-4 py-4 bg-[#FF6B6B] text-white font-bold rounded-xl hover:bg-[#EF5350] transition-all shadow-lg shadow-[#FF6B6B]/30 disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner /> : 'Send Me My Program'}
            </button>
          </form>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-6 text-xs text-[#94A3B8]">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              100% Free
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No Credit Card
            </span>
          </div>

          {/* Subtle Pro upsell */}
          <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
            <p className="text-xs text-[#94A3B8]">
              Want unlimited programs & nutrition plans?{' '}
              <button className="text-[#FF6B6B] hover:underline font-medium">
                Join Pro waitlist →
              </button>
            </p>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A] mb-2">You&apos;re All Set!</h2>
          <p className="text-[#64748B] mb-6">Your program is ready to view.</p>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT WITH A/B TEST
// =============================================================================
export function UpsellModal({ isOpen, onClose, onEmailSubmit, onPurchase, userEmail, user, onSuccessfulSubmit }: UpsellModalProps) {
  const [email, setEmail] = useState(userEmail || user?.email || "");
  const [emailError, setEmailError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // A/B Test: randomly assign variant A, B, or C
  const { variant, trackConversion, trackDismiss } = useABTest('upsell_modal_v1', ['A', 'B', 'C']);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Reset email when modal opens
  useEffect(() => {
    if (isOpen) {
      setEmail(userEmail || user?.email || "");
      setEmailError("");
    }
  }, [isOpen, userEmail, user?.email]);

  const handleClose = () => {
    trackDismiss();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    try {
      const userId = new URLSearchParams(window.location.search).get('userId');
      const programId = new URLSearchParams(window.location.search).get('programId');

      if (!userId) {
        throw new Error("No user ID found in URL");
      }

      // Track conversion with variant info
      trackConversion();

      sendGTMEvent({
        event: 'signup - upsell modal',
        value: {
          email,
          variant,
          userId,
          programId,
        }
      });

      setIsLoading(true);

      const response = await updateUser(userId, { email });

      if (response.success) {
        setShowConfetti(true);
        onEmailSubmit(email);
        onSuccessfulSubmit?.();

        setTimeout(() => {
          onClose();
        }, 1500);

        // Send emails asynchronously
        Promise.all([
          sendEmailAction({
            to: email,
            subject: 'Welcome to Baisics!',
            html: welcomeFreeTemplate({
              upgradeLink: process.env.NEXT_PUBLIC_STRIPE_LINK,
              programLink: `${process.env.NEXT_PUBLIC_APP_URL}/hi?userId=${userId}&programId=${programId}`
            })
          }).catch(error => console.error('Welcome email error:', error)),

          sendEmailAction({
            to: process.env.NEXT_PUBLIC_ADMIN_EMAIL!,
            subject: `New Free User Signup: ${email}`,
            html: adminSignupNotificationTemplate({
              userEmail: email,
              isPremium: false,
              userId,
              programId: programId || undefined
            })
          }).catch(error => console.error('Admin notification error:', error))
        ]);
      } else if (response.error === 'EMAIL_EXISTS') {
        setEmailError("This email is already registered. Please log in or use a different email.");
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setEmailError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !variant) return null;

  const formProps: VariantFormProps = {
    email,
    setEmail,
    emailError,
    setEmailError,
    isLoading,
    onSubmit: handleSubmit,
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      {showConfetti && <ReactConfetti />}

      {variant === 'A' && <VariantA onClose={handleClose} formProps={formProps} />}
      {variant === 'B' && <VariantB onClose={handleClose} formProps={formProps} />}
      {variant === 'C' && <VariantC onClose={handleClose} formProps={formProps} />}
    </div>
  );
}
