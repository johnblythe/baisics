'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';

export interface WeeklyDayData {
  day: string;
  date: string;
  fullDate: string; // YYYY-MM-DD for navigation
  calories: number;
  target: number;
  protein: number;
  proteinTarget: number;
  logged: boolean;
  adherence: number;
  isToday?: boolean;
}

export interface WeeklyStripProps {
  weekData: WeeklyDayData[];
  expanded?: boolean;
  onToggle?: () => void;
  summaryMessage?: string;
  onDayClick?: (dateStr: string) => void;
}

export function WeeklyStrip({ weekData, expanded: controlledExpanded, onToggle, summaryMessage, onDayClick }: WeeklyStripProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = controlledExpanded ?? internalExpanded;
  const toggle = onToggle ?? (() => setInternalExpanded(!internalExpanded));

  const loggedDays = weekData.filter(d => d.logged).length;
  const avgAdherence = Math.round(
    weekData.filter(d => d.logged && !d.isToday).reduce((sum, d) => sum + d.adherence, 0) /
    Math.max(weekData.filter(d => d.logged && !d.isToday).length, 1)
  );

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0]">
      <button
        type="button"
        onClick={toggle}
        data-testid="weekly-strip-toggle"
        className="w-full px-4 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-[#FF6B6B]" />
          <div className="flex gap-1">
            {weekData.map((day, i) => (
              <div
                key={i}
                role={onDayClick ? 'button' : undefined}
                tabIndex={onDayClick ? 0 : undefined}
                onClick={onDayClick ? (e) => { e.stopPropagation(); onDayClick(day.fullDate); } : undefined}
                className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-medium transition-colors
                  ${day.isToday
                    ? 'bg-[#FF6B6B] text-white'
                    : day.logged
                      ? day.adherence >= 90
                        ? `bg-green-100 text-green-700 ${onDayClick ? 'hover:bg-green-200' : ''}`
                        : day.adherence >= 75
                          ? `bg-amber-100 text-amber-700 ${onDayClick ? 'hover:bg-amber-200' : ''}`
                          : `bg-red-100 text-red-700 ${onDayClick ? 'hover:bg-red-200' : ''}`
                      : `bg-[#F1F5F9] text-[#94A3B8] ${onDayClick ? 'hover:bg-[#E2E8F0]' : ''}`
                  }`}
              >
                {day.day}
              </div>
            ))}
          </div>
          <div className="text-sm">
            <span className="font-medium text-[#0F172A]">{avgAdherence}% avg</span>
            <span className="text-[#94A3B8]"> · {loggedDays}/7</span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-[#94A3B8]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#94A3B8]" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="grid grid-cols-7 gap-2">
                {weekData.map((day, i) => (
                  <div
                    key={i}
                    className={`text-center ${onDayClick ? 'cursor-pointer' : ''}`}
                    role={onDayClick ? 'button' : undefined}
                    tabIndex={onDayClick ? 0 : undefined}
                    onClick={onDayClick ? () => onDayClick(day.fullDate) : undefined}
                  >
                    <div className={`
                      aspect-square rounded-xl flex flex-col items-center justify-center text-xs transition-colors
                      ${day.isToday
                        ? 'bg-[#FF6B6B] text-white'
                        : day.logged
                          ? day.adherence >= 90
                            ? `bg-green-50 border-2 border-green-200 ${onDayClick ? 'hover:bg-green-100 hover:border-green-300' : ''}`
                            : day.adherence >= 75
                              ? `bg-amber-50 border-2 border-amber-200 ${onDayClick ? 'hover:bg-amber-100 hover:border-amber-300' : ''}`
                              : `bg-red-50 border-2 border-red-200 ${onDayClick ? 'hover:bg-red-100 hover:border-red-300' : ''}`
                          : `bg-[#F8FAFC] border border-[#E2E8F0] ${onDayClick ? 'hover:bg-[#F1F5F9] hover:border-[#CBD5E1]' : ''}`
                      }`}
                    >
                      {day.logged ? (
                        <>
                          <span className={`font-bold ${day.isToday ? 'text-white' : ''}`}>
                            {day.adherence}%
                          </span>
                          <span className={`text-[10px] ${day.isToday ? 'text-white/80' : 'text-[#94A3B8]'}`}>
                            {Math.round(day.protein)}g P
                          </span>
                        </>
                      ) : (
                        <span className="text-[#CBD5E1]">—</span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#94A3B8] mt-1">{day.date}</div>
                  </div>
                ))}
              </div>

              {summaryMessage && (
                <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <p className="text-sm text-green-800">{summaryMessage}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
