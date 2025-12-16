'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { WorkoutFileResponse, WorkoutFileError } from '@/utils/prompts/workoutFileProcessing';

interface UploadState {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  error?: string;
  result?: {
    parsed: WorkoutFileResponse;
    file: string;
    fileName: string;
  };
}

interface WorkoutFileUploadProps {
  onSuccess?: (result: WorkoutFileResponse & { file: string; fileName: string }) => void;
  className?: string;
}

export function WorkoutFileUpload({ onSuccess, className = '' }: WorkoutFileUploadProps) {
  const [state, setState] = useState<UploadState>({ status: 'idle' });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setState({ status: 'uploading' });

      // Read any file as base64
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setState({ status: 'processing' });

      // Send to API for Claude processing
      const response = await fetch('/api/programs/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          file: fileContent, 
          fileName: file.name,
          autoSave: false // Never auto-save, we'll handle that in the modal
        }),
      });

      const data = await response.json();

      if ('error' in data) {
        const error = data as WorkoutFileError;
        throw new Error(error.reason);
      }

      setState({ 
        status: 'success', 
        result: {
          parsed: data.parsed,
          file: fileContent,
          fileName: file.name
        }
      });
      
      if (onSuccess) {
        onSuccess({
          ...data.parsed,
          file: fileContent,
          fileName: file.name
        });
      }

    } catch (error) {
      setState({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
    }
  }, [onSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {isDragActive
              ? 'Drop the file here...'
              : 'Drag & drop a workout file, or click to select'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Supports PDF and image files
          </p>
        </div>
      </div>

      {/* Status Display */}
      {state.status === 'uploading' && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[#FF6B6B] dark:border-[#FF6B6B] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-600 dark:text-gray-300">Uploading file...</p>
          </div>
        </div>
      )}

      {state.status === 'processing' && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[#FF6B6B] dark:border-[#FF6B6B] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-600 dark:text-gray-300">Processing file...</p>
          </div>
        </div>
      )}

      {state.status === 'error' && (
        <div className="text-center py-4 text-red-600 dark:text-red-400">
          <p className="text-sm">{state.error}</p>
        </div>
      )}
    </div>
  );
} 