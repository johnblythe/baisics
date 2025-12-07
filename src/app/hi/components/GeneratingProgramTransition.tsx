"use client";

import { motion } from "framer-motion";

interface GenerationProgress {
  stage: string;
  message: string;
  progress: number;
}

interface GeneratingProgramTransitionProps {
  progress?: GenerationProgress;
}

const STAGE_ORDER = ['analyzing', 'generating', 'processing', 'validating', 'saving', 'complete'];

const STAGE_INFO: Record<string, { title: string; description: string }> = {
  idle: { title: 'Starting...', description: 'Preparing to build your program' },
  analyzing: { title: 'Analyzing Profile', description: 'Understanding your goals and preferences' },
  generating: { title: 'Designing Program', description: 'Creating your personalized workout plan' },
  processing: { title: 'Building Workouts', description: 'Structuring exercises and progressions' },
  validating: { title: 'Quality Check', description: 'Ensuring everything is perfect' },
  saving: { title: 'Saving Program', description: 'Almost there!' },
  complete: { title: 'Complete!', description: 'Your program is ready' },
  error: { title: 'Error', description: 'Something went wrong' },
};

export function GeneratingProgramTransition({ progress }: GeneratingProgramTransitionProps) {
  const currentStage = progress?.stage || 'analyzing';
  const currentStageIndex = STAGE_ORDER.indexOf(currentStage);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto text-center space-y-8"
      >
        <div className="space-y-2">
          <div className="h-0.5 w-12 bg-indigo-600/30 dark:bg-indigo-400/30 mx-auto mb-4"></div>
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase">Building Your Program</p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {STAGE_INFO[currentStage]?.title || 'Creating Your Program'}
          </h2>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md mx-auto">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress?.progress || 10}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {progress?.progress || 0}% complete
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-lg opacity-0 blur-xl transition duration-500 group-hover:opacity-30 dark:group-hover:opacity-20"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 space-y-4">
            {STAGE_ORDER.slice(0, -1).map((stage, index) => {
              const isComplete = index < currentStageIndex;
              const isCurrent = stage === currentStage;
              const isPending = index > currentStageIndex;
              const info = STAGE_INFO[stage];

              return (
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isComplete ? 'bg-green-500' :
                    isCurrent ? 'bg-indigo-500' :
                    'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    {isComplete ? (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isCurrent ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-white"
                      />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
                    )}
                  </div>
                  <div className="text-left">
                    <span className={`block ${
                      isComplete ? 'text-green-600 dark:text-green-400' :
                      isCurrent ? 'text-indigo-600 dark:text-indigo-400 font-medium' :
                      'text-gray-400 dark:text-gray-500'
                    }`}>
                      {info.title}
                    </span>
                    {isCurrent && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {progress?.message || info.description}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-gray-500 dark:text-gray-400 text-sm"
        >
          This usually takes 30-60 seconds
        </motion.div>
      </motion.div>
    </div>
  );
} 