'use client';

import { useState } from 'react';
import Link from 'next/link';

interface CoachOnboardingWizardProps {
  coachName: string | null;
  onComplete: () => void;
}

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Coach Mode',
    description: 'You now have access to powerful tools to manage clients and grow your coaching business.',
    icon: '🎉',
  },
  {
    id: 'clients',
    title: 'Add Your First Client',
    description: 'Invite clients by email or share your public invite link. They can join with one click.',
    icon: '👥',
    action: { label: 'Add Client', href: '#add-client' },
  },
  {
    id: 'programs',
    title: 'Create or Import Programs',
    description: 'Build custom programs manually, generate with AI, or import existing PDFs.',
    icon: '📋',
    action: { label: 'Import Program', href: '/import' },
  },
  {
    id: 'branding',
    title: 'Set Up Your Brand',
    description: 'Add your logo and brand colors. Your clients will see your branding throughout the app.',
    icon: '🎨',
    action: { label: 'Coach Settings', href: '/coach/settings' },
  },
];

export function CoachOnboardingWizard({
  coachName,
  onComplete,
}: CoachOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const res = await fetch('/api/coach/onboarding/complete', {
        method: 'POST',
      });
      if (!res.ok) {
        console.warn('Failed to save onboarding status:', await res.text());
      }
      onComplete();
    } catch (error) {
      // Log but still close - onboarding status can be retried
      console.warn('Error saving onboarding status:', error);
      onComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          {/* Header gradient */}
          <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] px-6 py-8 text-white text-center">
            <div className="text-5xl mb-3">{step.icon}</div>
            <h2 className="text-2xl font-bold">{step.title}</h2>
            {currentStep === 0 && coachName && (
              <p className="text-white/80 mt-1">Hey {coachName.split(' ')[0]}!</p>
            )}
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 py-4 bg-[#F8FAFC]">
            {STEPS.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-[#FF6B6B]'
                    : index < currentStep
                    ? 'bg-[#FF6B6B]/50'
                    : 'bg-[#E2E8F0]'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-[#475569] text-center mb-6">
              {step.description}
            </p>

            {/* Quick action button */}
            {step.action && (
              <div className="mb-6">
                {step.action.href === '#add-client' ? (
                  <p className="text-sm text-center text-[#64748B]">
                    Use the &quot;Add Client&quot; button on your dashboard
                  </p>
                ) : (
                  <Link
                    href={step.action.href}
                    className="block w-full py-3 text-center bg-[#F1F5F9] text-[#475569] rounded-lg hover:bg-[#E2E8F0] transition-colors font-medium"
                  >
                    {step.action.label} →
                  </Link>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="px-4 py-3 text-[#64748B] hover:text-[#0F172A] transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={isCompleting}
                className="flex-1 py-3 bg-[#FF6B6B] text-white font-semibold rounded-lg hover:bg-[#EF5350] transition-colors disabled:opacity-50"
              >
                {isCompleting
                  ? 'Setting up...'
                  : isLastStep
                  ? 'Get Started'
                  : 'Next'}
              </button>
            </div>

            {/* Skip option */}
            {!isLastStep && (
              <button
                onClick={handleSkip}
                className="w-full py-3 text-[#94A3B8] hover:text-[#64748B] transition-colors text-sm mt-2"
              >
                Skip intro
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
