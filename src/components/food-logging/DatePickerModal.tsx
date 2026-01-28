'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { formatDateForAPI } from '@/lib/date-utils';

export interface DatePickerModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal closes */
  onClose: () => void;
  /** Callback when a date is selected */
  onSelectDate: (date: Date) => void;
  /** The target date (date we're copying TO - dates after this are disabled) */
  targetDate: Date;
  /** Modal title */
  title?: string;
}

interface MonthData {
  year: number;
  month: number; // 0-indexed
  days: (Date | null)[];
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getMonthData(year: number, month: number): MonthData {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  const days: (Date | null)[] = [];

  // Add empty slots for days before the first of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  return { year, month, days };
}

export function DatePickerModal({
  isOpen,
  onClose,
  onSelectDate,
  targetDate,
  title = 'Pick a date to copy from',
}: DatePickerModalProps) {
  const [currentMonth, setCurrentMonth] = useState<MonthData>(() => {
    // Start with previous month (since we're copying from past dates)
    const prevMonth = new Date(targetDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    return getMonthData(prevMonth.getFullYear(), prevMonth.getMonth());
  });
  const [datesWithFood, setDatesWithFood] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dates with food when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchDates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/food-log/dates-with-food?days=90');
        if (!response.ok) {
          throw new Error('Failed to fetch dates');
        }
        const data = await response.json();
        setDatesWithFood(new Set(data.dates));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDates();
  }, [isOpen]);

  // Reset month when modal opens
  useEffect(() => {
    if (isOpen) {
      const prevMonth = new Date(targetDate);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      setCurrentMonth(getMonthData(prevMonth.getFullYear(), prevMonth.getMonth()));
    }
  }, [isOpen, targetDate]);

  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth.year, currentMonth.month - 1, 1);
    setCurrentMonth(getMonthData(newDate.getFullYear(), newDate.getMonth()));
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth.year, currentMonth.month + 1, 1);
    // Don't allow going past the target date's month
    const targetMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    if (newDate <= targetMonth) {
      setCurrentMonth(getMonthData(newDate.getFullYear(), newDate.getMonth()));
    }
  };

  const handleDateClick = (date: Date) => {
    const dateStr = formatDateForAPI(date);
    if (datesWithFood.has(dateStr)) {
      onSelectDate(date);
      onClose();
    }
  };

  const isDateSelectable = (date: Date): boolean => {
    const dateStr = formatDateForAPI(date);
    // Date must have food logged AND be before target date
    const targetDateNormalized = new Date(targetDate);
    targetDateNormalized.setHours(0, 0, 0, 0);
    return datesWithFood.has(dateStr) && date < targetDateNormalized;
  };

  const isDateInFuture = (date: Date): boolean => {
    const targetDateNormalized = new Date(targetDate);
    targetDateNormalized.setHours(0, 0, 0, 0);
    return date >= targetDateNormalized;
  };

  // Check if we can go to next month (not past target date's month)
  const canGoNext = () => {
    const nextMonth = new Date(currentMonth.year, currentMonth.month + 1, 1);
    const targetMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    return nextMonth <= targetMonth;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-[#FF6B6B] animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={goToPreviousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <span className="font-medium text-gray-900">
                  {MONTHS[currentMonth.month]} {currentMonth.year}
                </span>
                <button
                  type="button"
                  onClick={goToNextMonth}
                  disabled={!canGoNext()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-gray-500 py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {currentMonth.days.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  const dateStr = formatDateForAPI(date);
                  const hasFood = datesWithFood.has(dateStr);
                  const isSelectable = isDateSelectable(date);
                  const isFuture = isDateInFuture(date);
                  const isToday = formatDateForAPI(new Date()) === dateStr;

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => isSelectable && handleDateClick(date)}
                      disabled={!isSelectable}
                      className={`
                        aspect-square flex items-center justify-center text-sm rounded-lg transition-colors relative
                        ${isSelectable
                          ? 'bg-[#FF6B6B]/10 text-[#FF6B6B] hover:bg-[#FF6B6B]/20 font-medium cursor-pointer'
                          : isFuture
                            ? 'text-gray-300 cursor-not-allowed'
                            : hasFood
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-400 cursor-not-allowed'
                        }
                        ${isToday ? 'ring-2 ring-[#FF6B6B] ring-offset-1' : ''}
                      `}
                      title={
                        isSelectable
                          ? 'Click to copy from this day'
                          : isFuture
                            ? 'Cannot copy from future dates'
                            : hasFood
                              ? 'This date is the same as or after target date'
                              : 'No food logged on this day'
                      }
                    >
                      {date.getDate()}
                      {hasFood && !isFuture && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FF6B6B]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-[#FF6B6B]/10 border border-[#FF6B6B]/30" />
                    <span>Has food logged</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-gray-100" />
                    <span>No food</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
