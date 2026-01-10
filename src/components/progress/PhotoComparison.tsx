'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Calendar } from 'lucide-react';

interface Photo {
  id: string;
  base64Data: string;
  type: 'FRONT' | 'BACK' | 'SIDE_LEFT' | 'SIDE_RIGHT' | 'CUSTOM' | null;
  createdAt: string;
}

interface CheckInWithPhotos {
  id: string;
  date: string;
  photos: Photo[];
}

interface PhotoComparisonProps {
  programId: string;
  onClose?: () => void;
}

type PhotoType = 'FRONT' | 'BACK' | 'SIDE_LEFT' | 'SIDE_RIGHT';

const PHOTO_TYPE_LABELS: Record<PhotoType, string> = {
  FRONT: 'Front',
  BACK: 'Back',
  SIDE_LEFT: 'Left Side',
  SIDE_RIGHT: 'Right Side',
};

const COLORS = {
  coral: '#FF6B6B',
  coralDark: '#EF5350',
  coralLight: '#FFE5E5',
  navy: '#0F172A',
  navyLight: '#1E293B',
};

export function PhotoComparison({ programId, onClose }: PhotoComparisonProps) {
  const [checkIns, setCheckIns] = useState<CheckInWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [beforeDate, setBeforeDate] = useState<string>('');
  const [afterDate, setAfterDate] = useState<string>('');
  const [selectedType, setSelectedType] = useState<PhotoType>('FRONT');

  // Fetch check-ins with photos
  useEffect(() => {
    if (!programId) return;

    async function fetchCheckInsWithPhotos() {
      setLoading(true);
      try {
        const response = await fetch(`/api/programs/${programId}/progress-photos/compare`);
        const data = await response.json();
        const fetchedCheckIns = data.checkIns || [];
        setCheckIns(fetchedCheckIns);

        // Auto-select first and last check-ins with photos
        if (fetchedCheckIns.length >= 2) {
          setBeforeDate(fetchedCheckIns[0].date.split('T')[0]);
          setAfterDate(fetchedCheckIns[fetchedCheckIns.length - 1].date.split('T')[0]);
        } else if (fetchedCheckIns.length === 1) {
          setBeforeDate(fetchedCheckIns[0].date.split('T')[0]);
        }
      } catch (error) {
        console.error('Failed to fetch check-ins with photos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCheckInsWithPhotos();
  }, [programId]);

  // Get available dates that have check-ins with photos
  const availableDates = useMemo(() => {
    return checkIns.map(c => c.date.split('T')[0]);
  }, [checkIns]);

  // Find check-ins by selected dates
  const beforeCheckIn = useMemo(() => {
    return checkIns.find(c => c.date.split('T')[0] === beforeDate);
  }, [checkIns, beforeDate]);

  const afterCheckIn = useMemo(() => {
    return checkIns.find(c => c.date.split('T')[0] === afterDate);
  }, [checkIns, afterDate]);

  // Get photos for selected check-ins (memoized to avoid dependency issues)
  const beforePhotos = useMemo(() => {
    return beforeCheckIn?.photos || [];
  }, [beforeCheckIn]);

  const afterPhotos = useMemo(() => {
    return afterCheckIn?.photos || [];
  }, [afterCheckIn]);

  const beforePhoto = beforePhotos.find(p => p.type === selectedType);
  const afterPhoto = afterPhotos.find(p => p.type === selectedType);

  // Get available photo types from both check-ins
  const availableTypes = useMemo(() => {
    return Array.from(new Set([
      ...beforePhotos.map(p => p.type),
      ...afterPhotos.map(p => p.type),
    ])).filter((t): t is PhotoType => t !== null && t !== 'CUSTOM');
  }, [beforePhotos, afterPhotos]);

  // Set first available type when types change
  useEffect(() => {
    if (availableTypes.length > 0 && !availableTypes.includes(selectedType)) {
      setSelectedType(availableTypes[0]);
    }
  }, [availableTypes, selectedType]);

  const formatDateForDisplay = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get min/max dates for date pickers
  const minDate = availableDates.length > 0 ? availableDates[0] : undefined;
  const maxDate = availableDates.length > 0 ? availableDates[availableDates.length - 1] : undefined;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div
          className="w-8 h-8 border-t-2 border-solid rounded-full animate-spin"
          style={{ borderColor: COLORS.coral }}
        />
      </div>
    );
  }

  if (checkIns.length < 2) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-600 text-lg mb-2">
          Not enough photos to compare
        </p>
        <p className="text-gray-500 text-sm">
          Complete at least 2 check-ins with photos to see your progress
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Pickers */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Before date picker */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Before
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={beforeDate}
              onChange={(e) => setBeforeDate(e.target.value)}
              min={minDate}
              max={afterDate || maxDate}
              list="before-dates"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:outline-none"
              style={{ '--tw-ring-color': COLORS.coral } as React.CSSProperties}
            />
            <datalist id="before-dates">
              {availableDates.map(date => (
                <option key={date} value={date} />
              ))}
            </datalist>
          </div>
          {beforeDate && !beforeCheckIn && (
            <p className="mt-1 text-xs text-amber-600">
              No check-in on this date. Choose a highlighted date.
            </p>
          )}
        </div>

        {/* After date picker */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            After
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={afterDate}
              onChange={(e) => setAfterDate(e.target.value)}
              min={beforeDate || minDate}
              max={maxDate}
              list="after-dates"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:outline-none"
              style={{ '--tw-ring-color': COLORS.coral } as React.CSSProperties}
            />
            <datalist id="after-dates">
              {availableDates.map(date => (
                <option key={date} value={date} />
              ))}
            </datalist>
          </div>
          {afterDate && !afterCheckIn && (
            <p className="mt-1 text-xs text-amber-600">
              No check-in on this date. Choose a highlighted date.
            </p>
          )}
        </div>
      </div>

      {/* Photo type tabs */}
      {availableTypes.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {availableTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: selectedType === type ? COLORS.coralLight : '#f3f4f6',
                color: selectedType === type ? COLORS.coralDark : '#4b5563',
              }}
            >
              {PHOTO_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      )}

      {/* Photo Comparison - side-by-side on desktop, stacked on mobile */}
      {beforeCheckIn && afterCheckIn && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before Photo */}
          <div className="space-y-2">
            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
              {beforePhoto ? (
                <Image
                  src={beforePhoto.base64Data}
                  alt={`Before - ${PHOTO_TYPE_LABELS[selectedType]}`}
                  width={400}
                  height={533}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span>No {PHOTO_TYPE_LABELS[selectedType]} photo</span>
                </div>
              )}
            </div>
            {/* Date label under photo */}
            <div className="text-center">
              <span
                className="inline-block px-3 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: COLORS.coralLight, color: COLORS.coralDark }}
              >
                Before
              </span>
              <p className="text-sm text-gray-500 mt-1">
                {formatDateForDisplay(beforeDate)}
              </p>
            </div>
          </div>

          {/* After Photo */}
          <div className="space-y-2">
            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
              {afterPhoto ? (
                <Image
                  src={afterPhoto.base64Data}
                  alt={`After - ${PHOTO_TYPE_LABELS[selectedType]}`}
                  width={400}
                  height={533}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span>No {PHOTO_TYPE_LABELS[selectedType]} photo</span>
                </div>
              )}
            </div>
            {/* Date label under photo */}
            <div className="text-center">
              <span
                className="inline-block px-3 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: COLORS.coral, color: 'white' }}
              >
                After
              </span>
              <p className="text-sm text-gray-500 mt-1">
                {formatDateForDisplay(afterDate)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Close button if onClose provided */}
      {onClose && (
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: COLORS.coral }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default PhotoComparison;
