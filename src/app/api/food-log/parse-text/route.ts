import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { anthropic } from '@/lib/anthropic';

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

type ParseTextResponse = {
  foods: ParsedFood[];
  originalText: string;
  isPreviousDayReference: boolean;
};

// POST /api/food-log/parse-text - parses natural language food text
export async function POST(request: Request) {
  try {
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

    // Use Claude to parse natural language food input
    const prompt = `Parse this food logging text into structured food data. The user is logging food they ate.

Text: "${text}"

Extract each food item mentioned and estimate nutritional values. Common patterns include:
- "6oz chicken breast" or "chicken breast 6 oz"
- "2 eggs"
- "cup of rice" or "1 cup rice"
- "greek yogurt with honey"
- "protein shake"
- Multiple foods separated by commas, "and", or newlines

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
  ]
}

Confidence levels:
- "high": Common food with clear serving size (e.g., "6oz chicken breast", "2 eggs")
- "medium": Common food but serving size is estimated (e.g., "chicken breast", "some rice")
- "low": Uncommon food, unclear description, or highly variable nutrition

If the text doesn't contain any food items, return: { "foods": [] }`;

    const message = await anthropic.messages.create({
      model: process.env.SONNET_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const textContent = message.content[0];
    if (textContent.type !== 'text') {
      return NextResponse.json(
        { error: 'Failed to get text response from AI' },
        { status: 500 }
      );
    }

    // Parse JSON response
    let jsonText = textContent.text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }

    let parsed: { foods: ParsedFood[] };
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      console.error('Failed to parse AI response:', textContent.text);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    // Validate and normalize response
    const foods: ParsedFood[] = (parsed.foods || []).map(food => ({
      name: String(food.name || 'Unknown food'),
      servingSize: typeof food.servingSize === 'number' ? food.servingSize : 1,
      servingUnit: String(food.servingUnit || 'serving'),
      calories: Math.round(Number(food.calories) || 0),
      protein: Math.round((Number(food.protein) || 0) * 10) / 10,
      carbs: Math.round((Number(food.carbs) || 0) * 10) / 10,
      fat: Math.round((Number(food.fat) || 0) * 10) / 10,
      confidence: (['high', 'medium', 'low'].includes(food.confidence)
        ? food.confidence
        : 'medium') as 'high' | 'medium' | 'low',
    }));

    return NextResponse.json({
      foods,
      originalText: text,
      isPreviousDayReference: false,
    } satisfies ParseTextResponse);
  } catch (error) {
    console.error('Error parsing food text:', error);
    return NextResponse.json(
      { error: 'Failed to parse food text' },
      { status: 500 }
    );
  }
}
