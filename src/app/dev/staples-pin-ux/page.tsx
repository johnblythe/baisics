'use client';

import { useState, useCallback } from 'react';
import { Pin, PinOff, Pencil, Trash2, AlertCircle, Check, X, Settings, ChevronDown, ChevronLeft, ChevronRight, Clock, GripVertical } from 'lucide-react';

// ============================================
// Mock data
// ============================================
interface MockFoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time?: string;
  isApproximate?: boolean;
}

interface MockStaple {
  id: string;
  name: string;
  emoji: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealSlot: string;
  autoLog: boolean;
  sortOrder: number;
}

const INITIAL_FOOD_ITEMS: MockFoodItem[] = [
  { id: '1', name: 'Greek Yogurt with Honey', calories: 283, protein: 48, carbs: 22, fat: 4, time: '8:30 AM' },
  { id: '2', name: 'Overnight Oats', calories: 350, protein: 12, carbs: 52, fat: 10, time: '8:30 AM' },
  { id: '3', name: 'Protein Shake', calories: 180, protein: 30, carbs: 8, fat: 3 },
  { id: '4', name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0, isApproximate: true },
  { id: '5', name: 'Scrambled Eggs (3)', calories: 220, protein: 18, carbs: 2, fat: 15, time: '9:00 AM' },
];

const INITIAL_PINNED: MockStaple[] = [
  { id: 's1', name: 'Greek Yogurt with Honey', emoji: '🥣', calories: 283, protein: 48, carbs: 22, fat: 4, mealSlot: 'BREAKFAST', autoLog: false, sortOrder: 0 },
  { id: 's2', name: 'Protein Shake', emoji: '🥤', calories: 180, protein: 30, carbs: 8, fat: 3, mealSlot: 'BREAKFAST', autoLog: true, sortOrder: 1 },
];

// ============================================
// Shared hook for all options
// ============================================
function usePinState() {
  const [foods] = useState<MockFoodItem[]>(INITIAL_FOOD_ITEMS);
  const [pinned, setPinned] = useState<MockStaple[]>(INITIAL_PINNED);
  const [actionLog, setActionLog] = useState<string[]>([]);

  const isPinned = useCallback((name: string) => {
    return pinned.some(s => s.name.toLowerCase() === name.toLowerCase());
  }, [pinned]);

  const pin = useCallback((item: MockFoodItem) => {
    if (pinned.some(s => s.name.toLowerCase() === item.name.toLowerCase())) {
      setActionLog(prev => [`⚠️ "${item.name}" already pinned — skipped`, ...prev]);
      return;
    }
    const newStaple: MockStaple = {
      id: `s-${Date.now()}`,
      name: item.name,
      emoji: null,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      mealSlot: 'BREAKFAST',
      autoLog: false,
      sortOrder: pinned.length,
    };
    setPinned(prev => [...prev, newStaple]);
    setActionLog(prev => [`📌 Pinned "${item.name}" as staple`, ...prev]);
  }, [pinned]);

  const unpin = useCallback((name: string) => {
    setPinned(prev => prev.filter(s => s.name.toLowerCase() !== name.toLowerCase()));
    setActionLog(prev => [`❌ Unpinned "${name}"`, ...prev]);
  }, []);

  const unpinById = useCallback((id: string) => {
    const staple = pinned.find(s => s.id === id);
    setPinned(prev => prev.filter(s => s.id !== id));
    if (staple) {
      setActionLog(prev => [`❌ Unpinned "${staple.name}"`, ...prev]);
    }
  }, [pinned]);

  const reset = useCallback(() => {
    setPinned(INITIAL_PINNED);
    setActionLog([]);
  }, []);

  return { foods, pinned, isPinned, pin, unpin, unpinById, actionLog, reset };
}

