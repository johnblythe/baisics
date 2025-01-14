import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendMessage } from '@/utils/chat';
import type { ContentBlock } from '@anthropic-ai/sdk/src/resources/messages.js';
import { auth } from '@/auth';

type ImageAnalysis = {
  bodyFatPercentage: number;
  muscleMassDistribution: string;
};

type AIMessage = {
  role: 'user' | 'assistant';
  content: string;
};

// Helper function to analyze body composition from images
async function analyzeBodyComposition(images: { base64Data: string }[]): Promise<ImageAnalysis | null> {
  try {
    const imageMessages = images.map(image => {
      const base64String = image.base64Data.split(',')[1];
      const mediaType = image.base64Data.split(';')[0].split(':')[1];
      
      return {
        type: "image",
        source: {
          type: "base64",
          media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
          data: base64String,
        },
      };
    });

    // Add the analysis prompt
    const prompt = "Please analyze these images and estimate body fat percentage and muscle mass distribution. Format your response as JSON with keys bodyFatPercentage (number) and muscleMassDistribution (string).";

    // Send to AI for analysis
    const aiResponse = await sendMessage([{
      role: 'user',
      content: prompt,
    }]);

    if (!aiResponse.success) {
      throw new Error('AI analysis failed');
    }

    // Parse the response
    const content = aiResponse.data?.content as ContentBlock[];
    const textBlock = content?.find(block => 'text' in block);
    const analysisText = textBlock && 'text' in textBlock ? textBlock.text : null;

    try {
      if (!analysisText) return null;
      const parsed = JSON.parse(analysisText);
      if (typeof parsed.bodyFatPercentage === 'number' && typeof parsed.muscleMassDistribution === 'string') {
        return parsed as ImageAnalysis;
      }
      return null;
    } catch {
      return null;
    }
  } catch (error) {
    console.error('Error analyzing body composition:', error);
    return null;
  }
}

// POST /api/progress/check-in
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'User not authenticated' });
    }
    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' });
    }

    const data = await req.json();
    const { programId, photos, stats } = data;

    // Create a new check-in
    const checkIn = await prisma.$transaction(async (tx) => {
      // Create the check-in first
      const newCheckIn = await tx.checkIn.create({
        data: {
          programId,
          type: stats.isInitial ? 'initial' : 'progress',
          date: new Date(),
          user: { connect: { id: userId } },
          program: { connect: { id: programId } }
        }
      });

      // Create photos
      if (photos.length > 0) {
        await tx.userImages.createMany({
          data: photos.map((photo: any) => ({
            userId,
            programId,
            fileName: photo.fileName,
            base64Data: photo.base64Data,
            type: stats.isInitial ? 'before' : 'progress',
            checkInId: newCheckIn.id
          }))
        });
      }

      // Create stats
      await tx.userStats.create({
        data: {
          userId,
          programId,
          checkInId: newCheckIn.id,
          weight: stats.weight,
          // bodyFat: stats.bodyFat,
          notes: stats.notes,
          sleepHours: stats.sleepHours,
          sleepQuality: stats.sleepQuality,
          energyLevel: stats.energyLevel,
          stressLevel: stats.stressLevel,
          soreness: stats.soreness,
          recovery: stats.recovery,
          calories: stats.calories,
          proteinGrams: stats.proteinGrams,
          carbGrams: stats.carbGrams,
          fatGrams: stats.fatGrams,
          waterLiters: stats.waterLiters,
          dietAdherence: stats.dietAdherence,
          hungerLevels: stats.hungerLevels,
          cravings: stats.cravings,
          chest: stats.chest,
          waist: stats.waist,
          hips: stats.hips,
          bicepLeft: stats.bicepLeft,
          bicepRight: stats.bicepRight,
          bicepLeftFlex: stats.bicepLeftFlex,
          bicepRightFlex: stats.bicepRightFlex,
          thighLeft: stats.thighLeft,
          thighRight: stats.thighRight,
          calfLeft: stats.calfLeft,
          calfRight: stats.calfRight,
        
        }
      });

      // Return the check-in with related data
      return tx.checkIn.findUnique({
        where: { id: newCheckIn.id },
        include: {
          photos: true,
          stats: true
        }
      });
    });

    if (!checkIn) {
      throw new Error('Failed to create check-in');
    }

    // If this is the initial check-in, analyze body composition
    if (stats.isInitial && photos.length > 0) {
      const analysis = await analyzeBodyComposition(photos);
      if (analysis) {
        // Update the workout plan with the analysis
        await prisma.workoutPlan.updateMany({
          where: {
            userId,
            programId
          },
          data: {
            bodyFatPercentage: analysis.bodyFatPercentage,
            muscleMassDistribution: analysis.muscleMassDistribution
          }
        });
      }
    }

    return NextResponse.json({ success: true, checkIn });
  } catch (error) {
    console.error('Error creating check-in:', error);
    return NextResponse.json({ error: 'Failed to create check-in' }, { status: 500 });
  }
}

// GET /api/progress?programId=xxx
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'User not authenticated' });
    }
    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' });
    }

    const { searchParams } = new URL(req.url);
    const programId = searchParams.get('programId');

    if (!programId) {
      return NextResponse.json({ error: 'Program ID is required' }, { status: 400 });
    }

    const checkIns = await prisma.checkIn.findMany({
      where: {
        userId,
        programId
      },
      include: {
        photos: {
          where: {
            deletedAt: null
          }
        },
        stats: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, checkIns });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}

// DELETE /api/progress/photos/:id
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'User not authenticated' });
    }
    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' });
    }
    const { id } = await req.json();

    await prisma.userImages.update({
      where: {
        id,
        userId
      },
      data: {
        deletedAt: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
} 