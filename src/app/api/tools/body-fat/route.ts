import { NextResponse } from 'next/server';
import { anthropic } from '@/lib/anthropic';
import {
  createEstimate,
  BODY_FAT_ANALYSIS_PROMPT,
  type Sex,
  type BodyFatEstimate,
} from '@/utils/bodyFat';

interface AnalysisResponse {
  bodyFatPercentageLow: number;
  bodyFatPercentageHigh: number;
  confidence: 'low' | 'medium' | 'high';
  reasoning: string;
  error: string | null;
}

interface RequestBody {
  image: string; // base64 data URL
  sex: Sex;
}

/**
 * POST /api/tools/body-fat
 *
 * Analyzes a physique photo and estimates body fat percentage.
 * Privacy-first: no images are stored, only processed and discarded.
 */
export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const { image, sex } = body;

    if (!image || !sex) {
      return NextResponse.json(
        { error: 'Missing required fields: image, sex' },
        { status: 400 }
      );
    }

    if (sex !== 'male' && sex !== 'female') {
      return NextResponse.json(
        { error: 'Sex must be "male" or "female"' },
        { status: 400 }
      );
    }

    // Extract base64 data and media type
    const base64Match = image.match(/^data:([^;]+);base64,(.+)$/);
    if (!base64Match) {
      return NextResponse.json(
        { error: 'Invalid image format. Expected base64 data URL.' },
        { status: 400 }
      );
    }

    const [, mediaType, base64Data] = base64Match;
    const validMediaTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!validMediaTypes.includes(mediaType)) {
      return NextResponse.json(
        { error: `Unsupported image type: ${mediaType}` },
        { status: 400 }
      );
    }

    // Analyze with AI
    const message = await anthropic.messages.create({
      model: process.env.SONNET_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: base64Data,
            },
          },
          {
            type: 'text',
            text: BODY_FAT_ANALYSIS_PROMPT,
          },
        ],
      }],
    });

    const textContent = message.content[0];
    if (textContent.type !== 'text') {
      return NextResponse.json(
        { error: 'Unexpected response from AI' },
        { status: 500 }
      );
    }

    // Parse and validate response
    let analysis: AnalysisResponse;
    try {
      analysis = JSON.parse(textContent.text);
    } catch {
      console.error('Failed to parse AI response:', textContent.text);
      return NextResponse.json(
        { error: 'Failed to parse analysis response' },
        { status: 500 }
      );
    }

    // Validate response structure
    if (
      typeof analysis.bodyFatPercentageLow !== 'number' ||
      typeof analysis.bodyFatPercentageHigh !== 'number' ||
      !['low', 'medium', 'high'].includes(analysis.confidence)
    ) {
      console.error('Invalid AI response structure:', analysis);
      return NextResponse.json(
        { error: 'Invalid analysis response structure' },
        { status: 500 }
      );
    }

    // Check for analysis error
    if (analysis.error) {
      return NextResponse.json({
        success: false,
        error: analysis.error,
        estimate: null,
      });
    }

    // Create estimate with full context
    const estimate: BodyFatEstimate = createEstimate(
      analysis.bodyFatPercentageLow,
      analysis.bodyFatPercentageHigh,
      sex,
      analysis.confidence
    );

    return NextResponse.json({
      success: true,
      estimate,
      reasoning: analysis.reasoning,
    });
  } catch (error) {
    console.error('Error in body fat analysis:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
