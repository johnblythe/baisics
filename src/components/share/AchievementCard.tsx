'use client';

import React, { useState } from 'react';

export type AchievementType =
  | 'first_workout'
  | 'week_complete'
  | 'phase_complete'
  | 'program_complete'
  | 'streak_7'
  | 'streak_30'
  | 'weight_goal'
  | 'strength_pr';

interface Achievement {
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  color: string;
  value?: string | number;
  date: Date;
}

const ACHIEVEMENT_CONFIG: Record<AchievementType, Omit<Achievement, 'value' | 'date'>> = {
  first_workout: {
    type: 'first_workout',
    title: 'First Workout',
    description: 'Completed my first workout!',
    icon: '🎯',
    color: 'from-emerald-500 to-emerald-600',
  },
  week_complete: {
    type: 'week_complete',
    title: 'Week Complete',
    description: 'Finished a full week of training!',
    icon: '📅',
    color: 'from-blue-500 to-blue-600',
  },
  phase_complete: {
    type: 'phase_complete',
    title: 'Phase Complete',
    description: 'Completed a training phase!',
    icon: '🏆',
    color: 'from-amber-500 to-amber-600',
  },
  program_complete: {
    type: 'program_complete',
    title: 'Program Complete',
    description: 'Finished my entire program!',
    icon: '🎉',
    color: 'from-purple-500 to-purple-600',
  },
  streak_7: {
    type: 'streak_7',
    title: '7-Day Streak',
    description: '7 days of consistency!',
    icon: '🔥',
    color: 'from-orange-500 to-orange-600',
  },
  streak_30: {
    type: 'streak_30',
    title: '30-Day Streak',
    description: '30 days of dedication!',
    icon: '💪',
    color: 'from-red-500 to-red-600',
  },
  weight_goal: {
    type: 'weight_goal',
    title: 'Weight Goal',
    description: 'Hit my weight goal!',
    icon: '⚖️',
    color: 'from-teal-500 to-teal-600',
  },
  strength_pr: {
    type: 'strength_pr',
    title: 'Strength PR',
    description: 'New personal record!',
    icon: '🏋️',
    color: 'from-indigo-500 to-indigo-600',
  },
};

interface AchievementCardProps {
  type: AchievementType;
  value?: string | number;
  date: Date;
  userName?: string;
  onClose?: () => void;
}

export function AchievementCard({
  type,
  value,
  date,
  userName = 'BAISICS User',
  onClose,
}: AchievementCardProps) {
  const [copied, setCopied] = useState(false);
  const config = ACHIEVEMENT_CONFIG[type];

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/share/achievement?type=${type}&value=${value || ''}&date=${date.toISOString()}`
    : '';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${config.title} - BAISICS Achievement`,
          text: `${userName} just earned: ${config.title} ${config.icon}`,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${userName} just earned: ${config.title} ${config.icon}\n${config.description}\n${shareUrl}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(
      `Just earned ${config.title} ${config.icon} on @BAISICS_app! ${config.description}\n\n${shareUrl}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
          {/* Achievement Card */}
          <div className={`bg-gradient-to-br ${config.color} p-8 text-white text-center`}>
            <div className="text-6xl mb-4">{config.icon}</div>
            <h2 className="text-2xl font-bold mb-2">{config.title}</h2>
            <p className="text-white/80">{config.description}</p>
            {value && (
              <div className="mt-4 text-3xl font-bold">{value}</div>
            )}
            <div className="mt-4 text-sm text-white/60">
              {date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="text-sm text-white/60">{userName}</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="text-xs font-medium">BAISICS</span>
              </div>
            </div>
          </div>

          {/* Share Actions */}
          <div className="p-6 space-y-4">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Share your achievement
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>

              <button
                onClick={handleTwitterShare}
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Share on X"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>

              <button
                onClick={handleCopy}
                className={`p-3 rounded-lg transition-colors ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                title={copied ? 'Copied!' : 'Copy link'}
              >
                {copied ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="w-full mt-4 px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AchievementCard;
