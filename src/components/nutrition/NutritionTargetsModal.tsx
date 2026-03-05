'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CalculatorForm } from './CalculatorForm';
import { GoalForm } from './GoalForm';
import { COLORS } from '@/lib/design/colors';
import { useEscapeKey } from '@/hooks/useEscapeKey';

// --- Tooltip ---
function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold leading-none"
        style={{ backgroundColor: COLORS.gray100, color: COLORS.gray600 }}
        aria-label="What is carb cycling?"
      >
        ?
      </button>
      {open && (
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 px-3 py-2 rounded-lg text-xs leading-relaxed text-white z-50 shadow-lg"
          style={{ backgroundColor: COLORS.navy }}
        >
          {text}
          {/* Arrow */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: `6px solid ${COLORS.navy}`,
            }}
          />
        </div>
      )}
    </div>
  );
}

// --- Carb-cycle auto-calculator ---
export function computeCarbCycleFromBaseline(vals: NutritionValues): { training: Partial<NutritionValues>; rest: Partial<NutritionValues> } | null {
  const cal = parseInt(vals.dailyCalories, 10);
  if (!cal || cal <= 0) return null; // no baseline calories

  const protein = parseInt(vals.proteinGrams, 10) || 0;
  const carbs = parseInt(vals.carbGrams, 10) || 0;
  const fat = parseInt(vals.fatGrams, 10) || 0;
  const hasMacros = protein > 0 || carbs > 0 || fat > 0;

  // Training = baseline × 1.10, Rest = (7×baseline - 4×training) / 3
  const trainingCal = Math.round(cal * 1.10);
  const restCal = Math.round((7 * cal - 4 * trainingCal) / 3);

  if (!hasMacros) {
    // Calories-only mode
    return {
      training: { dailyCalories: String(trainingCal) },
      rest: { restDayCalories: String(restCal) },
    };
  }

  // Full macro split
  // Training: same protein, 25% fat, carbs remainder
  const trainingFat = Math.round((trainingCal * 0.25) / 9);
  const trainingCarbs = Math.round((trainingCal - protein * 4 - trainingFat * 9) / 4);

  // Rest: same protein, 35% fat, carbs remainder
  const restFat = Math.round((restCal * 0.35) / 9);
  const restCarbs = Math.round((restCal - protein * 4 - restFat * 9) / 4);

  return {
    training: {
      dailyCalories: String(trainingCal),
      proteinGrams: String(protein),
      carbGrams: String(Math.max(0, trainingCarbs)),
      fatGrams: String(trainingFat),
    },
    rest: {
      restDayCalories: String(restCal),
      restDayProtein: String(protein),
      restDayCarbs: String(Math.max(0, restCarbs)),
      restDayFat: String(restFat),
    },
  };
}

// Validation bounds matching POST /api/nutrition-plan
const BOUNDS = {
  dailyCalories: { min: 800, max: 6000 },
  proteinGrams: { min: 30, max: 400 },
  carbGrams: { min: 0, max: 800 },
  fatGrams: { min: 20, max: 300 },
};

export interface NutritionValues {
  dailyCalories: string;
  proteinGrams: string;
  carbGrams: string;
  fatGrams: string;
  restDayCalories: string;
  restDayProtein: string;
  restDayCarbs: string;
  restDayFat: string;
}

interface NutritionTargetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  isPremium?: boolean;
  initialValues?: {
    dailyCalories?: number;
    proteinGrams?: number;
    carbGrams?: number;
    fatGrams?: number;
    restDayCalories?: number;
    restDayProtein?: number;
    restDayCarbs?: number;
    restDayFat?: number;
  };
}

const EMPTY_VALUES: NutritionValues = {
  dailyCalories: '',
  proteinGrams: '',
  carbGrams: '',
  fatGrams: '',
  restDayCalories: '',
  restDayProtein: '',
  restDayCarbs: '',
  restDayFat: '',
};

