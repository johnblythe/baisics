'use client';

import { motion } from 'framer-motion';
import { Check, X, AlertCircle, AlertTriangle } from 'lucide-react';

// Type for a single parsed food item from AI
export interface ParsedFoodItem {
  name: string;
  servingSize?: number;
  servingUnit?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: 'high' | 'medium' | 'low';
}

// Props for the AIParseResult component
export interface AIParseResultProps {
  /** The original text that was parsed */
  inputText: string;
  /** Array of parsed food items */
  parsedFoods: ParsedFoodItem[];
  /** Whether this was a "same as yesterday" reference */
  isPreviousDayReference?: boolean;
  /** Called when user confirms and wants to add foods to log */
  onConfirm: () => void;
  /** Called when user cancels or wants to edit */
  onCancel: () => void;
  /** Whether the modal is visible (for AnimatePresence) */
  isVisible?: boolean;
}

// Confidence indicator component
function ConfidenceIndicator({ confidence }: { confidence: 'high' | 'medium' | 'low' }) {
  const config = {
    high: {
      icon: Check,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      label: 'High confidence',
    },
    medium: {
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      label: 'Medium confidence',
    },
    low: {
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      label: 'Low confidence',
    },
  };

  const { icon: Icon, color, bgColor, label } = config[confidence];

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${bgColor} ${color}`}>
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </div>
  );
}

// Calculate overall confidence from parsed foods
function getOverallConfidence(foods: ParsedFoodItem[]): 'high' | 'medium' | 'low' {
  if (foods.length === 0) return 'low';

  const confidenceScores = { high: 3, medium: 2, low: 1 };
  const avgScore = foods.reduce((sum, f) => sum + confidenceScores[f.confidence], 0) / foods.length;

  if (avgScore >= 2.5) return 'high';
  if (avgScore >= 1.5) return 'medium';
  return 'low';
}

export function AIParseResult({
  inputText,
  parsedFoods,
  isPreviousDayReference = false,
  onConfirm,
  onCancel,
}: AIParseResultProps) {
  // Calculate macro totals
  const totals = parsedFoods.reduce(
    (acc, food) => ({
      calories: acc.calories + food.calories,
      protein: acc.protein + food.protein,
      carbs: acc.carbs + food.carbs,
      fat: acc.fat + food.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const overallConfidence = getOverallConfidence(parsedFoods);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-[#E2E8F0] shadow-lg lg:bottom-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:max-w-md lg:rounded-2xl lg:border lg:shadow-xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="p-1.5 bg-green-100 rounded-lg flex-shrink-0">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-medium text-[#0F172A] block truncate">
              {isPreviousDayReference ? 'Yesterday\'s meals' : `"${inputText}"`}
            </span>
            <ConfidenceIndicator confidence={overallConfidence} />
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 text-[#94A3B8] hover:text-[#64748B] transition-colors flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Parsed foods list */}
      <div className="space-y-1 mb-3 max-h-48 overflow-y-auto">
        {parsedFoods.map((food, i) => (
          <div key={i} className="flex items-center justify-between gap-2 text-sm">
            <div className="flex items-center gap-2 text-[#64748B] min-w-0 flex-1">
              <div
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  food.confidence === 'high'
                    ? 'bg-green-400'
                    : food.confidence === 'medium'
                    ? 'bg-amber-400'
                    : 'bg-red-400'
                }`}
              />
              <span className="truncate">
                {food.name}
                {food.servingSize && food.servingUnit && (
                  <span className="text-[#94A3B8]">
                    {' '}({food.servingSize} {food.servingUnit})
                  </span>
                )}
              </span>
            </div>
            <span className="text-[#94A3B8] flex-shrink-0 text-xs">
              {food.calories} cal
            </span>
          </div>
        ))}
      </div>

      {/* Macro totals */}
      <div className="flex items-center gap-4 text-sm mb-4 p-3 bg-[#F8FAFC] rounded-xl">
        <span className="font-bold text-[#0F172A]">{Math.round(totals.calories)} cal</span>
        <span className="text-green-600">{Math.round(totals.protein * 10) / 10}g P</span>
        <span className="text-amber-600">{Math.round(totals.carbs * 10) / 10}g C</span>
        <span className="text-blue-600">{Math.round(totals.fat * 10) / 10}g F</span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 py-3 bg-[#FF6B6B] text-white font-semibold rounded-xl hover:bg-[#EF5350] transition-colors"
        >
          Add to Log
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-3 text-[#64748B] font-medium hover:bg-[#F1F5F9] rounded-xl transition-colors"
        >
          Edit
        </button>
      </div>
    </motion.div>
  );
}
