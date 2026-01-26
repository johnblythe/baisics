'use client';

/**
 * UX Demo Page - Food Logging Improvements
 * Real component mockups for review before PRD
 */

import { useState } from 'react';
import {
  Plus,
  Search,
  ChevronDown,
  Copy,
  Calendar,
  X,
  Star,
  Clock,
  Check,
  Utensils,
  Coffee,
  Sun,
  Moon,
  Cookie
} from 'lucide-react';

export default function UXDemoPage() {
  const [activeSection, setActiveSection] = useState<'A' | 'B' | 'C'>('A');

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Food Logging UX Proposals</h1>
        <p className="text-gray-600 mb-8">Real component mockups - review and correct before PRD</p>

        {/* Section Tabs */}
        <div className="flex gap-2 mb-8">
          {(['A', 'B', 'C'] as const).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeSection === section
                  ? 'bg-[#FF6B6B] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {section === 'A' && 'A) Fix Broken Stuff'}
              {section === 'B' && 'B) Recipes/Meals'}
              {section === 'C' && 'C) Copy Previous Day'}
            </button>
          ))}
        </div>

        {activeSection === 'A' && <SectionA />}
        {activeSection === 'B' && <SectionB />}
        {activeSection === 'C' && <SectionC />}
      </div>
    </div>
  );
}

/* ============================================
   SECTION A: Fix Broken Stuff
   ============================================ */

