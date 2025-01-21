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
            photos: true,
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

    console.log('Raw program data:', JSON.stringify(program, null, 2));

    const photos = program.checkIns?.flatMap(checkIn => 
      checkIn.photos.map(photo => ({
        id: photo.id,
        base64Data: photo.base64Data,
        type: photo.type || null,
        userStats: null,
        createdAt: checkIn.createdAt
      }))
    ) || [];

    console.log('Transformed photos:', JSON.stringify(photos, null, 2));

    return NextResponse.json(photos);
  } catch (error) {
    console.error('Error fetching progress photos:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 