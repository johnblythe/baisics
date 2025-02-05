import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ programId: string }> }
) {
  const { programId } = await params;
  
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const program = await prisma.program.findFirst({
      where: { 
        id: programId,
        createdBy: session.user.id,
      },
      include: {
        checkIns: {
          include: {
            photos: {
              include: {
                progressPhoto: {
                  include: {
                    userStats: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });


    if (!program) {
      return NextResponse.json([], { status: 200 });
    }

    const photos = program.checkIns?.flatMap(checkIn => 
      checkIn.photos.map(photo => {
        return {
          id: photo.id,
          base64Data: photo.base64Data,
          type: photo.type || null,
          userStats: photo.progressPhoto?.[0]?.userStats ? {
            bodyFatLow: photo.progressPhoto?.[0]?.userStats.bodyFatLow,
            bodyFatHigh: photo.progressPhoto?.[0]?.userStats.bodyFatHigh,
            muscleMassDistribution: photo.progressPhoto?.[0]?.userStats.muscleMassDistribution
          } : null,
          createdAt: checkIn.createdAt
        };
      })
    ) || [];

    return NextResponse.json(photos);
  } catch (error) {
    console.error('Error fetching progress photos:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 