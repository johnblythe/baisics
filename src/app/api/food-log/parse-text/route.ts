import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { anthropic } from '@/lib/anthropic';
import { checkRateLimit, rateLimitedResponse } from '@/utils/security/rateLimit';
import { parseAIJson } from '@/lib/ai/parse-helpers';

type ParsedFood = {
  name: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: 'high' | 'medium' | 'low';
};

type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

type ParseTextResponse = {
  foods: ParsedFood[];
  originalText: string;
  isPreviousDayReference: boolean;
  detectedMeal?: MealType;
};

// POST /api/food-log/parse-text - parses natural language food text
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 20 requests per minute
    const { ok } = checkRateLimit(request, 20, 60_000);
    if (!ok) return rateLimitedResponse();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'text field is required' },
        { status: 400 }
      );
    }

    // Input length guards (#423)
    if (text.trim().length < 3) {
      return NextResponse.json(
        { error: 'Text must be at least 3 characters' },
        { status: 400 }
      );
    }
    if (text.length > 2000) {
      return NextResponse.json(
        { error: 'Text must be under 2000 characters' },
        { status: 400 }
      );
    }

    const trimmedText = text.trim().toLowerCase();

    // Check for "same as yesterday" pattern
    const yesterdayPatterns = [
      'same as yesterday',
      'yesterday',
      'same as last night',
      'same thing',
      'repeat yesterday',
      'copy yesterday',
    ];

    const isYesterdayReference = yesterdayPatterns.some(pattern =>
      trimmedText.includes(pattern)
    );

    if (isYesterdayReference) {
      // Fetch previous day's entries
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const previousEntries = await prisma.foodLogEntry.findMany({
        where: {
          userId: session.user.id,
          date: yesterday,
        },
        orderBy: { createdAt: 'asc' },
      });

      if (previousEntries.length === 0) {
        return NextResponse.json({
          foods: [],
          originalText: text,
          isPreviousDayReference: true,
          message: 'No entries found from yesterday',
        });
      }

      const foods: ParsedFood[] = previousEntries.map(entry => ({
        name: entry.name,
        servingSize: entry.servingSize,
        servingUnit: entry.servingUnit,
        calories: entry.calories,
        protein: entry.protein,
        carbs: entry.carbs,
        fat: entry.fat,
        confidence: 'high' as const,
      }));

      return NextResponse.json({
        foods,
        originalText: text,
        isPreviousDayReference: true,
      } satisfies ParseTextResponse);
    }

    // System/user prompt split to prevent prompt injection (#423)
    const systemPrompt = `Parse food logging text into structured food data. The user is logging food they ate.

Extract each food item mentioned and estimate nutritional values. Common patterns include:
- "6oz chicken breast" or "chicken breast 6 oz"
- "2 eggs"
- "cup of rice" or "1 cup rice"
- "greek yogurt with honey"
- "protein shake"
- Multiple foods separated by commas, "and", or newlines

Also detect if the user mentioned a specific meal (breakfast, lunch, dinner, or snack).

For each food item, provide your best estimate of macros. Use typical serving sizes if not specified.
If you're uncertain about a food, still provide an estimate but set confidence to "low".

Return ONLY valid JSON (no markdown, no explanation):
{
  "foods": [
    {
      "name": "food name",
      "servingSize": number,
      "servingUnit": "string (oz, g, cup, piece, serving, etc.)",
      "calories": number,
      "protein": number (grams),
      "carbs": number (grams),
      "fat": number (grams),
      "confidence": "high" | "medium" | "low"
    }
  ],
  "detectedMeal": "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK" | null
}

Meal detection:
- "for breakfast", "this morning", "breakfast" → "BREAKFAST"
- "for lunch", "at lunch", "midday" → "LUNCH"
- "for dinner", "tonight", "for supper" → "DINNER"
- "as a snack", "snacking on" → "SNACK"
- If no meal is mentioned, set detectedMeal to null

Confidence levels:
- "high": Common food with clear serving size (e.g., "6oz chicken breast", "2 eggs")
- "medium": Common food but serving size is estimated (e.g., "chicken breast", "some rice")
- "low": Uncommon food, unclear description, or highly variable nutrition

If the text doesn't contain any food items, return: { "foods": [], "detectedMeal": null }`;

    const message = await anthropic.messages.create({
      model: process.env.SONNET_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: text.trim() }],
    });

    const textContent = message.content[0];
    if (textContent.type !== 'text') {
      return NextResponse.json(
        { error: 'Failed to get text response from AI' },
        { status: 500 }
      );
    }

    let parsed: { foods: ParsedFood[]; detectedMeal?: string | null };
    try {
      parsed = parseAIJson(textContent.text);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, '\nRaw (truncated):', textContent.text.slice(0, 200));
      return NextResponse.json(
        { error: 'Failed to parse AI response. Try rephrasing.' },
        { status: 500 }
      );
    }

    // Validate, clamp, and normalize response (#423)
    const foods: ParsedFood[] = (parsed.foods || []).slice(0, 30).map(food => ({
      name: String(food.name || 'Unknown food').slice(0, 100),
      servingSize: Math.min(Math.max(Number(food.servingSize) || 1, 0.01), 10000),
      servingUnit: String(food.servingUnit || 'serving').slice(0, 20),
      calories: Math.min(Math.max(Math.round(Number(food.calories) || 0), 0), 10000),
      protein: Math.min(Math.max(Math.round((Number(food.protein) || 0) * 10) / 10, 0), 1000),
      carbs: Math.min(Math.max(Math.round((Number(food.carbs) || 0) * 10) / 10, 0), 1000),
      fat: Math.min(Math.max(Math.round((Number(food.fat) || 0) * 10) / 10, 0), 1000),
      confidence: (['high', 'medium', 'low'].includes(food.confidence)
        ? food.confidence
        : 'medium') as 'high' | 'medium' | 'low',
    }));

    // Validate detected meal
    const validMeals: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];
    const detectedMeal = parsed.detectedMeal && validMeals.includes(parsed.detectedMeal as MealType)
      ? parsed.detectedMeal as MealType
      : undefined;

    return NextResponse.json({
      foods,
      originalText: text,
      isPreviousDayReference: false,
      detectedMeal,
    } satisfies ParseTextResponse);
  } catch (error) {
    console.error('Error parsing food text:', error);
    return NextResponse.json(
      { error: 'Failed to parse food text' },
      { status: 500 }
    );
  }
}
