'use client';

import { Scale, TrendingUp } from 'lucide-react';

export type PulseTab = 'log' | 'history';

interface PulseTabsProps {
  activeTab: PulseTab;
  onTabChange: (tab: PulseTab) => void;
}

const tabs = [
  { value: 'log' as const, label: 'Log', icon: Scale },
  { value: 'history' as const, label: 'History', icon: TrendingUp },
];

export function PulseTabs({ activeTab, onTabChange }: PulseTabsProps) {
  return (
    <div className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-1 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => onTabChange(tab.value)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#0F172A] text-white'
                    : 'bg-transparent text-[#64748B] hover:bg-[#F8FAFC]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
