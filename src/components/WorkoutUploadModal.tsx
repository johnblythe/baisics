'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { WorkoutFileUpload } from './WorkoutFileUpload';
import { WorkoutFileResponse } from '@/utils/prompts/workoutFileProcessing';
import { useRouter } from 'next/navigation';

interface WorkoutUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadedProgram extends WorkoutFileResponse {
  file: string;
  fileName: string;
}

export function WorkoutUploadModal({ isOpen, onClose }: WorkoutUploadModalProps) {
  const router = useRouter();
  const [uploadedProgram, setUploadedProgram] = useState<UploadedProgram | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = (result: UploadedProgram) => {
    setUploadedProgram(result);
    setError(null);
  };

  const handleSave = async () => {
    if (!uploadedProgram) return;

    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch('/api/programs/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          file: uploadedProgram.file,
          fileName: uploadedProgram.fileName,
          autoSave: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save program');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.reason || 'Failed to save program');
      }

      router.refresh(); // Refresh the page data
      onClose();
    } catch (error) {
      console.error('Error saving program:', error);
      setError(error instanceof Error ? error.message : 'Failed to save program');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setUploadedProgram(null);
    setError(null);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                  {uploadedProgram ? 'Review Program' : 'Upload Program'}
                </Dialog.Title>

                {!uploadedProgram ? (
                  <WorkoutFileUpload 
                    onSuccess={handleSuccess}
                    className="mb-6"
                  />
                ) : (
                  <div className="space-y-6">
                    {/* Program Overview */}
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Program Overview</h4>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <p><span className="font-medium">Name:</span> {uploadedProgram.program.name}</p>
                        <p><span className="font-medium">Description:</span> {uploadedProgram.program.description}</p>
                        <p><span className="font-medium">Total Workouts:</span> {uploadedProgram.workouts.length}</p>
                        <p><span className="font-medium">Days per Week:</span> {uploadedProgram.workoutPlan.daysPerWeek}</p>
                      </div>
                    </div>

                    {/* Workout Plan Details */}
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Workout Plan</h4>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <p><span className="font-medium">Split Type:</span> {uploadedProgram.workoutPlan.splitType}</p>
                        <p><span className="font-medium">Phase:</span> {uploadedProgram.workoutPlan.phase}</p>
                        <div className="mt-3">
                          <p className="font-medium mb-2">Phase Key Points:</p>
                          <ul className="list-disc pl-5 space-y-1">
                            {uploadedProgram.workoutPlan.phaseKeyPoints.map((point, i) => (
                              <li key={i}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Individual Workouts */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">Workouts</h4>
                      {uploadedProgram.workouts.map((workout, i) => (
                        <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
                          <div className="flex justify-between items-start">
                            <h5 className="font-medium text-gray-900 dark:text-white">{workout.name}</h5>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Day {workout.dayNumber}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{workout.focus}</p>
                          
                          {/* Exercises */}
                          <div className="mt-4 space-y-3">
                            {workout.exercises.map((exercise, j) => (
                              <div key={j} className="text-sm border-l-2 border-gray-200 dark:border-gray-600 pl-3">
                                <div className="flex justify-between">
                                  <span className="font-medium text-gray-900 dark:text-white">{exercise.name}</span>
                                  <span className="text-gray-500 dark:text-gray-400">{exercise.category}</span>
                                </div>
                                <div className="text-gray-600 dark:text-gray-300 space-y-1 mt-1">
                                  <p>Sets: {exercise.sets}</p>
                                  <p>
                                    {exercise.measure.type}: {exercise.measure.value}
                                    {exercise.measure.unit ? ` ${exercise.measure.unit}` : ''}
                                  </p>
                                  <p>Rest: {exercise.restPeriod}s</p>
                                  {exercise.notes && (
                                    <p className="text-gray-500 dark:text-gray-400 italic">{exercise.notes}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {error && (
                      <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-4 text-sm text-red-600 dark:text-red-400">
                        {error}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Program'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 