'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/app/components/layouts/MainLayout';
import { Upload, FileText, ArrowRight, X, GripVertical, Plus, Mail, Check, Trash2, Edit2, ChevronDown, ChevronUp } from 'lucide-react';

// Types for parsed program
interface ParsedExercise {
  name: string;
  sets: number;
  reps?: number;
  restPeriod?: number;
  notes?: string;
  measure?: {
    type: string;
    value: number;
    unit?: string;
  };
}

interface ParsedWorkout {
  name: string;
  dayNumber: number;
  focus?: string;
  exercises: ParsedExercise[];
}

interface ParsedProgram {
  program?: {
    name: string;
    description?: string;
  };
  workouts?: ParsedWorkout[];
}

type PageState = 'upload' | 'processing' | 'preview' | 'auth' | 'saving' | 'success';

export default function ImportPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [pageState, setPageState] = useState<PageState>('upload');
  const [error, setError] = useState<string | null>(null);
  const [parsedProgram, setParsedProgram] = useState<ParsedProgram | null>(null);
  const [programName, setProgramName] = useState('');
  const [email, setEmail] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [savedProgramId, setSavedProgramId] = useState<string | null>(null);
  const [expandedWorkout, setExpandedWorkout] = useState<number | null>(0);
  const [editingExercise, setEditingExercise] = useState<{ wIdx: number; eIdx: number } | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    setPageState('processing');

    try {
      // Read file as base64
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Send to API for parsing (no auth required for preview)
      const response = await fetch('/api/programs/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: fileContent,
          fileName: file.name,
          autoSave: false,
          allowGuest: true // Flag to allow unauthenticated parsing
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.reason || 'Failed to parse file');
      }

      setParsedProgram(data.parsed);
      setProgramName(data.parsed?.program?.name || 'Imported Program');
      setPageState('preview');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
      setPageState('upload');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleSave = async () => {
    // If not authenticated, show auth form
    if (!session) {
      setPageState('auth');
      return;
    }

    // If authenticated, save directly
    await saveProgram();
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsAuthLoading(true);
    try {
      // Sign in with email - this will redirect to verify page
      // We'll store the program data in sessionStorage to recover after auth
      sessionStorage.setItem('pendingImport', JSON.stringify({
        parsedProgram,
        programName
      }));

      await signIn('email', {
        email: email.toLowerCase().trim(),
        callbackUrl: '/import?complete=true'
      });
    } catch (err) {
      setError('Failed to send magic link. Please try again.');
      setIsAuthLoading(false);
    }
  };

  const saveProgram = async () => {
    if (!parsedProgram) return;

    setPageState('saving');
    try {
      const response = await fetch('/api/programs/import/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parsed: {
            ...parsedProgram,
            program: { ...parsedProgram.program, name: programName }
          }
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.reason || 'Failed to save program');
      }

      setSavedProgramId(data.program.id);
      setPageState('success');

      // Redirect after brief delay
      setTimeout(() => {
        router.push(`/program/${data.program.id}`);
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save program');
      setPageState('preview');
    }
  };

  const handleStartOver = () => {
    setParsedProgram(null);
    setProgramName('');
    setError(null);
    setPageState('upload');
  };

  const updateExercise = (wIdx: number, eIdx: number, updates: Partial<ParsedExercise>) => {
    if (!parsedProgram?.workouts) return;

    const newWorkouts = [...parsedProgram.workouts];
    newWorkouts[wIdx] = {
      ...newWorkouts[wIdx],
      exercises: newWorkouts[wIdx].exercises.map((ex, i) =>
        i === eIdx ? { ...ex, ...updates } : ex
      )
    };
    setParsedProgram({ ...parsedProgram, workouts: newWorkouts });
  };

  const deleteExercise = (wIdx: number, eIdx: number) => {
    if (!parsedProgram?.workouts) return;

    const newWorkouts = [...parsedProgram.workouts];
    newWorkouts[wIdx] = {
      ...newWorkouts[wIdx],
      exercises: newWorkouts[wIdx].exercises.filter((_, i) => i !== eIdx)
    };
    setParsedProgram({ ...parsedProgram, workouts: newWorkouts });
    setEditingExercise(null);
  };

  const addExercise = (wIdx: number) => {
    if (!parsedProgram?.workouts) return;

    const newWorkouts = [...parsedProgram.workouts];
    newWorkouts[wIdx] = {
      ...newWorkouts[wIdx],
      exercises: [
        ...newWorkouts[wIdx].exercises,
        { name: 'New Exercise', sets: 3, reps: 10 }
      ]
    };
    setParsedProgram({ ...parsedProgram, workouts: newWorkouts });
    setEditingExercise({ wIdx, eIdx: newWorkouts[wIdx].exercises.length - 1 });
  };

  const moveExercise = (wIdx: number, eIdx: number, direction: 'up' | 'down') => {
    if (!parsedProgram?.workouts) return;

    const exercises = [...parsedProgram.workouts[wIdx].exercises];
    const newIdx = direction === 'up' ? eIdx - 1 : eIdx + 1;
    if (newIdx < 0 || newIdx >= exercises.length) return;

    [exercises[eIdx], exercises[newIdx]] = [exercises[newIdx], exercises[eIdx]];

    const newWorkouts = [...parsedProgram.workouts];
    newWorkouts[wIdx] = { ...newWorkouts[wIdx], exercises };
    setParsedProgram({ ...parsedProgram, workouts: newWorkouts });
  };

  // Check for returning from auth
  useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('complete') === 'true' && session) {
        const pending = sessionStorage.getItem('pendingImport');
        if (pending) {
          try {
            const { parsedProgram: saved, programName: name } = JSON.parse(pending);
            setParsedProgram(saved);
            setProgramName(name);
            sessionStorage.removeItem('pendingImport');
            // Auto-save after auth
            setPageState('preview');
            setTimeout(() => saveProgram(), 100);
          } catch {
            // Ignore parse errors
          }
        }
      }
    }
  });

  return (
    <MainLayout>
      <div className="bg-[#F8FAFC] min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* STATE: UPLOAD */}
        {pageState === 'upload' && (
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-4">
              Turn Any Workout Into a Trackable Program
            </h1>
            <p className="text-lg text-[#475569] mb-8 max-w-2xl mx-auto">
              Upload your PDF or Word document and we&apos;ll extract the exercises, sets, and reps automatically.
            </p>

            <div
              {...getRootProps()}
              className={`
                max-w-xl mx-auto border-2 border-dashed rounded-2xl p-12 cursor-pointer
                transition-all duration-200
                ${isDragActive
                  ? 'border-[#FF6B6B] bg-[#FFE5E5]'
                  : 'border-[#E2E8F0] bg-white hover:border-[#FF6B6B] hover:bg-[#FFF5F5]'
                }
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center
                  ${isDragActive ? 'bg-[#FF6B6B]' : 'bg-[#F1F5F9]'}
                `}>
                  <Upload className={`w-8 h-8 ${isDragActive ? 'text-white' : 'text-[#64748B]'}`} />
                </div>
                <div>
                  <p className="text-lg font-medium text-[#0F172A]">
                    {isDragActive ? 'Drop your file here' : 'Drop your PDF or Word doc here'}
                  </p>
                  <p className="text-sm text-[#64748B] mt-1">
                    or click to browse
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                  <FileText className="w-4 h-4" />
                  <span>Supports PDF, DOCX</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="max-w-xl mx-auto mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto text-left">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FFE5E5] flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-[#FF6B6B]" />
                </div>
                <div>
                  <p className="font-medium text-[#0F172A] text-sm">AI-Powered</p>
                  <p className="text-xs text-[#64748B]">Extracts exercises automatically</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FFE5E5] flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-[#FF6B6B]" />
                </div>
                <div>
                  <p className="font-medium text-[#0F172A] text-sm">Edit Before Saving</p>
                  <p className="text-xs text-[#64748B]">Review and customize</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FFE5E5] flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-[#FF6B6B]" />
                </div>
                <div>
                  <p className="font-medium text-[#0F172A] text-sm">Track Progress</p>
                  <p className="text-xs text-[#64748B]">Log workouts instantly</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STATE: PROCESSING */}
        {pageState === 'processing' && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#FFE5E5] flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-[#FF6B6B] border-t-transparent rounded-full animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A] mb-2">
              Analyzing your program...
            </h2>
            <p className="text-[#64748B]">
              This usually takes 10-20 seconds
            </p>
          </div>
        )}

        {/* STATE: PREVIEW */}
        {pageState === 'preview' && parsedProgram && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#0F172A]">Preview Your Program</h2>
              <button
                onClick={handleStartOver}
                className="text-sm text-[#64748B] hover:text-[#0F172A] flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Start Over
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Program Name */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-6">
              <label className="block text-sm font-medium text-[#475569] mb-2">
                Program Name
              </label>
              <input
                type="text"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[#0F172A] focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] transition-colors"
              />
            </div>

            {/* Workouts */}
            <div className="space-y-4">
              {parsedProgram.workouts?.map((workout, wIdx) => (
                <div key={wIdx} className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                  <button
                    onClick={() => setExpandedWorkout(expandedWorkout === wIdx ? null : wIdx)}
                    className="w-full px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between hover:bg-[#F1F5F9] transition-colors"
                  >
                    <div className="text-left">
                      <h3 className="font-semibold text-[#0F172A]">
                        Day {workout.dayNumber}: {workout.name}
                      </h3>
                      {workout.focus && (
                        <p className="text-sm text-[#64748B]">{workout.focus}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[#94A3B8]">
                        {workout.exercises.length} exercises
                      </span>
                      {expandedWorkout === wIdx ? (
                        <ChevronUp className="w-5 h-5 text-[#64748B]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[#64748B]" />
                      )}
                    </div>
                  </button>
                  {expandedWorkout === wIdx && (
                    <>
                      <div className="divide-y divide-[#F1F5F9]">
                        {workout.exercises.map((exercise, eIdx) => {
                          const isEditing = editingExercise?.wIdx === wIdx && editingExercise?.eIdx === eIdx;

                          return (
                            <div key={eIdx} className="px-6 py-4">
                              {isEditing ? (
                                <div className="space-y-3">
                                  <input
                                    type="text"
                                    value={exercise.name}
                                    onChange={(e) => updateExercise(wIdx, eIdx, { name: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-[#0F172A] focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B]"
                                    placeholder="Exercise name"
                                    autoFocus
                                  />
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                      <label className="text-sm text-[#64748B]">Sets</label>
                                      <input
                                        type="number"
                                        min={1}
                                        value={exercise.sets}
                                        onChange={(e) => updateExercise(wIdx, eIdx, { sets: parseInt(e.target.value) || 1 })}
                                        className="w-16 px-3 py-2 rounded-lg border border-[#E2E8F0] text-[#0F172A] text-center focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B]"
                                      />
                                    </div>
                                    <span className="text-[#94A3B8]">×</span>
                                    <div className="flex items-center gap-2">
                                      <label className="text-sm text-[#64748B]">Reps</label>
                                      <input
                                        type="number"
                                        min={1}
                                        value={exercise.reps || exercise.measure?.value || ''}
                                        onChange={(e) => updateExercise(wIdx, eIdx, { reps: parseInt(e.target.value) || undefined })}
                                        className="w-16 px-3 py-2 rounded-lg border border-[#E2E8F0] text-[#0F172A] text-center focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B]"
                                        placeholder="10"
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <label className="text-sm text-[#64748B]">Rest (s)</label>
                                      <input
                                        type="number"
                                        min={0}
                                        value={exercise.restPeriod || ''}
                                        onChange={(e) => updateExercise(wIdx, eIdx, { restPeriod: parseInt(e.target.value) || undefined })}
                                        className="w-20 px-3 py-2 rounded-lg border border-[#E2E8F0] text-[#0F172A] text-center focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B]"
                                        placeholder="60"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between pt-2">
                                    <button
                                      onClick={() => deleteExercise(wIdx, eIdx)}
                                      className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Delete
                                    </button>
                                    <button
                                      onClick={() => setEditingExercise(null)}
                                      className="px-4 py-2 text-sm font-medium text-white bg-[#FF6B6B] rounded-lg hover:bg-[#EF5350] transition-colors"
                                    >
                                      Done
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-4">
                                  <div className="flex flex-col gap-1">
                                    <button
                                      onClick={() => moveExercise(wIdx, eIdx, 'up')}
                                      disabled={eIdx === 0}
                                      className="p-1 text-[#94A3B8] hover:text-[#64748B] disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                      <ChevronUp className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => moveExercise(wIdx, eIdx, 'down')}
                                      disabled={eIdx === workout.exercises.length - 1}
                                      className="p-1 text-[#94A3B8] hover:text-[#64748B] disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                      <ChevronDown className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-[#0F172A] truncate">{exercise.name}</p>
                                    {exercise.notes && (
                                      <p className="text-xs text-[#94A3B8] truncate mt-0.5">{exercise.notes}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-[#64748B]">
                                    <span>{exercise.sets} × {exercise.reps || exercise.measure?.value || '?'}</span>
                                    {exercise.restPeriod && (
                                      <span>{exercise.restPeriod}s rest</span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => setEditingExercise({ wIdx, eIdx })}
                                    className="p-2 text-[#94A3B8] hover:text-[#64748B] hover:bg-[#F1F5F9] rounded-lg transition-colors"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="px-6 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0]">
                        <button
                          onClick={() => addExercise(wIdx)}
                          className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#FF6B6B] transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add exercise
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E2E8F0]">
              <button
                onClick={handleStartOver}
                className="px-6 py-3 text-[#64748B] hover:text-[#0F172A] font-medium transition-colors"
              >
                Start Over
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 bg-[#FF6B6B] text-white font-semibold rounded-xl hover:bg-[#EF5350] transition-colors shadow-lg shadow-[#FF6B6B]/25"
              >
                Save & Start Tracking
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STATE: AUTH */}
        {pageState === 'auth' && (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-lg p-8">
              <div className="w-16 h-16 mx-auto bg-[#0F172A] rounded-2xl flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-white" />
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#0F172A] mb-2">
                  Save your program
                </h2>
                <p className="text-[#475569]">
                  Enter your email to save and track your workouts
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#475569] mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[#0F172A] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] transition-colors"
                    placeholder="you@example.com"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAuthLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#FF6B6B] text-white font-semibold hover:bg-[#EF5350] transition-colors shadow-lg shadow-[#FF6B6B]/25 disabled:opacity-50"
                >
                  {isAuthLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending link...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue with Email</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[#94A3B8]">
                No password needed. We&apos;ll send you a secure link.
              </p>

              <button
                onClick={() => setPageState('preview')}
                className="mt-4 w-full text-center text-sm text-[#64748B] hover:text-[#0F172A]"
              >
                ← Back to preview
              </button>
            </div>
          </div>
        )}

        {/* STATE: SAVING */}
        {pageState === 'saving' && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#FFE5E5] flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-[#FF6B6B] border-t-transparent rounded-full animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A] mb-2">
              Saving your program...
            </h2>
          </div>
        )}

        {/* STATE: SUCCESS */}
        {pageState === 'success' && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A] mb-2">
              Program saved!
            </h2>
            <p className="text-[#64748B]">
              Redirecting to your program...
            </p>
          </div>
        )}
        </div>
      </div>
    </MainLayout>
  );
}
