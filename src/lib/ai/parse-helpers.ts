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
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
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
