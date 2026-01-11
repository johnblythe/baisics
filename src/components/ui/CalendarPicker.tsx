'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarPickerProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  maxDate?: Date;
  minDate?: Date;
  onClose: () => void;
}

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function isDateDisabled(date: Date, minDate?: Date, maxDate?: Date): boolean {
  if (maxDate && date > maxDate) return true;
  if (minDate && date < minDate) return true;
  return false;
}

export function CalendarPicker({
  selectedDate,
  onDateSelect,
  maxDate,
  minDate,
  onClose,
}: CalendarPickerProps) {
  const [viewDate, setViewDate] = useState(() => new Date(selectedDate));
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Get days from previous month to fill the first week
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const prevMonthDays = Array.from(
    { length: startingDayOfWeek },
    (_, i) => prevMonthLastDay - startingDayOfWeek + i + 1
  );

  // Current month days
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Next month days to fill remaining cells
  const totalCells = Math.ceil((startingDayOfWeek + daysInMonth) / 7) * 7;
  const nextMonthDays = Array.from(
    { length: totalCells - startingDayOfWeek - daysInMonth },
    (_, i) => i + 1
  );

  const goToPreviousMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day: number, monthOffset: number = 0) => {
    const newDate = new Date(year, month + monthOffset, day, 12, 0, 0);
    if (!isDateDisabled(newDate, minDate, maxDate)) {
      onDateSelect(newDate);
      onClose();
    }
  };

  const today = new Date();

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-xl border border-[#E2E8F0] p-4 w-[280px] animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Header with month/year navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-1.5 rounded-lg hover:bg-[#F1F5F9] text-[#475569] transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-[#0F172A]">
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={goToNextMonth}
          className="p-1.5 rounded-lg hover:bg-[#F1F5F9] text-[#475569] transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-[#94A3B8] py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Previous month days */}
        {prevMonthDays.map((day) => {
          const date = new Date(year, month - 1, day, 12, 0, 0);
          const disabled = isDateDisabled(date, minDate, maxDate);
          return (
            <button
              key={`prev-${day}`}
              onClick={() => !disabled && handleDateClick(day, -1)}
              disabled={disabled}
              className={`
                w-9 h-9 rounded-lg text-sm font-medium transition-colors
                text-[#CBD5E1] ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-[#F1F5F9]'}
              `}
            >
              {day}
            </button>
          );
        })}

        {/* Current month days */}
        {currentMonthDays.map((day) => {
          const date = new Date(year, month, day, 12, 0, 0);
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          const disabled = isDateDisabled(date, minDate, maxDate);

          return (
            <button
              key={`current-${day}`}
              onClick={() => !disabled && handleDateClick(day)}
              disabled={disabled}
              className={`
                w-9 h-9 rounded-lg text-sm font-medium transition-all
                ${isSelected
                  ? 'bg-[#FF6B6B] text-white shadow-md shadow-[#FF6B6B]/25'
                  : isToday
                    ? 'bg-[#FFE5E5] text-[#FF6B6B] font-semibold'
                    : disabled
                      ? 'text-[#CBD5E1] cursor-not-allowed'
                      : 'text-[#0F172A] hover:bg-[#F1F5F9]'
                }
              `}
            >
              {day}
            </button>
          );
        })}

        {/* Next month days */}
        {nextMonthDays.map((day) => {
          const date = new Date(year, month + 1, day, 12, 0, 0);
          const disabled = isDateDisabled(date, minDate, maxDate);
          return (
            <button
              key={`next-${day}`}
              onClick={() => !disabled && handleDateClick(day, 1)}
              disabled={disabled}
              className={`
                w-9 h-9 rounded-lg text-sm font-medium transition-colors
                text-[#CBD5E1] ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-[#F1F5F9]'}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Today button */}
      <div className="mt-3 pt-3 border-t border-[#F1F5F9]">
        <button
          onClick={() => {
            const todayDate = new Date();
            todayDate.setHours(12, 0, 0, 0);
            if (!isDateDisabled(todayDate, minDate, maxDate)) {
              onDateSelect(todayDate);
              onClose();
            }
          }}
          disabled={maxDate && today > maxDate}
          className="w-full py-2 text-sm font-medium text-[#FF6B6B] hover:bg-[#FFE5E5] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Today
        </button>
      </div>
    </div>
  );
}
