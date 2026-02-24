'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, X, Trash2, Pin, ChevronDown, Settings, Clock } from 'lucide-react';
import type { FoodStaple } from '@/hooks/useStaples';

export interface StapleCarouselProps {
  staples: FoodStaple[];
  dailyTargets: { calories: number; protein: number; carbs: number; fat: number };
  onLog: (staple: FoodStaple) => void;
  onDismiss: () => void;
  onDelete: (stapleId: string) => void;
  onManage?: () => void;
}

export function StapleCarousel({
  staples,
  dailyTargets,
  onLog,
  onDismiss,
  onDelete,
  onManage,
}: StapleCarouselProps) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [direction, setDirection] = useState(0);

  // Touch swipe state
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const goTo = (newIndex: number) => {
    setDirection(newIndex > index ? 1 : -1);
    setIndex(newIndex);
    setExpanded(false);
  };

  const prev = () => goTo((index - 1 + staples.length) % staples.length);
  const next = () => goTo((index + 1) % staples.length);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (Math.abs(touchDeltaX.current) > 50 && staples.length > 1) {
      if (touchDeltaX.current < 0) next();
      else prev();
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staples.length, index]);

  const current = staples[index];
  if (!current) return null;

  const calPct = dailyTargets.calories > 0
    ? Math.round((current.calories / dailyTargets.calories) * 100)
    : 0;
  const protPct = dailyTargets.protein > 0
    ? Math.round((current.protein / dailyTargets.protein) * 100)
    : 0;

  const items = Array.isArray(current.items) ? current.items as string[] : null;

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <div className="mt-2 mb-1">
      <div
        className="relative rounded-xl border-2 border-dashed border-[#E2E8F0] bg-white"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pin badge + manage gear */}
        <div className="absolute -top-2 left-3 z-10 flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded-full">
          <Pin className="w-3 h-3 text-[#FF6B6B]" />
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Staple</span>
          {current.autoLog && (
            <span title="Auto-logs daily">
              <Clock className="w-3 h-3 text-[#FF6B6B]" />
            </span>
          )}
        </div>
        {onManage && (
          <button
            onClick={onManage}
            className="absolute -top-2 right-3 z-10 p-1 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            title="Manage staples"
          >
            <Settings className="w-3 h-3" />
          </button>
        )}

        {/* Main carousel area */}
        <div className="flex items-start px-3 pt-4 pb-2">
          {/* Left arrow */}
          {staples.length > 1 && (
            <button onClick={prev} className="p-1 mt-1 text-gray-400 hover:text-gray-600 shrink-0">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Card body (clickable to expand) */}
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.button
              key={current.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="flex-1 min-w-0 text-left"
              onClick={() => items && setExpanded(!expanded)}
            >
              {/* Name + emoji */}
              <div className="flex items-center justify-center gap-2">
                {current.emoji && <span className="text-lg">{current.emoji}</span>}
                <span className="text-sm font-medium text-gray-600">{current.name}</span>
              </div>

              {/* Macro chips */}
              <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-gray-200">
                  <span className="text-xs font-semibold text-gray-700">{current.calories}</span>
                  <span className="text-[10px] text-gray-400">cal</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100">
                  <span className="text-xs font-semibold text-blue-600">{Math.round(current.protein)}g</span>
                  <span className="text-[10px] text-blue-400">P</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-100">
                  <span className="text-xs font-semibold text-amber-600">{Math.round(current.carbs)}g</span>
                  <span className="text-[10px] text-amber-400">C</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 border border-orange-100">
                  <span className="text-xs font-semibold text-orange-600">{Math.round(current.fat)}g</span>
                  <span className="text-[10px] text-orange-400">F</span>
                </div>
              </div>

              {/* Daily contribution bars */}
              <div className="flex items-center gap-2 mt-2 px-4">
                <span className="text-[10px] text-gray-400 w-16 shrink-0 text-right">{calPct}% daily cal</span>
                <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-400 rounded-full" style={{ width: `${Math.min(calPct, 100)}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-0.5 px-4">
                <span className="text-[10px] text-blue-400 w-16 shrink-0 text-right">{protPct}% protein</span>
                <div className="flex-1 h-1 bg-blue-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: `${Math.min(protPct, 100)}%` }} />
                </div>
              </div>

              {/* Expand hint */}
              {items && items.length > 0 && (
                <div className="flex items-center justify-center mt-1.5">
                  <ChevronDown className={`w-3 h-3 text-gray-300 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </div>
              )}
            </motion.button>
          </AnimatePresence>

          {/* Right arrow */}
          {staples.length > 1 && (
            <button onClick={next} className="p-1 mt-1 text-gray-400 hover:text-gray-600 shrink-0">
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Action buttons */}
          <div className="flex flex-col items-center gap-1 ml-1 shrink-0">
            <button
              onClick={() => onLog(current)}
              className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-100 transition-colors"
              title="Log this staple"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-md text-gray-400 hover:bg-gray-200 transition-colors"
              title="Not today"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(current.id)}
              className="p-1.5 rounded-md text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
              title="Remove staple"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Expandable items list */}
        <AnimatePresence>
          {expanded && items && items.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-2 border-t border-gray-200 mt-1 pt-2">
                <ul className="space-y-0.5">
                  {items.map((item, i) => (
                    <li key={i} className="text-xs text-gray-500 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                      {typeof item === 'string' ? item : (item as { name?: string })?.name || String(item)}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dots navigation */}
        {staples.length > 1 && (
          <div className="flex justify-center gap-1.5 pb-2">
            {staples.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === index ? 'bg-gray-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
