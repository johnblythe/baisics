'use client';

import React, { useState } from 'react';

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

// Activity level options for dropdown
const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary (little/no exercise)' },
  { value: 'light', label: 'Light (1-3 days/week)' },
  { value: 'moderate', label: 'Moderate (3-5 days/week)' },
  { value: 'active', label: 'Active (6-7 days/week)' },
  { value: 'very_active', label: 'Very Active (intense daily)' },
];

// Sex options for dropdown
const SEX_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

// Goal options for dropdown
const GOAL_OPTIONS = [
  { value: 'lose', label: 'Lose Weight' },
  { value: 'maintain', label: 'Maintain Weight' },
  { value: 'gain', label: 'Build Muscle' },
];

interface CalculatorFormValues {
  feet: string;
  inches: string;
  weightLbs: string;
  age: string;
  sex: string;
  activityLevel: string;
  goal: string;
}

interface CalculatedTargets {
  dailyCalories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
}

interface CalculatorFormProps {
  onCalculated: (targets: CalculatedTargets) => void;
  onCollapse?: () => void;
}

export function CalculatorForm({ onCalculated, onCollapse }: CalculatorFormProps) {
  const [values, setValues] = useState<CalculatorFormValues>({
    feet: '',
    inches: '',
    weightLbs: '',
    age: '',
    sex: '',
    activityLevel: '',
    goal: '',
  });
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof CalculatorFormValues, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleNumberChange = (field: keyof CalculatorFormValues, value: string) => {
    // Only allow numbers
    if (value && !/^\d*$/.test(value)) return;
    handleChange(field, value);
  };

  const handleCalculate = async () => {
    // Validate required fields
    const missingFields: string[] = [];
    if (!values.feet && !values.inches) missingFields.push('height');
    if (!values.weightLbs) missingFields.push('weight');
    if (!values.age) missingFields.push('age');
    if (!values.sex) missingFields.push('sex');
    if (!values.activityLevel) missingFields.push('activity level');
    if (!values.goal) missingFields.push('goal');

    if (missingFields.length > 0) {
      setError(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    setCalculating(true);
    setError(null);

    try {
      const response = await fetch('/api/nutrition-plan/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          height: {
            feet: parseInt(values.feet, 10) || 0,
            inches: parseInt(values.inches, 10) || 0,
          },
          weight: {
            lbs: parseInt(values.weightLbs, 10),
          },
          age: parseInt(values.age, 10),
          sex: values.sex,
          activityLevel: values.activityLevel,
          goal: values.goal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate targets');
      }

      // Pass calculated targets to parent
      onCalculated(data.suggested);
      onCollapse?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate');
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Height */}
      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: COLORS.gray600 }}
        >
          Height
        </label>
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <input
                type="text"
                inputMode="numeric"
                value={values.feet}
                onChange={(e) => handleNumberChange('feet', e.target.value)}
                placeholder="5"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                style={{ borderColor: COLORS.gray100 }}
              />
              <span className="text-sm" style={{ color: COLORS.gray400 }}>ft</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <input
                type="text"
                inputMode="numeric"
                value={values.inches}
                onChange={(e) => handleNumberChange('inches', e.target.value)}
                placeholder="8"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                style={{ borderColor: COLORS.gray100 }}
              />
              <span className="text-sm" style={{ color: COLORS.gray400 }}>in</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weight and Age */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: COLORS.gray600 }}
          >
            Weight (lbs)
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={values.weightLbs}
            onChange={(e) => handleNumberChange('weightLbs', e.target.value)}
            placeholder="165"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
            style={{ borderColor: COLORS.gray100 }}
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: COLORS.gray600 }}
          >
            Age
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={values.age}
            onChange={(e) => handleNumberChange('age', e.target.value)}
            placeholder="30"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
            style={{ borderColor: COLORS.gray100 }}
          />
        </div>
      </div>

      {/* Sex dropdown */}
      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: COLORS.gray600 }}
        >
          Sex
        </label>
        <select
          value={values.sex}
          onChange={(e) => handleChange('sex', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors appearance-none bg-white"
          style={{ borderColor: COLORS.gray100 }}
        >
          <option value="">Select...</option>
          {SEX_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Activity Level dropdown */}
      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: COLORS.gray600 }}
        >
          Activity Level
        </label>
        <select
          value={values.activityLevel}
          onChange={(e) => handleChange('activityLevel', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors appearance-none bg-white"
          style={{ borderColor: COLORS.gray100 }}
        >
          <option value="">Select...</option>
          {ACTIVITY_LEVELS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Goal dropdown */}
      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: COLORS.gray600 }}
        >
          Goal
        </label>
        <select
          value={values.goal}
          onChange={(e) => handleChange('goal', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors appearance-none bg-white"
          style={{ borderColor: COLORS.gray100 }}
        >
          <option value="">Select...</option>
          {GOAL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Error message */}
      {error && (
        <div
          className="px-3 py-2 rounded-lg text-sm"
          style={{ backgroundColor: COLORS.coralLight, color: COLORS.coralDark }}
        >
          {error}
        </div>
      )}

      {/* Calculate button */}
      <button
        onClick={handleCalculate}
        disabled={calculating}
        className="w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{
          backgroundColor: COLORS.navyLight,
          color: COLORS.white,
        }}
      >
        {calculating ? (
          <>
            <div
              className="w-4 h-4 border-2 rounded-full animate-spin"
              style={{
                borderColor: 'rgba(255,255,255,0.3)',
                borderTopColor: COLORS.white,
              }}
            />
            Calculating...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Calculate My Targets
          </>
        )}
      </button>
    </div>
  );
}

export default CalculatorForm;
