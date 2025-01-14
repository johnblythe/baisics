import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { anthropic } from '@/lib/anthropic';
import { PhotoType } from '@prisma/client';

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
      model: process.env.SONNET_MODEL || 'claude-3-sonnet-20240320',
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

export async function POST(request: Request) {
  try {
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
    console.log("🚀 ~ POST ~ analysis:", analysis)
    if (!analysis) {
      return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    }

    // Create or update progress photos with analysis
    await prisma.$transaction(async (tx) => {
      for (const photo of photos) {
        if (!photo.checkInId || !photo.programId) continue;

        const existingStats = photo.progressPhoto[0]?.userStats;

        // Create or update UserStats
        let userStats;
        if (existingStats) {
          // Update existing stats
          userStats = await tx.userStats.update({
            where: { id: existingStats.id },
            data: {
              bodyFatHigh: analysis.bodyFatPercentageHigh,
              bodyFatLow: analysis.bodyFatPercentageLow,
              muscleMassDistribution: analysis.muscleMassDistribution,
            },
          });
        } else {
          // Create new stats
          userStats = await tx.userStats.create({
            data: {
              userId,
              programId: photo.programId,
              checkInId: photo.checkInId,
              bodyFatHigh: analysis.bodyFatPercentageHigh,
              bodyFatLow: analysis.bodyFatPercentageLow,
              muscleMassDistribution: analysis.muscleMassDistribution,
            },
          });
        }

        const existingPhoto = photo.progressPhoto[0];

        // Create or update ProgressPhoto
        if (existingPhoto) {
          await tx.progressPhoto.update({
            where: { id: existingPhoto.id },
            data: {
              userStatsId: userStats.id,
              type: (analysis.photoType as PhotoType) || PhotoType.CUSTOM
            }
          });
        } else {
          await tx.progressPhoto.create({
            data: {
              checkInId: photo.checkInId,
              userImageId: photo.id,
              type: (analysis.photoType as PhotoType) || PhotoType.CUSTOM,
              userStatsId: userStats.id
            }
          });
        }
      }
    });

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error('Error in photo analysis route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 