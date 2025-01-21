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

    console.log('Program check-ins:', JSON.stringify(program?.checkIns, null, 2));

    if (!program) {
      return NextResponse.json([], { status: 200 });
    }

    const photos = program.checkIns?.flatMap(checkIn => 
      checkIn.photos.map(photo => {
        console.log('Processing photo:', {
          id: photo.id,
          hasProgressPhoto: !!photo.progressPhoto,
          hasUserStats: !!photo.progressPhoto?.[0]?.userStats,
          stats: photo.progressPhoto?.[0]?.userStats
        });
        
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

    console.log('Transformed photos:', photos.map(p => ({
      id: p.id,
      hasStats: !!p.userStats,
      stats: p.userStats
    })));

    return NextResponse.json(photos);
  } catch (error) {
    console.error('Error fetching progress photos:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 