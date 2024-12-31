import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  context: { params: { id: string; setNumber: string } }
) {
  const { id, setNumber } = context.params;
  console.log('Received request to update set:', { id, setNumber });

  try {
    const userId = process.env.TEST_USER_ID;
    if (!userId) {
      return new NextResponse('TEST_USER_ID environment variable is required', { status: 500 });
    }

    const body = await request.json();
    console.log('Request body:', body);

    // Validate required fields
    if (typeof body.reps !== 'number') {
      return new NextResponse('Reps is required and must be a number', { status: 400 });
    }

    // Get the exercise log to verify ownership
    const exerciseLog = await prisma.exerciseLog.findUnique({
      where: { id },
      include: {
        workoutLog: true,
      },
    });
    console.log('Found exercise log:', exerciseLog);

    if (!exerciseLog) {
      return new NextResponse(`Exercise log not found for ID: ${id}`, { status: 404 });
    }

    if (exerciseLog.workoutLog.userId !== userId) {
      return new NextResponse('Unauthorized access', { status: 401 });
    }

    const setNumberInt = parseInt(setNumber);
    if (isNaN(setNumberInt)) {
      return new NextResponse('Invalid set number', { status: 400 });
    }

    // Find existing set log
    const existingSetLog = await prisma.setLog.findFirst({
      where: {
        exerciseLogId: id,
        setNumber: setNumberInt,
      },
    });
    console.log('Existing set log:', existingSetLog);

    // Prepare the data object
    const setData = {
      weight: typeof body.weight === 'number' ? body.weight : null,
      reps: body.reps,
      notes: body.notes || null,
    };

    // Create or update the set log
    const setLog = existingSetLog 
      ? await prisma.setLog.update({
          where: { id: existingSetLog.id },
          data: setData,
        })
      : await prisma.setLog.create({
          data: {
            exerciseLogId: id,
            setNumber: setNumberInt,
            ...setData,
          },
        });

    console.log('Updated/Created set log:', setLog);
    return NextResponse.json(setLog);
  } catch (error) {
    console.error('Error updating set log:', error);
    // Return a more specific error message
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return new NextResponse(`Failed to update set: ${message}`, { status: 500 });
  }
} 