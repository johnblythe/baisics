'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  calculateMacros,
  lbsToKg,
  feetInchesToCm,
  ACTIVITY_LABELS,
  GOAL_LABELS,
  type Sex,
  type Goal,
  type ActivityLevel,
  type MacroResult,
} from '@/utils/macros';
import ClaimEmailCapture from '@/app/components/ClaimEmailCapture';
import Footer from '@/components/Footer';

type UnitSystem = 'imperial' | 'metric';

const STORAGE_KEY = 'baisics_macro_unit_preference';

function MacroCalculatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial unit preference: URL > localStorage > default
  const getInitialUnitSystem = (): UnitSystem => {
    const urlUnits = searchParams.get('units');
    if (urlUnits === 'imperial' || urlUnits === 'metric') return urlUnits;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'imperial' || stored === 'metric') return stored;
    }
    return 'imperial';
  };

  const [unitSystem, setUnitSystem] = useState<UnitSystem>(getInitialUnitSystem);
  const [results, setResults] = useState<MacroResult | null>(null);

  // Form state - initialize from URL params
  const [weightLbs, setWeightLbs] = useState(searchParams.get('weight') || '');
  const [weightKg, setWeightKg] = useState(searchParams.get('weightKg') || '');
  const [heightFeet, setHeightFeet] = useState(searchParams.get('heightFt') || '');
  const [heightInches, setHeightInches] = useState(searchParams.get('heightIn') || '');
  const [heightCm, setHeightCm] = useState(searchParams.get('heightCm') || '');
  const [age, setAge] = useState(searchParams.get('age') || '');
  const [sex, setSex] = useState<Sex>((searchParams.get('sex') as Sex) || 'male');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    (searchParams.get('activity') as ActivityLevel) || 'moderate'
  );
  const [goal, setGoal] = useState<Goal>((searchParams.get('goal') as Goal) || 'maintain');

  // Save unit preference to localStorage when changed
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, unitSystem);
  }, [unitSystem]);

  // Sync URL with form state
  const syncToURL = useCallback((calculatedResult: MacroResult) => {
    const params = new URLSearchParams();
    params.set('units', unitSystem);
    if (unitSystem === 'imperial') {
      if (weightLbs) params.set('weight', weightLbs);
      if (heightFeet) params.set('heightFt', heightFeet);
      if (heightInches) params.set('heightIn', heightInches);
    } else {
      if (weightKg) params.set('weightKg', weightKg);
      if (heightCm) params.set('heightCm', heightCm);
    }
    if (age) params.set('age', age);
    params.set('sex', sex);
    params.set('activity', activityLevel);
    params.set('goal', goal);
    params.set('calc', '1'); // Flag to auto-calculate on load

    router.replace(`/tools/macros?${params.toString()}`, { scroll: false });
  }, [unitSystem, weightLbs, weightKg, heightFeet, heightInches, heightCm, age, sex, activityLevel, goal, router]);

  // Auto-calculate on load if URL has calc=1 flag
  useEffect(() => {
    if (searchParams.get('calc') === '1') {
      // Defer calculation to ensure state is ready
      const timer = setTimeout(() => {
        const weightInKg = unitSystem === 'imperial'
          ? lbsToKg(parseFloat(weightLbs) || 0)
          : parseFloat(weightKg) || 0;

        const heightInCm = unitSystem === 'imperial'
          ? feetInchesToCm(parseFloat(heightFeet) || 0, parseFloat(heightInches) || 0)
          : parseFloat(heightCm) || 0;

        if (weightInKg > 0 && heightInCm > 0 && age) {
          const result = calculateMacros({
            weightKg: weightInKg,
            heightCm: heightInCm,
            age: parseInt(age),
            sex,
            activityLevel,
            goal,
          });
          setResults(result);
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []); // Run only once on mount

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const weightInKg = unitSystem === 'imperial'
      ? lbsToKg(parseFloat(weightLbs))
      : parseFloat(weightKg);

    const heightInCm = unitSystem === 'imperial'
      ? feetInchesToCm(parseFloat(heightFeet) || 0, parseFloat(heightInches) || 0)
      : parseFloat(heightCm);

    const result = calculateMacros({
      weightKg: weightInKg,
      heightCm: heightInCm,
      age: parseInt(age),
      sex,
      activityLevel,
      goal,
    });

    setResults(result);
    syncToURL(result);
  };

  // Build toolData for claim
  const getToolData = () => {
    if (!results) return undefined;
    return {
      macros: results,
      inputs: {
        sex,
        age: parseInt(age),
        weight: unitSystem === 'imperial' ? parseFloat(weightLbs) : parseFloat(weightKg),
        weightUnit: unitSystem === 'imperial' ? 'lbs' : 'kg',
        height: unitSystem === 'imperial'
          ? { feet: parseFloat(heightFeet), inches: parseFloat(heightInches) }
          : parseFloat(heightCm),
        heightUnit: unitSystem === 'imperial' ? 'ft/in' : 'cm',
        activityLevel,
        goal,
      },
    };
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

        .macro-calculator {
          --color-white: #FFFFFF;
          --color-gray-50: #F8FAFC;
          --color-gray-100: #F1F5F9;
          --color-gray-400: #94A3B8;
          --color-gray-600: #475569;
          --color-navy: #0F172A;
          --color-navy-light: #1E293B;
          --color-coral: #FF6B6B;
          --color-coral-dark: #EF5350;
          --color-coral-light: #FFE5E5;

          font-family: 'Outfit', sans-serif;
          background-color: var(--color-white);
          color: var(--color-navy);
        }

        .font-mono {
          font-family: 'Space Mono', monospace;
        }
      `}</style>

      <div className="macro-calculator min-h-screen">
        {/* Navigation */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-white)]/95 backdrop-blur-md border-b border-[var(--color-gray-100)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[var(--color-coral)] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <span className="font-bold text-xl text-[var(--color-navy)]">baisics</span>
              </Link>

              <nav className="hidden md:flex items-center gap-8">
                <Link href="/tools/macros" className="text-sm font-medium text-[var(--color-coral)]">Macro Calculator</Link>
                <Link href="/tools/tdee" className="text-sm font-medium text-[var(--color-gray-600)] hover:text-[var(--color-navy)] transition-colors">TDEE Calculator</Link>
                <Link href="/tools/one-rep-max" className="text-sm font-medium text-[var(--color-gray-600)] hover:text-[var(--color-navy)] transition-colors">1RM Calculator</Link>
                <Link href="/tools/body-fat" className="text-sm font-medium text-[var(--color-gray-600)] hover:text-[var(--color-navy)] transition-colors">Body Fat Estimator</Link>
              </nav>

              <Link
                href="/hi"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[var(--color-navy)] rounded-lg hover:bg-[var(--color-navy-light)] transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="pt-28 lg:pt-36 pb-12 px-6 lg:px-8 bg-gradient-to-b from-[var(--color-gray-50)] to-white">
          <div className="max-w-3xl mx-auto text-center">
            <p className="font-mono text-sm text-[var(--color-coral)] uppercase tracking-wider mb-4">Free Tool</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6">
              Macro Calculator
            </h1>
            <p className="text-lg lg:text-xl text-[var(--color-gray-600)] max-w-2xl mx-auto">
              Calculate your daily macros for weight loss, muscle gain, or maintenance. Based on your body stats and activity level.
            </p>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="py-12 px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Calculator Form */}
              <div className="bg-[var(--color-gray-50)] rounded-2xl p-6 lg:p-8">
                <form onSubmit={handleCalculate} className="space-y-6">
                  {/* Unit Toggle */}
                  <div className="flex rounded-lg bg-[var(--color-gray-100)] p-1">
                    <button
                      type="button"
                      onClick={() => setUnitSystem('imperial')}
                      className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                        unitSystem === 'imperial'
                          ? 'bg-white text-[var(--color-navy)] shadow-sm'
                          : 'text-[var(--color-gray-600)]'
                      }`}
                    >
                      Imperial (lbs/ft)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnitSystem('metric')}
                      className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                        unitSystem === 'metric'
                          ? 'bg-white text-[var(--color-navy)] shadow-sm'
                          : 'text-[var(--color-gray-600)]'
                      }`}
                    >
                      Metric (kg/cm)
                    </button>
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-navy)] mb-2">
                      Weight
                    </label>
                    {unitSystem === 'imperial' ? (
                      <div className="relative">
                        <input
                          type="number"
                          value={weightLbs}
                          onChange={(e) => setWeightLbs(e.target.value)}
                          placeholder="180"
                          required
                          className="w-full px-4 py-3 pr-12 rounded-lg border border-[var(--color-gray-100)] focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral)]/20 outline-none transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-gray-400)] font-mono text-sm">lbs</span>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="number"
                          value={weightKg}
                          onChange={(e) => setWeightKg(e.target.value)}
                          placeholder="82"
                          required
                          className="w-full px-4 py-3 pr-12 rounded-lg border border-[var(--color-gray-100)] focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral)]/20 outline-none transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-gray-400)] font-mono text-sm">kg</span>
                      </div>
                    )}
                  </div>

                  {/* Height */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-navy)] mb-2">
                      Height
                    </label>
                    {unitSystem === 'imperial' ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <input
                            type="number"
                            value={heightFeet}
                            onChange={(e) => setHeightFeet(e.target.value)}
                            placeholder="5"
                            required
                            className="w-full px-4 py-3 pr-10 rounded-lg border border-[var(--color-gray-100)] focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral)]/20 outline-none transition-all"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-gray-400)] font-mono text-sm">ft</span>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            value={heightInches}
                            onChange={(e) => setHeightInches(e.target.value)}
                            placeholder="10"
                            required
                            className="w-full px-4 py-3 pr-10 rounded-lg border border-[var(--color-gray-100)] focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral)]/20 outline-none transition-all"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-gray-400)] font-mono text-sm">in</span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="number"
                          value={heightCm}
                          onChange={(e) => setHeightCm(e.target.value)}
                          placeholder="178"
                          required
                          className="w-full px-4 py-3 pr-12 rounded-lg border border-[var(--color-gray-100)] focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral)]/20 outline-none transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-gray-400)] font-mono text-sm">cm</span>
                      </div>
                    )}
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-navy)] mb-2">
                      Age
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="30"
                        required
                        min="16"
                        max="100"
                        className="w-full px-4 py-3 pr-14 rounded-lg border border-[var(--color-gray-100)] focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral)]/20 outline-none transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-gray-400)] font-mono text-sm">years</span>
                    </div>
                  </div>

                  {/* Sex */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-navy)] mb-2">
                      Biological Sex
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['male', 'female'] as const).map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setSex(option)}
                          className={`py-3 px-4 rounded-lg font-medium transition-all ${
                            sex === option
                              ? 'bg-[var(--color-navy)] text-white'
                              : 'bg-white border border-[var(--color-gray-100)] text-[var(--color-gray-600)] hover:border-[var(--color-navy)]'
                          }`}
                        >
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Activity Level */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-navy)] mb-2">
                      Activity Level
                    </label>
                    <div className="space-y-2">
                      {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setActivityLevel(level)}
                          className={`w-full py-3 px-4 rounded-lg text-left transition-all ${
                            activityLevel === level
                              ? 'bg-[var(--color-navy)] text-white'
                              : 'bg-white border border-[var(--color-gray-100)] text-[var(--color-gray-600)] hover:border-[var(--color-navy)]'
                          }`}
                        >
                          <span className="font-medium">{ACTIVITY_LABELS[level].label}</span>
                          <span className={`block text-sm ${activityLevel === level ? 'text-[var(--color-gray-400)]' : 'text-[var(--color-gray-400)]'}`}>
                            {ACTIVITY_LABELS[level].description}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Goal */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-navy)] mb-2">
                      Goal
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGoal(g)}
                          className={`py-3 px-2 rounded-lg text-center transition-all ${
                            goal === g
                              ? 'bg-[var(--color-coral)] text-white'
                              : 'bg-white border border-[var(--color-gray-100)] text-[var(--color-gray-600)] hover:border-[var(--color-coral)]'
                          }`}
                        >
                          <span className="font-medium text-sm">{GOAL_LABELS[g].label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full py-4 text-lg font-bold text-white bg-[var(--color-coral)] rounded-xl hover:bg-[var(--color-coral-dark)] transition-all shadow-lg shadow-[var(--color-coral)]/25"
                  >
                    Calculate Macros
                  </button>
                </form>
              </div>

              {/* Results Panel */}
              <div className="lg:sticky lg:top-28 lg:self-start">
                {results ? (
                  <div className="space-y-6">
                    {/* Results Card */}
                    <div className="bg-[var(--color-navy)] rounded-2xl p-6 lg:p-8 text-white">
                      <h2 className="text-xl font-bold mb-6">Your Daily Macros</h2>

                      {/* Calories */}
                      <div className="text-center mb-8">
                        <p className="font-mono text-6xl font-bold text-[var(--color-coral)]">
                          {results.targetCalories.toLocaleString()}
                        </p>
                        <p className="text-[var(--color-gray-400)] mt-1">calories/day</p>
                      </div>

                      {/* Macro Breakdown */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 bg-[var(--color-navy-light)] rounded-xl">
                          <p className="font-mono text-2xl font-bold">{results.protein}g</p>
                          <p className="text-sm text-[var(--color-gray-400)]">Protein</p>
                        </div>
                        <div className="text-center p-4 bg-[var(--color-navy-light)] rounded-xl">
                          <p className="font-mono text-2xl font-bold">{results.carbs}g</p>
                          <p className="text-sm text-[var(--color-gray-400)]">Carbs</p>
                        </div>
                        <div className="text-center p-4 bg-[var(--color-navy-light)] rounded-xl">
                          <p className="font-mono text-2xl font-bold">{results.fats}g</p>
                          <p className="text-sm text-[var(--color-gray-400)]">Fats</p>
                        </div>
                      </div>

                      {/* TDEE/BMR Info */}
                      <div className="pt-4 border-t border-[var(--color-navy-light)]">
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--color-gray-400)]">BMR (Base Metabolic Rate)</span>
                          <span className="font-mono">{results.bmr.toLocaleString()} cal</span>
                        </div>
                        <div className="flex justify-between text-sm mt-2">
                          <span className="text-[var(--color-gray-400)]">TDEE (Maintenance)</span>
                          <span className="font-mono">{results.tdee.toLocaleString()} cal</span>
                        </div>
                      </div>
                    </div>

                    {/* CTA Card */}
                    <ClaimEmailCapture
                      source="macro-calculator"
                      toolData={getToolData()}
                      headline="Get a program designed for these exact macros"
                      subheadline="Our AI will create a personalized workout plan matched to your nutrition goals."
                      ctaText="Claim Program"
                    />
                  </div>
                ) : (
                  <div className="bg-[var(--color-gray-50)] rounded-2xl p-6 lg:p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-coral-light)] rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-[var(--color-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--color-navy)] mb-2">
                      Your Results
                    </h3>
                    <p className="text-[var(--color-gray-600)]">
                      Fill out the form to calculate your personalized daily macros.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-16 px-6 lg:px-8 bg-[var(--color-gray-50)]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-6">How We Calculate Your Macros</h2>

            <div className="prose prose-lg max-w-none text-[var(--color-gray-600)]">
              <p>
                This calculator uses the <strong>Mifflin-St Jeor equation</strong>, which is considered
                the most accurate formula for estimating Basal Metabolic Rate (BMR) for most people.
              </p>

              <h3 className="text-lg font-semibold text-[var(--color-navy)] mt-6 mb-3">What&apos;s included:</h3>
              <ul className="space-y-2">
                <li><strong>BMR</strong> - The calories your body needs at complete rest</li>
                <li><strong>TDEE</strong> - Total Daily Energy Expenditure (BMR × activity multiplier)</li>
                <li><strong>Target Calories</strong> - TDEE adjusted for your goal (deficit, maintenance, or surplus)</li>
                <li><strong>Protein</strong> - Set at 0.9g per pound of bodyweight for optimal muscle support</li>
                <li><strong>Fats</strong> - 27% of calories for hormone health</li>
                <li><strong>Carbs</strong> - The remainder, to fuel your workouts</li>
              </ul>

              <p className="mt-6">
                These are <strong>starting points</strong>. Your actual needs may vary based on genetics,
                body composition, and how your body responds. Track for 2-3 weeks and adjust based on results.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}

export default function MacroCalculatorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <MacroCalculatorContent />
    </Suspense>
  );
}
