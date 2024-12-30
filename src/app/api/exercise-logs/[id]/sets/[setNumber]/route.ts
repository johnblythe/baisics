import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  context: { params: { id: string; setNumber: string } }
) {
  const { id, setNumber } = context.params;

  try {
    const userId = process.env.TEST_USER_ID;
    if (!userId) {
      throw new Error('TEST_USER_ID environment variable is required');
    }

    const body = await request.json();
    const { weight, reps, notes } = body;

    // Get the exercise log to verify ownership
    const exerciseLog = await prisma.exerciseLog.findUnique({
      where: { id },
      include: {
        workoutLog: true,
      },
    });

    if (!exerciseLog) {
      return new NextResponse('Exercise log not found', { status: 404 });
    }

    if (exerciseLog.workoutLog.userId !== userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Find existing set log
    const existingSetLog = await prisma.setLog.findFirst({
      where: {
        exerciseLogId: id,
        setNumber: parseInt(setNumber),
      },
    });

    // Create or update the set log
    const setLog = existingSetLog 
      ? await prisma.setLog.update({
          where: { id: existingSetLog.id },
          data: {
            weight: weight || null,
            reps,
            notes: notes || null,
          },
        })
      : await prisma.setLog.create({
          data: {
            exerciseLogId: id,
            setNumber: parseInt(setNumber),
            weight: weight || null,
            reps,
            notes: notes || null,
          },
        });

    return NextResponse.json(setLog);
  } catch (error) {
    console.error('Error updating set log:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 