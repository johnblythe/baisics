'use client';

import { useState } from 'react';
import { Coffee, Sun, Moon, Apple, Plus, ChevronLeft, ChevronRight, X, Check, Settings, Pin } from 'lucide-react';

// ============================================
// Mock Data
// ============================================

interface StapleItem {
  id: string;
  name: string;
  emoji?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items?: string[]; // sub-items for combos
  usageCount: number;
}

interface FoodLogItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const BREAKFAST_STAPLES: StapleItem[] = [
  {
    id: '1',
    name: 'Protein Yogurt + Berries',
    emoji: '🫐',
    calories: 280,
    protein: 35,
    carbs: 28,
    fat: 4,
    items: ['Greek yogurt (200g)', 'Mixed berries (100g)', 'Honey (1 tsp)'],
    usageCount: 47,
  },
  {
    id: '2',
    name: 'Eggs & Toast & Shake',
    emoji: '🍳',
    calories: 520,
    protein: 48,
    carbs: 32,
    fat: 22,
    items: ['4 eggs scrambled', '1 slice sourdough', 'Protein shake (1 scoop)'],
    usageCount: 31,
  },
  {
    id: '3',
    name: 'Overnight Protein Oats',
    emoji: '🥣',
    calories: 410,
    protein: 38,
    carbs: 52,
    fat: 8,
    items: ['Oats (80g)', 'Protein powder (1 scoop)', 'Almond milk (200ml)', 'Banana (½)'],
    usageCount: 18,
  },
];

const SNACK_STAPLES: StapleItem[] = [
  {
    id: '4',
    name: 'Popcorn + Protein Pudding',
    emoji: '🍿',
    calories: 310,
    protein: 28,
    carbs: 35,
    fat: 6,
    items: ['Air-popped popcorn (3 cups)', 'Protein pudding (1 cup)'],
    usageCount: 52,
  },
  {
    id: '5',
    name: 'Cottage Cheese + Honey',
    emoji: '🍯',
    calories: 220,
    protein: 24,
    carbs: 18,
    fat: 5,
    items: ['Low-fat cottage cheese (200g)', 'Honey (1 tbsp)'],
    usageCount: 14,
  },
];

const LUNCH_LOGGED: FoodLogItem[] = [
  { id: 'l1', name: 'Grilled Chicken Breast', calories: 284, protein: 53, carbs: 0, fat: 6 },
  { id: 'l2', name: 'Brown Rice', calories: 216, protein: 5, carbs: 45, fat: 2 },
  { id: 'l3', name: 'Steamed Broccoli', calories: 55, protein: 4, carbs: 11, fat: 1 },
];

const DAILY_TARGETS = { calories: 2000, protein: 150, carbs: 250, fat: 65 };

function getMealIcon(meal: string) {
  switch (meal) {
    case 'Breakfast': return <Coffee className="w-4 h-4" />;
    case 'Lunch': return <Sun className="w-4 h-4" />;
    case 'Dinner': return <Moon className="w-4 h-4" />;
    default: return <Apple className="w-4 h-4" />;
  }
}

// ============================================
// Shared carousel navigation hook
// ============================================
function useCarousel(length: number) {
  const [index, setIndex] = useState(0);
  const prev = () => setIndex((i) => (i - 1 + length) % length);
  const next = () => setIndex((i) => (i + 1) % length);
  return { index, setIndex, prev, next };
}

// ============================================
// OPTION A: Minimal — name only, macros on hover/tap
// ============================================

