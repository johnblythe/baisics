'use client';

import React, { useState, useEffect } from 'react';
import { CalculatorForm } from './CalculatorForm';
import { GoalForm } from './GoalForm';

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

// Validation bounds matching POST /api/nutrition-plan
const BOUNDS = {
  dailyCalories: { min: 800, max: 6000 },
  proteinGrams: { min: 30, max: 400 },
  carbGrams: { min: 0, max: 800 },
  fatGrams: { min: 20, max: 300 },
};

interface NutritionValues {
  dailyCalories: string;
  proteinGrams: string;
  carbGrams: string;
  fatGrams: string;
}

interface NutritionTargetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  initialValues?: {
    dailyCalories?: number;
    proteinGrams?: number;
    carbGrams?: number;
    fatGrams?: number;
  };
}

export function NutritionTargetsModal({
  isOpen,
  onClose,
  onSaved,
  initialValues,
}: NutritionTargetsModalProps) {
  const [values, setValues] = useState<NutritionValues>({
    dailyCalories: '',
    proteinGrams: '',
    carbGrams: '',
    fatGrams: '',
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);

  // Load initial values when modal opens or initialValues change
  useEffect(() => {
    if (isOpen) {
      if (initialValues) {
        setValues({
          dailyCalories: initialValues.dailyCalories?.toString() || '',
          proteinGrams: initialValues.proteinGrams?.toString() || '',
          carbGrams: initialValues.carbGrams?.toString() || '',
          fatGrams: initialValues.fatGrams?.toString() || '',
        });
      } else {
        // Fetch current targets if no initial values provided
        fetchCurrentTargets();
      }
      setError(null);
      setValidationErrors([]);
    }
  }, [isOpen, initialValues]);

  const fetchCurrentTargets = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/nutrition-plan');
      if (response.ok) {
        const data = await response.json();
        if (data.plan && !data.isDefault) {
          setValues({
            dailyCalories: data.plan.dailyCalories?.toString() || '',
            proteinGrams: data.plan.proteinGrams?.toString() || '',
            carbGrams: data.plan.carbGrams?.toString() || '',
            fatGrams: data.plan.fatGrams?.toString() || '',
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch current targets:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate calories from macros: P*4 + C*4 + F*9
  const calculateCaloriesFromMacros = (protein: string, carbs: string, fat: string): string => {
    const p = parseInt(protein, 10) || 0;
    const c = parseInt(carbs, 10) || 0;
    const f = parseInt(fat, 10) || 0;
    if (p === 0 && c === 0 && f === 0) return '';
    return String(Math.round(p * 4 + c * 4 + f * 9));
  };

  const handleValueChange = (field: keyof NutritionValues, value: string) => {
    // Only allow numbers
    if (value && !/^\d*$/.test(value)) return;
    setError(null);
    setValidationErrors([]);

    // If user edits calories directly, clear macros (kcal-only mode)
    if (field === 'dailyCalories') {
      setValues({
        dailyCalories: value,
        proteinGrams: '',
        carbGrams: '',
        fatGrams: '',
      });
      return;
    }

    // If user edits macros, auto-calculate calories
    const newValues = { ...values, [field]: value };
    const calculatedCalories = calculateCaloriesFromMacros(
      field === 'proteinGrams' ? value : newValues.proteinGrams,
      field === 'carbGrams' ? value : newValues.carbGrams,
      field === 'fatGrams' ? value : newValues.fatGrams
    );
    setValues({
      ...newValues,
      dailyCalories: calculatedCalories,
    });
  };

  const validateValues = (): boolean => {
    const errors: string[] = [];
    const cal = parseInt(values.dailyCalories, 10) || 0;
    const protein = parseInt(values.proteinGrams, 10) || 0;
    const carbs = parseInt(values.carbGrams, 10) || 0;
    const fat = parseInt(values.fatGrams, 10) || 0;

    // Calories is always required
    if (!values.dailyCalories) {
      errors.push('Daily calories is required');
    }

    // Check calorie bounds
    if (values.dailyCalories && (cal < BOUNDS.dailyCalories.min || cal > BOUNDS.dailyCalories.max)) {
      errors.push(`Calories must be ${BOUNDS.dailyCalories.min}-${BOUNDS.dailyCalories.max}`);
    }

    // Macros are optional (kcal-only mode), but if provided, check bounds
    const hasMacros = values.proteinGrams || values.carbGrams || values.fatGrams;
    if (hasMacros) {
      // If any macro is set, all should be set
      if (!values.proteinGrams) errors.push('Protein is required when using macros');
      if (!values.carbGrams && values.carbGrams !== '0') errors.push('Carbs is required when using macros');
      if (!values.fatGrams) errors.push('Fat is required when using macros');

      // Check macro bounds
      if (values.proteinGrams && (protein < BOUNDS.proteinGrams.min || protein > BOUNDS.proteinGrams.max)) {
        errors.push(`Protein must be ${BOUNDS.proteinGrams.min}-${BOUNDS.proteinGrams.max}g`);
      }
      if ((values.carbGrams || values.carbGrams === '0') && (carbs < BOUNDS.carbGrams.min || carbs > BOUNDS.carbGrams.max)) {
        errors.push(`Carbs must be ${BOUNDS.carbGrams.min}-${BOUNDS.carbGrams.max}g`);
      }
      if (values.fatGrams && (fat < BOUNDS.fatGrams.min || fat > BOUNDS.fatGrams.max)) {
        errors.push(`Fat must be ${BOUNDS.fatGrams.min}-${BOUNDS.fatGrams.max}g`);
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = async () => {
    if (!validateValues()) return;

    setSaving(true);
    setError(null);

    const dailyCalories = parseInt(values.dailyCalories, 10);
    const hasMacros = values.proteinGrams || values.carbGrams || values.fatGrams;

    // If kcal-only mode, calculate default macro distribution
    // 30% protein, 40% carbs, 30% fat
    const proteinGrams = hasMacros
      ? parseInt(values.proteinGrams, 10)
      : Math.round((dailyCalories * 0.30) / 4);
    const carbGrams = hasMacros
      ? parseInt(values.carbGrams, 10)
      : Math.round((dailyCalories * 0.40) / 4);
    const fatGrams = hasMacros
      ? parseInt(values.fatGrams, 10)
      : Math.round((dailyCalories * 0.30) / 9);

    try {
      const response = await fetch('/api/nutrition-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dailyCalories,
          proteinGrams,
          carbGrams,
          fatGrams,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          setValidationErrors(data.errors);
        } else {
          throw new Error(data.error || 'Failed to save nutrition targets');
        }
        return;
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
    setValues({ dailyCalories: '', proteinGrams: '', carbGrams: '', fatGrams: '' });
    setError(null);
    setValidationErrors([]);
    setShowCalculator(false);
    setShowGoalForm(false);
    onClose();
  };

  const handleCalculated = (targets: {
    dailyCalories: number;
    proteinGrams: number;
    carbGrams: number;
    fatGrams: number;
  }) => {
    setValues({
      dailyCalories: targets.dailyCalories.toString(),
      proteinGrams: targets.proteinGrams.toString(),
      carbGrams: targets.carbGrams.toString(),
      fatGrams: targets.fatGrams.toString(),
    });
    setShowCalculator(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-6 py-4"
            style={{ backgroundColor: COLORS.coral }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Nutrition Targets</h2>
                <p className="text-sm text-white/80">
                  Set your daily macro goals
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Set fitness goal link */}
            <button
              type="button"
              onClick={() => setShowGoalForm(!showGoalForm)}
              className="mt-2 flex items-center gap-1.5 text-sm text-white/90 hover:text-white transition-colors"
            >
              <svg
                className={`w-3 h-3 transition-transform ${showGoalForm ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Set your fitness goal
            </button>
          </div>

          {/* Fitness Goal Form - expandable */}
          {showGoalForm && (
            <div
              className="px-6 py-4 border-b"
              style={{ backgroundColor: COLORS.gray50, borderColor: COLORS.gray100 }}
            >
              <GoalForm
                onSaved={() => {/* Could trigger refresh if needed */}}
                onCollapse={() => setShowGoalForm(false)}
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div
                  className="w-8 h-8 border-3 rounded-full animate-spin mb-3"
                  style={{
                    borderColor: COLORS.gray100,
                    borderTopColor: COLORS.coral,
                    borderWidth: '3px',
                  }}
                />
                <p className="text-sm" style={{ color: COLORS.gray400 }}>
                  Loading current targets...
                </p>
              </div>
            ) : (
              <>
                {/* Macro inputs */}
                {/* Help me calculate expandable section */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setShowCalculator(!showCalculator)}
                    className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: COLORS.coral }}
                  >
                    <svg
                      className={`w-4 h-4 transition-transform ${showCalculator ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Help me calculate
                  </button>

                  {showCalculator && (
                    <div
                      className="mt-3 p-4 rounded-lg border"
                      style={{ backgroundColor: COLORS.gray50, borderColor: COLORS.gray100 }}
                    >
                      <p className="text-sm mb-3" style={{ color: COLORS.gray600 }}>
                        Enter your stats and we&apos;ll calculate suggested targets
                      </p>
                      <CalculatorForm
                        onCalculated={handleCalculated}
                        onCollapse={() => setShowCalculator(false)}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: COLORS.gray600 }}
                    >
                      Daily Calories
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={values.dailyCalories}
                      onChange={(e) => handleValueChange('dailyCalories', e.target.value)}
                      placeholder="2000"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{
                        borderColor: COLORS.gray100,
                      }}
                    />
                    <p className="text-xs mt-1" style={{ color: COLORS.gray400 }}>
                      Range: {BOUNDS.dailyCalories.min} - {BOUNDS.dailyCalories.max}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        style={{ color: COLORS.gray600 }}
                      >
                        Protein (g)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={values.proteinGrams}
                        onChange={(e) => handleValueChange('proteinGrams', e.target.value)}
                        placeholder="150"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                        style={{
                          borderColor: COLORS.gray100,
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        style={{ color: COLORS.gray600 }}
                      >
                        Carbs (g)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={values.carbGrams}
                        onChange={(e) => handleValueChange('carbGrams', e.target.value)}
                        placeholder="250"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                        style={{
                          borderColor: COLORS.gray100,
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        style={{ color: COLORS.gray600 }}
                      >
                        Fat (g)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={values.fatGrams}
                        onChange={(e) => handleValueChange('fatGrams', e.target.value)}
                        placeholder="65"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                        style={{
                          borderColor: COLORS.gray100,
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-xs" style={{ color: COLORS.gray400 }}>
                    Protein: {BOUNDS.proteinGrams.min}-{BOUNDS.proteinGrams.max}g • Carbs: {BOUNDS.carbGrams.min}-{BOUNDS.carbGrams.max}g • Fat: {BOUNDS.fatGrams.min}-{BOUNDS.fatGrams.max}g
                  </p>
                </div>

                {/* Validation errors */}
                {validationErrors.length > 0 && (
                  <div
                    className="mt-4 px-3 py-2 rounded-lg text-sm"
                    style={{ backgroundColor: COLORS.coralLight, color: COLORS.coralDark }}
                  >
                    {validationErrors.map((err, i) => (
                      <p key={i}>{err}</p>
                    ))}
                  </div>
                )}

                {/* General error */}
                {error && (
                  <div
                    className="mt-4 px-3 py-2 rounded-lg text-sm"
                    style={{ backgroundColor: COLORS.coralLight, color: COLORS.coralDark }}
                  >
                    {error}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div
            className="px-6 py-4 border-t flex gap-3"
            style={{ borderColor: COLORS.gray100, backgroundColor: COLORS.gray50 }}
          >
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors border"
              style={{
                borderColor: COLORS.gray100,
                color: COLORS.gray600,
                backgroundColor: COLORS.white,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(to right, ${COLORS.coral}, #FF8E8E)`,
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
                  Saving...
                </>
              ) : (
                'Save Targets'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NutritionTargetsModal;
