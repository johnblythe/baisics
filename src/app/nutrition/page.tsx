'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import MainLayout from '@/app/components/layouts/MainLayout';
import { NutritionLogModal } from '@/components/NutritionLogModal';

interface NutritionLog {
  id: string;
  date: string;
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
  source: string;
  notes: string | null;
}

interface ChartData {
  date: string;
  displayDate: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export default function NutritionHistoryPage() {
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchLogs = async () => {
    try {
      // Fetch last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const response = await fetch(
        `/api/nutrition/history?startDate=${thirtyDaysAgo.toISOString()}`
      );

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch nutrition logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Prepare chart data (last 14 days)
  const chartData: ChartData[] = React.useMemo(() => {
    const last14Days: ChartData[] = [];
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const log = logs.find(l => l.date.split('T')[0] === dateStr);

      last14Days.push({
        date: dateStr,
        displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        calories: log?.calories || 0,
        protein: log?.protein || 0,
        carbs: log?.carbs || 0,
        fats: log?.fats || 0,
      });
    }

    return last14Days;
  }, [logs]);

  // Get logged dates as a Set for quick lookup
  const loggedDates = React.useMemo(() => {
    return new Set(logs.map(l => l.date.split('T')[0]));
  }, [logs]);

  // Calendar generation
  const calendarDays = React.useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: { date: Date | null; isCurrentMonth: boolean }[] = [];

    // Padding for days before month starts
    for (let i = 0; i < startPadding; i++) {
      days.push({ date: null, isCurrentMonth: false });
    }

    // Days of the month
    for (let i = 1; i <= totalDays; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    return days;
  }, [currentMonth]);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedDate(undefined);
  };

  const handleSaved = () => {
    fetchLogs();
  };

  const navigateMonth = (delta: number) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isFuture = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-6 h-6 border-2 border-[#F1F5F9] border-t-[#FF6B6B] rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Nutrition History</h1>
            <p className="text-[#64748B]">Track your daily nutrition over time</p>
          </div>
          <button
            onClick={() => {
              setSelectedDate(new Date());
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B6B] text-white font-medium rounded-lg hover:bg-[#EF5350] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Log Today
          </button>
        </div>

        {/* Meal Prep CTA */}
        <a
          href="/meal-prep"
          className="block bg-gradient-to-r from-[#0F172A] to-[#1E293B] rounded-2xl p-4 text-white hover:opacity-95 transition-opacity"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <div className="font-medium">Need meal ideas?</div>
                <div className="text-sm text-[#94A3B8]">Generate a meal plan that hits your macros</div>
              </div>
            </div>
            <svg className="w-5 h-5 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </a>

        {/* Trends Chart */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
          <h2 className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider mb-4" style={{ fontFamily: "'Space Mono', monospace" }}>
            14-Day Trends
          </h2>

          {logs.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-[#94A3B8]">
              <div className="text-center">
                <p className="mb-2">No nutrition data yet</p>
                <p className="text-sm">Start logging to see your trends</p>
              </div>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <XAxis
                    dataKey="displayDate"
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="calories"
                    orientation="left"
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    tickLine={false}
                    axisLine={false}
                    width={45}
                    tickFormatter={(v) => `${v}`}
                  />
                  <YAxis
                    yAxisId="protein"
                    orientation="right"
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    tickLine={false}
                    axisLine={false}
                    width={35}
                    tickFormatter={(v) => `${v}g`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      padding: '0.75rem',
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'calories') return [`${value} kcal`, 'Calories'];
                      return [`${value}g`, name.charAt(0).toUpperCase() + name.slice(1)];
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    formatter={(value) => <span className="text-xs text-[#64748B]">{value}</span>}
                  />
                  <Line
                    yAxisId="calories"
                    type="monotone"
                    dataKey="calories"
                    name="Calories"
                    stroke="#FF6B6B"
                    strokeWidth={2}
                    dot={{ fill: '#FF6B6B', r: 3 }}
                    activeDot={{ r: 5 }}
                    connectNulls={false}
                  />
                  <Line
                    yAxisId="protein"
                    type="monotone"
                    dataKey="protein"
                    name="Protein"
                    stroke="#0F172A"
                    strokeWidth={2}
                    dot={{ fill: '#0F172A', r: 3 }}
                    activeDot={{ r: 5 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              viewMode === 'calendar'
                ? 'bg-[#0F172A] text-white'
                : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#94A3B8]'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-[#0F172A] text-white'
                : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#94A3B8]'
            }`}
          >
            List
          </button>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-lg font-semibold text-[#0F172A]">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-[#94A3B8] py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                if (!day.date) {
                  return <div key={idx} className="aspect-square" />;
                }

                const dateStr = day.date.toISOString().split('T')[0];
                const hasLog = loggedDates.has(dateStr);
                const today = isToday(day.date);
                const future = isFuture(day.date);
                const log = logs.find(l => l.date.split('T')[0] === dateStr);

                return (
                  <button
                    key={idx}
                    onClick={() => !future && handleDayClick(day.date!)}
                    disabled={future}
                    className={`aspect-square p-1 rounded-lg text-sm transition-colors relative group ${
                      future
                        ? 'text-[#CBD5E1] cursor-not-allowed'
                        : today
                        ? 'bg-[#FF6B6B]/10 text-[#FF6B6B] font-semibold hover:bg-[#FF6B6B]/20'
                        : hasLog
                        ? 'bg-[#D1FAE5] text-[#065F46] hover:bg-[#A7F3D0]'
                        : 'text-[#475569] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <span className="block">{day.date.getDate()}</span>
                    {hasLog && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
                    )}

                    {/* Tooltip on hover */}
                    {hasLog && log && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#0F172A] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        <div className="font-medium">{log.calories} kcal</div>
                        <div className="text-[#94A3B8]">{log.protein}P {log.carbs}C {log.fats}F</div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#E2E8F0] text-xs text-[#64748B]">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-[#D1FAE5]" />
                <span>Logged</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-[#FF6B6B]/10 border border-[#FF6B6B]/30" />
                <span>Today</span>
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            {logs.length === 0 ? (
              <div className="p-12 text-center text-[#94A3B8]">
                <p className="mb-2">No nutrition logs yet</p>
                <p className="text-sm">Click &quot;Log Today&quot; to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-[#E2E8F0]">
                {logs.map(log => {
                  const date = new Date(log.date);
                  return (
                    <button
                      key={log.id}
                      onClick={() => handleDayClick(date)}
                      className="w-full p-4 hover:bg-[#F8FAFC] transition-colors text-left flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-[#0F172A]">
                          {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-sm text-[#64748B]">
                          {log.protein}g P • {log.carbs}g C • {log.fats}g F
                        </div>
                        {log.notes && (
                          <div className="text-xs text-[#94A3B8] mt-1 truncate max-w-xs">
                            {log.notes}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-[#0F172A]">{log.calories}</div>
                        <div className="text-xs text-[#94A3B8]">kcal</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <NutritionLogModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSaved={handleSaved}
        initialDate={selectedDate}
      />
    </MainLayout>
  );
}
