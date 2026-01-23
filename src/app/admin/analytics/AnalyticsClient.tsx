'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface Totals {
  magicLinks: number;
  signups: number;
  onboarding: number;
  programsStarted: number;
  programsCompleted: number;
  workoutsStarted: number;
  workoutsCompleted: number;
  firstWorkouts: number;
}

interface DailyStat {
  day: string;
  magicLinks: number;
  signups: number;
  onboarding: number;
  programs: number;
  workouts: number;
}

interface RecentUser {
  id: string;
  email: string;
  createdAt: string;
  programs: number;
  workouts: number;
}

interface RecentProgram {
  id: string;
  name: string;
  createdAt: string;
  userEmail: string;
}

interface Props {
  totals: Totals;
  dailyStats: DailyStat[];
  recentUsers: RecentUser[];
  recentPrograms: RecentProgram[];
  currentDays: number;
}

function MetricCard({ label, value, subValue }: { label: string; value: number; subValue?: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      {subValue && <p className="mt-1 text-sm text-gray-400">{subValue}</p>}
    </div>
  );
}

function FunnelBar({ label, value, maxValue, color }: { label: string; value: number; maxValue: number; color: string }) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="flex items-center gap-4">
      <div className="w-32 text-sm text-gray-600 text-right">{label}</div>
      <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
        <div
          className={`h-full ${color} flex items-center justify-end pr-3`}
          style={{ width: `${Math.max(pct, 5)}%` }}
        >
          <span className="text-sm font-semibold text-white">{value}</span>
        </div>
      </div>
      <div className="w-16 text-sm text-gray-400">{pct.toFixed(0)}%</div>
    </div>
  );
}

export default function AnalyticsClient({
  totals,
  dailyStats,
  recentUsers,
  recentPrograms,
  currentDays,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleDaysChange = (days: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('days', days.toString());
    router.push(`?${params.toString()}`);
  };

  const maxFunnel = Math.max(totals.magicLinks, totals.signups, totals.onboarding, totals.programsCompleted, 1);

  return (
    <div className="space-y-8">
      {/* Time filter */}
      <div className="flex gap-2">
        {[7, 14, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => handleDaysChange(d)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentDays === d
                ? 'bg-[#0F172A] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {d}d
          </button>
        ))}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Signups" value={totals.signups} />
        <MetricCard label="Programs Created" value={totals.programsCompleted} />
        <MetricCard label="Workouts Completed" value={totals.workoutsCompleted} />
        <MetricCard label="First Workouts" value={totals.firstWorkouts} />
      </div>

      {/* Funnel visualization */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Conversion Funnel</h2>
        <div className="space-y-3">
          <FunnelBar label="Magic Links" value={totals.magicLinks} maxValue={maxFunnel} color="bg-gray-400" />
          <FunnelBar label="Signups" value={totals.signups} maxValue={maxFunnel} color="bg-blue-500" />
          <FunnelBar label="Onboarding" value={totals.onboarding} maxValue={maxFunnel} color="bg-indigo-500" />
          <FunnelBar label="Programs" value={totals.programsCompleted} maxValue={maxFunnel} color="bg-[#FF6B6B]" />
          <FunnelBar label="Workouts" value={totals.workoutsCompleted} maxValue={maxFunnel} color="bg-green-500" />
        </div>

        {/* Conversion rates */}
        <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {totals.magicLinks > 0 ? ((totals.signups / totals.magicLinks) * 100).toFixed(0) : 0}%
            </p>
            <p className="text-xs text-gray-500">Link → Signup</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {totals.signups > 0 ? ((totals.programsCompleted / totals.signups) * 100).toFixed(0) : 0}%
            </p>
            <p className="text-xs text-gray-500">Signup → Program</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {totals.programsCompleted > 0 ? ((totals.workoutsCompleted / totals.programsCompleted) * 100).toFixed(0) : 0}%
            </p>
            <p className="text-xs text-gray-500">Program → Workout</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {totals.magicLinks > 0 ? ((totals.workoutsCompleted / totals.magicLinks) * 100).toFixed(0) : 0}%
            </p>
            <p className="text-xs text-gray-500">End-to-End</p>
          </div>
        </div>
      </div>

      {/* Daily activity table */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Activity</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-2 font-medium text-gray-500">Date</th>
                <th className="text-right py-3 px-2 font-medium text-gray-500">Links</th>
                <th className="text-right py-3 px-2 font-medium text-gray-500">Signups</th>
                <th className="text-right py-3 px-2 font-medium text-gray-500">Onboarding</th>
                <th className="text-right py-3 px-2 font-medium text-gray-500">Programs</th>
                <th className="text-right py-3 px-2 font-medium text-gray-500">Workouts</th>
              </tr>
            </thead>
            <tbody>
              {dailyStats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No data yet. Events will appear here as users interact with the app.
                  </td>
                </tr>
              ) : (
                dailyStats.map((row) => (
                  <tr key={row.day} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium text-gray-900">{row.day}</td>
                    <td className="py-3 px-2 text-right text-gray-600">{row.magicLinks || '-'}</td>
                    <td className="py-3 px-2 text-right text-gray-600">{row.signups || '-'}</td>
                    <td className="py-3 px-2 text-right text-gray-600">{row.onboarding || '-'}</td>
                    <td className="py-3 px-2 text-right text-gray-600">{row.programs || '-'}</td>
                    <td className="py-3 px-2 text-right text-gray-600">{row.workouts || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two column layout for recent users and programs */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Signups</h2>
          <div className="space-y-3">
            {recentUsers.length === 0 ? (
              <p className="text-gray-400 text-sm">No signups yet</p>
            ) : (
              recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{user.email}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className={`px-2 py-1 rounded-full ${user.programs > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {user.programs} prog
                    </span>
                    <span className={`px-2 py-1 rounded-full ${user.workouts > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                      {user.workouts} wkt
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Programs */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Programs</h2>
          <div className="space-y-3">
            {recentPrograms.length === 0 ? (
              <p className="text-gray-400 text-sm">No programs yet</p>
            ) : (
              recentPrograms.map((program) => (
                <div key={program.id} className="py-2 border-b border-gray-50 last:border-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{program.name}</p>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-400 truncate max-w-[150px]">{program.userEmail}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(program.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
