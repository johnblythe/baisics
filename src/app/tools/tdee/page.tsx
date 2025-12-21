'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  calculateTDEE,
  calculateAllFormulas,
  lbsToKg,
  feetInchesToCm,
  ACTIVITY_LABELS,
  FORMULA_INFO,
  type Sex,
  type ActivityLevel,
  type TDEEFormula,
  type AllFormulasResult,
} from '@/utils/tdee';
import ClaimEmailCapture from '@/app/components/ClaimEmailCapture';
import Footer from '@/components/Footer';

type UnitSystem = 'imperial' | 'metric';

export default function TDEECalculatorPage() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial');
  const [results, setResults] = useState<AllFormulasResult | null>(null);
  const [selectedFormula, setSelectedFormula] = useState<TDEEFormula>('mifflin');

  // Form state
  const [weightLbs, setWeightLbs] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<Sex>('male');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [bodyFat, setBodyFat] = useState('');

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const weightInKg = unitSystem === 'imperial'
      ? lbsToKg(parseFloat(weightLbs))
      : parseFloat(weightKg);

    const heightInCm = unitSystem === 'imperial'
      ? feetInchesToCm(parseFloat(heightFeet) || 0, parseFloat(heightInches) || 0)
      : parseFloat(heightCm);

    const result = calculateAllFormulas({
      weightKg: weightInKg,
      heightCm: heightInCm,
      age: parseInt(age),
      sex,
      activityLevel,
      bodyFatPercent: bodyFat ? parseFloat(bodyFat) : undefined,
    });

    setResults(result);
  };

  // Get the currently selected result
  const currentResult = results ? results[selectedFormula] : null;

  // Build toolData for claim
  const getToolData = () => {
    if (!currentResult) return undefined;
    return {
      tdee: currentResult,
      allFormulas: results,
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
        bodyFatPercent: bodyFat ? parseFloat(bodyFat) : undefined,
        selectedFormula,
      },
    };
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

        .tdee-calculator {
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

      <div className="tdee-calculator min-h-screen">
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
                <Link href="/tools/macros" className="text-sm font-medium text-[var(--color-gray-600)] hover:text-[var(--color-navy)] transition-colors">
                  Macro Calculator
                </Link>
                <Link href="/tools/tdee" className="text-sm font-medium text-[var(--color-coral)]">
                  TDEE Calculator
                </Link>
                <Link href="/tools/one-rep-max" className="text-sm font-medium text-[var(--color-gray-600)] hover:text-[var(--color-navy)] transition-colors">
                  1RM Calculator
                </Link>
                <Link href="/tools/body-fat" className="text-sm font-medium text-[var(--color-gray-600)] hover:text-[var(--color-navy)] transition-colors">
                  Body Fat Estimator
                </Link>
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
              TDEE Calculator
            </h1>
            <p className="text-lg lg:text-xl text-[var(--color-gray-600)] max-w-2xl mx-auto">
              Calculate your Total Daily Energy Expenditure. Know exactly how many calories you burn, then plan to cut, maintain, or bulk.
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

                  {/* Body Fat (Optional) */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-navy)] mb-2">
                      Body Fat % <span className="font-normal text-[var(--color-gray-400)]">(optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={bodyFat}
                        onChange={(e) => setBodyFat(e.target.value)}
                        placeholder="15"
                        min="3"
                        max="50"
                        step="0.1"
                        className="w-full px-4 py-3 pr-10 rounded-lg border border-[var(--color-gray-100)] focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral)]/20 outline-none transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-gray-400)] font-mono text-sm">%</span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--color-gray-400)]">
                      If known, enables the Katch-McArdle formula (most accurate)
                    </p>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full py-4 text-lg font-bold text-white bg-[var(--color-coral)] rounded-xl hover:bg-[var(--color-coral-dark)] transition-all shadow-lg shadow-[var(--color-coral)]/25"
                  >
                    Calculate TDEE
                  </button>
                </form>
              </div>

              {/* Results Panel */}
              <div className="lg:sticky lg:top-28 lg:self-start">
                {results && currentResult ? (
                  <div className="space-y-6">
                    {/* Main Results Card */}
                    <div className="bg-[var(--color-navy)] rounded-2xl p-6 lg:p-8 text-white">
                      <h2 className="text-xl font-bold mb-6">Your Daily Calories</h2>

                      {/* TDEE */}
                      <div className="text-center mb-8">
                        <p className="font-mono text-6xl font-bold text-[var(--color-coral)]">
                          {currentResult.tdee.toLocaleString()}
                        </p>
                        <p className="text-[var(--color-gray-400)] mt-1">calories/day (maintenance)</p>
                      </div>

                      {/* Cut/Maintain/Bulk */}
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="text-center p-4 bg-[var(--color-navy-light)] rounded-xl">
                          <p className="text-xs text-[var(--color-gray-400)] mb-1">Cut</p>
                          <p className="font-mono text-xl font-bold text-red-400">{currentResult.cutCalories.toLocaleString()}</p>
                          <p className="text-xs text-[var(--color-gray-400)]">-500 cal</p>
                        </div>
                        <div className="text-center p-4 bg-[var(--color-navy-light)] rounded-xl ring-2 ring-[var(--color-coral)]">
                          <p className="text-xs text-[var(--color-gray-400)] mb-1">Maintain</p>
                          <p className="font-mono text-xl font-bold">{currentResult.maintainCalories.toLocaleString()}</p>
                          <p className="text-xs text-[var(--color-gray-400)]">TDEE</p>
                        </div>
                        <div className="text-center p-4 bg-[var(--color-navy-light)] rounded-xl">
                          <p className="text-xs text-[var(--color-gray-400)] mb-1">Bulk</p>
                          <p className="font-mono text-xl font-bold text-green-400">{currentResult.bulkCalories.toLocaleString()}</p>
                          <p className="text-xs text-[var(--color-gray-400)]">+300 cal</p>
                        </div>
                      </div>

                      {/* BMR */}
                      <div className="pt-4 border-t border-[var(--color-navy-light)]">
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--color-gray-400)]">BMR (Basal Metabolic Rate)</span>
                          <span className="font-mono">{currentResult.bmr.toLocaleString()} cal</span>
                        </div>
                      </div>
                    </div>

                    {/* Formula Comparison */}
                    <div className="bg-[var(--color-gray-50)] rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-[var(--color-navy)] mb-4">
                        Formula Comparison
                      </h3>

                      <div className="space-y-2">
                        {(['mifflin', 'harris', 'katch'] as TDEEFormula[]).map((formula) => {
                          const result = results[formula];
                          if (!result) return null;

                          return (
                            <button
                              key={formula}
                              onClick={() => setSelectedFormula(formula)}
                              className={`w-full p-4 rounded-lg text-left transition-all ${
                                selectedFormula === formula
                                  ? 'bg-[var(--color-navy)] text-white'
                                  : 'bg-white border border-[var(--color-gray-100)] hover:border-[var(--color-navy)]'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-semibold">{FORMULA_INFO[formula].name}</p>
                                  <p className={`text-sm ${selectedFormula === formula ? 'text-[var(--color-gray-400)]' : 'text-[var(--color-gray-600)]'}`}>
                                    {FORMULA_INFO[formula].bestFor}
                                  </p>
                                </div>
                                <p className={`font-mono text-xl font-bold ${selectedFormula === formula ? 'text-[var(--color-coral)]' : 'text-[var(--color-navy)]'}`}>
                                  {result.tdee.toLocaleString()}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* CTA Card */}
                    <ClaimEmailCapture
                      source="tdee-calculator"
                      toolData={getToolData()}
                      headline="Match your calories to the right workout plan"
                      subheadline="Our AI will create a personalized program based on your TDEE and goals."
                      ctaText="Get My Program"
                    />
                  </div>
                ) : (
                  <div className="bg-[var(--color-gray-50)] rounded-2xl p-6 lg:p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-coral-light)] rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-[var(--color-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--color-navy)] mb-2">
                      Your Results
                    </h3>
                    <p className="text-[var(--color-gray-600)]">
                      Fill out the form to calculate your Total Daily Energy Expenditure.
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
            <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-6">Understanding Your TDEE</h2>

            <div className="prose prose-lg max-w-none text-[var(--color-gray-600)]">
              <p>
                <strong>TDEE (Total Daily Energy Expenditure)</strong> is the total number of calories you burn in a day,
                including your basal metabolism, daily activities, and exercise.
              </p>

              <h3 className="text-lg font-semibold text-[var(--color-navy)] mt-6 mb-3">How It&apos;s Calculated</h3>
              <ul className="space-y-2">
                <li><strong>BMR (Basal Metabolic Rate):</strong> Calories your body burns at complete rest just to keep you alive</li>
                <li><strong>Activity Multiplier:</strong> Factor based on how active you are throughout the day</li>
                <li><strong>TDEE = BMR × Activity Multiplier</strong></li>
              </ul>

              <h3 className="text-lg font-semibold text-[var(--color-navy)] mt-6 mb-3">About the Formulas</h3>
              <ul className="space-y-2">
                <li><strong>Mifflin-St Jeor:</strong> Most accurate for the general population. Uses weight, height, age, and sex.</li>
                <li><strong>Harris-Benedict:</strong> Classic formula from 1919 (revised 1984). Good for comparison.</li>
                <li><strong>Katch-McArdle:</strong> Uses lean body mass. Most accurate if you know your body fat percentage.</li>
              </ul>

              <h3 className="text-lg font-semibold text-[var(--color-navy)] mt-6 mb-3">Using Your TDEE</h3>
              <ul className="space-y-2">
                <li><strong>To lose fat:</strong> Eat 300-500 calories below your TDEE (creates ~1 lb/week deficit)</li>
                <li><strong>To maintain:</strong> Eat at your TDEE</li>
                <li><strong>To build muscle:</strong> Eat 200-300 calories above your TDEE (lean bulk)</li>
              </ul>

              <p className="mt-6">
                These are <strong>starting points</strong>. Track your weight and progress for 2-3 weeks, then adjust.
                If you&apos;re not seeing results, your actual TDEE may be slightly different.
              </p>

              <div className="mt-8 p-4 bg-white rounded-xl border border-[var(--color-gray-100)]">
                <p className="text-sm">
                  <strong>Want your full macro breakdown?</strong> Use our{' '}
                  <Link href="/tools/macros" className="text-[var(--color-coral)] hover:underline">
                    Macro Calculator
                  </Link>{' '}
                  to get protein, carbs, and fat targets based on your TDEE.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
