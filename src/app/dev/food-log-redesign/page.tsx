'use client';

import { useState } from 'react';

// ============================================
// MOCK DATA
// ============================================
const MOCK_MACROS = { calories: 847, protein: 68, carbs: 89, fat: 31 };
const MOCK_TARGETS = { calories: 2000, protein: 150, carbs: 250, fat: 65 };

const MOCK_MEALS = {
  breakfast: [
    { id: '1', name: 'Kirkland Greek Yogurt', calories: 130, protein: 23, carbs: 9, fat: 0, isStaple: true },
    { id: '2', name: 'Blueberries', calories: 29, protein: 0, carbs: 7, fat: 0, isStaple: true },
  ],
  lunch: [
    { id: '3', name: 'Bone-In Pork Shoulder Butt Roast', calories: 282, protein: 27, carbs: 0, fat: 19 },
  ],
  dinner: [],
  snacks: [
    { id: '4', name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0 },
    { id: '5', name: 'Optimum Nutrition Whey', calories: 124, protein: 24, carbs: 3, fat: 1.5 },
  ],
};

const MOCK_WEEK = [
  { day: 'M', date: '2/18', pct: null },
  { day: 'T', date: '2/19', pct: null },
  { day: 'W', date: '2/20', pct: null },
  { day: 'T', date: '2/21', pct: null },
  { day: 'F', date: '2/22', pct: null },
  { day: 'S', date: '2/23', pct: 50, active: false },
  { day: 'S', date: '2/24', pct: null, active: true, isToday: true },
];

const MOCK_QUICK_FOODS = [
  { name: 'Bone-In Pork S...', cal: 282, emoji: '🥩' },
  { name: 'Optimum Nutri...', cal: 124, emoji: '🥤' },
  { name: 'Blueberries', cal: 29, emoji: '🫐' },
  { name: 'Banana', cal: 105, emoji: '🍌' },
  { name: 'Avocado', cal: 160, emoji: '🥑' },
  { name: 'Ground beef', cal: 287, emoji: '🥩' },
];

const MOCK_RECIPES = [
  { name: 'Morning Protein Yogurt', cal: 283, protein: 48, emoji: '🍳' },
  { name: 'Chicken Rice Bowl', cal: 420, protein: 38, emoji: '🍚' },
];

