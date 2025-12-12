'use client';

import React, { useState } from 'react';
import { Ingredient } from '../page';

interface GroceryListProps {
  items: Ingredient[];
  isPro: boolean;
  onCopy: () => void;
}

export function GroceryList({ items, isPro, onCopy }: GroceryListProps) {
  const [copied, setCopied] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  const categoryLabels: Record<string, string> = {
    protein: 'Protein',
    produce: 'Produce',
    dairy: 'Dairy',
    grains: 'Grains & Bread',
    pantry: 'Pantry',
    other: 'Other',
  };

  const categoryOrder = ['protein', 'produce', 'dairy', 'grains', 'pantry', 'other'];

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleItem = (itemKey: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemKey)) {
        next.delete(itemKey);
      } else {
        next.add(itemKey);
      }
      return next;
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider" style={{ fontFamily: "'Space Mono', monospace" }}>
            Grocery List
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              copied
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0]'
            }`}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy
              </>
            )}
          </button>
          {isPro ? (
            <button
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-[#0F172A] text-white hover:bg-[#1E293B] transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          ) : (
            <button
              disabled
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-[#F8FAFC] text-[#CBD5E1] cursor-not-allowed flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Export (Pro)
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {categoryOrder.map(category => {
          const categoryItems = groupedItems[category];
          if (!categoryItems || categoryItems.length === 0) return null;

          return (
            <div key={category}>
              <h3 className="text-sm font-medium text-[#475569] mb-2">
                {categoryLabels[category]}
              </h3>
              <ul className="space-y-1">
                {categoryItems.map((item, idx) => {
                  const itemKey = `${category}-${idx}`;
                  const isChecked = checkedItems.has(itemKey);

                  return (
                    <li key={idx}>
                      <button
                        onClick={() => toggleItem(itemKey)}
                        className={`w-full text-left py-1.5 px-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                          isChecked
                            ? 'bg-emerald-50 text-emerald-600 line-through'
                            : 'hover:bg-[#F8FAFC] text-[#475569]'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isChecked
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-[#CBD5E1]'
                        }`}>
                          {isChecked && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </span>
                        <span>{item.amount} {item.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Progress indicator */}
      {checkedItems.size > 0 && (
        <div className="px-4 pb-4">
          <div className="text-xs text-[#94A3B8] mb-1">
            {checkedItems.size} of {items.length} items checked
          </div>
          <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${(checkedItems.size / items.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
