'use client';

import { motion } from 'framer-motion';
import { Mail, Calendar, Flame, TrendingUp, Dumbbell, ChevronRight } from 'lucide-react';

interface WeekStats {
  workouts: number;
  volume: number;
  streak: number;
}

interface UpcomingWorkout {
  day: string;
  name: string;
  focus?: string;
}

interface WeeklyDigestPreviewProps {
  weekStats: WeekStats;
  upcomingWorkouts: UpcomingWorkout[];
  programProgress: number;
  userName: string;
}

export function WeeklyDigestPreview({
  weekStats,
  upcomingWorkouts,
  programProgress,
  userName,
}: WeeklyDigestPreviewProps) {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Generate motivational message based on stats
  const getMotivationalMessage = () => {
    if (weekStats.streak >= 7) {
      return `You're on fire! ${weekStats.streak} days straight. Keep that momentum going this week.`;
    }
    if (weekStats.workouts >= 4) {
      return "Incredible consistency last week! You're building habits that last.";
    }
    if (weekStats.workouts >= 2) {
      return "Great progress! Every workout counts toward your goals.";
    }
    return "This week is a fresh start. Let's make it count!";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg bg-white rounded-xl shadow-lg overflow-hidden border border-[#E2E8F0]"
    >
      {/* Email Header */}
      <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#EF5350] flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[#0F172A] text-sm">BAISICS Weekly</p>
            <p className="text-xs text-[#64748B]">weekly@baisics.app</p>
          </div>
        </div>
        <div className="text-xs text-[#94A3B8]">
          <span className="font-medium text-[#64748B]">To:</span> {userName.toLowerCase().replace(' ', '.')}@email.com
        </div>
        <div className="text-xs text-[#94A3B8] mt-1">
          <span className="font-medium text-[#64748B]">Date:</span> {formattedDate}
        </div>
      </div>

      {/* Email Subject Line */}
      <div className="px-4 py-3 border-b border-[#E2E8F0]">
        <p className="font-bold text-[#0F172A]">
          Your Week in Review + What&apos;s Ahead 💪
        </p>
      </div>

      {/* Email Body */}
      <div className="p-5 space-y-5">
        {/* Greeting */}
        <div>
          <p className="text-[#0F172A] font-medium mb-1">Hey {userName}!</p>
          <p className="text-sm text-[#64748B]">
            Here&apos;s your weekly fitness roundup and what&apos;s coming up.
          </p>
        </div>

        {/* Last Week Stats */}
        <div className="bg-[#F8FAFC] rounded-xl p-4">
          <h3 className="font-semibold text-[#0F172A] text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#FF6B6B]" />
            Last Week Highlights
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 mx-auto mb-1.5 rounded-full bg-[#FF6B6B]/10">
                <Dumbbell className="w-5 h-5 text-[#FF6B6B]" />
              </div>
              <p className="text-xl font-bold text-[#0F172A]">{weekStats.workouts}</p>
              <p className="text-xs text-[#64748B]">Workouts</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 mx-auto mb-1.5 rounded-full bg-[#3B82F6]/10">
                <TrendingUp className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <p className="text-xl font-bold text-[#0F172A]">{weekStats.volume.toLocaleString()}</p>
              <p className="text-xs text-[#64748B]">Total lbs</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 mx-auto mb-1.5 rounded-full bg-[#F59E0B]/10">
                <Flame className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <p className="text-xl font-bold text-[#0F172A]">{weekStats.streak}</p>
              <p className="text-xs text-[#64748B]">Day streak</p>
            </div>
          </div>
        </div>

        {/* Program Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[#64748B]">Program Progress</span>
            <span className="font-semibold text-[#0F172A]">{programProgress}%</span>
          </div>
          <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#EF5350] rounded-full transition-all"
              style={{ width: `${programProgress}%` }}
            />
          </div>
        </div>

        {/* This Week Preview */}
        {upcomingWorkouts.length > 0 && (
          <div>
            <h3 className="font-semibold text-[#0F172A] text-sm mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#FF6B6B]" />
              This Week&apos;s Schedule
            </h3>
            <div className="space-y-2">
              {upcomingWorkouts.map((workout, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 bg-[#F8FAFC] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-[#64748B] w-10">{workout.day}</span>
                    <span className="text-sm font-medium text-[#0F172A]">{workout.name}</span>
                  </div>
                  {workout.focus && (
                    <span className="text-xs text-[#94A3B8]">{workout.focus}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Motivational Nudge */}
        <div className="bg-gradient-to-r from-[#FF6B6B]/10 to-[#EF5350]/10 rounded-xl p-4 border border-[#FF6B6B]/20">
          <p className="text-sm text-[#0F172A] font-medium">
            {getMotivationalMessage()}
          </p>
        </div>

        {/* CTA Button (visual only) */}
        <div className="flex items-center justify-center gap-2 py-3 bg-[#FF6B6B] text-white font-semibold rounded-xl">
          View Your Dashboard
          <ChevronRight className="w-4 h-4" />
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#E2E8F0] text-center">
          <p className="text-xs text-[#94A3B8]">
            You&apos;re receiving this because you signed up for BAISICS.
          </p>
          <p className="text-xs text-[#94A3B8] mt-1">
            <span className="underline">Unsubscribe</span> · <span className="underline">Manage preferences</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default WeeklyDigestPreview;
