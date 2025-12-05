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
} from 'lucide-react';
import MainLayout from '@/app/components/layouts/MainLayout';

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

interface GenerationStatus {
  stage: string;
  progress: number;
}

export default function NewProgramCreation({ userId }: { userId: string }) {
  const router = useRouter();
  const [step, setStep] = useState<'loading' | 'select' | 'generating' | 'complete'>('loading');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedType, setSelectedType] = useState<ProgramType | null>(null);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({
    stage: 'Initializing...',
    progress: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [newProgramId, setNewProgramId] = useState<string | null>(null);

  // Fetch user data on mount
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
        // No existing data, that's ok
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
    setSelectedType(type);
    setStep('generating');
    setError(null);

    // Simulate progress stages
    const stages = [
      { stage: 'Analyzing your profile...', progress: 10 },
      { stage: 'Designing program structure...', progress: 30 },
      { stage: 'Creating workouts...', progress: 50 },
      { stage: 'Calculating nutrition...', progress: 70 },
      { stage: 'Finalizing program...', progress: 90 },
    ];

    let currentStage = 0;
    const progressInterval = setInterval(() => {
      if (currentStage < stages.length) {
        setGenerationStatus(stages[currentStage]);
        currentStage++;
      }
    }, 2000);

    try {
      const response = await fetch('/api/programs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: {
            generationType: type,
            previousPrograms: userData?.recentProgram
              ? [userData.recentProgram]
              : undefined,
          },
          // If no existing profile, use defaults
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
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate program');
      }

      const data = await response.json();
      setGenerationStatus({ stage: 'Program ready!', progress: 100 });
      setNewProgramId(data.savedProgram?.id);
      setStep('complete');
    } catch (err) {
      clearInterval(progressInterval);
      console.error('Generation failed:', err);
      setError(err instanceof Error ? err.message : 'Generation failed');
      setStep('select');
    }
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
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </MainLayout>
    );
  }

  if (step === 'generating') {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
              <div
                className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"
                style={{ animationDuration: '1.5s' }}
              />
              <Dumbbell className="absolute inset-0 m-auto w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Generating Your Program
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {generationStatus.stage}
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${generationStatus.progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              This usually takes 15-30 seconds
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (step === 'complete' && newProgramId) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Program Created!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Your personalized fitness program is ready. Let's get started!
            </p>
            <Link
              href={`/dashboard/${newProgramId}`}
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
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
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Create New Program
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Choose how you'd like to start your next fitness journey
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-center">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {programTypes.map(({ type, icon: Icon, title, description, disabled, disabledReason }) => (
              <button
                key={type}
                onClick={() => !disabled && handleGenerateProgram(type)}
                disabled={disabled}
                className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
                  disabled
                    ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60 cursor-not-allowed'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-lg cursor-pointer'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    disabled
                      ? 'bg-gray-100 dark:bg-gray-700'
                      : 'bg-indigo-100 dark:bg-indigo-900/30'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      disabled
                        ? 'text-gray-400 dark:text-gray-500'
                        : 'text-indigo-600 dark:text-indigo-400'
                    }`}
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {disabled ? disabledReason : description}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Want more control over your program?
            </p>
            <Link
              href="/hi"
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Use the conversational intake instead →
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
