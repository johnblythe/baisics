import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(
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

    // Verify user owns this workout
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
      include: {
        workoutPlan: {
          include: {
            program: true
          }
        },
        exercises: {
          orderBy: { sortOrder: 'desc' },
          take: 1
        }
      }
    });

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    if (workout.workoutPlan.program?.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get the next sort order
    const nextSortOrder = (workout.exercises[0]?.sortOrder ?? -1) + 1;

    // If exerciseLibraryId provided, use it. Otherwise create custom exercise
    let exerciseLibraryId = body.exerciseLibraryId;

    if (!exerciseLibraryId && body.name) {
      // Check if exercise with this name exists in library
      let libraryExercise = await prisma.exerciseLibrary.findFirst({
        where: { name: { equals: body.name, mode: 'insensitive' } }
      });

      // If not, create a new library entry
      if (!libraryExercise) {
        libraryExercise = await prisma.exerciseLibrary.create({
          data: {
            name: body.name,
            category: body.category || 'Custom',
            difficulty: 'OTHER',
            movementPattern: 'OTHER',
            isCompound: false,
            equipment: body.equipment || [],
            targetMuscles: body.targetMuscles || [],
            secondaryMuscles: [],
            instructions: [],
            commonMistakes: [],
            benefits: [],
            images: []
          }
        });
      }

      exerciseLibraryId = libraryExercise.id;
    }

    if (!exerciseLibraryId) {
      return NextResponse.json({ error: 'Exercise name or library ID required' }, { status: 400 });
    }

    // Create the exercise
    const exercise = await prisma.exercise.create({
      data: {
        workoutId,
        exerciseLibraryId,
        name: body.name,
        sets: body.sets || 3,
        reps: body.reps || 10,
        restPeriod: body.restPeriod || 60,
        sortOrder: nextSortOrder,
        notes: body.notes || null,
        measureType: body.measureType || 'REPS',
        measureValue: body.measureValue || null,
        measureUnit: body.measureUnit || null
      },
      include: {
        exerciseLibrary: true
      }
    });

    return NextResponse.json(exercise);
  } catch (error) {
    console.error('Error adding exercise:', error);
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

    const { id: workoutId } = await context.params;

    // Verify user owns this workout
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
      include: {
        workoutPlan: {
          include: {
            program: true
          }
        },
        exercises: {
          include: {
            exerciseLibrary: true
          },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    if (workout.workoutPlan.program?.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(workout.exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
