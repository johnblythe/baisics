import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  context: { params: Promise<{ workoutId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const { workoutId } = await context.params;

  try {
    const { exerciseLibraryId, sets = 3 } = await request.json();

    // Verify the workout belongs to the user
    const workout = await prisma.workout.findFirst({
      where: { id: workoutId },
      include: {
        workoutPlan: {
          include: {
            program: true,
          },
        },
      },
    });

    if (!workout || workout.workoutPlan.program?.userId !== userId) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    // Look up the exercise library record
    const exerciseLib = await prisma.exerciseLibrary.findUnique({
      where: { id: exerciseLibraryId },
    });

    if (!exerciseLib) {
      return NextResponse.json({ error: 'Exercise not found in library' }, { status: 404 });
    }

    // Get current max sortOrder
    const maxSortExercise = await prisma.exercise.findFirst({
      where: { workoutId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    const maxSort = maxSortExercise?.sortOrder ?? -1;

    // Create the exercise
    const newExercise = await prisma.exercise.create({
      data: {
        workoutId,
        exerciseLibraryId,
        name: exerciseLib.name,
        sets,
        restPeriod: 60,
        sortOrder: maxSort + 1,
      },
    });

    // Find the in-progress workout log
    const workoutLog = await prisma.workoutLog.findFirst({
      where: {
        workoutId,
        userId,
        status: 'in_progress',
      },
    });

    if (!workoutLog) {
      return NextResponse.json({ error: 'No active workout log found' }, { status: 404 });
    }

    // Create the exercise log
    const exerciseLog = await prisma.exerciseLog.create({
      data: {
        workoutLogId: workoutLog.id,
        exerciseId: newExercise.id,
      },
    });

    return NextResponse.json({
      exercise: {
        id: newExercise.id,
        name: newExercise.name,
        sets: newExercise.sets,
        restPeriod: newExercise.restPeriod,
        exerciseLibraryId: newExercise.exerciseLibraryId,
        sortOrder: newExercise.sortOrder,
      },
      exerciseLogId: exerciseLog.id,
    });
  } catch (error) {
    console.error('Error adding exercise to freestyle workout:', error);
    return NextResponse.json(
      { error: 'Failed to add exercise' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ workoutId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const { workoutId } = await context.params;

  try {
    const url = new URL(request.url);
    const exerciseId = url.searchParams.get('exerciseId');

    if (!exerciseId) {
      return NextResponse.json({ error: 'exerciseId is required' }, { status: 400 });
    }

    // Verify the workout belongs to the user
    const workout = await prisma.workout.findFirst({
      where: { id: workoutId },
      include: {
        workoutPlan: {
          include: {
            program: true,
          },
        },
      },
    });

    if (!workout || workout.workoutPlan.program?.userId !== userId) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    // Find the exercise log for this exercise
    const exerciseLog = await prisma.exerciseLog.findFirst({
      where: {
        exerciseId,
        workoutLog: {
          workoutId,
          userId,
        },
      },
      include: {
        setLogs: true,
      },
    });

    // Check if any sets have been logged
    if (exerciseLog && exerciseLog.setLogs.length > 0) {
      return NextResponse.json(
        { error: 'Cannot remove exercise with logged sets' },
        { status: 400 }
      );
    }

    // Delete exercise log first, then exercise
    if (exerciseLog) {
      await prisma.exerciseLog.delete({
        where: { id: exerciseLog.id },
      });
    }

    await prisma.exercise.delete({
      where: { id: exerciseId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing exercise from freestyle workout:', error);
    return NextResponse.json(
      { error: 'Failed to remove exercise' },
      { status: 500 }
    );
  }
}
