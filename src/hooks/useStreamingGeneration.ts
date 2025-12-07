import { useState, useCallback } from 'react';
import { Program } from '@/types';

export interface GenerationProgress {
  stage: 'idle' | 'analyzing' | 'generating' | 'processing' | 'validating' | 'saving' | 'complete' | 'error';
  message: string;
  progress: number;
}

export interface StreamingGenerationResult {
  success: boolean;
  program?: any;
  savedProgram?: { id: string; name: string };
  error?: string;
}

interface UseStreamingGenerationOptions {
  onProgress?: (progress: GenerationProgress) => void;
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

  const generate = useCallback(async (params: {
    userId: string;
    intakeData?: any;
    profile?: any;
    context?: any;
  }) => {
    setIsGenerating(true);
    setProgress({ stage: 'analyzing', message: 'Starting...', progress: 5 });
    setResult(null);

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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        let eventType = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7);
          } else if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (eventType === 'progress') {
                const progressUpdate: GenerationProgress = {
                  stage: data.stage,
                  message: data.message,
                  progress: data.progress,
                };
                setProgress(progressUpdate);
                options.onProgress?.(progressUpdate);
              } else if (eventType === 'complete') {
                const completeResult: StreamingGenerationResult = {
                  success: true,
                  program: data.program,
                  savedProgram: data.savedProgram,
                };
                setResult(completeResult);
                setProgress({ stage: 'complete', message: 'Done!', progress: 100 });
                options.onComplete?.(completeResult);
              } else if (eventType === 'error') {
                const errorResult: StreamingGenerationResult = {
                  success: false,
                  error: data.error,
                };
                setResult(errorResult);
                setProgress({ stage: 'error', message: data.error, progress: 0 });
                options.onError?.(data.error);
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';
      setProgress({ stage: 'error', message: errorMessage, progress: 0 });
      setResult({ success: false, error: errorMessage });
      options.onError?.(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setIsGenerating(false);
    setProgress({ stage: 'idle', message: '', progress: 0 });
    setResult(null);
  }, []);

  return {
    generate,
    reset,
    isGenerating,
    progress,
    result,
  };
}
