import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { checkRateLimit, rateLimitedResponse } from '@/utils/security/rateLimit';
import { anthropic } from '@/lib/anthropic';
import { sendEmail } from '@/lib/email';
import { adminToolUsageTemplate } from '@/lib/email/templates';

type ParsedNutrition = {
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  calories: number | null;
  confidence: 'high' | 'medium' | 'low';
  error: string | null;      // Fatal error - no usable data extracted
  warning: string | null;    // Non-fatal warning - data extracted but with caveats
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
  "error": string or null,
  "warning": string or null
}

Rules:
- Use null for any value you cannot clearly read
- Macros (protein, carbs, fats) without calories is VALID - many screenshots show macros only
- If you can extract ANY macros (protein, carbs, or fats), this is a successful parse with error: null
- Set confidence to "high" if macros are clearly visible (even without calories)
- Set confidence to "medium" if some values are estimated or partially visible
- Set confidence to "low" if the image quality is poor or values are unclear
- ONLY set error if: the image is NOT a nutrition screenshot, OR the image is completely unreadable
- Set warning (not error) if: image is blurry but readable, values are partially obscured, or estimates were made
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
        warning: null,
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
        warning: parsed.warning || null,
      };
    } catch {
      return {
        protein: null,
        carbs: null,
        fats: null,
        calories: null,
        confidence: 'low',
        error: 'Failed to parse nutrition values from screenshot',
        warning: null,
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
      warning: null,
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 20 parses per minute
    const { ok } = checkRateLimit(request, 20, 60_000);
    if (!ok) return rateLimitedResponse();

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

    // Send admin notification (non-blocking)
    sendEmail({
      to: process.env.NEXT_PUBLIC_ADMIN_EMAIL!,
      subject: `Free Tool Used: Nutrition Screenshot Parser`,
      html: adminToolUsageTemplate({
        toolName: 'Nutrition Screenshot Parser',
        userId: session.user.id,
        userEmail: session.user.email,
        details: result.error ? { error: result.error } : { calories: result.calories, protein: result.protein }
      })
    }).catch(err => console.error('Admin notification failed:', err));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in nutrition parse route:', error);
    return NextResponse.json(
      { error: 'Failed to parse screenshot' },
      { status: 500 }
    );
  }
}
