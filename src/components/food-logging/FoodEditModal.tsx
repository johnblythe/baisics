'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import { MealType } from '@prisma/client';

const MEAL_OPTIONS = [
  { value: 'BREAKFAST', label: 'Breakfast' },
  { value: 'LUNCH', label: 'Lunch' },
  { value: 'DINNER', label: 'Dinner' },
  { value: 'SNACK', label: 'Snack' },
];

export interface FoodEditData {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize?: number;
  servingUnit?: string;
  meal?: MealType;
}

export interface FoodEditModalProps {
  food: FoodEditData;
  onSave: (id: string, updates: Partial<FoodEditData>) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

export function FoodEditModal({
  food,
  onSave,
  onCancel,
  isSaving = false,
}: FoodEditModalProps) {
  const [name, setName] = useState(food.name);
  const [calories, setCalories] = useState(food.calories.toString());
  const [protein, setProtein] = useState(food.protein.toString());
  const [carbs, setCarbs] = useState(food.carbs.toString());
  const [fat, setFat] = useState(food.fat.toString());
  const [servingSize, setServingSize] = useState(food.servingSize?.toString() ?? '1');
  const [servingUnit, setServingUnit] = useState(food.servingUnit ?? 'serving');
  const [meal, setMeal] = useState<MealType>(food.meal ?? MealType.SNACK);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(food.id, {
      name,
      calories: parseFloat(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      servingSize: parseFloat(servingSize) || 1,
      servingUnit,
      meal,
    });
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onCancel}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E2E8F0] shadow-lg max-h-[90vh] flex flex-col lg:bottom-auto lg:top-[5vh] lg:mx-auto lg:max-w-md lg:w-full lg:rounded-2xl lg:border lg:shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-0 mb-4 flex-shrink-0">
          <h2 className="text-lg font-bold text-[#0F172A]">Edit Food</h2>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-[#94A3B8] hover:text-[#64748B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
         <div className="flex-1 overflow-y-auto px-4">
          {/* Name */}
          <div className="mb-4">
            <label htmlFor="food-name" className="block text-sm font-medium text-[#64748B] mb-1">
              Name
            </label>
            <input
              id="food-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/50 focus:border-[#FF6B6B]"
            />
          </div>

          {/* Meal */}
          <div className="mb-4">
            <label htmlFor="meal" className="block text-sm font-medium text-[#64748B] mb-1">
              Meal
            </label>
            <select
              id="meal"
              value={meal}
              onChange={(e) => setMeal(e.target.value as MealType)}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/50 focus:border-[#FF6B6B]"
            >
              {MEAL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Serving Size */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label htmlFor="serving-size" className="block text-sm font-medium text-[#64748B] mb-1">
                Serving Size
              </label>
              <input
                id="serving-size"
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                step="0.1"
                min="0"
                value={servingSize}
                onChange={(e) => setServingSize(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/50 focus:border-[#FF6B6B]"
              />
            </div>
            <div>
              <label htmlFor="serving-unit" className="block text-sm font-medium text-[#64748B] mb-1">
                Unit
              </label>
              <input
                id="serving-unit"
                type="text"
                value={servingUnit}
                onChange={(e) => setServingUnit(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/50 focus:border-[#FF6B6B]"
              />
            </div>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label htmlFor="calories" className="block text-sm font-medium text-[#64748B] mb-1">
                Calories
              </label>
              <input
                id="calories"
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                step="1"
                min="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/50 focus:border-[#FF6B6B]"
              />
            </div>
            <div>
              <label htmlFor="protein" className="block text-sm font-medium text-green-600 mb-1">
                Protein (g)
              </label>
              <input
                id="protein"
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                step="0.1"
                min="0"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
              />
            </div>
            <div>
              <label htmlFor="carbs" className="block text-sm font-medium text-amber-600 mb-1">
                Carbs (g)
              </label>
              <input
                id="carbs"
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                step="0.1"
                min="0"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
            <div>
              <label htmlFor="fat" className="block text-sm font-medium text-blue-600 mb-1">
                Fat (g)
              </label>
              <input
                id="fat"
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                step="0.1"
                min="0"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              />
            </div>
          </div>

         </div>
          {/* Action buttons */}
          <div className="flex gap-2 p-4 flex-shrink-0 border-t border-[#E2E8F0]">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 bg-[#FF6B6B] text-white font-semibold rounded-xl hover:bg-[#EF5350] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="px-4 py-3 text-[#64748B] font-medium hover:bg-[#F1F5F9] rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}
