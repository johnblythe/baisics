import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { anthropic } from '@/lib/anthropic';
import { unifiedSearch } from '@/lib/food-search/unified-search';
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

export type ParsedRecipeIngredient = {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: 'database' | 'ai_estimated';
};

export type ParseRecipeResponse = {
  ingredients: ParsedRecipeIngredient[];
  suggestedName: string | null;
  detectedServings: number | null;
  originalText: string;
};

const MAX_INPUT_LENGTH = 2000;
const MIN_INPUT_LENGTH = 3;

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

    const body = await request.json();
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

    // Parse with Claude Sonnet
    const prompt = `Parse this recipe description into structured ingredient data. The user is describing a recipe or meal they want to save.

Text: "${trimmed}"

Extract each ingredient with its quantity and unit. Estimate nutritional values per ingredient based on the specified quantity.

Also:
- Suggest a short, appealing recipe name based on the ingredients (e.g., "Cheesy Bacon Scramble", "Chicken Stir Fry")
- If the text mentions serving count (e.g., "makes 4 servings", "serves 2"), extract it

Return ONLY valid JSON (no markdown, no explanation):
{
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": number,
      "unit": "string (oz, g, cup, piece, slice, tbsp, etc.)",
      "calories": number,
      "protein": number (grams),
      "carbs": number (grams),
      "fat": number (grams)
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
- If the text doesn't contain food items, return: { "ingredients": [], "suggestedName": null, "detectedServings": null }`;

    const message = await anthropic.messages.create({
      model: process.env.SONNET_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = message.content[0];
    if (textContent.type !== 'text') {
      return NextResponse.json(
        { error: 'Failed to get text response from AI' },
        { status: 500 }
      );
    }

    // Parse JSON response (strip markdown fences if present)
    let jsonText = textContent.text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }

    let parsed: AIParseResult;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      console.error('Failed to parse AI response:', textContent.text);
      return NextResponse.json(
        { error: 'Failed to parse AI response. Try rephrasing your recipe.' },
        { status: 500 }
      );
    }

    const aiIngredients = parsed.ingredients || [];

    if (aiIngredients.length === 0) {
      return NextResponse.json({
        ingredients: [],
        suggestedName: null,
        detectedServings: null,
        originalText: trimmed,
      } satisfies ParseRecipeResponse);
    }

    // Enrich each ingredient with DB lookup (parallel, graceful per-ingredient failure)
    const enrichmentResults = await Promise.allSettled(
      aiIngredients.map(async (ingredient): Promise<ParsedRecipeIngredient> => {
        try {
          const { results } = await unifiedSearch(ingredient.name, {
            userId: session.user!.id,
            pageSize: 3,
          });

          if (results.length > 0) {
            const match = results[0];
            // Use DB macros scaled to the AI-parsed quantity
            // DB macros are per 100g (for OFF/USDA) or per serving (for QuickFoods)
            const dbServingSize = match.servingSize || 100;
            const dbServingUnit = match.servingUnit || 'g';

            // If both are in grams-like units, scale proportionally
            // Otherwise, trust AI quantity and use DB macros per-serving as-is
            let scale = 1;
            const aiGrams = convertToGrams(ingredient.quantity, ingredient.unit);
            if (aiGrams !== null && isGramBasedUnit(dbServingUnit)) {
              scale = aiGrams / dbServingSize;
            }

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
        } catch (err) {
          console.error(`DB lookup failed for "${ingredient.name}":`, err);
        }

        // Fallback: use AI macros
        return {
          name: String(ingredient.name || 'Unknown'),
          quantity: typeof ingredient.quantity === 'number' ? ingredient.quantity : 1,
          unit: String(ingredient.unit || 'serving'),
          calories: Math.round(Number(ingredient.calories) || 0),
          protein: Math.round((Number(ingredient.protein) || 0) * 10) / 10,
          carbs: Math.round((Number(ingredient.carbs) || 0) * 10) / 10,
          fat: Math.round((Number(ingredient.fat) || 0) * 10) / 10,
          source: 'ai_estimated',
        };
      })
    );

    const ingredients: ParsedRecipeIngredient[] = enrichmentResults.map(result =>
      result.status === 'fulfilled'
        ? result.value
        : {
            name: 'Unknown ingredient',
            quantity: 1,
            unit: 'serving',
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            source: 'ai_estimated' as const,
          }
    );

    return NextResponse.json({
      ingredients,
      suggestedName: parsed.suggestedName || null,
      detectedServings: typeof parsed.detectedServings === 'number' && parsed.detectedServings > 0
        ? parsed.detectedServings
        : null,
      originalText: trimmed,
    } satisfies ParseRecipeResponse);
  } catch (error) {
    console.error('Error parsing recipe text:', error);
    return NextResponse.json(
      { error: 'Failed to parse recipe text' },
      { status: 500 }
    );
  }
}

/** Convert a quantity + unit to grams, or null if not convertible */
function convertToGrams(quantity: number, unit: string): number | null {
  const u = unit.toLowerCase().trim();
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
    'cup': 240,
    'cups': 240,
    'tbsp': 15,
    'tablespoon': 15,
    'tablespoons': 15,
    'tsp': 5,
    'teaspoon': 5,
    'teaspoons': 5,
    'ml': 1,
    'milliliter': 1,
    'milliliters': 1,
  };

  if (gramsMap[u] !== undefined) {
    return quantity * gramsMap[u];
  }
  return null;
}

/** Check if a unit is gram-based (weight/volume where gram conversion makes sense) */
function isGramBasedUnit(unit: string): boolean {
  const u = unit.toLowerCase().trim();
  return ['g', 'gram', 'grams', 'oz', 'ounce', 'ml', 'milliliter'].includes(u);
}
