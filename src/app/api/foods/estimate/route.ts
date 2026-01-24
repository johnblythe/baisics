import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkRateLimit, rateLimitedResponse } from '@/utils/security/rateLimit';
import { anthropic } from '@/lib/anthropic';

type EstimatedFood = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: 'high' | 'medium' | 'low';
  reasoning?: string;
};

type EstimateResponse = EstimatedFood | { error: string };

/**
 * Estimate nutrition from a natural language food description using AI.
 * POST /api/foods/estimate
 * Body: { description: string }
 *
 * Returns estimated macros with confidence level.
 * Note: These are AI estimates and may not be exact.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 30 estimates per minute (AI calls are expensive)
    const { ok } = checkRateLimit(request, 30, 60_000);
    if (!ok) return rateLimitedResponse();

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { description } = body;

    // Validate description
    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid description' },
        { status: 400 }
      );
    }

    const trimmedDescription = description.trim();
    if (trimmedDescription.length < 3) {
      return NextResponse.json(
        { error: 'Description must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (trimmedDescription.length > 500) {
      return NextResponse.json(
        { error: 'Description must be 500 characters or less' },
        { status: 400 }
      );
    }

    const result = await estimateFoodNutrition(trimmedDescription);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 422 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in food estimate route:', error);
    return NextResponse.json(
      { error: 'Failed to estimate nutrition' },
      { status: 500 }
    );
  }
}

async function estimateFoodNutrition(description: string): Promise<EstimateResponse> {
  try {
    const prompt = `You are a nutrition expert. Estimate the macronutrients for the following food description.

Food description: "${description}"

Guidelines:
- Parse the description to understand the food item(s), portion size, and preparation method
- If no portion is specified, assume a typical single serving
- Consider cooking methods (fried adds fat, grilled is leaner, etc.)
- Account for common additions (oil, butter, sauces) if implied
- Round to reasonable whole numbers

IMPORTANT: These estimates are approximate. Different preparations and brands can vary significantly.

Return ONLY valid JSON with these exact keys:
{
  "name": "A clean, concise name for this food (e.g., 'Grilled Chicken Breast' not the full description)",
  "calories": number,
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "confidence": "high" | "medium" | "low",
  "reasoning": "Brief explanation of your estimate (optional, 1-2 sentences)"
}

Confidence levels:
- "high": Common food with well-known nutrition (e.g., "banana", "chicken breast")
- "medium": Food with some variation (e.g., "homemade pasta", "restaurant burger")
- "low": Ambiguous description or highly variable food (e.g., "some snacks", "casserole")

If the description is not a food item or is completely uninterpretable, return:
{
  "error": "Brief explanation of why this cannot be estimated"
}

Do not include any text outside the JSON object.`;

    const message = await anthropic.messages.create({
      model: process.env.HAIKU_MODEL || 'claude-3-5-haiku-20241022',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const textContent = message.content[0];
    if (textContent.type !== 'text') {
      return { error: 'Failed to get response from AI' };
    }

    // Parse JSON from response
    try {
      // Handle potential markdown code blocks
      let jsonText = textContent.text.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
      }

      const parsed = JSON.parse(jsonText);

      // Check if AI returned an error
      if (parsed.error) {
        return { error: parsed.error };
      }

      // Validate required fields
      if (
        typeof parsed.name !== 'string' ||
        typeof parsed.calories !== 'number' ||
        typeof parsed.protein !== 'number' ||
        typeof parsed.carbs !== 'number' ||
        typeof parsed.fat !== 'number'
      ) {
        return { error: 'Failed to parse nutrition estimate' };
      }

      return {
        name: parsed.name,
        calories: Math.round(parsed.calories),
        protein: Math.round(parsed.protein),
        carbs: Math.round(parsed.carbs),
        fat: Math.round(parsed.fat),
        confidence: parsed.confidence || 'medium',
        reasoning: parsed.reasoning || undefined,
      };
    } catch {
      return { error: 'Failed to parse AI response' };
    }
  } catch (error) {
    console.error('Error estimating food nutrition:', error);
    return { error: 'Failed to estimate nutrition' };
  }
}