// ============================================
// SHARED COMPONENTS
// ============================================
function MacroBar({ label, current, target, color }: { label: string; current: number; target: number; color: string }) {
  const pct = Math.min((current / target) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[#475569]">{label}</span>
        <span className="font-medium text-[#0F172A]">{current}{label === 'Calories' ? '' : 'g'} / {target}{label === 'Calories' ? '' : 'g'}</span>
      </div>
      <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function MealIcon({ meal }: { meal: string }) {
  const icons: Record<string, string> = { breakfast: '☕', lunch: '☀️', dinner: '🌙', snacks: '🍎' };
  return <span className="text-sm">{icons[meal] || '🍽️'}</span>;
}

function MealTotal({ items }: { items: typeof MOCK_MEALS.breakfast }) {
  const cal = items.reduce((s, i) => s + i.calories, 0);
  const p = items.reduce((s, i) => s + i.protein, 0);
  return cal > 0 ? <span className="text-xs text-[#94A3B8]">{cal} cal · {p}g P</span> : null;
}

// ============================================
// OPTION A: Current Layout (Reference)
// ============================================
function OptionACurrent() {
  return (
    <div className="bg-[#F8FAFC] rounded-2xl overflow-hidden border border-[#E2E8F0]">
      {/* Targets banner */}
      <div className="bg-[#FFF7ED] border-b border-[#FFEDD5] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-orange-500">⚠️</span>
          <div>
            <div className="text-sm font-medium text-[#0F172A]">Set your nutrition targets</div>
            <div className="text-xs text-[#64748B]">Personalize your calorie and macro goals</div>
          </div>
        </div>
        <button className="px-3 py-1.5 bg-[#FF6B6B] text-white text-xs font-medium rounded-lg">Set Goals</button>
      </div>

      {/* Date nav */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between">
        <button className="text-[#94A3B8]">‹</button>
        <div className="font-semibold text-[#0F172A]">Today</div>
        <div className="flex items-center gap-2">
          <span className="text-[#94A3B8]">⋯</span>
          <button className="text-[#94A3B8]">›</button>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-5 gap-4 p-4">
        {/* LEFT SIDEBAR */}
        <div className="col-span-2 space-y-4">
          {/* Search */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <h3 className="font-medium text-[#0F172A] mb-3 flex items-center gap-2 text-sm">
              <span className="text-[#FF6B6B]">🔍</span> Search Foods
            </h3>
            <div className="bg-[#F8FAFC] rounded-lg px-3 py-2 text-sm text-[#94A3B8] border border-[#E2E8F0]">
              Search foods... (chicken, rice, banana)
            </div>
          </div>

          {/* AI Quick Add */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <h3 className="font-medium text-[#0F172A] mb-3 flex items-center gap-2 text-sm">
              <span className="text-[#FF6B6B]">⚡</span> AI Quick Add
            </h3>
            <div className="flex gap-2">
              <div className="flex-1 bg-[#F8FAFC] rounded-lg px-3 py-2 text-sm text-[#94A3B8] border border-[#E2E8F0]">
                &quot;chicken breast&quot; o...
              </div>
              <div className="flex gap-1">
                <button className="p-2 text-[#94A3B8]">🎤</button>
                <button className="p-2 text-[#94A3B8]">📷</button>
                <button className="p-2 bg-[#FF6B6B] text-white rounded-lg">✨</button>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <h3 className="font-medium text-[#0F172A] mb-3 flex items-center gap-2 text-sm">
              <span className="text-[#FF6B6B]">📈</span> Today&apos;s Progress
            </h3>
            <div className="space-y-3">
              <MacroBar label="Calories" current={MOCK_MACROS.calories} target={MOCK_TARGETS.calories} color="#0F172A" />
              <MacroBar label="Protein" current={MOCK_MACROS.protein} target={MOCK_TARGETS.protein} color="#22C55E" />
              <MacroBar label="Carbs" current={MOCK_MACROS.carbs} target={MOCK_TARGETS.carbs} color="#F59E0B" />
              <MacroBar label="Fat" current={MOCK_MACROS.fat} target={MOCK_TARGETS.fat} color="#EF4444" />
            </div>
          </div>

          {/* Quick Add */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <h3 className="font-medium text-[#0F172A] mb-3 flex items-center gap-2 text-sm">
              <span className="text-[#FF6B6B]">⏱️</span> Quick Add
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {MOCK_QUICK_FOODS.map((f) => (
                <button key={f.name} className="flex items-center gap-2 p-2 bg-[#F8FAFC] rounded-lg text-left hover:bg-[#F1F5F9] transition-colors">
                  <span>{f.emoji}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-[#0F172A] truncate">{f.name}</div>
                    <div className="text-[10px] text-[#94A3B8]">{f.cal} cal</div>
                  </div>
                  <span className="text-[#94A3B8] text-xs ml-auto">+</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recipes */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <h3 className="font-medium text-[#0F172A] mb-3 flex items-center gap-2 text-sm">
              <span className="text-[#FF6B6B]">🍽️</span> My Recipes
            </h3>
            {MOCK_RECIPES.map((r) => (
              <div key={r.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F8FAFC]">
                <span>{r.emoji}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#0F172A]">{r.name}</div>
                  <div className="text-xs text-[#94A3B8]">{r.cal} cal · {r.protein}g P</div>
                </div>
                <span className="text-[#94A3B8]">+</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-3 space-y-4">
          {/* Weekly Strip */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">📅</span>
              <div className="flex gap-1 text-xs font-medium">
                {MOCK_WEEK.map((d) => (
                  <span key={d.date} className={`w-6 h-6 flex items-center justify-center rounded-full ${d.isToday ? 'bg-[#FF6B6B] text-white' : 'text-[#94A3B8]'}`}>
                    {d.day}
                  </span>
                ))}
              </div>
              <span className="text-xs text-[#94A3B8] ml-2">50% avg 1/7</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {MOCK_WEEK.map((d) => (
                <div key={d.date} className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs ${
                  d.isToday ? 'bg-[#FF6B6B] text-white' : d.pct ? 'bg-[#F8FAFC]' : 'bg-[#F8FAFC]'
                }`}>
                  {d.pct !== null && <span className="font-medium">{d.pct}%</span>}
                  <span className={d.isToday ? 'text-white/70' : 'text-[#94A3B8]'}>{d.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Meals */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <h3 className="font-medium text-[#0F172A] mb-4">Today&apos;s Meals</h3>
            <div className="space-y-5">
              {Object.entries(MOCK_MEALS).map(([meal, items]) => (
                <div key={meal}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-[#F1F5F9] rounded-lg"><MealIcon meal={meal} /></div>
                      <span className="font-medium text-[#0F172A] capitalize">{meal}</span>
                      <MealTotal items={items} />
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-[#94A3B8] text-xs">📋</button>
                      <button className="text-xs text-[#FF6B6B] font-medium">+ Add</button>
                    </div>
                  </div>
                  {items.length > 0 ? (
                    <div className="space-y-1">
                      {items.map((item) => (
                        <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl ${item.isStaple ? 'bg-[#FFF5F5]' : 'bg-[#F8FAFC]'}`}>
                          <div className="flex items-center gap-2">
                            {item.isStaple && <span className="text-[10px] text-[#FF6B6B] font-bold uppercase">📌 Staple</span>}
                            <span className="text-sm font-medium text-[#0F172A]">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{item.calories} cal</div>
                            <div className="text-xs text-green-600">{item.protein}g P</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-[#E2E8F0] rounded-xl p-4 text-center">
                      <button className="text-sm text-[#FF6B6B]">+ Add {meal}</button>
                      <div className="text-xs text-[#94A3B8] mt-1">or Copy from yesterday</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// OPTION B: "Log First" — Focused Daily Logger
// The meal log IS the page. Search/add is unified
// into each meal section. Macros are a slim bar.
// ============================================
function OptionBLogFirst() {
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const calPct = Math.round((MOCK_MACROS.calories / MOCK_TARGETS.calories) * 100);
  const protPct = Math.round((MOCK_MACROS.protein / MOCK_TARGETS.protein) * 100);

  return (
    <div className="bg-[#F8FAFC] rounded-2xl overflow-hidden border border-[#E2E8F0] max-w-2xl mx-auto">
      {/* Compact macro header - sticky */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button className="text-[#94A3B8]">‹</button>
            <span className="font-semibold text-[#0F172A]">Today</span>
            <button className="text-[#94A3B8]">›</button>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-[#0F172A] font-medium">{MOCK_MACROS.calories} <span className="text-[#94A3B8] font-normal">/ {MOCK_TARGETS.calories} cal</span></span>
            <span className="text-green-600 font-medium">{MOCK_MACROS.protein}g <span className="text-[#94A3B8] font-normal">/ {MOCK_TARGETS.protein}g P</span></span>
          </div>
        </div>
        {/* Thin dual progress bar */}
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
              <div className="h-full bg-[#0F172A] rounded-full" style={{ width: `${calPct}%` }} />
            </div>
          </div>
          <div className="flex-1">
            <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${protPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Meals - the entire page */}
      <div className="p-4 space-y-3">
        {Object.entries(MOCK_MEALS).map(([meal, items]) => {
          const isExpanded = expandedMeal === meal;
          const mealCal = items.reduce((s, i) => s + i.calories, 0);
          const mealP = items.reduce((s, i) => s + i.protein, 0);

          return (
            <div key={meal} className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              {/* Meal header - always visible */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#F8FAFC] rounded-lg flex items-center justify-center">
                    <MealIcon meal={meal} />
                  </div>
                  <div>
                    <span className="font-medium text-[#0F172A] capitalize">{meal}</span>
                    {items.length > 0 && (
                      <div className="text-xs text-[#94A3B8]">{items.length} items · {mealCal} cal · {mealP}g P</div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setExpandedMeal(isExpanded ? null : meal)}
                  className="px-3 py-1.5 text-xs font-medium text-[#FF6B6B] hover:bg-[#FFE5E5] rounded-lg transition-colors"
                >
                  {items.length === 0 ? '+ Add' : isExpanded ? 'Done' : `${items.length} items ›`}
                </button>
              </div>

              {/* Expanded: items + add */}
              {isExpanded && (
                <div className="border-t border-[#E2E8F0]">
                  {/* Items */}
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-[#F8FAFC]">
                      <span className="text-sm text-[#0F172A]">{item.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-[#0F172A]">{item.calories} cal</span>
                        <span className="text-xs text-green-600">{item.protein}g P</span>
                      </div>
                    </div>
                  ))}

                  {/* Inline search */}
                  <div className="px-4 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0]">
                    <div className="bg-white rounded-lg px-3 py-2 border border-[#E2E8F0] text-sm text-[#94A3B8] flex items-center gap-2">
                      <span>🔍</span>
                      Search or type to add to {meal}...
                    </div>
                    {/* Quick suggestions */}
                    <div className="flex gap-2 mt-2 overflow-x-auto">
                      {MOCK_QUICK_FOODS.slice(0, 4).map((f) => (
                        <button key={f.name} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-lg border border-[#E2E8F0] text-xs whitespace-nowrap hover:border-[#FF6B6B] transition-colors">
                          <span>{f.emoji}</span>
                          <span className="text-[#0F172A]">{f.name}</span>
                          <span className="text-[#94A3B8]">+</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Empty state (collapsed) */}
              {!isExpanded && items.length === 0 && (
                <div className="px-4 pb-3">
                  <div className="text-xs text-[#94A3B8]">Nothing logged yet · <button className="text-[#FF6B6B]">Copy from yesterday</button></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating AI button */}
      <div className="sticky bottom-4 flex justify-center pb-4">
        <button className="flex items-center gap-2 px-5 py-3 bg-[#0F172A] text-white rounded-full shadow-lg hover:bg-[#1E293B] transition-colors">
          <span>✨</span>
          <span className="text-sm font-medium">Quick Add</span>
          <span className="text-white/50">|</span>
          <span className="text-sm text-white/70">&quot;2 eggs and toast&quot;</span>
        </button>
      </div>
    </div>
  );
}

// ============================================
// OPTION C: "Dashboard + Drill" — Summary cards,
// tap to expand. Progress is the hero.
// ============================================
function OptionCDashboard() {
  const [activeMeal, setActiveMeal] = useState<string | null>(null);
  const calPct = Math.round((MOCK_MACROS.calories / MOCK_TARGETS.calories) * 100);
  const remaining = MOCK_TARGETS.calories - MOCK_MACROS.calories;

  return (
    <div className="bg-[#F8FAFC] rounded-2xl overflow-hidden border border-[#E2E8F0] max-w-2xl mx-auto">
      {/* Date nav */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between">
        <button className="text-[#94A3B8]">‹</button>
        <span className="font-semibold text-[#0F172A]">Today, Feb 24</span>
        <button className="text-[#94A3B8]">›</button>
      </div>

      <div className="p-4 space-y-4">
        {/* Hero: Calorie Ring + Macros */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <div className="flex items-center gap-6">
            {/* Ring chart (simulated) */}
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#FF6B6B" strokeWidth="8"
                  strokeDasharray={`${calPct * 2.64} 264`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-[#0F172A]">{calPct}%</span>
                <span className="text-[10px] text-[#94A3B8]">{remaining} left</span>
              </div>
            </div>
            {/* Macro breakdown */}
            <div className="flex-1 space-y-3">
              <MacroBar label="Calories" current={MOCK_MACROS.calories} target={MOCK_TARGETS.calories} color="#FF6B6B" />
              <MacroBar label="Protein" current={MOCK_MACROS.protein} target={MOCK_TARGETS.protein} color="#22C55E" />
              <MacroBar label="Carbs" current={MOCK_MACROS.carbs} target={MOCK_TARGETS.carbs} color="#F59E0B" />
              <MacroBar label="Fat" current={MOCK_MACROS.fat} target={MOCK_TARGETS.fat} color="#8B5CF6" />
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] px-4 py-3 flex items-center gap-3">
          <span className="text-[#94A3B8]">🔍</span>
          <span className="text-sm text-[#94A3B8] flex-1">Search foods or type &quot;2 eggs and toast&quot;...</span>
          <button className="p-1.5 bg-[#FF6B6B] text-white rounded-lg text-xs">✨ AI</button>
        </div>

        {/* Meal summary cards - grid */}
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(MOCK_MEALS).map(([meal, items]) => {
            const mealCal = items.reduce((s, i) => s + i.calories, 0);
            const isActive = activeMeal === meal;

            return (
              <button
                key={meal}
                onClick={() => setActiveMeal(isActive ? null : meal)}
                className={`text-left rounded-xl border p-4 transition-all ${
                  isActive ? 'border-[#FF6B6B] bg-[#FFF5F5] ring-1 ring-[#FF6B6B]/20' : 'border-[#E2E8F0] bg-white hover:border-[#FF6B6B]/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <MealIcon meal={meal} />
                  <span className="font-medium text-[#0F172A] capitalize text-sm">{meal}</span>
                </div>
                {items.length > 0 ? (
                  <>
                    <div className="text-lg font-bold text-[#0F172A]">{mealCal} cal</div>
                    <div className="text-xs text-[#94A3B8]">{items.length} item{items.length > 1 ? 's' : ''} logged</div>
                  </>
                ) : (
                  <>
                    <div className="text-lg font-bold text-[#CBD5E1]">—</div>
                    <div className="text-xs text-[#FF6B6B]">+ Add food</div>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Expanded meal detail (slides in below) */}
        {activeMeal && (
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <MealIcon meal={activeMeal} />
                <span className="font-medium text-[#0F172A] capitalize">{activeMeal}</span>
              </div>
              <button onClick={() => setActiveMeal(null)} className="text-[#94A3B8] text-sm">✕</button>
            </div>
            {MOCK_MEALS[activeMeal as keyof typeof MOCK_MEALS].length > 0 ? (
              <div>
                {MOCK_MEALS[activeMeal as keyof typeof MOCK_MEALS].map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-4 py-3 border-b border-[#F1F5F9] last:border-0">
                    <span className="text-sm text-[#0F172A]">{item.name}</span>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-[#0F172A] font-medium">{item.calories} cal</span>
                      <span className="text-green-600">{item.protein}g P</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="text-[#94A3B8] text-sm mb-3">Nothing logged for {activeMeal}</div>
                <button className="px-4 py-2 bg-[#FF6B6B] text-white text-sm font-medium rounded-lg">+ Add Food</button>
              </div>
            )}
            <div className="px-4 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0]">
              <button className="w-full text-center text-sm text-[#FF6B6B] font-medium">+ Add more to {activeMeal}</button>
            </div>
          </div>
        )}

        {/* Weekly mini */}
        <div className="flex items-center gap-1 justify-center py-2">
          {MOCK_WEEK.map((d) => (
            <div key={d.date} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
              d.isToday ? 'bg-[#FF6B6B] text-white' : d.pct ? 'bg-[#F1F5F9] text-[#0F172A]' : 'bg-[#F8FAFC] text-[#CBD5E1]'
            }`}>
              {d.pct ?? '—'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// OPTION D: "Timeline" — Linear chronological flow
// No sidebar. Everything is one scrollable stream.
// ============================================
function OptionDTimeline() {
  return (
    <div className="bg-[#F8FAFC] rounded-2xl overflow-hidden border border-[#E2E8F0] max-w-xl mx-auto">
      {/* Compact top bar */}
      <div className="bg-[#0F172A] text-white px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button className="text-white/50">‹</button>
            <span className="font-semibold">Today</span>
            <button className="text-white/50">›</button>
          </div>
          <div className="text-sm">
            <span className="font-bold">{MOCK_MACROS.calories}</span>
            <span className="text-white/50"> / {MOCK_TARGETS.calories} cal</span>
          </div>
        </div>
        {/* Micro macro chips */}
        <div className="flex gap-2">
          <span className="px-2 py-0.5 bg-white/10 rounded text-xs">P: {MOCK_MACROS.protein}/{MOCK_TARGETS.protein}g</span>
          <span className="px-2 py-0.5 bg-white/10 rounded text-xs">C: {MOCK_MACROS.carbs}/{MOCK_TARGETS.carbs}g</span>
          <span className="px-2 py-0.5 bg-white/10 rounded text-xs">F: {MOCK_MACROS.fat}/{MOCK_TARGETS.fat}g</span>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-4 py-3 bg-white border-b border-[#E2E8F0]">
        <div className="bg-[#F8FAFC] rounded-xl px-4 py-3 border border-[#E2E8F0] flex items-center gap-3">
          <span className="text-[#94A3B8]">🔍</span>
          <span className="text-sm text-[#94A3B8] flex-1">Search or describe what you ate...</span>
          <span className="text-xs bg-[#FF6B6B] text-white px-2 py-1 rounded-lg">✨ AI</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-8 top-0 bottom-0 w-px bg-[#E2E8F0]" />

        {Object.entries(MOCK_MEALS).map(([meal, items]) => {
          const mealCal = items.reduce((s, i) => s + i.calories, 0);
          const timeMap: Record<string, string> = { breakfast: '8:00 AM', lunch: '12:30 PM', dinner: '6:30 PM', snacks: '3:00 PM' };

          return (
            <div key={meal} className="relative px-4 py-4">
              {/* Timeline dot */}
              <div className={`absolute left-[26px] w-5 h-5 rounded-full border-2 z-10 ${
                items.length > 0 ? 'bg-[#FF6B6B] border-[#FF6B6B]' : 'bg-white border-[#E2E8F0]'
              }`} />

              <div className="ml-12">
                {/* Meal header */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-[#0F172A] capitalize">{meal}</span>
                    <span className="text-xs text-[#94A3B8] ml-2">{timeMap[meal]}</span>
                  </div>
                  {mealCal > 0 && <span className="text-sm font-medium text-[#0F172A]">{mealCal} cal</span>}
                </div>

                {/* Items */}
                {items.length > 0 ? (
                  <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                    {items.map((item, i) => (
                      <div key={item.id} className={`flex items-center justify-between px-3 py-2.5 ${i < items.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}>
                        <span className="text-sm text-[#0F172A]">{item.name}</span>
                        <div className="text-right">
                          <span className="text-sm text-[#0F172A]">{item.calories}</span>
                          <span className="text-xs text-green-600 ml-2">{item.protein}g P</span>
                        </div>
                      </div>
                    ))}
                    <button className="w-full px-3 py-2 text-xs text-[#FF6B6B] font-medium hover:bg-[#FFF5F5] border-t border-[#F1F5F9]">
                      + Add more
                    </button>
                  </div>
                ) : (
                  <button className="w-full bg-white rounded-xl border-2 border-dashed border-[#E2E8F0] px-3 py-4 text-sm text-[#94A3B8] hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition-colors">
                    + Log {meal}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom: Quick foods as horizontal scroll */}
      <div className="px-4 py-3 bg-white border-t border-[#E2E8F0]">
        <div className="text-xs text-[#94A3B8] font-medium mb-2">QUICK ADD</div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {MOCK_QUICK_FOODS.map((f) => (
            <button key={f.name} className="flex items-center gap-1.5 px-3 py-2 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs whitespace-nowrap hover:border-[#FF6B6B] transition-colors flex-shrink-0">
              <span>{f.emoji}</span>
              <span className="text-[#0F172A] font-medium">{f.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// OPTION E: "Tabbed Zones" — Split concerns into
// tabs: Log | Progress | Pantry
// ============================================
function OptionETabbed() {
  const [tab, setTab] = useState<'log' | 'progress' | 'pantry'>('log');
  const calPct = Math.round((MOCK_MACROS.calories / MOCK_TARGETS.calories) * 100);

  return (
    <div className="bg-[#F8FAFC] rounded-2xl overflow-hidden border border-[#E2E8F0] max-w-2xl mx-auto">
      {/* Header with date + slim macros */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="text-[#94A3B8]">‹</button>
            <span className="font-semibold text-[#0F172A]">Today</span>
            <button className="text-[#94A3B8]">›</button>
          </div>
          {/* Mini ring + numbers */}
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#F1F5F9" strokeWidth="3" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#FF6B6B" strokeWidth="3"
                  strokeDasharray={`${calPct * 0.88} 88`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-[#0F172A]">{calPct}%</span>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-[#0F172A]">{MOCK_MACROS.calories} / {MOCK_TARGETS.calories} cal</div>
              <div className="text-[10px] text-[#94A3B8]">{MOCK_MACROS.protein}g P · {MOCK_MACROS.carbs}g C · {MOCK_MACROS.fat}g F</div>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex px-4 gap-1">
          {(['log', 'progress', 'pantry'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
                tab === t
                  ? 'border-[#FF6B6B] text-[#FF6B6B]'
                  : 'border-transparent text-[#94A3B8] hover:text-[#475569]'
              }`}
            >
              {t === 'log' ? '📝 Log' : t === 'progress' ? '📊 Progress' : '🗄️ Pantry'}
            </button>
          ))}
        </div>
      </div>

      {/* TAB: Log */}
      {tab === 'log' && (
        <div className="p-4 space-y-3">
          {/* Search */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] px-4 py-3 flex items-center gap-3">
            <span className="text-[#94A3B8]">🔍</span>
            <span className="text-sm text-[#94A3B8] flex-1">Search or &quot;2 eggs and toast&quot;...</span>
            <span className="text-xs bg-[#FF6B6B] text-white px-2 py-1 rounded-lg">✨</span>
          </div>

          {/* Meals */}
          {Object.entries(MOCK_MEALS).map(([meal, items]) => (
            <div key={meal} className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <MealIcon meal={meal} />
                  <span className="font-medium text-[#0F172A] capitalize text-sm">{meal}</span>
                  <MealTotal items={items} />
                </div>
                <button className="text-xs text-[#FF6B6B] font-medium">+ Add</button>
              </div>
              {items.length > 0 && (
                <div className="border-t border-[#F1F5F9]">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-4 py-2.5 border-b border-[#F8FAFC] last:border-0">
                      <span className="text-sm text-[#0F172A]">{item.name}</span>
                      <span className="text-sm text-[#475569]">{item.calories} cal · {item.protein}g P</span>
                    </div>
                  ))}
                </div>
              )}
              {items.length === 0 && (
                <div className="px-4 pb-3 text-xs text-[#94A3B8]">
                  Nothing yet · <button className="text-[#FF6B6B]">Copy yesterday</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB: Progress */}
      {tab === 'progress' && (
        <div className="p-4 space-y-4">
          {/* Full macro breakdown */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 space-y-4">
            <h3 className="font-medium text-[#0F172A]">Today&apos;s Macros</h3>
            <MacroBar label="Calories" current={MOCK_MACROS.calories} target={MOCK_TARGETS.calories} color="#FF6B6B" />
            <MacroBar label="Protein" current={MOCK_MACROS.protein} target={MOCK_TARGETS.protein} color="#22C55E" />
            <MacroBar label="Carbs" current={MOCK_MACROS.carbs} target={MOCK_TARGETS.carbs} color="#F59E0B" />
            <MacroBar label="Fat" current={MOCK_MACROS.fat} target={MOCK_TARGETS.fat} color="#8B5CF6" />
          </div>

          {/* Weekly strip */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <h3 className="font-medium text-[#0F172A] mb-3">This Week</h3>
            <div className="grid grid-cols-7 gap-2">
              {MOCK_WEEK.map((d) => (
                <div key={d.date} className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs ${
                  d.isToday ? 'bg-[#FF6B6B] text-white' : d.pct ? 'bg-[#F1F5F9]' : 'bg-[#F8FAFC]'
                }`}>
                  <span className="font-medium">{d.pct ?? '—'}</span>
                  <span className={d.isToday ? 'text-white/60' : 'text-[#94A3B8]'}>{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggestion */}
          <div className="bg-gradient-to-r from-[#FF6B6B]/10 to-[#EF5350]/5 rounded-xl border border-[#FF6B6B]/20 p-4">
            <div className="text-xs text-[#64748B] mb-1">To hit your targets</div>
            <div className="font-medium text-[#0F172A]">Add ~45g protein for dinner (chicken breast, fish, or tofu)</div>
          </div>
        </div>
      )}

      {/* TAB: Pantry */}
      {tab === 'pantry' && (
        <div className="p-4 space-y-4">
          {/* Quick add */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <h3 className="font-medium text-[#0F172A] mb-3">Recent Foods</h3>
            <div className="grid grid-cols-2 gap-2">
              {MOCK_QUICK_FOODS.map((f) => (
                <button key={f.name} className="flex items-center gap-2 p-3 bg-[#F8FAFC] rounded-xl hover:bg-[#F1F5F9] transition-colors text-left">
                  <span className="text-lg">{f.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-[#0F172A] truncate">{f.name}</div>
                    <div className="text-xs text-[#94A3B8]">{f.cal} cal</div>
                  </div>
                  <span className="text-[#94A3B8]">+</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recipes */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-[#0F172A]">My Recipes</h3>
              <button className="text-xs text-[#FF6B6B] font-medium">+ New</button>
            </div>
            {MOCK_RECIPES.map((r) => (
              <div key={r.name} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8FAFC] transition-colors">
                <span className="text-xl">{r.emoji}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#0F172A]">{r.name}</div>
                  <div className="text-xs text-[#94A3B8]">{r.cal} cal · {r.protein}g P</div>
                </div>
                <button className="px-3 py-1.5 bg-[#FF6B6B] text-white text-xs rounded-lg">Add</button>
              </div>
            ))}
          </div>

          {/* Staples */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-[#0F172A]">My Staples</h3>
              <button className="text-xs text-[#FF6B6B] font-medium">Manage</button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['Greek Yogurt', 'Blueberries', 'Whey Protein', 'Banana'].map((s) => (
                <span key={s} className="px-3 py-1.5 bg-[#FFE5E5] text-[#FF6B6B] text-sm rounded-full font-medium">
                  📌 {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// OPTION F: "Best Of" — Tabbed zones + dashboard
// header + smart empty states + mobile quick strip
// ============================================
const MOCK_STAPLES: Record<string, Array<{ name: string; cal: number; protein: number; emoji: string }>> = {
  breakfast: [
    { name: 'Greek Yogurt', cal: 130, protein: 23, emoji: '🥛' },
    { name: 'Blueberries', cal: 29, protein: 0, emoji: '🫐' },
    { name: 'Oatmeal', cal: 150, protein: 5, emoji: '🥣' },
    { name: 'Eggs (2)', cal: 140, protein: 12, emoji: '🥚' },
  ],
  lunch: [
    { name: 'Chicken Breast', cal: 165, protein: 31, emoji: '🍗' },
    { name: 'Brown Rice', cal: 215, protein: 5, emoji: '🍚' },
    { name: 'Mixed Greens', cal: 20, protein: 2, emoji: '🥗' },
  ],
  dinner: [
    { name: 'Salmon Fillet', cal: 208, protein: 20, emoji: '🐟' },
    { name: 'Sweet Potato', cal: 103, protein: 2, emoji: '🍠' },
    { name: 'Broccoli', cal: 55, protein: 4, emoji: '🥦' },
  ],
  snacks: [
    { name: 'Whey Protein', cal: 124, protein: 24, emoji: '🥤' },
    { name: 'Banana', cal: 105, protein: 1, emoji: '🍌' },
    { name: 'Almonds', cal: 164, protein: 6, emoji: '🌰' },
  ],
};

function OptionFBestOf() {
  const [tab, setTab] = useState<'log' | 'progress' | 'pantry'>('log');
  const calPct = Math.round((MOCK_MACROS.calories / MOCK_TARGETS.calories) * 100);
  const protPct = Math.round((MOCK_MACROS.protein / MOCK_TARGETS.protein) * 100);
  const remaining = MOCK_TARGETS.calories - MOCK_MACROS.calories;
  const remainingP = MOCK_TARGETS.protein - MOCK_MACROS.protein;

  return (
    <div className="bg-[#F8FAFC] rounded-2xl overflow-hidden border border-[#E2E8F0] max-w-2xl mx-auto relative">
      {/* ===== HEADER: Date + Ring + Macros ===== */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Date nav */}
            <div className="flex items-center gap-2">
              <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] text-[#94A3B8] transition-colors">‹</button>
              <span className="font-semibold text-[#0F172A]">Today</span>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] text-[#94A3B8] transition-colors">›</button>
            </div>

            {/* Ring + headline numbers */}
            <div className="flex items-center gap-3">
              {/* Mini ring */}
              <div className="relative w-10 h-10">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#F1F5F9" strokeWidth="3" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#FF6B6B" strokeWidth="3"
                    strokeDasharray={`${calPct * 0.88} 88`} strokeLinecap="round" />
                  {/* Inner protein ring */}
                  <circle cx="18" cy="18" r="10" fill="none" stroke="#F1F5F9" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="10" fill="none" stroke="#22C55E" strokeWidth="2.5"
                    strokeDasharray={`${protPct * 0.628} 62.8`} strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-[#0F172A]">{remaining} cal left</div>
                <div className="text-xs text-[#94A3B8]">{remainingP}g protein to go</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex px-2 gap-0.5">
          {([
            { key: 'log' as const, label: 'Log', icon: '📝' },
            { key: 'progress' as const, label: 'Progress', icon: '📊' },
            { key: 'pantry' as const, label: 'Pantry', icon: '🗄️' },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-[#FF6B6B] text-[#0F172A]'
                  : 'border-transparent text-[#94A3B8] hover:text-[#475569]'
              }`}
            >
              <span className="mr-1">{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== TAB: LOG ===== */}
      {tab === 'log' && (
        <div className="p-4 space-y-3 pb-20">
          {/* Unified search bar */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] px-4 py-3 flex items-center gap-3 shadow-sm">
            <span className="text-[#94A3B8]">🔍</span>
            <span className="text-sm text-[#94A3B8] flex-1">Search or type &quot;2 eggs and toast&quot;...</span>
            <button className="px-2.5 py-1 bg-[#0F172A] text-white text-xs rounded-lg font-medium flex items-center gap-1">
              ✨ AI
            </button>
          </div>

          {/* Meals */}
          {Object.entries(MOCK_MEALS).map(([meal, items]) => {
            const mealCal = items.reduce((s, i) => s + i.calories, 0);
            const mealP = items.reduce((s, i) => s + i.protein, 0);
            const mealStaples = MOCK_STAPLES[meal] || [];
            const isEmpty = items.length === 0;

            return (
              <div key={meal} className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                {/* Meal header */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[#F8FAFC] rounded-lg flex items-center justify-center">
                      <MealIcon meal={meal} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#0F172A] capitalize">{meal}</span>
                        {!isEmpty && <span className="text-xs text-[#94A3B8]">{mealCal} cal · {mealP}g P</span>}
                      </div>
                    </div>
                  </div>
                  <button className="text-xs text-[#FF6B6B] font-semibold hover:bg-[#FFE5E5] px-2.5 py-1.5 rounded-lg transition-colors">
                    + Add
                  </button>
                </div>

                {/* Logged items */}
                {!isEmpty && (
                  <div className="border-t border-[#F1F5F9]">
                    {items.map((item) => (
                      <div key={item.id} className={`flex items-center justify-between px-4 py-2.5 border-b border-[#F8FAFC] last:border-0 ${
                        item.isStaple ? 'bg-[#FFFBFB]' : ''
                      }`}>
                        <div className="flex items-center gap-2 min-w-0">
                          {item.isStaple && <span className="text-[10px] text-[#FF6B6B]">📌</span>}
                          <span className="text-sm text-[#0F172A] truncate">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          <span className="text-sm font-medium text-[#0F172A]">{item.calories}</span>
                          <span className="text-xs text-green-600 w-8 text-right">{item.protein}g P</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* EMPTY STATE: Staples carousel + Copy yesterday */}
                {isEmpty && (
                  <div className="border-t border-[#F1F5F9]">
                    {/* Staples horizontal scroll */}
                    {mealStaples.length > 0 && (
                      <div className="px-4 py-3">
                        <div className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wider mb-2">Your {meal} staples — tap to log</div>
                        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                          {mealStaples.map((s) => (
                            <button
                              key={s.name}
                              className="flex items-center gap-2 px-3 py-2 bg-[#FFF5F5] hover:bg-[#FFE5E5] border border-[#FFE5E5] hover:border-[#FF6B6B]/30 rounded-xl transition-all flex-shrink-0 group"
                            >
                              <span className="text-base">{s.emoji}</span>
                              <div className="text-left">
                                <div className="text-xs font-medium text-[#0F172A] whitespace-nowrap">{s.name}</div>
                                <div className="text-[10px] text-[#94A3B8]">{s.cal} cal · {s.protein}g P</div>
                              </div>
                              <span className="text-[#FF6B6B] opacity-0 group-hover:opacity-100 transition-opacity text-sm ml-1">+</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Copy from yesterday */}
                    <div className="px-4 pb-3">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex-1 h-px bg-[#E2E8F0]" />
                        <span className="text-[#94A3B8]">or</span>
                        <div className="flex-1 h-px bg-[#E2E8F0]" />
                      </div>
                      <button className="w-full mt-2 flex items-center justify-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A] py-2 hover:bg-[#F1F5F9] rounded-lg transition-colors">
                        <span>📋</span>
                        Copy from yesterday
                        <span className="text-[#94A3B8] text-xs">(420 cal)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ===== TAB: PROGRESS ===== */}
      {tab === 'progress' && (
        <div className="p-4 space-y-4 pb-20">
          {/* Full dashboard ring + bars */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <div className="flex items-center gap-6 mb-5">
              {/* Large ring */}
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F5F9" strokeWidth="7" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#FF6B6B" strokeWidth="7"
                    strokeDasharray={`${calPct * 2.64} 264`} strokeLinecap="round" />
                  <circle cx="50" cy="50" r="33" fill="none" stroke="#F1F5F9" strokeWidth="5" />
                  <circle cx="50" cy="50" r="33" fill="none" stroke="#22C55E" strokeWidth="5"
                    strokeDasharray={`${protPct * 2.07} 207`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-[#0F172A]">{calPct}%</span>
                  <span className="text-[9px] text-[#94A3B8]">daily goal</span>
                </div>
              </div>
              {/* Remaining */}
              <div className="flex-1">
                <div className="mb-3">
                  <div className="text-xs text-[#94A3B8] mb-0.5">Remaining today</div>
                  <div className="text-2xl font-bold text-[#0F172A]">{remaining} <span className="text-base font-normal text-[#94A3B8]">cal</span></div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center px-2 py-1.5 bg-[#F0FDF4] rounded-lg">
                    <div className="text-xs font-bold text-green-700">{remainingP}g</div>
                    <div className="text-[10px] text-green-600">Protein</div>
                  </div>
                  <div className="text-center px-2 py-1.5 bg-[#FFFBEB] rounded-lg">
                    <div className="text-xs font-bold text-amber-700">{MOCK_TARGETS.carbs - MOCK_MACROS.carbs}g</div>
                    <div className="text-[10px] text-amber-600">Carbs</div>
                  </div>
                  <div className="text-center px-2 py-1.5 bg-[#FDF4FF] rounded-lg">
                    <div className="text-xs font-bold text-purple-700">{MOCK_TARGETS.fat - MOCK_MACROS.fat}g</div>
                    <div className="text-[10px] text-purple-600">Fat</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Full bars */}
            <div className="space-y-3">
              <MacroBar label="Calories" current={MOCK_MACROS.calories} target={MOCK_TARGETS.calories} color="#FF6B6B" />
              <MacroBar label="Protein" current={MOCK_MACROS.protein} target={MOCK_TARGETS.protein} color="#22C55E" />
              <MacroBar label="Carbs" current={MOCK_MACROS.carbs} target={MOCK_TARGETS.carbs} color="#F59E0B" />
              <MacroBar label="Fat" current={MOCK_MACROS.fat} target={MOCK_TARGETS.fat} color="#8B5CF6" />
            </div>
          </div>

          {/* Weekly strip */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <h3 className="font-medium text-[#0F172A] mb-3">This Week</h3>
            <div className="grid grid-cols-7 gap-2">
              {MOCK_WEEK.map((d) => (
                <div key={d.date} className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs transition-colors ${
                  d.isToday ? 'bg-[#FF6B6B] text-white' : d.pct ? 'bg-[#F0FDF4] text-green-700' : 'bg-[#F8FAFC] text-[#CBD5E1]'
                }`}>
                  <span className="font-bold">{d.pct !== null ? `${d.pct}%` : '—'}</span>
                  <span className={`text-[10px] ${d.isToday ? 'text-white/60' : ''}`}>{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Meal breakdown mini */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <h3 className="font-medium text-[#0F172A] mb-3">By Meal</h3>
            <div className="space-y-2">
              {Object.entries(MOCK_MEALS).map(([meal, items]) => {
                const mealCal = items.reduce((s, i) => s + i.calories, 0);
                const mealPct = MOCK_TARGETS.calories > 0 ? Math.round((mealCal / MOCK_TARGETS.calories) * 100) : 0;
                return (
                  <div key={meal} className="flex items-center gap-3">
                    <div className="w-8 text-center"><MealIcon meal={meal} /></div>
                    <div className="flex-1">
                      <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF6B6B] rounded-full" style={{ width: `${mealPct}%` }} />
                      </div>
                    </div>
                    <span className="text-xs text-[#475569] font-medium w-16 text-right">{mealCal} cal</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Smart suggestion */}
          <div className="bg-gradient-to-r from-[#FF6B6B]/10 to-[#EF5350]/5 rounded-xl border border-[#FF6B6B]/20 p-4">
            <div className="text-[10px] text-[#FF6B6B] font-semibold uppercase tracking-wider mb-1">To hit your targets</div>
            <div className="text-sm font-medium text-[#0F172A]">You need ~82g protein for dinner. Try salmon (40g) + chicken (31g) or a protein shake.</div>
          </div>
        </div>
      )}

      {/* ===== TAB: PANTRY ===== */}
      {tab === 'pantry' && (
        <div className="p-4 space-y-4 pb-20">
          {/* Recent foods */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <h3 className="font-medium text-[#0F172A] mb-3">Recent Foods</h3>
            <div className="grid grid-cols-2 gap-2">
              {MOCK_QUICK_FOODS.map((f) => (
                <button key={f.name} className="flex items-center gap-2.5 p-3 bg-[#F8FAFC] rounded-xl hover:bg-[#F1F5F9] transition-colors text-left group">
                  <span className="text-lg">{f.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-[#0F172A] truncate">{f.name}</div>
                    <div className="text-xs text-[#94A3B8]">{f.cal} cal</div>
                  </div>
                  <span className="text-[#FF6B6B] opacity-0 group-hover:opacity-100 transition-opacity">+</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recipes */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-[#0F172A]">My Recipes</h3>
              <button className="text-xs text-[#FF6B6B] font-semibold hover:bg-[#FFE5E5] px-2 py-1 rounded-lg transition-colors">+ New</button>
            </div>
            <div className="space-y-1">
              {MOCK_RECIPES.map((r) => (
                <div key={r.name} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8FAFC] transition-colors group">
                  <span className="text-xl">{r.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#0F172A]">{r.name}</div>
                    <div className="text-xs text-[#94A3B8]">{r.cal} cal · {r.protein}g P</div>
                  </div>
                  <button className="px-3 py-1.5 bg-[#FF6B6B] text-white text-xs rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-opacity">Add</button>
                </div>
              ))}
            </div>
          </div>

          {/* Staples management */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-[#0F172A]">My Staples</h3>
              <button className="text-xs text-[#FF6B6B] font-semibold hover:bg-[#FFE5E5] px-2 py-1 rounded-lg transition-colors">Manage</button>
            </div>
            {Object.entries(MOCK_STAPLES).map(([meal, staples]) => (
              <div key={meal} className="mb-3 last:mb-0">
                <div className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wider mb-1.5 capitalize">{meal}</div>
                <div className="flex gap-1.5 flex-wrap">
                  {staples.map((s) => (
                    <span key={s.name} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FFF5F5] text-[#FF6B6B] text-xs rounded-full font-medium border border-[#FFE5E5]">
                      {s.emoji} {s.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== MOBILE BOTTOM BAR: Quick add strip ===== */}
      <div className="sticky bottom-0 bg-white border-t border-[#E2E8F0] px-3 py-2 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2">
          {/* Quick foods scroll */}
          <div className="flex-1 flex gap-1.5 overflow-x-auto pb-0.5">
            {MOCK_QUICK_FOODS.slice(0, 5).map((f) => (
              <button key={f.name} className="flex items-center gap-1 px-2.5 py-1.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs whitespace-nowrap hover:border-[#FF6B6B] transition-colors flex-shrink-0">
                <span>{f.emoji}</span>
                <span className="text-[#0F172A] font-medium">{f.name.length > 10 ? f.name.slice(0, 10) + '...' : f.name}</span>
              </button>
            ))}
          </div>
          {/* FAB-style AI button */}
          <button className="flex-shrink-0 w-10 h-10 bg-[#FF6B6B] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#EF5350] transition-colors">
            <span className="text-sm">✨</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// OPTION G: F's Desktop Variant
// On desktop, the sidebar REPLACES the need for
// tab-switching. Log tab gets a sticky right rail
// with ring + macros + quick add + recipes.
// Tabs still exist for deep-dive views.
// ============================================
function OptionGDesktop() {
  const [tab, setTab] = useState<'log' | 'progress' | 'pantry'>('log');
  const calPct = Math.round((MOCK_MACROS.calories / MOCK_TARGETS.calories) * 100);
  const protPct = Math.round((MOCK_MACROS.protein / MOCK_TARGETS.protein) * 100);
  const remaining = MOCK_TARGETS.calories - MOCK_MACROS.calories;
  const remainingP = MOCK_TARGETS.protein - MOCK_MACROS.protein;

  return (
    <div className="bg-[#F8FAFC] rounded-2xl overflow-hidden border border-[#E2E8F0]">
      {/* ===== HEADER ===== */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-6">
          {/* Top row: date + search */}
          <div className="flex items-center gap-6 py-3">
            {/* Date nav */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] text-[#94A3B8] transition-colors text-lg">‹</button>
              <span className="font-semibold text-[#0F172A] text-lg">Today</span>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] text-[#94A3B8] transition-colors text-lg">›</button>
              <span className="text-sm text-[#94A3B8] ml-1">Feb 24</span>
            </div>

            {/* Search bar — takes remaining width */}
            <div className="flex-1 max-w-xl">
              <div className="bg-[#F8FAFC] rounded-xl px-4 py-2.5 border border-[#E2E8F0] flex items-center gap-3 hover:border-[#CBD5E1] transition-colors">
                <span className="text-[#94A3B8]">🔍</span>
                <span className="text-sm text-[#94A3B8] flex-1">Search foods or type &quot;2 eggs and toast&quot;...</span>
                <div className="flex items-center gap-1.5">
                  <button className="p-1.5 text-[#94A3B8] hover:text-[#64748B] rounded-lg hover:bg-[#E2E8F0] transition-colors" title="Voice">🎤</button>
                  <button className="p-1.5 text-[#94A3B8] hover:text-[#64748B] rounded-lg hover:bg-[#E2E8F0] transition-colors" title="Photo">📷</button>
                  <button className="px-3 py-1 bg-[#0F172A] text-white text-xs rounded-lg font-medium">✨ AI</button>
                </div>
              </div>
            </div>

            {/* Date menu */}
            <button className="text-[#94A3B8] hover:text-[#64748B] text-lg">⋯</button>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1">
            {([
              { key: 'log' as const, label: 'Log', icon: '📝' },
              { key: 'progress' as const, label: 'Progress', icon: '📊' },
              { key: 'pantry' as const, label: 'Pantry', icon: '🗄️' },
            ]).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.key
                    ? 'border-[#FF6B6B] text-[#0F172A]'
                    : 'border-transparent text-[#94A3B8] hover:text-[#475569]'
                }`}
              >
                <span className="mr-1.5">{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="max-w-6xl mx-auto px-6 py-6">

        {/* === LOG TAB: 2-column with sticky sidebar === */}
        {tab === 'log' && (
          <div className="grid grid-cols-3 gap-6">
            {/* LEFT: Meal log (2/3 width) */}
            <div className="col-span-2 space-y-3">
              {Object.entries(MOCK_MEALS).map(([meal, items]) => {
                const mealCal = items.reduce((s, i) => s + i.calories, 0);
                const mealP = items.reduce((s, i) => s + i.protein, 0);
                const mealStaples = MOCK_STAPLES[meal] || [];
                const isEmpty = items.length === 0;

                return (
                  <div key={meal} className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                    {/* Meal header */}
                    <div className="flex items-center justify-between px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#F8FAFC] rounded-lg flex items-center justify-center">
                          <MealIcon meal={meal} />
                        </div>
                        <div>
                          <span className="font-semibold text-[#0F172A] capitalize">{meal}</span>
                          {!isEmpty && <span className="text-xs text-[#94A3B8] ml-2">{mealCal} cal · {mealP}g P</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-xs text-[#94A3B8] hover:text-[#64748B] px-2 py-1 rounded-lg hover:bg-[#F1F5F9] transition-colors">📋 Copy</button>
                        {items.length >= 2 && (
                          <button className="text-xs text-[#94A3B8] hover:text-[#64748B] px-2 py-1 rounded-lg hover:bg-[#F1F5F9] transition-colors">Save as Recipe</button>
                        )}
                        <button className="text-xs text-[#FF6B6B] font-semibold hover:bg-[#FFE5E5] px-3 py-1.5 rounded-lg transition-colors">
                          + Add
                        </button>
                      </div>
                    </div>

                    {/* Logged items */}
                    {!isEmpty && (
                      <div className="border-t border-[#F1F5F9]">
                        {items.map((item) => (
                          <div key={item.id} className={`group flex items-center justify-between px-5 py-3 border-b border-[#F8FAFC] last:border-0 hover:bg-[#F8FAFC] transition-colors ${
                            item.isStaple ? 'bg-[#FFFBFB]' : ''
                          }`}>
                            <div className="flex items-center gap-2.5 min-w-0">
                              {item.isStaple && <span className="text-[10px] text-[#FF6B6B] font-bold">📌</span>}
                              <span className="text-sm text-[#0F172A]">{item.name}</span>
                              {item.isApproximate && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">~ est</span>}
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-[#0F172A]">{item.calories} cal</span>
                                <span className="text-xs text-green-600 font-medium">{item.protein}g P</span>
                                {item.carbs !== undefined && <span className="text-xs text-[#94A3B8]">{item.carbs}g C</span>}
                                {item.fat !== undefined && <span className="text-xs text-[#94A3B8]">{item.fat}g F</span>}
                              </div>
                              {/* Hover actions */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1 text-[#94A3B8] hover:text-[#FF6B6B] rounded" title="Pin as staple">📌</button>
                                <button className="p-1 text-[#94A3B8] hover:text-[#64748B] rounded" title="Edit">✏️</button>
                                <button className="p-1 text-[#94A3B8] hover:text-red-500 rounded" title="Delete">🗑️</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Empty state: staples + copy */}
                    {isEmpty && (
                      <div className="border-t border-[#F1F5F9]">
                        {mealStaples.length > 0 && (
                          <div className="px-5 py-3">
                            <div className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wider mb-2">
                              Your {meal} staples — click to log
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {mealStaples.map((s) => (
                                <button
                                  key={s.name}
                                  className="flex items-center gap-2 px-3 py-2 bg-[#FFF5F5] hover:bg-[#FFE5E5] border border-[#FFE5E5] hover:border-[#FF6B6B]/40 rounded-xl transition-all group"
                                >
                                  <span className="text-base">{s.emoji}</span>
                                  <div className="text-left">
                                    <div className="text-xs font-medium text-[#0F172A]">{s.name}</div>
                                    <div className="text-[10px] text-[#94A3B8]">{s.cal} cal · {s.protein}g P</div>
                                  </div>
                                  <span className="text-[#FF6B6B] opacity-0 group-hover:opacity-100 transition-opacity text-sm ml-1">+</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="px-5 pb-3">
                          <div className="flex items-center gap-2 text-xs">
                            <div className="flex-1 h-px bg-[#E2E8F0]" />
                            <span className="text-[#94A3B8]">or</span>
                            <div className="flex-1 h-px bg-[#E2E8F0]" />
                          </div>
                          <button className="w-full mt-2 flex items-center justify-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A] py-2 hover:bg-[#F1F5F9] rounded-lg transition-colors">
                            <span>📋</span> Copy from yesterday <span className="text-[#94A3B8] text-xs">(420 cal)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* RIGHT: Sticky sidebar (1/3 width) */}
            <div className="col-span-1">
              <div className="sticky top-6 space-y-4">
                {/* Progress ring + macros */}
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
                  <div className="flex items-center gap-4 mb-4">
                    {/* Ring */}
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F5F9" strokeWidth="7" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#FF6B6B" strokeWidth="7"
                          strokeDasharray={`${calPct * 2.64} 264`} strokeLinecap="round" />
                        <circle cx="50" cy="50" r="33" fill="none" stroke="#F1F5F9" strokeWidth="5" />
                        <circle cx="50" cy="50" r="33" fill="none" stroke="#22C55E" strokeWidth="5"
                          strokeDasharray={`${protPct * 2.07} 207`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-[#0F172A]">{calPct}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[#0F172A]">{remaining}</div>
                      <div className="text-xs text-[#94A3B8]">cal remaining</div>
                      <div className="text-sm font-medium text-green-600 mt-0.5">{remainingP}g P to go</div>
                    </div>
                  </div>

                  {/* Compact macro bars */}
                  <div className="space-y-2.5">
                    <MacroBar label="Calories" current={MOCK_MACROS.calories} target={MOCK_TARGETS.calories} color="#FF6B6B" />
                    <MacroBar label="Protein" current={MOCK_MACROS.protein} target={MOCK_TARGETS.protein} color="#22C55E" />
                    <MacroBar label="Carbs" current={MOCK_MACROS.carbs} target={MOCK_TARGETS.carbs} color="#F59E0B" />
                    <MacroBar label="Fat" current={MOCK_MACROS.fat} target={MOCK_TARGETS.fat} color="#8B5CF6" />
                  </div>
                </div>

                {/* Quick Add */}
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
                  <h3 className="font-medium text-[#0F172A] mb-3 text-sm">Quick Add</h3>
                  <div className="space-y-1">
                    {MOCK_QUICK_FOODS.slice(0, 5).map((f) => (
                      <button key={f.name} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#F8FAFC] transition-colors group text-left">
                        <span>{f.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-[#0F172A]">{f.name}</span>
                        </div>
                        <span className="text-xs text-[#94A3B8]">{f.cal} cal</span>
                        <span className="text-[#FF6B6B] opacity-0 group-hover:opacity-100 transition-opacity">+</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recipes */}
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-[#0F172A] text-sm">My Recipes</h3>
                    <button className="text-xs text-[#FF6B6B] font-medium">+ New</button>
                  </div>
                  <div className="space-y-1">
                    {MOCK_RECIPES.map((r) => (
                      <button key={r.name} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#F8FAFC] transition-colors text-left group">
                        <span>{r.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-[#0F172A]">{r.name}</div>
                          <div className="text-xs text-[#94A3B8]">{r.cal} cal · {r.protein}g P</div>
                        </div>
                        <span className="text-[#FF6B6B] opacity-0 group-hover:opacity-100 transition-opacity">+</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weekly mini strip */}
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-[#0F172A] text-sm">This Week</h3>
                    <button onClick={() => setTab('progress')} className="text-xs text-[#FF6B6B] font-medium">Details →</button>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {MOCK_WEEK.map((d) => (
                      <div key={d.date} className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] ${
                        d.isToday ? 'bg-[#FF6B6B] text-white' : d.pct ? 'bg-[#F0FDF4] text-green-700' : 'bg-[#F8FAFC] text-[#CBD5E1]'
                      }`}>
                        <span className="font-bold">{d.pct !== null ? d.pct : '—'}</span>
                        <span className={d.isToday ? 'text-white/60' : ''}>{d.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === PROGRESS TAB: Full-width deep dive === */}
        {tab === 'progress' && (
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Large dashboard */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <div className="flex items-start gap-8">
                {/* Large ring */}
                <div className="relative w-32 h-32 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F5F9" strokeWidth="7" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#FF6B6B" strokeWidth="7"
                      strokeDasharray={`${calPct * 2.64} 264`} strokeLinecap="round" />
                    <circle cx="50" cy="50" r="33" fill="none" stroke="#F1F5F9" strokeWidth="5" />
                    <circle cx="50" cy="50" r="33" fill="none" stroke="#22C55E" strokeWidth="5"
                      strokeDasharray={`${protPct * 2.07} 207`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-[#0F172A]">{calPct}%</span>
                    <span className="text-[10px] text-[#94A3B8]">daily goal</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="mb-4">
                    <div className="text-sm text-[#94A3B8]">Remaining today</div>
                    <div className="text-3xl font-bold text-[#0F172A]">{remaining} <span className="text-lg font-normal text-[#94A3B8]">cal</span></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center px-3 py-2 bg-[#F0FDF4] rounded-xl">
                      <div className="text-sm font-bold text-green-700">{remainingP}g</div>
                      <div className="text-xs text-green-600">Protein</div>
                    </div>
                    <div className="text-center px-3 py-2 bg-[#FFFBEB] rounded-xl">
                      <div className="text-sm font-bold text-amber-700">{MOCK_TARGETS.carbs - MOCK_MACROS.carbs}g</div>
                      <div className="text-xs text-amber-600">Carbs</div>
                    </div>
                    <div className="text-center px-3 py-2 bg-[#FDF4FF] rounded-xl">
                      <div className="text-sm font-bold text-purple-700">{MOCK_TARGETS.fat - MOCK_MACROS.fat}g</div>
                      <div className="text-xs text-purple-600">Fat</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <MacroBar label="Calories" current={MOCK_MACROS.calories} target={MOCK_TARGETS.calories} color="#FF6B6B" />
                <MacroBar label="Protein" current={MOCK_MACROS.protein} target={MOCK_TARGETS.protein} color="#22C55E" />
                <MacroBar label="Carbs" current={MOCK_MACROS.carbs} target={MOCK_TARGETS.carbs} color="#F59E0B" />
                <MacroBar label="Fat" current={MOCK_MACROS.fat} target={MOCK_TARGETS.fat} color="#8B5CF6" />
              </div>
            </div>

            {/* Weekly + By Meal side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
                <h3 className="font-medium text-[#0F172A] mb-3">This Week</h3>
                <div className="grid grid-cols-7 gap-2">
                  {MOCK_WEEK.map((d) => (
                    <div key={d.date} className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs ${
                      d.isToday ? 'bg-[#FF6B6B] text-white' : d.pct ? 'bg-[#F0FDF4] text-green-700' : 'bg-[#F8FAFC] text-[#CBD5E1]'
                    }`}>
                      <span className="font-bold">{d.pct !== null ? `${d.pct}%` : '—'}</span>
                      <span className={`text-[10px] ${d.isToday ? 'text-white/60' : ''}`}>{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
                <h3 className="font-medium text-[#0F172A] mb-3">By Meal</h3>
                <div className="space-y-2.5">
                  {Object.entries(MOCK_MEALS).map(([meal, items]) => {
                    const mealCal = items.reduce((s, i) => s + i.calories, 0);
                    const mealPct = MOCK_TARGETS.calories > 0 ? Math.round((mealCal / MOCK_TARGETS.calories) * 100) : 0;
                    return (
                      <div key={meal} className="flex items-center gap-3">
                        <div className="w-8 text-center"><MealIcon meal={meal} /></div>
                        <span className="text-sm text-[#0F172A] capitalize w-16">{meal}</span>
                        <div className="flex-1">
                          <div className="h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                            <div className="h-full bg-[#FF6B6B] rounded-full" style={{ width: `${mealPct}%` }} />
                          </div>
                        </div>
                        <span className="text-sm text-[#475569] font-medium w-16 text-right">{mealCal} cal</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Suggestion */}
            <div className="bg-gradient-to-r from-[#FF6B6B]/10 to-[#EF5350]/5 rounded-xl border border-[#FF6B6B]/20 p-5">
              <div className="text-[10px] text-[#FF6B6B] font-semibold uppercase tracking-wider mb-1">To hit your targets</div>
              <div className="text-sm font-medium text-[#0F172A]">You need ~82g protein for dinner. Try salmon (40g) + chicken (31g) or a protein shake.</div>
            </div>
          </div>
        )}

        {/* === PANTRY TAB: 3-column grid === */}
        {tab === 'pantry' && (
          <div className="grid grid-cols-3 gap-4">
            {/* Recent foods */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <h3 className="font-medium text-[#0F172A] mb-3">Recent Foods</h3>
              <div className="space-y-1">
                {MOCK_QUICK_FOODS.map((f) => (
                  <button key={f.name} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-[#F8FAFC] transition-colors text-left group">
                    <span className="text-lg">{f.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#0F172A] truncate">{f.name}</div>
                      <div className="text-xs text-[#94A3B8]">{f.cal} cal</div>
                    </div>
                    <span className="text-[#FF6B6B] opacity-0 group-hover:opacity-100 transition-opacity">+</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipes */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-[#0F172A]">My Recipes</h3>
                <button className="text-xs text-[#FF6B6B] font-semibold">+ New</button>
              </div>
              <div className="space-y-1">
                {MOCK_RECIPES.map((r) => (
                  <div key={r.name} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#F8FAFC] transition-colors group">
                    <span className="text-xl">{r.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#0F172A]">{r.name}</div>
                      <div className="text-xs text-[#94A3B8]">{r.cal} cal · {r.protein}g P</div>
                    </div>
                    <button className="px-3 py-1.5 bg-[#FF6B6B] text-white text-xs rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-opacity">Add</button>
                  </div>
                ))}
              </div>
              <button className="w-full mt-3 py-2.5 border-2 border-dashed border-[#E2E8F0] hover:border-[#FF6B6B] rounded-xl text-sm text-[#94A3B8] hover:text-[#FF6B6B] transition-colors">
                + Create Recipe
              </button>
            </div>

            {/* Staples */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-[#0F172A]">My Staples</h3>
                <button className="text-xs text-[#FF6B6B] font-semibold">Manage</button>
              </div>
              {Object.entries(MOCK_STAPLES).map(([meal, staples]) => (
                <div key={meal} className="mb-3 last:mb-0">
                  <div className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wider mb-1.5 capitalize">{meal}</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {staples.map((s) => (
                      <span key={s.name} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FFF5F5] text-[#FF6B6B] text-xs rounded-full font-medium border border-[#FFE5E5]">
                        {s.emoji} {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// OPTION H: Refined Desktop — Weekly promoted,
// Quick Add merges recipes, suggestion visible,
// sidebar leaner
// ============================================
function OptionHRefined() {
  const [tab, setTab] = useState<'log' | 'progress' | 'pantry'>('log');
  const calPct = Math.round((MOCK_MACROS.calories / MOCK_TARGETS.calories) * 100);
  const protPct = Math.round((MOCK_MACROS.protein / MOCK_TARGETS.protein) * 100);
  const remaining = MOCK_TARGETS.calories - MOCK_MACROS.calories;
  const remainingP = MOCK_TARGETS.protein - MOCK_MACROS.protein;

  // Merged quick add: staples, recipes, and recent foods in one list
  const MERGED_QUICK = [
    { name: 'Greek Yogurt', cal: 130, protein: 23, emoji: '🥛', tag: 'staple' },
    { name: 'Morning Protein Yogurt', cal: 283, protein: 48, emoji: '🍳', tag: 'recipe' },
    { name: 'Chicken Rice Bowl', cal: 420, protein: 38, emoji: '🍚', tag: 'recipe' },
    { name: 'Whey Protein', cal: 124, protein: 24, emoji: '🥤', tag: 'staple' },
    { name: 'Bone-In Pork S...', cal: 282, protein: 27, emoji: '🥩', tag: 'recent' },
    { name: 'Banana', cal: 105, protein: 1, emoji: '🍌', tag: 'recent' },
    { name: 'Blueberries', cal: 29, protein: 0, emoji: '🫐', tag: 'staple' },
    { name: 'Avocado', cal: 160, protein: 15, emoji: '🥑', tag: 'recent' },
  ];

  const tagColors: Record<string, { bg: string; text: string }> = {
    staple: { bg: 'bg-[#FFE5E5]', text: 'text-[#FF6B6B]' },
    recipe: { bg: 'bg-[#EDE9FE]', text: 'text-[#7C3AED]' },
    recent: { bg: 'bg-[#F1F5F9]', text: 'text-[#64748B]' },
  };

  return (
    <div className="bg-[#F8FAFC] rounded-2xl overflow-hidden border border-[#E2E8F0]">
      {/* ===== HEADER ===== */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-6 py-3">
            {/* Date */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] text-[#94A3B8] transition-colors text-lg">‹</button>
              <span className="font-semibold text-[#0F172A] text-lg">Today</span>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] text-[#94A3B8] transition-colors text-lg">›</button>
              <span className="text-sm text-[#94A3B8] ml-1">Feb 24</span>
            </div>
            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="bg-[#F8FAFC] rounded-xl px-4 py-2.5 border border-[#E2E8F0] flex items-center gap-3 hover:border-[#CBD5E1] transition-colors">
                <span className="text-[#94A3B8]">🔍</span>
                <span className="text-sm text-[#94A3B8] flex-1">Search foods or type &quot;2 eggs and toast&quot;...</span>
                <button className="p-1.5 text-[#94A3B8] hover:text-[#64748B] rounded-lg hover:bg-[#E2E8F0] transition-colors" title="Voice">🎤</button>
                <button className="p-1.5 text-[#94A3B8] hover:text-[#64748B] rounded-lg hover:bg-[#E2E8F0] transition-colors" title="Photo">📷</button>
                <button className="px-3 py-1 bg-[#0F172A] text-white text-xs rounded-lg font-medium">✨ AI</button>
              </div>
            </div>
            <button className="text-[#94A3B8] hover:text-[#64748B] text-lg">⋯</button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {([
              { key: 'log' as const, label: 'Log', icon: '📝' },
              { key: 'progress' as const, label: 'Progress', icon: '📊' },
              { key: 'pantry' as const, label: 'Pantry', icon: '🗄️' },
            ]).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.key ? 'border-[#FF6B6B] text-[#0F172A]' : 'border-transparent text-[#94A3B8] hover:text-[#475569]'
                }`}
              >
                <span className="mr-1.5">{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* === LOG TAB === */}
        {tab === 'log' && (
          <div className="grid grid-cols-3 gap-6">
            {/* LEFT: Weekly + Meals (2/3) */}
            <div className="col-span-2 space-y-4">

              {/* ★ WEEKLY STRIP — promoted to top of Log */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-[#0F172A] text-sm">This Week</h3>
                    <p className="text-xs text-[#94A3B8]">Consistency beats perfection — aim for 5/7 days on target</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-[#0F172A]">1<span className="text-[#94A3B8] font-normal">/7</span></span>
                    <div className="text-[10px] text-[#94A3B8]">days on track</div>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {MOCK_WEEK.map((d) => (
                    <div key={d.date} className={`rounded-xl py-2.5 flex flex-col items-center justify-center text-xs transition-colors ${
                      d.isToday ? 'bg-[#FF6B6B] text-white ring-2 ring-[#FF6B6B]/30 ring-offset-1'
                        : d.pct && d.pct >= 80 ? 'bg-[#F0FDF4] text-green-700 border border-green-200'
                        : d.pct ? 'bg-[#FFFBEB] text-amber-700 border border-amber-200'
                        : 'bg-[#F8FAFC] text-[#CBD5E1] border border-[#E2E8F0]'
                    }`}>
                      <span className="font-bold text-sm">{d.pct !== null ? `${d.pct}%` : '—'}</span>
                      <span className={`text-[10px] mt-0.5 ${d.isToday ? 'text-white/70' : ''}`}>{d.day} {d.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ★ SUGGESTION — right below weekly for context */}
              <div className="bg-gradient-to-r from-[#FF6B6B]/8 via-[#FF6B6B]/5 to-transparent rounded-xl border border-[#FF6B6B]/15 px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#FF6B6B] font-semibold uppercase tracking-wider mb-0.5">To hit today&apos;s targets</div>
                  <div className="text-sm text-[#0F172A]">~82g protein left — try salmon + chicken or a shake for dinner</div>
                </div>
                <button className="flex-shrink-0 ml-4 px-3 py-1.5 bg-[#FF6B6B] text-white text-xs font-medium rounded-lg hover:bg-[#EF5350] transition-colors">
                  Suggest meal →
                </button>
              </div>

              {/* MEALS */}
              {Object.entries(MOCK_MEALS).map(([meal, items]) => {
                const mealCal = items.reduce((s, i) => s + i.calories, 0);
                const mealP = items.reduce((s, i) => s + i.protein, 0);
                const mealStaples = MOCK_STAPLES[meal] || [];
                const isEmpty = items.length === 0;

                return (
                  <div key={meal} className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#F8FAFC] rounded-lg flex items-center justify-center">
                          <MealIcon meal={meal} />
                        </div>
                        <div>
                          <span className="font-semibold text-[#0F172A] capitalize">{meal}</span>
                          {!isEmpty && <span className="text-xs text-[#94A3B8] ml-2">{mealCal} cal · {mealP}g P</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isEmpty && <button className="text-xs text-[#94A3B8] hover:text-[#64748B] px-2 py-1 rounded-lg hover:bg-[#F1F5F9] transition-colors">📋</button>}
                        <button className="text-xs text-[#FF6B6B] font-semibold hover:bg-[#FFE5E5] px-3 py-1.5 rounded-lg transition-colors">+ Add</button>
                      </div>
                    </div>

                    {!isEmpty && (
                      <div className="border-t border-[#F1F5F9]">
                        {items.map((item) => (
                          <div key={item.id} className={`group flex items-center justify-between px-5 py-3 border-b border-[#F8FAFC] last:border-0 hover:bg-[#F8FAFC] transition-colors ${
                            item.isStaple ? 'bg-[#FFFBFB]' : ''
                          }`}>
                            <div className="flex items-center gap-2.5 min-w-0">
                              {item.isStaple && <span className="text-[10px] text-[#FF6B6B]">📌</span>}
                              <span className="text-sm text-[#0F172A]">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-3 text-sm">
                                <span className="font-medium text-[#0F172A]">{item.calories} cal</span>
                                <span className="text-xs text-green-600 font-medium">{item.protein}g P</span>
                                {item.carbs !== undefined && <span className="text-xs text-[#94A3B8]">{item.carbs}g C</span>}
                                {item.fat !== undefined && <span className="text-xs text-[#94A3B8]">{item.fat}g F</span>}
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1 text-[#94A3B8] hover:text-[#FF6B6B] rounded">📌</button>
                                <button className="p-1 text-[#94A3B8] hover:text-[#64748B] rounded">✏️</button>
                                <button className="p-1 text-[#94A3B8] hover:text-red-500 rounded">🗑️</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {isEmpty && (
                      <div className="border-t border-[#F1F5F9]">
                        {mealStaples.length > 0 && (
                          <div className="px-5 py-3">
                            <div className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wider mb-2">Your {meal} staples — click to log</div>
                            <div className="flex gap-2 flex-wrap">
                              {mealStaples.map((s) => (
                                <button key={s.name} className="flex items-center gap-2 px-3 py-2 bg-[#FFF5F5] hover:bg-[#FFE5E5] border border-[#FFE5E5] hover:border-[#FF6B6B]/40 rounded-xl transition-all group">
                                  <span className="text-base">{s.emoji}</span>
                                  <div className="text-left">
                                    <div className="text-xs font-medium text-[#0F172A]">{s.name}</div>
                                    <div className="text-[10px] text-[#94A3B8]">{s.cal} cal · {s.protein}g P</div>
                                  </div>
                                  <span className="text-[#FF6B6B] opacity-0 group-hover:opacity-100 transition-opacity text-sm ml-1">+</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="px-5 pb-3">
                          <div className="flex items-center gap-2 text-xs">
                            <div className="flex-1 h-px bg-[#E2E8F0]" />
                            <span className="text-[#94A3B8]">or</span>
                            <div className="flex-1 h-px bg-[#E2E8F0]" />
                          </div>
                          <button className="w-full mt-2 flex items-center justify-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A] py-2 hover:bg-[#F1F5F9] rounded-lg transition-colors">
                            <span>📋</span> Copy from yesterday <span className="text-[#94A3B8] text-xs">(420 cal)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* RIGHT SIDEBAR (1/3, sticky) */}
            <div className="col-span-1">
              <div className="sticky top-6 space-y-4">
                {/* Ring + macros */}
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F5F9" strokeWidth="7" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#FF6B6B" strokeWidth="7"
                          strokeDasharray={`${calPct * 2.64} 264`} strokeLinecap="round" />
                        <circle cx="50" cy="50" r="33" fill="none" stroke="#F1F5F9" strokeWidth="5" />
                        <circle cx="50" cy="50" r="33" fill="none" stroke="#22C55E" strokeWidth="5"
                          strokeDasharray={`${protPct * 2.07} 207`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-[#0F172A]">{calPct}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[#0F172A]">{remaining}</div>
                      <div className="text-xs text-[#94A3B8]">cal remaining</div>
                      <div className="text-sm font-medium text-green-600 mt-0.5">{remainingP}g P to go</div>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <MacroBar label="Calories" current={MOCK_MACROS.calories} target={MOCK_TARGETS.calories} color="#FF6B6B" />
                    <MacroBar label="Protein" current={MOCK_MACROS.protein} target={MOCK_TARGETS.protein} color="#22C55E" />
                    <MacroBar label="Carbs" current={MOCK_MACROS.carbs} target={MOCK_TARGETS.carbs} color="#F59E0B" />
                    <MacroBar label="Fat" current={MOCK_MACROS.fat} target={MOCK_TARGETS.fat} color="#8B5CF6" />
                  </div>
                </div>

                {/* ★ MERGED QUICK ADD — staples + recipes + recents in one list */}
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-[#0F172A] text-sm">Quick Add</h3>
                    <div className="flex gap-1">
                      {(['all', 'staple', 'recipe', 'recent'] as const).map((filter) => (
                        <span key={filter} className={`text-[10px] px-2 py-0.5 rounded-full cursor-pointer transition-colors capitalize ${
                          filter === 'all' ? 'bg-[#0F172A] text-white' : 'bg-[#F1F5F9] text-[#94A3B8] hover:bg-[#E2E8F0]'
                        }`}>
                          {filter === 'all' ? 'All' : filter + 's'}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    {MERGED_QUICK.slice(0, 6).map((f) => (
                      <button key={f.name} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#F8FAFC] transition-colors group text-left">
                        <span>{f.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm text-[#0F172A] truncate">{f.name}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${tagColors[f.tag].bg} ${tagColors[f.tag].text}`}>
                              {f.tag}
                            </span>
                          </div>
                          <span className="text-xs text-[#94A3B8]">{f.cal} cal · {f.protein}g P</span>
                        </div>
                        <span className="text-[#FF6B6B] opacity-0 group-hover:opacity-100 transition-opacity">+</span>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setTab('pantry')} className="w-full mt-2 text-center text-xs text-[#FF6B6B] font-medium hover:bg-[#FFF5F5] py-1.5 rounded-lg transition-colors">
                    See all in Pantry →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === PROGRESS TAB === */}
        {tab === 'progress' && (
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Weekly — hero on progress tab too */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-[#0F172A]">Weekly Adherence</h3>
                  <p className="text-sm text-[#94A3B8]">Consistency over perfection — aim for 5 out of 7 days</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-[#0F172A]">1<span className="text-[#94A3B8] text-xl font-normal">/7</span></span>
                  <div className="text-xs text-[#94A3B8]">days on track</div>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-3">
                {MOCK_WEEK.map((d) => (
                  <div key={d.date} className={`rounded-xl py-3 flex flex-col items-center justify-center transition-colors ${
                    d.isToday ? 'bg-[#FF6B6B] text-white ring-2 ring-[#FF6B6B]/30 ring-offset-2'
                      : d.pct && d.pct >= 80 ? 'bg-[#F0FDF4] text-green-700 border border-green-200'
                      : d.pct ? 'bg-[#FFFBEB] text-amber-700 border border-amber-200'
                      : 'bg-[#F8FAFC] text-[#CBD5E1] border border-[#E2E8F0]'
                  }`}>
                    <span className="font-bold text-lg">{d.pct !== null ? `${d.pct}%` : '—'}</span>
                    <span className={`text-xs mt-0.5 ${d.isToday ? 'text-white/70' : ''}`}>{d.day} {d.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestion — prominent */}
            <div className="bg-gradient-to-r from-[#FF6B6B]/10 to-[#EF5350]/5 rounded-xl border border-[#FF6B6B]/20 p-5">
              <div className="text-[10px] text-[#FF6B6B] font-semibold uppercase tracking-wider mb-1">To hit today&apos;s targets</div>
              <div className="text-sm font-medium text-[#0F172A]">~82g protein for dinner. Try salmon (40g) + chicken (31g) or a protein shake.</div>
            </div>

            {/* Ring + macros */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <div className="flex items-start gap-8">
                <div className="relative w-28 h-28 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F5F9" strokeWidth="7" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#FF6B6B" strokeWidth="7"
                      strokeDasharray={`${calPct * 2.64} 264`} strokeLinecap="round" />
                    <circle cx="50" cy="50" r="33" fill="none" stroke="#F1F5F9" strokeWidth="5" />
                    <circle cx="50" cy="50" r="33" fill="none" stroke="#22C55E" strokeWidth="5"
                      strokeDasharray={`${protPct * 2.07} 207`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-[#0F172A]">{calPct}%</span>
                    <span className="text-[10px] text-[#94A3B8]">daily goal</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="mb-4">
                    <div className="text-sm text-[#94A3B8]">Remaining today</div>
                    <div className="text-3xl font-bold text-[#0F172A]">{remaining} <span className="text-lg font-normal text-[#94A3B8]">cal</span></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center px-3 py-2 bg-[#F0FDF4] rounded-xl">
                      <div className="text-sm font-bold text-green-700">{remainingP}g</div>
                      <div className="text-xs text-green-600">Protein</div>
                    </div>
                    <div className="text-center px-3 py-2 bg-[#FFFBEB] rounded-xl">
                      <div className="text-sm font-bold text-amber-700">{MOCK_TARGETS.carbs - MOCK_MACROS.carbs}g</div>
                      <div className="text-xs text-amber-600">Carbs</div>
                    </div>
                    <div className="text-center px-3 py-2 bg-[#FDF4FF] rounded-xl">
                      <div className="text-sm font-bold text-purple-700">{MOCK_TARGETS.fat - MOCK_MACROS.fat}g</div>
                      <div className="text-xs text-purple-600">Fat</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <MacroBar label="Calories" current={MOCK_MACROS.calories} target={MOCK_TARGETS.calories} color="#FF6B6B" />
                <MacroBar label="Protein" current={MOCK_MACROS.protein} target={MOCK_TARGETS.protein} color="#22C55E" />
                <MacroBar label="Carbs" current={MOCK_MACROS.carbs} target={MOCK_TARGETS.carbs} color="#F59E0B" />
                <MacroBar label="Fat" current={MOCK_MACROS.fat} target={MOCK_TARGETS.fat} color="#8B5CF6" />
              </div>
            </div>

            {/* By Meal breakdown */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <h3 className="font-medium text-[#0F172A] mb-3">By Meal</h3>
              <div className="space-y-2.5">
                {Object.entries(MOCK_MEALS).map(([meal, items]) => {
                  const mealCal = items.reduce((s, i) => s + i.calories, 0);
                  const mealPct = MOCK_TARGETS.calories > 0 ? Math.round((mealCal / MOCK_TARGETS.calories) * 100) : 0;
                  return (
                    <div key={meal} className="flex items-center gap-3">
                      <div className="w-8 text-center"><MealIcon meal={meal} /></div>
                      <span className="text-sm text-[#0F172A] capitalize w-16">{meal}</span>
                      <div className="flex-1"><div className="h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden"><div className="h-full bg-[#FF6B6B] rounded-full" style={{ width: `${mealPct}%` }} /></div></div>
                      <span className="text-sm text-[#475569] font-medium w-16 text-right">{mealCal} cal</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* === PANTRY TAB === */}
        {tab === 'pantry' && (
          <div className="grid grid-cols-3 gap-4">
            {/* Recent foods */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <h3 className="font-medium text-[#0F172A] mb-3">Recent Foods</h3>
              <div className="space-y-1">
                {MOCK_QUICK_FOODS.map((f) => (
                  <button key={f.name} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-[#F8FAFC] transition-colors text-left group">
                    <span className="text-lg">{f.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#0F172A] truncate">{f.name}</div>
                      <div className="text-xs text-[#94A3B8]">{f.cal} cal</div>
                    </div>
                    <span className="text-[#FF6B6B] opacity-0 group-hover:opacity-100 transition-opacity">+</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipes */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-[#0F172A]">My Recipes</h3>
                <button className="text-xs text-[#FF6B6B] font-semibold">+ New</button>
              </div>
              <div className="space-y-1">
                {MOCK_RECIPES.map((r) => (
                  <div key={r.name} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#F8FAFC] transition-colors group">
                    <span className="text-xl">{r.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#0F172A]">{r.name}</div>
                      <div className="text-xs text-[#94A3B8]">{r.cal} cal · {r.protein}g P</div>
                    </div>
                    <button className="px-3 py-1.5 bg-[#FF6B6B] text-white text-xs rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-opacity">Add</button>
                  </div>
                ))}
              </div>
              <button className="w-full mt-3 py-2.5 border-2 border-dashed border-[#E2E8F0] hover:border-[#FF6B6B] rounded-xl text-sm text-[#94A3B8] hover:text-[#FF6B6B] transition-colors">+ Create Recipe</button>
            </div>

            {/* Staples */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-[#0F172A]">My Staples</h3>
                <button className="text-xs text-[#FF6B6B] font-semibold">Manage</button>
              </div>
              {Object.entries(MOCK_STAPLES).map(([meal, staples]) => (
                <div key={meal} className="mb-3 last:mb-0">
                  <div className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wider mb-1.5 capitalize">{meal}</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {staples.map((s) => (
                      <span key={s.name} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FFF5F5] text-[#FF6B6B] text-xs rounded-full font-medium border border-[#FFE5E5]">
                        {s.emoji} {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// DESCRIPTIONS
// ============================================
const DESCRIPTIONS: Record<string, { title: string; desc: string; rationale: string }> = {
  A: {
    title: 'Option A: Current Layout (Reference)',
    desc: 'Two-column layout with everything on one page. Left sidebar: search, AI, progress, quick add, recipes. Right: weekly strip + meal log.',
    rationale: 'This is the current implementation. Everything is accessible but nothing is prioritized. The left sidebar competes with the meal log for attention. Users must scroll both columns independently, and the cognitive load of 7+ distinct sections is high.',
  },
  B: {
    title: 'Option B: "Log First" — Focused Daily Logger',
    desc: 'Single column, max-width 640px. The meal log IS the page. Each meal is a collapsible card with inline search. Macros are a compact sticky header. AI/quick-add via floating button.',
    rationale: 'The #1 job of this page is to LOG FOOD. Everything else should serve that single action. This strips away the sidebar entirely — search, quick add, and recipes appear inline when you expand a meal. Progress is a thin bar you glance at, not a full card. Quick foods appear contextually when adding. Weekly strip moves to the History tab (it\'s not about today\'s logging). Recipes/staples management → Pantry or Recipes tab.',
  },
  C: {
    title: 'Option C: "Dashboard + Drill" — Summary View',
    desc: 'Progress hero (ring chart + bars) at top. Meals as 4 summary cards in a grid. Tap a card to expand its items and add more. Weekly strip is a compact row at bottom.',
    rationale: 'Optimized for the "checking in" use case — users who want to see where they stand at a glance. The ring chart gives instant clarity. Meal cards show totals without overwhelming detail. Drilling into a meal is explicit and focused. Best for users who check progress frequently and log in bursts. Tradeoff: 2 taps to see meal items (one to open card), but you can see ALL meals\' status at once.',
  },
  D: {
    title: 'Option D: "Timeline" — Chronological Flow',
    desc: 'Linear timeline from morning to night. Each meal is a node on the timeline. Dark header with macro chips. Search bar at top. Quick foods as a horizontal scroll at bottom.',
    rationale: 'Follows the natural rhythm of a day. The timeline metaphor makes it obvious what\'s been logged and what\'s coming up. The vertical flow eliminates the need for column layouts entirely. Single column is inherently mobile-friendly. Macro chips in the header are scannable without taking up real estate. Best for users who log as they eat throughout the day. Quick foods at bottom are thumb-reachable on mobile.',
  },
  E: {
    title: 'Option E: "Tabbed Zones" — Split by Intent',
    desc: 'Three tabs: Log (meals + search), Progress (macros + weekly), Pantry (recent foods, recipes, staples). Compact header shows mini ring + macro summary across all tabs.',
    rationale: 'Addresses the root problem directly: the current page serves 3 different user intents on one screen. (1) "I want to log food" → Log tab: just meals + search, zero clutter. (2) "How am I doing?" → Progress tab: full macros, weekly view, suggestions. (3) "What do I usually eat?" → Pantry tab: recent foods, recipes, staples. The header ring provides enough at-a-glance progress that users don\'t need to leave the Log tab for basic awareness. Tradeoff: extra tap to reach recipes/quick add, but each tab is focused and clean.',
  },
  F: {
    title: 'Option F: "Best Of" — The Blend',
    desc: 'Tabbed zones (Log | Progress | Pantry) from E + dual-ring header from C + smart empty states with staple carousel + mobile bottom quick-add strip from D. The intent: when you open the page, you see your meals. Empty meals show staples to tap-and-go. Progress is one tab away. Recipes/staples management in Pantry.',
    rationale: 'Takes the best from each option and merges them intentionally:\n\n• TABS (from E): Three user intents = three tabs. This is the organizing principle. No more 7 things on one page.\n\n• DUAL RING HEADER (from C): Outer ring = calories, inner ring = protein. At a glance, across ALL tabs, you know where you stand. No need to switch to Progress tab just to check.\n\n• SMART EMPTY STATES (new): When a meal has nothing logged, instead of a sad dashed box, you see YOUR staples for that meal slot as a horizontal carousel — one tap to log. Below that, "Copy from yesterday" with calorie count. This turns the empty state from a dead end into the fastest path to logging.\n\n• BOTTOM QUICK-ADD STRIP (from D): Sticky at bottom, thumb-reachable on mobile. Recent foods as a scrollable row + AI button. This lives on ALL tabs so you\'re never more than one tap away from adding food, regardless of which tab you\'re on.\n\n• PROGRESS TAB: Full ring, remaining breakdown by macro, weekly compliance strip, per-meal breakdown bars, smart AI suggestion for what to eat next.\n\n• PANTRY TAB: Recent foods grid, recipes with inline add, staples organized by meal slot for easy management.\n\nTradeoffs: Slightly more taps to reach recipes than current sidebar layout, but the Log tab is dramatically cleaner. The bottom strip compensates by keeping quick-add accessible everywhere.',
  },
  G: {
    title: 'Option G: F Desktop — Sidebar Comes Back (Smart)',
    desc: 'Same tabs + same smart empty states as F, but on desktop the Log tab uses a 2/3 + 1/3 split. Meals on the left, sticky sidebar on the right with ring + macros + quick add + recipes + weekly mini. Search bar full-width in header. No bottom strip (sidebar handles that role). Progress and Pantry tabs go full-width for deep dives.',
    rationale: 'The key insight: on mobile, tabs HIDE things to save space. On desktop, we have the space — so the Log tab ALREADY shows what you\'d tab to on mobile. The sidebar contains: (1) Progress ring + macro bars (no need to switch to Progress tab for a glance), (2) Quick Add foods (no need for a bottom strip), (3) Recipes (no need to go to Pantry for quick recipe access), (4) Weekly mini strip with "Details →" link.\n\nThis means on desktop, most users NEVER leave the Log tab. Progress tab becomes a "deep dive" for the full dashboard. Pantry tab is for staple management and browsing all recipes.\n\nThe sidebar is lean — 4 compact cards vs the current 5+ cards, and each one earns its place. No USDA search card (unified into header bar). No AI card (integrated into search bar). No redundant "Today\'s Progress" title card. Just: ring, quick add, recipes, weekly.\n\nSmart empty states from F carry over — staples carousel + copy yesterday in empty meals. Hover actions on food items (pin, edit, delete) replace mobile swipe gestures. Full macro columns visible (C, F shown alongside cal + P).\n\nThe search bar is promoted to the header — always visible, never buried in a sidebar card. Voice + camera + AI all accessible from there.',
  },
  H: {
    title: 'Option H: Refined Desktop — Weekly + Suggestion Promoted, Merged Quick Add',
    desc: 'G\'s layout with 3 key changes: (1) Weekly strip at TOP of Log tab — the philosophical anchor that consistency > perfection is front and center. (2) "Hit your targets" suggestion immediately below weekly — you see the week, then what to do RIGHT NOW. (3) Quick Add merges staples + recipes + recents into one tagged list — no separate "My Recipes" card. Sidebar is just: ring+macros and merged quick add.',
    rationale: 'Three changes from G, each with a clear reason:\n\n★ WEEKLY AT TOP: The whole philosophy of baisics is "adherence over a week, not perfection each day." If that\'s the message, the weekly strip can\'t be buried at the bottom of a sidebar. It\'s the FIRST thing you see on the Log tab, right below the search bar. Includes a motivational subtitle ("Consistency beats perfection — aim for 5/7 days on target") and a clear X/7 score. Color-coded: green (≥80%), amber (logged but low), gray (nothing).\n\n★ SUGGESTION BELOW WEEKLY: Natural reading flow — you see your week, then "here\'s what to do right now to stay on track." It\'s a thin banner, not a big card — actionable but not dominating. Includes a "Suggest meal →" button.\n\n★ MERGED QUICK ADD: "My Recipes" was redundant when you also have Quick Add. Now it\'s one list: staples (coral tag), recipes (purple tag), recents (gray tag). Filterable by tag. Top items bubble up by frequency. "See all in Pantry →" link for full browsing. This shrinks the sidebar from 4 cards to 2 cards: ring + merged quick add.\n\nThe Progress tab also leads with weekly (bigger view, hero treatment) then suggestion, then the ring+macros deep dive. Weekly is the throughline across both Log and Progress tabs.\n\nPantry stays as 3 columns: Recent | Recipes | Staples.',
  },
};

// ============================================
// MAIN PAGE
// ============================================
export default function FoodLogRedesignPage() {
  const [activeOption, setActiveOption] = useState<'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'>('H');

  const options = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a href="/dev" className="text-sm text-[#94A3B8] hover:text-[#FF6B6B] mb-2 inline-block">← Back to Dev</a>
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Food Log Page — Redesign Options (#376)</h1>
          <p className="text-[#475569]">
            The current page crams 7 concerns into one view. These options explore different ways
            to prioritize and separate: logging, progress tracking, search, quick add, recipes, staples, and weekly trends.
          </p>
        </div>

        {/* Option Selector */}
        <div className="flex gap-1 mb-6 p-1 bg-white rounded-xl border border-[#E2E8F0] overflow-x-auto">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => setActiveOption(opt)}
              className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                activeOption === opt
                  ? 'bg-[#0F172A] text-white'
                  : 'text-[#475569] hover:bg-[#F8FAFC]'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Description */}
        <div className="mb-6 p-4 bg-white rounded-xl border border-[#E2E8F0]">
          <h3 className="font-semibold text-[#0F172A] mb-1">{DESCRIPTIONS[activeOption].title}</h3>
          <p className="text-sm text-[#475569] mb-3">{DESCRIPTIONS[activeOption].desc}</p>
          <details className="text-sm">
            <summary className="text-[#FF6B6B] cursor-pointer font-medium">Why this layout?</summary>
            <p className="mt-2 text-[#475569] leading-relaxed">{DESCRIPTIONS[activeOption].rationale}</p>
          </details>
        </div>

        {/* Demo */}
        <div className="mb-8">
          {activeOption === 'A' && <OptionACurrent />}
          {activeOption === 'B' && <OptionBLogFirst />}
          {activeOption === 'C' && <OptionCDashboard />}
          {activeOption === 'D' && <OptionDTimeline />}
          {activeOption === 'E' && <OptionETabbed />}
          {activeOption === 'F' && <OptionFBestOf />}
          {activeOption === 'G' && <OptionGDesktop />}
          {activeOption === 'H' && <OptionHRefined />}
        </div>

        {/* Comparison Table */}
        <div className="mb-8 bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <h3 className="font-semibold text-[#0F172A]">Quick Comparison</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  <th className="text-left px-4 py-2 text-[#64748B] font-medium">Concern</th>
                  <th className="px-4 py-2 text-[#64748B] font-medium">A: Current</th>
                  <th className="px-4 py-2 text-[#64748B] font-medium">B: Log First</th>
                  <th className="px-4 py-2 text-[#64748B] font-medium">C: Dashboard</th>
                  <th className="px-4 py-2 text-[#64748B] font-medium">D: Timeline</th>
                  <th className="px-4 py-2 text-[#64748B] font-medium">E: Tabbed</th>
                  <th className="px-4 py-2 text-[#FF6B6B] font-medium">F: Mobile</th>
                  <th className="px-4 py-2 text-[#FF6B6B] font-medium bg-[#FFF5F5]">G: Desktop</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b border-[#F1F5F9]">
                  <td className="px-4 py-2 font-medium text-[#0F172A]">Food logging</td>
                  <td className="px-4 py-2 text-center">Right col</td>
                  <td className="px-4 py-2 text-center text-green-600 font-medium">Hero focus</td>
                  <td className="px-4 py-2 text-center">Drill-in</td>
                  <td className="px-4 py-2 text-center">Inline</td>
                  <td className="px-4 py-2 text-center">Log tab</td>
                  <td className="px-4 py-2 text-center text-[#FF6B6B] font-medium">Log tab + staples</td>
                  <td className="px-4 py-2 text-center text-[#FF6B6B] font-medium bg-[#FFFBFB]">2/3 col + staples</td>
                </tr>
                <tr className="border-b border-[#F1F5F9]">
                  <td className="px-4 py-2 font-medium text-[#0F172A]">Macro progress</td>
                  <td className="px-4 py-2 text-center">Left sidebar</td>
                  <td className="px-4 py-2 text-center">Thin header</td>
                  <td className="px-4 py-2 text-center text-green-600 font-medium">Hero ring</td>
                  <td className="px-4 py-2 text-center">Header chips</td>
                  <td className="px-4 py-2 text-center">Progress tab</td>
                  <td className="px-4 py-2 text-center text-[#FF6B6B] font-medium">Dual ring + tab</td>
                  <td className="px-4 py-2 text-center text-[#FF6B6B] font-medium bg-[#FFFBFB]">Sidebar ring (sticky)</td>
                </tr>
                <tr className="border-b border-[#F1F5F9]">
                  <td className="px-4 py-2 font-medium text-[#0F172A]">Search / AI</td>
                  <td className="px-4 py-2 text-center">2 sidebar cards</td>
                  <td className="px-4 py-2 text-center">FAB + inline</td>
                  <td className="px-4 py-2 text-center">Single bar</td>
                  <td className="px-4 py-2 text-center">Top bar</td>
                  <td className="px-4 py-2 text-center">In Log tab</td>
                  <td className="px-4 py-2 text-center text-[#FF6B6B] font-medium">Log bar + bottom AI</td>
                  <td className="px-4 py-2 text-center text-[#FF6B6B] font-medium bg-[#FFFBFB]">Header bar (always)</td>
                </tr>
                <tr className="border-b border-[#F1F5F9]">
                  <td className="px-4 py-2 font-medium text-[#0F172A]">Quick add / Recent</td>
                  <td className="px-4 py-2 text-center">Sidebar grid</td>
                  <td className="px-4 py-2 text-center">Contextual</td>
                  <td className="px-4 py-2 text-center">None visible</td>
                  <td className="px-4 py-2 text-center">Bottom scroll</td>
                  <td className="px-4 py-2 text-center">Pantry tab</td>
                  <td className="px-4 py-2 text-center text-[#FF6B6B] font-medium">Bottom strip</td>
                  <td className="px-4 py-2 text-center text-[#FF6B6B] font-medium bg-[#FFFBFB]">Sidebar card</td>
                </tr>
                <tr className="border-b border-[#F1F5F9]">
                  <td className="px-4 py-2 font-medium text-[#0F172A]">Recipes</td>
                  <td className="px-4 py-2 text-center">Sidebar card</td>
                  <td className="px-4 py-2 text-center">In search</td>
                  <td className="px-4 py-2 text-center">Hidden</td>
                  <td className="px-4 py-2 text-center">Hidden</td>
                  <td className="px-4 py-2 text-center">Pantry tab</td>
                  <td className="px-4 py-2 text-center text-[#FF6B6B] font-medium">Pantry tab</td>
                  <td className="px-4 py-2 text-center text-[#FF6B6B] font-medium bg-[#FFFBFB]">Sidebar + Pantry</td>
                </tr>
                <tr className="border-b border-[#F1F5F9]">
                  <td className="px-4 py-2 font-medium text-[#0F172A]">Empty meal UX</td>
                  <td className="px-4 py-2 text-center">Dashed box</td>
                  <td className="px-4 py-2 text-center">Copy link</td>
                  <td className="px-4 py-2 text-center">+ Add btn</td>
                  <td className="px-4 py-2 text-center">Dashed btn</td>
                  <td className="px-4 py-2 text-center">Copy link</td>
                  <td className="px-4 py-2 text-center text-[#FF6B6B] font-medium">Staples + copy</td>
                  <td className="px-4 py-2 text-center text-[#FF6B6B] font-medium bg-[#FFFBFB]">Staples (wrap) + copy</td>
                </tr>
                <tr className="border-b border-[#F1F5F9]">
                  <td className="px-4 py-2 font-medium text-[#0F172A]">Weekly trends</td>
                  <td className="px-4 py-2 text-center">Right col top</td>
                  <td className="px-4 py-2 text-center">History tab</td>
                  <td className="px-4 py-2 text-center">Bottom mini</td>
                  <td className="px-4 py-2 text-center">Hidden</td>
                  <td className="px-4 py-2 text-center">Progress tab</td>
                  <td className="px-4 py-2 text-center text-[#FF6B6B] font-medium">Progress tab</td>
                  <td className="px-4 py-2 text-center text-[#FF6B6B] font-medium bg-[#FFFBFB]">Sidebar mini + tab</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-[#0F172A]">Clicks to log food</td>
                  <td className="px-4 py-2 text-center">1-2</td>
                  <td className="px-4 py-2 text-center text-green-600 font-medium">1</td>
                  <td className="px-4 py-2 text-center">2</td>
                  <td className="px-4 py-2 text-center">1</td>
                  <td className="px-4 py-2 text-center">1</td>
                  <td className="px-4 py-2 text-center text-[#FF6B6B] font-bold">1 (staple tap)</td>
                  <td className="px-4 py-2 text-center text-[#FF6B6B] font-bold bg-[#FFFBFB]">1 (staple or sidebar)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Test Notes */}
        <div className="p-4 bg-[#FEF3C7]/50 rounded-xl border border-[#FEF3C7]">
          <h4 className="font-semibold text-[#92400E] mb-2">Test Notes</h4>
          <ul className="text-sm text-[#92400E] space-y-1">
            <li>• Which layout makes it clearest what you&apos;ve eaten today?</li>
            <li>• How many taps to add a food to lunch?</li>
            <li>• Can you see your macro progress WITHOUT scrolling?</li>
            <li>• Does the page feel overwhelming or focused?</li>
            <li>• On mobile (narrow the browser), which holds up best?</li>
            <li>• Options can be mixed: e.g., E&apos;s tab structure with B&apos;s log design</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
