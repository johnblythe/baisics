'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Clock,
  ChefHat,
  Sparkles,
  TrendingUp,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Coffee,
  Sun,
  Moon,
  Apple,
  Mic,
  Camera,
  Calendar
} from 'lucide-react';

// =============================================================================
// MOCK DATA
// =============================================================================

const WEEKLY_DATA = [
  { day: 'M', date: '1/20', calories: 2150, target: 2200, protein: 175, proteinTarget: 180, logged: true, adherence: 98 },
  { day: 'T', date: '1/21', calories: 2280, target: 2200, protein: 185, proteinTarget: 180, logged: true, adherence: 96 },
  { day: 'W', date: '1/22', calories: 1950, target: 2200, protein: 160, proteinTarget: 180, logged: true, adherence: 85 },
  { day: 'T', date: '1/23', calories: 1055, target: 2200, protein: 95, proteinTarget: 180, logged: true, adherence: 48, isToday: true },
  { day: 'F', date: '1/24', calories: 0, target: 2200, protein: 0, proteinTarget: 180, logged: false, adherence: 0 },
  { day: 'S', date: '1/25', calories: 0, target: 2200, protein: 0, proteinTarget: 180, logged: false, adherence: 0 },
  { day: 'S', date: '1/26', calories: 0, target: 2200, protein: 0, proteinTarget: 180, logged: false, adherence: 0 },
];

const QUICK_FOODS = [
  { id: '1', name: 'Proats', calories: 420, protein: 35, emoji: '🥣' },
  { id: '2', name: 'Chicken 6oz', calories: 280, protein: 52, emoji: '🍗' },
  { id: '3', name: 'Protein Pudding', calories: 280, protein: 40, emoji: '🍮' },
  { id: '4', name: 'Greek Yogurt', calories: 180, protein: 18, emoji: '🫐' },
  { id: '5', name: 'Rice Bowl', calories: 350, protein: 8, emoji: '🍚' },
  { id: '6', name: 'Post-Workout Shake', calories: 450, protein: 50, emoji: '🥤' },
  { id: '7', name: 'Egg Scramble', calories: 220, protein: 35, emoji: '🍳' },
  { id: '8', name: 'Salmon 6oz', calories: 350, protein: 40, emoji: '🐟' },
];

const TODAYS_LOG = [
  { id: 'l1', meal: 'breakfast', name: 'Protein Oats', calories: 420, protein: 35, carbs: 45, fat: 12, time: '7:30 AM' },
  { id: 'l2', meal: 'breakfast', name: 'Black Coffee', calories: 5, protein: 0, carbs: 1, fat: 0, time: '7:30 AM' },
  { id: 'l3', meal: 'lunch', name: 'Chicken Breast (6oz)', calories: 280, protein: 52, carbs: 0, fat: 6, time: '12:15 PM' },
  { id: 'l4', meal: 'lunch', name: 'Rice + Veggies Bowl', calories: 350, protein: 8, carbs: 65, fat: 6, time: '12:15 PM' },
];

const SAVED_RECIPES = [
  { id: 'r1', name: 'Protein Pudding', calories: 280, protein: 40, emoji: '🍮' },
  { id: 'r2', name: 'Post-Workout Shake', calories: 450, protein: 50, emoji: '🥤' },
  { id: 'r3', name: 'Egg White Scramble', calories: 220, protein: 35, emoji: '🍳' },
];

// =============================================================================
// SHARED COMPONENTS
// =============================================================================

