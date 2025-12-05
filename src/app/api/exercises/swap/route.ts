import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { exerciseId, newExerciseLibraryId } = body;

    if (!exerciseId || !newExerciseLibraryId) {
      return NextResponse.json(
        { error: 'exerciseId and newExerciseLibraryId are required' },
        { status: 400 }
      );
    }

    // Verify the exercise belongs to a program owned by the user
    const exercise = await prisma.exercise.findFirst({
      where: {
        id: exerciseId,
        workout: {
          workoutPlan: {
            program: {
              createdBy: session.user.id,
            },
          },
        },
      },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercise not found or unauthorized' },
        { status: 404 }
      );
    }

    // Get the new exercise from library
    const newExercise = await prisma.exerciseLibrary.findUnique({
      where: { id: newExerciseLibraryId },
    });

    if (!newExercise) {
      return NextResponse.json(
        { error: 'New exercise not found in library' },
        { status: 404 }
      );
    }

    // Update the exercise with the new library reference and name
    const updatedExercise = await prisma.exercise.update({
      where: { id: exerciseId },
      data: {
        name: newExercise.name,
        exerciseLibraryId: newExercise.id,
        // Keep the same sets, reps, restPeriod from original
      },
      include: {
        exerciseLibrary: {
          select: {
            id: true,
            name: true,
            description: true,
            instructions: true,
            equipment: true,
            difficulty: true,
            movementPattern: true,
            targetMuscles: true,
            videoUrl: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      exercise: {
        id: updatedExercise.id,
        name: updatedExercise.name,
        sets: updatedExercise.sets,
        reps: updatedExercise.reps,
        restPeriod: updatedExercise.restPeriod,
        library: updatedExercise.exerciseLibrary,
      },
    });
  } catch (error) {
    console.error('Error swapping exercise:', error);
    return NextResponse.json(
      { error: 'Failed to swap exercise' },
      { status: 500 }
    );
  }
}
