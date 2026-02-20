'use client';

import React, { useState, useEffect } from 'react';

// Colors matching v2a design system
const COLORS = {
  white: '#FFFFFF',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray400: '#94A3B8',
  gray600: '#475569',
  navy: '#0F172A',
  navyLight: '#1E293B',
  coral: '#FF6B6B',
  coralDark: '#EF5350',
  coralLight: '#FFE5E5',
};

// Primary goal options for dropdown
const PRIMARY_GOAL_OPTIONS = [
  { value: 'LOSE_WEIGHT', label: 'Lose Weight' },
  { value: 'BUILD_MUSCLE', label: 'Build Muscle' },
  { value: 'MAINTAIN', label: 'Maintain Weight' },
  { value: 'HEALTH', label: 'General Health' },
];

interface GoalFormValues {
  primaryGoal: string;
  targetWeight: string;
  timeframe: string;
}

interface GoalFormProps {
  onSaved?: () => void;
  onCollapse?: () => void;
}

export function GoalForm({ onSaved, onCollapse }: GoalFormProps) {
  const [values, setValues] = useState<GoalFormValues>({
    primaryGoal: '',
    targetWeight: '',
    timeframe: '',
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasExistingGoal, setHasExistingGoal] = useState(false);

  // Load existing goal on mount
  useEffect(() => {
    fetchCurrentGoal();
  }, []);

  const fetchCurrentGoal = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/goal');
      if (response.ok) {
        const data = await response.json();
        if (data.goal) {
          setValues({
            primaryGoal: data.goal.primaryGoal || '',
            targetWeight: data.goal.targetWeight?.toString() || '',
            timeframe: data.goal.timeframe || '',
          });
          setHasExistingGoal(true);
        }
      }
    } catch (err) {
      console.error('Failed to fetch goal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof GoalFormValues, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleNumberChange = (field: keyof GoalFormValues, value: string) => {
    // Only allow numbers and decimal point
    if (value && !/^\d*\.?\d*$/.test(value)) return;
    handleChange(field, value);
  };

  const handleSave = async () => {
    // Validate required field
    if (!values.primaryGoal) {
      setError('Please select a fitness goal');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryGoal: values.primaryGoal,
          targetWeight: values.targetWeight ? parseFloat(values.targetWeight) : undefined,
          timeframe: values.timeframe || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save goal');
      }

      setSuccess(true);
      onSaved?.();
      // Auto-collapse after brief success message
      setTimeout(() => {
        onCollapse?.();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div
          className="w-5 h-5 border-2 rounded-full animate-spin"
          style={{
            borderColor: COLORS.gray100,
            borderTopColor: COLORS.coral,
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Primary Goal dropdown */}
      <div>
        <label
          htmlFor="goal-primary"
          className="block text-sm font-medium mb-1"
          style={{ color: COLORS.gray600 }}
        >
          What&apos;s your primary fitness goal?
        </label>
        <select
          id="goal-primary"
          value={values.primaryGoal}
          onChange={(e) => handleChange('primaryGoal', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors appearance-none bg-white"
          style={{ borderColor: COLORS.gray100 }}
        >
          <option value="">Select your goal...</option>
          {PRIMARY_GOAL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Target Weight - optional */}
      <div>
        <label
          htmlFor="goal-target-weight"
          className="block text-sm font-medium mb-1"
          style={{ color: COLORS.gray600 }}
        >
          Target Weight (optional)
        </label>
        <div className="flex items-center gap-2">
          <input
            id="goal-target-weight"
            type="text"
            inputMode="decimal"
            value={values.targetWeight}
            onChange={(e) => handleNumberChange('targetWeight', e.target.value)}
            placeholder="165"
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
            style={{ borderColor: COLORS.gray100 }}
          />
          <span className="text-sm" style={{ color: COLORS.gray400 }}>lbs</span>
        </div>
      </div>

      {/* Timeframe - optional */}
      <div>
        <label
          htmlFor="goal-timeframe"
          className="block text-sm font-medium mb-1"
          style={{ color: COLORS.gray600 }}
        >
          Timeframe (optional)
        </label>
        <input
          id="goal-timeframe"
          type="text"
          value={values.timeframe}
          onChange={(e) => handleChange('timeframe', e.target.value)}
          placeholder="e.g., 3 months, by summer"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
          style={{ borderColor: COLORS.gray100 }}
        />
      </div>

      {/* Success message */}
      {success && (
        <div
          className="px-3 py-2 rounded-lg text-sm flex items-center gap-2"
          style={{ backgroundColor: '#DCFCE7', color: '#166534' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Goal saved!
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          className="px-3 py-2 rounded-lg text-sm"
          style={{ backgroundColor: COLORS.coralLight, color: COLORS.coralDark }}
        >
          {error}
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{
          backgroundColor: COLORS.navyLight,
          color: COLORS.white,
        }}
      >
        {saving ? (
          <>
            <div
              className="w-4 h-4 border-2 rounded-full animate-spin"
              style={{
                borderColor: 'rgba(255,255,255,0.3)',
                borderTopColor: COLORS.white,
              }}
            />
            {hasExistingGoal ? 'Updating...' : 'Saving...'}
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {hasExistingGoal ? 'Update Goal' : 'Save Goal'}
          </>
        )}
      </button>
    </div>
  );
}

export default GoalForm;
