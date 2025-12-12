'use client';

import React, { useEffect, useState } from 'react';
import MainLayout from '@/app/components/layouts/MainLayout';
import { MealPlanDisplay } from './components/MealPlanDisplay';
import { GroceryList } from './components/GroceryList';

interface Macros {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

interface MealPlanConfig {
  mealsPerDay: number;
  days: number;
  preferences: string[];
}

export interface Ingredient {
  name: string;
  amount: string;
  category: 'protein' | 'produce' | 'dairy' | 'grains' | 'pantry' | 'other';
}

export interface Meal {
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients: Ingredient[];
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
  };
  prepTime?: string;
  instructions?: string;
}

export interface DayPlan {
  day: number;
  dayName: string;
  meals: Meal[];
  totalMacros: {
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
  };
}

export interface MealPlan {
  id: string;
  createdAt: string;
  targetMacros: Macros;
  config: MealPlanConfig;
  days: DayPlan[];
  groceryList: Ingredient[];
}

const FREE_PREFERENCES = ['high-protein', 'quick-meals'];
const PAID_PREFERENCES = ['vegetarian', 'dairy-free', 'gluten-free', 'budget-friendly', 'low-carb'];
const ALL_PREFERENCES = [...FREE_PREFERENCES, ...PAID_PREFERENCES];

