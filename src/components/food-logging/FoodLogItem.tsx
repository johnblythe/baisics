'use client';

import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

export interface FoodLogItemData {
  id: string;
  name: string;
  time?: string;
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
}

export interface FoodLogItemProps {
  item: FoodLogItemData;
  onEdit?: (item: FoodLogItemData) => void;
  onDelete?: (item: FoodLogItemData) => void;
  showActions?: boolean;
}

export function FoodLogItem({
  item,
  onEdit,
  onDelete,
  showActions = false,
}: FoodLogItemProps) {
  return (
    <div className="group flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl hover:bg-[#F1F5F9] transition-colors">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[#0F172A] truncate">{item.name}</div>
        {item.time && <div className="text-xs text-[#94A3B8]">{item.time}</div>}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-medium text-[#0F172A]">{item.calories} cal</div>
          <div className="text-xs text-green-600">{item.protein}g P</div>
        </div>
        {showActions && (onEdit || onDelete) && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(item)}
                className="p-1.5 text-[#94A3B8] hover:text-[#64748B] hover:bg-[#E2E8F0] rounded-lg transition-colors"
                aria-label={`Edit ${item.name}`}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(item)}
                className="p-1.5 text-[#94A3B8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                aria-label={`Delete ${item.name}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
