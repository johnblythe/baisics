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

    let suggestions: SwapSuggestion[];

    try {
      // Check if Anthropic API key is configured
      if (!process.env.ANTHROPIC_API_KEY) {
        console.warn('ANTHROPIC_API_KEY not configured, using fallback suggestions');
        suggestions = getFallbackSuggestions(ingredient);
      } else {
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
          console.warn('AI response was not text, using fallback suggestions');
          suggestions = getFallbackSuggestions(ingredient);
        } else {
          suggestions = parseSwapSuggestions(textContent.text);

          // If parsing failed or returned empty, use fallback
          if (suggestions.length === 0) {
            console.warn('Failed to parse AI response, using fallback suggestions');
            suggestions = getFallbackSuggestions(ingredient);
          }
        }
      }
    } catch (aiError) {
      // Log the specific AI error for debugging
      console.error('AI call failed:', aiError instanceof Error ? aiError.message : aiError);
      // Fall back to hardcoded suggestions
      suggestions = getFallbackSuggestions(ingredient);
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    // Only truly unexpected errors reach here (auth, rate limit, parsing request body, etc.)
    console.error('Error in swap-suggestions route:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
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

// Fallback suggestions by ingredient category when AI fails
function getFallbackSuggestions(ingredient: Ingredient): SwapSuggestion[] {
  const name = ingredient.name.toLowerCase();

  // Protein sources
  if (name.includes('chicken') || name.includes('beef') || name.includes('pork') || name.includes('steak')) {
    return [
      { ingredient: { name: 'Turkey breast', amount: ingredient.amount }, macroDelta: { protein: 2, carbs: 0, fat: -5, calories: -30 }, reason: 'Leaner protein option' },
      { ingredient: { name: 'Salmon fillet', amount: ingredient.amount }, macroDelta: { protein: 0, carbs: 0, fat: 5, calories: 20 }, reason: 'Rich in omega-3 fatty acids' },
      { ingredient: { name: 'Tofu (firm)', amount: ingredient.amount }, macroDelta: { protein: -8, carbs: 2, fat: -5, calories: -80 }, reason: 'Plant-based, lower calorie option' },
    ];
  }

  // Dairy
  if (name.includes('milk') || name.includes('cream') || name.includes('cheese')) {
    return [
      { ingredient: { name: 'Greek yogurt', amount: ingredient.amount }, macroDelta: { protein: 8, carbs: -2, fat: -5, calories: -20 }, reason: 'Higher protein, lower fat' },
      { ingredient: { name: 'Almond milk (unsweetened)', amount: ingredient.amount }, macroDelta: { protein: -6, carbs: -10, fat: -5, calories: -100 }, reason: 'Lower calorie dairy alternative' },
      { ingredient: { name: 'Cottage cheese', amount: ingredient.amount }, macroDelta: { protein: 12, carbs: 2, fat: -8, calories: -40 }, reason: 'High protein, versatile substitute' },
    ];
  }

  // Carbs/Grains
  if (name.includes('rice') || name.includes('pasta') || name.includes('bread') || name.includes('noodle')) {
    return [
      { ingredient: { name: 'Quinoa', amount: ingredient.amount }, macroDelta: { protein: 4, carbs: -5, fat: 2, calories: -20 }, reason: 'Complete protein, more fiber' },
      { ingredient: { name: 'Cauliflower rice', amount: ingredient.amount }, macroDelta: { protein: -4, carbs: -35, fat: 0, calories: -150 }, reason: 'Low carb alternative' },
      { ingredient: { name: 'Sweet potato', amount: ingredient.amount }, macroDelta: { protein: 0, carbs: 5, fat: 0, calories: 10 }, reason: 'More vitamins and fiber' },
    ];
  }

  // Oils/Fats
  if (name.includes('oil') || name.includes('butter') || name.includes('margarine')) {
    return [
      { ingredient: { name: 'Olive oil', amount: ingredient.amount }, macroDelta: { protein: 0, carbs: 0, fat: 0, calories: 0 }, reason: 'Heart-healthy monounsaturated fats' },
      { ingredient: { name: 'Avocado oil', amount: ingredient.amount }, macroDelta: { protein: 0, carbs: 0, fat: 0, calories: 0 }, reason: 'High smoke point, nutrient rich' },
      { ingredient: { name: 'Coconut oil', amount: ingredient.amount }, macroDelta: { protein: 0, carbs: 0, fat: 0, calories: 0 }, reason: 'MCTs for quick energy' },
    ];
  }

  // Sugar/Sweeteners
  if (name.includes('sugar') || name.includes('honey') || name.includes('syrup')) {
    return [
      { ingredient: { name: 'Stevia', amount: '1 packet' }, macroDelta: { protein: 0, carbs: -15, fat: 0, calories: -60 }, reason: 'Zero calorie natural sweetener' },
      { ingredient: { name: 'Monk fruit sweetener', amount: '1 tbsp' }, macroDelta: { protein: 0, carbs: -15, fat: 0, calories: -60 }, reason: 'Natural, no blood sugar spike' },
      { ingredient: { name: 'Mashed banana', amount: '1/4 cup' }, macroDelta: { protein: 0, carbs: 10, fat: 0, calories: 25 }, reason: 'Natural sweetness with potassium' },
    ];
  }

  // Vegetables (generic)
  if (name.includes('lettuce') || name.includes('spinach') || name.includes('kale') || name.includes('greens')) {
    return [
      { ingredient: { name: 'Arugula', amount: ingredient.amount }, macroDelta: { protein: 0, carbs: 0, fat: 0, calories: 0 }, reason: 'Peppery flavor, rich in vitamin K' },
      { ingredient: { name: 'Mixed baby greens', amount: ingredient.amount }, macroDelta: { protein: 1, carbs: 0, fat: 0, calories: 5 }, reason: 'Variety of nutrients' },
      { ingredient: { name: 'Swiss chard', amount: ingredient.amount }, macroDelta: { protein: 1, carbs: 1, fat: 0, calories: 5 }, reason: 'High in magnesium and iron' },
    ];
  }

  // Default/generic fallback
  return [
    { ingredient: { name: 'Similar lower-calorie option', amount: ingredient.amount }, macroDelta: { protein: 0, carbs: -5, fat: -3, calories: -50 }, reason: 'Generic lighter alternative' },
    { ingredient: { name: 'Higher protein alternative', amount: ingredient.amount }, macroDelta: { protein: 10, carbs: 0, fat: 0, calories: 40 }, reason: 'Boost protein intake' },
    { ingredient: { name: 'Whole food version', amount: ingredient.amount }, macroDelta: { protein: 0, carbs: 0, fat: 0, calories: 0 }, reason: 'Less processed, more nutrients' },
  ];
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
