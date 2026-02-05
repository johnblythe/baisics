'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Scale, TrendingUp } from 'lucide-react';

const tabs = [
  { value: 'log' as const, label: 'Log', icon: Scale, href: '/pulse' },
  { value: 'history' as const, label: 'History', icon: TrendingUp, href: '/pulse/history' },
];

function PulseTabsInner() {
  const pathname = usePathname();

  const getActiveTab = () => {
    if (pathname === '/pulse/history') return 'history';
    return 'log';
  };

  const currentTab = getActiveTab();

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

export function PulseTabs() {
  return (
    <Suspense fallback={
      <div className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <div key={tab.value} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-transparent text-[#94A3B8]">
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    }>
      <PulseTabsInner />
    </Suspense>
  );
}
