import { PulseTabs } from '@/components/pulse/PulseTabs';
import { PulseHistoryView } from '@/components/pulse/PulseHistoryView';

export default function PulseHistoryPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PulseTabs />
      <div className="py-6 px-4">
        <PulseHistoryView />
      </div>
    </div>
  );
}
