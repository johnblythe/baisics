'use client';

import { useState, useEffect } from 'react';
import { debugManager, DEBUG_STATES, type DebugState } from '@/lib/debug';

export function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [currentState, setCurrentState] = useState<DebugState>('normal');

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // Check for debug mode
    const checkState = () => {
      setCurrentState(debugManager.getState());
      setIsVisible(debugManager.isEnabled() || debugManager.getState() !== 'normal');
    };

    checkState();
    return debugManager.subscribe(checkState);
  }, []);

  if (!isVisible || process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleStateChange = (state: DebugState) => {
    debugManager.setState(state);
    setCurrentState(state);
    // Reload to fetch new data with debug overrides
    if (state !== 'normal') {
      window.location.reload();
    }
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-[9999] bg-coral text-white px-3 py-2 rounded-lg shadow-lg text-sm font-mono hover:bg-coral-dark transition-colors flex items-center gap-2"
      >
        <span>🔧</span>
        <span className="text-xs opacity-80">{currentState !== 'normal' ? currentState : 'Debug'}</span>
      </button>
    );
  }

  const currentStateInfo = DEBUG_STATES.find(s => s.value === currentState);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-72 bg-navy text-white rounded-lg shadow-2xl overflow-hidden font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-navy-light border-b border-gray-700">
        <span className="font-bold text-coral">🔧 Debug Mode</span>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="text-gray-400 hover:text-white"
          >
            −
          </button>
          <button
            onClick={() => {
              debugManager.reset();
              setIsVisible(false);
            }}
            className="text-gray-400 hover:text-red-400"
          >
            ✕
          </button>
        </div>
      </div>

      {/* State Selector */}
      <div className="p-3">
        <label className="block text-gray-400 mb-1 text-[10px] uppercase tracking-wide">
          Simulate User State
        </label>
        <select
          value={currentState}
          onChange={(e) => handleStateChange(e.target.value as DebugState)}
          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-2 text-white text-sm"
        >
          {DEBUG_STATES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {currentStateInfo && (
          <p className="text-gray-500 mt-2 text-[11px]">
            {currentStateInfo.description}
          </p>
        )}
      </div>

      {/* Info */}
      <div className="px-3 pb-3 text-[10px] text-gray-500 border-t border-gray-700 pt-2">
        <p>API routes return modified data based on this state.</p>
        <p className="mt-1">Page reloads on state change.</p>
      </div>
    </div>
  );
}

export default DebugPanel;