// ============================================
// OPTION A: Current Design (Bugs Fixed)
// Single pin icon, always visible when pinned, hover for unpinned
// ============================================
function OptionACurrent({ foods, pinned, isPinned, pin, unpin }: ReturnType<typeof usePinState>) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
      {/* Carousel area */}
      {pinned.length > 0 && (
        <div className="mx-3 mt-3 mb-1">
          <div className="relative rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/60 p-3 pt-5">
            <div className="absolute -top-2 left-3 z-10 flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded-full">
              <Pin className="w-3 h-3 text-[#FF6B6B]" />
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Staple</span>
            </div>
            <div className="text-center">
              <span className="text-sm font-medium text-gray-600">{pinned[0].emoji} {pinned[0].name}</span>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{pinned[0].calories} cal</span>
                <span className="text-xs text-blue-500">{pinned[0].protein}g P</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meal header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <span className="text-lg">☀️</span>
          <span className="font-semibold text-[#0F172A]">Breakfast</span>
        </div>
        <span className="text-sm text-[#94A3B8]">{foods.reduce((s, f) => s + f.calories, 0)} cal</span>
      </div>

      {/* Items */}
      <div className="p-2 space-y-1">
        {foods.map(item => {
          const itemPinned = isPinned(item.name);
          return (
            <div key={item.id} className="group flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl hover:bg-[#F1F5F9] transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-[#0F172A] truncate">{item.name}</span>
                  {item.isApproximate && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 bg-amber-100 rounded-full">
                      <AlertCircle className="w-3 h-3" />~
                    </span>
                  )}
                </div>
                {item.time && <div className="text-xs text-[#94A3B8]">{item.time}</div>}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-[#0F172A]">{item.calories} cal</div>
                  <div className="text-xs text-green-600">{item.protein}g P</div>
                </div>
                <div className="flex items-center gap-1">
                  {/* BUG REPRODUCTION: This is the current broken state —
                      single Pin icon for both pin/unpin, visually identical */}
                  {itemPinned ? (
                    <button
                      onClick={() => unpin(item.name)}
                      className="p-1.5 text-[#FF6B6B] hover:text-[#94A3B8] hover:bg-[#F1F5F9] rounded-lg transition-colors"
                      title="Unpin staple"
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => pin(item)}
                      className="p-1.5 text-[#94A3B8] hover:text-[#FF6B6B] hover:bg-[#FFE5E5] rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Pin as staple"
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button className="p-1.5 text-[#94A3B8] hover:text-[#64748B] hover:bg-[#E2E8F0] rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 text-[#94A3B8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// OPTION B: Coral Accent Row + Toggle Pin
// Pinned items get a subtle coral left border + coral tint.
// Pin icon is a TOGGLE — filled red when pinned, outline gray when not.
// Clear visual separation. Unpin = just click the same icon again.
// ============================================
function OptionBAccentRow({ foods, pinned, isPinned, pin, unpin }: ReturnType<typeof usePinState>) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
      {/* Carousel area */}
      {pinned.length > 0 && (
        <div className="mx-3 mt-3 mb-1">
          <div className="relative rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/60 p-3 pt-5">
            <div className="absolute -top-2 left-3 z-10 flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded-full">
              <Pin className="w-3 h-3 text-[#FF6B6B]" />
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Staple</span>
            </div>
            <div className="text-center">
              <span className="text-sm font-medium text-gray-600">{pinned[0].emoji} {pinned[0].name}</span>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{pinned[0].calories} cal</span>
                <span className="text-xs text-blue-500">{pinned[0].protein}g P</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <span className="text-lg">☀️</span>
          <span className="font-semibold text-[#0F172A]">Breakfast</span>
        </div>
        <span className="text-sm text-[#94A3B8]">{foods.reduce((s, f) => s + f.calories, 0)} cal</span>
      </div>

      <div className="p-2 space-y-1">
        {foods.map(item => {
          const itemPinned = isPinned(item.name);
          return (
            <div
              key={item.id}
              className={`group flex items-center justify-between p-3 rounded-xl transition-colors ${
                itemPinned
                  ? 'bg-[#FFF5F5] border-l-[3px] border-l-[#FF6B6B] hover:bg-[#FFE5E5]/60'
                  : 'bg-[#F8FAFC] hover:bg-[#F1F5F9]'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-[#0F172A] truncate">{item.name}</span>
                  {itemPinned && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-[#FF6B6B] bg-[#FFE5E5] rounded-full">
                      staple
                    </span>
                  )}
                  {item.isApproximate && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 bg-amber-100 rounded-full">
                      <AlertCircle className="w-3 h-3" />~
                    </span>
                  )}
                </div>
                {item.time && <div className="text-xs text-[#94A3B8]">{item.time}</div>}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-[#0F172A]">{item.calories} cal</div>
                  <div className="text-xs text-green-600">{item.protein}g P</div>
                </div>
                <div className="flex items-center gap-1">
                  {/* Pin toggle — always visible, visual state changes */}
                  <button
                    onClick={() => itemPinned ? unpin(item.name) : pin(item)}
                    className={`p-1.5 rounded-lg transition-all ${
                      itemPinned
                        ? 'text-[#FF6B6B] bg-[#FFE5E5] hover:bg-[#FFD5D5]'
                        : 'text-[#94A3B8] hover:text-[#FF6B6B] hover:bg-[#FFE5E5] opacity-0 group-hover:opacity-100'
                    }`}
                    title={itemPinned ? 'Unpin staple' : 'Pin as staple'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 text-[#94A3B8] hover:text-[#64748B] hover:bg-[#E2E8F0] rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 text-[#94A3B8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// OPTION C: Separate Pinned Section
// Pinned items grouped at top with their own header.
// Clear separation between "your staples" and "today's log".
// Unpin via dedicated PinOff icon. Pin via PinOff → Pin.
// ============================================
function OptionCSeparateSection({ foods, pinned, isPinned, pin, unpin, unpinById }: ReturnType<typeof usePinState>) {
  const unpinnedFoods = foods.filter(f => !isPinned(f.name));
  const pinnedFoods = foods.filter(f => isPinned(f.name));

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
      {/* Carousel area */}
      {pinned.length > 0 && (
        <div className="mx-3 mt-3 mb-1">
          <div className="relative rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/60 p-3 pt-5">
            <div className="absolute -top-2 left-3 z-10 flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded-full">
              <Pin className="w-3 h-3 text-[#FF6B6B]" />
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Staple</span>
            </div>
            <div className="text-center">
              <span className="text-sm font-medium text-gray-600">{pinned[0].emoji} {pinned[0].name}</span>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{pinned[0].calories} cal</span>
                <span className="text-xs text-blue-500">{pinned[0].protein}g P</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <span className="text-lg">☀️</span>
          <span className="font-semibold text-[#0F172A]">Breakfast</span>
        </div>
        <span className="text-sm text-[#94A3B8]">{foods.reduce((s, f) => s + f.calories, 0)} cal</span>
      </div>

      {/* Pinned section */}
      {pinnedFoods.length > 0 && (
        <div className="px-2 pt-2">
          <div className="flex items-center gap-1.5 px-2 mb-1">
            <Pin className="w-3 h-3 text-[#FF6B6B]" />
            <span className="text-[11px] font-semibold text-[#FF6B6B] uppercase tracking-wide">Pinned Staples</span>
          </div>
          <div className="space-y-1">
            {pinnedFoods.map(item => (
              <div
                key={item.id}
                className="group flex items-center justify-between p-3 bg-[#FFF5F5] rounded-xl hover:bg-[#FFE5E5]/60 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-[#0F172A] truncate">{item.name}</span>
                  {item.time && <div className="text-xs text-[#94A3B8]">{item.time}</div>}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-[#0F172A]">{item.calories} cal</div>
                    <div className="text-xs text-green-600">{item.protein}g P</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => unpin(item.name)}
                      className="p-1.5 text-[#FF6B6B] hover:text-[#94A3B8] hover:bg-white rounded-lg transition-colors"
                      title="Unpin staple"
                    >
                      <PinOff className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 text-[#94A3B8] hover:text-[#64748B] hover:bg-[#E2E8F0] rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 text-[#94A3B8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular items */}
      <div className="p-2 space-y-1">
        {pinnedFoods.length > 0 && unpinnedFoods.length > 0 && (
          <div className="flex items-center gap-1.5 px-2 mb-1 mt-1">
            <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">Today&apos;s Log</span>
          </div>
        )}
        {unpinnedFoods.map(item => (
          <div
            key={item.id}
            className="group flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl hover:bg-[#F1F5F9] transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-[#0F172A] truncate">{item.name}</span>
                {item.isApproximate && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 bg-amber-100 rounded-full">
                    <AlertCircle className="w-3 h-3" />~
                  </span>
                )}
              </div>
              {item.time && <div className="text-xs text-[#94A3B8]">{item.time}</div>}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-[#0F172A]">{item.calories} cal</div>
                <div className="text-xs text-green-600">{item.protein}g P</div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => pin(item)}
                  className="p-1.5 text-[#94A3B8] hover:text-[#FF6B6B] hover:bg-[#FFE5E5] rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Pin as staple"
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 text-[#94A3B8] hover:text-[#64748B] hover:bg-[#E2E8F0] rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 text-[#94A3B8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Main Page
// ============================================
type OptionKey = 'A' | 'B' | 'C';

const OPTION_META: Record<OptionKey, { title: string; desc: string }> = {
  A: {
    title: 'Option A: Current (Bugs Fixed)',
    desc: 'Single pin icon — red when pinned (click to unpin), gray on hover when not (click to pin). Minimal change from existing UI. Problem: pinned items look nearly identical to unpinned. Hard to scan at a glance.',
  },
  B: {
    title: 'Option B: Coral Accent Row + Toggle',
    desc: 'Pinned items get a coral left border, pink tint background, and a "staple" badge. Pin icon is always visible with a coral pill bg when pinned — acts as a clear toggle. Unpinned items show the pin icon on hover only. Easiest to distinguish at a glance.',
  },
  C: {
    title: 'Option C: Separate Pinned Section',
    desc: 'Pinned and unpinned items are physically separated under labeled headers. PinOff icon for unpin (distinct from Pin icon). Clearest structure but changes the layout of the meal section and adds visual weight.',
  },
};

export default function StaplesPinUXPage() {
  const [activeOption, setActiveOption] = useState<OptionKey>('B');
  const stateA = usePinState();
  const stateB = usePinState();
  const stateC = usePinState();

  const states = { A: stateA, B: stateB, C: stateC };
  const currentState = states[activeOption];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a href="/dev" className="text-sm text-[#94A3B8] hover:text-[#FF6B6B] mb-2 inline-block">← Back to Dev</a>
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Staples Pin/Unpin UX (#376)</h1>
          <p className="text-[#475569]">
            Testing how pinned vs unpinned food items look in the meal log, and how pin/unpin actions work.
            Each option has independent state — pin and unpin items to test the interactions.
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
          <h3 className="font-semibold text-[#0F172A] mb-1">{OPTION_META[activeOption].title}</h3>
          <p className="text-sm text-[#475569]">{OPTION_META[activeOption].desc}</p>
        </div>

        {/* Reset */}
        <div className="flex items-center justify-end mb-3">
          <button
            onClick={currentState.reset}
            className="text-xs text-[#94A3B8] hover:text-[#FF6B6B] transition-colors"
          >
            Reset to initial state
          </button>
        </div>

        {/* Demo */}
        <div className="mb-6">
          {activeOption === 'A' && <OptionACurrent {...stateA} />}
          {activeOption === 'B' && <OptionBAccentRow {...stateB} />}
          {activeOption === 'C' && <OptionCSeparateSection {...stateC} />}
        </div>

        {/* Action log */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] mb-6">
          <h4 className="font-semibold text-[#0F172A] mb-2 text-sm">Action Log</h4>
          {currentState.actionLog.length === 0 ? (
            <p className="text-xs text-[#94A3B8]">Interact with the items above — pin/unpin actions will appear here.</p>
          ) : (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {currentState.actionLog.map((log, i) => (
                <div key={i} className="text-xs text-[#475569] font-mono">{log}</div>
              ))}
            </div>
          )}
        </div>

        {/* Pinned state summary */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] mb-6">
          <h4 className="font-semibold text-[#0F172A] mb-2 text-sm">Current Pinned Staples ({currentState.pinned.length}/5)</h4>
          {currentState.pinned.length === 0 ? (
            <p className="text-xs text-[#94A3B8]">No staples pinned. Hover over a food item and click the pin icon.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {currentState.pinned.map(s => (
                <span key={s.id} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#FF6B6B] bg-[#FFE5E5] rounded-full">
                  <Pin className="w-3 h-3" />
                  {s.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Test Notes */}
        <div className="p-4 bg-[#FEF3C7]/50 rounded-xl border border-[#FEF3C7]">
          <h4 className="font-semibold text-[#92400E] mb-2">Test Notes</h4>
          <ul className="text-sm text-[#92400E] space-y-1">
            <li>• Can you instantly tell which items are pinned vs not?</li>
            <li>• Is it obvious how to unpin something?</li>
            <li>• Does the pin/unpin actually toggle correctly?</li>
            <li>• On mobile — are touch targets big enough?</li>
            <li>• Does the visual weight of pinned indicators feel right (not too loud, not too subtle)?</li>
            <li>• Greek Yogurt and Protein Shake start pinned. Try unpinning one, then re-pinning it.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
