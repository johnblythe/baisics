'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UnifiedFoodResult } from '@/lib/food-search/types';
import { COLORS } from '@/lib/design/colors';
import { toast } from 'sonner';
import { useEscapeKey } from '@/hooks/useEscapeKey';

export interface CreateFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFood: (food: UnifiedFoodResult) => void;
  initialName?: string;
}

export function CreateFoodModal({
  isOpen,
  onClose,
  onAddFood,
  initialName = '',
}: CreateFoodModalProps) {
  const [name, setName] = useState(initialName);
  const [brand, setBrand] = useState('');
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);

  const calories = Math.round(protein * 4 + carbs * 4 + fat * 9);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setBrand('');
      setProtein(0);
      setCarbs(0);
      setFat(0);
      setError(null);
      setLoading(false);
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [isOpen, initialName]);

  useEscapeKey(onClose, isOpen);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSave = async () => {
    if (!name.trim() || name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (protein === 0 && carbs === 0 && fat === 0) {
      setError('Enter at least one macro value');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/foods/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), brand: brand.trim() || undefined, protein, carbs, fat }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server error (${res.status})`);
      }

      const food: UnifiedFoodResult = await res.json();
      toast.success('Food created and added!');
      onAddFood(food);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create food');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-food-title"
    >
      <div className="relative w-full max-w-md rounded-2xl shadow-xl overflow-hidden" style={{ backgroundColor: COLORS.white }}>
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: COLORS.gray100 }}>
          <h2 id="create-food-title" className="text-lg font-semibold" style={{ color: COLORS.navy }}>
            Create Custom Food
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="create-food-name" className="block text-sm font-medium mb-1" style={{ color: COLORS.navy }}>
              Food Name *
            </label>
            <input
              ref={nameRef}
              id="create-food-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Pro2Go Grilled Chicken Strips"
              className="w-full px-4 py-3 rounded-xl border-2 text-sm outline-none transition-colors"
              style={{ borderColor: COLORS.gray100, color: COLORS.navy }}
              maxLength={200}
            />
          </div>

          {/* Brand */}
          <div>
            <label htmlFor="create-food-brand" className="block text-sm font-medium mb-1" style={{ color: COLORS.gray600 }}>
              Brand (optional)
            </label>
            <input
              id="create-food-brand"
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g., Pro2Go"
              className="w-full px-4 py-3 rounded-xl border-2 text-sm outline-none transition-colors"
              style={{ borderColor: COLORS.gray100, color: COLORS.navy }}
              maxLength={100}
            />
          </div>

          {/* Macros */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.navy }}>
              Macros (per 100g)
            </label>
            <div className="grid grid-cols-3 gap-3">
              <MacroField id="protein" label="Protein" value={protein} onChange={setProtein} unit="g" />
              <MacroField id="carbs" label="Carbs" value={carbs} onChange={setCarbs} unit="g" />
              <MacroField id="fat" label="Fat" value={fat} onChange={setFat} unit="g" />
            </div>
          </div>

          {/* Auto-calc calories */}
          <div
            className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ backgroundColor: COLORS.gray50 }}
          >
            <span className="text-sm font-medium" style={{ color: COLORS.navy }}>Calories</span>
            <span className="text-lg font-bold" style={{ color: COLORS.coral }}>
              {calories} kcal
            </span>
          </div>
          <p className="text-xs" style={{ color: COLORS.gray400 }}>
            Auto-calculated: protein x 4 + carbs x 4 + fat x 9
          </p>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: COLORS.coralLight, color: COLORS.coralDark }}>
              {error}
            </div>
          )}

          {/* Info */}
          <div className="px-4 py-3 rounded-xl text-xs" style={{ backgroundColor: COLORS.gray50, color: COLORS.gray600 }}>
            This food will be saved to our community database and available to all users.
          </div>

          {/* Actions */}
          <button
            onClick={handleSave}
            disabled={loading || !name.trim()}
            className="w-full py-3 px-4 rounded-xl font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: loading ? COLORS.gray400 : COLORS.coral }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div
                  className="w-5 h-5 border-2 rounded-full animate-spin"
                  style={{ borderColor: COLORS.white, borderTopColor: 'transparent' }}
                />
                Saving...
              </span>
            ) : (
              'Save & Add Food'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function MacroField({ id, label, value, onChange, unit }: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit: string;
}) {
  return (
    <div>
      <label htmlFor={`create-food-${id}`} className="block text-xs font-medium mb-1" style={{ color: COLORS.gray600 }}>
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          id={`create-food-${id}`}
          value={value}
          onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))}
          className="w-full px-2 py-2 rounded-lg border text-sm text-center"
          style={{ borderColor: COLORS.gray100, color: COLORS.navy }}
          min={0}
          step="0.1"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs" style={{ color: COLORS.gray400 }}>
          {unit}
        </span>
      </div>
    </div>
  );
}
