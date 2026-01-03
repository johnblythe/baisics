import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { checkRateLimit, rateLimitedResponse } from '@/utils/security/rateLimit';
import { prisma } from '@/lib/prisma';
import { anthropic } from '@/lib/anthropic';
import { PhotoType } from '@prisma/client';
import { sendEmail } from '@/lib/email';
import { adminToolUsageTemplate } from '@/lib/email/templates';

type ImageAnalysis = {
  bodyFatPercentageLow: number;
  bodyFatPercentageHigh: number;
  muscleMassDistribution: string;
  photoType: string;
  error: string | null;
};

async function analyzeBodyComposition(images: { base64Data: string }[]): Promise<ImageAnalysis | null> {
  try {
    const imageMessages = images.map(image => {
      const base64String = image.base64Data.split(',')[1];
      const mediaType = image.base64Data.split(';')[0].split(':')[1];
      
      return {
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
          data: base64String,
        },
      };
    });

    // Add the analysis prompt
    const prompt = `Please analyze these progress photos and provide:
    1. A description of the photo's angle: ${Object.values(PhotoType).join(' | ')}
    2. An estimated body fat percentage range (low and high)
    3. A description of muscle mass distribution

    Format your response as JSON with these exact keys:
    {
      "photoType": string, // ${Object.values(PhotoType).join(' | ')}
      "bodyFatPercentageLow": number,
      "bodyFatPercentageHigh": number,
      "muscleMassDistribution": string,
      "error": string | null // a description of issues like quality, lighting, etc. stopping analysis
    }

    Do not include any other text or commentary in your response. Answer only in the JSON format provided.`;

    // Send to AI for analysis
    const message = await anthropic.messages.create({
      // Use Opus for body composition - sensitive analysis, accuracy critical
      model: process.env.OPUS_MODEL || 'claude-opus-4-5-20251101',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          ...imageMessages,
          { type: 'text' as const, text: prompt }
        ],
      }]
    });

    const textContent = message.content[0];
    if (textContent.type !== 'text') return null;

    try {
      const parsed = JSON.parse(textContent.text);
      // Validate the parsed response has all required fields
      if (
        typeof parsed.bodyFatPercentageLow === 'number' &&
        typeof parsed.bodyFatPercentageHigh === 'number' &&
        typeof parsed.muscleMassDistribution === 'string' &&
        typeof parsed.photoType === 'string' &&
        (parsed.error === null || typeof parsed.error === 'string')
      ) {
        return parsed as ImageAnalysis;
      }
      console.error('Invalid response format:', parsed);
      return null;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return null;
    }
  } catch (error) {
    console.error('Error analyzing body composition:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 photo analyses per minute
    const { ok } = checkRateLimit(request, 10, 60_000);
    if (!ok) return rateLimitedResponse();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await request.json();
    const { photoIds } = body;

    if (!photoIds || !Array.isArray(photoIds)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // fetch the photos
    const photos = await prisma.userImages.findMany({
      where: {
        id: { in: photoIds },
        userId,
      },
      include: {
        progressPhoto: {
          include: {
            userStats: true
          }
        },
        checkIn: true
      }
    });

    if (!photos.length) {
      return NextResponse.json({ error: 'No photos found' }, { status: 404 });
    }

    // Analyze the photos
    const analysis = await analyzeBodyComposition(photos);
    if (!analysis) {
      return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    }

    // Create or update progress photos with analysis
    // @TODO: this will overwrite one another if there's a batch of pics, the last one will be the one that's saved
    // consider adding analysis at the image level instead or making it more sophisticated to do holistic analysis
    // across N photos for 1 checkin/stats
    await prisma.$transaction(async (tx) => {
      for (const photo of photos) {
        if (!photo.checkInId || !photo.programId) continue;

        // const existingStats = photo.progressPhoto[0]?.userStats;
        const checkInId = photo.checkInId;
        if (!checkInId) {
          console.error('No checkInId found for photo:', photo.id);
          return NextResponse.json({ error: 'No checkInId found for photo' }, { status: 400 });
        }

        // Create or update UserStats
        const userStats = await tx.userStats.upsert({
          where: {checkInId,},
          update: {
              bodyFatHigh: analysis.bodyFatPercentageHigh,
              bodyFatLow: analysis.bodyFatPercentageLow,
              muscleMassDistribution: analysis.muscleMassDistribution,
            },
          create: {
            userId,
            programId: photo.programId,
            checkInId: photo.checkInId,
            bodyFatHigh: analysis.bodyFatPercentageHigh,
            bodyFatLow: analysis.bodyFatPercentageLow,
            muscleMassDistribution: analysis.muscleMassDistribution,
          }
        });

        const existingPhoto = photo.progressPhoto[0];
        if (!existingPhoto) {
          console.error('No existing photo found for:', photo.id);
          return NextResponse.json({ error: 'No existing photo found for' }, { status: 400 });
        }

        // @TODO
        // Create or update ProgressPhoto
        await tx.progressPhoto.upsert({
          where: { id: existingPhoto.id },
          update: {
            userStatsId: userStats.id,
            type: (analysis.photoType as PhotoType) || PhotoType.CUSTOM
          },
          create: {
            checkInId: photo.checkInId,
            userImageId: photo.id,
            type: (analysis.photoType as PhotoType) || PhotoType.CUSTOM,
            userStatsId: userStats.id
          }
        });
      }
    });

    // Send admin notification (non-blocking)
    sendEmail({
      to: process.env.NEXT_PUBLIC_ADMIN_EMAIL!,
      subject: `Free Tool Used: Photo Body Composition Analyzer`,
      html: adminToolUsageTemplate({
        toolName: 'Photo Body Composition Analyzer',
        userId: session.user.id,
        userEmail: session.user.email,
        details: { photoCount: photos.length, bodyFatRange: `${analysis.bodyFatPercentageLow}-${analysis.bodyFatPercentageHigh}%` }
      })
    }).catch(err => console.error('Admin notification failed:', err));

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error('Error in photo analysis route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 