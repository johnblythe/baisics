'use client';

import React, { useState } from 'react';
import { Search, Mic, Camera, Sparkles } from 'lucide-react';

export interface QuickInputProps {
  onSubmit: (text: string) => void;
  onFocus?: () => void;
  onMicClick?: () => void;
  onCameraClick?: () => void;
  className?: string;
  placeholder?: string;
  isLoading?: boolean;
}

export function QuickInput({
  onSubmit,
  onFocus,
  onMicClick,
  onCameraClick,
  className = '',
  placeholder = '"chicken breast" or "same as yesterday"',
  isLoading = false,
}: QuickInputProps) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = () => {
    if (!input.trim() || isProcessing || isLoading) return;
    setIsProcessing(true);
    onSubmit(input);
    setInput('');
    setIsProcessing(false);
  };

  const processing = isProcessing || isLoading;

  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <div className="relative flex-1">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={onFocus}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent text-sm"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
      </div>

      <button
        type="button"
        onClick={onMicClick}
        className="p-3 text-[#94A3B8] hover:text-[#64748B] hover:bg-[#F1F5F9] rounded-xl transition-colors"
      >
        <Mic className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={onCameraClick}
        className="p-3 text-[#94A3B8] hover:text-[#64748B] hover:bg-[#F1F5F9] rounded-xl transition-colors"
      >
        <Camera className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!input.trim() || processing}
        className="p-3 bg-[#FF6B6B] text-white rounded-xl hover:bg-[#EF5350] disabled:opacity-50 transition-colors"
      >
        {processing ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Sparkles className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
