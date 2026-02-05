'use client';

import { useState } from 'react';
import { PulseTabs, type PulseTab } from '@/components/pulse/PulseTabs';
import PulseLogView from '@/components/pulse/PulseLogView';
import { PulseHistoryView } from '@/components/pulse/PulseHistoryView';

export default function PulsePage() {
  const [activeTab, setActiveTab] = useState<PulseTab>('log');

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PulseTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="py-6 px-4">
        {activeTab === 'log' ? <PulseLogView /> : <PulseHistoryView />}
      </div>
    </div>
  );
}
