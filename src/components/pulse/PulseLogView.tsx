'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { formatDateForAPI } from '@/lib/date-utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PulsePhoto {
  id: string;
  fileName: string;
  base64Data?: string;
  sortOrder: number;
  createdAt: string;
}

interface Pulse {
  id: string;
  weight: number | null;
  notes: string | null;
  photos: PulsePhoto[];
}

interface Streak {
  current: number;
  longest: number;
}

interface PulseGetResponse {
  pulse: Pulse | null;
  previousWeight: number | null;
  streak: Streak;
}

interface PulseSaveResponse {
  pulse: Pulse;
  streak: Streak & { extended?: boolean };
}

interface LocalPhoto {
  fileName: string;
  base64Data: string;
  preview: string;
}

// ---------------------------------------------------------------------------
// Image compression (inline)
// ---------------------------------------------------------------------------

const compressImage = async (
  file: File,
): Promise<{ fileName: string; base64Data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 1200;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Compression failed'));
            const reader2 = new FileReader();
            reader2.readAsDataURL(blob);
            reader2.onload = () =>
              resolve({
                fileName: file.name,
                base64Data: reader2.result as string,
              });
          },
          'image/jpeg',
          0.7,
        );
      };
    };
    reader.onerror = reject;
  });
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayStr(): string {
  return formatDateForAPI(new Date());
}

function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// SVG Spinner (reusable)
// ---------------------------------------------------------------------------

