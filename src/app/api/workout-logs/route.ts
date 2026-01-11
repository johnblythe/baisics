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
    const { workoutId, date } = body;

    // Validate date if provided - must not be in the future
    let logDate: Date | undefined;
    if (date) {
      logDate = new Date(date);
      const now = new Date();
      // Set to end of today to allow logging for today
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      if (logDate > endOfToday) {
        return NextResponse.json({ error: 'Cannot log workouts for future dates' }, { status: 400 });
      }
    }

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
        ...(logDate && { startedAt: logDate }),
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