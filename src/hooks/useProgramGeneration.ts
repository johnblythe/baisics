import { useState, useCallback, useRef } from 'react';
import type { GeneratedProgram } from '@/services/programGeneration/types';
import type { ValidatedPhase } from '@/services/programGeneration/schema';

export interface GenerationProgress {
  stage: 'idle' | 'analyzing' | 'generating' | 'processing' | 'validating' | 'saving' | 'complete' | 'error';
  message: string;
  progress: number;
  currentPhase?: number;
  totalPhases?: number;
}

export interface GenerationResult {
  success: boolean;
  program?: GeneratedProgram;
  savedProgram?: { id: string; name: string };
  error?: string;
}

interface UseProgramGenerationOptions {
  onProgress?: (progress: GenerationProgress) => void;
  onComplete?: (result: GenerationResult) => void;
  onError?: (error: string) => void;
}

/**
 * Hook for sequential phase-based program generation.
 * Used by /dashboard/new-program flow.
 * Calls /api/programs/generate/phase for each phase sequentially.
 */
export function useProgramGeneration(options: UseProgramGenerationOptions = {}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress>({
    stage: 'idle',
    message: '',
    progress: 0,
  });
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Store options in a ref to avoid closure issues
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Abort controller for cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (data: {
      profile?: any;
      intakeData?: any;
      context?: {
        generationType?: 'new' | 'similar' | 'new_focus' | 'fresh_start';
        previousPrograms?: any[];
        recentCheckIn?: any;
        modifications?: string;
      };
    }) => {
      // Cancel any in-progress generation
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setIsGenerating(true);
      setError(null);
      setResult(null);
      setProgress({ stage: 'analyzing', message: 'Analyzing your profile...', progress: 5 });
      optionsRef.current.onProgress?.({ stage: 'analyzing', message: 'Analyzing your profile...', progress: 5 });

      try {
        // Get userId from session or create anonymous user
        const sessionResponse = await fetch('/api/auth/session');
        const session = await sessionResponse.json();
        const userId = session?.user?.id;

        if (!userId) {
          throw new Error('Not authenticated');
        }

        // Determine number of phases based on experience level
        const experienceLevel = data.profile?.experienceLevel ||
          data.intakeData?.experienceLevel ||
          'beginner';

        const totalPhases = experienceLevel === 'beginner' ? 1 :
          experienceLevel === 'intermediate' ? 2 : 3;

        const weeksPerPhase = 4;
        const totalWeeks = totalPhases * weeksPerPhase;

        console.log(`[Generation] Starting ${totalPhases}-phase program for ${experienceLevel}`);

        const generatedPhases: ValidatedPhase[] = [];
        let programId: string | null = null;

        // Generate each phase sequentially
        for (let phaseNum = 1; phaseNum <= totalPhases; phaseNum++) {
          if (signal.aborted) {
            throw new Error('Generation cancelled');
          }

          // Calculate progress
          const baseProgress = 10;
          const progressPerPhase = 80 / totalPhases;
          const currentProgress = baseProgress + (phaseNum - 1) * progressPerPhase;

          const progressUpdate: GenerationProgress = {
            stage: 'generating',
            message: `Generating phase ${phaseNum} of ${totalPhases}...`,
            progress: Math.round(currentProgress),
            currentPhase: phaseNum,
            totalPhases,
          };
          setProgress(progressUpdate);
          optionsRef.current.onProgress?.(progressUpdate);

          console.log(`[Generation] Starting phase ${phaseNum}/${totalPhases}`);

          // Simulate progress during API call (updates every 500ms)
          const targetProgress = baseProgress + phaseNum * progressPerPhase - 5; // Stop 5% before completion
          let simulatedProgress = currentProgress;
          const progressInterval = setInterval(() => {
            if (simulatedProgress < targetProgress) {
              simulatedProgress += 3; // Increment by 3% each tick
              const simUpdate: GenerationProgress = {
                stage: 'generating',
                message: `Generating phase ${phaseNum} of ${totalPhases}...`,
                progress: Math.min(Math.round(simulatedProgress), Math.round(targetProgress)),
                currentPhase: phaseNum,
                totalPhases,
              };
              setProgress(simUpdate);
              optionsRef.current.onProgress?.(simUpdate);
            }
          }, 500);

          const response: Response = await fetch('/api/programs/generate/phase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              intakeData: data.intakeData,
              profile: data.profile,
              context: data.context,
              phaseNumber: phaseNum,
              totalPhases,
              previousPhases: generatedPhases,
              programId,
              programName: phaseNum === 1 ? 'Custom Fitness Program' : undefined,
              programDescription: phaseNum === 1 ?
                `A personalized ${totalWeeks}-week fitness program.` : undefined,
            }),
            signal,
          });

          // Clear simulated progress
          clearInterval(progressInterval);

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Phase ${phaseNum} generation failed`);
          }

          const responseData: { success: boolean; phase?: ValidatedPhase; programId?: string; error?: string } = await response.json();

          if (!responseData.success || !responseData.phase) {
            throw new Error(responseData.error || `Phase ${phaseNum} generation failed`);
          }

          // Store programId from first phase
          if (phaseNum === 1 && responseData.programId) {
            programId = responseData.programId;
          }

          generatedPhases.push(responseData.phase);

          console.log(`[Generation] Phase ${phaseNum} complete: ${responseData.phase.name}`);

          // Update progress after phase completes
          const completedProgress = baseProgress + phaseNum * progressPerPhase;
          setProgress({
            stage: 'generating',
            message: `Phase ${phaseNum} complete!`,
            progress: Math.round(completedProgress),
            currentPhase: phaseNum,
            totalPhases,
          });
        }

        // Construct final program
        const goal = data.profile?.trainingGoal || data.intakeData?.trainingGoal || 'fitness';
        // Title case the goal (capitalize each word)
        const capitalizedGoal = goal.split(' ').map((word: string) =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
        const programName = `${capitalizedGoal} Program`;
        const programDescription = `A personalized ${totalWeeks}-week program focused on ${goal}.`;

        // Update program in DB with better name
        if (programId) {
          try {
            await fetch(`/api/programs/${programId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                name: programName,
                description: programDescription,
              }),
            });
          } catch (e) {
            console.warn('Failed to update program name:', e);
          }
        }

        const program: GeneratedProgram = {
          name: programName,
          description: programDescription,
          totalWeeks,
          phases: generatedPhases as any,
        };

        const completeResult: GenerationResult = {
          success: true,
          program,
          savedProgram: programId ? { id: programId, name: programName } : undefined,
        };

        setResult(completeResult);
        setProgress({ stage: 'complete', message: 'Your program is ready!', progress: 100 });
        optionsRef.current.onComplete?.(completeResult);

        console.log(`[Generation] Complete - ${generatedPhases.length} phases, programId: ${programId}`);

      } catch (err) {
        if (signal.aborted) {
          console.log('[Generation] Cancelled by user');
          return;
        }

        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('[Generation] Error:', errorMessage);

        setError(errorMessage);
        setProgress({ stage: 'error', message: errorMessage, progress: 0 });
        optionsRef.current.onError?.(errorMessage);
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsGenerating(false);
    setProgress({ stage: 'idle', message: 'Cancelled', progress: 0 });
  }, []);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsGenerating(false);
    setProgress({ stage: 'idle', message: '', progress: 0 });
    setResult(null);
    setError(null);
  }, []);

  return {
    generate,
    cancel,
    reset,
    isGenerating,
    progress,
    result,
    error,
  };
}
