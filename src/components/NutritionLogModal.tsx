'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

interface NutritionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  initialDate?: Date;
}

type TabType = 'quick' | 'screenshot';

interface NutritionValues {
  protein: string;
  carbs: string;
  fats: string;
  calories: string;
}

interface ExistingLog {
  id: string;
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
  notes: string | null;
}

export function NutritionLogModal({
  isOpen,
  onClose,
  onSaved,
  initialDate,
}: NutritionLogModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('quick');
  const [values, setValues] = useState<NutritionValues>({
    protein: '',
    carbs: '',
    fats: '',
    calories: '',
  });
  const [date, setDate] = useState<string>(
    (initialDate || new Date()).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [existingLog, setExistingLog] = useState<ExistingLog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parseWarning, setParseWarning] = useState<string | null>(null);
  const [parseConfidence, setParseConfidence] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing log for the selected date
  const fetchExistingLog = useCallback(async (selectedDate: string) => {
    setLoadingExisting(true);
    setExistingLog(null);

    try {
      const response = await fetch(
        `/api/nutrition/history?startDate=${selectedDate}&endDate=${selectedDate}&limit=1`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.logs && data.logs.length > 0) {
          const log = data.logs[0];
          setExistingLog(log);
          // Pre-fill form with existing values
          setValues({
            protein: log.protein.toString(),
            carbs: log.carbs.toString(),
            fats: log.fats.toString(),
            calories: log.calories.toString(),
          });
          setNotes(log.notes || '');
        } else {
          // No existing log - clear form
          setValues({ protein: '', carbs: '', fats: '', calories: '' });
          setNotes('');
        }
      }
    } catch (err) {
      console.error('Failed to fetch existing log:', err);
    } finally {
      setLoadingExisting(false);
    }
  }, []);

  // Fetch existing log when modal opens or date changes
  useEffect(() => {
    if (isOpen && date) {
      fetchExistingLog(date);
    }
  }, [isOpen, date, fetchExistingLog]);

  // Handle date change
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    setParseConfidence(null);
    setParseWarning(null);
    setError(null);
  };

  const handleValueChange = (field: keyof NutritionValues, value: string) => {
    // Only allow numbers
    if (value && !/^\d*$/.test(value)) return;

    setValues(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-compute calories when macros change
      if (field !== 'calories') {
        const p = parseInt(updated.protein, 10) || 0;
        const c = parseInt(updated.carbs, 10) || 0;
        const f = parseInt(updated.fats, 10) || 0;
        if (p || c || f) {
          updated.calories = String(p * 4 + c * 4 + f * 9);
        }
      }

      return updated;
    });
    setError(null);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const processImage = async (file: File) => {
    setParsing(true);
    setError(null);
    setParseWarning(null);
    setParseConfidence(null);

    try {
      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64 = await base64Promise;

      // Send to parse API
      const response = await fetch('/api/nutrition/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse screenshot');
      }

      // Check if we got any macros
      const hasMacros = data.protein != null || data.carbs != null || data.fats != null;

      // Handle errors and warnings from API
      if (data.error) {
        if (hasMacros) {
          // Show as warning - user can proceed but is informed of potential issues
          setParseWarning(data.error);
        } else {
          // No macros extracted - show as blocking error
          setError(data.error);
          return;
        }
      }

      // Show warning from API if present (non-blocking)
      if (data.warning) {
        setParseWarning(data.warning);
      }

      // Pre-fill form with parsed values
      // Compute calories from macros to ensure consistency (same formula as handleValueChange)
      const p = parseInt(data.protein, 10) || 0;
      const c = parseInt(data.carbs, 10) || 0;
      const f = parseInt(data.fats, 10) || 0;
      const computedCalories = (p || c || f) ? String(p * 4 + c * 4 + f * 9) : '';

      setValues({
        protein: data.protein?.toString() || '',
        carbs: data.carbs?.toString() || '',
        fats: data.fats?.toString() || '',
        calories: computedCalories,
      });
      setParseConfidence(data.confidence);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse screenshot');
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        processImage(file);
      } else {
        setError('Please upload an image file');
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImage(e.target.files[0]);
    }
  };

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          processImage(file);
          break;
        }
      }
    }
  }, []);

  // Listen for paste events when screenshot tab is active
  React.useEffect(() => {
    if (isOpen && activeTab === 'screenshot') {
      document.addEventListener('paste', handlePaste);
      return () => document.removeEventListener('paste', handlePaste);
    }
  }, [isOpen, activeTab, handlePaste]);

  const handleSave = async () => {
    const hasMacros = values.protein || values.carbs || values.fats;
    const hasCalories = values.calories;

    // Must have either macros or calories
    if (!hasMacros && !hasCalories) {
      setError('Enter macros (P/C/F) or calories');
      return;
    }

    setSaving(true);
    setError(null);

    // Compute calories from macros if not provided
    const p = parseInt(values.protein, 10) || 0;
    const c = parseInt(values.carbs, 10) || 0;
    const f = parseInt(values.fats, 10) || 0;
    const computedCalories = p * 4 + c * 4 + f * 9;
    const finalCalories = hasCalories ? parseInt(values.calories, 10) : computedCalories;

    try {
      const response = await fetch('/api/nutrition/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          protein: p,
          carbs: c,
          fats: f,
          calories: finalCalories,
          source: activeTab === 'screenshot' ? 'screenshot' : 'manual',
          notes: notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save nutrition log');
      }

      onSaved?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    // Reset state
    setValues({ protein: '', carbs: '', fats: '', calories: '' });
    setNotes('');
    setError(null);
    setParseWarning(null);
    setParseConfidence(null);
    setActiveTab('quick');
    setExistingLog(null);
    setLoadingExisting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">
                Log Nutrition
              </h2>
              <p className="text-sm text-[#94A3B8] mt-1">
                Track your daily macros
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-[#94A3B8] hover:text-[#475569] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#E2E8F0]">
            <button
              onClick={() => setActiveTab('quick')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'quick'
                  ? 'text-[#FF6B6B] border-b-2 border-[#FF6B6B] bg-[#FFF5F5]'
                  : 'text-[#94A3B8] hover:text-[#475569]'
              }`}
            >
              Quick Entry
            </button>
            <button
              onClick={() => setActiveTab('screenshot')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'screenshot'
                  ? 'text-[#FF6B6B] border-b-2 border-[#FF6B6B] bg-[#FFF5F5]'
                  : 'text-[#94A3B8] hover:text-[#475569]'
              }`}
            >
              📷 Screenshot Import
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Screenshot drop zone (only show when screenshot tab is active and no values yet) */}
            {activeTab === 'screenshot' && !values.calories && (
              <div
                className={`mb-6 border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-[#FF6B6B] bg-[#FFF5F5]'
                    : 'border-[#E2E8F0] hover:border-[#FF6B6B]'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {parsing ? (
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-t-2 border-[#FF6B6B] border-solid rounded-full animate-spin mb-3" />
                    <p className="text-[#475569]">Analyzing screenshot...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#F8FAFC] flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-[#475569] font-medium mb-1">
                      Paste or drop MFP screenshot
                    </p>
                    <p className="text-sm text-[#94A3B8]">
                      or click to select file
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Parse confidence indicator */}
            {parseConfidence && (
              <div className={`mb-4 px-3 py-2 rounded-lg text-sm ${
                parseConfidence === 'high'
                  ? 'bg-green-50 text-green-700'
                  : parseConfidence === 'medium'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-red-50 text-red-700'
              }`}>
                {parseConfidence === 'high' && '✓ Values extracted with high confidence'}
                {parseConfidence === 'medium' && '⚠ Some values may need verification'}
                {parseConfidence === 'low' && '⚠ Please verify extracted values'}
              </div>
            )}

            {/* Parse warning - shown when we got data but with caveats */}
            {parseWarning && (
              <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{parseWarning}</span>
              </div>
            )}

            {/* Loading existing data indicator */}
            {loadingExisting && (
              <div className="mb-4 flex items-center gap-2 text-sm text-[#94A3B8]">
                <div className="w-4 h-4 border-t-2 border-[#94A3B8] border-solid rounded-full animate-spin" />
                Loading existing data...
              </div>
            )}

            {/* Existing log info banner */}
            {existingLog && !loadingExisting && (
              <div className="mb-4 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>
                  You&apos;ve already logged for this date. Saving will update your existing entry.
                </span>
              </div>
            )}

            {/* Macro inputs */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[#475569] mb-1">
                  Protein (g)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={values.protein}
                  onChange={(e) => handleValueChange('protein', e.target.value)}
                  placeholder="180"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#475569] mb-1">
                  Carbs (g)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={values.carbs}
                  onChange={(e) => handleValueChange('carbs', e.target.value)}
                  placeholder="165"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#475569] mb-1">
                  Fats (g)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={values.fats}
                  onChange={(e) => handleValueChange('fats', e.target.value)}
                  placeholder="88"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#475569] mb-1">
                  Calories
                  {(values.protein || values.carbs || values.fats) && (
                    <span className="ml-1 text-xs text-[#94A3B8] font-normal">(computed)</span>
                  )}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={values.calories}
                  onChange={(e) => handleValueChange('calories', e.target.value)}
                  placeholder="2200"
                  readOnly={!!(values.protein || values.carbs || values.fats)}
                  className={`w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent ${
                    (values.protein || values.carbs || values.fats) ? 'bg-[#F8FAFC] text-[#64748B]' : ''
                  }`}
                />
              </div>
            </div>

            {/* Date picker */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#475569] mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
              />
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#475569] mb-1">
                Notes <span className="text-[#94A3B8] font-normal">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., High protein day, post-workout meal..."
                rows={2}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent resize-none"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving || (!values.protein && !values.carbs && !values.fats && !values.calories)}
              className="w-full py-3 bg-[#FF6B6B] text-white font-medium rounded-xl hover:bg-[#EF5350] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                existingLog ? 'Update Entry' : 'Save Entry'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NutritionLogModal;
