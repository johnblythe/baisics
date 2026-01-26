'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Copy, Calendar, X, ChevronRight } from 'lucide-react';

export interface DateMenuProps {
  /** Current selected date */
  selectedDate: Date;
  /** Callback when "Yesterday" is clicked - opens copy day modal */
  onCopyFromYesterday?: () => void;
  /** Callback when "Pick a date" is clicked - opens date picker */
  onPickDate?: () => void;
  /** Callback when "Clear today's log" is clicked */
  onClearDay?: () => void;
  /** Whether the current view is for today */
  isToday?: boolean;
  /** Variant for desktop vs mobile styling */
  variant?: 'mobile' | 'desktop';
}

export function DateMenu({
  selectedDate,
  onCopyFromYesterday,
  onPickDate,
  onClearDay,
  isToday = true,
  variant = 'desktop',
}: DateMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCopySubmenu, setShowCopySubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCopySubmenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setShowCopySubmenu(false);
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleCopyFromYesterday = () => {
    onCopyFromYesterday?.();
    setIsOpen(false);
    setShowCopySubmenu(false);
  };

  const handlePickDate = () => {
    onPickDate?.();
    setIsOpen(false);
    setShowCopySubmenu(false);
  };

  const handleClearDay = () => {
    if (confirm(`Clear all food logged for ${isToday ? 'today' : formatDateForDisplay(selectedDate)}? This cannot be undone.`)) {
      onClearDay?.();
    }
    setIsOpen(false);
  };

  const buttonClasses = variant === 'mobile'
    ? 'p-2 hover:bg-white/10 rounded-lg transition-colors'
    : 'p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors';

  const textClasses = variant === 'mobile' ? 'text-white' : 'text-[#64748B]';

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClasses}
        aria-label="More options"
      >
        <span className={`text-lg ${textClasses}`}>⋯</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {/* Copy from... option with submenu */}
          <div
            className="relative"
            onMouseEnter={() => setShowCopySubmenu(true)}
            onMouseLeave={() => setShowCopySubmenu(false)}
          >
            <button
              type="button"
              onClick={() => setShowCopySubmenu(!showCopySubmenu)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <Copy className="w-4 h-4 text-gray-400" />
              <span>Copy from...</span>
              <ChevronRight className="w-3 h-3 text-gray-400 ml-auto" />
            </button>

            {/* Submenu */}
            {showCopySubmenu && (
              <div className="absolute left-full top-0 ml-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  type="button"
                  onClick={handleCopyFromYesterday}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                >
                  Yesterday
                </button>
                <button
                  type="button"
                  onClick={handlePickDate}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                >
                  <Calendar className="w-3 h-3" />
                  Pick a date...
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-1" />

          {/* Clear today's log */}
          <button
            type="button"
            onClick={handleClearDay}
            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear {isToday ? "today's" : "this day's"} log
          </button>
        </div>
      )}
    </div>
  );
}

function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}
