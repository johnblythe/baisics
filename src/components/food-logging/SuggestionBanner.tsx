'use client';

interface SuggestionBannerProps {
  remainingProtein: number;
  remainingCalories: number;
  suggestion?: string;
  onSuggestMeal?: () => void;
}

export function SuggestionBanner({
  remainingProtein,
  remainingCalories,
  suggestion,
  onSuggestMeal,
}: SuggestionBannerProps) {
  if (remainingProtein <= 0 && remainingCalories <= 0) {
    return null;
  }

  const autoSuggestion = generateSuggestion(remainingProtein, remainingCalories);
  const displayText = suggestion || autoSuggestion;

  return (
    <div className="bg-white rounded-xl border border-[#FF6B6B]/20 px-5 py-3 flex items-center justify-between">
      <div>
        <div className="text-[10px] text-[#FF6B6B] font-semibold uppercase tracking-wider mb-0.5">
          To hit today&apos;s targets
        </div>
        <div className="text-sm text-[#0F172A]">{displayText}</div>
      </div>
      {onSuggestMeal && (
        <button
          onClick={onSuggestMeal}
          className="flex-shrink-0 ml-4 px-3 py-1.5 bg-[#FF6B6B] text-white text-xs font-medium rounded-lg hover:bg-[#EF5350] transition-colors"
        >
          Suggest meal &rarr;
        </button>
      )}
    </div>
  );
}

function generateSuggestion(protein: number, calories: number): string {
  const parts: string[] = [];

  if (protein > 0) {
    parts.push(`~${Math.round(protein)}g protein`);
  }
  if (calories > 0) {
    parts.push(`~${Math.round(calories)} cal`);
  }

  const remaining = parts.join(' & ');

  if (protein >= 40) {
    return `${remaining} left — try salmon + chicken or a shake for dinner`;
  }
  if (protein > 0) {
    return `${remaining} left — a protein shake or Greek yogurt could close the gap`;
  }
  return `${remaining} left — a light snack should do it`;
}
