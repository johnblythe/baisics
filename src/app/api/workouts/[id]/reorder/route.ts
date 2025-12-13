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

    const { id: workoutId } = await context.params;
    const body = await request.json();
    const { exerciseIds } = body;

    if (!Array.isArray(exerciseIds)) {
      return NextResponse.json({ error: 'exerciseIds array required' }, { status: 400 });
    }

    // Verify user owns this workout
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
      include: {
        workoutPlan: {
          include: {
            program: true
          }
        },
        exercises: true
      }
    });

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    if (workout.workoutPlan.program?.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Verify all exercise IDs belong to this workout
    const workoutExerciseIds = new Set(workout.exercises.map(e => e.id));
    for (const id of exerciseIds) {
      if (!workoutExerciseIds.has(id)) {
        return NextResponse.json({ error: 'Invalid exercise ID' }, { status: 400 });
      }
    }

    // Update sort order for each exercise
    await prisma.$transaction(
      exerciseIds.map((exerciseId, index) =>
        prisma.exercise.update({
          where: { id: exerciseId },
          data: { sortOrder: index }
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering exercises:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
