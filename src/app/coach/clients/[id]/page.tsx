'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/app/components/layouts/MainLayout';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ClientDetails {
  id: string;
  nickname: string | null;
  notes: string | null;
  status: string;
  client: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    programs: Array<{
      id: string;
      name: string;
      description: string | null;
      createdAt: string;
      workoutPlans: Array<{
        workouts: Array<{
          id: string;
          name: string;
          focus: string;
        }>;
      }>;
      workoutLogs: Array<{
        id: string;
        completedAt: string;
        workout: {
          name: string;
          focus: string;
        };
      }>;
      stats: Array<{
        id: string;
        weight: number | null;
        createdAt: string;
      }>;
      checkIns: Array<{
        id: string;
        createdAt: string;
        type: string;
      }>;
    }>;
    userIntakes: Array<{
      trainingGoal: string;
      daysAvailable: number;
      experienceLevel: string | null;
    }>;
  };
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<ClientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function fetchClient() {
      try {
        const res = await fetch(`/api/coach/clients/${params.id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch client');
        }

        setClient(data.client);
        setNickname(data.client.nickname || '');
        setNotes(data.client.notes || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchClient();
    }
  }, [params.id]);

  async function handleSave() {
    try {
      const res = await fetch(`/api/coach/clients/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, notes }),
      });

      if (!res.ok) {
        throw new Error('Failed to update client');
      }

      setEditing(false);
      setClient((prev) =>
        prev ? { ...prev, nickname, notes } : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  }

  async function handleArchive() {
    if (!confirm('Are you sure you want to remove this client?')) return;

    try {
      const res = await fetch(`/api/coach/clients/${params.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to remove client');
      }

      router.push('/coach/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove');
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-t-2 border-[#FF6B6B] border-solid rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (error || !client) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || 'Client not found'}</p>
            <Link
              href="/coach/dashboard"
              className="text-[#FF6B6B] hover:text-[#EF5350]"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const currentProgram = client.client.programs[0];
  const weightData = currentProgram?.stats
    .filter((s) => s.weight)
    .map((s) => ({
      date: new Date(s.createdAt).toLocaleDateString(),
      weight: s.weight,
    }))
    .reverse();

  const totalWorkouts = currentProgram?.workoutPlans.reduce(
    (acc, plan) => acc + plan.workouts.length,
    0
  ) || 0;
  const completedWorkouts = currentProgram?.workoutLogs.length || 0;
  const completionRate = totalWorkouts > 0
    ? Math.round((completedWorkouts / totalWorkouts) * 100)
    : 0;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Back Link */}
          <Link
            href="/coach/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>

          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#FFE5E5] dark:bg-[#FF6B6B]/20 flex items-center justify-center text-2xl font-bold text-[#FF6B6B] dark:text-[#FF6B6B]">
                  {(client.nickname || client.client.name || 'U')[0].toUpperCase()}
                </div>
                <div>
                  {editing ? (
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Nickname"
                      className="text-2xl font-bold bg-transparent border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-[#FF6B6B]"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {client.nickname || client.client.name || 'Unknown'}
                    </h1>
                  )}
                  <p className="text-gray-500 dark:text-gray-400">
                    {client.client.email}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {editing ? (
                  <>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350]"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditing(true)}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleArchive}
                      className="px-4 py-2 text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Coach Notes
              </label>
              {editing ? (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Add notes about this client..."
                />
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  {client.notes || 'No notes yet'}
                </p>
              )}
            </div>

            {/* Client Info */}
            {client.client.userIntakes[0] && (
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Goal</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {client.client.userIntakes[0].trainingGoal}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Days/Week</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {client.client.userIntakes[0].daysAvailable}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Experience</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {client.client.userIntakes[0].experienceLevel || 'Not set'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {completedWorkouts}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Workouts Completed
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <div className="text-3xl font-bold text-emerald-500">{completionRate}%</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Completion Rate
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <div className="text-3xl font-bold text-[#FF6B6B]">
                {currentProgram?.checkIns.length || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Check-ins</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weight Progress */}
            {weightData && weightData.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Weight Progress
                </h2>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightData}>
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#6366f1"
                        strokeWidth={2}
                        dot={{ fill: '#6366f1' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Workouts
              </h2>
              {currentProgram?.workoutLogs.length ? (
                <div className="space-y-3">
                  {currentProgram.workoutLogs.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {log.workout.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {log.workout.focus}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(log.completedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No workouts completed yet
                </p>
              )}
            </div>
          </div>

          {/* Programs */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Programs
            </h2>
            {client.client.programs.length > 0 ? (
              <div className="space-y-4">
                {client.client.programs.map((program) => (
                  <div
                    key={program.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {program.name}
                        </h3>
                        {program.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {program.description}
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(program.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mt-3 flex gap-4 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        {program.workoutLogs.length}/
                        {program.workoutPlans.reduce(
                          (acc, plan) => acc + plan.workouts.length,
                          0
                        )}{' '}
                        workouts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No programs yet
              </p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
