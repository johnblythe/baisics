import { useState, useCallback } from 'react';
import type { GeneratedProgram } from '@/services/programGeneration/types';

export interface GenerationProgress {
  stage: 'idle' | 'analyzing' | 'generating' | 'processing' | 'validating' | 'saving' | 'complete' | 'error';
  message: string;
  progress: number;
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

export function useProgramGeneration(options: UseProgramGenerationOptions = {}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress>({
    stage: 'idle',
    message: '',
    progress: 0,
  });
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setIsGenerating(true);
      setError(null);
      setResult(null);
      setProgress({ stage: 'idle', message: 'Starting...', progress: 0 });

      try {
        const response = await fetch('/api/programs/generate/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to start generation');
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response stream available');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete events from buffer
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          let currentEvent = '';
          for (const line of lines) {
            if (line.startsWith('event: ')) {
              currentEvent = line.slice(7);
            } else if (line.startsWith('data: ') && currentEvent) {
              try {
                const eventData = JSON.parse(line.slice(6));

                switch (currentEvent) {
                  case 'progress':
                    const newProgress: GenerationProgress = {
                      stage: eventData.stage,
                      message: eventData.message,
                      progress: eventData.progress,
                    };
                    setProgress(newProgress);
                    options.onProgress?.(newProgress);
                    break;

                  case 'complete':
                    const completeResult: GenerationResult = {
                      success: true,
                      program: eventData.program,
                      savedProgram: eventData.savedProgram,
                    };
                    setResult(completeResult);
                    setProgress({ stage: 'complete', message: 'Your program is ready!', progress: 100 });
                    options.onComplete?.(completeResult);
                    break;

                  case 'error':
                    const errorMessage = eventData.error || 'Generation failed';
                    setError(errorMessage);
                    setProgress({ stage: 'error', message: errorMessage, progress: 0 });
                    options.onError?.(errorMessage);
                    break;
                }
              } catch (parseError) {
                console.error('Failed to parse SSE data:', parseError);
              }
              currentEvent = '';
            }
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setProgress({ stage: 'error', message: errorMessage, progress: 0 });
        options.onError?.(errorMessage);
      } finally {
        setIsGenerating(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setIsGenerating(false);
    setProgress({ stage: 'idle', message: '', progress: 0 });
    setResult(null);
    setError(null);
  }, []);

  return {
    generate,
    reset,
    isGenerating,
    progress,
    result,
    error,
  };
}
