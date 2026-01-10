import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, rateLimitedResponse } from '@/utils/security/rateLimit';
import { anthropic } from '@/lib/anthropic';

interface Ingredient {
  name: string;
  amount: string;
  category?: string;
}

interface MacroDelta {
  protein?: number;
  carbs?: number;
  fat?: number;
  calories?: number;
}

interface SwapSuggestion {
  ingredient: Ingredient;
  macroDelta: MacroDelta;
  reason?: string;
}

interface RequestBody {
  ingredient: Ingredient;
  mealContext?: {
    name?: string;
    type?: string;
  };
  userGoals?: string[];
  programId?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 swaps per minute
    const { ok } = checkRateLimit(request, 10, 60_000);
    if (!ok) return rateLimitedResponse();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has paid tier
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPremium: true },
    });

    if (!user?.isPremium) {
      return NextResponse.json(
        { error: 'This feature requires a premium subscription' },
        { status: 403 }
      );
    }

    const body: RequestBody = await request.json();
    const { ingredient, mealContext, userGoals = [] } = body;

    if (!ingredient?.name || !ingredient?.amount) {
      return NextResponse.json(
        { error: 'Missing ingredient name or amount' },
        { status: 400 }
      );
    }

    // Build prompt for AI
    const prompt = buildSwapPrompt(ingredient, mealContext, userGoals);

    const message = await anthropic.messages.create({
      model: process.env.HAIKU_MODEL || 'claude-3-5-haiku-20241022',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const textContent = message.content[0];
    if (textContent.type !== 'text') {
      return NextResponse.json(
        { error: 'Failed to generate suggestions' },
        { status: 500 }
      );
    }

    const suggestions = parseSwapSuggestions(textContent.text);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error in swap-suggestions route:', error);
    return NextResponse.json(
      { error: 'Failed to generate swap suggestions' },
      { status: 500 }
    );
  }
}

function buildSwapPrompt(
  ingredient: Ingredient,
  mealContext?: { name?: string; type?: string },
  userGoals: string[] = []
): string {
  const goalText = userGoals.length > 0
    ? `User goals: ${userGoals.join(', ')}`
    : 'User wants healthier alternatives';

  const mealInfo = mealContext?.name
    ? `This ingredient is part of "${mealContext.name}" (${mealContext.type || 'meal'}).`
    : '';

  return `You are a nutrition expert. Suggest 3-4 ingredient swaps for the following:

Current ingredient: ${ingredient.amount} ${ingredient.name}
${mealInfo}
${goalText}

For each swap suggestion, provide:
1. A replacement ingredient with amount
2. Estimated macro differences compared to original (protein, carbs, fat, calories)
3. A brief reason why this swap is good

Return ONLY valid JSON array with this exact format:
[
  {
    "ingredient": { "name": "replacement name", "amount": "amount with unit" },
    "macroDelta": { "protein": 5, "carbs": -10, "fat": 0, "calories": -40 },
    "reason": "Brief reason"
  }
]

Rules:
- Suggest practical, commonly available ingredients
- Match amounts to be realistic (e.g., if original is 1 cup, suggest similar volumes)
- Macro deltas should be rough estimates comparing to original
- Use positive numbers for increases, negative for decreases
- Keep reasons concise (under 15 words)
- Do not include any text outside the JSON array`;
}

function parseSwapSuggestions(responseText: string): SwapSuggestion[] {
  try {
    // Handle potential markdown code blocks
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }

    const parsed = JSON.parse(jsonText);

    if (!Array.isArray(parsed)) {
      return [];
    }

    // Validate and sanitize each suggestion
    return parsed
      .filter((item): item is SwapSuggestion => {
        return (
          item &&
          typeof item === 'object' &&
          item.ingredient &&
          typeof item.ingredient.name === 'string' &&
          typeof item.ingredient.amount === 'string' &&
          item.macroDelta &&
          typeof item.macroDelta === 'object'
        );
      })
      .slice(0, 4) // Limit to 4 suggestions
      .map((item) => ({
        ingredient: {
          name: String(item.ingredient.name),
          amount: String(item.ingredient.amount),
          category: item.ingredient.category ? String(item.ingredient.category) : undefined,
        },
        macroDelta: {
          protein: typeof item.macroDelta.protein === 'number' ? item.macroDelta.protein : undefined,
          carbs: typeof item.macroDelta.carbs === 'number' ? item.macroDelta.carbs : undefined,
          fat: typeof item.macroDelta.fat === 'number' ? item.macroDelta.fat : undefined,
          calories: typeof item.macroDelta.calories === 'number' ? item.macroDelta.calories : undefined,
        },
        reason: item.reason ? String(item.reason) : undefined,
      }));
  } catch {
    console.error('Failed to parse swap suggestions');
    return [];
  }
}
