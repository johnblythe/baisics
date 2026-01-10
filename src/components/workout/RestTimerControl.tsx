'use client';

import { Clock } from 'lucide-react';

interface RestTimerControlProps {
  restDuration: string;
  autoStart: boolean;
  onAutoStartChange: (checked: boolean) => void;
}

export function RestTimerControl({
  restDuration,
  autoStart,
  onAutoStartChange,
}: RestTimerControlProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#E2E8F0]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#FFE5E5] flex items-center justify-center">
          <Clock className="w-5 h-5 text-[#FF6B6B]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#0F172A]">Rest Timer</p>
          <p className="text-xs text-[#94A3B8]">{restDuration} between sets</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span id="auto-start-label" className="text-xs text-[#64748B]">Auto-start</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={autoStart}
            onChange={(e) => onAutoStartChange(e.target.checked)}
            className="sr-only peer"
            aria-labelledby="auto-start-label"
            aria-describedby="auto-start-description"
          />
          <div className="w-11 h-6 bg-[#E2E8F0] peer-focus:ring-2 peer-focus:ring-[#FF6B6B]/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B6B]"></div>
          <span id="auto-start-description" className="sr-only">Automatically start rest timer after completing a set</span>
        </label>
      </div>
    </div>
  );
}
