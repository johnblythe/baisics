import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

interface LatestProgramResponse {
  id: string;
}

/**
 * TODO: add a `current` field to programs
 * 
 */

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const latestProgram = await prisma.program.findFirst({
      where: { 
        createdBy: session.user.id 
      },
      orderBy: { 
        createdAt: 'desc' 
      },
      select: { 
        id: true 
      },
    });

    if (!latestProgram) {
      return NextResponse.json({ error: 'No programs found' }, { status: 404 });
    }

    return NextResponse.json(latestProgram);
  } catch (error) {
    console.error('Error fetching latest program:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 