'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/app/components/layouts/MainLayout';
import { Settings, TrendingUp } from 'lucide-react';
import { ProgramAssignModal } from '@/components/ProgramAssignModal';
import { CoachOnboardingWizard } from '@/components/CoachOnboardingWizard';

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

// Get days since last activity for sorting
function getDaysSinceLastActivity(client: Client): number {
  const lastWorkout = client.client?.currentProgram?.lastWorkout;
  if (!lastWorkout) return Infinity;
  return Math.floor((Date.now() - new Date(lastWorkout).getTime()) / (24 * 60 * 60 * 1000));
}

// Get attention reason text
function getAttentionReason(client: Client): string {
  if (!client.client?.currentProgram) {
    return 'No active program';
  }
  const days = getDaysSinceLastActivity(client);
  if (days === Infinity) {
    return 'No workouts logged';
  }
  return `No workout in ${days} days`;
}

export default function CoachDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [addNickname, setAddNickname] = useState('');
  const [adding, setAdding] = useState(false);
  const [publicInviteUrl, setPublicInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [assignModalClient, setAssignModalClient] = useState<{
    id: string;
    name: string;
    currentProgram: string | null;
  } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
    fetchPublicInvite();
    fetchUserData();
  }, []);

  async function fetchUserData() {
    try {
      const res = await fetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        setUserName(data.name);
        // Show onboarding if coach hasn't completed it
        if (data.isCoach && !data.coachOnboardedAt) {
          setShowOnboarding(true);
        }
      }
    } catch {
      // Non-critical
    }
  }

  async function fetchPublicInvite() {
    try {
      const res = await fetch('/api/coach/public-invite');
      if (res.ok) {
        const data = await res.json();
        setPublicInviteUrl(data.url);
      }
    } catch {
      // Silently fail - not critical
    }
  }

  function copyInviteLink() {
    if (publicInviteUrl) {
      navigator.clipboard.writeText(publicInviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

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
  const clientsNeedingAttention = activeClients
    .filter(needsAttention)
    .sort((a, b) => getDaysSinceLastActivity(b) - getDaysSinceLastActivity(a));
  const activeThisWeek = activeClients.filter(
    (c) =>
      c.client?.currentProgram?.lastWorkout &&
      new Date(c.client.currentProgram.lastWorkout) >
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="w-8 h-8 border-t-2 border-[#FF6B6B] border-solid rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (error === 'Not a coach account') {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🏋️</div>
            <h1 className="text-2xl font-bold text-[#0F172A] mb-3">
              Coach Mode
            </h1>
            <p className="text-[#64748B] mb-6">
              Manage your clients, track their progress, and create programs for them.
              Coach accounts are available for premium members.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350] transition-colors font-medium"
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
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        .coach-dashboard {
          font-family: 'Outfit', sans-serif;
        }
        .coach-dashboard .mono {
          font-family: 'Space Mono', monospace;
        }
      `}</style>

      <div className="coach-dashboard min-h-screen bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A]">
                Coach Dashboard
              </h1>
              <p className="text-[#64748B] mt-1">
                Manage your clients and track their progress
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/coach/analytics"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] text-[#475569] rounded-lg hover:bg-[#F1F5F9] transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                Analytics
              </Link>
              <Link
                href="/coach/settings"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] text-[#475569] rounded-lg hover:bg-[#F1F5F9] transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350] transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Client
              </button>
            </div>
          </div>

          {/* Public Invite Link */}
          {publicInviteUrl && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 mb-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#64748B] mb-1">
                    🔗 Your public invite link
                  </div>
                  <div className="text-sm text-[#0F172A] mono truncate">
                    {publicInviteUrl}
                  </div>
                </div>
                <button
                  onClick={copyInviteLink}
                  className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-[#F1F5F9] text-[#475569] rounded-lg hover:bg-[#E2E8F0] transition-colors"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Link
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-[#94A3B8] mt-2">
                Share this link with potential clients. They can sign up and automatically join your roster.
              </p>
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <div className="text-3xl font-bold text-[#0F172A]">
                {activeClients.length}
              </div>
              <div className="text-sm text-[#64748B]">Active Clients</div>
            </div>
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <div className="text-3xl font-bold text-amber-500">
                {pendingInvites.length}
              </div>
              <div className="text-sm text-[#64748B]">Pending Invites</div>
            </div>
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <div className="text-3xl font-bold text-emerald-500">
                {activeThisWeek.length}
              </div>
              <div className="text-sm text-[#64748B]">Active This Week</div>
            </div>
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <div className="text-3xl font-bold text-[#FF6B6B]">
                {clientsNeedingAttention.length}
              </div>
              <div className="text-sm text-[#64748B]">Need Attention</div>
            </div>
          </div>

          {/* Needs Attention Section */}
          {clientsNeedingAttention.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                <span className="text-xl">⚠️</span> Needs Attention
              </h2>
              <div className="bg-white rounded-xl border border-[#FFE5E5] overflow-hidden">
                {clientsNeedingAttention.map((client, index) => (
                  <div
                    key={client.id}
                    className={`flex items-center justify-between p-4 hover:bg-[#FFF5F5] transition-colors ${
                      index !== clientsNeedingAttention.length - 1 ? 'border-b border-[#FFE5E5]' : ''
                    }`}
                  >
                    <Link
                      href={`/coach/clients/${client.id}`}
                      className="flex items-center gap-3 flex-1"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#FFE5E5] flex items-center justify-center text-[#FF6B6B] font-bold">
                        {(client.nickname || client.client?.name || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-[#0F172A]">
                          {client.nickname || client.client?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-[#FF6B6B]">
                          {getAttentionReason(client)}
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2">
                      {!client.client?.currentProgram && client.client && (
                        <button
                          onClick={() => setAssignModalClient({
                            id: client.client!.id,
                            name: client.nickname || client.client?.name || 'Client',
                            currentProgram: null,
                          })}
                          className="px-3 py-1.5 text-xs font-medium text-[#FF6B6B] hover:bg-[#FFE5E5] rounded-lg transition-colors"
                        >
                          Assign Program
                        </button>
                      )}
                      <Link href={`/coach/clients/${client.id}`}>
                        <svg className="w-5 h-5 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Invites */}
          {pendingInvites.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-[#0F172A] mb-4">
                Pending Invites
              </h2>
              <div className="bg-white rounded-xl border border-[#E2E8F0] divide-y divide-[#F1F5F9]">
                {pendingInvites.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-[#0F172A]">
                          {client.nickname || client.inviteEmail}
                        </div>
                        <div className="text-sm text-[#64748B]">
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
                      className="text-sm text-[#FF6B6B] hover:text-[#EF5350] font-medium"
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
            <h2 className="text-lg font-semibold text-[#0F172A] mb-4">
              Active Clients
            </h2>

            {activeClients.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-[#0F172A] mb-2">
                  No clients yet
                </h3>
                <p className="text-[#64748B] mb-6">
                  Add your first client to start managing their fitness journey
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350] transition-colors font-medium"
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
                    className="bg-white rounded-xl border border-[#E2E8F0] p-6 hover:shadow-lg hover:border-[#FF6B6B]/30 transition-all relative"
                  >
                    {/* Attention indicator */}
                    {needsAttention(client) && (
                      <div className="absolute top-3 right-3 w-3 h-3 bg-[#FF6B6B] rounded-full" title="Needs attention - inactive 5+ days" />
                    )}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#FFE5E5] flex items-center justify-center text-xl font-bold text-[#FF6B6B]">
                        {(client.nickname || client.client?.name || 'U')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[#0F172A]">
                          {client.nickname || client.client?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-[#64748B] truncate">
                          {client.client?.email}
                        </div>
                      </div>
                    </div>

                    {client.client?.currentProgram && (
                      <div className="mt-4 p-3 bg-[#F8FAFC] rounded-lg">
                        <div className="text-sm font-medium text-[#0F172A] mb-2">
                          {client.client.currentProgram.name}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex-1 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{
                                width: `${Math.round((client.client.currentProgram.completedWorkouts / client.client.currentProgram.totalWorkouts) * 100)}%`
                              }}
                            />
                          </div>
                          <span className="text-[#64748B] text-xs mono">
                            {client.client.currentProgram.completedWorkouts}/{client.client.currentProgram.totalWorkouts}
                          </span>
                        </div>
                        {client.client.currentProgram.lastWorkout && (
                          <div className="text-xs text-[#94A3B8] mt-2">
                            Last workout:{' '}
                            {new Date(
                              client.client.currentProgram.lastWorkout
                            ).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}

                    {!client.client?.currentProgram && (
                      <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-center justify-between">
                        <span className="text-sm text-amber-700">No active program</span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setAssignModalClient({
                              id: client.client!.id,
                              name: client.nickname || client.client?.name || 'Client',
                              currentProgram: null,
                            });
                          }}
                          className="text-xs font-medium text-[#FF6B6B] hover:text-[#EF5350]"
                        >
                          Assign →
                        </button>
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
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold text-[#0F172A] mb-6">
                  Add Client
                </h2>

                <form onSubmit={handleAddClient} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#475569] mb-1">
                      Client Email *
                    </label>
                    <input
                      type="email"
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg bg-white text-[#0F172A] focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
                      placeholder="client@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#475569] mb-1">
                      Nickname (optional)
                    </label>
                    <input
                      type="text"
                      value={addNickname}
                      onChange={(e) => setAddNickname(e.target.value)}
                      className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg bg-white text-[#0F172A] focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
                      placeholder="e.g., John - Strength Training"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 px-4 py-2 border border-[#E2E8F0] text-[#475569] rounded-lg hover:bg-[#F8FAFC] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={adding}
                      className="flex-1 px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350] transition-colors disabled:opacity-50 font-medium"
                    >
                      {adding ? 'Adding...' : 'Add & Send Invite'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Program Assign Modal */}
        {assignModalClient && (
          <ProgramAssignModal
            clientId={assignModalClient.id}
            clientName={assignModalClient.name}
            currentProgramName={assignModalClient.currentProgram}
            onClose={() => setAssignModalClient(null)}
            onAssigned={() => {
              fetchClients();
              setAssignModalClient(null);
            }}
          />
        )}

        {/* Coach Onboarding Wizard */}
        {showOnboarding && (
          <CoachOnboardingWizard
            coachName={userName}
            onComplete={() => setShowOnboarding(false)}
          />
        )}
      </div>
    </MainLayout>
  );
}
