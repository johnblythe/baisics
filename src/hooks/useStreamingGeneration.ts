import { useState, useCallback, useRef } from 'react';

// Import validated phase type from schema
import type { ValidatedPhase } from '@/services/programGeneration/schema';

export interface GenerationProgress {
  stage: 'idle' | 'analyzing' | 'generating' | 'processing' | 'validating' | 'saving' | 'complete' | 'error';
  message: string;
  progress: number;
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

  const generate = useCallback(async (params: {
    userId: string;
    intakeData?: any;
    profile?: any;
    context?: any;
  }) => {
    setIsGenerating(true);
    setProgress({ stage: 'analyzing', message: 'Starting...', progress: 5 });
    setResult(null);
    setPhases([]);
    setProgramMeta(null);

    try {
      const response = await fetch('/api/programs/generate/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Generation failed');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      console.log('[SSE] Starting stream reader loop');

      while (true) {
        const { done, value } = await reader.read();
        console.log('[SSE] Read chunk, done:', done, 'size:', value?.length || 0);
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE events are separated by double newlines
        const events = buffer.split('\n\n');
        // Keep the last part (might be incomplete)
        buffer = events.pop() || '';

        console.log('[SSE] Parsed events:', events.length, 'remaining buffer:', buffer.length);

        for (const eventBlock of events) {
          if (!eventBlock.trim()) continue;

          const lines = eventBlock.split('\n');
          let eventType = '';
          let eventData = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              eventData = line.slice(6);
            }
          }

          if (!eventType || !eventData) continue;

          try {
            const data = JSON.parse(eventData);
            console.log(`[SSE] Event: ${eventType}`, eventType === 'phase' ? `Phase ${data.phaseNumber}` : data);

            if (eventType === 'progress') {
              const progressUpdate: GenerationProgress = {
                stage: data.stage,
                message: data.message,
                progress: data.progress,
              };
              setProgress(progressUpdate);
              optionsRef.current.onProgress?.(progressUpdate);
            } else if (eventType === 'phase') {
              // New phase received
              const phase = data.phase as ValidatedPhase;
              const phaseNumber = data.phaseNumber;
              const totalPhases = data.totalPhases;

              console.log(`[SSE] Setting phase ${phaseNumber}:`, phase.name);
              setPhases(prev => {
                // Avoid duplicates
                if (prev.some(p => p.phaseNumber === phaseNumber)) {
                  return prev;
                }
                const newPhases = [...prev, phase];
                console.log(`[SSE] Phases now:`, newPhases.length);
                return newPhases;
              });

              optionsRef.current.onPhase?.(phase, phaseNumber, totalPhases);
            } else if (eventType === 'program_meta') {
              // Program metadata received
              const meta: ProgramMeta = {
                name: data.name,
                description: data.description,
                totalWeeks: data.totalWeeks,
              };
              console.log(`[SSE] Setting program meta:`, meta.name);
              setProgramMeta(meta);
              optionsRef.current.onProgramMeta?.(meta);
            } else if (eventType === 'complete') {
              const completeResult: StreamingGenerationResult = {
                success: true,
                program: data.program,
                savedProgram: data.savedProgram,
              };
              setResult(completeResult);
              setProgress({ stage: 'complete', message: 'Done!', progress: 100 });
              optionsRef.current.onComplete?.(completeResult);
            } else if (eventType === 'error') {
              const errorResult: StreamingGenerationResult = {
                success: false,
                error: data.error,
              };
              setResult(errorResult);
              setProgress({ stage: 'error', message: data.error, progress: 0 });
              optionsRef.current.onError?.(data.error);
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e, eventData.slice(0, 100));
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';
      setProgress({ stage: 'error', message: errorMessage, progress: 0 });
      setResult({ success: false, error: errorMessage });
      optionsRef.current.onError?.(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, []); // No dependencies - use optionsRef for callbacks

  const reset = useCallback(() => {
    setIsGenerating(false);
    setProgress({ stage: 'idle', message: '', progress: 0 });
    setResult(null);
    setPhases([]);
    setProgramMeta(null);
  }, []);

  return {
    generate,
    reset,
    isGenerating,
    progress,
    result,
    phases,
    programMeta,
  };
}
