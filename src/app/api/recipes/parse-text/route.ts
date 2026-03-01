import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { anthropic } from '@/lib/anthropic';
import { unifiedSearch } from '@/lib/food-search/unified-search';
import { parseAIJson, clamp } from '@/lib/ai/parse-helpers';
import { checkRateLimit, rateLimitedResponse } from '@/utils/security/rateLimit';

type AIParsedIngredient = {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type AIParseResult = {
  ingredients: AIParsedIngredient[];
  suggestedName: string | null;
  detectedServings: number | null;
};

import type { ParsedRecipeIngredient, ParseRecipeResponse } from '@/types/recipe';

const MAX_INPUT_LENGTH = 2000;
const MIN_INPUT_LENGTH = 3;
const MAX_CONCURRENT_SEARCHES = 5;

/** Run async operations with bounded concurrency to avoid DB pool exhaustion */
async function mapWithConcurrency<T, R>(items: T[], fn: (item: T) => Promise<R>, limit: number): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let idx = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

const SYSTEM_PROMPT = `You are a recipe ingredient parser. Given a recipe description, extract each ingredient with its quantity, unit, and estimated nutritional values.

Return ONLY valid JSON (no markdown, no explanation) in this format:
{
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": number,
      "unit": "string (oz, g, cup, piece, slice, tbsp, etc.)",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number
    }
  ],
  "suggestedName": "string or null",
  "detectedServings": number or null
}

Guidelines:
- Use common ingredient names (e.g., "eggs" not "chicken eggs, grade A large")
- If quantity is unspecified, estimate a typical amount (e.g., "eggs" → 2, "cheese" → 1 oz)
- Use the most natural unit for each ingredient
- Macros should reflect the specified quantity, not per 100g
- Suggest a short, appealing recipe name (e.g., "Cheesy Bacon Scramble")
- If serving count is mentioned (e.g., "makes 4 servings"), extract it
- If the text doesn't contain food items, return: { "ingredients": [], "suggestedName": null, "detectedServings": null }`;

/** Validate and sanitize AI-parsed ingredients */
function validateParsedOutput(raw: AIParseResult): AIParseResult {
  if (!Array.isArray(raw.ingredients)) {
    console.error('[parse-text] AI response missing ingredients array. Keys:', Object.keys(raw));
  }
  const ingredients = (Array.isArray(raw.ingredients) ? raw.ingredients : []).map(ing => ({
    name: String(ing.name || 'Unknown').slice(0, 100),
    quantity: clamp(Number(ing.quantity) || 1, 0.01, 10000),
    unit: String(ing.unit || 'serving').slice(0, 20),
    calories: clamp(Math.round(Number(ing.calories) || 0), 0, 10000),
    protein: clamp(Number(ing.protein) || 0, 0, 1000),
    carbs: clamp(Number(ing.carbs) || 0, 0, 1000),
    fat: clamp(Number(ing.fat) || 0, 0, 1000),
  }));

  // Warn if AI returned ingredients with all-zero macros (likely garbage coerced to 0)
  const zeroMacroCount = ingredients.filter(
    ing => ing.calories === 0 && ing.protein === 0 && ing.carbs === 0 && ing.fat === 0
  ).length;
  if (zeroMacroCount > 0) {
    console.warn(
      `validateParsedOutput: ${zeroMacroCount}/${ingredients.length} ingredient(s) have all-zero macros`
    );
  }

  return {
    ingredients,
    suggestedName: typeof raw.suggestedName === 'string' ? raw.suggestedName.slice(0, 100) : null,
    detectedServings: typeof raw.detectedServings === 'number' && raw.detectedServings > 0 && raw.detectedServings <= 100
      ? Math.round(raw.detectedServings)
      : null,
  };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const { ok } = checkRateLimit(request, 20, 60_000);
    if (!ok) return rateLimitedResponse();

    // Auth
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { text?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }
    const { text } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'text field is required' },
        { status: 400 }
      );
    }

    const trimmed = text.trim();
    if (trimmed.length < MIN_INPUT_LENGTH) {
      return NextResponse.json(
        { error: `Text must be at least ${MIN_INPUT_LENGTH} characters` },
        { status: 400 }
      );
    }
    if (trimmed.length > MAX_INPUT_LENGTH) {
      return NextResponse.json(
        { error: `Text must be under ${MAX_INPUT_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Parse with Claude Sonnet — system/user split to prevent prompt injection
    const message = await anthropic.messages.create({
      model: process.env.SONNET_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: trimmed }],
    });

    const textContent = message.content?.[0];
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json(
        { error: 'Failed to get text response from AI' },
        { status: 500 }
      );
    }

    let parsed: AIParseResult;
    try {
      const raw = parseAIJson<AIParseResult>(textContent.text);
      parsed = validateParsedOutput(raw);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, '\nRaw (truncated):', textContent.text.slice(0, 200));
      return NextResponse.json(
        { error: 'Failed to parse AI response. Try rephrasing your recipe.' },
        { status: 500 }
      );
    }

    // Cap ingredients to bound fan-out (each triggers a DB search)
    const aiIngredients = parsed.ingredients.slice(0, 15);

    if (aiIngredients.length === 0) {
      return NextResponse.json({
        ingredients: [],
        suggestedName: null,
        detectedServings: null,
        originalText: trimmed,
      } satisfies ParseRecipeResponse);
    }

    // Enrich each ingredient with DB lookup (bounded concurrency to avoid pool exhaustion)
    const ingredients: ParsedRecipeIngredient[] = await mapWithConcurrency(
      aiIngredients, async (ingredient): Promise<ParsedRecipeIngredient> => {
        try {
          const { results } = await unifiedSearch(ingredient.name, {
            userId: session.user!.id,
            pageSize: 1,
            skipOffFallback: true, // Enrichment mode: skip slow external OFF API (#417)
          });

          if (results.length > 0) {
            const match = results[0];
            // DB macros are per 100g (for OFF/USDA) or per serving (for QuickFoods)
            const dbServingSize = match.servingSize || 100;
            const dbServingUnit = match.servingUnit || 'g';

            // Only use DB macros when we can convert the AI unit to grams for scaling.
            // For count-based units (piece, slice, strip), we can't scale per-100g
            // data reliably — fall through to AI macros instead.
            const aiGrams = convertToGrams(ingredient.quantity, ingredient.unit);
            if (aiGrams !== null && isGramBasedUnit(dbServingUnit)) {
              const scale = aiGrams / dbServingSize;
              return {
                name: match.name,
                quantity: ingredient.quantity,
                unit: ingredient.unit,
                calories: Math.round(match.calories * scale),
                protein: Math.round((match.protein * scale) * 10) / 10,
                carbs: Math.round((match.carbs * scale) * 10) / 10,
                fat: Math.round((match.fat * scale) * 10) / 10,
                source: 'database',
              };
            }
            // Non-scalable unit — fall through to AI macros
          }
        } catch (err) {
          console.error(`DB lookup failed for "${ingredient.name}":`, err);
        }

        // Fallback: use AI macros (already validated by validateParsedOutput)
        return {
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          calories: Math.round(ingredient.calories),
          protein: Math.round(ingredient.protein * 10) / 10,
          carbs: Math.round(ingredient.carbs * 10) / 10,
          fat: Math.round(ingredient.fat * 10) / 10,
          source: 'ai_estimated',
        };
      }, MAX_CONCURRENT_SEARCHES);

    // Warn if all ingredients fell back to AI estimates (no DB enrichment succeeded)
    const allAiEstimated = ingredients.length > 0 && ingredients.every(i => i.source === 'ai_estimated');
    if (allAiEstimated) {
      console.warn(`[parse-text] All ${ingredients.length} ingredients fell back to AI estimates for: "${trimmed.slice(0, 80)}"`);
    }

    return NextResponse.json({
      ingredients,
      suggestedName: parsed.suggestedName,
      detectedServings: parsed.detectedServings,
      originalText: trimmed,
      ...(allAiEstimated && { warning: 'All nutrition values are AI estimates — database lookup failed for all ingredients.' }),
    });
  } catch (error: unknown) {
    console.error('Error parsing recipe text:', error);

    // Anthropic rate limit — pass through as 429
    if (error && typeof error === 'object' && 'status' in error && (error as { status: number }).status === 429) {
      return NextResponse.json(
        { error: 'AI service rate limited. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to parse recipe text' },
      { status: 500 }
    );
  }
}

/** Convert a quantity + unit to grams, or null if not convertible */
function convertToGrams(quantity: number, unit: string): number | null {
  const u = unit.toLowerCase().trim();
  // Weight units only — volume units (cup, tbsp, ml) assume water density which is wrong for most foods
  const gramsMap: Record<string, number> = {
    'g': 1,
    'gram': 1,
    'grams': 1,
    'oz': 28.35,
    'ounce': 28.35,
    'ounces': 28.35,
    'lb': 453.6,
    'lbs': 453.6,
    'pound': 453.6,
    'pounds': 453.6,
    'kg': 1000,
    'kilogram': 1000,
  };

  if (gramsMap[u] !== undefined) {
    return quantity * gramsMap[u];
  }
  return null;
}

/** Check if a unit is weight-based (where gram scaling makes sense) */
function isGramBasedUnit(unit: string): boolean {
  const u = unit.toLowerCase().trim();
  return ['g', 'gram', 'grams', 'oz', 'ounce', 'ounces'].includes(u);
}
