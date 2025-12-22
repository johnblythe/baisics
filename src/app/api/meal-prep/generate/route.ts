import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { checkRateLimit, rateLimitedResponse } from '@/utils/security/rateLimit';
import { anthropic } from '@/lib/anthropic';
import { v4 as uuidv4 } from 'uuid';

interface MealPrepRequest {
  targetMacros: {
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
  };
  mealsPerDay: number;
  days: number;
  preferences: string[];
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function buildPrompt(request: MealPrepRequest): string {
  const { targetMacros, mealsPerDay, days, preferences } = request;

  const mealDistribution = getMealDistribution(mealsPerDay);
  const prefsText = preferences.length > 0
    ? `Dietary preferences: ${preferences.join(', ')}`
    : 'No specific dietary preferences';

  return `Generate a ${days}-day meal plan with ${mealsPerDay} meals per day.

DAILY TARGETS:
- Calories: ${targetMacros.calories} kcal
- Protein: ${targetMacros.protein}g
- Carbs: ${targetMacros.carbs}g
- Fat: ${targetMacros.fat}g

${prefsText}

MEAL DISTRIBUTION (approximate calorie split):
${mealDistribution.map(m => `- ${m.type}: ~${Math.round(targetMacros.calories * m.ratio)} cal`).join('\n')}

REQUIREMENTS:
1. Each day should hit within 5% of calorie target and within 10% of protein target
2. Use common, readily available ingredients
3. Include realistic portion sizes (e.g., "4oz chicken breast", "1 cup rice")
4. Provide prep times for each meal
5. Keep meals practical and not overly complex

Return ONLY valid JSON in this exact format:
{
  "days": [
    {
      "day": 1,
      "dayName": "Monday",
      "meals": [
        {
          "name": "Greek Yogurt Power Bowl",
          "type": "breakfast",
          "ingredients": [
            {"name": "Greek yogurt", "amount": "1 cup (170g)", "category": "dairy"},
            {"name": "Protein powder", "amount": "1 scoop (30g)", "category": "protein"},
            {"name": "Blueberries", "amount": "1/2 cup", "category": "produce"},
            {"name": "Granola", "amount": "1/4 cup", "category": "grains"}
          ],
          "macros": {"protein": 45, "carbs": 40, "fat": 8, "calories": 412},
          "prepTime": "5 min",
          "instructions": "Mix yogurt with protein powder. Top with berries and granola."
        }
      ],
      "totalMacros": {"protein": 180, "carbs": 200, "fat": 60, "calories": 2000}
    }
  ]
}

IMPORTANT:
- Ingredient categories must be: "protein", "produce", "dairy", "grains", "pantry", "other"
- Meal types must be: "breakfast", "lunch", "dinner", "snack"
- Include ALL ${days} days in the response
- Each day must have exactly ${mealsPerDay} meals
- Be accurate with macro estimates for common foods`;
}

function getMealDistribution(mealsPerDay: number): { type: string; ratio: number }[] {
  const distributions: Record<number, { type: string; ratio: number }[]> = {
    2: [
      { type: 'lunch', ratio: 0.45 },
      { type: 'dinner', ratio: 0.55 },
    ],
    3: [
      { type: 'breakfast', ratio: 0.25 },
      { type: 'lunch', ratio: 0.35 },
      { type: 'dinner', ratio: 0.40 },
    ],
    4: [
      { type: 'breakfast', ratio: 0.20 },
      { type: 'lunch', ratio: 0.30 },
      { type: 'snack', ratio: 0.15 },
      { type: 'dinner', ratio: 0.35 },
    ],
    5: [
      { type: 'breakfast', ratio: 0.18 },
      { type: 'snack', ratio: 0.10 },
      { type: 'lunch', ratio: 0.27 },
      { type: 'snack', ratio: 0.10 },
      { type: 'dinner', ratio: 0.35 },
    ],
    6: [
      { type: 'breakfast', ratio: 0.15 },
      { type: 'snack', ratio: 0.08 },
      { type: 'lunch', ratio: 0.25 },
      { type: 'snack', ratio: 0.08 },
      { type: 'dinner', ratio: 0.32 },
      { type: 'snack', ratio: 0.12 },
    ],
  };

  return distributions[mealsPerDay] || distributions[3];
}

function extractGroceryList(days: any[]): any[] {
  const ingredientMap = new Map<string, { amount: string; category: string }>();

  for (const day of days) {
    for (const meal of day.meals) {
      for (const ing of meal.ingredients) {
        const key = ing.name.toLowerCase();
        if (!ingredientMap.has(key)) {
          ingredientMap.set(key, {
            amount: ing.amount,
            category: ing.category || 'other',
          });
        }
        // For simplicity, we don't aggregate amounts - just take first occurrence
        // A more sophisticated version would parse and sum quantities
      }
    }
  }

  return Array.from(ingredientMap.entries()).map(([name, data]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    amount: data.amount,
    category: data.category,
  }));
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 meal plans per minute
    const { ok } = checkRateLimit(request, 5, 60_000);
    if (!ok) return rateLimitedResponse();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: MealPrepRequest = await request.json();

    // Validate request
    if (!body.targetMacros || !body.mealsPerDay || !body.days) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Clamp values to reasonable limits
    const mealsPerDay = Math.min(Math.max(body.mealsPerDay, 2), 6);
    const days = Math.min(Math.max(body.days, 1), 7);

    const prompt = buildPrompt({
      ...body,
      mealsPerDay,
      days,
    });

    const message = await anthropic.messages.create({
      model: process.env.SONNET_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const textContent = message.content[0];
    if (textContent.type !== 'text') {
      return NextResponse.json(
        { error: 'Failed to generate meal plan' },
        { status: 500 }
      );
    }

    // Parse JSON from response
    let jsonText = textContent.text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      console.error('Failed to parse AI response:', jsonText);
      return NextResponse.json(
        { error: 'Failed to parse meal plan response' },
        { status: 500 }
      );
    }

    // Ensure day names are set
    const daysWithNames = parsed.days.map((day: any, idx: number) => ({
      ...day,
      day: idx + 1,
      dayName: DAY_NAMES[idx % 7],
    }));

    // Extract grocery list from all meals
    const groceryList = extractGroceryList(daysWithNames);

    const mealPlan = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      targetMacros: body.targetMacros,
      config: {
        mealsPerDay,
        days,
        preferences: body.preferences || [],
      },
      days: daysWithNames,
      groceryList,
    };

    return NextResponse.json(mealPlan);
  } catch (error) {
    console.error('Error generating meal plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate meal plan' },
      { status: 500 }
    );
  }
}
