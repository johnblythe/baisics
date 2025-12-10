"use client";

import { motion } from "framer-motion";
import { StreamingPhasePreview } from "./StreamingPhasePreview";
import type { ValidatedPhase } from "@/services/programGeneration/schema";

interface GenerationProgress {
  stage: string;
  message: string;
  progress: number;
}

interface ProgramMeta {
  name: string;
  description: string;
  totalWeeks: number;
}

interface GeneratingProgramTransitionProps {
  progress?: GenerationProgress;
  phases?: ValidatedPhase[];
  programMeta?: ProgramMeta | null;
}

export function GeneratingProgramTransition({
  progress,
  phases = [],
  programMeta,
}: GeneratingProgramTransitionProps) {
  const currentStage = progress?.stage || 'analyzing';
  const hasPhases = phases.length > 0;
  const progressPercent = progress?.progress || 5;

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
      `}</style>

      <div
        className="relative min-h-[70vh] flex flex-col items-center justify-center p-6 md:p-10"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC] to-white" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-2xl mx-auto"
        >
          {hasPhases ? (
            /* Phases ready - show them */
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFE5E5] text-[#EF5350] rounded-full text-sm font-semibold"
                >
                  {currentStage !== 'complete' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-[#FFB8B8] border-t-[#FF6B6B] rounded-full"
                    />
                  ) : (
                    <svg className="w-4 h-4 text-[#FF6B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {currentStage === 'complete' ? 'Program Complete' : 'Building Your Program'}
                </motion.div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight">
                  {phases.length} Phase{phases.length > 1 ? 's' : ''} Ready
                </h1>

                {currentStage !== 'complete' && (
                  <p className="text-[#475569]">More phases generating...</p>
                )}
              </div>

              {/* Progress bar */}
              <div className="max-w-md mx-auto">
                <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#EF5350] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm text-[#94A3B8]" style={{ fontFamily: "'Space Mono', monospace" }}>
                  <span>{progressPercent}%</span>
                  <span>{progress?.message || ''}</span>
                </div>
              </div>

              {/* Phase cards */}
              <StreamingPhasePreview
                phases={phases}
                programMeta={programMeta}
                isGenerating={currentStage !== 'complete' && currentStage !== 'error'}
              />
            </div>
          ) : (
            /* Loading state - no phases yet */
            <div className="text-center space-y-10">
              {/* Animated loader */}
              <div className="relative w-32 h-32 mx-auto">
                {/* Outer ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle
                      cx="50" cy="50" r="46"
                      fill="none"
                      stroke="#F1F5F9"
                      strokeWidth="4"
                    />
                    <circle
                      cx="50" cy="50" r="46"
                      fill="none"
                      stroke="url(#coralGradient)"
                      strokeWidth="4"
                      strokeDasharray="70 220"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="coralGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FF6B6B" />
                        <stop offset="100%" stopColor="#EF5350" />
                      </linearGradient>
                    </defs>
                  </svg>
                </motion.div>

                {/* Center content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span
                      className="text-3xl font-bold text-[#0F172A] tabular-nums"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                      {progressPercent}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight">
                  Creating Your Program
                </h1>
                <motion.p
                  key={progress?.message}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-lg text-[#475569]"
                >
                  {progress?.message || 'Analyzing your profile...'}
                </motion.p>
              </div>

              {/* Progress bar */}
              <div className="max-w-sm mx-auto">
                <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#EF5350] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Steps card */}
              <div className="max-w-md mx-auto">
                <div className="bg-white rounded-2xl border-2 border-[#F1F5F9] p-6">
                  <p
                    className="text-xs text-[#94A3B8] uppercase tracking-wider mb-5"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    What&apos;s happening
                  </p>
                  <div className="space-y-4">
                    {[
                      { label: 'Analyzing your goals', threshold: 10 },
                      { label: 'Designing workout structure', threshold: 30 },
                      { label: 'Selecting exercises', threshold: 50 },
                      { label: 'Calculating nutrition', threshold: 70 },
                    ].map((step, i) => {
                      const isDone = progressPercent > step.threshold;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                            isDone ? 'bg-[#FFE5E5]' : 'bg-[#F8FAFC]'
                          }`}>
                            {isDone ? (
                              <svg className="w-3.5 h-3.5 text-[#FF6B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-[#94A3B8]" />
                            )}
                          </div>
                          <span className={`text-sm font-medium ${isDone ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <p className="text-sm text-[#94A3B8]">
                Your phases will appear as they&apos;re generated
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