function SectionA() {
  return (
    <div className="space-y-12">
      {/* A1: + Add Buttons */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">A1: &quot;+ Add&quot; Buttons</h2>
        <p className="text-gray-600 mb-6">Currently dead. Proposed: opens inline search scoped to that meal.</p>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="text-sm font-semibold text-red-600 mb-3">❌ CURRENT (buttons do nothing)</div>
            <MealSectionMock_Current />
          </div>
          <div>
            <div className="text-sm font-semibold text-green-600 mb-3">✅ PROPOSED (inline search)</div>
            <MealSectionMock_Proposed />
          </div>
        </div>
      </div>

      {/* A2: Weekly % Bug */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">A2: Weekly Strip Shows 0%</h2>
        <p className="text-gray-600 mb-6">Shows 0% even with logged food. Fix calculation + show protein.</p>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="text-sm font-semibold text-red-600 mb-3">❌ CURRENT</div>
            <WeeklyStripMock_Current />
          </div>
          <div>
            <div className="text-sm font-semibold text-green-600 mb-3">✅ PROPOSED</div>
            <WeeklyStripMock_Proposed />
          </div>
        </div>
      </div>

      {/* A3: Remaining Confusion */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">A3: &quot;Remaining&quot; is Confusing</h2>
        <p className="text-gray-600 mb-6">Looks like a total, not what&apos;s left. Options: clarify, separate, or remove.</p>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-sm font-semibold text-red-600 mb-3">❌ CURRENT</div>
            <ProgressCardMock_Current />
          </div>
          <div>
            <div className="text-sm font-semibold text-blue-600 mb-3">OPTION 1: Inline remaining</div>
            <ProgressCardMock_Option1 />
          </div>
          <div>
            <div className="text-sm font-semibold text-green-600 mb-3">OPTION 2: Remove it</div>
            <ProgressCardMock_Option2 />
          </div>
        </div>
      </div>
    </div>
  );
}

function MealSectionMock_Current() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Coffee className="w-5 h-5 text-gray-400" />
          <span className="font-semibold text-gray-900">Breakfast</span>
        </div>
        <button className="text-[#FF6B6B] text-sm font-medium flex items-center gap-1 opacity-50 cursor-not-allowed">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
        <button className="text-[#FF6B6B]/50 cursor-not-allowed">+ Add breakfast</button>
      </div>
      <p className="text-xs text-red-500 mt-2 text-center">↑ These buttons don&apos;t work</p>
    </div>
  );
}

function MealSectionMock_Proposed() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Coffee className="w-5 h-5 text-amber-500" />
          <span className="font-semibold text-gray-900">Breakfast</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-[#FF6B6B] text-sm font-medium flex items-center gap-1 hover:text-[#EF5350]"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {!isOpen ? (
        <div
          className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-[#FF6B6B] hover:bg-red-50/30 transition-all"
          onClick={() => setIsOpen(true)}
        >
          <button className="text-[#FF6B6B]">+ Add breakfast</button>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search foods..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B]"
                autoFocus
              />
            </div>
          </div>

          <div className="p-2">
            <div className="text-xs font-semibold text-gray-500 px-2 py-1">MY RECIPES</div>
            <div className="hover:bg-gray-50 rounded-lg p-2 cursor-pointer flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>🥤</span>
                <div>
                  <div className="text-sm font-medium">Morning Protein Shake</div>
                  <div className="text-xs text-gray-500">297 cal · 45g P</div>
                </div>
              </div>
              <button className="text-xs bg-[#FF6B6B] text-white px-2 py-1 rounded">Add</button>
            </div>

            <div className="text-xs font-semibold text-gray-500 px-2 py-1 mt-2">RECENT</div>
            <div className="hover:bg-gray-50 rounded-lg p-2 cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Your Foods</span>
                <span className="text-sm">Greek Yogurt</span>
              </div>
              <div className="text-xs text-gray-500 ml-6">118 cal · 22g P</div>
            </div>
          </div>

          <div className="p-2 border-t border-gray-100">
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-gray-500 hover:text-gray-700 w-full text-center py-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function WeeklyStripMock_Current() {
  const days = ['F', 'S', 'S', 'M', 'T', 'W', 'T'];
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div className="flex gap-1">
            {days.map((d, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  i === 6 ? 'bg-[#FF6B6B] text-white' : 'text-gray-400'
                }`}
              >
                {d}
              </div>
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">0% avg · 1/7</span>
        </div>
      </div>
      <div className="flex gap-1">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="flex-1 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
            —
          </div>
        ))}
        <div className="flex-1 h-16 bg-red-50 border-2 border-red-200 rounded-lg flex flex-col items-center justify-center">
          <span className="text-red-400 font-semibold">0%</span>
          <span className="text-red-300 text-xs">0g P</span>
        </div>
      </div>
      <p className="text-xs text-red-500 mt-2 text-center">↑ Shows 0% but sidebar shows 22g protein logged</p>
    </div>
  );
}

function WeeklyStripMock_Proposed() {
  const days = ['F', 'S', 'S', 'M', 'T', 'W', 'T'];
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#FF6B6B]" />
          <div className="flex gap-1">
            {days.map((d, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  i === 6 ? 'bg-[#FF6B6B] text-white' : 'text-gray-400'
                }`}
              >
                {d}
              </div>
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">15% avg · 1/7 logged</span>
        </div>
      </div>
      <div className="flex gap-1">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="flex-1 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
            —
          </div>
        ))}
        <div className="flex-1 h-16 bg-green-50 border-2 border-green-300 rounded-lg flex flex-col items-center justify-center">
          <span className="text-green-600 font-semibold">15%</span>
          <span className="text-green-500 text-xs">22g P</span>
        </div>
      </div>
      <p className="text-xs text-green-600 mt-2 text-center">✓ Shows actual % of protein goal (22/150)</p>
    </div>
  );
}

function ProgressCardMock_Current() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        📈 Today&apos;s Progress
      </h3>

      <div className="space-y-3">
        <MacroRow label="Calories" current={178} goal={2000} color="bg-red-400" />
        <MacroRow label="Protein" current={22} goal={150} color="bg-green-400" unit="g" />
        <MacroRow label="Carbs" current={20} goal={250} color="bg-amber-400" unit="g" />
        <MacroRow label="Fat" current={1} goal={65} color="bg-blue-400" unit="g" />
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="text-gray-500 text-sm">Remaining</div>
        <div className="text-xl font-bold text-gray-900">1822 cal · 128g P</div>
      </div>
      <p className="text-xs text-red-500 mt-2">↑ Looks like a total, not &quot;left to eat&quot;</p>
    </div>
  );
}

