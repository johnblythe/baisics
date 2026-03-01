/**
 * Shared AI response parsing utilities (#419)
 * Consolidates markdown fence stripping and JSON parsing used across 7+ API routes.
 */

/**
 * Strip markdown code fences from AI response text.
 * Handles ```json, ```, and trailing ``` patterns.
 */
export function stripMarkdownFences(text: string): string {
  let cleaned = text.trim();
  const fenceMatch = cleaned.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```\s*$/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }
  return cleaned;
}

/**
 * Parse a JSON string from AI response, stripping markdown fences first.
 * Throws if JSON.parse fails.
 */
export function parseAIJson<T>(text: string): T {
  const cleaned = stripMarkdownFences(text);
  return JSON.parse(cleaned) as T;
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Validate an ingredients array for recipe CRUD routes. Returns error string or null. */
export function validateIngredients(ingredients: unknown[]): string | null {
  if (ingredients.length > 50) return 'Maximum 50 ingredients per recipe';
  const longName = (ingredients as { name?: string }[]).find(
    ing => typeof ing.name === 'string' && ing.name.length > 200
  );
  if (longName) return 'Ingredient names must be under 200 characters';
  return null;
}