function Spinner({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PulseLogView() {
  // State -------------------------------------------------------------------
  const [date, setDate] = useState(todayStr);
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [previousWeight, setPreviousWeight] = useState<number | null>(null);
  const [streak, setStreak] = useState<Streak>({ current: 0, longest: 0 });
  const [existingPulse, setExistingPulse] = useState<Pulse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // Fetch pulse for a given date --------------------------------------------
  const fetchPulse = useCallback(async (targetDate: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/pulse?date=${targetDate}`);
      if (!res.ok) throw new Error('Failed to load pulse');
      const data: PulseGetResponse = await res.json();

      setExistingPulse(data.pulse);
      setPreviousWeight(data.previousWeight);
      setStreak(data.streak);

      // Pre-populate if editing an existing pulse
      if (data.pulse) {
        setWeight(data.pulse.weight != null ? String(data.pulse.weight) : '');
        setNotes(data.pulse.notes ?? '');
      } else {
        setWeight('');
        setNotes('');
      }
      // Clear local (unsaved) photos when switching dates
      setPhotos([]);
    } catch (err) {
      console.error(err);
      setError('Could not load pulse data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPulse(date);
  }, [date, fetchPulse]);

  // Cleanup object URLs on unmount ------------------------------------------
  useEffect(() => {
    return () => {
      photos.forEach((p) => URL.revokeObjectURL(p.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers ----------------------------------------------------------------

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeight(e.target.value);
  };

  const processFiles = async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    const existingCount = (existingPulse?.photos?.length ?? 0) + photos.length;
    const remaining = 4 - existingCount;
    if (remaining <= 0) {
      setError('Maximum 4 photos allowed.');
      return;
    }

    const filesToProcess = imageFiles.slice(0, remaining);

    try {
      const compressed = await Promise.all(filesToProcess.map(compressImage));
      const newPhotos: LocalPhoto[] = compressed.map((c) => ({
        ...c,
        preview: c.base64Data,
      }));
      setPhotos((prev) => [...prev, ...newPhotos]);
    } catch {
      setError('Failed to process photo. Try a different image.');
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processFiles(Array.from(files));
    // Reset file input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeLocalPhoto = (index: number) => {
    setPhotos((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const deleteExistingPhoto = async (photoId: string) => {
    setDeletingPhotoId(photoId);
    try {
      const res = await fetch(`/api/pulse/photos/${photoId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      // Optimistically remove from UI
      setExistingPulse((prev) =>
        prev
          ? { ...prev, photos: prev.photos.filter((p) => p.id !== photoId) }
          : null,
      );
    } catch {
      setError('Failed to delete photo.');
    } finally {
      setDeletingPhotoId(null);
    }
  };

  const handleSave = async () => {
    const weightNum = weight ? parseFloat(weight) : undefined;
    if (weightNum !== undefined && (isNaN(weightNum) || weightNum <= 0)) {
      setError('Please enter a valid weight.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const body: Record<string, unknown> = {
        date,
        weight: weightNum ?? null,
        notes: notes.trim() || null,
      };

      if (photos.length > 0) {
        body.photos = photos.map(({ fileName, base64Data }) => ({
          fileName,
          base64Data,
        }));
      }

      const res = await fetch('/api/pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Save failed');
      }

      const data: PulseSaveResponse = await res.json();

      // Update state with response
      setExistingPulse(data.pulse);
      setStreak(data.streak);
      setPhotos([]); // clear local photos — they're saved now

      // Toast feedback
      toast.success('Pulse saved');

      if (data.streak.extended) {
        toast('\uD83D\uDD25 ' + data.streak.current + ' day streak!', {
          icon: '\uD83D\uDD25',
          duration: 3500,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  // Derived -----------------------------------------------------------------

  const parsedWeight = weight ? parseFloat(weight) : null;
  const delta =
    parsedWeight != null && previousWeight != null
      ? parsedWeight - previousWeight
      : null;
  const hasContent =
    weight.trim() !== '' || notes.trim() !== '' || photos.length > 0;
  const totalPhotos =
    (existingPulse?.photos?.length ?? 0) + photos.length;
  const canAddPhoto = totalPhotos < 4;

  // Render ------------------------------------------------------------------

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[#F1F5F9] rounded w-2/3" />
          <div className="h-32 bg-[#F1F5F9] rounded-2xl" />
          <div className="h-24 bg-[#F1F5F9] rounded-2xl" />
          <div className="h-12 bg-[#F1F5F9] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-5">
      {/* ---------------------------------------------------------------- */}
      {/* Header                                                           */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-[#0F172A]"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Daily Pulse
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-[#475569]">
              {formatDisplayDate(date)}
            </span>
            <button
              type="button"
              onClick={() => {
                try {
                  dateInputRef.current?.showPicker();
                } catch {
                  // fallback: focus triggers picker on some browsers
                  dateInputRef.current?.focus();
                }
              }}
              className="text-xs text-[#FF6B6B] cursor-pointer hover:underline font-medium bg-transparent border-none outline-none"
            >
              change
            </button>
            <input
              ref={dateInputRef}
              type="date"
              value={date}
              max={todayStr()}
              onChange={handleDateChange}
              className="absolute w-0 h-0 overflow-hidden opacity-0 pointer-events-none"
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>
        </div>

        {streak.current > 0 && (
          <div
            className="flex items-center gap-1.5 text-[#FF6B6B] font-bold"
            style={{ fontFamily: 'Space Mono, monospace' }}
          >
            <span className="text-lg" aria-hidden="true">
              &#x1F525;
            </span>
            <span className="text-lg">{streak.current}</span>
            <span className="text-xs font-normal text-[#94A3B8]">days</span>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Weight Input                                                     */}
      {/* ---------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-[#F1F5F9] p-6 text-center">
        <div className="flex items-baseline justify-center gap-2">
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            placeholder="---"
            value={weight}
            onChange={handleWeightChange}
            className="w-40 text-4xl font-bold text-center text-[#0F172A] bg-transparent outline-none placeholder:text-[#94A3B8] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            style={{ fontFamily: 'Outfit, sans-serif' }}
            aria-label="Weight"
          />
          <span
            className="text-lg text-[#94A3B8]"
            style={{ fontFamily: 'Space Mono, monospace' }}
          >
            lbs
          </span>
        </div>

        {previousWeight != null && (
          <p className="mt-2 text-sm text-[#94A3B8]">
            Last: {previousWeight}
            {delta != null && delta !== 0 && (
              <span className="ml-1">
                ({delta < 0 ? '\u25BC' : '\u25B2'}{' '}
                {Math.abs(delta).toFixed(1)})
              </span>
            )}
          </p>
        )}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Photo Section                                                    */}
      {/* ---------------------------------------------------------------- */}
      <div
        className={`bg-white rounded-2xl border p-6 transition-colors ${
          isDragging
            ? 'border-[#FF6B6B] bg-[#FFE5E5]/30'
            : 'border-[#F1F5F9]'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Existing photos */}
        {existingPulse?.photos && existingPulse.photos.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {existingPulse.photos.map((photo) => (
              <div key={photo.id} className="relative group aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.base64Data ?? ''}
                  alt={photo.fileName}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => deleteExistingPhoto(photo.id)}
                  disabled={deletingPhotoId === photo.id}
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-[#0F172A] text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity disabled:opacity-50"
                  aria-label={`Delete photo ${photo.fileName}`}
                >
                  {deletingPhotoId === photo.id ? (
                    <Spinner className="w-3.5 h-3.5" />
                  ) : (
                    '\u00D7'
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Local (unsaved) photos */}
        {photos.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {photos.map((photo, idx) => (
              <div key={idx} className="relative group aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.preview}
                  alt={photo.fileName}
                  className="w-full h-full object-cover rounded-lg ring-2 ring-[#FF6B6B]/30"
                />
                <button
                  type="button"
                  onClick={() => removeLocalPhoto(idx)}
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-[#0F172A] text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  aria-label={`Remove photo ${photo.fileName}`}
                >
                  {'\u00D7'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add photo button / drop zone */}
        {canAddPhoto && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed rounded-xl transition-colors ${
              isDragging
                ? 'border-[#FF6B6B] text-[#FF6B6B] bg-[#FFE5E5]/20'
                : 'border-[#F1F5F9] text-[#94A3B8] hover:border-[#FF6B6B] hover:text-[#FF6B6B]'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-sm font-medium">
              {isDragging ? 'Drop photos here' : 'Add Photo'}
            </span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoSelect}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Notes                                                            */}
      {/* ---------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-[#F1F5F9] p-6">
        <textarea
          rows={1}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How are you feeling?"
          className="w-full resize-none text-sm text-[#0F172A] bg-transparent outline-none placeholder:text-[#94A3B8]"
          style={{ fontFamily: 'Outfit, sans-serif' }}
          aria-label="Notes"
        />
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Error message                                                    */}
      {/* ---------------------------------------------------------------- */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 text-center">
          {error}
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Save button                                                      */}
      {/* ---------------------------------------------------------------- */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || (!hasContent && !existingPulse)}
        className="w-full bg-[#FF6B6B] hover:bg-[#EF5350] disabled:bg-[#F1F5F9] disabled:text-[#94A3B8] text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        {saving ? (
          <>
            <Spinner />
            Saving...
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Save Pulse
          </>
        )}
      </button>
    </div>
  );
}