function ProgressCardMock_Option1() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        📈 Today&apos;s Progress
      </h3>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Calories</span>
            <span className="font-medium">178 / 2000</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-red-400 rounded-full" style={{width: '9%'}} />
          </div>
          <div className="text-xs text-gray-400 mt-0.5 text-right">1822 left</div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Protein</span>
            <span className="font-medium text-green-600">22g / 150g</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-400 rounded-full" style={{width: '15%'}} />
          </div>
          <div className="text-xs text-gray-400 mt-0.5 text-right">128g left</div>
        </div>
      </div>
      <p className="text-xs text-blue-600 mt-4">Inline &quot;left&quot; under each bar</p>
    </div>
  );
}

function ProgressCardMock_Option2() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        📈 Today&apos;s Progress
      </h3>

      <div className="space-y-3">
        <MacroRow label="Calories" current={178} goal={2000} color="bg-red-400" />
        <MacroRow label="Protein" current={22} goal={150} color="bg-green-400" unit="g" />
        <MacroRow label="Carbs" current={20} goal={250} color="bg-amber-400" unit="g" />
        <MacroRow label="Fat" current={1} goal={65} color="bg-blue-400" unit="g" />
      </div>
      <p className="text-xs text-green-600 mt-4">✓ Remove &quot;Remaining&quot; - bars tell the story</p>
    </div>
  );
}

function MacroRow({ label, current, goal, color, unit = '' }: { label: string; current: number; goal: number; color: string; unit?: string }) {
  const pct = Math.min(100, (current / goal) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{current}{unit} / {goal}{unit}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{width: `${pct}%`}} />
      </div>
    </div>
  );
}

/* ============================================
   SECTION B: Recipes/Meals
   ============================================ */

function SectionB() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">B1: Create Recipe</h2>
        <p className="text-gray-600 mb-6">Combine multiple foods into a reusable combo. One-click to log.</p>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="text-sm font-semibold text-gray-600 mb-3">Entry point: Sidebar</div>
            <RecipeSidebarMock onCreateClick={() => setShowCreateModal(true)} />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-600 mb-3">Create recipe modal</div>
            <CreateRecipeModalMock isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">B2: Use Recipe When Adding Food</h2>
        <p className="text-gray-600 mb-6">Recipes appear at top of add dropdown for one-click logging.</p>

        <div className="max-w-md">
          <AddFoodDropdownWithRecipes />
        </div>
      </div>
    </div>
  );
}

function RecipeSidebarMock({ onCreateClick }: { onCreateClick: () => void }) {
  const recipes = [
    { emoji: '🥤', name: 'Morning Protein Shake', cal: 297, protein: 45 },
    { emoji: '🥗', name: 'Lunch Salad', cal: 450, protein: 35 },
    { emoji: '🍝', name: 'Pasta Night', cal: 680, protein: 28 },
  ];

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Utensils className="w-4 h-4 text-[#FF6B6B]" />
          My Recipes
        </h3>
        <button
          onClick={onCreateClick}
          className="w-6 h-6 bg-[#FF6B6B] text-white rounded-full flex items-center justify-center hover:bg-[#EF5350]"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        {recipes.map((r, i) => (
          <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer group">
            <div className="flex items-center gap-2">
              <span className="text-lg">{r.emoji}</span>
              <div>
                <div className="text-sm font-medium text-gray-900">{r.name}</div>
                <div className="text-xs text-gray-500">{r.cal} cal · {r.protein}g P</div>
              </div>
            </div>
            <button className="opacity-0 group-hover:opacity-100 text-xs bg-[#FF6B6B] text-white px-2 py-1 rounded transition-opacity">
              + Add
            </button>
          </div>
        ))}
      </div>

      <button className="w-full text-sm text-[#FF6B6B] mt-3 py-2 hover:bg-red-50 rounded-lg transition-colors">
        View All Recipes →
      </button>
    </div>
  );
}