function MacroProgressBar({ layout = 'horizontal' }: { layout?: 'horizontal' | 'vertical' }) {
  const totals = TODAYS_LOG.reduce((acc, item) => ({
    calories: acc.calories + item.calories,
    protein: acc.protein + item.protein,
    carbs: acc.carbs + item.carbs,
    fat: acc.fat + item.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const targets = { calories: 2200, protein: 180, carbs: 220, fat: 75 };

  if (layout === 'vertical') {
    return (
      <div className="space-y-3">
        {[
          { label: 'Calories', current: totals.calories, target: targets.calories, color: 'bg-[#FF6B6B]', textColor: 'text-[#0F172A]' },
          { label: 'Protein', current: totals.protein, target: targets.protein, color: 'bg-green-500', textColor: 'text-green-600', unit: 'g' },
          { label: 'Carbs', current: totals.carbs, target: targets.carbs, color: 'bg-amber-500', textColor: 'text-amber-600', unit: 'g' },
          { label: 'Fat', current: totals.fat, target: targets.fat, color: 'bg-blue-500', textColor: 'text-blue-600', unit: 'g' },
        ].map((macro) => (
          <div key={macro.label}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-[#64748B]">{macro.label}</span>
              <span className={`font-medium ${macro.textColor}`}>
                {macro.current}{macro.unit || ''} / {macro.target}{macro.unit || ''}
              </span>
            </div>
            <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className={`h-full ${macro.color} rounded-full transition-all`}
                style={{ width: `${Math.min((macro.current / macro.target) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
        <div className="pt-2 border-t border-[#E2E8F0]">
          <div className="text-sm text-[#64748B]">Remaining</div>
          <div className="text-lg font-bold text-[#0F172A]">
            {targets.calories - totals.calories} cal · {targets.protein - totals.protein}g P
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-[#64748B]">Calories</span>
          <span className="font-medium text-[#0F172A]">{totals.calories} / {targets.calories}</span>
        </div>
        <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FF6B6B] rounded-full transition-all"
            style={{ width: `${Math.min((totals.calories / targets.calories) * 100, 100)}%` }}
          />
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-[#64748B]">Protein</span>
          <span className="font-medium text-green-600">{totals.protein}g / {targets.protein}g</span>
        </div>
        <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${Math.min((totals.protein / targets.protein) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function QuickInput({
  onSubmit,
  onFocus,
  className = ''
}: {
  onSubmit: (text: string) => void;
  onFocus?: () => void;
  className?: string;
}) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      onSubmit(input);
      setInput('');
      setIsProcessing(false);
    }, 800);
  };

  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <div className="relative flex-1">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={onFocus}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder='"chicken breast" or "same as yesterday"'
          className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent text-sm"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
      </div>

      <button className="p-3 text-[#94A3B8] hover:text-[#64748B] hover:bg-[#F1F5F9] rounded-xl transition-colors">
        <Mic className="w-5 h-5" />
      </button>

      <button className="p-3 text-[#94A3B8] hover:text-[#64748B] hover:bg-[#F1F5F9] rounded-xl transition-colors">
        <Camera className="w-5 h-5" />
      </button>

      <button
        onClick={handleSubmit}
        disabled={!input.trim() || isProcessing}
        className="p-3 bg-[#FF6B6B] text-white rounded-xl hover:bg-[#EF5350] disabled:opacity-50 transition-colors"
      >
        {isProcessing ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Sparkles className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}

function QuickPills({ onAdd, layout = 'horizontal' }: { onAdd: (item: typeof QUICK_FOODS[0]) => void; layout?: 'horizontal' | 'grid' }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (layout === 'grid') {
    return (
      <div className="grid grid-cols-2 gap-2">
        {QUICK_FOODS.slice(0, 6).map((food) => (
          <button
            key={food.id}
            onClick={() => onAdd(food)}
            className="flex items-center gap-2 p-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl transition-colors group text-left"
          >
            <span className="text-xl">{food.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[#0F172A] truncate">{food.name}</div>
              <div className="text-xs text-[#94A3B8]">{food.calories} cal</div>
            </div>
            <Plus className="w-4 h-4 text-[#94A3B8] group-hover:text-[#FF6B6B] transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto scrollbar-hide"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {QUICK_FOODS.map((food) => (
        <button
          key={food.id}
          onClick={() => onAdd(food)}
          className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-full transition-colors group"
        >
          <span className="text-lg">{food.emoji}</span>
          <span className="text-sm font-medium text-[#0F172A] whitespace-nowrap">{food.name}</span>
          <Plus className="w-4 h-4 text-[#94A3B8] group-hover:text-[#FF6B6B] transition-colors" />
        </button>
      ))}
    </div>
  );
}

function WeeklyStrip({ expanded: controlledExpanded, onToggle }: { expanded?: boolean; onToggle?: () => void }) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = controlledExpanded ?? internalExpanded;
  const toggle = onToggle ?? (() => setInternalExpanded(!internalExpanded));

  const loggedDays = WEEKLY_DATA.filter(d => d.logged).length;
  const avgAdherence = Math.round(
    WEEKLY_DATA.filter(d => d.logged && !d.isToday).reduce((sum, d) => sum + d.adherence, 0) /
    Math.max(WEEKLY_DATA.filter(d => d.logged && !d.isToday).length, 1)
  );

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0]">
      <button
        onClick={toggle}
        className="w-full px-4 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-[#FF6B6B]" />
          <div className="flex gap-1">
            {WEEKLY_DATA.map((day, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-medium
                  ${day.isToday
                    ? 'bg-[#FF6B6B] text-white'
                    : day.logged
                      ? day.adherence >= 90
                        ? 'bg-green-100 text-green-700'
                        : day.adherence >= 75
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      : 'bg-[#F1F5F9] text-[#94A3B8]'
                  }`}
              >
                {day.day}
              </div>
            ))}
          </div>
          <div className="text-sm">
            <span className="font-medium text-[#0F172A]">{avgAdherence}% avg</span>
            <span className="text-[#94A3B8]"> · {loggedDays}/7</span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-[#94A3B8]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#94A3B8]" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="grid grid-cols-7 gap-2">
                {WEEKLY_DATA.map((day, i) => (
                  <div key={i} className="text-center">
                    <div className={`
                      aspect-square rounded-xl flex flex-col items-center justify-center text-xs
                      ${day.isToday
                        ? 'bg-[#FF6B6B] text-white'
                        : day.logged
                          ? day.adherence >= 90
                            ? 'bg-green-50 border-2 border-green-200'
                            : day.adherence >= 75
                              ? 'bg-amber-50 border-2 border-amber-200'
                              : 'bg-red-50 border-2 border-red-200'
                          : 'bg-[#F8FAFC] border border-[#E2E8F0]'
                      }`}
                    >
                      {day.logged ? (
                        <>
                          <span className={`font-bold ${day.isToday ? 'text-white' : ''}`}>
                            {day.adherence}%
                          </span>
                          <span className={`text-[10px] ${day.isToday ? 'text-white/80' : 'text-[#94A3B8]'}`}>
                            {day.protein}g P
                          </span>
                        </>
                      ) : (
                        <span className="text-[#CBD5E1]">—</span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#94A3B8] mt-1">{day.date}</div>
                  </div>
                ))}
              </div>

              <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <p className="text-sm text-green-800">
                  <span className="font-semibold">Week is strong</span> — {avgAdherence}% avg before today. Room for flexibility.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MealSection({
  meal,
  items,
  onAdd
}: {
  meal: string;
  items: typeof TODAYS_LOG;
  onAdd: () => void;
}) {
  const MealIcon = () => {
    switch(meal) {
      case 'breakfast': return <Coffee className="w-4 h-4" />;
      case 'lunch': return <Sun className="w-4 h-4" />;
      case 'dinner': return <Moon className="w-4 h-4" />;
      default: return <Apple className="w-4 h-4" />;
    }
  };

  const totals = items.reduce((acc, i) => ({ cal: acc.cal + i.calories, p: acc.p + i.protein }), { cal: 0, p: 0 });

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#F1F5F9] rounded-lg text-[#64748B]">
            <MealIcon />
          </div>
          <span className="font-medium text-[#0F172A] capitalize">{meal}</span>
          {items.length > 0 && (
            <span className="text-xs text-[#94A3B8]">
              {totals.cal} cal · {totals.p}g P
            </span>
          )}
        </div>
        <button
          onClick={onAdd}
          className="text-xs text-[#FF6B6B] hover:text-[#EF5350] font-medium flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Add
        </button>
      </div>

      {items.length > 0 ? (
        <div className="space-y-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl"
            >
              <div>
                <div className="text-sm font-medium text-[#0F172A]">{item.name}</div>
                <div className="text-xs text-[#94A3B8]">{item.time}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-[#0F172A]">{item.calories} cal</div>
                <div className="text-xs text-green-600">{item.protein}g P</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <button
          onClick={onAdd}
          className="w-full p-4 border-2 border-dashed border-[#E2E8F0] rounded-xl text-sm text-[#94A3B8] hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition-colors"
        >
          + Add {meal}
        </button>
      )}
    </div>
  );
}

function RecipesPanel({ onAdd }: { onAdd: (item: { name: string }) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-[#0F172A] flex items-center gap-2">
          <ChefHat className="w-4 h-4 text-[#FF6B6B]" />
          My Recipes
        </h3>
      </div>
      {SAVED_RECIPES.map((recipe) => (
        <button
          key={recipe.id}
          onClick={() => onAdd(recipe)}
          className="w-full flex items-center gap-3 p-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-xl transition-colors text-left"
        >
          <span className="text-xl">{recipe.emoji}</span>
          <div className="flex-1">
            <div className="text-sm font-medium text-[#0F172A]">{recipe.name}</div>
            <div className="text-xs text-[#94A3B8]">{recipe.calories} cal · {recipe.protein}g P</div>
          </div>
          <Plus className="w-4 h-4 text-[#94A3B8]" />
        </button>
      ))}
      <button className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-[#E2E8F0] hover:border-[#FF6B6B] rounded-xl text-sm text-[#94A3B8] hover:text-[#FF6B6B] transition-colors">
        <Plus className="w-4 h-4" />
        Create Recipe
      </button>
    </div>
  );
}

// =============================================================================
// MOBILE COMPONENTS
// =============================================================================

function MobileLayout({
  onAdd,
  onAISubmit,
  showQuickAdd,
  setShowQuickAdd
}: {
  onAdd: (item: { name: string }) => void;
  onAISubmit: (text: string) => void;
  showQuickAdd: boolean;
  setShowQuickAdd: (show: boolean) => void;
}) {
  const meals: Record<string, typeof TODAYS_LOG> = {
    breakfast: TODAYS_LOG.filter(l => l.meal === 'breakfast'),
    lunch: TODAYS_LOG.filter(l => l.meal === 'lunch'),
    dinner: [],
    snacks: [],
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <div className="bg-[#FF6B6B] text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Food Log</h1>
            <p className="text-sm text-white/80">Thursday, Jan 23</p>
          </div>
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Demo</span>
        </div>
      </div>

      {/* Macro Progress */}
      <div className="px-4 py-3 bg-white border-b border-[#E2E8F0]">
        <MacroProgressBar layout="horizontal" />
      </div>

      {/* Quick Input */}
      <div className="px-4 py-3 bg-white border-b border-[#E2E8F0]">
        <QuickInput onSubmit={onAISubmit} onFocus={() => setShowQuickAdd(true)} />
      </div>

      {/* Quick Pills */}
      <div className="px-4 py-3 bg-white border-b border-[#E2E8F0]">
        <QuickPills onAdd={onAdd} layout="horizontal" />
      </div>

      {/* Weekly Strip */}
      <div className="px-4 py-3 bg-white border-b border-[#E2E8F0]">
        <WeeklyStrip />
      </div>

      {/* Today's Log */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {Object.entries(meals).map(([mealName, items]) => (
          <MealSection
            key={mealName}
            meal={mealName}
            items={items}
            onAdd={() => onAdd({ name: `Add to ${mealName}` })}
          />
        ))}
      </div>

      {/* Remaining (sticky) */}
      <div className="px-4 py-3 bg-gradient-to-t from-white to-white/80 border-t border-[#E2E8F0]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-[#64748B]">Remaining</div>
            <div className="font-bold text-[#0F172A]">1,145 cal · 85g P</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-[#94A3B8]">Suggestion</div>
            <div className="text-sm text-[#FF6B6B] font-medium">Chicken + rice</div>
          </div>
        </div>
      </div>

      {/* Mobile Quick Add Sheet */}
      <AnimatePresence>
        {showQuickAdd && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShowQuickAdd(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-h-[70vh] overflow-hidden"
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-[#E2E8F0] rounded-full" />
              </div>
              <div className="px-4 pb-4 space-y-4 overflow-y-auto max-h-[60vh]">
                <div>
                  <h3 className="font-medium text-[#0F172A] mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#FF6B6B]" />
                    Recent
                  </h3>
                  <QuickPills onAdd={(item) => { onAdd(item); setShowQuickAdd(false); }} layout="grid" />
                </div>
                <RecipesPanel onAdd={(item) => { onAdd(item); setShowQuickAdd(false); }} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// DESKTOP COMPONENTS
// =============================================================================

function DesktopLayout({
  onAdd,
  onAISubmit
}: {
  onAdd: (item: { name: string }) => void;
  onAISubmit: (text: string) => void;
}) {
  const [weekExpanded, setWeekExpanded] = useState(true);

  const meals: Record<string, typeof TODAYS_LOG> = {
    breakfast: TODAYS_LOG.filter(l => l.meal === 'breakfast'),
    lunch: TODAYS_LOG.filter(l => l.meal === 'lunch'),
    dinner: [],
    snacks: [],
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#0F172A]">Food Log</h1>
              <p className="text-sm text-[#64748B]">Thursday, January 23</p>
            </div>
            <span className="text-xs text-[#94A3B8] bg-[#F1F5F9] px-2 py-1 rounded">Demo</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left Column: Quick Add (sticky) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-4">
              {/* Search Input */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
                <h3 className="font-medium text-[#0F172A] mb-3 flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#FF6B6B]" />
                  Add Food
                </h3>
                <QuickInput onSubmit={onAISubmit} />
              </div>

              {/* Today's Progress */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
                <h3 className="font-medium text-[#0F172A] mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#FF6B6B]" />
                  Today&apos;s Progress
                </h3>
                <MacroProgressBar layout="vertical" />
              </div>

              {/* Quick Add */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
                <h3 className="font-medium text-[#0F172A] mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FF6B6B]" />
                  Quick Add
                </h3>
                <QuickPills onAdd={onAdd} layout="grid" />
              </div>

              {/* Recipes */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
                <RecipesPanel onAdd={onAdd} />
              </div>
            </div>
          </div>

          {/* Right Column: Log + Weekly */}
          <div className="lg:col-span-2 space-y-4">
            {/* Weekly Overview */}
            <WeeklyStrip expanded={weekExpanded} onToggle={() => setWeekExpanded(!weekExpanded)} />

            {/* Today's Log */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
              <h3 className="font-medium text-[#0F172A] mb-4">Today&apos;s Meals</h3>
              <div className="space-y-4">
                {Object.entries(meals).map(([mealName, items]) => (
                  <MealSection
                    key={mealName}
                    meal={mealName}
                    items={items}
                    onAdd={() => onAdd({ name: `Add to ${mealName}` })}
                  />
                ))}
              </div>
            </div>

            {/* Smart Suggestion */}
            <div className="bg-gradient-to-r from-[#FF6B6B]/10 to-[#EF5350]/10 rounded-xl border border-[#FF6B6B]/20 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-[#64748B]">To hit your targets</div>
                  <div className="font-bold text-[#0F172A]">Chicken breast + rice bowl would get you there</div>
                </div>
                <button className="px-4 py-2 bg-[#FF6B6B] text-white font-medium rounded-lg hover:bg-[#EF5350] transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// AI PARSE RESULT (shared)
// =============================================================================

function AIParseResult({
  result,
  onConfirm,
  onCancel
}: {
  result: { input: string; foods: string[]; macros: { cal: number; p: number; c: number; f: number } };
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-[#E2E8F0] shadow-lg lg:bottom-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:max-w-md lg:rounded-2xl lg:border"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-green-100 rounded-lg">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <span className="font-medium text-[#0F172A]">Parsed: &quot;{result.input}&quot;</span>
        </div>
        <button onClick={onCancel} className="p-1 text-[#94A3B8] hover:text-[#64748B]">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-1 mb-3">
        {result.foods.map((food, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-[#64748B]">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            {food}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 text-sm mb-4 p-3 bg-[#F8FAFC] rounded-xl">
        <span className="font-bold text-[#0F172A]">{result.macros.cal} cal</span>
        <span className="text-green-600">{result.macros.p}g P</span>
        <span className="text-amber-600">{result.macros.c}g C</span>
        <span className="text-blue-600">{result.macros.f}g F</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="flex-1 py-3 bg-[#FF6B6B] text-white font-semibold rounded-xl hover:bg-[#EF5350] transition-colors"
        >
          Add to Log
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-3 text-[#64748B] font-medium hover:bg-[#F1F5F9] rounded-xl transition-colors"
        >
          Edit
        </button>
      </div>
    </motion.div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function FoodLoggingDemoPage() {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [parseResult, setParseResult] = useState<{ input: string; foods: string[]; macros: { cal: number; p: number; c: number; f: number } } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleAISubmit = (text: string) => {
    if (text.toLowerCase().includes('same') || text.toLowerCase().includes('yesterday')) {
      setParseResult({
        input: text,
        foods: ['Protein Oats', 'Black Coffee'],
        macros: { cal: 425, p: 35, c: 46, f: 12 }
      });
    } else if (text.toLowerCase().includes('chicken')) {
      setParseResult({
        input: text,
        foods: ['Chicken Breast (6oz)', 'Steamed Rice (1 cup)'],
        macros: { cal: 480, p: 55, c: 45, f: 8 }
      });
    } else {
      setParseResult({
        input: text,
        foods: [text],
        macros: { cal: 300, p: 20, c: 30, f: 10 }
      });
    }
  };

  const handleAdd = (item: { name: string }) => {
    showToast(`Added: ${item.name}`);
  };

  return (
    <>
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <MobileLayout
          onAdd={handleAdd}
          onAISubmit={handleAISubmit}
          showQuickAdd={showQuickAdd}
          setShowQuickAdd={setShowQuickAdd}
        />
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <DesktopLayout
          onAdd={handleAdd}
          onAISubmit={handleAISubmit}
        />
      </div>

      {/* AI Parse Result (shared) */}
      <AnimatePresence>
        {parseResult && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setParseResult(null)}
            />
            <AIParseResult
              result={parseResult}
              onConfirm={() => {
                showToast(`Added: ${parseResult.foods.join(', ')}`);
                setParseResult(null);
              }}
              onCancel={() => setParseResult(null)}
            />
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-green-600 text-white rounded-full shadow-lg flex items-center gap-2 lg:bottom-8"
          >
            <Check className="w-4 h-4" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