export default function MealPrepPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User data
  const [macros, setMacros] = useState<Macros | null>(null);
  const [isPro, setIsPro] = useState(false);

  // Form state
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [days, setDays] = useState(1);
  const [preferences, setPreferences] = useState<string[]>([]);

  // Generated plan
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<MealPlan[]>([]);

  // Load user's macros from their program
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current program for macros
        const programRes = await fetch('/api/programs/current');
        if (programRes.ok) {
          const program = await programRes.json();
          const workoutPlan = program.workoutPlans?.[0];
          if (workoutPlan) {
            setMacros({
              protein: workoutPlan.proteinGrams || 150,
              carbs: workoutPlan.carbGrams || 200,
              fat: workoutPlan.fatGrams || 60,
              calories: workoutPlan.dailyCalories || 2000,
            });
          }
        }

        // Check subscription status
        const userRes = await fetch('/api/user');
        if (userRes.ok) {
          const userData = await userRes.json();
          setIsPro(userData.isPremium || userData.subscription?.status === 'ACTIVE');
        }

        // Load saved plans from localStorage
        const saved = localStorage.getItem('mealPlans');
        if (saved) {
          setSavedPlans(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const togglePreference = (pref: string) => {
    const isPaidPref = PAID_PREFERENCES.includes(pref);
    if (isPaidPref && !isPro) return;

    setPreferences(prev =>
      prev.includes(pref)
        ? prev.filter(p => p !== pref)
        : [...prev, pref]
    );
  };

  const generateMealPlan = async () => {
    if (!macros) return;

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/meal-prep/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetMacros: macros,
          mealsPerDay,
          days: isPro ? days : 1, // Free users get 1 day only
          preferences: isPro ? preferences : preferences.filter(p => FREE_PREFERENCES.includes(p)),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate meal plan');
      }

      const plan = await response.json();
      setMealPlan(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setGenerating(false);
    }
  };

  const savePlan = () => {
    if (!mealPlan || !isPro) return;

    const updated = [mealPlan, ...savedPlans].slice(0, 10); // Keep last 10
    setSavedPlans(updated);
    localStorage.setItem('mealPlans', JSON.stringify(updated));
  };

  const loadPlan = (plan: MealPlan) => {
    setMealPlan(plan);
  };

  const copyGroceryList = () => {
    if (!mealPlan) return;

    const text = mealPlan.groceryList
      .reduce((acc, item) => {
        const category = item.category.charAt(0).toUpperCase() + item.category.slice(1);
        if (!acc[category]) acc[category] = [];
        acc[category].push(`${item.amount} ${item.name}`);
        return acc;
      }, {} as Record<string, string[]>);

    const formatted = Object.entries(text)
      .map(([cat, items]) => `${cat}:\n${items.map(i => `  - ${i}`).join('\n')}`)
      .join('\n\n');

    navigator.clipboard.writeText(formatted);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-6 h-6 border-2 border-[#F1F5F9] border-t-[#FF6B6B] rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Compact Header with Inline Targets */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Meal Prep Helper</h1>
            <p className="text-sm text-[#64748B]">Generate meal plans that hit your macro targets</p>
          </div>
          {macros && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-[#94A3B8] uppercase tracking-wider" style={{ fontFamily: "'Space Mono', monospace" }}>
                Targets:
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#FEF2F2] text-[#DC2626] text-sm font-medium rounded-full">
                  {macros.calories} cal
                </span>
                <span className="px-2.5 py-1 bg-[#F0FDF4] text-[#16A34A] text-sm font-medium rounded-full">
                  {macros.protein}g P
                </span>
                <span className="px-2.5 py-1 bg-[#FEF9C3] text-[#CA8A04] text-sm font-medium rounded-full">
                  {macros.carbs}g C
                </span>
                <span className="px-2.5 py-1 bg-[#F0F9FF] text-[#0284C7] text-sm font-medium rounded-full">
                  {macros.fat}g F
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Horizontal Config Row */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Dropdowns */}
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={mealsPerDay}
                onChange={(e) => setMealsPerDay(Number(e.target.value))}
                className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] bg-white"
              >
                {[2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n} meals/day</option>
                ))}
              </select>

              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] bg-white"
              >
                <option value={1}>1 day</option>
                {[2, 3, 4, 5, 6, 7].map(n => (
                  <option key={n} value={n} disabled={!isPro}>
                    {n} days {!isPro && '(Pro)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Divider - hidden on mobile */}
            <div className="hidden lg:block w-px h-8 bg-[#E2E8F0]" />

            {/* Preferences - inline on desktop */}
            <div className="flex items-center gap-2 flex-wrap flex-1">
              {ALL_PREFERENCES.map(pref => {
                const isPaidPref = PAID_PREFERENCES.includes(pref);
                const isLocked = isPaidPref && !isPro;
                const isSelected = preferences.includes(pref);

                return (
                  <button
                    key={pref}
                    onClick={() => togglePreference(pref)}
                    disabled={isLocked}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-[#0F172A] text-white'
                        : isLocked
                        ? 'bg-[#F8FAFC] text-[#CBD5E1] cursor-not-allowed'
                        : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0]'
                    }`}
                  >
                    {isLocked && <span className="mr-0.5">🔒</span>}
                    {pref.replace('-', ' ')}
                  </button>
                );
              })}
            </div>

            {/* Generate Button */}
            <button
              onClick={generateMealPlan}
              disabled={generating || !macros}
              className="px-6 py-2 bg-[#FF6B6B] text-white text-sm font-medium rounded-lg hover:bg-[#EF5350] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {generating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Plan'
              )}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-500 mt-3">{error}</p>
          )}
        </div>

        {/* Split View: Meal Plan + Grocery List */}
        {mealPlan && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Meal Plan - takes more space */}
            <div className="flex-1 lg:max-w-[60%]">
              <MealPlanDisplay
                plan={mealPlan}
                isPro={isPro}
                onSave={savePlan}
                targetMacros={macros!}
              />
            </div>

            {/* Right sidebar - sticky on desktop */}
            <div className="lg:w-[40%]">
              <div className="lg:sticky lg:top-6 space-y-4">
                {/* Upgrade CTA - FIRST for free users */}
                {!isPro && (
                  <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-xl p-4 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF6B6B]/10 rounded-full blur-2xl" />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-[#FF6B6B] text-white text-[10px] font-bold uppercase rounded">Pro</span>
                        <h3 className="font-semibold text-sm">Unlock Full Meal Planning</h3>
                      </div>
                      <ul className="space-y-1.5 mb-3">
                        <li className="flex items-center gap-2 text-xs text-[#94A3B8]">
                          <svg className="w-3.5 h-3.5 text-[#FF6B6B]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Plan up to 7 days at once
                        </li>
                        <li className="flex items-center gap-2 text-xs text-[#94A3B8]">
                          <svg className="w-3.5 h-3.5 text-[#FF6B6B]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Save & reuse your favorite plans
                        </li>
                        <li className="flex items-center gap-2 text-xs text-[#94A3B8]">
                          <svg className="w-3.5 h-3.5 text-[#FF6B6B]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Export grocery lists
                        </li>
                        <li className="flex items-center gap-2 text-xs text-[#94A3B8]">
                          <svg className="w-3.5 h-3.5 text-[#FF6B6B]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          All dietary preferences
                        </li>
                      </ul>
                      <a
                        href="/purchase"
                        className="block w-full py-2 bg-[#FF6B6B] text-white text-sm font-medium rounded-lg hover:bg-[#EF5350] transition-colors text-center"
                      >
                        Upgrade to Pro
                      </a>
                    </div>
                  </div>
                )}

                {/* Grocery List */}
                <GroceryList
                  items={mealPlan.groceryList}
                  isPro={isPro}
                  onCopy={copyGroceryList}
                />

                {/* Saved Plans (Pro only) - compact */}
                {isPro && savedPlans.length > 0 && (
                  <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4">
                    <h3 className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-3" style={{ fontFamily: "'Space Mono', monospace" }}>
                      Saved Plans
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {savedPlans.map((plan) => (
                        <button
                          key={plan.id}
                          onClick={() => loadPlan(plan)}
                          className="w-full p-2 text-left rounded-lg border border-[#E2E8F0] hover:border-[#94A3B8] transition-colors text-xs"
                        >
                          <span className="font-medium text-[#0F172A]">
                            {plan.days.length}d • {plan.config.mealsPerDay} meals
                          </span>
                          <span className="text-[#94A3B8] ml-2">
                            {new Date(plan.createdAt).toLocaleDateString()}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty state - before generation */}
        {!mealPlan && !generating && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#F8FAFC] rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#0F172A] mb-2">Ready to plan your meals</h3>
              <p className="text-sm text-[#64748B]">
                Configure your preferences above and click Generate to create a meal plan that hits your daily macro targets.
              </p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
