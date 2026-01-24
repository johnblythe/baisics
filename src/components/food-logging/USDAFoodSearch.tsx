'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { FoodSearchAutocomplete } from '@/components/nutrition/FoodSearchAutocomplete';
import { ServingSizeSelector, type CalculatedMacros } from '@/components/nutrition/ServingSizeSelector';
import type { SimplifiedFood } from '@/lib/usda/types';

export interface USDAFoodResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
  fdcId: string;
  brand?: string;
}

export interface USDAFoodSearchProps {
  /** User ID for tracking recent foods */
  userId?: string;
  /** Callback when food is confirmed with serving size */
  onConfirm: (food: USDAFoodResult) => void;
  /** Callback when search is cancelled or closed */
  onCancel?: () => void;
  /** Whether to show as modal overlay */
  isModal?: boolean;
  /** Placeholder for search input */
  placeholder?: string;
  /** Additional class name */
  className?: string;
}

export function USDAFoodSearch({
  userId,
  onConfirm,
  onCancel,
  isModal = false,
  placeholder = 'Search USDA database...',
  className = '',
}: USDAFoodSearchProps) {
  const [selectedFood, setSelectedFood] = useState<SimplifiedFood | null>(null);

  const handleFoodSelect = (food: SimplifiedFood) => {
    setSelectedFood(food);
  };

  const handleServingConfirm = (macros: CalculatedMacros) => {
    if (!selectedFood) return;

    onConfirm({
      name: selectedFood.name,
      calories: macros.calories,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
      servingSize: macros.grams,
      servingUnit: 'g',
      fdcId: String(selectedFood.fdcId),
      brand: selectedFood.brand,
    });

    setSelectedFood(null);
  };

  const handleCancel = () => {
    setSelectedFood(null);
    onCancel?.();
  };

  const handleBackToSearch = () => {
    setSelectedFood(null);
  };

  // Non-modal inline version
  if (!isModal) {
    return (
      <div className={className}>
        <AnimatePresence mode="wait">
          {!selectedFood ? (
            <motion.div
              key="search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FoodSearchAutocomplete
                onSelect={handleFoodSelect}
                placeholder={placeholder}
                userId={userId}
              />
            </motion.div>
          ) : (
            <motion.div
              key="serving"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ServingSizeSelector
                food={selectedFood}
                onConfirm={handleServingConfirm}
                onCancel={handleBackToSearch}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Modal version
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40"
        onClick={handleCancel}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className={`fixed z-50 bg-white rounded-2xl shadow-xl overflow-hidden ${className}
          bottom-0 left-0 right-0 rounded-b-none max-h-[85vh]
          lg:bottom-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2
          lg:w-full lg:max-w-md lg:rounded-2xl`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0]">
          <h2 className="font-semibold text-[#0F172A]">
            {selectedFood ? 'Select Serving Size' : 'Search Foods'}
          </h2>
          <button
            type="button"
            onClick={handleCancel}
            className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#64748B]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          <AnimatePresence mode="wait">
            {!selectedFood ? (
              <motion.div
                key="search"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <FoodSearchAutocomplete
                  onSelect={handleFoodSelect}
                  placeholder={placeholder}
                  userId={userId}
                />
                <p className="mt-3 text-xs text-[#94A3B8] text-center">
                  Search the USDA FoodData Central database
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="serving"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button
                  type="button"
                  onClick={handleBackToSearch}
                  className="mb-3 text-sm text-[#FF6B6B] hover:text-[#EF5350] transition-colors flex items-center gap-1"
                >
                  ← Back to search
                </button>
                <ServingSizeSelector
                  food={selectedFood}
                  onConfirm={handleServingConfirm}
                  onCancel={handleBackToSearch}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
