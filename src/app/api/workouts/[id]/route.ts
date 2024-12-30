import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const workout = await prisma.workout.findUnique({
      where: {
        id: params.id,
      },
      include: {
        exercises: {
          include: {
            exerciseLibrary: true,
          },
        },
      },
    });

    if (!workout) {
      return new NextResponse('Workout not found', { status: 404 });
    }

    return NextResponse.json(workout);
  } catch (error) {
    console.error('Error fetching workout:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 