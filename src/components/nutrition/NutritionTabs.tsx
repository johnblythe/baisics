'use client';

import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Utensils, TrendingUp, BookOpen } from 'lucide-react';

type TabValue = 'log' | 'history' | 'recipes';

interface NutritionTabsProps {
  /**
   * Override active tab for local state control (e.g., Log/History toggle on /nutrition)
   * If not provided, uses route-based detection
   */
  activeTab?: TabValue;
  /**
   * Callback when tab is clicked (for local state control)
   */
  onTabChange?: (tab: TabValue) => void;
}

const tabs = [
  { value: 'log' as const, label: 'Log Food', icon: Utensils, href: '/nutrition' },
  { value: 'history' as const, label: 'History', icon: TrendingUp, href: '/nutrition?view=history' },
  { value: 'recipes' as const, label: 'Recipes', icon: BookOpen, href: '/nutrition/recipes' },
];

// Inner component that uses useSearchParams (must be wrapped in Suspense)
function NutritionTabsInner({ activeTab, onTabChange }: NutritionTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Determine active tab from route if not explicitly set
  const getActiveTab = (): TabValue => {
    if (activeTab) return activeTab;

    if (pathname === '/nutrition/recipes') return 'recipes';

    // On /nutrition page, check query param for history view
    if (pathname === '/nutrition') {
      const view = searchParams.get('view');
      if (view === 'history') return 'history';
      return 'log';
    }

    return 'log';
  };

  const currentTab = getActiveTab();

  const handleTabClick = (tab: typeof tabs[number], e: React.MouseEvent) => {
    // If we have a local state handler and it's log/history on the nutrition page
    if (onTabChange && (tab.value === 'log' || tab.value === 'history') && pathname === '/nutrition') {
      e.preventDefault();
      onTabChange(tab.value);
    }
    // Otherwise, let the Link navigate naturally
  };

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-1 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.value;

            return (
              <Link
                key={tab.value}
                href={tab.href}
                onClick={(e) => handleTabClick(tab, e)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#0F172A] text-white'
                    : 'bg-transparent text-[#64748B] hover:bg-[#F8FAFC]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Wrapper with Suspense boundary for useSearchParams
export function NutritionTabs(props: NutritionTabsProps) {
  return (
    <Suspense fallback={
      <div className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <div
                  key={tab.value}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-transparent text-[#94A3B8]"
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    }>
      <NutritionTabsInner {...props} />
    </Suspense>
  );
}
