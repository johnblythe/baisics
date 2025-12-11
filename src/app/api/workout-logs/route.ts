import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Exercise } from '@prisma/client';
import { auth } from '@/auth';
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'User not authenticated' });
    }
    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' });
    }
    const body = await request.json();
    const { workoutId } = body;

    // Get the workout to verify it exists and get its program
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
      include: {
        exercises: { orderBy: { sortOrder: 'asc' } },
        workoutPlan: {
          include: {
            program: true
          }
        }
      }
    });

    if (!workout || !workout.workoutPlan?.program) {
      return new NextResponse('Workout or program not found', { status: 404 });
    }

    // Create the workout log
    const workoutLog = await prisma.workoutLog.create({
      data: {
        userId,
        workoutId,
        programId: workout.workoutPlan.program.id,
        status: 'in_progress',
      },
      include: {
        workout: {
          include: {
            exercises: { orderBy: { sortOrder: 'asc' } }
          }
        }
      }
    });

    // Create exercise logs for each exercise
    const exerciseLogs = await Promise.all(
      workout.exercises.map((exercise: Exercise) =>
        prisma.exerciseLog.create({
          data: {
            workoutLogId: workoutLog.id,
            exerciseId: exercise.id,
          }
        })
      )
    );

    return NextResponse.json({ ...workoutLog, exerciseLogs });
  } catch (error) {
    console.error('Error creating workout log:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 