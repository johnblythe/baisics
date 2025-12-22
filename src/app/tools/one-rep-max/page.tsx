'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  calculate1RM,
  calculateAllFormulas,
  generatePercentageChart,
  COMMON_EXERCISES,
  FORMULA_INFO,
  REP_RECOMMENDATIONS,
  type OneRMFormula,
  type AllFormulasResult,
  type PercentageChartRow,
} from '@/utils/oneRepMax';
import ClaimEmailCapture from '@/app/components/ClaimEmailCapture';
import Footer from '@/components/Footer';

type UnitSystem = 'imperial' | 'metric';

export default function OneRepMaxPage() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial');
  const [results, setResults] = useState<AllFormulasResult | null>(null);
  const [percentageChart, setPercentageChart] = useState<PercentageChartRow[] | null>(null);
  const [selectedFormula, setSelectedFormula] = useState<OneRMFormula>('epley');

  // Form state
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [exercise, setExercise] = useState('');

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps);

    const result = calculateAllFormulas({
      weight: weightNum,
      reps: repsNum,
      exercise,
    });

    setResults(result);

    // Generate chart based on average
    const chart = generatePercentageChart(result.average);
    setPercentageChart(chart);
  };

  // Get the currently selected 1RM
  const currentOneRM = results ? results[selectedFormula] : null;

  // Build toolData for claim
  const getToolData = () => {
    if (!results) return undefined;
    return {
      oneRepMax: currentOneRM,
      allFormulas: results,
      percentageChart,
      inputs: {
        weight: parseFloat(weight),
        weightUnit: unitSystem === 'imperial' ? 'lbs' : 'kg',
        reps: parseInt(reps),
        exercise,
        selectedFormula,
      },
    };
  };

  // Get rep range warning
  const getRepWarning = () => {
    const r = parseInt(reps);
    if (!r) return null;
    if (r <= 6) return { type: 'optimal', text: REP_RECOMMENDATIONS.optimal };
    if (r <= 10) return { type: 'acceptable', text: REP_RECOMMENDATIONS.acceptable };
    return { type: 'lessAccurate', text: REP_RECOMMENDATIONS.lessAccurate };
  };

  const repWarning = getRepWarning();

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

        .one-rep-max-calculator {
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

      <div className="one-rep-max-calculator min-h-screen">
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
                <Link href="/tools/tdee" className="text-sm font-medium text-[var(--color-gray-600)] hover:text-[var(--color-navy)] transition-colors">
                  TDEE Calculator
                </Link>
                <Link href="/tools/one-rep-max" className="text-sm font-medium text-[var(--color-coral)]">
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
              One Rep Max Calculator
            </h1>
            <p className="text-lg lg:text-xl text-[var(--color-gray-600)] max-w-2xl mx-auto">
              Estimate your 1RM from any weight and rep combination. Get a full percentage chart for programming your training.
            </p>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="py-12 px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
              {/* Calculator Form - narrower */}
              <div className="lg:col-span-2">
                <div className="bg-[var(--color-gray-50)] rounded-2xl p-6 lg:p-8 lg:sticky lg:top-28">
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
                        lbs
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
                        kg
                      </button>
                    </div>

                    {/* Exercise (Optional) */}
                    <div>
                      <label className="block text-sm font-semibold text-[var(--color-navy)] mb-2">
                        Exercise <span className="font-normal text-[var(--color-gray-400)]">(optional)</span>
                      </label>
                      <select
                        value={exercise}
                        onChange={(e) => setExercise(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-[var(--color-gray-100)] focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral)]/20 outline-none transition-all bg-white"
                      >
                        <option value="">Select exercise...</option>
                        {COMMON_EXERCISES.map((ex) => (
                          <option key={ex.value} value={ex.value}>{ex.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Weight */}
                    <div>
                      <label className="block text-sm font-semibold text-[var(--color-navy)] mb-2">
                        Weight Lifted
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="225"
                          required
                          min="1"
                          className="w-full px-4 py-3 pr-12 rounded-lg border border-[var(--color-gray-100)] focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral)]/20 outline-none transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-gray-400)] font-mono text-sm">
                          {unitSystem === 'imperial' ? 'lbs' : 'kg'}
                        </span>
                      </div>
                    </div>

                    {/* Reps */}
                    <div>
                      <label className="block text-sm font-semibold text-[var(--color-navy)] mb-2">
                        Reps Performed
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={reps}
                          onChange={(e) => setReps(e.target.value)}
                          placeholder="5"
                          required
                          min="1"
                          max="30"
                          className="w-full px-4 py-3 pr-14 rounded-lg border border-[var(--color-gray-100)] focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral)]/20 outline-none transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-gray-400)] font-mono text-sm">reps</span>
                      </div>
                      {repWarning && (
                        <p className={`mt-2 text-xs ${
                          repWarning.type === 'optimal' ? 'text-green-600' :
                          repWarning.type === 'acceptable' ? 'text-[var(--color-gray-600)]' :
                          'text-amber-600'
                        }`}>
                          {repWarning.text}
                        </p>
                      )}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="w-full py-4 text-lg font-bold text-white bg-[var(--color-coral)] rounded-xl hover:bg-[var(--color-coral-dark)] transition-all shadow-lg shadow-[var(--color-coral)]/25"
                    >
                      Calculate 1RM
                    </button>
                  </form>
                </div>
              </div>

              {/* Results Panel - wider */}
              <div className="lg:col-span-3">
                {results && currentOneRM ? (
                  <div className="space-y-6">
                    {/* Main Results Card */}
                    <div className="bg-[var(--color-navy)] rounded-2xl p-6 lg:p-8 text-white">
                      <h2 className="text-xl font-bold mb-6">
                        Your Estimated 1RM
                        {exercise && (
                          <span className="font-normal text-[var(--color-gray-400)]">
                            {' '}for {COMMON_EXERCISES.find(e => e.value === exercise)?.label || exercise}
                          </span>
                        )}
                      </h2>

                      {/* 1RM */}
                      <div className="text-center mb-8">
                        <p className="font-mono text-7xl font-bold text-[var(--color-coral)]">
                          {currentOneRM}
                        </p>
                        <p className="text-[var(--color-gray-400)] mt-1">
                          {unitSystem === 'imperial' ? 'pounds' : 'kilograms'}
                        </p>
                      </div>

                      {/* Input Summary */}
                      <div className="pt-4 border-t border-[var(--color-navy-light)] text-sm text-[var(--color-gray-400)]">
                        Based on {weight} {unitSystem === 'imperial' ? 'lbs' : 'kg'} for {reps} reps
                      </div>
                    </div>

                    {/* Formula Comparison */}
                    <div className="bg-[var(--color-gray-50)] rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-[var(--color-navy)] mb-4">
                        Formula Comparison
                      </h3>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {(['epley', 'brzycki', 'lombardi', 'mayhew', 'oconner'] as OneRMFormula[]).map((formula) => (
                          <button
                            key={formula}
                            onClick={() => {
                              setSelectedFormula(formula);
                              if (results) {
                                setPercentageChart(generatePercentageChart(results[formula]));
                              }
                            }}
                            className={`p-4 rounded-lg text-center transition-all ${
                              selectedFormula === formula
                                ? 'bg-[var(--color-navy)] text-white'
                                : 'bg-white border border-[var(--color-gray-100)] hover:border-[var(--color-navy)]'
                            }`}
                          >
                            <p className={`font-mono text-2xl font-bold ${selectedFormula === formula ? 'text-[var(--color-coral)]' : 'text-[var(--color-navy)]'}`}>
                              {results[formula]}
                            </p>
                            <p className={`text-xs mt-1 ${selectedFormula === formula ? 'text-[var(--color-gray-400)]' : 'text-[var(--color-gray-600)]'}`}>
                              {FORMULA_INFO[formula].name}
                            </p>
                          </button>
                        ))}
                        <div className="p-4 rounded-lg text-center bg-[var(--color-coral-light)] border-2 border-[var(--color-coral)]">
                          <p className="font-mono text-2xl font-bold text-[var(--color-coral)]">
                            {results.average}
                          </p>
                          <p className="text-xs mt-1 text-[var(--color-coral-dark)]">
                            Average
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Percentage Chart */}
                    {percentageChart && (
                      <div className="bg-[var(--color-gray-50)] rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-[var(--color-navy)] mb-4">
                          Training Percentages
                        </h3>

                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="text-left text-sm text-[var(--color-gray-600)]">
                                <th className="pb-3 font-semibold">%</th>
                                <th className="pb-3 font-semibold">Weight</th>
                                <th className="pb-3 font-semibold">Reps</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-gray-100)]">
                              {percentageChart.map((row) => (
                                <tr key={row.percentage} className={row.percentage === 100 ? 'bg-[var(--color-coral-light)]' : ''}>
                                  <td className="py-3 font-mono font-semibold text-[var(--color-navy)]">
                                    {row.percentage}%
                                  </td>
                                  <td className="py-3 font-mono text-lg font-bold text-[var(--color-coral)]">
                                    {row.weight} {unitSystem === 'imperial' ? 'lbs' : 'kg'}
                                  </td>
                                  <td className="py-3 text-[var(--color-gray-600)]">
                                    {row.reps}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* CTA Card */}
                    <ClaimEmailCapture
                      source="one-rep-max-calculator"
                      toolData={getToolData()}
                      headline="Build real strength with a structured program"
                      subheadline="Our AI will create a personalized workout plan using your strength levels."
                      ctaText="Get My Program"
                    />
                  </div>
                ) : (
                  <div className="bg-[var(--color-gray-50)] rounded-2xl p-6 lg:p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-coral-light)] rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-[var(--color-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--color-navy)] mb-2">
                      Your Results
                    </h3>
                    <p className="text-[var(--color-gray-600)]">
                      Enter a weight and rep count to estimate your one rep max.
                    </p>

                    {/* Quick tips */}
                    <div className="mt-6 text-left bg-white rounded-xl p-4 border border-[var(--color-gray-100)]">
                      <h4 className="font-semibold text-[var(--color-navy)] text-sm mb-2">Tips for accuracy</h4>
                      <ul className="text-sm text-[var(--color-gray-600)] space-y-1">
                        <li>- Use a recent lift (last 1-2 weeks)</li>
                        <li>- Lower rep sets (1-6) are most accurate</li>
                        <li>- Take the set close to failure</li>
                        <li>- Compare multiple formulas</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-16 px-6 lg:px-8 bg-[var(--color-gray-50)]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-6">How to Use Your 1RM</h2>

            <div className="prose prose-lg max-w-none text-[var(--color-gray-600)]">
              <p>
                Your <strong>One Rep Max (1RM)</strong> is the maximum weight you can lift for a single repetition
                with good form. It&apos;s a key metric for programming your training.
              </p>

              <h3 className="text-lg font-semibold text-[var(--color-navy)] mt-6 mb-3">Training Zones</h3>
              <ul className="space-y-2">
                <li><strong>90-100% 1RM:</strong> Maximal strength (1-3 reps) - for peaking or testing</li>
                <li><strong>80-90% 1RM:</strong> Strength (3-6 reps) - primary strength work</li>
                <li><strong>70-80% 1RM:</strong> Strength-hypertrophy (6-10 reps) - size and strength</li>
                <li><strong>60-70% 1RM:</strong> Hypertrophy (10-15 reps) - muscle building</li>
                <li><strong>Below 60%:</strong> Muscular endurance (15+ reps) - conditioning</li>
              </ul>

              <h3 className="text-lg font-semibold text-[var(--color-navy)] mt-6 mb-3">About the Formulas</h3>
              <p>
                Different formulas have different strengths. <strong>Epley</strong> and <strong>Brzycki</strong> are
                most commonly used. For best results with low reps (1-6), use Brzycki. For moderate reps (6-10),
                Epley tends to be accurate. The average of all formulas provides a balanced estimate.
              </p>

              <h3 className="text-lg font-semibold text-[var(--color-navy)] mt-6 mb-3">Important Notes</h3>
              <ul className="space-y-2">
                <li>These are <strong>estimates</strong> - your true 1RM may vary</li>
                <li>Accuracy decreases significantly above 10 reps</li>
                <li>Don&apos;t attempt a true 1RM without proper warmup and spotters</li>
                <li>Your 1RM changes as you get stronger - recalculate every 4-8 weeks</li>
              </ul>

              <div className="mt-8 p-4 bg-white rounded-xl border border-[var(--color-gray-100)]">
                <p className="text-sm">
                  <strong>Ready to get stronger?</strong> Check your{' '}
                  <Link href="/tools/macros" className="text-[var(--color-coral)] hover:underline">
                    macros
                  </Link>{' '}
                  and{' '}
                  <Link href="/tools/tdee" className="text-[var(--color-coral)] hover:underline">
                    TDEE
                  </Link>{' '}
                  to make sure your nutrition supports your strength goals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