export function NutritionTargetsModal({
  isOpen,
  onClose,
  onSaved,
  isPremium,
  initialValues,
}: NutritionTargetsModalProps) {
  useEscapeKey(onClose, isOpen);
  const [values, setValues] = useState<NutritionValues>({ ...EMPTY_VALUES });
  const [carbCycling, setCarbCycling] = useState(false);
  // Snapshot of training-day fields before carb-cycling shift, so toggle OFF can restore
  const baselineRef = useRef<Pick<NutritionValues, 'dailyCalories' | 'proteinGrams' | 'carbGrams' | 'fatGrams'> | null>(null);
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
        const hasRestDay = !!(initialValues.restDayCalories || initialValues.restDayProtein);
        setCarbCycling(hasRestDay);
        setValues({
          dailyCalories: initialValues.dailyCalories?.toString() || '',
          proteinGrams: initialValues.proteinGrams?.toString() || '',
          carbGrams: initialValues.carbGrams?.toString() || '',
          fatGrams: initialValues.fatGrams?.toString() || '',
          restDayCalories: initialValues.restDayCalories?.toString() || '',
          restDayProtein: initialValues.restDayProtein?.toString() || '',
          restDayCarbs: initialValues.restDayCarbs?.toString() || '',
          restDayFat: initialValues.restDayFat?.toString() || '',
        });
      } else {
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
      if (!response.ok) {
        console.error('Failed to load current targets:', response.status);
        setError('Could not load your current targets. You can still enter new values.');
        return;
      }
      const data = await response.json();
      if (data.plan && !data.isDefault) {
        const hasRestDay = !!(data.restDayTargets?.dailyCalories || data.restDayTargets?.proteinGrams);
        setCarbCycling(hasRestDay);
        setValues({
          dailyCalories: data.plan.dailyCalories?.toString() || '',
          proteinGrams: data.plan.proteinGrams?.toString() || '',
          carbGrams: data.plan.carbGrams?.toString() || '',
          fatGrams: data.plan.fatGrams?.toString() || '',
          restDayCalories: data.restDayTargets?.dailyCalories?.toString() || '',
          restDayProtein: data.restDayTargets?.proteinGrams?.toString() || '',
          restDayCarbs: data.restDayTargets?.carbGrams?.toString() || '',
          restDayFat: data.restDayTargets?.fatGrams?.toString() || '',
        });
      }
    } catch (err) {
      console.error('Failed to fetch current targets:', err);
      setError('Could not load your current targets. You can still enter new values.');
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
    if (value && !/^\d*$/.test(value)) return;
    setError(null);
    setValidationErrors([]);

    // Rest-day calorie field: clear rest-day macros
    if (field === 'restDayCalories') {
      setValues(prev => ({
        ...prev,
        restDayCalories: value,
        restDayProtein: '',
        restDayCarbs: '',
        restDayFat: '',
      }));
      return;
    }

    // Rest-day macro fields: auto-calculate rest-day calories
    if (field === 'restDayProtein' || field === 'restDayCarbs' || field === 'restDayFat') {
      const newValues = { ...values, [field]: value };
      const calculatedCalories = calculateCaloriesFromMacros(
        field === 'restDayProtein' ? value : newValues.restDayProtein,
        field === 'restDayCarbs' ? value : newValues.restDayCarbs,
        field === 'restDayFat' ? value : newValues.restDayFat
      );
      setValues({
        ...newValues,
        restDayCalories: calculatedCalories,
      });
      return;
    }

    // Training/daily calorie field: clear training macros (kcal-only mode)
    if (field === 'dailyCalories') {
      setValues(prev => ({
        ...prev,
        dailyCalories: value,
        proteinGrams: '',
        carbGrams: '',
        fatGrams: '',
      }));
      return;
    }

    // Training macro fields: auto-calculate training calories
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

  const handleCarbCyclingToggle = () => {
    if (!carbCycling) {
      // Turning ON — snapshot current values as baseline, then compute split
      baselineRef.current = {
        dailyCalories: values.dailyCalories,
        proteinGrams: values.proteinGrams,
        carbGrams: values.carbGrams,
        fatGrams: values.fatGrams,
      };
      setCarbCycling(true);
      const result = computeCarbCycleFromBaseline(values);
      if (result) {
        setValues(prev => ({
          ...prev,
          ...result.training,
          ...result.rest,
        }));
      }
    } else {
      // Turning OFF — restore baseline training values, clear rest-day
      setCarbCycling(false);
      const baseline = baselineRef.current;
      baselineRef.current = null;
      setValues(prev => ({
        ...prev,
        ...(baseline ?? {}),
        restDayCalories: '',
        restDayProtein: '',
        restDayCarbs: '',
        restDayFat: '',
      }));
    }
  };

  const validateValues = (): boolean => {
    const errors: string[] = [];
    const cal = parseInt(values.dailyCalories, 10) || 0;
    const protein = parseInt(values.proteinGrams, 10) || 0;
    const carbs = parseInt(values.carbGrams, 10) || 0;
    const fat = parseInt(values.fatGrams, 10) || 0;

    if (!values.dailyCalories) {
      errors.push(carbCycling ? 'Training day calories is required' : 'Daily calories is required');
    }

    if (values.dailyCalories && (cal < BOUNDS.dailyCalories.min || cal > BOUNDS.dailyCalories.max)) {
      errors.push(`Calories must be ${BOUNDS.dailyCalories.min}-${BOUNDS.dailyCalories.max}`);
    }

    const hasMacros = values.proteinGrams || values.carbGrams || values.fatGrams;
    if (hasMacros) {
      if (!values.proteinGrams) errors.push('Protein is required when using macros');
      if (!values.carbGrams && values.carbGrams !== '0') errors.push('Carbs is required when using macros');
      if (!values.fatGrams) errors.push('Fat is required when using macros');

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

    // Validate rest-day fields when carb cycling is on
    if (carbCycling) {
      const restCal = parseInt(values.restDayCalories, 10) || 0;
      const restProtein = parseInt(values.restDayProtein, 10) || 0;
      const restCarbs = parseInt(values.restDayCarbs, 10) || 0;
      const restFat = parseInt(values.restDayFat, 10) || 0;

      if (!values.restDayCalories) {
        errors.push('Rest day calories is required when carb cycling');
      }
      if (values.restDayCalories && (restCal < BOUNDS.dailyCalories.min || restCal > BOUNDS.dailyCalories.max)) {
        errors.push(`Rest day calories must be ${BOUNDS.dailyCalories.min}-${BOUNDS.dailyCalories.max}`);
      }

      const hasRestMacros = values.restDayProtein || values.restDayCarbs || values.restDayFat;
      if (hasRestMacros) {
        if (!values.restDayProtein) errors.push('Rest day protein is required when using macros');
        if (!values.restDayCarbs && values.restDayCarbs !== '0') errors.push('Rest day carbs is required');
        if (!values.restDayFat) errors.push('Rest day fat is required when using macros');

        if (values.restDayProtein && (restProtein < BOUNDS.proteinGrams.min || restProtein > BOUNDS.proteinGrams.max)) {
          errors.push(`Rest day protein must be ${BOUNDS.proteinGrams.min}-${BOUNDS.proteinGrams.max}g`);
        }
        if ((values.restDayCarbs || values.restDayCarbs === '0') && (restCarbs < BOUNDS.carbGrams.min || restCarbs > BOUNDS.carbGrams.max)) {
          errors.push(`Rest day carbs must be ${BOUNDS.carbGrams.min}-${BOUNDS.carbGrams.max}g`);
        }
        if (values.restDayFat && (restFat < BOUNDS.fatGrams.min || restFat > BOUNDS.fatGrams.max)) {
          errors.push(`Rest day fat must be ${BOUNDS.fatGrams.min}-${BOUNDS.fatGrams.max}g`);
        }
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
          restDayCalories: carbCycling && values.restDayCalories ? parseInt(values.restDayCalories, 10) : null,
          restDayProtein: carbCycling && values.restDayProtein ? parseInt(values.restDayProtein, 10) : null,
          restDayCarbs: carbCycling && values.restDayCarbs ? parseInt(values.restDayCarbs, 10) : null,
          restDayFat: carbCycling && values.restDayFat ? parseInt(values.restDayFat, 10) : null,
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
    setValues({ ...EMPTY_VALUES });
    setCarbCycling(false);
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
    restDay?: {
      dailyCalories: number;
      proteinGrams: number;
      carbGrams: number;
      fatGrams: number;
    };
  }) => {
    const hasRestDay = isPremium && targets.restDay;
    if (hasRestDay) setCarbCycling(true);
    setValues({
      dailyCalories: targets.dailyCalories.toString(),
      proteinGrams: targets.proteinGrams.toString(),
      carbGrams: targets.carbGrams.toString(),
      fatGrams: targets.fatGrams.toString(),
      restDayCalories: hasRestDay ? targets.restDay!.dailyCalories.toString() : '',
      restDayProtein: hasRestDay ? targets.restDay!.proteinGrams.toString() : '',
      restDayCarbs: hasRestDay ? targets.restDay!.carbGrams.toString() : '',
      restDayFat: hasRestDay ? targets.restDay!.fatGrams.toString() : '',
    });
    setShowCalculator(false);
  };

  if (!isOpen) return null;

  // Shared input style
  const inputClass = "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors";
  const inputStyle = { borderColor: COLORS.gray100 };
  const labelClass = "block text-sm font-medium mb-1";
  const labelStyle = { color: COLORS.gray600 };

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
                {/* Help me calculate */}
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

                {/* Training Day / Daily targets */}
                <div className="space-y-4">
                  {carbCycling && (
                    <h3 className="text-sm font-semibold" style={{ color: COLORS.navy }}>
                      Training Day
                    </h3>
                  )}
                  <div>
                    <label htmlFor="daily-calories" className={labelClass} style={labelStyle}>
                      {carbCycling ? 'Calories' : 'Daily Calories'}
                    </label>
                    <input
                      id="daily-calories"
                      type="text"
                      inputMode="numeric"
                      value={values.dailyCalories}
                      onChange={(e) => handleValueChange('dailyCalories', e.target.value)}
                      placeholder="2000"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="protein-grams" className={labelClass} style={labelStyle}>
                        Protein (g)
                      </label>
                      <input
                        id="protein-grams"
                        type="text"
                        inputMode="numeric"
                        value={values.proteinGrams}
                        onChange={(e) => handleValueChange('proteinGrams', e.target.value)}
                        placeholder="150"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label htmlFor="carb-grams" className={labelClass} style={labelStyle}>
                        Carbs (g)
                      </label>
                      <input
                        id="carb-grams"
                        type="text"
                        inputMode="numeric"
                        value={values.carbGrams}
                        onChange={(e) => handleValueChange('carbGrams', e.target.value)}
                        placeholder="250"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label htmlFor="fat-grams" className={labelClass} style={labelStyle}>
                        Fat (g)
                      </label>
                      <input
                        id="fat-grams"
                        type="text"
                        inputMode="numeric"
                        value={values.fatGrams}
                        onChange={(e) => handleValueChange('fatGrams', e.target.value)}
                        placeholder="65"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* Carb Cycling toggle + Rest Day section */}
                <div className="mt-6 pt-4 border-t" style={{ borderColor: COLORS.gray100 }}>
                  {isPremium ? (
                    <>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={carbCycling}
                            onChange={handleCarbCyclingToggle}
                            className="sr-only"
                          />
                          <div
                            className="w-9 h-5 rounded-full transition-colors"
                            style={{ backgroundColor: carbCycling ? COLORS.coral : COLORS.gray100 }}
                          />
                          <div
                            className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm"
                            style={{ transform: carbCycling ? 'translateX(16px)' : 'translateX(0)' }}
                          />
                        </div>
                        <span className="text-sm font-medium" style={{ color: COLORS.navy }}>
                          Carb Cycling
                        </span>
                        <InfoTooltip text="Eat more carbs on training days for energy, fewer on rest days. Your weekly average stays the same — you're just timing nutrients around workouts." />
                      </label>

                      {carbCycling && (
                        <div className="mt-4 space-y-4">
                          <h3 className="text-sm font-semibold" style={{ color: COLORS.navy }}>
                            Rest Day
                          </h3>
                          <div>
                            <label htmlFor="rest-day-calories" className={labelClass} style={labelStyle}>
                              Calories
                            </label>
                            <input
                              id="rest-day-calories"
                              type="text"
                              inputMode="numeric"
                              value={values.restDayCalories}
                              onChange={(e) => handleValueChange('restDayCalories', e.target.value)}
                              placeholder="1800"
                              className={inputClass}
                              style={inputStyle}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label htmlFor="rest-day-protein" className={labelClass} style={labelStyle}>
                                Protein (g)
                              </label>
                              <input
                                id="rest-day-protein"
                                type="text"
                                inputMode="numeric"
                                value={values.restDayProtein}
                                onChange={(e) => handleValueChange('restDayProtein', e.target.value)}
                                placeholder="150"
                                className={inputClass}
                                style={inputStyle}
                              />
                            </div>
                            <div>
                              <label htmlFor="rest-day-carbs" className={labelClass} style={labelStyle}>
                                Carbs (g)
                              </label>
                              <input
                                id="rest-day-carbs"
                                type="text"
                                inputMode="numeric"
                                value={values.restDayCarbs}
                                onChange={(e) => handleValueChange('restDayCarbs', e.target.value)}
                                placeholder="180"
                                className={inputClass}
                                style={inputStyle}
                              />
                            </div>
                            <div>
                              <label htmlFor="rest-day-fat" className={labelClass} style={labelStyle}>
                                Fat (g)
                              </label>
                              <input
                                id="rest-day-fat"
                                type="text"
                                inputMode="numeric"
                                value={values.restDayFat}
                                onChange={(e) => handleValueChange('restDayFat', e.target.value)}
                                placeholder="60"
                                className={inputClass}
                                style={inputStyle}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="relative opacity-50">
                        <div
                          className="w-9 h-5 rounded-full"
                          style={{ backgroundColor: COLORS.gray100 }}
                        />
                        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium" style={{ color: COLORS.gray400 }}>
                          Carb Cycling
                        </span>
                        <InfoTooltip text="Eat more carbs on training days for energy, fewer on rest days. Your weekly average stays the same — you're just timing nutrients around workouts." />
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: COLORS.gray100, color: COLORS.gray600 }}
                        >
                          Jacked
                        </span>
                      </div>
                    </div>
                  )}
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
                  {initialValues ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                initialValues ? 'Update Targets' : 'Save Targets'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NutritionTargetsModal;
