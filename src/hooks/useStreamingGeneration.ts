import { useState, useCallback, useRef } from 'react';

// Import validated phase type from schema
import type { ValidatedPhase } from '@/services/programGeneration/schema';

export interface GenerationProgress {
  stage: 'idle' | 'analyzing' | 'generating' | 'processing' | 'validating' | 'saving' | 'complete' | 'error';
  message: string;
  progress: number;
  currentPhase?: number;
  totalPhases?: number;
}

export interface ProgramMeta {
  name: string;
  description: string;
  totalWeeks: number;
}

export interface StreamingGenerationResult {
  success: boolean;
  program?: any;
  savedProgram?: { id: string; name: string };
  error?: string;
}

interface UseStreamingGenerationOptions {
  onProgress?: (progress: GenerationProgress) => void;
  onPhase?: (phase: ValidatedPhase, phaseNumber: number, totalPhases: number) => void;
  onProgramMeta?: (meta: ProgramMeta) => void;
  onComplete?: (result: StreamingGenerationResult) => void;
  onError?: (error: string) => void;
}

/**
 * Hook for sequential phase-based program generation.
 * Calls /api/programs/generate/phase for each phase sequentially.
 * Each call is <60s, avoiding Vercel timeout issues.
 */
export function useStreamingGeneration(options: UseStreamingGenerationOptions = {}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress>({
    stage: 'idle',
    message: '',
    progress: 0,
  });
  const [result, setResult] = useState<StreamingGenerationResult | null>(null);
  const [phases, setPhases] = useState<ValidatedPhase[]>([]);
  const [programMeta, setProgramMeta] = useState<ProgramMeta | null>(null);

  // Store options in a ref to avoid closure issues with useCallback
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Abort controller for cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (params: {
    userId: string;
    intakeData?: any;
    profile?: any;
    context?: any;
  }) => {
    // Cancel any in-progress generation
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsGenerating(true);
    setProgress({ stage: 'analyzing', message: 'Analyzing your profile...', progress: 5 });
    setResult(null);
    setPhases([]);
    setProgramMeta(null);

    try {
      // Determine number of phases based on experience level
      const experienceLevel = params.profile?.experienceLevel ||
        params.intakeData?.experienceLevel ||
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

        // Calculate progress (each phase is equal portion of 10-90%)
        const baseProgress = 10;
        const progressPerPhase = 80 / totalPhases;
        const currentProgress = baseProgress + (phaseNum - 1) * progressPerPhase;

        setProgress({
          stage: 'generating',
          message: `Generating phase ${phaseNum} of ${totalPhases}...`,
          progress: Math.round(currentProgress),
          currentPhase: phaseNum,
          totalPhases,
        });
        optionsRef.current.onProgress?.({
          stage: 'generating',
          message: `Generating phase ${phaseNum} of ${totalPhases}...`,
          progress: Math.round(currentProgress),
          currentPhase: phaseNum,
          totalPhases,
        });

        console.log(`[Generation] Starting phase ${phaseNum}/${totalPhases}`);

        // Simulate progress during API call (updates every 500ms)
        const targetProgress = baseProgress + phaseNum * progressPerPhase - 5;
        let simulatedProgress = currentProgress;
        const progressInterval = setInterval(() => {
          if (simulatedProgress < targetProgress) {
            simulatedProgress += 3;
            const simUpdate = {
              stage: 'generating' as const,
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
            userId: params.userId,
            intakeData: params.intakeData,
            profile: params.profile,
            context: params.context,
            phaseNumber: phaseNum,
            totalPhases,
            previousPhases: generatedPhases,
            programId, // Pass existing programId for phases 2+
            programName: phaseNum === 1 ? 'Custom Fitness Program' : undefined,
            programDescription: phaseNum === 1 ?
              `A personalized ${totalWeeks}-week fitness program.` : undefined,
          }),
          signal,
        });

        // Clear simulated progress
        clearInterval(progressInterval);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || `Phase ${phaseNum} generation failed`);
        }

        const data: { success: boolean; phase?: ValidatedPhase; programId?: string; error?: string } = await response.json();

        if (!data.success || !data.phase) {
          throw new Error(data.error || `Phase ${phaseNum} generation failed`);
        }

        // Store programId from first phase
        if (phaseNum === 1 && data.programId) {
          programId = data.programId;
        }

        const phase = data.phase;
        generatedPhases.push(phase);

        // Update state with new phase
        setPhases(prev => [...prev, phase]);

        // Notify callback
        optionsRef.current.onPhase?.(phase, phaseNum, totalPhases);

        console.log(`[Generation] Phase ${phaseNum} complete: ${phase.name}`);

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

      // All phases generated - construct final program
      const meta: ProgramMeta = {
        name: 'Custom Fitness Program',
        description: `A personalized ${totalWeeks}-week fitness program designed for your goals.`,
        totalWeeks,
      };
      setProgramMeta(meta);
      optionsRef.current.onProgramMeta?.(meta);

      // Update program name based on goal if available
      if (programId) {
        const goal = params.profile?.trainingGoal || params.intakeData?.trainingGoal || 'fitness';
        // Title case the goal (capitalize each word)
        const capitalizedGoal = goal.split(' ').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
        meta.name = `${capitalizedGoal} Program`;
        meta.description = `A personalized ${totalWeeks}-week program focused on ${goal}.`;

        // Update program in DB with better name
        try {
          await fetch(`/api/programs/${programId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: params.userId,
              name: meta.name,
              description: meta.description,
            }),
          });
        } catch (e) {
          // Non-critical, continue
          console.warn('Failed to update program name:', e);
        }
      }

      // Construct complete program object
      const program = {
        name: meta.name,
        description: meta.description,
        totalWeeks,
        phases: generatedPhases,
      };

      const completeResult: StreamingGenerationResult = {
        success: true,
        program,
        savedProgram: programId ? { id: programId, name: meta.name } : undefined,
      };

      setResult(completeResult);
      setProgress({ stage: 'complete', message: 'Your program is ready!', progress: 100 });
      optionsRef.current.onComplete?.(completeResult);

      console.log(`[Generation] Complete - ${generatedPhases.length} phases, programId: ${programId}`);

    } catch (error) {
      if (signal.aborted) {
        console.log('[Generation] Cancelled by user');
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'Generation failed';
      console.error('[Generation] Error:', errorMessage);

      setProgress({ stage: 'error', message: errorMessage, progress: 0 });
      setResult({ success: false, error: errorMessage });
      optionsRef.current.onError?.(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, []);

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
    setPhases([]);
    setProgramMeta(null);
  }, []);

  return {
    generate,
    cancel,
    reset,
    isGenerating,
    progress,
    result,
    phases,
    programMeta,
  };
}
