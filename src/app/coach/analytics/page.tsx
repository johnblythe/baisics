'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/app/components/layouts/MainLayout';
import { ArrowLeft, TrendingUp, Users, Dumbbell, ClipboardCheck } from 'lucide-react';

interface AnalyticsData {
  summary: {
    totalClients: number;
    activeThisWeek: number;
    avgWorkoutsPerWeek: number;
    programCompletionRate: number;
    totalWorkoutsLogged: number;
    totalCheckIns: number;
  };
  weeklyTrend: {
    week: string;
    weekStart: string;
    workouts: number;
    activeClients: number;
  }[];
  clientEngagement: {
    clientId: string;
    workoutsLast4Weeks: number;
    avgPerWeek: number;
    active: boolean;
  }[];
}

export default function CoachAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const res = await fetch('/api/coach/analytics');
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to fetch analytics');
      }

      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="w-8 h-8 border-t-2 border-[#FF6B6B] border-solid rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Link
              href="/coach/dashboard"
              className="text-[#FF6B6B] hover:underline"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const summary = data?.summary || {
    totalClients: 0,
    activeThisWeek: 0,
    avgWorkoutsPerWeek: 0,
    programCompletionRate: 0,
    totalWorkoutsLogged: 0,
    totalCheckIns: 0,
  };

  const weeklyTrend = data?.weeklyTrend || [];
  const maxWorkouts = Math.max(...weeklyTrend.map((w) => w.workouts), 1);

  return (
    <MainLayout>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        .coach-analytics {
          font-family: 'Outfit', sans-serif;
        }
        .coach-analytics .mono {
          font-family: 'Space Mono', monospace;
        }
      `}</style>

      <div className="coach-analytics min-h-screen bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/coach/dashboard"
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#64748B]" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A]">Analytics</h1>
              <p className="text-[#64748B] mt-1">
                Track client engagement and progress
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#FFE5E5] flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#FF6B6B]" />
                </div>
                <span className="text-sm text-[#64748B]">Total Clients</span>
              </div>
              <div className="text-3xl font-bold text-[#0F172A]">
                {summary.totalClients}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="text-sm text-[#64748B]">Active This Week</span>
              </div>
              <div className="text-3xl font-bold text-[#0F172A]">
                {summary.activeThisWeek}
              </div>
              <div className="text-xs text-[#94A3B8] mt-1">
                {summary.totalClients > 0
                  ? `${Math.round((summary.activeThisWeek / summary.totalClients) * 100)}% engagement`
                  : '0% engagement'}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-sm text-[#64748B]">Avg Workouts/Week</span>
              </div>
              <div className="text-3xl font-bold text-[#0F172A]">
                {summary.avgWorkoutsPerWeek}
              </div>
              <div className="text-xs text-[#94A3B8] mt-1">per active client</div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5 text-purple-500" />
                </div>
                <span className="text-sm text-[#64748B]">Program Completion</span>
              </div>
              <div className="text-3xl font-bold text-[#0F172A]">
                {summary.programCompletionRate}%
              </div>
              <div className="text-xs text-[#94A3B8] mt-1">avg across clients</div>
            </div>
          </div>

          {/* Weekly Trend Chart */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-8">
            <h2 className="text-lg font-semibold text-[#0F172A] mb-6">
              Weekly Activity (Last 4 Weeks)
            </h2>

            {weeklyTrend.length === 0 ? (
              <div className="text-center py-8 text-[#64748B]">
                No activity data yet
              </div>
            ) : (
              <div className="space-y-4">
                {weeklyTrend.map((week, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-20 text-sm text-[#64748B]">{week.week}</div>
                    <div className="flex-1">
                      <div className="h-8 bg-[#F1F5F9] rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                          style={{
                            width: `${(week.workouts / maxWorkouts) * 100}%`,
                            minWidth: week.workouts > 0 ? '60px' : '0',
                          }}
                        >
                          {week.workouts > 0 && (
                            <span className="text-xs font-bold text-white">
                              {week.workouts}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="w-24 text-right">
                      <span className="text-sm text-[#64748B]">
                        {week.activeClients} active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lifetime Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
              <h3 className="text-sm font-medium text-[#64748B] mb-2">
                Total Workouts Logged
              </h3>
              <div className="text-4xl font-bold text-[#0F172A] mono">
                {summary.totalWorkoutsLogged.toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
              <h3 className="text-sm font-medium text-[#64748B] mb-2">
                Total Check-Ins
              </h3>
              <div className="text-4xl font-bold text-[#0F172A] mono">
                {summary.totalCheckIns.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
