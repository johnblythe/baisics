import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { anthropic } from '@/lib/anthropic';

type ParsedNutrition = {
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  calories: number | null;
  confidence: 'high' | 'medium' | 'low';
  error: string | null;
};

async function parseNutritionScreenshot(base64Image: string): Promise<ParsedNutrition> {
  try {
    // Extract base64 data and media type
    const base64String = base64Image.includes(',')
      ? base64Image.split(',')[1]
      : base64Image;
    const mediaType = base64Image.includes(';')
      ? base64Image.split(';')[0].split(':')[1] as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
      : 'image/png';

    const prompt = `Extract daily nutrition totals from this screenshot (likely from MyFitnessPal or similar app).

Look for:
- Total calories for the day
- Protein in grams
- Carbohydrates in grams
- Fat in grams

Return ONLY valid JSON with these exact keys:
{
  "protein": number or null,
  "carbs": number or null,
  "fats": number or null,
  "calories": number or null,
  "confidence": "high" | "medium" | "low",
  "error": string or null
}

Rules:
- Use null for any value you cannot clearly read
- Set confidence to "high" if all values are clearly visible
- Set confidence to "medium" if some values are estimated or partially visible
- Set confidence to "low" if the image quality is poor or values are unclear
- Set error to a brief description if there's an issue (e.g., "Image too blurry", "Not a nutrition screenshot")
- Do not include any text outside the JSON object`;

    const message = await anthropic.messages.create({
      model: process.env.SONNET_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64String,
            },
          },
          { type: 'text', text: prompt }
        ],
      }]
    });

    const textContent = message.content[0];
    if (textContent.type !== 'text') {
      return {
        protein: null,
        carbs: null,
        fats: null,
        calories: null,
        confidence: 'low',
        error: 'Failed to get text response from AI',
      };
    }

    // Try to parse JSON from response
    try {
      // Handle potential markdown code blocks
      let jsonText = textContent.text.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
      }

      const parsed = JSON.parse(jsonText);
      return {
        protein: typeof parsed.protein === 'number' ? Math.round(parsed.protein) : null,
        carbs: typeof parsed.carbs === 'number' ? Math.round(parsed.carbs) : null,
        fats: typeof parsed.fats === 'number' ? Math.round(parsed.fats) : null,
        calories: typeof parsed.calories === 'number' ? Math.round(parsed.calories) : null,
        confidence: parsed.confidence || 'medium',
        error: parsed.error || null,
      };
    } catch {
      return {
        protein: null,
        carbs: null,
        fats: null,
        calories: null,
        confidence: 'low',
        error: 'Failed to parse nutrition values from screenshot',
      };
    }
  } catch (error) {
    console.error('Error parsing nutrition screenshot:', error);
    return {
      protein: null,
      carbs: null,
      fats: null,
      calories: null,
      confidence: 'low',
      error: 'Failed to analyze screenshot',
    };
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { image } = body;

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid image data' },
        { status: 400 }
      );
    }

    const result = await parseNutritionScreenshot(image);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in nutrition parse route:', error);
    return NextResponse.json(
      { error: 'Failed to parse screenshot' },
      { status: 500 }
    );
  }
}
