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
            createdAt: 'asc', // Oldest first for comparison
          },
        },
      },
    });

    if (!program) {
      return NextResponse.json({ checkIns: [] }, { status: 200 });
    }

    // Group photos by check-in for comparison
    const checkIns = program.checkIns
      .filter(checkIn => checkIn.photos.length > 0) // Only include check-ins with photos
      .map(checkIn => ({
        id: checkIn.id,
        date: checkIn.createdAt.toISOString(),
        photos: checkIn.photos.map(photo => ({
          id: photo.id,
          base64Data: photo.base64Data,
          type: photo.type || null,
          createdAt: checkIn.createdAt.toISOString(),
          userStats: photo.progressPhoto?.[0]?.userStats ? {
            bodyFatLow: photo.progressPhoto[0].userStats.bodyFatLow,
            bodyFatHigh: photo.progressPhoto[0].userStats.bodyFatHigh,
            muscleMassDistribution: photo.progressPhoto[0].userStats.muscleMassDistribution,
          } : null,
        })),
      }));

    return NextResponse.json({ checkIns });
  } catch (error) {
    console.error('Error fetching check-ins for comparison:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
