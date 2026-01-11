'use client';

import React, { useState, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';

export interface ProgressShareData {
  programId: string;
  weeksCompleted: number;
  totalWorkouts: number;
  weightChange?: number; // in lbs (positive = gained, negative = lost)
  startWeight?: number;
  currentWeight?: number;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  startDate: Date;
  userName?: string;
}

interface ProgressShareCardProps {
  data: ProgressShareData;
  onClose?: () => void;
}

export function ProgressShareCard({ data, onClose }: ProgressShareCardProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [hideStats, setHideStats] = useState(false);
  const [hidePhotos, setHidePhotos] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/share/progress/${data.programId}`
    : '';

  const formatWeight = (weight: number): string => {
    return `${Math.abs(weight).toFixed(1)} lbs`;
  };

  const formatWeightChange = (change: number): string => {
    if (change === 0) return 'No change';
    const sign = change > 0 ? '+' : '-';
    return `${sign}${Math.abs(change).toFixed(1)} lbs`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  const generateImage = useCallback(async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png', 1.0);
      });
    } catch (err) {
      console.error('Failed to generate image:', err);
      return null;
    }
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await generateImage();
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `baisics-progress-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!navigator.share) {
      handleCopyLink();
      return;
    }

    setSharing(true);
    try {
      const blob = await generateImage();
      if (blob && navigator.canShare?.({ files: [new File([blob], 'progress.png', { type: 'image/png' })] })) {
        const file = new File([blob], 'baisics-progress.png', { type: 'image/png' });
        await navigator.share({
          title: 'My Fitness Progress - BAISICS',
          text: `${data.weeksCompleted} weeks and ${data.totalWorkouts} workouts on BAISICS!`,
          files: [file],
        });
      } else {
        await navigator.share({
          title: 'My Fitness Progress - BAISICS',
          text: `${data.weeksCompleted} weeks and ${data.totalWorkouts} workouts on BAISICS!`,
          url: shareUrl,
        });
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${data.weeksCompleted} weeks and ${data.totalWorkouts} workouts on BAISICS!\n${shareUrl}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTwitterShare = () => {
    const weightPart = data.weightChange && !hideStats
      ? ` | ${formatWeightChange(data.weightChange)}`
      : '';
    const text = encodeURIComponent(
      `${data.weeksCompleted} weeks and ${data.totalWorkouts} workouts on @BAISICS_app!${weightPart}\n${shareUrl}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const hasPhotos = data.beforePhotoUrl || data.afterPhotoUrl;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
          {/* Privacy toggles */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Privacy options</div>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideStats}
                  onChange={(e) => setHideStats(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#FF6B6B] focus:ring-[#FF6B6B]"
                />
                <span className="text-gray-700 dark:text-gray-300">Hide stats</span>
              </label>
              {hasPhotos && (
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hidePhotos}
                    onChange={(e) => setHidePhotos(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#FF6B6B] focus:ring-[#FF6B6B]"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Hide photos</span>
                </label>
              )}
            </div>
          </div>

          {/* Share Card - This is what gets captured as image */}
          <div
            ref={cardRef}
            className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] p-6 text-white"
          >
            {/* Header with coral gradient */}
            <div className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] -mx-6 -mt-6 px-6 py-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="font-bold text-lg">BAISICS</span>
                </div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  Since {formatDate(data.startDate)}
                </span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold mb-1 text-center">My Progress</h2>
            <p className="text-white/70 text-sm text-center mb-6">
              {data.weeksCompleted} {data.weeksCompleted === 1 ? 'week' : 'weeks'} of training
            </p>

            {/* Photo comparison (optional) */}
            {hasPhotos && !hidePhotos && (
              <div className="flex gap-3 mb-6">
                {data.beforePhotoUrl && (
                  <div className="flex-1">
                    <div className="aspect-square rounded-lg overflow-hidden bg-white/10 mb-1">
                      <img
                        src={data.beforePhotoUrl}
                        alt="Before"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-xs text-white/60 text-center">Before</div>
                  </div>
                )}
                {data.afterPhotoUrl && (
                  <div className="flex-1">
                    <div className="aspect-square rounded-lg overflow-hidden bg-white/10 mb-1">
                      <img
                        src={data.afterPhotoUrl}
                        alt="After"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-xs text-white/60 text-center">After</div>
                  </div>
                )}
              </div>
            )}

            {/* Stats Grid */}
            <div className={`grid gap-3 mb-4 ${hideStats ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {/* Workouts */}
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className={`text-3xl font-bold text-[#FF6B6B] ${hideStats ? 'blur-sm' : ''}`}>
                  {hideStats ? '••' : data.totalWorkouts}
                </div>
                <div className="text-xs text-white/60">Total Workouts</div>
              </div>

              {/* Weight Change (if tracked) */}
              {data.weightChange !== undefined && (
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className={`text-3xl font-bold ${hideStats ? 'blur-sm' : ''} ${
                    data.weightChange > 0 ? 'text-emerald-400' : data.weightChange < 0 ? 'text-sky-400' : 'text-white'
                  }`}>
                    {hideStats ? '•••' : formatWeightChange(data.weightChange)}
                  </div>
                  <div className="text-xs text-white/60">Weight Change</div>
                </div>
              )}
            </div>

            {/* Weight range (if tracked and not hidden) */}
            {data.startWeight && data.currentWeight && !hideStats && (
              <div className="bg-white/10 rounded-xl p-3 text-center mb-4">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="text-white/70">{formatWeight(data.startWeight)}</span>
                  <svg className="w-4 h-4 text-[#FF6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="text-white font-semibold">{formatWeight(data.currentWeight)}</span>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center">
              {data.userName && !hideStats ? (
                <span className="text-xs text-white/40">{data.userName}</span>
              ) : (
                <span className="text-xs text-white/40">baisics.co</span>
              )}
            </div>
          </div>

          {/* Share Actions */}
          <div className="p-6 space-y-4">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Share your progress
            </div>

            <div className="flex gap-3 justify-center">
              {/* Share button */}
              <button
                onClick={handleShare}
                disabled={sharing}
                className="flex items-center gap-2 px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350] transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>

              {/* Twitter/X */}
              <button
                onClick={handleTwitterShare}
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Share on X"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
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

              {/* Download Image */}
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                title="Download image"
              >
                {downloading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
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

export default ProgressShareCard;
