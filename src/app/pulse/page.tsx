import { PulseTabs } from '@/components/pulse/PulseTabs';
import PulseLogView from '@/components/pulse/PulseLogView';

export default function PulsePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PulseTabs />
      <div className="py-6 px-4">
        <PulseLogView />
      </div>
    </div>
  );
}
