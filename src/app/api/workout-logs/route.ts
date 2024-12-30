import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Exercise } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const userId = process.env.TEST_USER_ID;
    if (!userId) {
      throw new Error('TEST_USER_ID environment variable is required');
    }

    const body = await request.json();
    const { workoutId } = body;

    // Get the workout to verify it exists and get its program
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
      include: {
        exercises: true,
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
            exercises: true
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