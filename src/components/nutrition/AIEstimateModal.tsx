'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UnifiedFoodResult } from '@/lib/food-search/types';

// Colors matching v2a design system
const COLORS = {
  white: '#FFFFFF',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray400: '#94A3B8',
  gray600: '#475569',
  navy: '#0F172A',
  navyLight: '#1E293B',
  coral: '#FF6B6B',
  coralDark: '#EF5350',
  coralLight: '#FFE5E5',
};

/** AI estimation result from /api/foods/estimate */
export interface AIEstimateResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: 'high' | 'medium' | 'low';
  reasoning?: string;
}

export interface AIEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFood: (food: UnifiedFoodResult) => void;
  initialDescription?: string;
}

const CONFIDENCE_COLORS: Record<AIEstimateResult['confidence'], { bg: string; text: string; label: string }> = {
  high: { bg: '#D1FAE5', text: '#059669', label: 'High confidence' },
  medium: { bg: '#FEF3C7', text: '#D97706', label: 'Medium confidence' },
  low: { bg: '#FEE2E2', text: '#DC2626', label: 'Low confidence - verify values' },
};

export function AIEstimateModal({
  isOpen,
  onClose,
  onAddFood,
  initialDescription = '',
}: AIEstimateModalProps) {
  const [description, setDescription] = useState(initialDescription);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<AIEstimateResult | null>(null);

  // Editable macro values (user can adjust before adding)
  const [editedCalories, setEditedCalories] = useState<number>(0);
  const [editedProtein, setEditedProtein] = useState<number>(0);
  const [editedCarbs, setEditedCarbs] = useState<number>(0);
  const [editedFat, setEditedFat] = useState<number>(0);
  const [editedName, setEditedName] = useState<string>('');

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setDescription(initialDescription);
      setEstimate(null);
      setError(null);
      // Focus input after modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, initialDescription]);

  // Sync edited values when estimate changes
  useEffect(() => {
    if (estimate) {
      setEditedCalories(estimate.calories);
      setEditedProtein(estimate.protein);
      setEditedCarbs(estimate.carbs);
      setEditedFat(estimate.fat);
      setEditedName(estimate.name);
    }
  }, [estimate]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Close when clicking backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEstimate = async () => {
    if (!description.trim() || description.trim().length < 3) {
      setError('Please describe your food (at least 3 characters)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/foods/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to estimate');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setEstimate(data as AIEstimateResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to estimate nutrition');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFood = () => {
    if (!estimate) return;

    // Create UnifiedFoodResult from AI estimate
    const food: UnifiedFoodResult = {
      id: `ai:${Date.now()}`,
      name: editedName || estimate.name,
      calories: editedCalories,
      protein: editedProtein,
      carbs: editedCarbs,
      fat: editedFat,
      source: 'AI_ESTIMATED',
    };

    onAddFood(food);
    onClose();
  };

  const handleReset = () => {
    setEstimate(null);
    setError(null);
    setDescription('');
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-estimate-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
        style={{ backgroundColor: COLORS.white }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: COLORS.gray100 }}
        >
          <h2
            id="ai-estimate-title"
            className="text-lg font-semibold"
            style={{ color: COLORS.navy }}
          >
            Estimate with AI
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!estimate ? (
            // Description input state
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="food-description"
                  className="block text-sm font-medium mb-2"
                  style={{ color: COLORS.navy }}
                >
                  Describe your food
                </label>
                <textarea
                  ref={inputRef}
                  id="food-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., grilled chicken breast with a cup of rice and steamed broccoli"
                  className="w-full px-4 py-3 rounded-xl border-2 text-sm resize-none transition-colors outline-none"
                  style={{
                    borderColor: COLORS.gray100,
                    color: COLORS.navy,
                  }}
                  rows={3}
                  maxLength={500}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleEstimate();
                    }
                  }}
                />
                <p className="text-xs mt-1" style={{ color: COLORS.gray400 }}>
                  Be specific about portions and preparation for better estimates
                </p>
              </div>

              {error && (
                <div
                  className="px-4 py-3 rounded-xl text-sm"
                  style={{ backgroundColor: COLORS.coralLight, color: COLORS.coralDark }}
                >
                  {error}
                </div>
              )}

              <div
                className="px-4 py-3 rounded-xl text-xs"
                style={{ backgroundColor: COLORS.gray50, color: COLORS.gray600 }}
              >
                <span className="font-medium">Note:</span> AI estimates are approximate.
                Actual nutrition may vary based on brand, preparation, and portion size.
              </div>

              <button
                onClick={handleEstimate}
                disabled={loading || !description.trim()}
                className="w-full py-3 px-4 rounded-xl font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: loading ? COLORS.gray400 : COLORS.coral }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div
                      className="w-5 h-5 border-2 rounded-full animate-spin"
                      style={{ borderColor: COLORS.white, borderTopColor: 'transparent' }}
                    />
                    Estimating...
                  </span>
                ) : (
                  'Get Estimate'
                )}
              </button>
            </div>
          ) : (
            // Estimate result state
            <div className="space-y-4">
              {/* Confidence badge */}
              <div className="flex items-center justify-between">
                <span
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: CONFIDENCE_COLORS[estimate.confidence].bg,
                    color: CONFIDENCE_COLORS[estimate.confidence].text,
                  }}
                >
                  {CONFIDENCE_COLORS[estimate.confidence].label}
                </span>
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{ backgroundColor: '#FECACA', color: '#DC2626' }}
                >
                  ~ Approximate
                </span>
              </div>

              {/* Editable name */}
              <div>
                <label htmlFor="ai-estimate-name" className="block text-xs font-medium mb-1" style={{ color: COLORS.gray600 }}>
                  Name
                </label>
                <input
                  type="text"
                  id="ai-estimate-name"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: COLORS.gray100, color: COLORS.navy }}
                />
              </div>

              {/* Macro grid */}
              <div className="grid grid-cols-4 gap-3">
                <MacroInput
                  id="ai-estimate-calories"
                  label="Calories"
                  value={editedCalories}
                  onChange={setEditedCalories}
                  unit="kcal"
                />
                <MacroInput
                  id="ai-estimate-protein"
                  label="Protein"
                  value={editedProtein}
                  onChange={setEditedProtein}
                  unit="g"
                />
                <MacroInput
                  id="ai-estimate-carbs"
                  label="Carbs"
                  value={editedCarbs}
                  onChange={setEditedCarbs}
                  unit="g"
                />
                <MacroInput
                  id="ai-estimate-fat"
                  label="Fat"
                  value={editedFat}
                  onChange={setEditedFat}
                  unit="g"
                />
              </div>

              {/* AI reasoning */}
              {estimate.reasoning && (
                <div
                  className="px-4 py-3 rounded-xl text-xs"
                  style={{ backgroundColor: COLORS.gray50, color: COLORS.gray600 }}
                >
                  <span className="font-medium">AI reasoning:</span> {estimate.reasoning}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 px-4 rounded-xl font-medium border-2 transition-colors"
                  style={{ borderColor: COLORS.gray100, color: COLORS.gray600 }}
                >
                  Try Again
                </button>
                <button
                  onClick={handleAddFood}
                  className="flex-1 py-3 px-4 rounded-xl font-medium text-white transition-colors"
                  style={{ backgroundColor: COLORS.coral }}
                >
                  Add Food
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface MacroInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit: string;
}

function MacroInput({ id, label, value, onChange, unit }: MacroInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium mb-1" style={{ color: COLORS.gray600 }}>
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          id={id}
          value={value}
          onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
          className="w-full px-2 py-2 rounded-lg border text-sm text-center"
          style={{ borderColor: COLORS.gray100, color: COLORS.navy }}
          min={0}
        />
        <span
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
          style={{ color: COLORS.gray400 }}
        >
          {unit}
        </span>
      </div>
    </div>
  );
}

export default AIEstimateModal;
