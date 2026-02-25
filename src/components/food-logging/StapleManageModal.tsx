'use client';

import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';
import { X, GripVertical, Trash2, Clock } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { FoodStaple } from '@/hooks/useStaples';
import type { MealType } from '@prisma/client';

const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACK: 'Snack',
};

interface SortableStapleRowProps {
  staple: FoodStaple;
  onDelete: (id: string) => void;
  onToggleAutoLog?: (id: string) => void;
}

function SortableStapleRow({ staple, onDelete, onToggleAutoLog }: SortableStapleRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: staple.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-3 rounded-lg border ${
        isDragging ? 'bg-gray-50 border-gray-300 shadow-md' : 'bg-white border-gray-200'
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
        title="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Emoji + name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {staple.emoji && <span className="text-base">{staple.emoji}</span>}
          <span className="text-sm font-medium text-[#0F172A] truncate">{staple.name}</span>
        </div>
        <span className="text-xs text-gray-400">{staple.calories} cal</span>
      </div>

      {/* Auto-log toggle */}
      {onToggleAutoLog && (
        <button
          onClick={() => onToggleAutoLog(staple.id)}
          className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
            staple.autoLog ? 'bg-[#FF6B6B]' : 'bg-[#E2E8F0]'
          }`}
          title={staple.autoLog ? 'Auto-log enabled' : 'Enable auto-log'}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              staple.autoLog ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
          <Clock className={`absolute top-1 right-1 w-3 h-3 ${staple.autoLog ? 'text-white' : 'text-gray-400'}`} />
        </button>
      )}

      {/* Delete */}
      <button
        onClick={() => onDelete(staple.id)}
        className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-md transition-colors shrink-0"
        title="Remove staple"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export interface StapleManageModalProps {
  mealSlot: MealType;
  staples: FoodStaple[];
  onClose: () => void;
  onDelete: (stapleId: string) => void;
  onReorder: (stapleIds: string[]) => void;
  onToggleAutoLog?: (stapleId: string) => void;
}

export function StapleManageModal({
  mealSlot,
  staples: initialStaples,
  onClose,
  onDelete,
  onReorder,
  onToggleAutoLog,
}: StapleManageModalProps) {
  const [items, setItems] = useState(initialStaples);
  const [orderChanged, setOrderChanged] = useState(false);
  const dndId = useId();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems(prev => {
      const oldIndex = prev.findIndex(s => s.id === active.id);
      const newIndex = prev.findIndex(s => s.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      setOrderChanged(true);
      return reordered;
    });
  };

  const handleClose = () => {
    if (orderChanged) {
      onReorder(items.map(s => s.id));
    }
    onClose();
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(s => s.id !== id));
    onDelete(id);
  };

  const handleToggleAutoLog = (id: string) => {
    setItems(prev => prev.map(s => s.id === id ? { ...s, autoLog: !s.autoLog } : s));
    onToggleAutoLog?.(id);
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40"
        onClick={handleClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E2E8F0] shadow-lg max-h-[80vh] flex flex-col lg:bottom-auto lg:top-[10vh] lg:mx-auto lg:max-w-md lg:w-full lg:rounded-2xl lg:border lg:shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-3 flex-shrink-0">
          <h2 className="text-lg font-bold text-[#0F172A]">
            Manage {MEAL_LABELS[mealSlot] || mealSlot} Staples
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 text-[#94A3B8] hover:text-[#64748B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sortable list */}
        <div className="flex-1 overflow-y-auto px-4 pb-2">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">No staples for this meal yet.</p>
              <p className="text-xs mt-1">Log a food, then pin it from the menu as a staple.</p>
            </div>
          ) : (
            <DndContext
              id={dndId}
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={items.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {items.map(staple => (
                    <SortableStapleRow
                      key={staple.id}
                      staple={staple}
                      onDelete={handleDelete}
                      onToggleAutoLog={handleToggleAutoLog}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Hint + Done */}
        <div className="p-4 pt-2 flex-shrink-0 border-t border-[#E2E8F0]">
          {items.length > 0 && (
            <p className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
              <span>💡</span> Drag to reorder. Toggle auto-log for daily logging.
            </p>
          )}
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2.5 bg-[#FF6B6B] text-white font-semibold rounded-xl hover:bg-[#EF5350] transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </>
  );
}
