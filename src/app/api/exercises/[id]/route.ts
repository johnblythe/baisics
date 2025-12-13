import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    // Verify user owns this exercise via workout -> workoutPlan -> program
    const exercise = await prisma.exercise.findUnique({
      where: { id },
      include: {
        workout: {
          include: {
            workoutPlan: {
              include: {
                program: true
              }
            }
          }
        }
      }
    });

    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    if (exercise.workout.workoutPlan.program?.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Build update data - only include fields that were provided
    const updateData: Record<string, any> = {};
    if (body.sets !== undefined) updateData.sets = body.sets;
    if (body.reps !== undefined) updateData.reps = body.reps;
    if (body.restPeriod !== undefined) updateData.restPeriod = body.restPeriod;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;

    const updatedExercise = await prisma.exercise.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updatedExercise);
  } catch (error) {
    console.error('Error updating exercise:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    // Verify user owns this exercise
    const exercise = await prisma.exercise.findUnique({
      where: { id },
      include: {
        workout: {
          include: {
            workoutPlan: {
              include: {
                program: true
              }
            }
          }
        }
      }
    });

    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    if (exercise.workout.workoutPlan.program?.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the exercise
    await prisma.exercise.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const exercise = await prisma.exercise.findUnique({
      where: { id },
      include: {
        exerciseLibrary: true,
        workout: {
          include: {
            workoutPlan: {
              include: {
                program: true
              }
            }
          }
        }
      }
    });

    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    if (exercise.workout.workoutPlan.program?.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(exercise);
  } catch (error) {
    console.error('Error fetching exercise:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
