'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { WorkoutFileResponse, WorkoutFileError } from '@/utils/prompts/workoutFileProcessing';

interface UploadState {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  error?: string;
  result?: WorkoutFileResponse;
}

export function WorkoutFileUpload() {
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
      console.log("🚀 ~ onDrop ~ fileContent:", fileContent)

      setState({ status: 'processing' });

      // Send to API for Claude processing
      const response = await fetch('/api/programs/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: fileContent, fileName: file.name }),
      });

      const data = await response.json();

      if ('error' in data) {
        const error = data as WorkoutFileError;
        throw new Error(error.reason);
      }

      const result = data as WorkoutFileResponse;
      setState({ status: 'success', result });

    } catch (error) {
      setState({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
    }
  }, []);

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
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            {isDragActive
              ? 'Drop the file here...'
              : 'Drag & drop a workout file, or click to select'}
          </p>
          <p className="text-xs text-gray-500">
            Supports PDF and image files
          </p>
        </div>
      </div>

      {/* Status Display */}
      {state.status === 'uploading' && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600">Uploading file...</p>
        </div>
      )}

      {state.status === 'processing' && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600">Processing with Claude...</p>
        </div>
      )}

      {state.status === 'error' && (
        <div className="text-center py-4 text-red-600">
          <p className="text-sm">{state.error}</p>
        </div>
      )}

      {state.status === 'success' && state.result && (
        <div className="space-y-6">
          {/* Program Overview */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <h3 className="font-medium text-green-800">
              Successfully Processed Program
            </h3>
            <div className="mt-2 space-y-2 text-sm text-green-700">
              <p><span className="font-medium">Name:</span> {state.result.program.name}</p>
              <p><span className="font-medium">Description:</span> {state.result.program.description}</p>
              <p><span className="font-medium">Workouts:</span> {state.result.workouts.length}</p>
              <p><span className="font-medium">Days per week:</span> {state.result.workoutPlan.daysPerWeek}</p>
            </div>
          </div>

          {/* Workout Plan Details */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h4 className="font-medium text-gray-800">Workout Plan</h4>
            <div className="mt-2 space-y-2 text-sm">
              <p><span className="font-medium">Split Type:</span> {state.result.workoutPlan.splitType}</p>
              <p><span className="font-medium">Phase:</span> {state.result.workoutPlan.phase}</p>
              <div className="mt-2">
                <p className="font-medium">Phase Key Points:</p>
                <ul className="list-disc pl-5 mt-1">
                  {state.result.workoutPlan.phaseKeyPoints.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Individual Workouts */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">Workouts</h4>
            {state.result.workouts.map((workout, i) => (
              <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex justify-between items-start">
                  <h5 className="font-medium">{workout.name}</h5>
                  <span className="text-sm text-gray-500">Day {workout.dayNumber}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{workout.focus}</p>
                
                {/* Exercises */}
                <div className="mt-4 space-y-3">
                  {workout.exercises.map((exercise, j) => (
                    <div key={j} className="text-sm border-l-2 border-gray-200 pl-3">
                      <div className="flex justify-between">
                        <span className="font-medium">{exercise.name}</span>
                        <span className="text-gray-500">{exercise.category}</span>
                      </div>
                      <div className="text-gray-600 space-y-1 mt-1">
                        <p>Sets: {exercise.sets}</p>
                        <p>
                          {exercise.measure.type}: {exercise.measure.value}
                          {exercise.measure.unit ? ` ${exercise.measure.unit}` : ''}
                        </p>
                        <p>Rest: {exercise.restPeriod}s</p>
                        {exercise.notes && (
                          <p className="text-gray-500 italic">{exercise.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Raw JSON for Development */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="font-medium text-gray-800 mb-2">Raw Response (Development Only)</h4>
            <pre className="text-xs overflow-auto max-h-96">
              {JSON.stringify(state.result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
} 