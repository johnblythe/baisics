'use client';

import React, { useState, useRef } from 'react';

interface ProgramStats {
  phases: number;
  totalWorkouts: number;
  completedWorkouts: number;
  completionRate: number;
  totalExercises: number;
  weightChange?: {
    current: number;
    previous: number;
    change: number;
  } | null;
}

interface ProgramShareData {
  id: string;
  name: string;
  description: string | null;
  createdBy: string;
  createdAt: string;
  stats: ProgramStats;
  focusAreas: string[];
  daysPerWeek: number;
}

interface ProgramCardProps {
  data: ProgramShareData;
  onClose?: () => void;
}

export function ProgramCard({ data, onClose }: ProgramCardProps) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/share/${data.id}`
    : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;

    setSharing(true);
    try {
      await navigator.share({
        title: `${data.name} - My BAISICS Program`,
        text: data.description || 'Check out my AI-generated fitness program!',
        url: shareUrl,
      });
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    } finally {
      setSharing(false);
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(
      `Check out my personalized fitness program on BAISICS! ${shareUrl}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          {/* Card Preview */}
          <div
            ref={cardRef}
            className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-700 p-8 text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="font-bold">BAISICS</span>
              </div>
              <span className="text-xs bg-white/10 px-3 py-1 rounded-full">
                AI-Generated
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold mb-2">{data.name}</h2>
            {data.description && (
              <p className="text-white/70 text-sm mb-6 line-clamp-2">
                {data.description}
              </p>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold">{data.stats.totalWorkouts}</div>
                <div className="text-xs text-white/60">Workouts</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-emerald-400">
                  {data.stats.completionRate}%
                </div>
                <div className="text-xs text-white/60">Complete</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-amber-400">
                  {data.stats.phases}
                </div>
                <div className="text-xs text-white/60">Phases</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-pink-400">
                  {data.stats.totalExercises}
                </div>
                <div className="text-xs text-white/60">Exercises</div>
              </div>
            </div>

            {/* Weight Change */}
            {data.stats.weightChange && (
              <div className="bg-white/10 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Weight Progress</span>
                  <span
                    className={`text-lg font-bold ${
                      data.stats.weightChange.change < 0
                        ? 'text-emerald-400'
                        : data.stats.weightChange.change > 0
                        ? 'text-amber-400'
                        : 'text-white/60'
                    }`}
                  >
                    {data.stats.weightChange.change > 0 ? '+' : ''}
                    {data.stats.weightChange.change.toFixed(1)} lbs
                  </span>
                </div>
              </div>
            )}

            {/* Focus Areas */}
            {data.focusAreas.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.focusAreas.map((focus) => (
                  <span
                    key={focus}
                    className="text-xs bg-white/10 px-3 py-1 rounded-full"
                  >
                    {focus}
                  </span>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
              <span>by {data.createdBy}</span>
              <span>{data.daysPerWeek} days/week</span>
            </div>
          </div>

          {/* Share Actions */}
          <div className="p-6 space-y-4">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
              Share your program
            </div>

            {/* Share Buttons */}
            <div className="flex gap-3 justify-center">
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleNativeShare}
                  disabled={sharing}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </button>
              )}

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
                onClick={handleFacebookShare}
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Share on Facebook"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
            </div>

            {/* Copy Link */}
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Close Button */}
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

export default ProgramCard;
