/**
 * Expand common gym abbreviations/synonyms in search queries.
 * Applied as word-boundary replacements so "db row" → "dumbbell row", etc.
 */

const SYNONYMS: [RegExp, string][] = [
  [/\bdb\b/gi, 'dumbbell'],
  [/\bbb\b/gi, 'barbell'],
  [/\bez\b/gi, 'ez-bar'],
  [/\bsldl\b/gi, 'stiff leg deadlift'],
  [/\brdl\b/gi, 'romanian deadlift'],
  [/\bdl\b/gi, 'deadlift'],
  [/\bbw\b/gi, 'bodyweight'],
  [/\boh\b/gi, 'overhead'],
  [/\binc\b/gi, 'incline'],
  [/\bdec\b/gi, 'decline'],
];

export function expandExerciseSynonyms(query: string): string {
  let expanded = query;
  for (const [pattern, replacement] of SYNONYMS) {
    expanded = expanded.replace(pattern, replacement);
  }
  return expanded;
}
