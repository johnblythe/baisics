'use client';

/**
 * UX Demo Page - Food Logging Improvements
 *
 * This page shows proposed UX for:
 * A) Fix broken stuff (+ Add buttons, weekly %, remaining clarity)
 * B) Recipe/Meals feature
 * C) Copy from previous day
 */

import { useState } from 'react';

export default function UXDemoPage() {
  const [activeSection, setActiveSection] = useState<'A' | 'B' | 'C'>('A');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Food Logging UX Proposals</h1>
        <p className="text-gray-600 mb-8">Review and correct before PRD creation</p>

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

        {/* Section A: Fix Broken Stuff */}
        {activeSection === 'A' && (
          <div className="space-y-8">
            {/* Issue 1: + Add Buttons */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">A1: "+ Add" Buttons Don&apos;t Work</h2>

              <div className="grid grid-cols-2 gap-8">
                {/* Current */}
                <div>
                  <h3 className="text-sm font-semibold text-red-600 mb-3">❌ CURRENT</h3>
                  <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm whitespace-pre">
{`┌─────────────────────────────────────┐
│  Breakfast           [+ Add] ← dead │
│  ─────────────────────────────────  │
│  (empty)                            │
│  ┌─────────────────────────────┐    │
│  │  + Add breakfast  ← also dead│   │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘

Problem: Both buttons do nothing.
User has to use sidebar search,
then it defaults to time-based meal.`}
                  </div>
                </div>

                {/* Proposed */}
                <div>
                  <h3 className="text-sm font-semibold text-green-600 mb-3">✅ PROPOSED</h3>
                  <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm whitespace-pre">
{`┌─────────────────────────────────────┐
│  Breakfast                  [+ Add] │
│  ─────────────────────────────────  │
│                                     │
│  Click → Opens inline search:       │
│  ┌─────────────────────────────┐    │
│  │ 🔍 Search foods...          │    │
│  │ ─────────────────────────── │    │
│  │ 🍳 Eggs (Your Foods)        │    │
│  │ 🥣 Oatmeal (USDA)           │    │
│  │ ─────────────────────────── │    │
│  │ [My Recipes ▼]              │    │
│  │   Morning Shake             │    │
│  │   Overnight Oats            │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘

- Meal is pre-selected (Breakfast)
- Shows recipes for quick combo add
- Search scoped to that meal section`}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Implementation:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Wire onClick to open inline search panel within that meal section</li>
                  <li>• Pass meal type to search so added food goes to correct meal</li>
                  <li>• Show user&apos;s recipes at top for one-click combo add</li>
                </ul>
              </div>
            </div>

            {/* Issue 2: Weekly % Wrong */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">A2: Weekly Strip Shows 0% Despite Logged Food</h2>

              <div className="grid grid-cols-2 gap-8">
                {/* Current */}
                <div>
                  <h3 className="text-sm font-semibold text-red-600 mb-3">❌ CURRENT</h3>
                  <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm whitespace-pre">
{`┌────────────────────────────────────┐
│  F   S   S   M   T   W   T         │
│ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐       │
│ │-│ │-│ │-│ │-│ │-│ │-│ │0%│ ← BUG│
│ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘       │
│ 1/16    ...              1/22      │
│                                    │
│ 0% avg · 1/7                       │
└────────────────────────────────────┘

Shows 0% even though:
- Sidebar shows 178/2000 cal
- Protein shows 22.4g/150g`}
                  </div>
                </div>

                {/* Proposed */}
                <div>
                  <h3 className="text-sm font-semibold text-green-600 mb-3">✅ PROPOSED</h3>
                  <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm whitespace-pre">
{`┌────────────────────────────────────┐
│  F   S   S   M   T   W   T         │
│ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌───┐     │
│ │-│ │-│ │-│ │-│ │-│ │-│ │ 9%│     │
│ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ │22g│     │
│ 1/16    ...              └───┘     │
│                          1/22      │
│ 9% avg · 1/7 logged                │
└────────────────────────────────────┘

Fix: Calculate % based on:
- calories logged / calorie goal
- OR protein logged / protein goal
- Show actual protein grams in box`}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Investigation needed:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Check WeeklyStrip component - is it using stale data?</li>
                  <li>• Check API /daily-summary - is it returning correct compliance?</li>
                  <li>• Likely: component not refreshing after food logged</li>
                </ul>
              </div>
            </div>

            {/* Issue 3: Remaining Confusing */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">A3: &quot;Remaining&quot; Looks Like Total</h2>

              <div className="grid grid-cols-2 gap-8">
                {/* Current */}
                <div>
                  <h3 className="text-sm font-semibold text-red-600 mb-3">❌ CURRENT</h3>
                  <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm whitespace-pre">
{`┌─────────────────────────────┐
│  📈 Today's Progress        │
│                             │
│  Calories      178 / 2000   │
│  ████░░░░░░░░░░░░░░░░░░░░   │
│                             │
│  Protein       22.4g / 150g │
│  ████████░░░░░░░░░░░░░░░░   │
│                             │
│  Carbs         19.6g / 250g │
│  ███░░░░░░░░░░░░░░░░░░░░░   │
│                             │
│  Fat           1.4g / 65g   │
│  █░░░░░░░░░░░░░░░░░░░░░░░   │
│                             │
│  Remaining                  │
│  1822 cal · 127.6g P        │ ← Huh?
└─────────────────────────────┘

Problem: "Remaining" at bottom
looks like a total/summary, not
"what's left to eat today"`}
                  </div>
                </div>

                {/* Proposed */}
                <div>
                  <h3 className="text-sm font-semibold text-green-600 mb-3">✅ PROPOSED</h3>
                  <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm whitespace-pre">
{`Option 1: Flip the framing
┌─────────────────────────────┐
│  📈 Today's Progress        │
│                             │
│  Calories      178 / 2000   │
│  ████░░░░░░░░░░░░░░░░░░░░   │
│        ↑ 1822 left          │
│  ...                        │
└─────────────────────────────┘

Option 2: Separate card
┌─────────────────────────────┐
│  🎯 Still to Go             │
│  ─────────────────────────  │
│  1822 cal · 128g protein    │
│  230g carbs · 64g fat       │
└─────────────────────────────┘

Option 3: Remove entirely
- Progress bars tell the story
- "Remaining" adds confusion
- Just show consumed vs goal`}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">My recommendation: Option 3</h4>
                <p className="text-sm text-yellow-800">
                  The progress bars already show consumed/goal. &quot;Remaining&quot; is redundant math
                  that users can do themselves. Remove it to reduce cognitive load.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section B: Recipes/Meals */}
        {activeSection === 'B' && (
          <div className="space-y-8">
            {/* Recipe Creation */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">B1: Create Recipe / Meal Combo</h2>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">User Story:</h4>
                <p className="text-gray-700 italic">
                  &quot;I eat Greek yogurt + blueberries + banana + protein powder most mornings.
                  I don&apos;t want to add 4 items every time.&quot;
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* Creation Flow */}
                <div>
                  <h3 className="text-sm font-semibold text-blue-600 mb-3">📝 CREATE RECIPE</h3>
                  <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm whitespace-pre">
{`┌─────────────────────────────────────┐
│  Create Recipe                   X  │
│  ─────────────────────────────────  │
│                                     │
│  Name: [Morning Protein Shake    ]  │
│  Emoji: [🥤 ▼]                      │
│                                     │
│  ─────────────────────────────────  │
│  Ingredients:                       │
│                                     │
│  🔍 [Search to add ingredient...]   │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Greek Yogurt     200g   118cal│  │
│  │                     [- ] [+] │   │
│  ├─────────────────────────────┤    │
│  │ Blueberries       40g    23cal│  │
│  │                     [- ] [+] │   │
│  ├─────────────────────────────┤    │
│  │ Banana            40g    36cal│  │
│  │                     [- ] [+] │   │
│  ├─────────────────────────────┤    │
│  │ Whey Protein     1 scoop 120cal│ │
│  │                     [- ] [+] │   │
│  └─────────────────────────────┘    │
│                                     │
│  ─────────────────────────────────  │
│  TOTAL: 297 cal · 45g P · 28g C     │
│                                     │
│  [ Cancel ]          [ Save Recipe ]│
└─────────────────────────────────────┘`}
                  </div>
                </div>

                {/* Usage Flow */}
                <div>
                  <h3 className="text-sm font-semibold text-green-600 mb-3">⚡ USE RECIPE</h3>
                  <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm whitespace-pre">
{`From "+ Add Breakfast" dropdown:
┌─────────────────────────────────────┐
│  Add to Breakfast              X    │
│  ─────────────────────────────────  │
│  🔍 [Search foods...]               │
│                                     │
│  MY RECIPES                    [+]  │
│  ┌─────────────────────────────┐    │
│  │ 🥤 Morning Protein Shake    │    │
│  │    297 cal · 45g P          │    │
│  │               [Add ▼]       │    │
│  │    └─ [Full] [½] [Custom]   │    │
│  ├─────────────────────────────┤    │
│  │ 🥗 Lunch Salad              │    │
│  │    450 cal · 35g P          │    │
│  └─────────────────────────────┘    │
│                                     │
│  RECENT FOODS                       │
│  ┌─────────────────────────────┐    │
│  │ Chicken Breast   170g  280cal│   │
│  │ Rice, white      150g  195cal│   │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘

One click: adds whole recipe
Can also add ½ serving or custom`}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Key features:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Recipes show at TOP of add dropdown (most valuable)</li>
                  <li>• One-click adds all ingredients at once</li>
                  <li>• Partial servings (½, custom multiplier)</li>
                  <li>• [+] button to create new recipe inline</li>
                  <li>• Ingredients are expandable if user wants to see breakdown</li>
                </ul>
              </div>
            </div>

            {/* Entry Point */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">B2: Recipe Entry Points</h2>

              <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm whitespace-pre">
{`Where can user create/access recipes?

1. From "+ Add [Meal]" dropdown
   - "My Recipes" section at top
   - [+] button to create new

2. From sidebar (new section)
   ┌─────────────────────────────┐
   │  📖 My Recipes         [+]  │
   │  ─────────────────────────  │
   │  🥤 Morning Shake    297cal │
   │  🥗 Lunch Salad      450cal │
   │  🍝 Pasta Night      680cal │
   │  ─────────────────────────  │
   │  [View All Recipes]         │
   └─────────────────────────────┘

3. After logging multiple foods
   ┌─────────────────────────────────┐
   │  You logged 4 items together.   │
   │  [Save as Recipe?]              │
   └─────────────────────────────────┘

4. Dedicated /nutrition/recipes page
   - Full CRUD for recipes
   - Import from friends? (future)`}
              </div>
            </div>
          </div>
        )}

        {/* Section C: Copy Previous Day */}
        {activeSection === 'C' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">C1: Copy from Previous Day</h2>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">User Story:</h4>
                <p className="text-gray-700 italic">
                  &quot;I meal prep and eat the same lunch Mon-Fri. Why am I entering it 5 times?&quot;
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* Copy Meal */}
                <div>
                  <h3 className="text-sm font-semibold text-blue-600 mb-3">📋 COPY SINGLE MEAL</h3>
                  <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm whitespace-pre">
{`On empty meal section:
┌─────────────────────────────────────┐
│  Lunch                      [+ Add] │
│  ─────────────────────────────────  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  + Add lunch                  │  │
│  │                               │  │
│  │  ── or ──                     │  │
│  │                               │  │
│  │  📋 Copy from yesterday       │  │
│  │     Chicken + Rice (475 cal)  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘

Click "Copy from yesterday" →
Pre-fills with yesterday's lunch items
User can edit before confirming`}
                  </div>
                </div>

                {/* Copy Day */}
                <div>
                  <h3 className="text-sm font-semibold text-green-600 mb-3">📅 COPY ENTIRE DAY</h3>
                  <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm whitespace-pre">
{`Top of page action:
┌─────────────────────────────────────┐
│  Wednesday, Jan 22      [···]       │
│  ─────────────────────────────────  │
│                                     │
│  [···] menu:                        │
│  ┌───────────────────────────┐      │
│  │  📋 Copy from...          │      │
│  │     └─ Yesterday          │      │
│  │     └─ Pick a date...     │      │
│  │  ─────────────────────────│      │
│  │  🗑️  Clear today's log     │      │
│  └───────────────────────────┘      │
└─────────────────────────────────────┘

"Copy from yesterday" →
┌─────────────────────────────────────┐
│  Copy from Tuesday?                 │
│  ─────────────────────────────────  │
│  ☑️ Breakfast (297 cal)             │
│  ☑️ Lunch (475 cal)                 │
│  ☐ Dinner (680 cal)                 │
│  ☐ Snacks (150 cal)                 │
│  ─────────────────────────────────  │
│  [ Cancel ]           [ Copy (772) ]│
└─────────────────────────────────────┘

Can select which meals to copy`}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Implementation notes:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Copies create NEW FoodLogEntry records (not references)</li>
                  <li>• User can edit copied entries independently</li>
                  <li>• Show preview of what will be copied before confirming</li>
                  <li>• &quot;Pick a date&quot; opens calendar to copy from any past day</li>
                </ul>
              </div>
            </div>

            {/* Quick Wins */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">C2: Quick Copy Actions</h2>

              <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm whitespace-pre">
{`Other copy shortcuts:

1. On any logged food item (hover):
   ┌─────────────────────────────────┐
   │ Chicken Breast  170g    280 cal │
   │ 11:30 AM            [✏️] [📋] [🗑️]│
   └─────────────────────────────────┘
                           ↑
                    Copy to today

2. From weekly strip (click past day):
   "View" | "Copy to today"

3. Keyboard shortcut:
   Cmd+Shift+Y = Copy yesterday's log`}
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="mt-12 bg-gray-900 rounded-xl p-6 text-white">
          <h2 className="text-xl font-bold mb-4">Summary: Friction Reduction</h2>
          <div className="grid grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-[#FF6B6B] mb-2">A) Broken Stuff</h3>
              <ul className="space-y-1 text-gray-300">
                <li>• Wire + Add buttons</li>
                <li>• Fix weekly % calc</li>
                <li>• Clarify/remove &quot;Remaining&quot;</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[#FF6B6B] mb-2">B) Recipes</h3>
              <ul className="space-y-1 text-gray-300">
                <li>• Create combos (1x setup)</li>
                <li>• One-click add (daily use)</li>
                <li>• Biggest friction win</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[#FF6B6B] mb-2">C) Copy Previous</h3>
              <ul className="space-y-1 text-gray-300">
                <li>• Copy meal from yesterday</li>
                <li>• Copy full day</li>
                <li>• Select which meals</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-gray-400">
              <strong className="text-white">Your breakfast example:</strong> Currently 4 items × every day = friction.
              With recipes: 1 click × every day = done.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
