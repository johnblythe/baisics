'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface Photo {
  id: string;
  base64Data: string;
  type: 'FRONT' | 'BACK' | 'SIDE_LEFT' | 'SIDE_RIGHT' | 'CUSTOM' | null;
  createdAt: string;
  checkInDate?: string;
}

interface CheckInWithPhotos {
  id: string;
  date: string;
  photos: Photo[];
}

interface PhotoComparisonProps {
  programId: string;
  isOpen: boolean;
  onClose: () => void;
}

type ViewMode = 'side-by-side' | 'slider';
type PhotoType = 'FRONT' | 'BACK' | 'SIDE_LEFT' | 'SIDE_RIGHT';

const PHOTO_TYPE_LABELS: Record<PhotoType, string> = {
  FRONT: 'Front',
  BACK: 'Back',
  SIDE_LEFT: 'Left Side',
  SIDE_RIGHT: 'Right Side',
};

export function PhotoComparison({ programId, isOpen, onClose }: PhotoComparisonProps) {
  const [checkIns, setCheckIns] = useState<CheckInWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [beforeCheckIn, setBeforeCheckIn] = useState<string | null>(null);
  const [afterCheckIn, setAfterCheckIn] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<PhotoType>('FRONT');
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side');
  const [sliderPosition, setSliderPosition] = useState(50);

  useEffect(() => {
    if (!isOpen || !programId) return;

    async function fetchCheckInsWithPhotos() {
      setLoading(true);
      try {
        const response = await fetch(`/api/programs/${programId}/progress-photos/compare`);
        const data = await response.json();
        setCheckIns(data.checkIns || []);

        // Auto-select first and last check-ins if available
        if (data.checkIns?.length >= 2) {
          setBeforeCheckIn(data.checkIns[0].id);
          setAfterCheckIn(data.checkIns[data.checkIns.length - 1].id);
        } else if (data.checkIns?.length === 1) {
          setBeforeCheckIn(data.checkIns[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch check-ins with photos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCheckInsWithPhotos();
  }, [isOpen, programId]);

  const beforePhotos = checkIns.find(c => c.id === beforeCheckIn)?.photos || [];
  const afterPhotos = checkIns.find(c => c.id === afterCheckIn)?.photos || [];

  const beforePhoto = beforePhotos.find(p => p.type === selectedType);
  const afterPhoto = afterPhotos.find(p => p.type === selectedType);

  const beforeDate = checkIns.find(c => c.id === beforeCheckIn)?.date;
  const afterDate = checkIns.find(c => c.id === afterCheckIn)?.date;

  // Get available photo types from both check-ins
  const availableTypes = Array.from(new Set([
    ...beforePhotos.map(p => p.type),
    ...afterPhotos.map(p => p.type),
  ])).filter((t): t is PhotoType => t !== null && t !== 'CUSTOM');

  const handleSliderDrag = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Compare Progress Photos
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-t-2 border-indigo-500 border-solid rounded-full animate-spin" />
              </div>
            ) : checkIns.length < 2 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
                  Not enough photos to compare
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm">
                  Complete at least 2 check-ins with photos to see your progress
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Before selector */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Before
                    </label>
                    <select
                      value={beforeCheckIn || ''}
                      onChange={(e) => setBeforeCheckIn(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select check-in...</option>
                      {checkIns.map((checkIn) => (
                        <option key={checkIn.id} value={checkIn.id}>
                          {new Date(checkIn.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })} ({checkIn.photos.length} photos)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* After selector */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      After
                    </label>
                    <select
                      value={afterCheckIn || ''}
                      onChange={(e) => setAfterCheckIn(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select check-in...</option>
                      {checkIns.map((checkIn) => (
                        <option key={checkIn.id} value={checkIn.id}>
                          {new Date(checkIn.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })} ({checkIn.photos.length} photos)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* View mode toggle */}
                  <div className="flex-shrink-0">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      View
                    </label>
                    <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                      <button
                        onClick={() => setViewMode('side-by-side')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          viewMode === 'side-by-side'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        Side by Side
                      </button>
                      <button
                        onClick={() => setViewMode('slider')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          viewMode === 'slider'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        Slider
                      </button>
                    </div>
                  </div>
                </div>

                {/* Photo type tabs */}
                {availableTypes.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {availableTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedType === type
                            ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {PHOTO_TYPE_LABELS[type]}
                      </button>
                    ))}
                  </div>
                )}

                {/* Comparison View */}
                {beforeCheckIn && afterCheckIn && (
                  <div className="mt-4">
                    {viewMode === 'side-by-side' ? (
                      <div className="grid grid-cols-2 gap-4">
                        {/* Before */}
                        <div className="space-y-2">
                          <div className="text-center">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Before</span>
                            {beforeDate && (
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {new Date(beforeDate).toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </p>
                            )}
                          </div>
                          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            {beforePhoto ? (
                              <Image
                                src={beforePhoto.base64Data}
                                alt={`Before - ${selectedType}`}
                                width={400}
                                height={533}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                                <span>No {PHOTO_TYPE_LABELS[selectedType]} photo</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* After */}
                        <div className="space-y-2">
                          <div className="text-center">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">After</span>
                            {afterDate && (
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {new Date(afterDate).toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </p>
                            )}
                          </div>
                          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            {afterPhoto ? (
                              <Image
                                src={afterPhoto.base64Data}
                                alt={`After - ${selectedType}`}
                                width={400}
                                height={533}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                                <span>No {PHOTO_TYPE_LABELS[selectedType]} photo</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Slider View */
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>Before ({beforeDate && new Date(beforeDate).toLocaleDateString()})</span>
                          <span>After ({afterDate && new Date(afterDate).toLocaleDateString()})</span>
                        </div>
                        <div
                          className="relative aspect-[3/4] max-w-md mx-auto rounded-xl overflow-hidden cursor-ew-resize select-none"
                          onMouseMove={handleSliderDrag}
                          onMouseDown={handleSliderDrag}
                        >
                          {/* After image (background) */}
                          {afterPhoto ? (
                            <Image
                              src={afterPhoto.base64Data}
                              alt={`After - ${selectedType}`}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <span className="text-gray-400">No after photo</span>
                            </div>
                          )}

                          {/* Before image (clipped) */}
                          <div
                            className="absolute inset-0 overflow-hidden"
                            style={{ width: `${sliderPosition}%` }}
                          >
                            {beforePhoto ? (
                              <Image
                                src={beforePhoto.base64Data}
                                alt={`Before - ${selectedType}`}
                                fill
                                className="object-cover"
                                style={{ maxWidth: 'none', width: `${100 / (sliderPosition / 100)}%` }}
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                <span className="text-gray-500">No before photo</span>
                              </div>
                            )}
                          </div>

                          {/* Slider handle */}
                          <div
                            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                          >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                          Drag the slider to compare
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhotoComparison;