function CreateRecipeModalMock({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const ingredients = [
    { name: 'Greek Yogurt, nonfat', amount: '200g', cal: 118, protein: 22 },
    { name: 'Blueberries', amount: '40g', cal: 23, protein: 0 },
    { name: 'Banana', amount: '40g', cal: 36, protein: 0 },
    { name: 'Whey Protein (Vanilla)', amount: '1 scoop', cal: 120, protein: 24 },
  ];

  const totalCal = ingredients.reduce((s, i) => s + i.cal, 0);
  const totalProtein = ingredients.reduce((s, i) => s + i.protein, 0);

  if (!isOpen) {
    return (
      <div className="bg-gray-100 rounded-xl p-8 border-2 border-dashed border-gray-300 flex items-center justify-center">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          Click &quot;+&quot; on sidebar to see modal →
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Create Recipe</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex gap-3">
          <button className="w-12 h-12 bg-gray-100 rounded-lg text-2xl hover:bg-gray-200">🥤</button>
          <input
            type="text"
            defaultValue="Morning Protein Shake"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B]"
          />
        </div>

        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Ingredients</div>
          <div className="relative mb-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search to add ingredient..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B]"
            />
          </div>

          <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex items-center justify-between p-3">
                <div>
                  <div className="text-sm font-medium text-gray-900">{ing.name}</div>
                  <div className="text-xs text-gray-500">{ing.amount}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium">{ing.cal} cal</div>
                    <div className="text-xs text-green-600">{ing.protein}g P</div>
                  </div>
                  <button className="text-gray-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total</span>
            <div className="text-right">
              <span className="font-bold text-lg">{totalCal} cal</span>
              <span className="text-green-600 ml-2">{totalProtein}g P</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50">
        <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">
          Cancel
        </button>
        <button className="flex-1 px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350]">
          Save Recipe
        </button>
      </div>
    </div>
  );
}

function AddFoodDropdownWithRecipes() {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Coffee className="w-4 h-4" />
          Adding to <span className="font-semibold text-gray-900">Breakfast</span>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search foods..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B]"
          />
        </div>
      </div>

      <div className="p-2">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="text-xs font-semibold text-gray-500">MY RECIPES</div>
          <button className="text-xs text-[#FF6B6B]">+ New</button>
        </div>

        <div className="space-y-1">
          <div className="hover:bg-[#FF6B6B]/5 rounded-lg p-2 cursor-pointer border-2 border-transparent hover:border-[#FF6B6B]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🥤</span>
                <div>
                  <div className="text-sm font-medium text-gray-900">Morning Protein Shake</div>
                  <div className="text-xs text-gray-500">297 cal · 45g P · 4 items</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200">½</button>
                <button className="text-xs bg-[#FF6B6B] text-white px-2 py-1 rounded hover:bg-[#EF5350]">Add</button>
              </div>
            </div>
          </div>

          <div className="hover:bg-gray-50 rounded-lg p-2 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🥣</span>
                <div>
                  <div className="text-sm font-medium text-gray-900">Overnight Oats</div>
                  <div className="text-xs text-gray-500">380 cal · 15g P · 5 items</div>
                </div>
              </div>
              <button className="text-xs bg-[#FF6B6B] text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100">Add</button>
            </div>
          </div>
        </div>

        <div className="text-xs font-semibold text-gray-500 px-2 py-1 mt-3">RECENT FOODS</div>
        <div className="hover:bg-gray-50 rounded-lg p-2 cursor-pointer">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Your Foods</span>
            <span className="text-sm">Greek Yogurt</span>
            <span className="text-xs text-gray-400 ml-auto">118 cal</span>
          </div>
        </div>
        <div className="hover:bg-gray-50 rounded-lg p-2 cursor-pointer">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">USDA</span>
            <span className="text-sm">Eggs, scrambled</span>
            <span className="text-xs text-gray-400 ml-auto">147 cal</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   SECTION C: Copy Previous Day
   ============================================ */

function SectionC() {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">C1: Copy Single Meal</h2>
        <p className="text-gray-600 mb-6">Empty meal shows option to copy from yesterday.</p>

        <div className="max-w-md">
          <CopyMealMock />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">C2: Copy Entire Day</h2>
        <p className="text-gray-600 mb-6">Top-level action to copy all meals from a previous day.</p>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="text-sm font-semibold text-gray-600 mb-3">Menu trigger</div>
            <CopyDayMenuMock />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-600 mb-3">Selection modal</div>
            <CopyDayModalMock />
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyMealMock() {
  const [copied, setCopied] = useState(false);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-500" />
          <span className="font-semibold text-gray-900">Lunch</span>
        </div>
        <button className="text-[#FF6B6B] text-sm font-medium flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {!copied ? (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
          <div className="text-center mb-3">
            <button className="text-[#FF6B6B]">+ Add lunch</button>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="flex-1 h-px bg-gray-200" />
            <span>or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <button
            onClick={() => setCopied(true)}
            className="w-full mt-3 flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 py-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy from yesterday
            <span className="text-gray-400">(475 cal)</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Chicken Breast</span>
            </div>
            <span className="text-sm text-gray-600">280 cal</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Rice, white</span>
            </div>
            <span className="text-sm text-gray-600">195 cal</span>
          </div>
          <p className="text-xs text-green-600 text-center mt-2">✓ Copied from yesterday</p>
        </div>
      )}
    </div>
  );
}

