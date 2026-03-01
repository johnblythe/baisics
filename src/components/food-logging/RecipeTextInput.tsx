'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ParseRecipeResponse } from '@/types/recipe';

const MAX_LENGTH = 2000;

interface RecipeTextInputProps {
  onParsed: (response: ParseRecipeResponse) => void;
}

export function RecipeTextInput({ onParsed }: RecipeTextInputProps) {
  const [text, setText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const trimmed = text.trim();
  const canParse = trimmed.length >= 3 && !isParsing;

  const handleParse = async () => {
    if (!canParse) return;

    setIsParsing(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);
    try {
      const response = await fetch('/api/recipes/parse-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorMessage = 'Failed to parse recipe';
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch {
          errorMessage = `Server error (${response.status}). Please try again.`;
        }
        throw new Error(errorMessage);
      }

      const data: ParseRecipeResponse = await response.json();

      if (data.ingredients.length === 0) {
        toast.error('No ingredients detected. Try describing what\'s in the recipe.');
        return;
      }

      setText('');
      onParsed(data);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        toast.error('Request timed out. Try a shorter recipe description.');
      } else {
        toast.error(
          error instanceof Error ? error.message : 'Failed to parse recipe. Try again.'
        );
      }
    } finally {
      clearTimeout(timeout);
      setIsParsing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canParse) {
      e.preventDefault();
      handleParse();
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-[#0F172A]">
        <Sparkles className="w-4 h-4 text-[#FF6B6B]" />
        Describe a Recipe
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
        onKeyDown={handleKeyDown}
        placeholder="e.g., 2 eggs scrambled with 1oz cheddar, 2 strips bacon, toast with butter"
        rows={3}
        disabled={isParsing}
        className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] text-[#0F172A] placeholder:text-[#94A3B8] resize-none disabled:opacity-50 text-sm"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#94A3B8]">
          {trimmed.length > 0 && (
            <>
              {trimmed.length}/{MAX_LENGTH}
              {' · '}
            </>
          )}
          {'\u2318'}+Enter to parse
        </span>
        <button
          onClick={handleParse}
          disabled={!canParse}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B6B] text-white text-sm font-medium rounded-lg hover:bg-[#EF5350] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isParsing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Parsing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Parse Recipe
            </>
          )}
        </button>
      </div>
    </div>
  );
}