function StapleCarouselMinimal({ staples, meal, confirmed, onConfirm, onDismiss }: {
  staples: StapleItem[];
  meal: string;
  confirmed: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  const { index, prev, next, setIndex } = useCarousel(staples.length);
  const current = staples[index];

  if (confirmed) return null;

  return (
    <div className="mx-3 mt-2 mb-1">
      <div className={`
        relative rounded-lg border-2 border-dashed transition-all
        ${confirmed ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-gray-50/60'}
      `}>
        {/* Carousel content */}
        <div className="flex items-center px-3 py-3">
          {/* Left arrow */}
          {staples.length > 1 && (
            <button onClick={prev} className="p-1 text-gray-400 hover:text-gray-600 shrink-0">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Staple name */}
          <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
            <span className="text-lg">{current.emoji}</span>
            <span className="text-sm font-medium text-gray-500 truncate">{current.name}</span>
          </div>

          {/* Right arrow */}
          {staples.length > 1 && (
            <button onClick={next} className="p-1 text-gray-400 hover:text-gray-600 shrink-0">
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 ml-2 shrink-0">
            <button
              onClick={onConfirm}
              className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-100 transition-colors"
              title="Confirm staple"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-md text-gray-400 hover:bg-gray-200 transition-colors"
              title="Not today"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dots */}
        {staples.length > 1 && (
          <div className="flex justify-center gap-1.5 pb-2">
            {staples.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === index ? 'bg-gray-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// OPTION B: Inline Macros — compact macro bar on card
// ============================================

function StapleCarouselInlineMacros({ staples, meal, confirmed, onConfirm, onDismiss }: {
  staples: StapleItem[];
  meal: string;
  confirmed: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  const { index, prev, next, setIndex } = useCarousel(staples.length);
  const current = staples[index];

  if (confirmed) return null;

  return (
    <div className="mx-3 mt-2 mb-1">
      <div className="relative rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/60 transition-all">
        {/* Pin badge */}
        <div className="absolute -top-2 left-3 flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded-full">
          <Pin className="w-3 h-3 text-[#FF6B6B]" />
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Staple</span>
        </div>

        {/* Carousel content */}
        <div className="flex items-center px-3 pt-4 pb-1">
          {staples.length > 1 && (
            <button onClick={prev} className="p-1 text-gray-400 hover:text-gray-600 shrink-0">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <div className="flex-1 text-center min-w-0">
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">{current.emoji}</span>
              <span className="text-sm font-medium text-gray-600 truncate">{current.name}</span>
            </div>
            {/* Inline macros */}
            <div className="flex items-center justify-center gap-3 mt-1.5">
              <span className="text-xs text-gray-500">
                <span className="font-semibold text-gray-700">{current.calories}</span> cal
              </span>
              <span className="text-xs text-blue-500">
                <span className="font-semibold">{current.protein}g</span> P
              </span>
              <span className="text-xs text-amber-500">
                <span className="font-semibold">{current.carbs}g</span> C
              </span>
              <span className="text-xs text-orange-500">
                <span className="font-semibold">{current.fat}g</span> F
              </span>
            </div>
          </div>

          {staples.length > 1 && (
            <button onClick={next} className="p-1 text-gray-400 hover:text-gray-600 shrink-0">
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-1 ml-2 shrink-0">
            <button
              onClick={onConfirm}
              className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-100 transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-md text-gray-400 hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dots */}
        {staples.length > 1 && (
          <div className="flex justify-center gap-1.5 pb-2">
            {staples.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === index ? 'bg-gray-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// OPTION C: Rich Card — macros + mini progress contribution + item list
// ============================================

function StapleCarouselRichCard({ staples, meal, confirmed, onConfirm, onDismiss }: {
  staples: StapleItem[];
  meal: string;
  confirmed: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  const { index, prev, next, setIndex } = useCarousel(staples.length);
  const [expanded, setExpanded] = useState(false);
  const current = staples[index];

  if (confirmed) return null;

  const calPct = Math.round((current.calories / DAILY_TARGETS.calories) * 100);
  const protPct = Math.round((current.protein / DAILY_TARGETS.protein) * 100);

  return (
    <div className="mx-3 mt-2 mb-1">
      <div className="relative rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/60 transition-all overflow-hidden">
        {/* Pin badge */}
        <div className="absolute -top-2 left-3 z-10 flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded-full">
          <Pin className="w-3 h-3 text-[#FF6B6B]" />
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Staple</span>
        </div>

        {/* Main carousel */}
        <div className="flex items-start px-3 pt-4 pb-2">
          {staples.length > 1 && (
            <button onClick={prev} className="p-1 mt-1 text-gray-400 hover:text-gray-600 shrink-0">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <button
            className="flex-1 min-w-0 text-left"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">{current.emoji}</span>
              <span className="text-sm font-medium text-gray-600">{current.name}</span>
            </div>

            {/* Macro chips + daily % */}
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-gray-200">
                <span className="text-xs font-semibold text-gray-700">{current.calories}</span>
                <span className="text-[10px] text-gray-400">cal</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100">
                <span className="text-xs font-semibold text-blue-600">{current.protein}g</span>
                <span className="text-[10px] text-blue-400">P</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-100">
                <span className="text-xs font-semibold text-amber-600">{current.carbs}g</span>
                <span className="text-[10px] text-amber-400">C</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 border border-orange-100">
                <span className="text-xs font-semibold text-orange-600">{current.fat}g</span>
                <span className="text-[10px] text-orange-400">F</span>
              </div>
            </div>

            {/* Daily contribution bar */}
            <div className="flex items-center gap-2 mt-2 px-4">
              <span className="text-[10px] text-gray-400 w-16 shrink-0 text-right">{calPct}% daily cal</span>
              <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gray-400 rounded-full" style={{ width: `${calPct}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-0.5 px-4">
              <span className="text-[10px] text-blue-400 w-16 shrink-0 text-right">{protPct}% protein</span>
              <div className="flex-1 h-1 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: `${protPct}%` }} />
              </div>
            </div>
          </button>

          {staples.length > 1 && (
            <button onClick={next} className="p-1 mt-1 text-gray-400 hover:text-gray-600 shrink-0">
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <div className="flex flex-col items-center gap-1 ml-2 shrink-0">
            <button
              onClick={onConfirm}
              className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-100 transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-md text-gray-400 hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable item list */}
        {expanded && current.items && (
          <div className="px-6 pb-2 border-t border-gray-200 mt-1 pt-2">
            <ul className="space-y-0.5">
              {current.items.map((item, i) => (
                <li key={i} className="text-xs text-gray-500 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Dots */}
        {staples.length > 1 && (
          <div className="flex justify-center gap-1.5 pb-2">
            {staples.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === index ? 'bg-gray-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Confirmed staple row (shown after confirming)
// ============================================
function ConfirmedStapleRow({ staple, onUndo }: { staple: StapleItem; onUndo: () => void }) {
  return (
    <div className="mx-3 mt-2 mb-1 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Pin className="w-3 h-3 text-emerald-500" />
        <span className="text-sm font-medium text-emerald-700">{staple.emoji} {staple.name}</span>
        <span className="text-xs text-emerald-500">{staple.calories} cal</span>
      </div>
      <button onClick={onUndo} className="text-xs text-emerald-500 hover:text-emerald-700 underline">
        Undo
      </button>
    </div>
  );
}

// ============================================
// Meal Section wrapper (shared across options)
// ============================================
function MealSectionShell({ meal, children, items }: {
  meal: string;
  children: React.ReactNode;
  items?: FoodLogItem[];
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {getMealIcon(meal)}
          <span className="font-semibold text-[#0F172A] text-sm">{meal}</span>
        </div>
        <button className="text-xs text-[#FF6B6B] font-medium flex items-center gap-1 hover:opacity-80">
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

      {/* Staple carousel slot */}
      {children}

      {/* Logged items */}
      {items && items.length > 0 && (
        <div className="border-t border-gray-100">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 last:border-b-0">
              <span className="text-sm text-gray-700">{item.name}</span>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>{item.calories} cal</span>
                <span className="text-blue-400">{item.protein}g P</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add button */}
      <div className="px-4 py-3">
        <button className="w-full py-2 text-sm text-gray-400 hover:text-[#FF6B6B] hover:bg-gray-50 rounded-lg border border-dashed border-gray-200 transition-colors">
          + Add {meal.toLowerCase()}
        </button>
      </div>
    </div>
  );
}

// ============================================
// Full demo for each option
// ============================================
function OptionAMinimal() {
  const [breakfastConfirmed, setBreakfastConfirmed] = useState(false);
  const [breakfastDismissed, setBreakfastDismissed] = useState(false);
  const [snackConfirmed, setSnackConfirmed] = useState(false);
  const [snackDismissed, setSnackDismissed] = useState(false);

  return (
    <div className="space-y-4">
      <MealSectionShell meal="Breakfast">
        {!breakfastDismissed && !breakfastConfirmed && (
          <StapleCarouselMinimal
            staples={BREAKFAST_STAPLES}
            meal="Breakfast"
            confirmed={breakfastConfirmed}
            onConfirm={() => setBreakfastConfirmed(true)}
            onDismiss={() => setBreakfastDismissed(true)}
          />
        )}
        {breakfastConfirmed && <ConfirmedStapleRow staple={BREAKFAST_STAPLES[0]} onUndo={() => setBreakfastConfirmed(false)} />}
      </MealSectionShell>

      <MealSectionShell meal="Lunch" items={LUNCH_LOGGED}>
        {null}
      </MealSectionShell>

      <MealSectionShell meal="Dinner">
        {null}
      </MealSectionShell>

      <MealSectionShell meal="Snack">
        {!snackDismissed && !snackConfirmed && (
          <StapleCarouselMinimal
            staples={SNACK_STAPLES}
            meal="Snack"
            confirmed={snackConfirmed}
            onConfirm={() => setSnackConfirmed(true)}
            onDismiss={() => setSnackDismissed(true)}
          />
        )}
        {snackConfirmed && <ConfirmedStapleRow staple={SNACK_STAPLES[0]} onUndo={() => setSnackConfirmed(false)} />}
      </MealSectionShell>
    </div>
  );
}

function OptionBInlineMacros() {
  const [breakfastConfirmed, setBreakfastConfirmed] = useState(false);
  const [breakfastDismissed, setBreakfastDismissed] = useState(false);
  const [snackConfirmed, setSnackConfirmed] = useState(false);
  const [snackDismissed, setSnackDismissed] = useState(false);

  return (
    <div className="space-y-4">
      <MealSectionShell meal="Breakfast">
        {!breakfastDismissed && !breakfastConfirmed && (
          <StapleCarouselInlineMacros
            staples={BREAKFAST_STAPLES}
            meal="Breakfast"
            confirmed={breakfastConfirmed}
            onConfirm={() => setBreakfastConfirmed(true)}
            onDismiss={() => setBreakfastDismissed(true)}
          />
        )}
        {breakfastConfirmed && <ConfirmedStapleRow staple={BREAKFAST_STAPLES[0]} onUndo={() => setBreakfastConfirmed(false)} />}
      </MealSectionShell>

      <MealSectionShell meal="Lunch" items={LUNCH_LOGGED}>
        {null}
      </MealSectionShell>

      <MealSectionShell meal="Dinner">
        {null}
      </MealSectionShell>

      <MealSectionShell meal="Snack">
        {!snackDismissed && !snackConfirmed && (
          <StapleCarouselInlineMacros
            staples={SNACK_STAPLES}
            meal="Snack"
            confirmed={snackConfirmed}
            onConfirm={() => setSnackConfirmed(true)}
            onDismiss={() => setSnackDismissed(true)}
          />
        )}
        {snackConfirmed && <ConfirmedStapleRow staple={SNACK_STAPLES[0]} onUndo={() => setSnackConfirmed(false)} />}
      </MealSectionShell>
    </div>
  );
}

function OptionCRichCard() {
  const [breakfastConfirmed, setBreakfastConfirmed] = useState(false);
  const [breakfastDismissed, setBreakfastDismissed] = useState(false);
  const [snackConfirmed, setSnackConfirmed] = useState(false);
  const [snackDismissed, setSnackDismissed] = useState(false);

  return (
    <div className="space-y-4">
      <MealSectionShell meal="Breakfast">
        {!breakfastDismissed && !breakfastConfirmed && (
          <StapleCarouselRichCard
            staples={BREAKFAST_STAPLES}
            meal="Breakfast"
            confirmed={breakfastConfirmed}
            onConfirm={() => setBreakfastConfirmed(true)}
            onDismiss={() => setBreakfastDismissed(true)}
          />
        )}
        {breakfastConfirmed && <ConfirmedStapleRow staple={BREAKFAST_STAPLES[0]} onUndo={() => setBreakfastConfirmed(false)} />}
      </MealSectionShell>

      <MealSectionShell meal="Lunch" items={LUNCH_LOGGED}>
        {null}
      </MealSectionShell>

      <MealSectionShell meal="Dinner">
        {null}
      </MealSectionShell>

      <MealSectionShell meal="Snack">
        {!snackDismissed && !snackConfirmed && (
          <StapleCarouselRichCard
            staples={SNACK_STAPLES}
            meal="Snack"
            confirmed={snackConfirmed}
            onConfirm={() => setSnackConfirmed(true)}
            onDismiss={() => setSnackDismissed(true)}
          />
        )}
        {snackConfirmed && <ConfirmedStapleRow staple={SNACK_STAPLES[0]} onUndo={() => setSnackConfirmed(false)} />}
      </MealSectionShell>
    </div>
  );
}

// ============================================
// Main Page
// ============================================
export default function StaplesCarouselExploration() {
  const [activeOption, setActiveOption] = useState<'A' | 'B' | 'C'>('A');

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a href="/dev" className="text-sm text-[#94A3B8] hover:text-[#FF6B6B] mb-2 inline-block">
            ← Back to Dev
          </a>
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">
            Staples Carousel — Design Options (#376)
          </h1>
          <p className="text-[#475569] text-sm">
            How should staples appear in meal slots? Testing 3 levels of information density.
            Click arrows to browse staples, checkmark to confirm, X to dismiss.
          </p>
        </div>

        {/* Option Selector */}
        <div className="flex gap-2 mb-6 p-1 bg-white rounded-xl border border-[#E2E8F0]">
          {(['A', 'B', 'C'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setActiveOption(opt)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                activeOption === opt
                  ? 'bg-[#0F172A] text-white'
                  : 'text-[#475569] hover:bg-[#F8FAFC]'
              }`}
            >
              Option {opt}
            </button>
          ))}
        </div>

        {/* Description */}
        <div className="mb-6 p-4 bg-white rounded-xl border border-[#E2E8F0]">
          {activeOption === 'A' && (
            <>
              <h3 className="font-semibold text-[#0F172A] mb-1">Option A: Minimal</h3>
              <p className="text-sm text-[#475569]">
                Just the staple name + emoji. No macros visible until confirmed/logged.
                Least visual weight — the carousel is unobtrusive, almost like a gentle suggestion.
                Trade-off: you can&apos;t see macro impact without logging it first.
              </p>
            </>
          )}
          {activeOption === 'B' && (
            <>
              <h3 className="font-semibold text-[#0F172A] mb-1">Option B: Inline Macros</h3>
              <p className="text-sm text-[#475569]">
                Staple name + compact macro row (calories, P, C, F). You can see the
                &quot;fixed cost&quot; at a glance while browsing staples. Slightly more visual weight
                but gives you the key info for the budget mental model.
              </p>
            </>
          )}
          {activeOption === 'C' && (
            <>
              <h3 className="font-semibold text-[#0F172A] mb-1">Option C: Rich Card</h3>
              <p className="text-sm text-[#475569]">
                Full macro chips + daily % contribution bars + expandable ingredient list (tap to expand).
                Maximum information — you see exactly what this staple does to your daily budget.
                Trade-off: takes more vertical space and visual attention.
              </p>
            </>
          )}
        </div>

        {/* Demo */}
        <div className="mb-8">
          {activeOption === 'A' && <OptionAMinimal />}
          {activeOption === 'B' && <OptionBInlineMacros />}
          {activeOption === 'C' && <OptionCRichCard />}
        </div>

        {/* Test Notes */}
        <div className="p-4 bg-[#FEF3C7]/50 rounded-xl border border-[#FEF3C7]">
          <h4 className="font-semibold text-[#92400E] mb-2">Test Notes</h4>
          <ul className="text-sm text-[#92400E] space-y-1">
            <li>- Click the arrows to swipe between staples in breakfast/snack slots</li>
            <li>- Click checkmark to confirm (logs immediately, shows green confirmed row)</li>
            <li>- Click X to dismiss (carousel disappears, + Add button still works)</li>
            <li>- Lunch has no staples — shows manually logged items only</li>
            <li>- Dinner has no staples and no items — empty state</li>
            <li>- On Option C, click the staple name to expand/collapse ingredient list</li>
            <li>- Consider: which option makes the &quot;fixed cost&quot; concept click fastest?</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