function CopyDayMenuMock() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold text-gray-900">Wednesday, Jan 22</div>
          <div className="text-sm text-gray-500">Today</div>
        </div>
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="w-8 h-8 hover:bg-gray-100 rounded-lg flex items-center justify-center"
          >
            <span className="text-gray-400">⋯</span>
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                <Copy className="w-4 h-4 text-gray-400" />
                Copy from...
                <ChevronDown className="w-3 h-3 text-gray-400 ml-auto -rotate-90" />
              </button>
              <div className="pl-8 bg-gray-50">
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100">Yesterday</button>
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Pick a date...
                </button>
              </div>
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <X className="w-4 h-4" />
                  Clear today&apos;s log
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CopyDayModalMock() {
  const meals = [
    { icon: Coffee, name: 'Breakfast', cal: 297, checked: true },
    { icon: Sun, name: 'Lunch', cal: 475, checked: true },
    { icon: Moon, name: 'Dinner', cal: 680, checked: false },
    { icon: Cookie, name: 'Snacks', cal: 150, checked: false },
  ];

  const total = meals.filter(m => m.checked).reduce((s, m) => s + m.cal, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Copy from Tuesday?</h3>
        <p className="text-sm text-gray-500">Select meals to copy to today</p>
      </div>

      <div className="p-4 space-y-2">
        {meals.map((meal, i) => (
          <label key={i} className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${meal.checked ? 'bg-[#FF6B6B]/5 border-2 border-[#FF6B6B]/20' : 'bg-gray-50 border-2 border-transparent'}`}>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked={meal.checked}
                className="w-4 h-4 text-[#FF6B6B] rounded focus:ring-[#FF6B6B]"
              />
              <meal.icon className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-900">{meal.name}</span>
            </div>
            <span className="text-sm text-gray-500">{meal.cal} cal</span>
          </label>
        ))}
      </div>

      <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50">
        <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">
          Cancel
        </button>
        <button className="flex-1 px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350]">
          Copy ({total} cal)
        </button>
      </div>
    </div>
  );
}
