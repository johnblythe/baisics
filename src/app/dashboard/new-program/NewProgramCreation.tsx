'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  Dumbbell,
  Target,
  RefreshCw,
  ArrowRight,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import MainLayout from '@/app/components/layouts/MainLayout';
import ProgramGenerationProgress from '@/components/ProgramGenerationProgress';
import { useProgramGeneration } from '@/hooks/useProgramGeneration';

type ProgramType = 'similar' | 'new_focus' | 'fresh_start';

interface UserData {
  hasExistingPrograms: boolean;
  recentProgram?: {
    id: string;
    name: string;
    completionRate: number;
    goal: string;
  };
  profile?: {
    trainingGoal: string;
    daysAvailable: number;
    experienceLevel: string;
  };
}

export default function NewProgramCreation({ userId }: { userId: string }) {
  const router = useRouter();
  const [step, setStep] = useState<'loading' | 'select' | 'generating' | 'complete'>('loading');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newProgramId, setNewProgramId] = useState<string | null>(null);

  const { generate, progress, isGenerating } = useProgramGeneration({
    onComplete: (result) => {
      if (result.savedProgram?.id) {
        setNewProgramId(result.savedProgram.id);
        setStep('complete');
      }
    },
    onError: (errorMsg) => {
      setError(errorMsg);
      setStep('select');
    },
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/stats');
      if (response.ok) {
        const data = await response.json();
        setUserData({
          hasExistingPrograms: data.totalWorkouts > 0,
          recentProgram: data.recentProgram,
          profile: data.profile,
        });
      } else {
        setUserData({ hasExistingPrograms: false });
      }
      setStep('select');
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setUserData({ hasExistingPrograms: false });
      setStep('select');
    }
  };

  const handleGenerateProgram = async (type: ProgramType) => {
    setStep('generating');
    setError(null);

    generate({
      context: {
        generationType: type,
        previousPrograms: userData?.recentProgram ? [userData.recentProgram] : undefined,
      },
      intakeData: userData?.profile || {
        trainingGoal: 'general fitness',
        daysAvailable: 3,
        experienceLevel: 'beginner',
        workoutEnvironment: { primary: 'gym' },
        equipmentAccess: { type: 'full-gym', available: [] },
        workoutStyle: { primary: 'strength' },
        weight: 150,
        sex: 'other',
      },
    });
  };

  const programTypes = [
    {
      type: 'similar' as ProgramType,
      icon: RefreshCw,
      title: 'Similar Program',
      description: 'Continue with a similar structure, optimized based on your progress',
      disabled: !userData?.hasExistingPrograms,
      disabledReason: 'Requires previous program history',
    },
    {
      type: 'new_focus' as ProgramType,
      icon: Target,
      title: 'New Focus',
      description: 'Shift your training goals while building on your experience',
      disabled: false,
    },
    {
      type: 'fresh_start' as ProgramType,
      icon: Dumbbell,
      title: 'Fresh Start',
      description: 'Create a completely new program from scratch',
      disabled: false,
    },
  ];

  if (step === 'loading') {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-[#F1F5F9] border-t-[#FF6B6B] rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (step === 'generating') {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <div className="max-w-lg w-full bg-white rounded-2xl border border-[#F1F5F9] shadow-lg p-8">
            <ProgramGenerationProgress progress={progress} />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (step === 'complete' && newProgramId) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-[#F1F5F9] shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A] mb-2">
              Program Created!
            </h2>
            <p className="text-[#475569] mb-8">
              Your personalized fitness program is ready. Let&apos;s get started!
            </p>
            <Link
              href={`/dashboard/${newProgramId}`}
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#FF6B6B] text-white font-semibold rounded-xl hover:bg-[#EF5350] transition-colors shadow-lg shadow-[#FF6B6B]/25"
            >
              View Your Program
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-[#0F172A] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#0F172A] mb-4">
            Create New Program
          </h1>
          <p className="text-lg text-[#475569]">
            Choose how you&apos;d like to start your next fitness journey
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
            {error}
          </div>
        )}

        {/* Program Type Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {programTypes.map(({ type, icon: Icon, title, description, disabled, disabledReason }) => (
            <button
              key={type}
              onClick={() => !disabled && handleGenerateProgram(type)}
              disabled={disabled}
              className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
                disabled
                  ? 'border-[#F1F5F9] bg-[#F8FAFC] opacity-60 cursor-not-allowed'
                  : 'border-[#F1F5F9] bg-white hover:border-[#FF6B6B] hover:shadow-lg cursor-pointer group'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                  disabled
                    ? 'bg-[#F1F5F9]'
                    : 'bg-[#0F172A] group-hover:bg-[#FF6B6B]'
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${
                    disabled
                      ? 'text-[#94A3B8]'
                      : 'text-white'
                  }`}
                />
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                {title}
              </h3>
              <p className="text-sm text-[#475569]">
                {disabled ? disabledReason : description}
              </p>
              {!disabled && (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-5 h-5 text-[#FF6B6B]" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Alternative CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-[#94A3B8] mb-3">
            Want more control over your program?
          </p>
          <Link
            href="/hi"
            className="inline-flex items-center gap-2 text-[#FF6B6B] hover:text-[#EF5350] font-medium transition-colors"
          >
            Use the conversational intake instead
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
