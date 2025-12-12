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
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Meal Prep Helper</h1>
          <p className="text-[#64748B]">Generate meal plans that hit your macro targets</p>
        </div>

        {/* Macro Targets Display */}
        {macros && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
            <h2 className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider mb-4" style={{ fontFamily: "'Space Mono', monospace" }}>
              Your Daily Targets
            </h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#0F172A]">{macros.calories}</div>
                <div className="text-xs text-[#94A3B8]">Calories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#0F172A]">{macros.protein}g</div>
                <div className="text-xs text-[#94A3B8]">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#0F172A]">{macros.carbs}g</div>
                <div className="text-xs text-[#94A3B8]">Carbs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#0F172A]">{macros.fat}g</div>
                <div className="text-xs text-[#94A3B8]">Fat</div>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Form */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-6">
          <h2 className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider" style={{ fontFamily: "'Space Mono', monospace" }}>
            Configure Your Plan
          </h2>

          {/* Meals per day */}
          <div>
            <label className="block text-sm font-medium text-[#475569] mb-2">
              Meals per day
            </label>
            <select
              value={mealsPerDay}
              onChange={(e) => setMealsPerDay(Number(e.target.value))}
              className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B]"
            >
              {[2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n} meals</option>
              ))}
            </select>
          </div>

          {/* Days to plan */}
          <div>
            <label className="block text-sm font-medium text-[#475569] mb-2">
              Days to plan
            </label>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B]"
            >
              <option value={1}>1 day</option>
              {[2, 3, 4, 5, 6, 7].map(n => (
                <option key={n} value={n} disabled={!isPro}>
                  {n} days {!isPro && '(Pro)'}
                </option>
              ))}
            </select>
            {!isPro && days > 1 && (
              <p className="text-xs text-[#94A3B8] mt-1">
                Multi-day planning available with Pro
              </p>
            )}
          </div>

          {/* Preferences */}
          <div>
            <label className="block text-sm font-medium text-[#475569] mb-2">
              Dietary preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_PREFERENCES.map(pref => {
                const isPaidPref = PAID_PREFERENCES.includes(pref);
                const isLocked = isPaidPref && !isPro;
                const isSelected = preferences.includes(pref);

                return (
                  <button
                    key={pref}
                    onClick={() => togglePreference(pref)}
                    disabled={isLocked}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-[#0F172A] text-white'
                        : isLocked
                        ? 'bg-[#F8FAFC] text-[#CBD5E1] cursor-not-allowed'
                        : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0]'
                    }`}
                  >
                    {isLocked && <span className="mr-1">🔒</span>}
                    {pref.replace('-', ' ')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateMealPlan}
            disabled={generating || !macros}
            className="w-full py-3 bg-[#FF6B6B] text-white font-medium rounded-lg hover:bg-[#EF5350] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Meal Plan'
            )}
          </button>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
        </div>

        {/* Generated Meal Plan */}
        {mealPlan && (
          <>
            <MealPlanDisplay
              plan={mealPlan}
              isPro={isPro}
              onSave={savePlan}
              targetMacros={macros!}
            />

            <GroceryList
              items={mealPlan.groceryList}
              isPro={isPro}
              onCopy={copyGroceryList}
            />
          </>
        )}

        {/* Saved Plans (Pro only) */}
        {isPro && savedPlans.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
            <h2 className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider mb-4" style={{ fontFamily: "'Space Mono', monospace" }}>
              Saved Plans
            </h2>
            <div className="space-y-2">
              {savedPlans.map((plan, idx) => (
                <button
                  key={plan.id}
                  onClick={() => loadPlan(plan)}
                  className="w-full p-3 text-left rounded-lg border border-[#E2E8F0] hover:border-[#94A3B8] transition-colors"
                >
                  <div className="font-medium text-[#0F172A]">
                    {plan.days.length}-day plan • {plan.config.mealsPerDay} meals/day
                  </div>
                  <div className="text-sm text-[#64748B]">
                    Saved {new Date(plan.createdAt).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Upgrade CTA (Free users only) */}
        {!isPro && mealPlan && (
          <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Want to plan your whole week?</h3>
            <p className="text-[#94A3B8] mb-4">Pro members can:</p>
            <ul className="space-y-2 mb-4 text-sm">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#FF6B6B]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Generate 7-day meal plans
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#FF6B6B]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Save unlimited plans
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#FF6B6B]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Export grocery lists
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#FF6B6B]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                All dietary preferences
              </li>
            </ul>
            <a
              href="/purchase"
              className="inline-block px-6 py-2 bg-[#FF6B6B] text-white font-medium rounded-lg hover:bg-[#EF5350] transition-colors"
            >
              Upgrade to Pro
            </a>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
