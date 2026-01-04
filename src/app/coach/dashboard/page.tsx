'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/app/components/layouts/MainLayout';

interface Client {
  id: string;
  clientId: string | null;
  nickname: string | null;
  notes: string | null;
  status: string;
  inviteStatus: string;
  inviteEmail: string | null;
  createdAt: string;
  client: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    createdAt: string;
    currentProgram: {
      id: string;
      name: string;
      completedWorkouts: number;
      totalWorkouts: number;
      lastWorkout: string | null;
    } | null;
    lastCheckIn: string | null;
  } | null;
}

// Check if client needs attention (inactive 5+ days, not a new client)
function needsAttention(client: Client): boolean {
  if (!client.client) return false;

  // Grace period: skip clients < 5 days old
  const clientCreatedAt = new Date(client.client.createdAt);
  const daysSinceJoined = Math.floor((Date.now() - clientCreatedAt.getTime()) / (24 * 60 * 60 * 1000));
  if (daysSinceJoined < 5) return false;

  // Check days since last workout
  const lastWorkout = client.client.currentProgram?.lastWorkout;
  if (!lastWorkout) return true; // No workouts ever = needs attention

  const daysSinceWorkout = Math.floor(
    (Date.now() - new Date(lastWorkout).getTime()) / (24 * 60 * 60 * 1000)
  );

  return daysSinceWorkout >= 5;
}

export default function CoachDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [addNickname, setAddNickname] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      const res = await fetch('/api/coach/clients');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch clients');
      }

      setClients(data.clients || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddClient(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);

    try {
      const res = await fetch('/api/coach/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: addEmail, nickname: addNickname }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add client');
      }

      // Send invite if pending
      if (data.inviteToken) {
        await fetch('/api/coach/clients/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coachClientId: data.client.id }),
        });
      }

      setShowAddModal(false);
      setAddEmail('');
      setAddNickname('');
      fetchClients();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add client');
    } finally {
      setAdding(false);
    }
  }

  const activeClients = clients.filter((c) => c.client && c.inviteStatus === 'ACCEPTED');
  const pendingInvites = clients.filter((c) => c.inviteStatus === 'PENDING');

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-t-2 border-[#FF6B6B] border-solid rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (error === 'Not a coach account') {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🏋️</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Coach Mode
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Manage your clients, track their progress, and create programs for them.
              Coach accounts are available for premium members.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350] transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Coach Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your clients and track their progress
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Client
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {activeClients.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Active Clients</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <div className="text-3xl font-bold text-amber-500">
                {pendingInvites.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Pending Invites</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <div className="text-3xl font-bold text-emerald-500">
                {activeClients.filter(
                  (c) =>
                    c.client?.currentProgram?.lastWorkout &&
                    new Date(c.client.currentProgram.lastWorkout) >
                      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Active This Week</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <div className="text-3xl font-bold text-[#FF6B6B]">
                {activeClients.filter(needsAttention).length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Need Attention</div>
            </div>
          </div>

          {/* Pending Invites */}
          {pendingInvites.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Pending Invites
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-xl divide-y divide-gray-100 dark:divide-gray-700">
                {pendingInvites.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {client.nickname || client.inviteEmail}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {client.inviteEmail}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        await fetch('/api/coach/clients/invite', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            coachClientId: client.id,
                            resend: true,
                          }),
                        });
                      }}
                      className="text-sm text-[#FF6B6B] hover:text-[#EF5350] dark:text-[#FF6B6B]"
                    >
                      Resend Invite
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Clients */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Active Clients
            </h2>

            {activeClients.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No clients yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Add your first client to start managing their fitness journey
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Client
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeClients.map((client) => (
                  <Link
                    key={client.id}
                    href={`/coach/clients/${client.id}`}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow relative"
                  >
                    {/* Attention indicator */}
                    {needsAttention(client) && (
                      <div className="absolute top-3 right-3 w-3 h-3 bg-[#FF6B6B] rounded-full" title="Needs attention - inactive 5+ days" />
                    )}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#FFE5E5] dark:bg-[#FF6B6B]/20 flex items-center justify-center text-xl font-bold text-[#FF6B6B] dark:text-[#FF6B6B]">
                        {(client.nickname || client.client?.name || 'U')[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {client.nickname || client.client?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {client.client?.email}
                        </div>
                      </div>
                    </div>

                    {client.client?.currentProgram && (
                      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          {client.client.currentProgram.name}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {client.client.currentProgram.completedWorkouts}/
                              {client.client.currentProgram.totalWorkouts} workouts
                            </span>
                          </div>
                        </div>
                        {client.client.currentProgram.lastWorkout && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Last workout:{' '}
                            {new Date(
                              client.client.currentProgram.lastWorkout
                            ).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}

                    {!client.client?.currentProgram && (
                      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm text-amber-700 dark:text-amber-400">
                        No active program
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Client Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <div className="relative min-h-screen flex items-center justify-center p-4">
              <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Add Client
                </h2>

                <form onSubmit={handleAddClient} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Client Email *
                    </label>
                    <input
                      type="email"
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
                      placeholder="client@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nickname (optional)
                    </label>
                    <input
                      type="text"
                      value={addNickname}
                      onChange={(e) => setAddNickname(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
                      placeholder="e.g., John - Strength Training"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={adding}
                      className="flex-1 px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350] transition-colors disabled:opacity-50"
                    >
                      {adding ? 'Adding...' : 'Add & Send Invite'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
