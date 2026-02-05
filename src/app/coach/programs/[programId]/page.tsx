'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/app/components/layouts/MainLayout';
import { ArrowLeft, Tag, Users, Loader2, BookOpen } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string | null;
  restPeriod: number | null;
  measureType: string | null;
  measureValue: number | null;
  sortOrder: number;
}

interface Workout {
  id: string;
  name: string;
  dayNumber: number;
  focus: string | null;
  exercises: Exercise[];
}

interface WorkoutPlan {
  id: string;
  phase: number;
  phaseName: string | null;
  daysPerWeek: number;
  workouts: Workout[];
}

interface ProgramDetail {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  daysPerWeek: number | null;
  durationWeeks: number | null;
  isTemplate: boolean;
  source: string | null;
  cloneCount: number;
  createdAt: string;
  workoutPlans: WorkoutPlan[];
  createdByUser?: { name: string | null; email: string | null };
}

export default function CoachProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.programId as string;

  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingTemplate, setSavingTemplate] = useState(false);

  useEffect(() => {
    async function fetchProgram() {
      try {
        const res = await fetch(`/api/programs/${programId}`);
        if (!res.ok) throw new Error('Failed to fetch program');
        const data = await res.json();
        setProgram(data.program);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load program');
      } finally {
        setLoading(false);
      }
    }
    fetchProgram();
  }, [programId]);

  async function handleSaveAsTemplate() {
    if (!program) return;
    setSavingTemplate(true);
    try {
      const res = await fetch(`/api/programs/${program.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTemplate: true }),
      });
      if (!res.ok) throw new Error('Failed');
      setProgram((prev) => prev ? { ...prev, isTemplate: true } : prev);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingTemplate(false);
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF6B6B]" />
        </div>
      </MainLayout>
    );
  }

  if (error || !program) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-[#64748B] mb-4">{error || 'Program not found'}</p>
            <Link href="/coach/programs" className="text-[#FF6B6B] hover:text-[#EF5350] font-medium">
              Back to Programs
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            href="/coach/programs"
            className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Programs
          </Link>

          {/* Header */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-[#0F172A]">{program.name}</h1>
                {program.description && (
                  <p className="text-[#64748B] mt-2">{program.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {program.isTemplate ? (
                  <span className="px-3 py-1 text-sm font-medium bg-[#FFE5E5] text-[#FF6B6B] rounded-full">
                    Template
                  </span>
                ) : (
                  <button
                    onClick={handleSaveAsTemplate}
                    disabled={savingTemplate}
                    className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-[#64748B] hover:text-[#FF6B6B] border border-[#E2E8F0] rounded-full transition-colors disabled:opacity-50"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    {savingTemplate ? 'Saving...' : 'Save as Template'}
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-[#64748B]">
              {program.category && <span className="capitalize">{program.category}</span>}
              {program.difficulty && <span className="capitalize">{program.difficulty}</span>}
              {program.daysPerWeek && <span>{program.daysPerWeek} days/week</span>}
              {program.durationWeeks && <span>{program.durationWeeks} weeks</span>}
              {program.cloneCount > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  Assigned {program.cloneCount} time{program.cloneCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Workout Plans */}
          {program.workoutPlans.map((plan) => (
            <div key={plan.id} className="mb-6">
              {program.workoutPlans.length > 1 && (
                <h2 className="text-lg font-semibold text-[#0F172A] mb-3">
                  Phase {plan.phase}{plan.phaseName ? `: ${plan.phaseName}` : ''}
                </h2>
              )}

              <div className="space-y-4">
                {plan.workouts
                  .sort((a, b) => a.dayNumber - b.dayNumber)
                  .map((workout) => (
                  <div
                    key={workout.id}
                    className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden"
                  >
                    <div className="px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC]">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-[#94A3B8]">
                          Day {workout.dayNumber}
                        </span>
                        <h3 className="font-semibold text-[#0F172A]">{workout.name}</h3>
                        {workout.focus && (
                          <span className="text-sm text-[#64748B]">({workout.focus})</span>
                        )}
                      </div>
                    </div>
                    <div className="divide-y divide-[#F1F5F9]">
                      {workout.exercises
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((ex) => (
                        <div key={ex.id} className="px-6 py-3 flex items-center justify-between">
                          <span className="text-[#0F172A]">{ex.name}</span>
                          <div className="flex items-center gap-4 text-sm text-[#64748B]">
                            <span>
                              {ex.sets}x{ex.reps || ex.measureValue || '?'}
                            </span>
                            {ex.restPeriod && (
                              <span>{ex.restPeriod}s rest</span>
                            )}
                          </div>
                        </div>
                      ))}
                      {workout.exercises.length === 0 && (
                        <div className="px-6 py-6 text-center text-[#94A3B8] text-sm">
                          No exercises
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {program.workoutPlans.length === 0 && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
              <BookOpen className="w-8 h-8 text-[#94A3B8] mx-auto mb-3" />
              <p className="text-[#64748B]">No workout plans in this program</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
