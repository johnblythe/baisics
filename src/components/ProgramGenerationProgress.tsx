'use client';

import { Dumbbell, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { GenerationProgress } from '@/hooks/useProgramGeneration';

interface ProgramGenerationProgressProps {
  progress: GenerationProgress;
  className?: string;
}

const stageIcons: Record<string, React.ReactNode> = {
  analyzing: <Loader2 className="w-5 h-5 animate-spin" />,
  generating: <Loader2 className="w-5 h-5 animate-spin" />,
  processing: <Loader2 className="w-5 h-5 animate-spin" />,
  validating: <Loader2 className="w-5 h-5 animate-spin" />,
  saving: <Loader2 className="w-5 h-5 animate-spin" />,
  complete: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
};

const stages = [
  { key: 'analyzing', label: 'Analyzing profile' },
  { key: 'generating', label: 'Designing program' },
  { key: 'processing', label: 'Building workouts' },
  { key: 'validating', label: 'Validating program' },
  { key: 'saving', label: 'Saving program' },
];

export default function ProgramGenerationProgress({
  progress,
  className = '',
}: ProgramGenerationProgressProps) {
  const currentStageIndex = stages.findIndex((s) => s.key === progress.stage);

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {/* Main spinner and message */}
      <div className="text-center mb-8">
        <div className="relative w-24 h-24 mx-auto mb-6">
          {/* Background circle */}
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
          {/* Progress circle */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="44"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              className="text-indigo-600 dark:text-indigo-400 transition-all duration-500"
              style={{
                strokeDasharray: `${2 * Math.PI * 44}`,
                strokeDashoffset: `${2 * Math.PI * 44 * (1 - progress.progress / 100)}`,
              }}
            />
          </svg>
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            {progress.stage === 'complete' ? (
              <CheckCircle className="w-10 h-10 text-green-500" />
            ) : progress.stage === 'error' ? (
              <AlertCircle className="w-10 h-10 text-red-500" />
            ) : (
              <Dumbbell className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            )}
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {progress.stage === 'complete'
            ? 'Program Ready!'
            : progress.stage === 'error'
              ? 'Generation Failed'
              : 'Creating Your Program'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">{progress.message}</p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            progress.stage === 'error'
              ? 'bg-red-500'
              : progress.stage === 'complete'
                ? 'bg-green-500'
                : 'bg-indigo-600 dark:bg-indigo-400'
          }`}
          style={{ width: `${progress.progress}%` }}
        />
      </div>

      {/* Stage indicators */}
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const isComplete = index < currentStageIndex || progress.stage === 'complete';
          const isCurrent = stage.key === progress.stage;
          const isPending = index > currentStageIndex && progress.stage !== 'complete';

          return (
            <div
              key={stage.key}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                isCurrent
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700'
                  : isComplete
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-gray-50 dark:bg-gray-800/50'
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  isComplete
                    ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
                    : isCurrent
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                }`}
              >
                {isComplete ? (
                  <CheckCircle className="w-4 h-4" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  isComplete
                    ? 'text-green-700 dark:text-green-300'
                    : isCurrent
                      ? 'text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Estimated time */}
      {progress.stage !== 'complete' && progress.stage !== 'error' && progress.stage !== 'idle' && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Usually takes 15-30 seconds
        </p>
      )}
    </div>
  );
}
